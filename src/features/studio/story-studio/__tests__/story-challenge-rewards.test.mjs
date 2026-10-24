import test from "node:test";
import assert from "node:assert/strict";

import {
  CHALLENGES,
  CHALLENGE_IDS,
  CHALLENGE_ORDER,
  createChallengeStarterStory,
  getChallengeById,
  getChallengeByLevel,
  getNextChallenge,
} from "../data/storyChallenges.js";

import {
  evaluateChallenge,
  validateChallengeStory,
} from "../engine/storyChallengeEngine.js";

import {
  CHALLENGE_STATUSES,
  createInitialProgressState,
  deriveChallengeStatus,
  getChallengeProgress,
  startChallengeAttempt,
} from "../engine/storyChallengeProgress.js";

import {
  createStoryChallengeStorage,
} from "../engine/storyChallengeStorage.js";

import {
  STORY_CHALLENGE_LOCK_PREFIX,
  calculatePlayerChallengeRewardUpdates,
  evaluateChallengeRewardEligibility,
  executeChallengeCompletion,
  executeChallengeCompletionSync,
  generateRewardTransactionId,
  getChallengeCompletedAt,
  getFreshestPlayerState,
  getStoryChallengeLockName,
  isChallengeAlreadyCompleted,
  withStoryChallengeLock,
} from "../engine/storyChallengeRewards.js";

import { createStoryDocument } from "../engine/storySchema.js";

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

// Helper: build a passing Level 1 story
function createPassingLevel1Doc() {
  const doc = createStoryDocument({
    id: "story_l1",
    title: "A Village Morning",
    metadata: { challengeId: CHALLENGE_IDS.STORY_BEGINS, challengeLevel: 1 },
  });
  // Scene 1: Narration >= 20 non-whitespace chars, placed character, dialogue
  doc.scenes[0].name = "Arrival";
  doc.scenes[0].background = "village-square";
  doc.scenes[0].narration = "The morning sunlight gently filled the quiet village square."; // 52 non-whitespace
  doc.scenes[0].characters = [
    { id: "char_maya", characterId: "maya", slot: 1, expression: "happy", facing: "right" },
  ];
  doc.scenes[0].dialogue = [
    { id: "dlg_1", speakerId: "maya", text: "Hello beautiful world!", type: "speech" },
  ];

  // Scene 2: Additional scene to satisfy >= 2 scenes
  doc.scenes.push({
    id: "scene_l1_2",
    name: "The Well",
    background: "water-well",
    narration: "A cool breeze swept past the ancient stone well.",
    characters: [
      { id: "char_maya_2", characterId: "maya", slot: 1, expression: "happy", facing: "right" },
    ],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: true,
  });

  return doc;
}

// Helper: build a passing Level 2 story
function createPassingLevel2Doc() {
  const doc = createStoryDocument({
    id: "story_l2",
    title: "Maya and Tariq",
    metadata: { challengeId: CHALLENGE_IDS.CHARACTERS_LIFE, challengeLevel: 2 },
  });
  // 2 distinct placed characters, each has >= 1 non-empty dialogue line, >= 2 distinct expressions
  doc.scenes[0].background = "village-square";
  doc.scenes[0].characters = [
    { id: "char_maya", characterId: "maya", slot: 0, expression: "happy", facing: "right" },
    { id: "char_tariq", characterId: "tariq", slot: 2, expression: "thoughtful", facing: "left" },
  ];
  doc.scenes[0].dialogue = [
    { id: "d1", speakerId: "maya", text: "Good morning Tariq, ready for the harvest?", type: "speech" },
    { id: "d2", speakerId: "tariq", text: "I have been ready all morning, Maya!", type: "speech" },
  ];
  return doc;
}

