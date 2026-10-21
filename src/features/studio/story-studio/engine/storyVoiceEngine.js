/**
 * Story Studio Voice & Spoken Dialogue Engine (S1.12).
 *
 * Provides:
 * - Browser Web Speech API detection and graceful fallback
 * - Curated default character voice profiles and pitch/rate modulation
 * - Emphatic shout modulation and soft thought-bubble treatment
 * - Dynamic resolution of system voices with cross-platform tolerance
 * - Single-utterance playback controller with overlapping prevention
 * - Sequential Story Reader narration orchestration
 * - Test mock factory for headless and automated environments
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { STORY_CHARACTERS } from "./storySchema.js";

/**
 * Curated character voice personality profiles.
 * Pitch range: 0.5 to 2.0 (1.0 default)
 * Rate range: 0.5 to 2.0 (1.0 default)
 */
export const DEFAULT_CHARACTER_VOICE_PROFILES = Object.freeze({
  maya: {
    characterId: "maya",
    name: "Maya",
    role: "Curious Explorer",
    genderHint: "female",
    pitch: 1.2,
    rate: 1.05,
    sampleText: "Hello! I'm Maya, and I love discovering new places in our village!",
  },
  tariq: {
    characterId: "tariq",
    name: "Tariq",
    role: "Young Farmer",
    genderHint: "male",
    pitch: 1.0,
    rate: 1.0,
    sampleText: "Hi there! I'm Tariq. The farm crops are growing wonderfully today.",
  },
  "elder-samira": {
    characterId: "elder-samira",
    name: "Elder Samira",
    role: "Village Elder & Historian",
    genderHint: "female",
    pitch: 0.85,
    rate: 0.92,
    sampleText: "Greetings, traveler. I remember when our ancestors first built these stone walls.",
  },
  "dr-leo": {
    characterId: "dr-leo",
    name: "Dr. Leo",
    role: "Tinkerer & Water Inventor",
    genderHint: "male",
    pitch: 1.05,
    rate: 1.12,
    sampleText: "Aha! Fascinating! With a few adjustments, this water pipe will work brilliantly!",
  },
  pip: {
    characterId: "pip",
    name: "Pip",
    role: "Friendly Village Cat",
    genderHint: "neutral",
    pitch: 1.35,
    rate: 1.15,
    sampleText: "Meow! Purr... What a sunny spot to take a nice cozy nap!",
  },
  narrator: {
    characterId: "narrator",
    name: "Narrator",
    role: "Storyteller",
    genderHint: "neutral",
    pitch: 1.0,
    rate: 0.95,
    sampleText: "Once upon a time in a peaceful village by the river...",
  },
});

/**
 * Preferred default system voices (Google UK English) when present in browser.
 * S1.12.2 requirements:
 * - Maya: Google UK English Female
 * - Elder Samira: Google UK English Female
 * - Tariq: Google UK English Male
 * - Dr. Leo: Google UK English Male
 * - Pip: Google UK English Female
 * - Narrator: Google UK English Female
 */
export const PREFERRED_CHARACTER_VOICE_NAMES = Object.freeze({
  maya: "Google UK English Female",
  "elder-samira": "Google UK English Female",
  tariq: "Google UK English Male",
  "dr-leo": "Google UK English Male",
  pip: "Google UK English Female",
  narrator: "Google UK English Female",
});

/**
 * Check if Web Speech API synthesis is supported in the current environment.
 */
export function isSpeechSynthesisSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Safely get the current list of available browser voices.
 */
