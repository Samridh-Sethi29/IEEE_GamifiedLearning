import test from "node:test";
import assert from "node:assert/strict";

import {
  createDefaultScene,
  createSampleStoryDocument,
  createStoryDocument,
} from "../engine/storySchema.js";

import {
  advanceReader,
  canAdvance,
  canStepBack,
  createReaderState,
  getCurrentDialogue,
  getCurrentScene,
  getReaderProgress,
  restartReader,
  stepBackReader,
} from "../engine/storyReaderEngine.js";

// Helper to create a multi-scene multi-line test story
function createMultiSceneStory() {
  return {
    id: "test-story-1",
    title: "The Great River Journey",
    author: "Test Author",
    version: 1,
    scenes: [
      {
        id: "scene-1",
        name: "Morning at the Docks",
        background: "water-well",
        narration: "The morning sun casts a golden glow over the water.",
        characters: [
          {
            id: "char-inst-1",
            characterId: "maya",
            slot: "left",
            expression: "curious",
            facing: "right",
          },
          {
            id: "char-inst-2",
            characterId: "pip",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        dialogue: [
          {
            id: "line-1",
            speakerId: "maya",
            text: "Look at the water level today, Pip!",
            type: "speech",
          },
          {
            id: "line-2",
            speakerId: "pip",
            text: "Squeak! It's flowing fast!",
            type: "thought",
          },
        ],
        props: ["water-bucket"],
        choices: [],
      },
      {
        id: "scene-2",
        name: "Meeting Elder Samira",
        background: "village-square",
        narration: "Elder Samira was waiting by the village fountain.",
        characters: [
          {
            id: "char-inst-3",
            characterId: "elder-samira",
            slot: "center",
            expression: "neutral",
            facing: "left",
          },
        ],
        dialogue: [
          {
            id: "line-3",
            speakerId: "narrator",
            text: "She motioned for Maya to step forward.",
            type: "speech",
          },
          {
            id: "line-4",
            speakerId: "elder-samira",
            text: "Welcome, young water keeper.",
            type: "speech",
          },
          {
            id: "line-5",
            speakerId: "elder-samira",
            text: "HURRY BEFORE THE TANK RUNS DRY!",
            type: "shout",
          },
        ],
        props: ["ancient-book"],
        choices: [],
      },
      {
        id: "scene-3",
        name: "The Silent Forest",
        background: "starry-night",
        narration: "Night fell as they reached the edge of the woods.",
        characters: [],
        dialogue: [], // zero dialogue lines
        props: ["lantern"],
        choices: [],
      },
    ],
  };
}

// -----------------------------------------------------------------------------
// 1. INITIALIZATION & STATE
// -----------------------------------------------------------------------------

test("1. createReaderState initializes at Scene 1, dialogue 0 for a valid story", () => {
  const story = createMultiSceneStory();
  const state = createReaderState(story);

  assert.equal(state.sceneIndex, 0);
  assert.equal(state.dialogueIndex, 0);
  assert.equal(state.isEnd, false);
  assert.equal(state.scenes.length, 3);
  assert.equal(getCurrentScene(state).id, "scene-1");
  assert.equal(getCurrentDialogue(state).id, "line-1");
});

test("2. createReaderState clamps initialSceneIndex within valid bounds", () => {
  const story = createMultiSceneStory(); // 3 scenes (indices 0, 1, 2)

  const state1 = createReaderState(story, { initialSceneIndex: 1 });
  assert.equal(state1.sceneIndex, 1);
  assert.equal(getCurrentScene(state1).id, "scene-2");

  const stateNegative = createReaderState(story, { initialSceneIndex: -5 });
  assert.equal(stateNegative.sceneIndex, 0);

  const stateOverflow = createReaderState(story, { initialSceneIndex: 99 });
  assert.equal(stateOverflow.sceneIndex, 2);
});

test("3. createReaderState handles empty scenes or missing story safely", () => {
  const emptyStory = { title: "Empty", scenes: [] };
  const stateEmpty = createReaderState(emptyStory);

  assert.equal(stateEmpty.sceneIndex, 0);
  assert.equal(stateEmpty.dialogueIndex, 0);
  assert.equal(stateEmpty.isEnd, true);
  assert.equal(getCurrentScene(stateEmpty), null);
  assert.equal(getCurrentDialogue(stateEmpty), null);

  const nullState = createReaderState(null);
  assert.equal(nullState.isEnd, true);
  assert.equal(getCurrentScene(nullState), null);
  assert.equal(getCurrentDialogue(nullState), null);
});

// -----------------------------------------------------------------------------
// 2. LINEAR PROGRESSION & DIALOGUE STEPPING
// -----------------------------------------------------------------------------

test("4. advanceReader steps through dialogue lines within a scene", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story);

  assert.equal(state.sceneIndex, 0);
  assert.equal(state.dialogueIndex, 0);
  assert.equal(getCurrentDialogue(state).id, "line-1");

  state = advanceReader(state);
  assert.equal(state.sceneIndex, 0);
  assert.equal(state.dialogueIndex, 1);
  assert.equal(getCurrentDialogue(state).id, "line-2");
});

