/**
 * Story Studio Challenge Progress Engine (C1).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements the progress data model, state transitions, unlock rules,
 * persistent attempt tracking, story document association, completion records,
 * reward immutability, and defensive state recovery.
 */

import {
  CHALLENGES,
  CHALLENGE_IDS,
  CHALLENGE_ORDER,
  getAllChallenges,
  getChallengeById,
  getNextChallenge,
  getPrerequisiteChallenge,
} from "../data/storyChallenges.js";

export const CHALLENGE_PROGRESS_SCHEMA_VERSION = 1;
export const SUPPORTED_PROGRESS_SCHEMA_VERSIONS = Object.freeze([1]);

export const CHALLENGE_STATUSES = Object.freeze({
  LOCKED: "locked",
  UNLOCKED: "unlocked",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
});

/**
 * Creates a unique attempt ID.
 */
export function createAttemptId(challengeId) {
  const cleanId = String(challengeId || "challenge").replace(/[^a-zA-Z0-9_-]/g, "");
  const time = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `attempt_${cleanId}_${time}_${rand}`;
}

/**
 * Creates the initial, default progress state.
 * Level 1 begins unlocked; Levels 2 through 5 begin locked.
 *
 * @param {string} [now]
 * @returns {object} Initial progress state
 */
export function createInitialProgressState(now = new Date().toISOString()) {
  const challenges = {};

  for (const c of CHALLENGES) {
    const isFirst = c.id === CHALLENGE_IDS.STORY_BEGINS;
    challenges[c.id] = {
      id: c.id,
      level: c.level,
      status: isFirst ? CHALLENGE_STATUSES.UNLOCKED : CHALLENGE_STATUSES.LOCKED,
      startedAt: null,
      lastUpdatedAt: null,
      completedAt: null,
      activeAttemptId: null,
      attemptsCount: 0,
      evaluation: null,
      rewardRecord: null,
    };
  }

  return {
    schemaVersion: CHALLENGE_PROGRESS_SCHEMA_VERSION,
    activeChallengeId: null,
    activeAttemptId: null,
    challenges,
    attempts: {},
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Derives the authoritative challenge status from verified prerequisites and completion records.
 * Resists corrupted or tampered UI state.
 *
 * @param {string} challengeId
 * @param {object} progressState
 * @returns {string} One of CHALLENGE_STATUSES
 */
export function deriveChallengeStatus(challengeId, progressState) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return CHALLENGE_STATUSES.LOCKED;

  const challengeRecord = progressState?.challenges?.[challenge.id];

  // 1. If completedAt is recorded, it is definitively completed
  if (challengeRecord?.completedAt) {
    return CHALLENGE_STATUSES.COMPLETED;
  }

  // 2. Check prerequisite
  if (challenge.prerequisiteId) {
    const prereqRecord = progressState?.challenges?.[challenge.prerequisiteId];
    // Prerequisite MUST have completedAt
    if (!prereqRecord?.completedAt) {
      return CHALLENGE_STATUSES.LOCKED;
    }
  }

  // 3. If prerequisite is satisfied, check if an attempt has been started
  if (
    challengeRecord?.activeAttemptId ||
    challengeRecord?.startedAt ||
    challengeRecord?.status === CHALLENGE_STATUSES.IN_PROGRESS
  ) {
    return CHALLENGE_STATUSES.IN_PROGRESS;
  }

  // 4. Otherwise it is unlocked and ready to play
  return CHALLENGE_STATUSES.UNLOCKED;
}

/**
 * Computes authoritative statuses for all five challenges simultaneously.
 *
 * @param {object} progressState
 * @returns {object} Map of challengeId -> status
 */
export function deriveAllChallengeStatuses(progressState) {
  const statuses = {};
  for (const c of CHALLENGES) {
    statuses[c.id] = deriveChallengeStatus(c.id, progressState);
  }
  return statuses;
}

/**
 * Validates a progress state object.
 * Returns { ok: boolean, errors: string[] }. Never throws.
 */
export function validateProgressState(state) {
  const errors = [];
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return { ok: false, errors: ["Progress state must be a plain object"] };
  }

  if (state.schemaVersion !== CHALLENGE_PROGRESS_SCHEMA_VERSION) {
    errors.push(
      `Unsupported progress schemaVersion ${state.schemaVersion} (expected ${CHALLENGE_PROGRESS_SCHEMA_VERSION})`
    );
  }

  if (!state.challenges || typeof state.challenges !== "object") {
    errors.push("Progress state must have a challenges dictionary");
  } else {
    for (const id of CHALLENGE_ORDER) {
      const rec = state.challenges[id];
      if (!rec || typeof rec !== "object") {
        errors.push(`Missing challenge record for "${id}"`);
      }
    }
  }

  if (!state.attempts || typeof state.attempts !== "object") {
    errors.push("Progress state must have an attempts dictionary");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalizes and heals a progress state object, recovering from missing, malformed, or outdated data.
 * Guarantees a fully valid, consistent state. Input is never mutated.
 *
 * @param {object} raw
 * @param {string} [now]
 * @returns {object} Safe, normalized progress state
 */
export function normalizeProgressState(raw, now = new Date().toISOString()) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createInitialProgressState(now);
  }

  const v = raw.schemaVersion;
  if (!SUPPORTED_PROGRESS_SCHEMA_VERSIONS.includes(v)) {
    return createInitialProgressState(now);
  }

  const clean = JSON.parse(JSON.stringify(raw));
  const initial = createInitialProgressState(now);

  clean.schemaVersion = CHALLENGE_PROGRESS_SCHEMA_VERSION;
  clean.challenges = clean.challenges && typeof clean.challenges === "object" ? clean.challenges : {};
  clean.attempts = clean.attempts && typeof clean.attempts === "object" ? clean.attempts : {};

  // Ensure all challenges from the catalogue exist
  for (const c of CHALLENGES) {
    const existing = clean.challenges[c.id];
    if (!existing || typeof existing !== "object") {
      clean.challenges[c.id] = { ...initial.challenges[c.id] };
    } else {
      clean.challenges[c.id] = {
        id: c.id,
        level: c.level,
        status: existing.status ?? initial.challenges[c.id].status,
        startedAt: existing.startedAt ?? null,
        lastUpdatedAt: existing.lastUpdatedAt ?? null,
        completedAt: existing.completedAt ?? null,
        activeAttemptId: existing.activeAttemptId ?? null,
        attemptsCount: typeof existing.attemptsCount === "number" ? existing.attemptsCount : 0,
        evaluation: existing.evaluation ?? null,
        rewardRecord: existing.rewardRecord ?? null,
      };
    }
  }

  // Derive and enforce authoritative statuses in order
  for (const c of CHALLENGES) {
    clean.challenges[c.id].status = deriveChallengeStatus(c.id, clean);
  }

  // Validate activeAttemptId references
  for (const id of CHALLENGE_ORDER) {
    const rec = clean.challenges[id];
    if (rec.activeAttemptId && !clean.attempts[rec.activeAttemptId]) {
      rec.activeAttemptId = null;
      if (rec.status === CHALLENGE_STATUSES.IN_PROGRESS && !rec.completedAt) {
        rec.status = deriveChallengeStatus(id, clean);
      }
    }
  }

  if (clean.activeAttemptId && !clean.attempts[clean.activeAttemptId]) {
    clean.activeAttemptId = null;
  }

  clean.updatedAt = now;
  return clean;
}