export function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Subscribe to the browser's voiceschanged event.
 * Handles both addEventListener and onvoiceschanged property assignment.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeVoicesChanged(callback) {
  if (!isSpeechSynthesisSupported() || typeof callback !== "function") {
    return () => {};
  }

  const synth = window.speechSynthesis;
  let cleanedUp = false;

  const handleVoices = () => {
    if (cleanedUp) return;
    try {
      const voices = synth.getVoices() || [];
      callback(voices);
    } catch {
      callback([]);
    }
  };

  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", handleVoices);
    return () => {
      cleanedUp = true;
      try {
        synth.removeEventListener("voiceschanged", handleVoices);
      } catch {}
    };
  }

  const prevHandler = synth.onvoiceschanged;
  synth.onvoiceschanged = handleVoices;
  return () => {
    cleanedUp = true;
    if (synth.onvoiceschanged === handleVoices) {
      synth.onvoiceschanged = prevHandler || null;
    }
  };
}

/**
 * React hook to access available browser voices with reactive updates on voiceschanged.
 */
export function useSystemVoices() {
  const [isSupported, setIsSupported] = useState(() => isSpeechSynthesisSupported());
  const [voices, setVoices] = useState(() => getAvailableVoices());

  useEffect(() => {
    const supported = isSpeechSynthesisSupported();
    setIsSupported(supported);
    if (!supported) return;

    setVoices(getAvailableVoices());
    const unsub = subscribeVoicesChanged((newVoices) => {
      setVoices(newVoices);
    });
    return unsub;
  }, []);

  const result = { voices, isSupported };
  result[Symbol.iterator] = function* () {
    yield voices;
    yield isSupported;
  };
  return result;
}

/**
 * Resolves the best matching browser SpeechSynthesisVoice for a given character.
 * Uses author-configured voiceURI or voiceName if available, with intelligent fallback
 * prioritizing preferred Google UK English defaults when available, followed by
 * available English voices and browser defaults.
 */
export function resolveCharacterVoice({
  characterId = "narrator",
  characterVoices = {},
  availableVoices = [],
}) {
  const profile =
    DEFAULT_CHARACTER_VOICE_PROFILES[characterId] ||
    DEFAULT_CHARACTER_VOICE_PROFILES.narrator;
  const config = characterVoices[characterId] || {};

  const targetUri = config.voiceURI || null;
  const targetName = config.voiceName || null;
  const targetPitch = typeof config.pitch === "number" ? config.pitch : profile.pitch;
  const targetRate = typeof config.rate === "number" ? config.rate : profile.rate;

  const voiceList = Array.isArray(availableVoices)
    ? availableVoices
    : Array.isArray(availableVoices?.voices)
    ? availableVoices.voices
    : [];

  if (voiceList.length === 0) {
    return {
      characterId: profile.characterId || characterId,
      voice: null,
      voiceURI: targetUri || "",
      voiceName: targetName || profile.name,
      pitch: targetPitch,
      rate: targetRate,
      role: profile.role,
    };
  }

  // 1. Direct match by voiceURI (explicit author selection)
  if (targetUri) {
    const matchedByUri = voiceList.find((v) => v.voiceURI === targetUri);
    if (matchedByUri) {
      return {
        characterId: profile.characterId || characterId,
        voice: matchedByUri,
        voiceURI: matchedByUri.voiceURI,
        voiceName: matchedByUri.name,
        pitch: targetPitch,
        rate: targetRate,
        role: profile.role,
      };
    }
  }

  // 2. Match by exact or case-insensitive name (explicit author selection)
  if (targetName) {
    const matchedByName = voiceList.find(
      (v) => v.name && v.name.toLowerCase() === targetName.toLowerCase()
    );
    if (matchedByName) {
      return {
        characterId: profile.characterId || characterId,
        voice: matchedByName,
        voiceURI: matchedByName.voiceURI,
        voiceName: matchedByName.name,
        pitch: targetPitch,
        rate: targetRate,
        role: profile.role,
      };
    }
  }

  // 3. Preferred Google UK English voice defaults (when no custom selection exists)
  const preferredName = PREFERRED_CHARACTER_VOICE_NAMES[characterId];
  if (!targetUri && !targetName && preferredName) {
    const matchedGoogle = voiceList.find(
      (v) => v.name && v.name.toLowerCase() === preferredName.toLowerCase()
    );
    if (matchedGoogle) {
      return {
        characterId: profile.characterId || characterId,
        voice: matchedGoogle,
        voiceURI: matchedGoogle.voiceURI,
        voiceName: matchedGoogle.name,
        pitch: targetPitch,
        rate: targetRate,
        role: profile.role,
      };
    }
  }

  // 4. Match by preferred language (English or browser locale)
  const langVoices = voiceList.filter(
    (v) => v.lang && (v.lang.startsWith("en") || v.lang.startsWith("en-"))
  );
  const candidatePool = langVoices.length > 0 ? langVoices : voiceList;

  // 5. Spread characters across distinct candidate voices if available
  const charKeys = ["maya", "tariq", "elder-samira", "dr-leo", "pip", "narrator"];
  const charIndex = Math.max(0, charKeys.indexOf(characterId));
  const fallbackVoice =
    candidatePool[charIndex % candidatePool.length] ||
    candidatePool.find((v) => v.default) ||
    candidatePool[0] ||
    null;

  return {
    characterId: profile.characterId || characterId,
    voice: fallbackVoice,
    voiceURI: fallbackVoice?.voiceURI || targetUri || "",
    voiceName: fallbackVoice?.name || targetName || profile.name,
    pitch: targetPitch,
    rate: targetRate,
    role: profile.role,
  };
}

