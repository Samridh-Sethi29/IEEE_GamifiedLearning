import test from "node:test";
import assert from "node:assert/strict";

import {
  createCharacterPlacement,
  createDialogueLine,
  createDefaultScene,
  createStoryDocument,
} from "../engine/storySchema.js";
import {
  buildPrintableStoryModel,
  triggerBrowserPrint,
} from "../engine/storyExport.js";

function createMockStory() {
  const scene1 = createDefaultScene({
    id: "scene_alpha",
    name: "The Grand Library",
    background: "cozy-cottage",
    narration: "A dusty room full of wonders and ancient scrolls.",
    characters: [
      createCharacterPlacement({
        id: "char_inst_1",
        characterId: "dr-leo",
        slot: "left",
        expression: "thoughtful",
        facing: "right",
      }),
      createCharacterPlacement({
        id: "char_inst_2",
        characterId: "maya",
        slot: "right",
        expression: "surprised",
        facing: "left",
      }),
    ],
    props: ["lantern", "ancient-book"],
    dialogue: [
      createDialogueLine({
        id: "dlg_1",
        speakerId: "dr-leo",
        text: "Did you hear that rustling sound, Maya?",
        type: "speech",
      }),
      createDialogueLine({
        id: "dlg_2",
        speakerId: "maya",
        text: "I wonder if it came from the hidden chamber!",
        type: "thought",
      }),
      createDialogueLine({
        id: "dlg_3",
        speakerId: "narrator",
        text: "A strange glow emanated from behind the bookshelf.",
        type: "speech",
      }),
    ],
    choices: [
      {
        id: "choice_1",
        text: "Open the bookshelf door",
        targetSceneId: "scene_beta",
      },
      {
        id: "choice_2",
        text: "Look through the window",
        targetSceneId: "scene_gamma",
      },
    ],
    isEnding: false,
  });

  const scene2 = createDefaultScene({
    id: "scene_beta",
    name: "The Secret Passage",
    background: "school-classroom",
    narration: "Footsteps echoed through the stone corridor.",
    characters: [
      createCharacterPlacement({
        id: "char_inst_3",
        characterId: "maya",
        slot: "center",
        expression: "happy",
        facing: "right",
      }),
    ],
    props: ["magnifying-glass"],
    dialogue: [
      createDialogueLine({
        id: "dlg_4",
        speakerId: "maya",
        text: "We found the ancient treasure room!",
        type: "shout",
      }),
    ],
    choices: [],
    isEnding: true,
  });

  const scene3 = createDefaultScene({
    id: "scene_gamma",
    name: "The Garden View",
    background: "starry-night",
    narration: "Stars glittered quietly above the sleepy village.",
    characters: [],
    props: [],
    dialogue: [],
    choices: [],
    isEnding: true,
  });

  return createStoryDocument({
    id: "story_export_test",
    title: "The Mystery of Alexandria",
    author: "Scholar Sam",
    scenes: [scene1, scene2, scene3],
  });
}

test("buildPrintableStoryModel creates structured, sanitized book model", () => {
  const story = createMockStory();
  const model = buildPrintableStoryModel(story);

  assert.equal(model.id, "story_export_test");
  assert.equal(model.title, "The Mystery of Alexandria");
  assert.equal(model.author, "Scholar Sam");
  assert.equal(model.sceneCount, 3);
  assert.equal(model.totalDialogueCount, 4); // 3 from scene1 + 1 from scene2
  assert.ok(typeof model.formattedDate === "string");
  assert.equal(model.scenes.length, 3);
});

test("buildPrintableStoryModel formats ordered scenes with 1-based numbering and labels", () => {
  const story = createMockStory();
  const model = buildPrintableStoryModel(story);

  const [s1, s2, s3] = model.scenes;

  assert.equal(s1.sceneNumber, 1);
  assert.equal(s1.sceneIndex, 0);
  assert.equal(s1.name, "The Grand Library");
  assert.equal(s1.background, "cozy-cottage");
  assert.equal(s1.backgroundLabel, "Cozy Cottage");
  assert.equal(s1.backgroundTheme, "indoors");
  assert.equal(s1.narration, "A dusty room full of wonders and ancient scrolls.");

  assert.equal(s2.sceneNumber, 2);
  assert.equal(s2.name, "The Secret Passage");
  assert.equal(s2.background, "school-classroom");
  assert.equal(s2.backgroundLabel, "School Classroom");

  assert.equal(s3.sceneNumber, 3);
  assert.equal(s3.name, "The Garden View");
  assert.equal(s3.background, "starry-night");
});

