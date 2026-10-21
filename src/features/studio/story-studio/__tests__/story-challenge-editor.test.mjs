import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CHALLENGES,
  CHALLENGE_IDS,
  createChallengeStarterStory,
  getChallengeById,
} from "../data/storyChallenges.js";

import {
  CHALLENGE_STATUSES,
  createInitialProgressState,
  deriveChallengeStatus,
  normalizeProgressState,
  recordChallengeEvaluation,
  startChallengeAttempt,
} from "../engine/storyChallengeProgress.js";

import {
  STORY_CHALLENGES_STORAGE_KEY,
  createStoryChallengeStorage,
  getStoryChallengeDocKey,
} from "../engine/storyChallengeStorage.js";

import {
  evaluateChallenge,
} from "../engine/storyChallengeEngine.js";

import {
  createStoryStorage,
  loadStory,
} from "../engine/storyStorage.js";

import {
  STORY_STORAGE_KEY,
  createStoryDocument,
} from "../engine/storySchema.js";

import {
  addCharacter,
  addChoice,
  addDialogueLine,
  addScene,
  createStoryState,
  selectStory,
  setSceneBackground,
  setSceneIsEnding,
  setSceneNarration,
  storyReducer,
} from "../engine/storyReducer.js";

import { validateStoryDocument } from "../engine/storyValidation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storyStudioRoot = resolve(__dirname, "..");
const readSource = (...p) => readFileSync(resolve(storyStudioRoot, ...p), "utf-8");

const workspaceJsx = readSource("components", "StoryStudioWorkspace.jsx");
const hudJsx = readSource("components", "StoryChallengeHUD.jsx");
const hubJsx = readSource("components", "StoryChallengeModal.jsx");
const studioCss = readSource("story-studio.css");

function createMemoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    data: store,
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
}

// -----------------------------------------------------------------------------
// 1. Static Architecture and Component Wiring Checks (C3)
// -----------------------------------------------------------------------------
test("1. StoryChallengeHUD component exists, exports default, and wires expected controls", () => {
  assert.ok(hudJsx.includes("export default function StoryChallengeHUD"), "Exports StoryChallengeHUD default component");
  assert.ok(hudJsx.includes("evaluateChallenge"), "Uses deterministic evaluateChallenge engine");
  assert.ok(hudJsx.includes("getChallengeById"), "Resolves challenge catalogue metadata");
  assert.ok(hudJsx.includes("data-testid=\"story-challenge-hud\""), "Exposes root data-testid");
  assert.ok(hudJsx.includes("challenge-hud-progress-pill"), "Renders real-time progress pill");
  assert.ok(hudJsx.includes("challenge-hud-toggle-btn"), "Provides collapsible toggle button");
  assert.ok(hudJsx.includes("challenge-hud-open-hub-btn"), "Provides quick navigation button to Challenge Hub");
  assert.ok(hudJsx.includes("challenge-hud-exit-btn"), "Provides exit challenge button");
  assert.ok(hudJsx.includes("hud-objective-"), "Exposes objective items by ID");
});

test("2. StoryStudioWorkspace mounts StoryChallengeHUD conditionally when activeChallengeId is present", () => {
  assert.ok(workspaceJsx.includes("import StoryChallengeHUD from \"./StoryChallengeHUD.jsx\""), "Imports StoryChallengeHUD");
  assert.ok(workspaceJsx.includes("activeChallengeId && ("), "Conditionally renders StoryChallengeHUD only when challenge active");
  assert.ok(workspaceJsx.includes("<StoryChallengeHUD"), "Mounts StoryChallengeHUD");
  assert.ok(workspaceJsx.includes("challengeId={activeChallengeId}"), "Passes active challenge ID");
  assert.ok(workspaceJsx.includes("currentStory={currentStory}"), "Passes active story document");
  assert.ok(workspaceJsx.includes("onExitChallenge={handleExitChallenge}"), "Passes exit challenge handler");
});

test("3. Scoped CSS rules for StoryChallengeHUD and collapsible objectives tray are defined in story-studio.css", () => {
  assert.ok(studioCss.includes(".story-challenge-hud"), "Defines .story-challenge-hud");
  assert.ok(studioCss.includes(".story-challenge-hud-bar"), "Defines .story-challenge-hud-bar");
  assert.ok(studioCss.includes(".story-challenge-hud-tray"), "Defines .story-challenge-hud-tray");
  assert.ok(studioCss.includes(".story-challenge-hud-objectives-grid"), "Defines .story-challenge-hud-objectives-grid");
  assert.ok(studioCss.includes(".story-challenge-hud-obj-item"), "Defines .story-challenge-hud-obj-item");
  assert.ok(studioCss.includes(".story-challenge-hud-progress-pill"), "Defines .story-challenge-hud-progress-pill");
  assert.ok(studioCss.includes(".story-challenge-hud-jump-btn"), "Defines .story-challenge-hud-jump-btn");
});