/**
 * Starts or resumes a challenge attempt.
 * If an active attempt already exists for this challenge, resumes it without creating duplicates.
 *
 * @param {object} progressState
 * @param {string} challengeId
 * @param {object} [options]
 * @param {object} [options.storyDoc] - Optional story document to associate
 * @param {boolean} [options.forceNew=false] - If true, force-creates a fresh attempt
 * @param {string} [options.now]
 * @returns {object} { ok, progressState, attempt, isResume, error }
 */
export function startChallengeAttempt(
  progressState,
  challengeId,
  { storyDoc = null, forceNew = false, now = new Date().toISOString() } = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return {
      ok: false,
      error: `Unknown challenge: "${challengeId}"`,
      progressState,
    };
  }

  const normalized = normalizeProgressState(progressState, now);
  const currentStatus = deriveChallengeStatus(challenge.id, normalized);

  if (currentStatus === CHALLENGE_STATUSES.LOCKED) {
    return {
      ok: false,
      error: `Challenge "${challenge.title}" is locked. Complete its prerequisite first.`,
      progressState: normalized,
    };
  }

  const challengeRecord = normalized.challenges[challenge.id];

  // 1. Check for existing active attempt to resume
  if (!forceNew && challengeRecord.activeAttemptId && normalized.attempts[challengeRecord.activeAttemptId]) {
    const existingAttempt = normalized.attempts[challengeRecord.activeAttemptId];
    existingAttempt.lastUpdatedAt = now;
    if (storyDoc?.id) {
      existingAttempt.storyId = storyDoc.id;
    }

    challengeRecord.lastUpdatedAt = now;
    challengeRecord.status = challengeRecord.completedAt
      ? CHALLENGE_STATUSES.COMPLETED
      : CHALLENGE_STATUSES.IN_PROGRESS;

    normalized.activeChallengeId = challenge.id;
    normalized.activeAttemptId = existingAttempt.id;
    normalized.updatedAt = now;

    return {
      ok: true,
      progressState: normalized,
      attempt: { ...existingAttempt },
      isResume: true,
    };
  }

  // 2. Create fresh attempt
  const attemptId = createAttemptId(challenge.id);
  const storyId = storyDoc?.id || `story_challenge_${challenge.id}_${Date.now()}`;

  const newAttempt = {
    id: attemptId,
    challengeId: challenge.id,
    storyId,
    startedAt: now,
    lastUpdatedAt: now,
    completedAt: null,
  };

  normalized.attempts[attemptId] = newAttempt;

  challengeRecord.activeAttemptId = attemptId;
  challengeRecord.startedAt = challengeRecord.startedAt || now;
  challengeRecord.lastUpdatedAt = now;
  challengeRecord.attemptsCount = (challengeRecord.attemptsCount || 0) + 1;
  challengeRecord.status = challengeRecord.completedAt
    ? CHALLENGE_STATUSES.COMPLETED
    : CHALLENGE_STATUSES.IN_PROGRESS;

  normalized.activeChallengeId = challenge.id;
  normalized.activeAttemptId = attemptId;
  normalized.updatedAt = now;

  return {
    ok: true,
    progressState: normalized,
    attempt: { ...newAttempt },
    isResume: false,
  };
}

