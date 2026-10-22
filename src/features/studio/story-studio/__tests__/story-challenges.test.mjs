import test from "node:test";
import assert from "node:assert/strict";

import {
  CHALLENGES,
  CHALLENGE_IDS,
  CHALLENGE_ORDER,
  createChallengeStarterStory,
  getAllChallenges,
  getChallengeById,
  getChallengeByLevel,
  getNextChallenge,
  getPrerequisiteChallenge,
} from "../data/storyChallenges.js";

import {
  evaluateBranchingChoices,
  evaluateChallenge,
  evaluateCharacterDialogue,
  evaluateDistinctBackgrounds,
  evaluateDistinctCharacters,
  evaluateDistinctChoiceTargets,
  evaluateDistinctExpressions,
  evaluateDialogue,
  evaluateNarration,
  evaluatePlacedCharacters,
  evaluateProps,
  evaluateReachableEndings,
  evaluateScenesCount,
} from "../engine/storyChallengeEngine.js";

import {
  CHALLENGE_PROGRESS_SCHEMA_VERSION,
  CHALLENGE_STATUSES,
  completeChallengeAttempt,
  createAttemptId,
  createInitialProgressState,
  deriveAllChallengeStatuses,
  deriveChallengeStatus,
  getActiveAttempt,
  getActiveChallenge,
  getAllChallengesProgress,
  getChallengeProgress,
  normalizeProgressState,
  recordChallengeEvaluation,
  recordChallengeRewardAwarded,
  startChallengeAttempt,
  validateProgressState,
} from "../engine/storyChallengeProgress.js";

import {
  STORY_CHALLENGES_BACKUP_KEY,
  STORY_CHALLENGES_STORAGE_KEY,
  STORY_CHALLENGE_DOC_PREFIX,
  createStoryChallengeStorage,
  deserializeProgress,
  getStoryChallengeDocKey,
  serializeProgress,
} from "../engine/storyChallengeStorage.js";

import {
  createCharacterPlacement,
  createChoiceItem,
  createDefaultScene,
  createDialogueLine,
  createSceneId,
  createStoryDocument,
  STORY_STORAGE_KEY,
} from "../engine/storySchema.js";
import { validateStoryDocument } from "../engine/storyValidation.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
    clear: () => {
      Object.keys(data).forEach((k) => delete data[k]);
    },
  };
}

// -----------------------------------------------------------------------------
// 1. CHALLENGE CATALOGUE
// -----------------------------------------------------------------------------

test("1.1 Catalogue contains exactly 5 challenges with ordered levels", () => {
  assert.equal(CHALLENGES.length, 5);
  assert.deepEqual(CHALLENGE_ORDER, [
    "story-begins",
    "characters-life",
    "build-world",
    "big-decision",
    "story-master",
  ]);

  CHALLENGES.forEach((challenge, idx) => {
    assert.equal(challenge.level, idx + 1);
    assert.ok(challenge.title);
    assert.ok(challenge.description);
    assert.ok(challenge.difficulty);
    assert.ok(challenge.badge && challenge.badge.name);
    assert.ok(challenge.reward && challenge.reward.xp > 0);
    assert.ok(challenge.reward.coins > 0);
    assert.ok(challenge.reward.flagKey);
    assert.ok(challenge.reward.completedAtKey);
    assert.ok(Array.isArray(challenge.orderedObjectives));
    assert.ok(challenge.orderedObjectives.length >= 3);
  });
});

test("1.2 Prerequisites form a strict, verified chain", () => {
  const lvl1 = getChallengeByLevel(1);
  const lvl2 = getChallengeByLevel(2);
  const lvl3 = getChallengeByLevel(3);
  const lvl4 = getChallengeByLevel(4);
  const lvl5 = getChallengeByLevel(5);

  assert.equal(lvl1.prerequisiteId, null);
  assert.equal(lvl2.prerequisiteId, lvl1.id);
  assert.equal(lvl3.prerequisiteId, lvl2.id);
  assert.equal(lvl4.prerequisiteId, lvl3.id);
  assert.equal(lvl5.prerequisiteId, lvl4.id);

  assert.equal(getPrerequisiteChallenge(lvl1.id), null);
  assert.equal(getPrerequisiteChallenge(lvl2.id)?.id, lvl1.id);
  assert.equal(getNextChallenge(lvl1.id)?.id, lvl2.id);
  assert.equal(getNextChallenge(lvl5.id), null);
});