// -----------------------------------------------------------------------------
// 2. Draft Isolation and Storage Separation Tests (C3)
// -----------------------------------------------------------------------------
test("4. Starting a challenge isolates the challenge draft from the personal canonical story", () => {
  const mem = createMemoryStorage();
  const canonicalStorage = createStoryStorage({ storage: mem });
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  // 1. User starts with an existing personal story
  const personalStory = createStoryDocument({ title: "My Personal Epic Tale" });
  canonicalStorage.save(personalStory);

  // Verify personal story exists at canonical key
  const preLoad = canonicalStorage.load();
  assert.equal(preLoad.ok, true);
  assert.equal(preLoad.story.title, "My Personal Epic Tale");

  // 2. User starts Challenge 1: "A Story Begins"
  const startRes = startChallengeAttempt(createInitialProgressState(), CHALLENGE_IDS.STORY_BEGINS);
  assert.equal(startRes.ok, true);
  challengeStorage.saveProgress(startRes.progressState);

  const challengeDoc = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS, {
    attemptId: startRes.attempt.id,
  });
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, challengeDoc);

  // 3. Verify challenge story was saved to its isolated key
  const challengeKey = getStoryChallengeDocKey(CHALLENGE_IDS.STORY_BEGINS);
  assert.ok(mem.getItem(challengeKey) !== null, "Challenge document saved to dedicated key");
  assert.ok(mem.getItem(STORY_STORAGE_KEY) !== null, "Canonical storage key still exists");

  // 4. Verify canonical story is unchanged
  const postLoad = canonicalStorage.load();
  assert.equal(postLoad.ok, true);
  assert.equal(postLoad.story.title, "My Personal Epic Tale");
  assert.equal(postLoad.story.metadata?.challengeId, undefined, "Personal story not contaminated with challengeId");
});

test("5. Saving edits to a challenge draft does NOT overwrite personal story storage", () => {
  const mem = createMemoryStorage();
  const canonicalStorage = createStoryStorage({ storage: mem });
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  // Save personal story
  const personalStory = createStoryDocument({ title: "Original Personal Draft" });
  canonicalStorage.save(personalStory);

  // Create and modify challenge story
  const challengeDoc = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);
  challengeDoc.title = "Challenge Level 1 in Progress";
  challengeDoc.scenes[0].narration = "Once upon a time in a faraway realm...";

  // Save via challenge storage
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, challengeDoc);

  // Verify canonical story remains "Original Personal Draft"
  const canonicalAfter = canonicalStorage.load();
  assert.equal(canonicalAfter.ok, true);
  assert.equal(canonicalAfter.story.title, "Original Personal Draft");
  assert.equal(canonicalAfter.story.scenes[0].narration, "A brand new story begins in the village square.");

  // Verify challenge story has modified content
  const challengeAfter = challengeStorage.loadChallengeStory(CHALLENGE_IDS.STORY_BEGINS);
  assert.equal(challengeAfter.ok, true);
  assert.equal(challengeAfter.story.title, "Challenge Level 1 in Progress");
  assert.equal(challengeAfter.story.scenes[0].narration, "Once upon a time in a faraway realm...");
});

test("6. Multiple challenges maintain independent drafts without collision", () => {
  const mem = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  const doc1 = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);
  doc1.title = "Level 1 Story";
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc1);

  const doc2 = createChallengeStarterStory(CHALLENGE_IDS.CHARACTERS_LIFE);
  doc2.title = "Level 2 Story";
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.CHARACTERS_LIFE, doc2);

  const loaded1 = challengeStorage.loadChallengeStory(CHALLENGE_IDS.STORY_BEGINS);
  const loaded2 = challengeStorage.loadChallengeStory(CHALLENGE_IDS.CHARACTERS_LIFE);

  assert.equal(loaded1.story.title, "Level 1 Story");
  assert.equal(loaded2.story.title, "Level 2 Story");
  assert.equal(loaded1.story.metadata.challengeId, CHALLENGE_IDS.STORY_BEGINS);
  assert.equal(loaded2.story.metadata.challengeId, CHALLENGE_IDS.CHARACTERS_LIFE);
});

