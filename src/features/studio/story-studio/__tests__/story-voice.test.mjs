import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_CHARACTER_VOICE_PROFILES,
  PREFERRED_CHARACTER_VOICE_NAMES,
  createMockSpeechSynthesis,
  createStoryVoicePlayer,
  getAvailableVoices,
  getDialogueUtteranceParams,
  isSpeechSynthesisSupported,
  resolveCharacterVoice,
  subscribeVoicesChanged,
} from "../engine/storyVoiceEngine.js";
import {
  STORY_ACTIONS,
  createStoryState,
  redoStory,
  selectCharacterVoices,
  selectStory,
  setCharacterVoice,
  storyReducer,
  undoStory,
} from "../engine/storyReducer.js";
import {
  createDefaultScene,
  createDialogueLine,
  createStoryDocument,
} from "../engine/storySchema.js";
import {
  advanceReader,
  canAdvance,
  chooseBranch,
  createReaderState,
  getCurrentDialogue,
  getCurrentScene,
  isWaitingForChoice,
} from "../engine/storyReaderEngine.js";
import { validateStoryDocument } from "../engine/storyValidation.js";

// Helper to mock browser environment
function setupMockBrowser() {
  const { speechSynthesis, SpeechSynthesisUtterance } = createMockSpeechSynthesis({
    voices: [
      {
        voiceURI: "en-US-Standard-C",
        name: "Google US English Female",
        lang: "en-US",
        default: true,
      },
      {
        voiceURI: "en-US-Standard-D",
        name: "Google US English Male",
        lang: "en-US",
        default: false,
      },
      {
        voiceURI: "en-GB-Standard-A",
        name: "British English Female",
        lang: "en-GB",
        default: false,
      },
      {
        voiceURI: "en-GB-Standard-B",
        name: "British English Male",
        lang: "en-GB",
        default: false,
      },
    ],
  });

  const fakeWindow = {
    speechSynthesis,
    SpeechSynthesisUtterance,
  };

  globalThis.window = fakeWindow;
  global.window = fakeWindow;

  return {
    mockSynth: speechSynthesis,
    cleanup() {
      delete globalThis.window;
      delete global.window;
    },
  };
}

/* ==========================================================================
   1. WEB SPEECH API DETECTION & FALLBACK
   ========================================================================== */
test("isSpeechSynthesisSupported returns false in headless Node without window", () => {
  const prevWindow = globalThis.window;
  delete globalThis.window;

  assert.equal(isSpeechSynthesisSupported(), false);
  assert.deepEqual(getAvailableVoices(), []);

  const unsubscribe = subscribeVoicesChanged(() => {});
  assert.equal(typeof unsubscribe, "function");
  unsubscribe();

  if (prevWindow) globalThis.window = prevWindow;
});

test("isSpeechSynthesisSupported returns true when window.speechSynthesis is mocked", () => {
  const { cleanup } = setupMockBrowser();
  try {
    assert.equal(isSpeechSynthesisSupported(), true);
    const voices = getAvailableVoices();
    assert.equal(voices.length, 4);
    assert.equal(voices[0].name, "Google US English Female");
  } finally {
    cleanup();
  }
});

/* ==========================================================================
   2. DEFAULT CHARACTER VOICE PROFILES
   ========================================================================== */
test("DEFAULT_CHARACTER_VOICE_PROFILES has curated profiles for all standard characters", () => {
  const characters = ["maya", "tariq", "elder-samira", "dr-leo", "pip", "narrator"];

  characters.forEach((charId) => {
    const profile = DEFAULT_CHARACTER_VOICE_PROFILES[charId];
    assert.ok(profile, `Profile for ${charId} should exist`);
    assert.equal(typeof profile.name, "string");
    assert.equal(typeof profile.pitch, "number");
    assert.equal(typeof profile.rate, "number");
    assert.ok(profile.pitch >= 0.5 && profile.pitch <= 2.0);
    assert.ok(profile.rate >= 0.5 && profile.rate <= 2.0);
    assert.ok(profile.sampleText.length > 10);
  });

  assert.ok(Object.isFrozen(DEFAULT_CHARACTER_VOICE_PROFILES));
});

/* ==========================================================================
   3. VOICE RESOLUTION
   ========================================================================== */
test("resolveCharacterVoice resolves default profile when no custom voice is set", () => {
  const resolved = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {},
    availableVoices: [],
  });

  assert.equal(resolved.characterId, "maya");
  assert.equal(resolved.voiceName, "Maya");
  assert.equal(resolved.pitch, 1.2);
  assert.equal(resolved.rate, 1.05);
  assert.equal(resolved.voice, null);
});