test("1.3 Query functions return null for invalid inputs", () => {
  assert.equal(getChallengeById(null), null);
  assert.equal(getChallengeById("non-existent"), null);
  assert.equal(getChallengeByLevel(0), null);
  assert.equal(getChallengeByLevel(6), null);
  assert.equal(getChallengeByLevel("invalid"), null);
});

test("1.4 Starter story generators produce 100% valid StoryDocuments without schema violations", () => {
  for (const challenge of CHALLENGES) {
    const doc = createChallengeStarterStory(challenge.id, {
      attemptId: "test_attempt_123",
      author: "Test Explorer",
    });

    const check = validateStoryDocument(doc);
    assert.ok(
      check.ok,
      `Starter story for "${challenge.id}" failed schema validation: ${check.errors.join("; ")}`
    );

    assert.equal(doc.metadata.challengeId, challenge.id);
    assert.equal(doc.metadata.challengeLevel, challenge.level);
    assert.equal(doc.metadata.attemptId, "test_attempt_123");
    assert.equal(doc.author, "Test Explorer");
  }
});

// -----------------------------------------------------------------------------
// 2. OBJECTIVE EVALUATION ENGINE
// -----------------------------------------------------------------------------

test("2.1 Level 1 (A Story Begins) objective evaluation", () => {
  const challenge = getChallengeById(CHALLENGE_IDS.STORY_BEGINS);

  // Incomplete: only 1 scene, empty narration, no dialogue
  const starter = createChallengeStarterStory(CHALLENGE_IDS.STORY_BEGINS);
  const res1 = evaluateChallenge(challenge, starter);
  assert.equal(res1.eligibleForCompletion, false);
  assert.equal(res1.objectives.find((o) => o.id === "scenes-count").met, false);

  // Complete story
  const scene1 = createDefaultScene({
    name: "Scene 1",
    narration: "A brand new story begins in the lively village square.",
    characters: [
      createCharacterPlacement({ characterId: "maya", slot: "left" }),
    ],
    dialogue: [
      createDialogueLine({ speakerId: "maya", text: "Look at the fountain!" }),
    ],
  });
  const scene2 = createDefaultScene({
    name: "Scene 2",
    narration: "The evening breeze whispers through the trees.",
  });

  const completeStory = createStoryDocument({ scenes: [scene1, scene2] });
  const res2 = evaluateChallenge(challenge, completeStory);
  assert.equal(res2.eligibleForCompletion, true);
  assert.equal(res2.summary.metCount, 4);
  assert.equal(res2.summary.percentComplete, 100);
});

test("2.2 Whitespace-only text is rejected by narration and dialogue evaluators", () => {
  const blankScene = createDefaultScene({
    narration: "    \n   ",
    dialogue: [createDialogueLine({ speakerId: "maya", text: "   " })],
  });
  const doc = createStoryDocument({ scenes: [blankScene] });

  const narrRes = evaluateNarration(doc, { minChars: 15 });
  assert.equal(narrRes.met, false);

  const diagRes = evaluateDialogue(doc, { minLines: 1 });
  assert.equal(diagRes.met, false);
});

test("2.3 Level 2 (Bring Characters to Life) distinct character, expression, and dialogue checks", () => {
  const challenge = getChallengeById(CHALLENGE_IDS.CHARACTERS_LIFE);

  // Scene with 2 characters, distinct expressions, and dialogue from both
  const s1 = createDefaultScene({
    characters: [
      createCharacterPlacement({
        characterId: "maya",
        slot: "left",
        expression: "happy",
      }),
      createCharacterPlacement({
        characterId: "tariq",
        slot: "right",
        expression: "thoughtful",
      }),
    ],
    dialogue: [
      createDialogueLine({ speakerId: "maya", text: "Hello Tariq!" }),
      createDialogueLine({ speakerId: "tariq", text: "Good morning Maya." }),
    ],
  });

  const doc = createStoryDocument({ scenes: [s1] });
  const res = evaluateChallenge(challenge, doc);
  assert.equal(res.eligibleForCompletion, true);

  // Narrator line does NOT count as a character dialogue speaker
  const s2 = createDefaultScene({
    characters: [createCharacterPlacement({ characterId: "maya", slot: "left" })],
    dialogue: [
      createDialogueLine({ speakerId: "maya", text: "Hello!" }),
      createDialogueLine({ speakerId: "narrator", text: "They spoke warmly." }),
    ],
  });
  const doc2 = createStoryDocument({ scenes: [s2] });
  const charDiagRes = evaluateCharacterDialogue(doc2, { minSpeakers: 2 });
  assert.equal(charDiagRes.met, false);
  assert.equal(charDiagRes.current, 1);
});