// Helper: build a passing Level 3 story
function createPassingLevel3Doc() {
  const doc = createStoryDocument({
    id: "story_l3",
    title: "Exploring the Realm",
    metadata: { challengeId: CHALLENGE_IDS.BUILD_WORLD, challengeLevel: 3 },
  });
  // Scene 1: background 1, prop 1
  doc.scenes[0].background = "village-square";
  doc.scenes[0].props = ["water-bucket"];

  // Scene 2: background 2, prop 2
  doc.scenes.push({
    id: "scene_l3_2",
    name: "Cozy Hearth",
    background: "cozy-cottage",
    narration: "Warm embers glowed in the stone fireplace.",
    characters: [],
    dialogue: [],
    props: ["lantern"],
    choices: [],
    isEnding: false,
  });

  // Scene 3: >= 3 scenes
  doc.scenes.push({
    id: "scene_l3_3",
    name: "Night Path",
    background: "starry-night",
    narration: "Fireflies lit the shadowy path ahead.",
    characters: [],
    dialogue: [],
    props: ["ancient-book"],
    choices: [],
    isEnding: true,
  });

  return doc;
}

// Helper: build a passing Level 4 story
function createPassingLevel4Doc() {
  const doc = createStoryDocument({
    id: "story_l4",
    title: "The Crossroads",
    metadata: { challengeId: CHALLENGE_IDS.BIG_DECISION, challengeLevel: 4 },
  });
  // Scene 1 has branch choices leading to Scene 2 and Scene 3
  doc.scenes[0].background = "village-square";
  doc.scenes[0].choices = [
    { id: "c1", text: "Go to the Farm", targetSceneId: "scene_l4_farm" },
    { id: "c2", text: "Go to the Well", targetSceneId: "scene_l4_well" },
  ];

  // Ending 1
  doc.scenes.push({
    id: "scene_l4_farm",
    name: "Farm Field",
    background: "farm-field",
    narration: "The fertile farm field flourished under the warm sun.",
    characters: [],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: true,
  });

  // Ending 2
  doc.scenes.push({
    id: "scene_l4_well",
    name: "Water Well",
    background: "water-well",
    narration: "The crystal clear water from the well refreshed the village.",
    characters: [],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: true,
  });

  return doc;
}

// Helper: build a passing Level 5 story
function createPassingLevel5Doc() {
  const doc = createStoryDocument({
    id: "story_l5",
    title: "The Grand Master Tale",
    metadata: { challengeId: CHALLENGE_IDS.STORY_MASTER, challengeLevel: 5 },
  });
  // >= 4 scenes; narration >= 20 non-ws in >= 3 scenes; >= 2 distinct speaking characters; branch with >= 2 reachable endings
  doc.scenes[0].name = "Prologue";
  doc.scenes[0].background = "village-square";
  doc.scenes[0].narration = "Long ago before the river carved the canyon, stories were whispered in wind."; // 67 non-ws
  doc.scenes[0].characters = [
    { id: "cm", characterId: "maya", slot: 0, expression: "happy", facing: "right" },
    { id: "ct", characterId: "tariq", slot: 2, expression: "thoughtful", facing: "left" },
  ];
  doc.scenes[0].dialogue = [
    { id: "d1", speakerId: "maya", text: "We must choose our destiny carefully.", type: "speech" },
    { id: "d2", speakerId: "tariq", text: "Every path leads to a different conclusion.", type: "speech" },
  ];
  doc.scenes[0].choices = [
    { id: "c1", text: "Visit Classroom", targetSceneId: "scene_l5_class" },
    { id: "c2", text: "Visit Cottage", targetSceneId: "scene_l5_cottage" },
  ];

  // Scene 2: Journey Scene with meaningful narration
  doc.scenes.push({
    id: "scene_l5_mid",
    name: "The Journey",
    background: "farm-field",
    narration: "The travelers paused beside the ancient sundial to plan their next course.", // 62 non-ws
    characters: [],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: false,
  });

  // Scene 3: Classroom (Ending 1) with meaningful narration
  doc.scenes.push({
    id: "scene_l5_class",
    name: "Classroom",
    background: "school-classroom",
    narration: "From the bright classroom, knowledge and curiosity inspired all the students.", // 68 non-ws
    characters: [],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: true,
  });

  // Scene 4: Cottage (Ending 2) with meaningful narration
  doc.scenes.push({
    id: "scene_l5_cottage",
    name: "Cottage",
    background: "cozy-cottage",
    narration: "In the cozy cottage, the hearth warmed the weary explorers after their journey.", // 68 non-ws
    characters: [],
    dialogue: [],
    props: [],
    choices: [],
    isEnding: true,
  });

  return doc;
}

