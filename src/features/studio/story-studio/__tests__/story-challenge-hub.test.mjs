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
  getPrerequisiteChallenge,
} from "../data/storyChallenges.js";

import {
  CHALLENGE_STATUSES,
  completeChallengeAttempt,
  createInitialProgressState,
  deriveChallengeStatus,
  getAllChallengesProgress,
  getChallengeProgress,
  normalizeProgressState,
  startChallengeAttempt,
} from "../engine/storyChallengeProgress.js";

import {
  STORY_CHALLENGES_STORAGE_KEY,
  createStoryChallengeStorage,
} from "../engine/storyChallengeStorage.js";

import { validateStoryDocument } from "../engine/storyValidation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storyStudioRoot = resolve(__dirname, "..");
const readSource = (...p) => readFileSync(resolve(storyStudioRoot, ...p), "utf-8");

const workspaceJsx = readSource("components", "StoryStudioWorkspace.jsx");
const hubJsx = readSource("components", "StoryChallengeModal.jsx");
const libraryJsx = readSource("components", "StoryLibraryModal.jsx");
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
// 1. ENTRY POINT & WORKSPACE NAVIGATION CONTRACT
// -----------------------------------------------------------------------------

test("1.1 Workspace provides Challenges entry button alongside Stories and return link", () => {
  // Clear Challenges button with data-testid and aria-label
  assert.match(
    workspaceJsx,
    /data-testid="story-challenges-btn"/,
    "Workspace topbar contains Challenges entry button"
  );
  assert.match(
    workspaceJsx,
    /onClick=\{\(\) => setIsChallengesOpen\(true\)\}/,
    "Clicking Challenges button opens Challenge Hub modal"
  );

  // Stories library button preserved
  assert.match(
    workspaceJsx,
    /data-testid="story-library-btn"/,
    "Stories library button remains in topbar"
  );

  // Return to Creative Studio hub preserved
  assert.match(
    workspaceJsx,
    /<Link\s+to="\/world\/studio"\s+className="story-back-btn"/,
    "Return to Creative Studio link remains intact"
  );

  // Challenge level indicator pill rendered when editing a challenge story
  assert.match(
    workspaceJsx,
    /data-testid="story-challenge-level-indicator"/,
    "Renders level indicator when an active challenge is loaded"
  );
});

test("1.2 Challenge Modal and Story Library Modal have two-way navigation", () => {
  // Challenge Hub modal provides link to open Story Library
  assert.match(
    hubJsx,
    /data-testid="challenge-switch-to-library-btn"/,
    "Challenge Hub provides return path to Story Library"
  );

  // Story Library modal provides link to open Challenges
  assert.match(
    libraryJsx,
    /data-testid="story-library-open-challenges-btn"/,
    "Story Library provides direct switch to Challenge Hub"
  );
});

test("1.3 Hub layout and styling contract in story-studio.css", () => {
  assert.match(studioCss, /\.story-challenges-btn/, "Defines Challenges topbar button");
  assert.match(studioCss, /\.story-challenge-dialog/, "Defines Challenge modal dialog");
  assert.match(studioCss, /\.story-challenge-sidebar/, "Defines roadmap sidebar column");
  assert.match(studioCss, /\.story-challenge-ladder/, "Defines roadmap level ladder");
  assert.match(studioCss, /\.story-challenge-ladder-item--locked/, "Defines locked level item styling");
  assert.match(studioCss, /\.story-challenge-ladder-item--completed/, "Defines completed level item styling");
  assert.match(studioCss, /\.story-challenge-ladder-item--progress/, "Defines in-progress level item styling");
  assert.match(studioCss, /\.story-challenge-lock-banner/, "Defines lock explanation banner");
  assert.match(studioCss, /\.story-challenge-objective-card/, "Defines objective card");
  assert.match(studioCss, /\.story-challenge-reward-card/, "Defines reward preview card");

  // Responsive breakpoint for small screens
  assert.match(studioCss, /@media\s*\(max-width:\s*768px\)/, "Includes mobile/tablet responsive layout");
});

// -----------------------------------------------------------------------------
// 2. HUB BEHAVIOR: LOAD, STATE DERIVATION, AND PERSISTENT ATTEMPTS
// -----------------------------------------------------------------------------

test("2.1 Empty storage initializes clean hub state with Level 1 available and Levels 2-5 locked", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const loadRes = challengeStorage.loadProgress();
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.empty, true);

  const progress = loadRes.progressState;
  const all = getAllChallengesProgress(progress);

  assert.equal(all.length, 5);
  assert.equal(all[0].status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(all[0].isLocked, false);

  for (let i = 1; i < 5; i++) {
    assert.equal(all[i].status, CHALLENGE_STATUSES.LOCKED);
    assert.equal(all[i].isLocked, true);
  }
});

test("2.2 Starting a challenge creates persistent attempt and starter document with schema-safe metadata", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  const progress = challengeStorage.loadProgress().progressState;
  const startRes = startChallengeAttempt(progress, "story-begins");

  assert.equal(startRes.ok, true);
  assert.equal(startRes.isResume, false);
  assert.ok(startRes.attempt.id);

  // Save progress
  challengeStorage.saveProgress(startRes.progressState);

  // Generate starter story
  const starterDoc = createChallengeStarterStory("story-begins", {
    attemptId: startRes.attempt.id,
  });
  const check = validateStoryDocument(starterDoc);
  assert.equal(check.ok, true, "Starter document is 100% valid under Story Studio schema");
  assert.equal(starterDoc.metadata.challengeId, "story-begins");
  assert.equal(starterDoc.metadata.challengeLevel, 1);
  assert.equal(starterDoc.metadata.attemptId, startRes.attempt.id);

  // Save challenge story
  challengeStorage.saveChallengeStory("story-begins", starterDoc);
  assert.equal(challengeStorage.hasChallengeStory("story-begins"), true);

  // Re-loading from storage resumes the exact attempt
  const reloadedStorage = createStoryChallengeStorage({ storage });
  const freshProgress = reloadedStorage.loadProgress().progressState;
  const resumeRes = startChallengeAttempt(freshProgress, "story-begins");

  assert.equal(resumeRes.ok, true);
  assert.equal(resumeRes.isResume, true);
  assert.equal(resumeRes.attempt.id, startRes.attempt.id);
});