/**
 * Calculates modulated utterance parameters for a dialogue line.
 * - Shout lines: higher pitch (+15%), slightly punchier rate (+5%), full volume
 * - Thought lines: softer pitch (-5%), thoughtful rate (-5%), lower volume (75%)
 * - Speech lines: normal character voice parameters
 */
export function getDialogueUtteranceParams({
  line,
  characterId,
  characterVoices = {},
  availableVoices = [],
}) {
  const speaker = characterId || line?.speakerId || "narrator";
  const resolved = resolveCharacterVoice({
    characterId: speaker,
    characterVoices,
    availableVoices,
  });

  const type = line?.type || "speech";
  let pitch = resolved.pitch;
  let rate = resolved.rate;
  let volume = 1.0;

  if (type === "shout") {
    pitch = Math.min(2.0, Math.max(0.5, resolved.pitch * 1.15));
    rate = Math.min(1.5, Math.max(0.5, resolved.rate * 1.05));
    volume = 1.0;
  } else if (type === "thought") {
    pitch = Math.min(2.0, Math.max(0.5, resolved.pitch * 0.95));
    rate = Math.min(1.5, Math.max(0.5, resolved.rate * 0.95));
    volume = 0.75;
  }

  return {
    voice: resolved.voice,
    voiceURI: resolved.voiceURI,
    pitch: Number(pitch.toFixed(2)),
    rate: Number(rate.toFixed(2)),
    volume,
    type,
    speakerId: speaker,
  };
}

/**
 * Creates an instance of a Story Voice Player.
 * Manages utterance creation, overlapping prevention, pause/resume, and lifecycle cleanup.
 */