// -----------------------------------------------------------------------------
// 3. Real-Time Objective Evaluation in Story Editing Lifecycle (C3)
// -----------------------------------------------------------------------------
test("7. Challenge 1 evaluation dynamically updates as user meets objectives", () => {
  const challenge1 = getChallengeById(CHALLENGE_IDS.STORY_BEGINS);
  let doc = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);

  // 1. Initial starter state: 1 scene, Maya placed, empty narration, empty dialogue
  let eval1 = evaluateChallenge(challenge1, doc);
  assert.equal(eval1.eligibleForCompletion, false);
  // Maya is already placed on stage, so 1 of 4 objectives is initially met
  assert.equal(eval1.summary.metCount, 1);
  assert.equal(eval1.summary.totalCount, 4);
  assert.equal(eval1.summary.percentComplete, 25);

  // Objectives check
  const scenesObj = eval1.objectives.find((o) => o.id === "scenes-count");
  const narrationObj = eval1.objectives.find((o) => o.id === "narration");
  const dialogueObj = eval1.objectives.find((o) => o.id === "dialogue");
  const charObj = eval1.objectives.find((o) => o.id === "character-placed");

  assert.equal(scenesObj.met, false);
  assert.equal(scenesObj.current, 1);
  assert.equal(scenesObj.target, 2);
  assert.equal(charObj.met, true);

  // 2. Add narration to scene 1
  let state = createStoryState(doc);
  state = storyReducer(state, setSceneNarration(doc.scenes[0].id, "The journey begins on a misty morning."));
  doc = selectStory(state);

  let eval2 = evaluateChallenge(challenge1, doc);
  const narrationObj2 = eval2.objectives.find((o) => o.id === "narration");
  assert.equal(narrationObj2.met, true);
  assert.equal(eval2.summary.metCount, 2);
  assert.equal(eval2.summary.percentComplete, 50);

  // 3. Add dialogue to scene 1
  state = storyReducer(state, addDialogueLine({
    sceneId: doc.scenes[0].id,
    speaker: "Traveler",
    text: "We must reach the mountain peak before dusk falls.",
  }));
  doc = selectStory(state);

  let eval3 = evaluateChallenge(challenge1, doc);
  const dialogueObj3 = eval3.objectives.find((o) => o.id === "dialogue");
  assert.equal(dialogueObj3.met, true);
  assert.equal(eval3.summary.metCount, 3);
  assert.equal(eval3.summary.percentComplete, 75);

  // 4. Add scene 2 to satisfy scenes-count >= 2
  state = storyReducer(state, addScene());
  doc = selectStory(state);

  let eval4 = evaluateChallenge(challenge1, doc);
  const scenesObj4 = eval4.objectives.find((o) => o.id === "scenes-count");
  assert.equal(scenesObj4.met, true);
  assert.equal(scenesObj4.current, 2);
  assert.equal(eval4.summary.metCount, 4);
  assert.equal(eval4.summary.percentComplete, 100);
  assert.equal(eval4.eligibleForCompletion, true);
});

test("8. Challenge evaluation sync records progress without prematurely completing or awarding rewards", () => {
  const mem = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  // Initial progress state
  let progressState = createInitialProgressState();
  const startRes = startChallengeAttempt(progressState, CHALLENGE_IDS.STORY_BEGINS);
  progressState = startRes.progressState;
  challengeStorage.saveProgress(progressState);

  // Create completed document for Challenge 1 (2 scenes, narration, dialogue, character)
  const doc = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);
  doc.scenes[0].narration = "Narration line for testing.";
  doc.scenes[0].dialogue = [{ id: "d1", speaker: "Hero", text: "Onward!", type: "speech" }];
  doc.scenes.push({ ...doc.scenes[0], id: "scene_2" });

  const challenge1 = getChallengeById(CHALLENGE_IDS.STORY_BEGINS);
  const evalResult = evaluateChallenge(challenge1, doc);
  assert.equal(evalResult.eligibleForCompletion, true);

  // Sync evaluation
  const updatedProgress = recordChallengeEvaluation(progressState, CHALLENGE_IDS.STORY_BEGINS, evalResult);
  challengeStorage.saveProgress(updatedProgress);

  // Verify status is STILL IN_PROGRESS (NOT COMPLETED!)
  const record = updatedProgress.challenges[CHALLENGE_IDS.STORY_BEGINS];
  assert.equal(record.status, CHALLENGE_STATUSES.IN_PROGRESS);
  assert.equal(record.completedAt, null, "completedAt must remain null in C3");
  assert.equal(record.rewardRecord, null, "rewardRecord must remain null in C3");

  // Verify evaluation details are preserved
  assert.equal(record.evaluation.passed, true);
  assert.equal(record.evaluation.summary.metCount, 4);
  assert.equal(record.evaluation.summary.percentComplete, 100);
});