test("5. advanceReader crosses scene boundaries when current scene dialogue is exhausted", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story);

  // Scene 1 line 1 -> line 2
  state = advanceReader(state);
  assert.equal(state.dialogueIndex, 1);

  // Scene 1 line 2 (last line) -> advances to Scene 2 line 0
  state = advanceReader(state);
  assert.equal(state.sceneIndex, 1);
  assert.equal(state.dialogueIndex, 0);
  assert.equal(getCurrentScene(state).id, "scene-2");
  assert.equal(getCurrentDialogue(state).id, "line-3");
});

test("6. advanceReader handles scenes with zero dialogue lines by advancing directly", () => {
  const story = createMultiSceneStory();
  // Jump to Scene 2
  let state = createReaderState(story, { initialSceneIndex: 1 });

  // Advance through Scene 2's 3 lines
  state = advanceReader(state); // line 3 -> line 4
  state = advanceReader(state); // line 4 -> line 5
  assert.equal(state.dialogueIndex, 2);

  // Advance from Scene 2's last line -> advances to Scene 3 (0 dialogue lines)
  state = advanceReader(state);
  assert.equal(state.sceneIndex, 2);
  assert.equal(state.dialogueIndex, 0);
  assert.equal(getCurrentScene(state).id, "scene-3");
  assert.equal(getCurrentDialogue(state), null);
  assert.equal(state.isEnd, false);
});

// -----------------------------------------------------------------------------
// 3. THE END SCREEN TRANSITION & BOUNDARIES
// -----------------------------------------------------------------------------

test("7. advanceReader transitions to 'The End' on the final step of the final scene", () => {
  const story = createMultiSceneStory();
  // Start at Scene 3 (last scene, 0 dialogue lines)
  let state = createReaderState(story, { initialSceneIndex: 2 });
  assert.equal(state.isEnd, false);
  assert.equal(canAdvance(state), true);

  // Advance from Scene 3 -> transitions to isEnd: true
  state = advanceReader(state);
  assert.equal(state.isEnd, true);
  assert.equal(canAdvance(state), false);

  // Calling advanceReader again when at End is a no-op
  const afterEnd = advanceReader(state);
  assert.equal(afterEnd.isEnd, true);
  assert.equal(afterEnd, state);
});

test("8. canAdvance reflects boundary conditions accurately", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story);

  assert.equal(canAdvance(state), true);

  // Fast forward to end
  while (!state.isEnd) {
    state = advanceReader(state);
  }

  assert.equal(state.isEnd, true);
  assert.equal(canAdvance(state), false);
});

// -----------------------------------------------------------------------------
// 4. STEPPING BACKWARD & BOUNDARY CONSTRAINTS
// -----------------------------------------------------------------------------

test("9. stepBackReader steps backward through dialogue lines", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story);

  state = advanceReader(state); // line 0 -> line 1
  assert.equal(state.dialogueIndex, 1);
  assert.equal(canStepBack(state), true);

  state = stepBackReader(state); // line 1 -> line 0
  assert.equal(state.dialogueIndex, 0);
  assert.equal(getCurrentDialogue(state).id, "line-1");
});

test("10. stepBackReader returns to previous scene's last dialogue line from scene start", () => {
  const story = createMultiSceneStory();
  // Start at Scene 2, line 0
  let state = createReaderState(story, { initialSceneIndex: 1 });
  assert.equal(state.sceneIndex, 1);
  assert.equal(state.dialogueIndex, 0);

  state = stepBackReader(state);
  assert.equal(state.sceneIndex, 0);
  // Scene 1 has 2 lines (indices 0 and 1) -> must land on index 1
  assert.equal(state.dialogueIndex, 1);
  assert.equal(getCurrentDialogue(state).id, "line-2");
});

test("11. stepBackReader is disabled at the very beginning of the story", () => {
  const story = createMultiSceneStory();
  const state = createReaderState(story);

  assert.equal(canStepBack(state), false);

  const untouched = stepBackReader(state);
  assert.equal(untouched, state);
  assert.equal(untouched.sceneIndex, 0);
  assert.equal(untouched.dialogueIndex, 0);
});

test("12. stepBackReader steps backward from 'The End' screen to the final scene and line", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story, { initialSceneIndex: 1 });

  // Advance through Scene 2 lines and Scene 3 to The End
  while (!state.isEnd) {
    state = advanceReader(state);
  }
  assert.equal(state.isEnd, true);
  assert.equal(canStepBack(state), true);

  // Step back from The End screen
  state = stepBackReader(state);
  assert.equal(state.isEnd, false);
  assert.equal(state.sceneIndex, 2); // Last scene
});