test("resolveCharacterVoice matches custom voiceURI from available voices", () => {
  const mockVoices = [
    { voiceURI: "uri_maya", name: "Voice Maya", lang: "en-US" },
    { voiceURI: "uri_tariq", name: "Voice Tariq", lang: "en-US" },
  ];

  const resolved = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {
      maya: { voiceURI: "uri_maya", pitch: 1.3, rate: 1.1 },
    },
    availableVoices: mockVoices,
  });

  assert.equal(resolved.voiceURI, "uri_maya");
  assert.equal(resolved.voice?.name, "Voice Maya");
  assert.equal(resolved.pitch, 1.3);
  assert.equal(resolved.rate, 1.1);
});

test("resolveCharacterVoice falls back gracefully if voiceURI is not found in system", () => {
  const mockVoices = [
    { voiceURI: "uri_fallback", name: "Fallback Voice", lang: "en-US" },
  ];

  const resolved = resolveCharacterVoice({
    characterId: "pip",
    characterVoices: {
      pip: { voiceURI: "missing_voice_id" },
    },
    availableVoices: mockVoices,
  });

  // Falls back to available voice instead of crashing
  assert.ok(resolved.voice);
  assert.equal(resolved.voice.voiceURI, "uri_fallback");
  assert.equal(resolved.pitch, DEFAULT_CHARACTER_VOICE_PROFILES.pip.pitch);
});

/* ==========================================================================
   4. MODULATION: SPEECH VS SHOUT VS THOUGHT
   ========================================================================== */
test("getDialogueUtteranceParams modulates shout and thought lines correctly", () => {
  const baseLine = { text: "Hello explorer!", type: "speech" };
  const shoutLine = { text: "Look out!", type: "shout" };
  const thoughtLine = { text: "Hmm, what could that be?", type: "thought" };

  const speechParams = getDialogueUtteranceParams({
    line: baseLine,
    characterId: "maya",
  });
  const shoutParams = getDialogueUtteranceParams({
    line: shoutLine,
    characterId: "maya",
  });
  const thoughtParams = getDialogueUtteranceParams({
    line: thoughtLine,
    characterId: "maya",
  });

  // Maya base pitch is 1.2, rate is 1.05
  assert.equal(speechParams.pitch, 1.2);
  assert.equal(speechParams.rate, 1.05);
  assert.equal(speechParams.volume, 1.0);

  // Shout: higher pitch (+15%), slightly faster rate (+5%), full volume
  assert.ok(shoutParams.pitch > speechParams.pitch);
  assert.ok(shoutParams.rate >= speechParams.rate);
  assert.equal(shoutParams.volume, 1.0);
  assert.equal(shoutParams.type, "shout");

  // Thought: softer pitch (-5%), thoughtful slower rate (-5%), lower volume (0.75)
  assert.ok(thoughtParams.pitch < speechParams.pitch);
  assert.ok(thoughtParams.rate <= speechParams.rate);
  assert.equal(thoughtParams.volume, 0.75);
  assert.equal(thoughtParams.type, "thought");
});

/* ==========================================================================
   5. VOICE PLAYER CONTROLLER & OVERLAPPING PREVENTION
   ========================================================================== */
test("createStoryVoicePlayer cancels in-flight speech before starting new utterance", () => {
  const { mockSynth, cleanup } = setupMockBrowser();
  try {
    const player = createStoryVoicePlayer({
      getVoices: () => mockSynth.getVoices(),
    });

    // Speak first line
    let firstEnded = false;
    player.speak({
      text: "First spoken dialogue line",
      speakerId: "maya",
      onEnd: () => {
        firstEnded = true;
      },
    });

    assert.equal(player.isSpeaking, true);
    assert.equal(player.currentSpeakingInfo.text, "First spoken dialogue line");
    assert.equal(mockSynth.getHistory().length, 1);

    // Speak second line immediately
    player.speak({
      text: "Second spoken dialogue line",
      speakerId: "tariq",
    });

    // The first utterance was canceled, second utterance is now speaking
    assert.equal(player.isSpeaking, true);
    assert.equal(player.currentSpeakingInfo.text, "Second spoken dialogue line");
    assert.equal(player.currentSpeakingInfo.speakerId, "tariq");
    assert.equal(mockSynth.getHistory().length, 2);

    player.stop();
    assert.equal(player.isSpeaking, false);
    assert.equal(player.currentSpeakingInfo, null);
  } finally {
    cleanup();
  }
});