// -----------------------------------------------------------------------------
// 1. Level 1 Validation & Boundary Edge Cases
// -----------------------------------------------------------------------------
test("1. Level 1 passes with valid story meeting all 4 objectives", () => {
  const doc = createPassingLevel1Doc();
  const res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  assert.equal(res.passed, true);
  assert.equal(res.summary.metCount, 4);
  assert.equal(res.summary.totalCount, 4);
  assert.equal(res.summary.remainingTasks.length, 0);
});

test("2. Level 1 fails when scenes count is below 2", () => {
  const doc = createPassingLevel1Doc();
  doc.scenes.pop(); // only 1 scene
  const res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  assert.equal(res.passed, false);
  const sceneObj = res.objectives.find((o) => o.id === "scenes-count");
  assert.equal(sceneObj.met, false);
  assert.ok(res.summary.remainingTasks.some((t) => t.includes("Add at least")));
});

test("3. Level 1 narration rejects whitespace-only or strings < 20 non-whitespace chars", () => {
  const doc = createPassingLevel1Doc();

  // Whitespace only across all scenes
  doc.scenes[0].narration = "                         ";
  doc.scenes[1].narration = "      ";
  let res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  assert.equal(res.passed, false);
  let narrObj = res.objectives.find((o) => o.id === "narration");
  assert.equal(narrObj.met, false);

  // Exactly 19 non-whitespace characters (below target of 20)
  doc.scenes[0].narration = "1234567890 123456789"; // 19 non-ws chars
  doc.scenes[1].narration = "";
  res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  narrObj = res.objectives.find((o) => o.id === "narration");
  assert.equal(narrObj.met, false);
  assert.equal(narrObj.current, 0);

  // Exactly 20 non-whitespace characters (meets target of 20)
  doc.scenes[0].narration = "1234567890 1234567890"; // 20 non-ws chars
  res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  narrObj = res.objectives.find((o) => o.id === "narration");
  assert.equal(narrObj.met, true);
  assert.equal(narrObj.current, 1);
});

test("4. Level 1 dialogue rejects empty or whitespace-only lines", () => {
  const doc = createPassingLevel1Doc();
  doc.scenes[0].dialogue = [{ id: "d1", speakerId: "maya", text: "     ", type: "speech" }];
  const res = validateChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);
  assert.equal(res.passed, false);
  const dlgObj = res.objectives.find((o) => o.id === "dialogue");
  assert.equal(dlgObj.met, false);
});

// -----------------------------------------------------------------------------
// 2. Level 2 Validation & Boundary Edge Cases
// -----------------------------------------------------------------------------
test("5. Level 2 passes when 2 distinct characters speak and use distinct expressions", () => {
  const doc = createPassingLevel2Doc();
  const res = validateChallengeStory(CHALLENGE_IDS.CHARACTERS_LIFE, doc);
  assert.equal(res.passed, true);
  assert.equal(res.summary.metCount, 3);
});

test("6. Level 2 fails if two placed characters have the same expression", () => {
  const doc = createPassingLevel2Doc();
  // Set both to "happy"
  doc.scenes[0].characters[0].expression = "happy";
  doc.scenes[0].characters[1].expression = "happy";
  const res = validateChallengeStory(CHALLENGE_IDS.CHARACTERS_LIFE, doc);
  assert.equal(res.passed, false);
  const exprObj = res.objectives.find((o) => o.id === "distinct-expressions");
  assert.equal(exprObj.met, false);
  assert.equal(exprObj.current, 1);
});

test("7. Level 2 fails if only one character has dialogue lines", () => {
  const doc = createPassingLevel2Doc();
  // Tariq has no dialogue line
  doc.scenes[0].dialogue = [
    { id: "d1", speakerId: "maya", text: "Line 1", type: "speech" },
    { id: "d2", speakerId: "maya", text: "Line 2", type: "speech" },
  ];
  const res = validateChallengeStory(CHALLENGE_IDS.CHARACTERS_LIFE, doc);
  assert.equal(res.passed, false);
  const dlgObj = res.objectives.find((o) => o.id === "character-dialogue");
  assert.equal(dlgObj.met, false);
  assert.equal(dlgObj.current, 1);
});