// -----------------------------------------------------------------------------
// 5. RESTART READER
// -----------------------------------------------------------------------------

test("13. restartReader resets playback from The End or mid-story back to Scene 1, line 0", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story, { initialSceneIndex: 1 });
  state = advanceReader(state);

  assert.equal(state.sceneIndex, 1);
  assert.equal(state.dialogueIndex, 1);

  const restarted = restartReader(state);
  assert.equal(restarted.sceneIndex, 0);
  assert.equal(restarted.dialogueIndex, 0);
  assert.equal(restarted.isEnd, false);
  assert.equal(getCurrentDialogue(restarted).id, "line-1");
});

test("14. restartReader resets from The End screen back to beginning", () => {
  const story = createMultiSceneStory();
  let state = createReaderState(story);
  while (!state.isEnd) {
    state = advanceReader(state);
  }
  assert.equal(state.isEnd, true);

  const restarted = restartReader(state);
  assert.equal(restarted.sceneIndex, 0);
  assert.equal(restarted.dialogueIndex, 0);
  assert.equal(restarted.isEnd, false);
});

// -----------------------------------------------------------------------------
// 6. READER PROGRESS METADATA
// -----------------------------------------------------------------------------

test("15. getReaderProgress calculates correct progress indicators for active dialogue", () => {
  const story = createMultiSceneStory();
  const state = createReaderState(story);

  const progress = getReaderProgress(state);
  assert.equal(progress.sceneIndex, 0);
  assert.equal(progress.sceneNumber, 1);
  assert.equal(progress.totalScenes, 3);
  assert.equal(progress.dialogueIndex, 0);
  assert.equal(progress.dialogueNumber, 1);
  assert.equal(progress.totalDialogue, 2);
  assert.equal(progress.isEnd, false);
  assert.equal(progress.sceneTitle, "Morning at the Docks");
  assert.equal(progress.background, "water-well");
  assert.equal(progress.narration, "The morning sun casts a golden glow over the water.");
  assert.equal(progress.speakerName, "Maya");
  assert.equal(progress.currentLine.id, "line-1");
});

test("16. getReaderProgress resolves Narrator speaker name correctly", () => {
  const story = createMultiSceneStory();
  // Scene 2 line 0 is spoken by 'narrator'
  const state = createReaderState(story, { initialSceneIndex: 1 });
  const progress = getReaderProgress(state);

  assert.equal(progress.speakerName, "Narrator");
  assert.equal(progress.dialogueNumber, 1);
  assert.equal(progress.totalDialogue, 3);
});

test("17. getReaderProgress reports zero dialogue safely for scene without lines", () => {
  const story = createMultiSceneStory();
  const state = createReaderState(story, { initialSceneIndex: 2 });
  const progress = getReaderProgress(state);

  assert.equal(progress.sceneNumber, 3);
  assert.equal(progress.totalDialogue, 0);
  assert.equal(progress.dialogueNumber, 0);
  assert.equal(progress.currentLine, null);
  assert.equal(progress.speakerName, "");
});

// -----------------------------------------------------------------------------
// 7. READ-ONLY IMMUTABILITY & DOCUMENT INTEGRITY
// -----------------------------------------------------------------------------

test("18. Linear reader operations never mutate the story document or its scenes", () => {
  const story = createMultiSceneStory();
  const serializedBefore = JSON.stringify(story);

  let state = createReaderState(story);

  // Traverse through every line and scene until The End
  while (!state.isEnd) {
    state = advanceReader(state);
  }

  // Step all the way back to the start
  while (canStepBack(state)) {
    state = stepBackReader(state);
  }

  // Restart
  state = restartReader(state);

  const serializedAfter = JSON.stringify(story);
  assert.equal(
    serializedAfter,
    serializedBefore,
    "Original story document must be strictly unchanged after full reader traversal"
  );
});

test("19. Sample story document plays through smoothly without errors", () => {
  const sample = createSampleStoryDocument();
  assert.ok(sample.scenes.length >= 2);

  let state = createReaderState(sample);
  let stepCount = 0;
  const maxSteps = 100;

  while (!state.isEnd && stepCount < maxSteps) {
    const prog = getReaderProgress(state);
    assert.ok(prog.sceneNumber >= 1);
    assert.ok(prog.sceneTitle);
    state = advanceReader(state);
    stepCount += 1;
  }

  assert.equal(state.isEnd, true);
  assert.ok(stepCount > 2);
});

test("20. Defensive handling of null or undefined readerState in all functions", () => {
  assert.equal(getCurrentScene(null), null);
  assert.equal(getCurrentDialogue(null), null);
  assert.equal(canAdvance(null), false);
  assert.equal(canStepBack(null), false);
  assert.equal(advanceReader(null), null);
  assert.equal(stepBackReader(null), null);
  assert.equal(restartReader(null), null);
});