test("createStoryVoicePlayer pause, resume, and mute controls", () => {
  const { mockSynth, cleanup } = setupMockBrowser();
  try {
    const player = createStoryVoicePlayer({
      getVoices: () => mockSynth.getVoices(),
    });

    player.speak({
      text: "Testing pause and resume",
      speakerId: "narrator",
    });

    assert.equal(player.isSpeaking, true);
    assert.equal(player.isPaused, false);

    player.pause();
    assert.equal(player.isPaused, true);
    assert.equal(mockSynth.paused, true);

    player.resume();
    assert.equal(player.isPaused, false);
    assert.equal(mockSynth.paused, false);

    // Mute cancels speech and prevents speaking
    player.setMuted(true);
    assert.equal(player.isMuted, true);
    assert.equal(player.isSpeaking, false);

    let skippedReason = null;
    player.speak({
      text: "Should not speak while muted",
      speakerId: "maya",
      onEnd: (info) => {
        skippedReason = info?.reason;
      },
    });

    assert.equal(player.isSpeaking, false);
    assert.equal(skippedReason, "muted");

    player.setMuted(false);
    assert.equal(player.isMuted, false);
  } finally {
    cleanup();
  }
});

test("createStoryVoicePlayer preview speaks sample text for the character", () => {
  const { mockSynth, cleanup } = setupMockBrowser();
  try {
    const player = createStoryVoicePlayer({
      getVoices: () => mockSynth.getVoices(),
    });

    player.preview({
      characterId: "dr-leo",
    });

    assert.equal(player.isSpeaking, true);
    assert.equal(player.currentSpeakingInfo.speakerId, "dr-leo");
    assert.equal(
      player.currentSpeakingInfo.text,
      DEFAULT_CHARACTER_VOICE_PROFILES["dr-leo"].sampleText
    );

    player.stop();
  } finally {
    cleanup();
  }
});

/* ==========================================================================
   6. REDUCER PERSISTENCE & DOCUMENT VALIDATION
   ========================================================================== */
test("storyReducer persists SET_CHARACTER_VOICE in doc.settings.characterVoices", () => {
  const initialStory = createStoryDocument({ title: "Voice Settings Story" });
  let state = createStoryState(initialStory);

  assert.deepEqual(selectCharacterVoices(state), {});

  // Set Maya's voice
  state = storyReducer(
    state,
    setCharacterVoice("maya", {
      voiceURI: "Google US English Female",
      voiceName: "Google US English Female",
      pitch: 1.25,
      rate: 1.1,
    })
  );

  const voices = selectCharacterVoices(state);
  assert.ok(voices.maya);
  assert.equal(voices.maya.voiceURI, "Google US English Female");
  assert.equal(voices.maya.pitch, 1.25);
  assert.equal(voices.maya.rate, 1.1);

  // Set Tariq's voice
  state = storyReducer(
    state,
    setCharacterVoice("tariq", {
      voiceURI: "Google US English Male",
      voiceName: "Google US English Male",
    })
  );

  const voicesUpdated = selectCharacterVoices(state);
  assert.ok(voicesUpdated.maya);
  assert.ok(voicesUpdated.tariq);
  assert.equal(voicesUpdated.tariq.voiceURI, "Google US English Male");

  // Document validation passes with characterVoices
  const doc = selectStory(state);
  const validation = validateStoryDocument(doc);
  assert.equal(validation.ok, true);
  assert.equal(validation.errors.length, 0);

  // Undo restores previous state
  state = storyReducer(state, undoStory());
  assert.equal(selectCharacterVoices(state).tariq, undefined);
  assert.ok(selectCharacterVoices(state).maya);

  // Redo reapplies change
  state = storyReducer(state, redoStory());
  assert.ok(selectCharacterVoices(state).tariq);
});

/* ==========================================================================
   7. STORY READER INTEGRATION & SEQUENTIAL PLAYBACK
   ========================================================================== */