// -----------------------------------------------------------------------------
// 3. Level 3 Validation & Boundary Edge Cases
// -----------------------------------------------------------------------------
test("8. Level 3 passes with 3 scenes, 2 distinct backgrounds, and 2 distinct props", () => {
  const doc = createPassingLevel3Doc();
  const res = validateChallengeStory(CHALLENGE_IDS.BUILD_WORLD, doc);
  assert.equal(res.passed, true);
  assert.equal(res.summary.metCount, 3);
});

test("9. Level 3 fails if all scenes share the same background", () => {
  const doc = createPassingLevel3Doc();
  doc.scenes.forEach((s) => {
    s.background = "village-square";
  });
  const res = validateChallengeStory(CHALLENGE_IDS.BUILD_WORLD, doc);
  assert.equal(res.passed, false);
  const bgObj = res.objectives.find((o) => o.id === "distinct-backgrounds");
  assert.equal(bgObj.met, false);
  assert.equal(bgObj.current, 1);
});

test("10. Level 3 fails if only 1 prop is placed across the entire story", () => {
  const doc = createPassingLevel3Doc();
  doc.scenes[0].props = ["water-bucket"];
  doc.scenes[1].props = [];
  doc.scenes[2].props = [];
  const res = validateChallengeStory(CHALLENGE_IDS.BUILD_WORLD, doc);
  assert.equal(res.passed, false);
  const propObj = res.objectives.find((o) => o.id === "props-placed");
  assert.equal(propObj.met, false);
  assert.equal(propObj.current, 1);
});

// -----------------------------------------------------------------------------
// 4. Level 4 Validation & Graph Reachability
// -----------------------------------------------------------------------------
test("11. Level 4 passes with a branching scene and 2 reachable endings", () => {
  const doc = createPassingLevel4Doc();
  const res = validateChallengeStory(CHALLENGE_IDS.BIG_DECISION, doc);
  assert.equal(res.passed, true);
  assert.equal(res.summary.metCount, 3);
});

test("12. Level 4 fails if branch choices point to the same next scene", () => {
  const doc = createPassingLevel4Doc();
  doc.scenes[0].choices = [
    { id: "c1", text: "Farm path", targetSceneId: "scene_l4_farm" },
    { id: "c2", text: "Another farm path", targetSceneId: "scene_l4_farm" }, // duplicate destination
  ];
  const res = validateChallengeStory(CHALLENGE_IDS.BIG_DECISION, doc);
  assert.equal(res.passed, false);
  const targetObj = res.objectives.find((o) => o.id === "distinct-targets");
  assert.equal(targetObj.met, false);
  assert.equal(targetObj.current, 1);
});

test("13. Level 4 fails if one of the choices leads to an unreachably disconnected ending", () => {
  const doc = createPassingLevel4Doc();
  // Point choice 2 to a non-existent scene ID
  doc.scenes[0].choices[1].targetSceneId = "non_existent_scene";
  const res = validateChallengeStory(CHALLENGE_IDS.BIG_DECISION, doc);
  assert.equal(res.passed, false);
});

// -----------------------------------------------------------------------------
// 5. Level 5 Validation & Mastery Integration
// -----------------------------------------------------------------------------
test("14. Level 5 passes with >= 4 scenes, >= 3 narrated scenes, 2 speakers, and branching endings", () => {
  const doc = createPassingLevel5Doc();
  const res = validateChallengeStory(CHALLENGE_IDS.STORY_MASTER, doc);
  assert.equal(res.passed, true);
  assert.equal(res.summary.metCount, 4);
});

test("15. Level 5 fails if fewer than 3 scenes have meaningful narration >= 20 non-ws chars", () => {
  const doc = createPassingLevel5Doc();
  doc.scenes[1].narration = "Too short"; // < 20 non-ws
  doc.scenes[2].narration = "";
  const res = validateChallengeStory(CHALLENGE_IDS.STORY_MASTER, doc);
  assert.equal(res.passed, false);
  const narrObj = res.objectives.find((o) => o.id === "narration-depth");
  assert.equal(narrObj.met, false);
  assert.equal(narrObj.current, 2); // only scenes 0 and 3 qualify
});