export function createStoryVoicePlayer({
  getVoices = getAvailableVoices,
  onStateChange,
} = {}) {
  let isMuted = false;
  let activeUtterance = null;
  let currentSpeakingInfo = null; // { lineId, speakerId, text }
  let isSpeaking = false;
  let isPaused = false;

  const notify = () => {
    if (typeof onStateChange === "function") {
      onStateChange({
        isSpeaking,
        isPaused,
        isMuted,
        currentSpeakingInfo,
      });
    }
  };

  const cancel = () => {
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtterance = null;
    currentSpeakingInfo = null;
    isSpeaking = false;
    isPaused = false;
    notify();
  };

  const pause = () => {
    if (!isSpeechSynthesisSupported() || !isSpeaking || isPaused) return false;
    try {
      window.speechSynthesis.pause();
      isPaused = true;
      notify();
      return true;
    } catch {
      return false;
    }
  };

  const resume = () => {
    if (!isSpeechSynthesisSupported() || !isSpeaking || !isPaused) return false;
    try {
      window.speechSynthesis.resume();
      isPaused = false;
      notify();
      return true;
    } catch {
      return false;
    }
  };

  const setMuted = (muted) => {
    isMuted = Boolean(muted);
    if (isMuted && isSpeaking) {
      cancel();
    }
    notify();
  };

  /**
   * Speak a dialogue line or narration text.
   * Cancels any in-flight utterance first to prevent audio overlaps.
   */
  const speak = ({
    text,
    line = null,
    speakerId = "narrator",
    characterVoices = {},
    onStart,
    onEnd,
    onError,
  }) => {
    // 1. Cancel previous utterance immediately
    cancel();

    const spokenText = String(text || line?.text || "").trim();
    if (!spokenText || isMuted || !isSpeechSynthesisSupported()) {
      if (typeof onEnd === "function") {
        onEnd({ skipped: true, reason: isMuted ? "muted" : "empty_or_unsupported" });
      }
      return null;
    }

    const available = getVoices();
    const params = getDialogueUtteranceParams({
      line: line || { text: spokenText, type: "speech" },
      characterId: speakerId,
      characterVoices,
      availableVoices: available,
    });

    try {
      const utterance = new window.SpeechSynthesisUtterance(spokenText);
      if (params.voice) {
        utterance.voice = params.voice;
      }
      utterance.pitch = params.pitch;
      utterance.rate = params.rate;
      utterance.volume = params.volume;

      activeUtterance = utterance;
      currentSpeakingInfo = {
        lineId: line?.id || null,
        speakerId: params.speakerId,
        text: spokenText,
        type: params.type,
      };
      isSpeaking = true;
      isPaused = false;
      notify();

      utterance.onstart = (evt) => {
        isSpeaking = true;
        isPaused = false;
        notify();
        if (typeof onStart === "function") onStart(evt);
      };

      utterance.onend = (evt) => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
          currentSpeakingInfo = null;
          isSpeaking = false;
          isPaused = false;
          notify();
        }
        if (typeof onEnd === "function") onEnd(evt);
      };

      utterance.onerror = (evt) => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
          currentSpeakingInfo = null;
          isSpeaking = false;
          isPaused = false;
          notify();
        }
        if (typeof onError === "function") onError(evt);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    } catch (err) {
      cancel();
      if (typeof onError === "function") onError(err);
      return null;
    }
  };

  /**
   * Preview a character's voice using sample dialogue.
   */
  const preview = ({
    characterId = "maya",
    voiceURI,
    pitch,
    rate,
    characterVoices = {},
    onEnd,
  }) => {
    const profile =
      DEFAULT_CHARACTER_VOICE_PROFILES[characterId] ||
      DEFAULT_CHARACTER_VOICE_PROFILES.narrator;
    const sample = profile.sampleText;

    const mergedVoices = {
      ...characterVoices,
      [characterId]: {
        voiceURI: voiceURI !== undefined ? voiceURI : characterVoices[characterId]?.voiceURI,
        pitch: pitch !== undefined ? pitch : characterVoices[characterId]?.pitch,
        rate: rate !== undefined ? rate : characterVoices[characterId]?.rate,
      },
    };

    return speak({
      text: sample,
      speakerId: characterId,
      characterVoices: mergedVoices,
      onEnd,
    });
  };

  const cleanup = () => {
    cancel();
  };

  return {
    speak,
    preview,
    cancel,
    stop: cancel,
    pause,
    resume,
    setMuted,
    get isMuted() {
      return isMuted;
    },
    get isSpeaking() {
      return isSpeaking;
    },
    get isPaused() {
      return isPaused;
    },
    get currentSpeakingInfo() {
      return currentSpeakingInfo;
    },
    cleanup,
  };
}