test("Story Reader state progression with dialogue, choices, and multiple scenes", () => {
  const scene1 = createDefaultScene({
    id: "s1",
    name: "Scene 1",
    narration: "A peaceful morning in the square.",
    dialogue: [
      createDialogueLine({
        id: "d1",
        speakerId: "maya",
        text: "Good morning Tariq!",
        type: "speech",
      }),
      createDialogueLine({
        id: "d2",
        speakerId: "tariq",
        text: "I wonder where the bucket is...",
        type: "thought",
      }),
      createDialogueLine({
        id: "d3",
        speakerId: "maya",
        text: "Let's find it!",
        type: "shout",
      }),
    ],
  });

  const scene2 = createDefaultScene({
    id: "s2",
    name: "Scene 2",
    narration: "At the well.",
    dialogue: [
      createDialogueLine({
        id: "d4",
        speakerId: "pip",
        text: "Meow!",
        type: "speech",
      }),
    ],
    isEnding: true,
  });

  const story = createStoryDocument({
    title: "Reader Voice Test",
    scenes: [scene1, scene2],
  });

  let reader = createReaderState(story);

  // Step 1: line 0 (Maya speech)
  assert.equal(reader.sceneIndex, 0);
  assert.equal(reader.dialogueIndex, 0);
  let dialogue = getCurrentDialogue(reader);
  assert.equal(dialogue.id, "d1");
  assert.equal(dialogue.type, "speech");

  // Advance to line 1 (Tariq thought line)
  reader = advanceReader(reader);
  assert.equal(reader.dialogueIndex, 1);
  dialogue = getCurrentDialogue(reader);
  assert.equal(dialogue.id, "d2");
  assert.equal(dialogue.type, "thought");

  // Advance to line 2 (Maya shout line)
  reader = advanceReader(reader);
  assert.equal(reader.dialogueIndex, 2);
  dialogue = getCurrentDialogue(reader);
  assert.equal(dialogue.id, "d3");
  assert.equal(dialogue.type, "shout");

  // Advance to next scene (scene 2)
  reader = advanceReader(reader);
  assert.equal(reader.sceneIndex, 1);
  assert.equal(reader.dialogueIndex, 0);
  dialogue = getCurrentDialogue(reader);
  assert.equal(dialogue.id, "d4");

  // Advance past final dialogue of ending scene -> The End screen
  reader = advanceReader(reader);
  assert.equal(reader.isEnd, true);
});

test("Story Reader pauses auto-advance on branching choice scenes", () => {
  const branchScene = createDefaultScene({
    id: "s_branch",
    name: "The Crossroad",
    dialogue: [
      createDialogueLine({
        id: "d1",
        speakerId: "maya",
        text: "Which path should we explore?",
      }),
    ],
    choices: [
      { id: "c1", text: "Take the orchard path", targetSceneId: "s_orchard" },
      { id: "c2", text: "Take the river path", targetSceneId: "s_river" },
    ],
  });

  const orchardScene = createDefaultScene({
    id: "s_orchard",
    name: "Golden Orchard",
    isEnding: true,
  });
  const riverScene = createDefaultScene({
    id: "s_river",
    name: "River Bank",
    isEnding: true,
  });

  const story = createStoryDocument({
    title: "Branching Voice Test",
    scenes: [branchScene, orchardScene, riverScene],
  });

  let reader = createReaderState(story);
  assert.equal(reader.sceneIndex, 0);

  // At the dialogue line of a scene with choices
  assert.equal(isWaitingForChoice(reader), true);
  assert.equal(canAdvance(reader), false);

  // Calling advanceReader does not advance while waiting for choice
  const sameReader = advanceReader(reader);
  assert.equal(sameReader.sceneIndex, 0);
  assert.equal(sameReader.isEnd, false);

  // When player chooses branch c1
  reader = chooseBranch(reader, "c1");
  assert.equal(reader.sceneIndex, 1);
  assert.equal(getCurrentScene(reader).name, "Golden Orchard");
});

/* ==========================================================================
   5. GOOGLE UK ENGLISH VOICE PREFERRED DEFAULTS (S1.12.2)
   ========================================================================== */
test("PREFERRED_CHARACTER_VOICE_NAMES defines exact Google UK English defaults", () => {
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES.maya, "Google UK English Female");
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES["elder-samira"], "Google UK English Female");
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES.tariq, "Google UK English Male");
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES["dr-leo"], "Google UK English Male");
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES.pip, "Google UK English Female");
  assert.equal(PREFERRED_CHARACTER_VOICE_NAMES.narrator, "Google UK English Female");
  assert.ok(Object.isFrozen(PREFERRED_CHARACTER_VOICE_NAMES));
});