/**
 * Records an objective evaluation result for a challenge.
 * Updates objective progress and timestamps. Does not award rewards or mark complete.
 *
 * @param {object} progressState
 * @param {string} challengeId
 * @param {object} evaluationResult
 * @param {object} [options]
 * @param {string} [options.now]
 * @returns {object} Updated progress state
 */
export function recordChallengeEvaluation(
  progressState,
  challengeId,
  evaluationResult,
  { now = new Date().toISOString() } = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return progressState;

  const normalized = normalizeProgressState(progressState, now);
  const challengeRecord = normalized.challenges[challenge.id];

  challengeRecord.evaluation = {
    passed: Boolean(evaluationResult?.eligibleForCompletion),
    lastEvaluatedAt: now,
    objectives: Array.isArray(evaluationResult?.objectives) ? evaluationResult.objectives : [],
    summary: evaluationResult?.summary ?? null,
  };

  challengeRecord.lastUpdatedAt = now;

  if (challengeRecord.activeAttemptId && normalized.attempts[challengeRecord.activeAttemptId]) {
    normalized.attempts[challengeRecord.activeAttemptId].lastUpdatedAt = now;
  }

  normalized.updatedAt = now;
  return normalized;
}

/**
 * Completes a challenge attempt and records earned reward metadata.
 * Enforces requirement satisfaction and protects against duplicate reward granting.
 *
 * @param {object} progressState
 * @param {string} challengeId
 * @param {object} [options]
 * @param {object} [options.evaluationResult] - Evaluation report
 * @param {string} [options.now]
 * @returns {object} Result report with updated progressState
 */
export function completeChallengeAttempt(
  progressState,
  challengeId,
  { evaluationResult = null, now = new Date().toISOString() } = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return {
      ok: false,
      code: "unknown_challenge",
      message: `Unknown challenge: "${challengeId}"`,
      progressState,
    };
  }

  const normalized = normalizeProgressState(progressState, now);
  const challengeRecord = normalized.challenges[challenge.id];

  // 1. Verify eligibility
  const isEligible = evaluationResult
    ? Boolean(evaluationResult.eligibleForCompletion)
    : Boolean(challengeRecord.evaluation?.passed);

  if (!isEligible) {
    return {
      ok: false,
      code: "ineligible",
      message: `Challenge "${challenge.title}" requirements have not yet been satisfied.`,
      progressState: normalized,
    };
  }

  // 2. Safe replay handling: if already recorded as complete, do not duplicate reward record
  if (challengeRecord.completedAt) {
    if (challengeRecord.activeAttemptId && normalized.attempts[challengeRecord.activeAttemptId]) {
      normalized.attempts[challengeRecord.activeAttemptId].completedAt =
        normalized.attempts[challengeRecord.activeAttemptId].completedAt || now;
      normalized.attempts[challengeRecord.activeAttemptId].lastUpdatedAt = now;
    }

    normalized.updatedAt = now;

    return {
      ok: true,
      isReplay: true,
      message: `Challenge "${challenge.title}" replay complete. Rewards were already recorded.`,
      progressState: normalized,
      rewardRecord: challengeRecord.rewardRecord,
      completedAt: challengeRecord.completedAt,
    };
  }

  // 3. First-time completion
  challengeRecord.completedAt = now;
  challengeRecord.status = CHALLENGE_STATUSES.COMPLETED;
  challengeRecord.lastUpdatedAt = now;

  // Create immutable record of earned challenge rewards
  const rewardRecord = {
    awarded: false,
    awardedAt: null,
    xp: challenge.reward.xp,
    coins: challenge.reward.coins,
    badge: challenge.reward.badge,
    badgeId: challenge.reward.badgeId,
    flagKey: challenge.reward.flagKey,
    completedAtKey: challenge.reward.completedAtKey,
    completedAt: now,
  };

  challengeRecord.rewardRecord = rewardRecord;

  if (challengeRecord.activeAttemptId && normalized.attempts[challengeRecord.activeAttemptId]) {
    const attempt = normalized.attempts[challengeRecord.activeAttemptId];
    attempt.completedAt = now;
    attempt.lastUpdatedAt = now;
  }

  // Automatically compute and unlock next challenge in sequence
  const nextChallenge = getNextChallenge(challenge.id);
  let newlyUnlockedChallengeId = null;

  if (nextChallenge) {
    normalized.challenges[nextChallenge.id].status = CHALLENGE_STATUSES.UNLOCKED;
    newlyUnlockedChallengeId = nextChallenge.id;
  }

  normalized.updatedAt = now;

  return {
    ok: true,
    isReplay: false,
    message: `Challenge "${challenge.title}" completed successfully!`,
    progressState: normalized,
    rewardRecord,
    completedAt: now,
    newlyUnlockedChallengeId,
  };
}