test("buildPrintableStoryModel resolves character metadata and props", () => {
  const story = createMockStory();
  const model = buildPrintableStoryModel(story);
  const s1 = model.scenes[0];

  assert.equal(s1.characters.length, 2);
  assert.equal(s1.characters[0].name, "Dr. Leo");
  assert.equal(s1.characters[0].characterId, "dr-leo");
  assert.equal(s1.characters[0].slot, "left");
  assert.equal(s1.characters[0].expression, "thoughtful");
  assert.equal(s1.characters[0].facing, "right");

  assert.equal(s1.characters[1].name, "Maya");
  assert.equal(s1.characters[1].characterId, "maya");
  assert.equal(s1.characters[1].slot, "right");

  assert.equal(s1.props.length, 2);
  assert.equal(s1.props[0].id, "lantern");
  assert.equal(s1.props[0].label, "Glowing Lantern");
  assert.equal(s1.props[1].id, "ancient-book");
  assert.equal(s1.props[1].label, "Storybook");
});

test("buildPrintableStoryModel resolves dialogue speakers and line types", () => {
  const story = createMockStory();
  const model = buildPrintableStoryModel(story);
  const s1 = model.scenes[0];

  assert.equal(s1.dialogue.length, 3);
  assert.equal(s1.dialogue[0].speakerName, "Dr. Leo");
  assert.equal(s1.dialogue[0].type, "speech");
  assert.equal(s1.dialogue[0].text, "Did you hear that rustling sound, Maya?");

  assert.equal(s1.dialogue[1].speakerName, "Maya");
  assert.equal(s1.dialogue[1].type, "thought");

  assert.equal(s1.dialogue[2].speakerName, "Narrator");
  assert.equal(s1.dialogue[2].speakerId, "narrator");

  const s2 = model.scenes[1];
  assert.equal(s2.dialogue[0].speakerName, "Maya");
  assert.equal(s2.dialogue[0].type, "shout");
});

test("buildPrintableStoryModel resolves branching choices and targets", () => {
  const story = createMockStory();
  const model = buildPrintableStoryModel(story);
  const s1 = model.scenes[0];

  assert.equal(s1.choices.length, 2);
  assert.equal(s1.choices[0].text, "Open the bookshelf door");
  assert.equal(s1.choices[0].targetSceneId, "scene_beta");
  assert.equal(s1.choices[0].targetSceneName, "The Secret Passage");

  assert.equal(s1.choices[1].text, "Look through the window");
  assert.equal(s1.choices[1].targetSceneId, "scene_gamma");
  assert.equal(s1.choices[1].targetSceneName, "The Garden View");

  assert.equal(s1.isEnding, false);
  assert.equal(model.scenes[1].isEnding, true);
  assert.equal(model.scenes[2].isEnding, true);
});

test("buildPrintableStoryModel is strictly immutable", () => {
  const story = createMockStory();
  const snapshotBefore = JSON.stringify(story);

  const model = buildPrintableStoryModel(story);

  const snapshotAfter = JSON.stringify(story);
  assert.equal(snapshotBefore, snapshotAfter, "Input story document was not mutated");

  // Modify the returned model to ensure no shared references
  model.title = "Completely Mutated Title";
  model.scenes[0].name = "Mutated Scene Name";
  model.scenes[0].dialogue[0].text = "Mutated Dialogue";

  assert.equal(story.title, "The Mystery of Alexandria");
  assert.equal(story.scenes[0].name, "The Grand Library");
  assert.equal(story.scenes[0].dialogue[0].text, "Did you hear that rustling sound, Maya?");
});

test("buildPrintableStoryModel rejects invalid input documents", () => {
  assert.throws(() => buildPrintableStoryModel(null), /Cannot export invalid story/);
  assert.throws(() => buildPrintableStoryModel(undefined), /Cannot export invalid story/);
  assert.throws(() => buildPrintableStoryModel("string"), /Cannot export invalid story/);
  assert.throws(() => buildPrintableStoryModel({ title: "No scenes" }), /Cannot export invalid story/);
});

test("triggerBrowserPrint safely returns false in non-browser environment", () => {
  // In Node.js environment, window is undefined
  const printed = triggerBrowserPrint();
  assert.equal(printed, false);
});

test("triggerBrowserPrint executes window.print when available", () => {
  let printCalled = false;
  const mockWindow = {
    print: () => {
      printCalled = true;
    },
  };

  const originalWindow = globalThis.window;
  try {
    globalThis.window = mockWindow;
    const result = triggerBrowserPrint();
    assert.equal(result, true);
    assert.equal(printCalled, true);
  } finally {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete globalThis.window;
    }
  }
});