test("2.4 Level 3 (Build the World) background and props checks", () => {
  const challenge = getChallengeById(CHALLENGE_IDS.BUILD_WORLD);

  const s1 = createDefaultScene({
    background: "village-square",
    props: ["water-bucket"],
  });
  const s2 = createDefaultScene({
    background: "starry-night",
    props: ["lantern"],
  });
  const s3 = createDefaultScene({
    background: "water-well",
    props: [],
  });

  const doc = createStoryDocument({ scenes: [s1, s2, s3] });
  const res = evaluateChallenge(challenge, doc);
  assert.equal(res.eligibleForCompletion, true);

  // Missing props
  const docNoProps = createStoryDocument({
    scenes: [
      createDefaultScene({ background: "village-square" }),
      createDefaultScene({ background: "starry-night" }),
      createDefaultScene({ background: "water-well" }),
    ],
  });
  const resProps = evaluateProps(docNoProps, { minProps: 2 });
  assert.equal(resProps.met, false);
  assert.equal(resProps.current, 0);
});

test("2.5 Level 4 (The Big Decision) branching choices and reachable endings", () => {
  const challenge = getChallengeById(CHALLENGE_IDS.BIG_DECISION);

  const s1Id = createSceneId();
  const s2Id = createSceneId();
  const s3Id = createSceneId();

  const s1 = createDefaultScene({
    id: s1Id,
    name: "Fork",
    choices: [
      createChoiceItem({ text: "Left Path", targetSceneId: s2Id }),
      createChoiceItem({ text: "Right Path", targetSceneId: s3Id }),
    ],
  });

  const s2 = createDefaultScene({
    id: s2Id,
    name: "Ending Left",
    isEnding: true,
  });

  const s3 = createDefaultScene({
    id: s3Id,
    name: "Ending Right",
    isEnding: true,
  });

  const branchingDoc = createStoryDocument({ scenes: [s1, s2, s3] });
  const res = evaluateChallenge(challenge, branchingDoc);
  assert.equal(res.eligibleForCompletion, true);

  // Target pointing to non-existent scene
  const sBroken = createDefaultScene({
    id: s1Id,
    choices: [
      createChoiceItem({ text: "Bad Path", targetSceneId: "scene-does-not-exist" }),
      createChoiceItem({ text: "Other Path", targetSceneId: s2Id }),
    ],
  });
  const brokenDoc = createStoryDocument({ scenes: [sBroken, s2] });
  const targetsRes = evaluateDistinctChoiceTargets(brokenDoc, { minTargets: 2 });
  assert.equal(targetsRes.met, false);
  assert.equal(targetsRes.current, 1);
});

test("2.6 Level 5 (The Story Master) comprehensive criteria", () => {
  const challenge = getChallengeById(CHALLENGE_IDS.STORY_MASTER);

  const s1Id = createSceneId();
  const s2Id = createSceneId();
  const s3Id = createSceneId();
  const s4Id = createSceneId();

  const s1 = createDefaultScene({
    id: s1Id,
    name: "Beginning",
    narration: "A legendary adventure starts across the sunlit valley.",
    characters: [
      createCharacterPlacement({ characterId: "maya", slot: "left" }),
      createCharacterPlacement({ characterId: "tariq", slot: "right" }),
    ],
    dialogue: [
      createDialogueLine({ speakerId: "maya", text: "Are you ready, Tariq?" }),
      createDialogueLine({ speakerId: "tariq", text: "I have packed our tools." }),
    ],
    choices: [
      createChoiceItem({ text: "Go to Forest", targetSceneId: s2Id }),
      createChoiceItem({ text: "Go to Mountain", targetSceneId: s3Id }),
    ],
  });

  const s2 = createDefaultScene({
    id: s2Id,
    name: "Forest Branch",
    narration: "The tall pine trees provide shade along the forest path.",
    isEnding: true,
  });

  const s3 = createDefaultScene({
    id: s3Id,
    name: "Mountain Branch",
    narration: "The rocky mountain ascent requires careful footing.",
    isEnding: true,
  });

  const s4 = createDefaultScene({
    id: s4Id,
    name: "Secret Grove",
    narration: "A quiet grove hidden deep in the forest.",
  });

  const doc = createStoryDocument({ scenes: [s1, s2, s3, s4] });
  const res = evaluateChallenge(challenge, doc);
  assert.equal(res.eligibleForCompletion, true);
  assert.equal(res.summary.percentComplete, 100);
});