/**
 * Records that rewards have been durably claimed in the player profile.
 * Immutably seals the rewardRecord.
 *
 * @param {object} progressState
 * @param {string} challengeId
 * @param {object} [options]
 * @param {object} [options.grantSummary] - Player reward grant summary
 * @param {string} [options.now]
 * @returns {object} { ok, progressState, alreadyAwarded }
 */
export function recordChallengeRewardAwarded(
  progressState,
  challengeId,
  { grantSummary = {}, now = new Date().toISOString() } = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return { ok: false, error: `Unknown challenge: "${challengeId}"`, progressState };
  }

  const normalized = normalizeProgressState(progressState, now);
  const challengeRecord = normalized.challenges[challenge.id];

  if (!challengeRecord.rewardRecord) {
    return {
      ok: false,
      error: `No reward record exists for challenge "${challenge.id}". Complete it first.`,
      progressState: normalized,
    };
  }

  if (challengeRecord.rewardRecord.awarded) {
    return {
      ok: true,
      alreadyAwarded: true,
      progressState: normalized,
      rewardRecord: challengeRecord.rewardRecord,
    };
  }

  challengeRecord.rewardRecord.awarded = true;
  challengeRecord.rewardRecord.awardedAt = now;
  challengeRecord.rewardRecord.grantSummary = { ...grantSummary };
  challengeRecord.lastUpdatedAt = now;
  normalized.updatedAt = now;

  return {
    ok: true,
    alreadyAwarded: false,
    progressState: normalized,
    rewardRecord: challengeRecord.rewardRecord,
  };
}

/**
 * Retrieves the active attempt for a challenge, or null.
 */
export function getActiveAttempt(progressState, challengeId) {
  if (!progressState || !challengeId) return null;
  const challengeRecord = progressState.challenges?.[challengeId];
  if (!challengeRecord?.activeAttemptId) return null;
  return progressState.attempts?.[challengeRecord.activeAttemptId] ?? null;
}

/**
 * Retrieves the currently active challenge definition, or null.
 */
export function getActiveChallenge(progressState) {
  if (!progressState?.activeChallengeId) return null;
  return getChallengeById(progressState.activeChallengeId);
}

/**
 * Returns a comprehensive status report for a single challenge.
 */
export function getChallengeProgress(progressState, challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return null;

  const normalized = normalizeProgressState(progressState);
  const record = normalized.challenges[challenge.id];
  const attempt = getActiveAttempt(normalized, challenge.id);
  const status = deriveChallengeStatus(challenge.id, normalized);

  return {
    challenge,
    status,
    record,
    attempt,
    evaluation: record.evaluation,
    rewardRecord: record.rewardRecord,
    isCompleted: status === CHALLENGE_STATUSES.COMPLETED,
    isLocked: status === CHALLENGE_STATUSES.LOCKED,
    isInProgress: status === CHALLENGE_STATUSES.IN_PROGRESS,
  };
}

/**
 * Returns progress reports for all five challenges in sequence.
 */
export function getAllChallengesProgress(progressState) {
  const normalized = normalizeProgressState(progressState);
  return CHALLENGES.map((c) => getChallengeProgress(normalized, c.id));
}