test("resolveCharacterVoice selects Google UK English voices as preferred defaults when present", () => {
  const googleVoices = [
    {
      voiceURI: "google-uk-female-uri",
      name: "Google UK English Female",
      lang: "en-GB",
      default: false,
    },
    {
      voiceURI: "google-uk-male-uri",
      name: "Google UK English Male",
      lang: "en-GB",
      default: false,
    },
    {
      voiceURI: "generic-en-uri",
      name: "Generic English",
      lang: "en-US",
      default: true,
    },
  ];

  // Maya -> Google UK English Female
  const mayaVoice = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(mayaVoice.voiceURI, "google-uk-female-uri");
  assert.equal(mayaVoice.voiceName, "Google UK English Female");

  // Tariq -> Google UK English Male
  const tariqVoice = resolveCharacterVoice({
    characterId: "tariq",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(tariqVoice.voiceURI, "google-uk-male-uri");
  assert.equal(tariqVoice.voiceName, "Google UK English Male");

  // Elder Samira -> Google UK English Female
  const samiraVoice = resolveCharacterVoice({
    characterId: "elder-samira",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(samiraVoice.voiceURI, "google-uk-female-uri");
  assert.equal(samiraVoice.voiceName, "Google UK English Female");

  // Dr. Leo -> Google UK English Male
  const leoVoice = resolveCharacterVoice({
    characterId: "dr-leo",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(leoVoice.voiceURI, "google-uk-male-uri");
  assert.equal(leoVoice.voiceName, "Google UK English Male");

  // Pip -> Google UK English Female
  const pipVoice = resolveCharacterVoice({
    characterId: "pip",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(pipVoice.voiceURI, "google-uk-female-uri");
  assert.equal(pipVoice.voiceName, "Google UK English Female");

  // Narrator -> Google UK English Female
  const narratorVoice = resolveCharacterVoice({
    characterId: "narrator",
    characterVoices: {},
    availableVoices: googleVoices,
  });
  assert.equal(narratorVoice.voiceURI, "google-uk-female-uri");
  assert.equal(narratorVoice.voiceName, "Google UK English Female");
});

test("resolveCharacterVoice preserves explicitly chosen user voice and does NOT override with Google default", () => {
  const googleVoices = [
    {
      voiceURI: "google-uk-male-uri",
      name: "Google UK English Male",
      lang: "en-GB",
    },
    {
      voiceURI: "custom-user-choice-uri",
      name: "Custom User Voice",
      lang: "en-US",
    },
  ];

  // Tariq has an explicitly saved custom selection in doc.settings.characterVoices
  const customVoice = resolveCharacterVoice({
    characterId: "tariq",
    characterVoices: {
      tariq: { voiceURI: "custom-user-choice-uri", voiceName: "Custom User Voice" },
    },
    availableVoices: googleVoices,
  });

  assert.equal(customVoice.voiceURI, "custom-user-choice-uri");
  assert.equal(customVoice.voiceName, "Custom User Voice");
});

test("resolveCharacterVoice falls back to available English voices when Google voices are missing", () => {
  const nonGoogleVoices = [
    { voiceURI: "samantha-uri", name: "Samantha", lang: "en-US", default: true },
    { voiceURI: "alex-uri", name: "Alex", lang: "en-US", default: false },
  ];

  const resolved = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {},
    availableVoices: nonGoogleVoices,
  });

  assert.ok(resolved.voice);
  assert.ok(
    resolved.voiceURI === "samantha-uri" || resolved.voiceURI === "alex-uri",
    "Should safely resolve to available English voice"
  );
});

test("dynamic voice loading (voiceschanged) activates Google defaults after async load", () => {
  let currentVoices = [];
  const getDynamicVoices = () => currentVoices;

  // Initially before voiceschanged: empty list -> default character profile name
  let mayaVoice = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {},
    availableVoices: getDynamicVoices(),
  });
  assert.equal(mayaVoice.voice, null);
  assert.equal(mayaVoice.voiceName, "Maya");

  // Asynchronous voices load (simulating Chrome's onvoiceschanged event)
  currentVoices = [
    {
      voiceURI: "google-uk-female-uri",
      name: "Google UK English Female",
      lang: "en-GB",
    },
  ];

  // After voiceschanged fires, resolveCharacterVoice immediately picks up Google default
  mayaVoice = resolveCharacterVoice({
    characterId: "maya",
    characterVoices: {},
    availableVoices: getDynamicVoices(),
  });
  assert.equal(mayaVoice.voiceURI, "google-uk-female-uri");
  assert.equal(mayaVoice.voiceName, "Google UK English Female");
});
