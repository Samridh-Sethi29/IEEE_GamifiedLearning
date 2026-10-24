import test from "node:test";
import assert from "node:assert/strict";

import {
  STORY_LIMITS,
  createDefaultScene,
  createStoryDocument,
} from "../engine/storySchema.js";
import {
  addChoice,
  createStoryState,
  deleteScene,
  moveChoice,
  removeChoice,
  selectStory,
  setSceneIsEnding,
  storyReducer,
  updateChoice,
} from "../engine/storyReducer.js";
import {
  advanceReader,
  canAdvance,
  chooseBranch,
  createReaderState,
  getReaderProgress,
  isWaitingForChoice,
  stepBackReader,
} from "../engine/storyReaderEngine.js";
import { analyzeStoryGraph } from "../engine/storyGraph.js";
import { validateStoryDocument } from "../engine/storyValidation.js";

// Helper to create a 3-scene test story
function createTestBranchingStory() {
  const scene1 = createDefaultScene({
    id: "scene_crossroads",
    name: "The Crossroads",
    background: "village-square",
    narration: "A fork in the road awaits our traveler.",
  });
  const scene2 = createDefaultScene({
    id: "scene_forest",
    name: "Enchanted Orchard",
    background: "farm-field",
    narration: "Sunlight filters through golden leaves.",
    isEnding: true,
  });
  const scene3 = createDefaultScene({
    id: "scene_mountain",
    name: "Starlit Well",
    background: "water-well",
    narration: "Cool water ripples under the quiet moon.",
    isEnding: true,
  });

  return createStoryDocument({
    title: "The Crossroads Tale",
    scenes: [scene1, scene2, scene3],
  });
}

// =============================================================================
// S1.9: CHOICE CRUD
// =============================================================================

test("1. addChoice creates a valid choice targeting an existing scene and commits to history", () => {
  const doc = createTestBranchingStory();
  let state = createStoryState(doc);

  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Take Orchard Path",
      targetSceneId: "scene_forest",
    })
  );

  const updatedScene = selectStory(state).scenes[0];
  assert.equal(updatedScene.choices.length, 1);
  assert.equal(updatedScene.choices[0].text, "Take Orchard Path");
  assert.equal(updatedScene.choices[0].targetSceneId, "scene_forest");
  assert.ok(updatedScene.choices[0].id.startsWith("choice_"));

  const check = validateStoryDocument(selectStory(state));
  assert.equal(check.ok, true, `Validation failed: ${check.errors?.join("; ")}`);
});

test("2. addChoice rejects invalid target scenes or exceeding MAX_CHOICES_PER_SCENE", () => {
  const doc = createTestBranchingStory();
  let state = createStoryState(doc);

  // Reject missing target scene
  const invalidState = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Go to Nowhere",
      targetSceneId: "scene_non_existent",
    })
  );
  assert.equal(selectStory(invalidState).scenes[0].choices.length, 0);

  // Add up to 4 choices
  for (let i = 0; i < STORY_LIMITS.MAX_CHOICES_PER_SCENE; i++) {
    state = storyReducer(
      state,
      addChoice({
        sceneId: "scene_crossroads",
        text: `Choice ${i + 1}`,
        targetSceneId: "scene_forest",
      })
    );
  }
  assert.equal(selectStory(state).scenes[0].choices.length, 4);

  // 5th choice must be rejected
  const overflowState = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Choice 5",
      targetSceneId: "scene_forest",
    })
  );
  assert.equal(selectStory(overflowState).scenes[0].choices.length, 4);
});

test("3. updateChoice and moveChoice modify choice text, target, and order cleanly", () => {
  const doc = createTestBranchingStory();
  let state = createStoryState(doc);

  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Choice A",
      targetSceneId: "scene_forest",
    })
  );
  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Choice B",
      targetSceneId: "scene_mountain",
    })
  );

  const choiceAId = selectStory(state).scenes[0].choices[0].id;

  // Update choice A text and target
  state = storyReducer(
    state,
    updateChoice("scene_crossroads", choiceAId, {
      text: "Explore Orchard Gently",
      targetSceneId: "scene_mountain",
    })
  );
  assert.equal(
    selectStory(state).scenes[0].choices[0].text,
    "Explore Orchard Gently"
  );
  assert.equal(
    selectStory(state).scenes[0].choices[0].targetSceneId,
    "scene_mountain"
  );

  // Move choice A down
  state = storyReducer(state, moveChoice("scene_crossroads", choiceAId, "down"));
  assert.equal(selectStory(state).scenes[0].choices[1].id, choiceAId);
});

test("4. removeChoice deletes a choice and setSceneIsEnding marks ending state", () => {
  const doc = createTestBranchingStory();
  let state = createStoryState(doc);

  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Path 1",
      targetSceneId: "scene_forest",
    })
  );
  const choiceId = selectStory(state).scenes[0].choices[0].id;

  state = storyReducer(state, removeChoice("scene_crossroads", choiceId));
  assert.equal(selectStory(state).scenes[0].choices.length, 0);

  state = storyReducer(state, setSceneIsEnding("scene_crossroads", true));
  assert.equal(selectStory(state).scenes[0].isEnding, true);
});