test("2.3 Completed challenges remain completed after storage reload and browser refresh simulation", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  // Start and complete Level 1
  let progress = challengeStorage.loadProgress().progressState;
  const { progressState: inProgress } = startChallengeAttempt(progress, "story-begins");
  const completionRes = completeChallengeAttempt(inProgress, "story-begins", {
    evaluationResult: { eligibleForCompletion: true },
    now: "2026-10-21T09:30:00.000Z",
  });
  challengeStorage.saveProgress(completionRes.progressState);

  // Simulate complete app reload / new storage instance
  const freshStorageAdapter = createStoryChallengeStorage({ storage });
  const reloadedProgress = freshStorageAdapter.loadProgress().progressState;

  const lvl1Progress = getChallengeProgress(reloadedProgress, "story-begins");
  assert.equal(lvl1Progress.status, CHALLENGE_STATUSES.COMPLETED);
  assert.equal(lvl1Progress.isCompleted, true);
  assert.equal(lvl1Progress.record.completedAt, "2026-10-21T09:30:00.000Z");
  assert.equal(lvl1Progress.rewardRecord.awarded, false);
  assert.equal(lvl1Progress.rewardRecord.badgeId, "story_starter");

  // Level 2 is now unlocked
  const lvl2Progress = getChallengeProgress(reloadedProgress, "characters-life");
  assert.equal(lvl2Progress.status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(lvl2Progress.isLocked, false);

  // Levels 3 to 5 remain locked
  assert.equal(getChallengeProgress(reloadedProgress, "build-world").status, CHALLENGE_STATUSES.LOCKED);
  assert.equal(getChallengeProgress(reloadedProgress, "big-decision").status, CHALLENGE_STATUSES.LOCKED);
  assert.equal(getChallengeProgress(reloadedProgress, "story-master").status, CHALLENGE_STATUSES.LOCKED);
});

test("2.4 Replaying a completed challenge is idempotent and preserves earned rewards without duplication", () => {
  const storage = createMemoryStorage();
  const challengeStorage = createStoryChallengeStorage({ storage });

  let progress = challengeStorage.loadProgress().progressState;
  const { progressState: inProgress } = startChallengeAttempt(progress, "story-begins");
  const { progressState: completedState } = completeChallengeAttempt(inProgress, "story-begins", {
    evaluationResult: { eligibleForCompletion: true },
    now: "2026-10-21T10:00:00.000Z",
  });
  challengeStorage.saveProgress(completedState);

  // User launches replay
  const replayStart = startChallengeAttempt(completedState, "story-begins");
  assert.equal(replayStart.ok, true);

  // User finishes replay
  const replayCompletion = completeChallengeAttempt(replayStart.progressState, "story-begins", {
    evaluationResult: { eligibleForCompletion: true },
    now: "2026-10-21T11:00:00.000Z",
  });

  assert.equal(replayCompletion.ok, true);
  assert.equal(replayCompletion.isReplay, true);
  // Initial completedAt is preserved
  assert.equal(replayCompletion.completedAt, "2026-10-21T10:00:00.000Z");
  assert.equal(replayCompletion.rewardRecord.xp, 25);
});

// -----------------------------------------------------------------------------
// 3. PREREQUISITE AND LOCK EXPLANATION INTEGRATION
// -----------------------------------------------------------------------------

test("3.1 Locked levels clearly identify the required prerequisite challenge", () => {
  for (const challenge of CHALLENGES) {
    if (challenge.prerequisiteId) {
      const prereq = getPrerequisiteChallenge(challenge.id);
      assert.ok(prereq, `Prerequisite exists for "${challenge.id}"`);
      assert.equal(prereq.level, challenge.level - 1);
      assert.ok(prereq.title);
    }
  }
});

test("3.2 Hub correctly derives lock states even if storage holds tampered data", () => {
  const tamperedState = createInitialProgressState();
  // Fraudulently mark Level 5 as in-progress
  tamperedState.challenges["story-master"].status = CHALLENGE_STATUSES.IN_PROGRESS;

  const derived = deriveChallengeStatus("story-master", tamperedState);
  assert.equal(derived, CHALLENGE_STATUSES.LOCKED, "Locked status is enforced because Level 4 is incomplete");

  const normalized = normalizeProgressState(tamperedState);
  assert.equal(normalized.challenges["story-master"].status, CHALLENGE_STATUSES.LOCKED);
});

test("3.3 Corrupted storage data does not show fabricated success states or crash", () => {
  const storage = createMemoryStorage({
    [STORY_CHALLENGES_STORAGE_KEY]: "{corrupt-non-json-data",
  });
  const challengeStorage = createStoryChallengeStorage({ storage });

  const loadRes = challengeStorage.loadProgress();
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.progressState.schemaVersion, 1);
  assert.equal(loadRes.progressState.challenges["story-begins"].status, CHALLENGE_STATUSES.UNLOCKED);
  assert.equal(loadRes.progressState.challenges["characters-life"].status, CHALLENGE_STATUSES.LOCKED);
});