// -----------------------------------------------------------------------------
// 6. Progressive Reward Calculations & Level Up Economics
// -----------------------------------------------------------------------------
test("16. calculatePlayerChallengeRewardUpdates handles progressive XP, coins, and level-ups", () => {
  const basePlayer = {
    name: "Alex",
    level: 1,
    xp: 80,
    coins: 50,
    badges: [],
    flags: {},
  };

  // Award Level 1: +25 XP, +10 coins -> 105 XP -> Level 2 -> +100 coin level-up bonus!
  const l1Reward = getChallengeById(CHALLENGE_IDS.STORY_BEGINS).reward;
  const outcome = calculatePlayerChallengeRewardUpdates(basePlayer, l1Reward, "2026-10-21T10:00:00.000Z");

  assert.equal(outcome.updates.xp, 105);
  assert.equal(outcome.updates.level, 2);
  assert.equal(outcome.grantSummary.leveledUp, true);
  assert.equal(outcome.grantSummary.coinBonus, 100);
  assert.equal(outcome.updates.coins, 160); // 50 + 10 + 100
  assert.equal(outcome.updates.flags.challenge_story_studio_lvl1_completed, true);
  assert.equal(outcome.updates.flags.challenge_story_studio_lvl1_completed_at, "2026-10-21T10:00:00.000Z");
  assert.ok(outcome.grantSummary.transactionId.startsWith("tx_sc_challenge_story_studio_lvl1_completed_"));
});

test("17. calculatePlayerChallengeRewardUpdates awards Story Master badge on Level 5 completion", () => {
  const basePlayer = {
    name: "Alex",
    level: 3,
    xp: 250,
    coins: 100,
    badges: ["apprentice_author"],
    flags: {},
  };

  const l5Reward = getChallengeById(CHALLENGE_IDS.STORY_MASTER).reward;
  const outcome = calculatePlayerChallengeRewardUpdates(basePlayer, l5Reward);

  assert.ok(outcome.updates.badges.includes("story_master"));
  assert.ok(outcome.updates.badges.includes("apprentice_author"));
  assert.equal(outcome.updates.flags.challenge_story_studio_lvl5_completed, true);
});

// -----------------------------------------------------------------------------
// 7. Synchronous Completion & Attempt Isolation
// -----------------------------------------------------------------------------
test("18. executeChallengeCompletionSync requires an active attempt and rejects untracked doc", () => {
  const storage = createMemoryStorage();
  const player = { name: "Tester", level: 1, xp: 0, coins: 0, badges: [], flags: {} };
  const doc = createPassingLevel1Doc();
  // Remove challenge metadata so doc is not tied to attempt
  doc.metadata = {};

  const res = executeChallengeCompletionSync(
    CHALLENGE_IDS.STORY_BEGINS,
    doc,
    player,
    () => {},
    { storage }
  );

  assert.equal(res.success, false);
  assert.ok(res.error.includes("No active challenge attempt was found"));
});

test("19. executeChallengeCompletionSync grants reward on first completion and unlocks Level 2", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  // Start Level 1 attempt
  const init = challengeStorage.loadProgress().progressState;
  const start = startChallengeAttempt(init, CHALLENGE_IDS.STORY_BEGINS);
  challengeStorage.saveProgress(start.progressState);

  const doc = createPassingLevel1Doc();
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);

  let committedUpdates = null;
  const mockCommit = (updates) => {
    committedUpdates = updates;
  };

  const player = { name: "Player1", level: 1, xp: 0, coins: 0, badges: [], flags: {} };

  const res = executeChallengeCompletionSync(
    CHALLENGE_IDS.STORY_BEGINS,
    doc,
    player,
    mockCommit,
    { storage }
  );

  assert.equal(res.success, true);
  assert.equal(res.rewarded, true);
  assert.equal(res.isReplay, false);
  assert.equal(res.grantSummary.xp, 25);
  assert.equal(res.grantSummary.coins, 10);
  assert.equal(committedUpdates.xp, 25);
  assert.equal(committedUpdates.coins, 10);
  assert.equal(committedUpdates.flags.challenge_story_studio_lvl1_completed, true);

  // Check progress model in storage: Level 1 completed, Level 2 unlocked!
  const freshProgress = challengeStorage.loadProgress().progressState;
  const l1Status = deriveChallengeStatus(CHALLENGE_IDS.STORY_BEGINS, freshProgress);
  const l2Status = deriveChallengeStatus(CHALLENGE_IDS.CHARACTERS_LIFE, freshProgress);
  assert.equal(l1Status, CHALLENGE_STATUSES.COMPLETED);
  assert.equal(l2Status, CHALLENGE_STATUSES.UNLOCKED);
});