// =============================================================================
// S1.9: DANGLING REFERENCE SAFETY & GRAPH ANALYSIS
// =============================================================================

test("5. deleteScene automatically strips dangling choice references to the deleted scene", () => {
  const doc = createTestBranchingStory();
  let state = createStoryState(doc);

  // Crossroads links to forest and mountain
  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Go to Forest",
      targetSceneId: "scene_forest",
    })
  );
  state = storyReducer(
    state,
    addChoice({
      sceneId: "scene_crossroads",
      text: "Go to Mountain",
      targetSceneId: "scene_mountain",
    })
  );

  assert.equal(selectStory(state).scenes[0].choices.length, 2);

  // Delete scene_forest
  state = storyReducer(state, deleteScene("scene_forest"));

  // The choice targeting scene_forest should be automatically removed!
  const remainingChoices = selectStory(state).scenes[0].choices;
  assert.equal(remainingChoices.length, 1);
  assert.equal(remainingChoices[0].targetSceneId, "scene_mountain");

  // Document should remain 100% valid with NO dangling references
  const check = validateStoryDocument(selectStory(state));
  assert.equal(check.ok, true, `Validation failed: ${check.errors?.join("; ")}`);
});

test("6. analyzeStoryGraph detects unreachable scenes and endings correctly", () => {
  const doc = createTestBranchingStory();
  // Crossroads points to forest only; mountain is unreachable
  doc.scenes[0].choices = [
    {
      id: "ch_1",
      text: "To Forest",
      targetSceneId: "scene_forest",
    },
  ];

  const analysis = analyzeStoryGraph(doc);
  assert.equal(analysis.ok, true);
  assert.ok(analysis.reachableSceneIds.includes("scene_crossroads"));
  assert.ok(analysis.reachableSceneIds.includes("scene_forest"));
  assert.ok(analysis.unreachableSceneIds.includes("scene_mountain"));
  assert.ok(analysis.endingSceneIds.includes("scene_forest"));
  assert.ok(analysis.endingSceneIds.includes("scene_mountain"));
});

// =============================================================================
// S1.9: READER PLAYBACK & MULTIPLE ENDINGS
// =============================================================================

test("7. Reader pauses at branching choices and follows chosen target branch", () => {
  const doc = createTestBranchingStory();
  doc.scenes[0].choices = [
    {
      id: "ch_forest",
      text: "Enter Orchard",
      targetSceneId: "scene_forest",
    },
    {
      id: "ch_mountain",
      text: "Climb Well",
      targetSceneId: "scene_mountain",
    },
  ];

  let reader = createReaderState(doc);

  // Since scene 0 has no dialogue lines, it immediately waits for choice!
  assert.equal(isWaitingForChoice(reader), true);
  assert.equal(canAdvance(reader), false, "Cannot auto-advance past a choice!");

  // Player clicks "Enter Orchard"
  reader = chooseBranch(reader, "ch_forest");
  assert.equal(reader.sceneIndex, 1, "Should transition to Orchard scene");
  assert.equal(reader.scenes[reader.sceneIndex].name, "Enchanted Orchard");

  // Orchard is an ending scene, so advancing transitions to End-of-Story
  reader = advanceReader(reader);
  assert.equal(reader.isEnd, true);
  assert.equal(reader.endingSceneName, "Enchanted Orchard");

  const progress = getReaderProgress(reader);
  assert.equal(progress.isEnd, true);
  assert.equal(progress.endingSceneName, "Enchanted Orchard");
});

test("8. Reader pathHistory allows stepping backward across branching choices", () => {
  const doc = createTestBranchingStory();
  doc.scenes[0].choices = [
    {
      id: "ch_mountain",
      text: "Climb Well",
      targetSceneId: "scene_mountain",
    },
  ];

  let reader = createReaderState(doc);
  reader = chooseBranch(reader, "ch_mountain");
  assert.equal(reader.sceneIndex, 2, "At Mountain Well");

  // Step back returns to Crossroads
  reader = stepBackReader(reader);
  assert.equal(reader.sceneIndex, 0, "Stepping back returns to Crossroads scene");
});

test("9. Pure linear stories with NO choices preserve exact sequential playback", () => {
  const doc = createTestBranchingStory();
  // Clear all choices and explicit endings for standard linear test
  doc.scenes.forEach((s) => {
    s.choices = [];
    delete s.isEnding;
  });

  let reader = createReaderState(doc);
  assert.equal(reader.sceneIndex, 0);

  reader = advanceReader(reader);
  assert.equal(reader.sceneIndex, 1);

  reader = advanceReader(reader);
  assert.equal(reader.sceneIndex, 2);

  reader = advanceReader(reader);
  assert.equal(reader.isEnd, true, "Final scene completes linear story");
});