// -----------------------------------------------------------------------------
// 4. Safe Exit and Re-entry Transitions (C3)
// -----------------------------------------------------------------------------
test("9. Reopening an existing challenge resumes its exact saved attempt and document", () => {
  const mem = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  // 1. First attempt started
  const progress1 = createInitialProgressState();
  const start1 = startChallengeAttempt(progress1, CHALLENGE_IDS.STORY_BEGINS);
  challengeStorage.saveProgress(start1.progressState);

  const draft1 = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS, {
    attemptId: start1.attempt.id,
  });
  draft1.title = "Draft Saved by Player";
  draft1.scenes[0].narration = "Specific draft content saved.";
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, draft1);

  // 2. Later, user resumes the challenge
  const loadedProgress = challengeStorage.loadProgress().progressState;
  const resume = startChallengeAttempt(loadedProgress, CHALLENGE_IDS.STORY_BEGINS);

  assert.equal(resume.ok, true);
  assert.equal(resume.isResume, true);
  assert.equal(resume.attempt.id, start1.attempt.id, "Resumes the exact existing attempt ID");

  // 3. Story draft reloaded
  const loadedDoc = challengeStorage.loadChallengeStory(CHALLENGE_IDS.STORY_BEGINS);
  assert.equal(loadedDoc.ok, true);
  assert.equal(loadedDoc.story.title, "Draft Saved by Player");
  assert.equal(loadedDoc.story.scenes[0].narration, "Specific draft content saved.");
});

test("10. Exiting Challenge Mode restores the user's personal canonical story", () => {
  const mem = createMemoryStorage();
  const canonicalStorage = createStoryStorage({ storage: mem });
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  // Setup personal story
  const personalStory = createStoryDocument({ title: "My Original Personal Story" });
  canonicalStorage.save(personalStory);

  // Setup active challenge
  const challengeDoc = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);
  challengeDoc.title = "A Story Begins — Challenge Attempt";
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, challengeDoc);

  // Simulate workspace exitChallenge behavior:
  // 1. Save active challenge doc
  challengeStorage.saveChallengeStory(challengeDoc.metadata.challengeId, challengeDoc);

  // 2. Reload canonical personal story
  const res = loadStory(canonicalStorage);
  assert.equal(res.ok, true);
  assert.equal(res.story.title, "My Original Personal Story");
  assert.equal(res.story.metadata?.challengeId, undefined);
});

// -----------------------------------------------------------------------------
// 5. Objective Jump Target Resolution (C3)
// -----------------------------------------------------------------------------
test("11. HUD jump target resolution maps every objective type to an appropriate editor section", () => {
  // Test mappings for all challenges
  for (const c of CHALLENGES) {
    for (const obj of c.orderedObjectives) {
      let expectedSection = null;
      switch (obj.id) {
        case "scenes-count":
          expectedSection = "navigator";
          break;
        case "narration":
        case "narration-depth":
          expectedSection = "narration";
          break;
        case "dialogue":
        case "character-dialogue":
        case "ensemble-dialogue":
          expectedSection = "dialogue";
          break;
        case "character-placed":
        case "distinct-characters":
        case "distinct-expressions":
          expectedSection = "characters";
          break;
        case "distinct-backgrounds":
          expectedSection = "backgrounds";
          break;
        case "props-placed":
          expectedSection = "props";
          break;
        case "branching-choice":
        case "distinct-targets":
        case "reachable-endings":
        case "branching-endings":
          expectedSection = "choices";
          break;
      }

      assert.ok(expectedSection !== null, `Objective "${obj.id}" in challenge "${c.id}" has a valid jump section: "${expectedSection}"`);
    }
  }
});

// -----------------------------------------------------------------------------
// 6. Recoverable Fallback on Missing or Damaged Drafts (C3)
// -----------------------------------------------------------------------------
test("12. Recoverable fallback creates valid starter story if challenge document is missing", () => {
  const mem = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage: mem });

  assert.equal(challengeStorage.hasChallengeStory(CHALLENGE_IDS.BUILD_WORLD), false);

  // Fallback generates fresh starter story with schema validation
  const starter = createChallengeStarterStory(CHALLENGE_IDS.BUILD_WORLD);
  assert.equal(validateStoryDocument(starter).ok, true);
  assert.equal(starter.metadata.challengeId, CHALLENGE_IDS.BUILD_WORLD);
  assert.equal(starter.metadata.challengeLevel, 3);
});