/**
 * Creates a mock Web Speech API environment for headless testing.
 * Provides full speechSynthesis and SpeechSynthesisUtterance with event dispatching.
 */
export function createMockSpeechSynthesis({ voices = [] } = {}) {
  const defaultMockVoices =
    voices.length > 0
      ? voices
      : [
          {
            voiceURI: "urn:voice:samantha",
            name: "Samantha",
            lang: "en-US",
            default: true,
            localService: true,
          },
          {
            voiceURI: "urn:voice:daniel",
            name: "Daniel",
            lang: "en-GB",
            default: false,
            localService: true,
          },
          {
            voiceURI: "urn:voice:karen",
            name: "Karen",
            lang: "en-AU",
            default: false,
            localService: true,
          },
          {
            voiceURI: "urn:voice:fred",
            name: "Fred",
            lang: "en-US",
            default: false,
            localService: true,
          },
        ];

  class MockSpeechSynthesisUtterance {
    constructor(text = "") {
      this.text = text;
      this.voice = null;
      this.volume = 1.0;
      this.rate = 1.0;
      this.pitch = 1.0;
      this.lang = "en-US";
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onpause = null;
      this.onresume = null;
    }
  }

  const listeners = new Map();
  let speaking = false;
  let paused = false;
  let currentUtterance = null;
  const history = [];

  const mockSynthesis = {
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,

    getVoices: () => [...defaultMockVoices],

    speak: (utterance) => {
      mockSynthesis.cancel();
      mockSynthesis.speaking = true;
      mockSynthesis.paused = false;
      speaking = true;
      paused = false;
      currentUtterance = utterance;
      history.push({
        text: utterance.text,
        voiceURI: utterance.voice?.voiceURI,
        pitch: utterance.pitch,
        rate: utterance.rate,
        volume: utterance.volume,
      });

      if (typeof utterance.onstart === "function") {
        utterance.onstart({ type: "start" });
      }
    },

    cancel: () => {
      if (currentUtterance) {
        const u = currentUtterance;
        currentUtterance = null;
        mockSynthesis.speaking = false;
        mockSynthesis.paused = false;
        speaking = false;
        paused = false;
        if (typeof u.onerror === "function") {
          u.onerror({ type: "error", error: "canceled" });
        }
      }
    },

    pause: () => {
      if (currentUtterance && !paused) {
        paused = true;
        mockSynthesis.paused = true;
        if (typeof currentUtterance.onpause === "function") {
          currentUtterance.onpause({ type: "pause" });
        }
      }
    },

    resume: () => {
      if (currentUtterance && paused) {
        paused = false;
        mockSynthesis.paused = false;
        if (typeof currentUtterance.onresume === "function") {
          currentUtterance.onresume({ type: "resume" });
        }
      }
    },

    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },

    removeEventListener: (type, fn) => {
      if (listeners.has(type)) listeners.get(type).delete(fn);
    },

    triggerVoicesChanged: (newVoices) => {
      if (newVoices) {
        defaultMockVoices.length = 0;
        defaultMockVoices.push(...newVoices);
      }
      if (typeof mockSynthesis.onvoiceschanged === "function") {
        mockSynthesis.onvoiceschanged();
      }
      const set = listeners.get("voiceschanged");
      if (set) {
        set.forEach((fn) => fn());
      }
    },

    // Test inspection helper to simulate utterance completion
    finishCurrentUtterance: () => {
      if (currentUtterance) {
        const u = currentUtterance;
        currentUtterance = null;
        mockSynthesis.speaking = false;
        mockSynthesis.paused = false;
        speaking = false;
        paused = false;
        if (typeof u.onend === "function") {
          u.onend({ type: "end" });
        }
      }
    },

    getHistory: () => [...history],
    clearHistory: () => {
      history.length = 0;
    },
    getCurrentUtterance: () => currentUtterance,
  };

  return {
    speechSynthesis: mockSynthesis,
    SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
    mockVoices: defaultMockVoices,
  };
}