test("2.7 Evaluator safely handles null and empty inputs without throwing", () => {
  assert.doesNotThrow(() => {
    const res = evaluateChallenge(null, null);
    assert.equal(res.eligibleForCompletion, false);
  });

  assert.doesNotThrow(() => {
    const res = evaluateChallenge("unknown-challenge", {});
    assert.equal(res.eligibleForCompletion, false);
  });
});

// -----------------------------------------------------------------------------
// 3. PROGRESS DATA MODEL & STATE TRANSITIONS
// -----------------------------------------------------------------------------

test("3.1 Initial progress state starts Level 1 unlocked, Levels 2-5 locked", () => {
  const state = createInitialProgressState();
  assert.equal(state.schemaVersion, CHALLENGE_PROGRESS_SCHEMA_VERSION);
  assert.equal(state.activeChallengeId, null);
  assert.equal(state.activeAttemptId, null);

  assert.equal(state.challenges["story-begins"].status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(state.challenges["characters-life"].status, CHALLENGE_STATUSES.LOCKED);
  assert.equal(state.challenges["build-world"].status, CHALLENGE_STATUSES.LOCKED);
  assert.equal(state.challenges["big-decision"].status, CHALLENGE_STATUSES.LOCKED);
  assert.equal(state.challenges["story-master"].status, CHALLENGE_STATUSES.LOCKED);

  const statuses = deriveAllChallengeStatuses(state);
  assert.equal(statuses["story-begins"], CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(statuses["characters-life"], CHALLENGE_STATUSES.LOCKED);
});

test("3.2 deriveChallengeStatus strictly enforces prerequisites and ignores corrupt status fields", () => {
  const corruptState = createInitialProgressState();
  // Fraudulent claim that Level 4 is unlocked while Level 1 is incomplete
  corruptState.challenges["big-decision"].status = CHALLENGE_STATUSES.UNLOCKED;

  const derived = deriveChallengeStatus("big-decision", corruptState);
  assert.equal(derived, CHALLENGE_STATUSES.LOCKED);

  // Normalization fixes the fraudulent field
  const normalized = normalizeProgressState(corruptState);
  assert.equal(normalized.challenges["big-decision"].status, CHALLENGE_STATUSES.LOCKED);
});

test("3.3 Cannot start locked challenge", () => {
  const state = createInitialProgressState();
  const res = startChallengeAttempt(state, "characters-life");
  assert.equal(res.ok, false);
  assert.match(res.error, /locked/i);
});

test("3.4 Starting unlocked challenge creates persistent attempt and transitions to in-progress", () => {
  const state = createInitialProgressState();
  const res = startChallengeAttempt(state, "story-begins");

  assert.equal(res.ok, true);
  assert.equal(res.isResume, false);
  assert.ok(res.attempt.id);
  assert.equal(res.attempt.challengeId, "story-begins");

  const nextState = res.progressState;
  assert.equal(nextState.activeChallengeId, "story-begins");
  assert.equal(nextState.activeAttemptId, res.attempt.id);
  assert.equal(nextState.challenges["story-begins"].status, CHALLENGE_STATUSES.IN_PROGRESS);
  assert.equal(nextState.challenges["story-begins"].attemptsCount, 1);
});

test("3.5 Resuming active challenge does not duplicate attempts", () => {
  const state = createInitialProgressState();
  const first = startChallengeAttempt(state, "story-begins");
  const attemptId = first.attempt.id;

  // Re-start without forceNew
  const second = startChallengeAttempt(first.progressState, "story-begins");
  assert.equal(second.ok, true);
  assert.equal(second.isResume, true);
  assert.equal(second.attempt.id, attemptId);
  assert.equal(second.progressState.challenges["story-begins"].attemptsCount, 1);
});

test("3.6 Recording evaluation updates objective metrics without completing", () => {
  const state = createInitialProgressState();
  const { progressState } = startChallengeAttempt(state, "story-begins");

  const evalReport = {
    eligibleForCompletion: false,
    objectives: [{ id: "scenes-count", met: false, current: 1, target: 2 }],
    summary: { metCount: 0, totalCount: 4, percentComplete: 0 },
  };

  const recorded = recordChallengeEvaluation(progressState, "story-begins", evalReport);
  assert.equal(recorded.challenges["story-begins"].status, CHALLENGE_STATUSES.IN_PROGRESS);
  assert.equal(recorded.challenges["story-begins"].completedAt, null);
  assert.equal(recorded.challenges["story-begins"].evaluation.passed, false);
});

test("3.7 Completing challenge unlocks the next challenge and records immutable reward record", () => {
  const state = createInitialProgressState();
  const { progressState } = startChallengeAttempt(state, "story-begins");

  const passingEval = {
    eligibleForCompletion: true,
    objectives: [],
    summary: { metCount: 4, totalCount: 4, percentComplete: 100 },
  };

  const completionRes = completeChallengeAttempt(progressState, "story-begins", {
    evaluationResult: passingEval,
    now: "2026-10-21T10:00:00.000Z",
  });

  assert.equal(completionRes.ok, true);
  assert.equal(completionRes.isReplay, false);
  assert.equal(completionRes.newlyUnlockedChallengeId, "characters-life");

  const finishedState = completionRes.progressState;
  assert.equal(finishedState.challenges["story-begins"].status, CHALLENGE_STATUSES.COMPLETED);
  assert.equal(finishedState.challenges["story-begins"].completedAt, "2026-10-21T10:00:00.000Z");

  // Level 2 is now unlocked!
  assert.equal(finishedState.challenges["characters-life"].status, CHALLENGE_STATUSES.UNLOCKED);

  // Reward record is sealed
  assert.equal(completionRes.rewardRecord.awarded, false);
  assert.equal(completionRes.rewardRecord.xp, 25);
  assert.equal(completionRes.rewardRecord.coins, 10);
  assert.equal(completionRes.rewardRecord.badgeId, "story_starter");

  // Replay does not duplicate rewards or change completion timestamp
  const replayRes = completeChallengeAttempt(finishedState, "story-begins", {
    evaluationResult: passingEval,
    now: "2026-10-21T12:00:00.000Z",
  });
  assert.equal(replayRes.ok, true);
  assert.equal(replayRes.isReplay, true);
  assert.equal(replayRes.completedAt, "2026-10-21T10:00:00.000Z");
});

test("3.8 Reward claim immutability", () => {
  const state = createInitialProgressState();
  const { progressState } = startChallengeAttempt(state, "story-begins");
  const { progressState: completedState } = completeChallengeAttempt(
    progressState,
    "story-begins",
    {
      evaluationResult: { eligibleForCompletion: true },
    }
  );

  const claimRes = recordChallengeRewardAwarded(completedState, "story-begins", {
    grantSummary: { xp: 50, coins: 25, leveledUp: false },
    now: "2026-10-21T10:05:00.000Z",
  });

  assert.equal(claimRes.ok, true);
  assert.equal(claimRes.alreadyAwarded, false);
  assert.equal(claimRes.rewardRecord.awarded, true);
  assert.equal(claimRes.rewardRecord.awardedAt, "2026-10-21T10:05:00.000Z");

  // Subsequent claim call does not re-award
  const secondClaim = recordChallengeRewardAwarded(claimRes.progressState, "story-begins");
  assert.equal(secondClaim.alreadyAwarded, true);
});

test("3.9 Query helpers return clean structured progress summaries", () => {
  const state = createInitialProgressState();
  const single = getChallengeProgress(state, "story-begins");
  assert.equal(single.challenge.id, "story-begins");
  assert.equal(single.status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(single.isLocked, false);
  assert.equal(single.isCompleted, false);

  const all = getAllChallengesProgress(state);
  assert.equal(all.length, 5);
  assert.equal(all[0].status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(all[1].status, CHALLENGE_STATUSES.LOCKED);
});

// -----------------------------------------------------------------------------
// 4. STORAGE & DEFENSIVE RECOVERY
// -----------------------------------------------------------------------------

test("4.1 Serialization and deserialization roundtrip", () => {
  const initial = createInitialProgressState();
  const serialized = serializeProgress(initial);
  assert.equal(serialized.ok, true);

  const deserialized = deserializeProgress(serialized.text);
  assert.equal(deserialized.ok, true);
  assert.equal(deserialized.progressState.schemaVersion, 1);
  assert.equal(deserialized.progressState.challenges["story-begins"].status, CHALLENGE_STATUSES.UNLOCKED);
});

test("4.2 Deserialization handles malformed JSON without throwing", () => {
  const res = deserializeProgress("not-json-text{{{");
  assert.equal(res.ok, false);
  assert.equal(res.code, "malformed_json");
});

test("4.3 createStoryChallengeStorage loads, saves, and rotates backups", () => {
  const storage = memoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const loadEmpty = challengeStorage.loadProgress();
  assert.equal(loadEmpty.ok, true);
  assert.equal(loadEmpty.empty, true);

  // Save first state
  const state1 = createInitialProgressState();
  state1.activeChallengeId = "story-begins";
  challengeStorage.saveProgress(state1);

  assert.ok(storage.getItem(STORY_CHALLENGES_STORAGE_KEY));

  // Save second state: primary should rotate to backup
  const state2 = { ...state1, activeChallengeId: "characters-life" };
  challengeStorage.saveProgress(state2);

  assert.ok(storage.getItem(STORY_CHALLENGES_BACKUP_KEY));
  const backupText = storage.getItem(STORY_CHALLENGES_BACKUP_KEY);
  assert.ok(backupText.includes("story-begins"));
});

test("4.4 Corrupted primary key recovers automatically from backup", () => {
  const storage = memoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const validState = createInitialProgressState();
  validState.activeChallengeId = "build-world";

  // Primary corrupted, backup holds valid data
  storage.setItem(STORY_CHALLENGES_STORAGE_KEY, "corrupt-data{{");
  storage.setItem(STORY_CHALLENGES_BACKUP_KEY, JSON.stringify(validState));

  const loadRes = challengeStorage.loadProgress();
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.restoredFromBackup, true);
  assert.equal(loadRes.progressState.activeChallengeId, "build-world");
});

test("4.5 Completely damaged storage safely recovers with clean initial state", () => {
  const storage = memoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  // Both corrupted
  storage.setItem(STORY_CHALLENGES_STORAGE_KEY, "corrupt-primary{{");
  storage.setItem(STORY_CHALLENGES_BACKUP_KEY, "corrupt-backup{{");

  const loadRes = challengeStorage.loadProgress();
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.recovered, true);
  assert.equal(loadRes.progressState.challenges["story-begins"].status, CHALLENGE_STATUSES.UNLOCKED);
});

test("4.6 Complete storage isolation from canonical draft and story library", () => {
  const storage = memoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  // Pre-populate canonical active story and library keys
  storage.setItem(STORY_STORAGE_KEY, JSON.stringify({ title: "My Personal Story" }));
  storage.setItem("skillverse_story_studio_library_v1", JSON.stringify({ stories: [] }));

  // Perform challenge progress and challenge story save operations
  const state = createInitialProgressState();
  challengeStorage.saveProgress(state);

  const challengeDoc = createChallengeStarterStory("story-begins");
  challengeStorage.saveChallengeStory("story-begins", challengeDoc);

  // Assert canonical keys were untouched
  assert.equal(
    JSON.parse(storage.getItem(STORY_STORAGE_KEY)).title,
    "My Personal Story"
  );
  assert.equal(
    JSON.parse(storage.getItem("skillverse_story_studio_library_v1")).stories.length,
    0
  );

  // Assert challenge story was saved to isolated key
  const challengeKey = getStoryChallengeDocKey("story-begins");
  assert.ok(storage.getItem(challengeKey));
  assert.ok(challengeStorage.hasChallengeStory("story-begins"));

  const loadedStory = challengeStorage.loadChallengeStory("story-begins");
  assert.equal(loadedStory.ok, true);
  assert.equal(loadedStory.story.metadata.challengeId, "story-begins");
});