test("20. Replaying a completed level does not grant duplicate rewards (idempotency)", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const init = challengeStorage.loadProgress().progressState;
  const start = startChallengeAttempt(init, CHALLENGE_IDS.STORY_BEGINS);
  challengeStorage.saveProgress(start.progressState);

  const doc = createPassingLevel1Doc();
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);

  let committedCalls = 0;
  const mockCommit = () => {
    committedCalls++;
  };

  const player = { name: "Player1", level: 1, xp: 0, coins: 0, badges: [], flags: {} };

  // First execution: rewarded
  const res1 = executeChallengeCompletionSync(
    CHALLENGE_IDS.STORY_BEGINS,
    doc,
    player,
    mockCommit,
    { storage }
  );
  assert.equal(res1.success, true);
  assert.equal(res1.rewarded, true);
  assert.equal(committedCalls, 1);

  // Second execution (replay): succeeds with replay message, zero rewards granted
  const res2 = executeChallengeCompletionSync(
    CHALLENGE_IDS.STORY_BEGINS,
    doc,
    player,
    mockCommit,
    { storage }
  );
  assert.equal(res2.success, true);
  assert.equal(res2.rewarded, false);
  assert.equal(res2.isReplay, true);
  assert.equal(committedCalls, 1); // No second commit call!
});

// -----------------------------------------------------------------------------
// 8. Cross-Tab Lock & Concurrent Execution
// -----------------------------------------------------------------------------
test("21. executeChallengeCompletion with lock prevents concurrent double-rewarding", async () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const init = challengeStorage.loadProgress().progressState;
  const start = startChallengeAttempt(init, CHALLENGE_IDS.STORY_BEGINS);
  challengeStorage.saveProgress(start.progressState);

  const doc = createPassingLevel1Doc();
  challengeStorage.saveChallengeStory(CHALLENGE_IDS.STORY_BEGINS, doc);

  let rewardCount = 0;
  let playerState = { name: "Player1", level: 1, xp: 0, coins: 0, badges: [], flags: {} };

  const commit = (updates) => {
    rewardCount++;
    playerState = { ...playerState, ...updates, flags: { ...playerState.flags, ...updates.flags } };
  };

  // Run two concurrent completions simultaneously
  const [resA, resB] = await Promise.all([
    executeChallengeCompletion(CHALLENGE_IDS.STORY_BEGINS, doc, playerState, commit, { storage }),
    executeChallengeCompletion(CHALLENGE_IDS.STORY_BEGINS, doc, playerState, commit, { storage }),
  ]);

  const outcomes = [resA, resB];
  const rewarded = outcomes.filter((r) => r.rewarded);
  const replayed = outcomes.filter((r) => r.isReplay);

  assert.equal(rewarded.length, 1, "Exactly one call receives rewards");
  assert.equal(replayed.length, 1, "The second concurrent call receives replay status");
  assert.equal(rewardCount, 1, "Player commit called exactly once");
});

test("22. Storage failure returns honest error and makes no false success claims", () => {
  const failingStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("Disk quota exceeded");
    },
  };

  const doc = createPassingLevel1Doc();
  const player = { name: "Player1", level: 1, xp: 0, coins: 0, badges: [], flags: {} };

  const res = executeChallengeCompletionSync(
    CHALLENGE_IDS.STORY_BEGINS,
    doc,
    player,
    () => {
      throw new Error("Profile write failed");
    },
    { storage: failingStorage }
  );

  assert.equal(res.success, false);
  assert.equal(res.rewarded, false);
  assert.ok(res.error.includes("Failed to persist"));
});
