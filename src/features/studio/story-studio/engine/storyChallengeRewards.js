/**
 * Story Studio Challenge Rewards & Progression Engine (C4).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements deterministic challenge completion validation, SkillVerse player progression,
 * cross-tab lock protection, stable transaction IDs, and idempotency safeguards.
 *
 * Completely isolated from World Builder and Sandbox storage.
 * Synchronizes with player profile key: "skillverse_save".
 */

import {
  getChallengeById,
  getNextChallenge,
} from "../data/storyChallenges.js";
import {
  completeChallengeAttempt,
  recordChallengeRewardAwarded,
} from "./storyChallengeProgress.js";
import { createStoryChallengeStorage } from "./storyChallengeStorage.js";
import { validateChallengeStory } from "./storyChallengeEngine.js";

export const STORY_CHALLENGE_LOCK_PREFIX = "skillverse_lock_story_challenge_";

/**
 * Returns canonical lock name for a challenge.
 * @param {string} challengeId
 * @returns {string}
 */
export function getStoryChallengeLockName(challengeId) {
  return `${STORY_CHALLENGE_LOCK_PREFIX}${challengeId || "challenge"}`;
}

/**
 * Retrieves the freshest player profile state from storage if available,
 * falling back to the provided in-memory player snapshot.
 * Guarantees that newer coin, XP, level, or flag changes are not overwritten.
 *
 * @param {object} fallbackPlayer - In-memory player state snapshot
 * @param {object} [storage] - Optional storage interface
 * @returns {object} Freshest available player profile state
 */
export function getFreshestPlayerState(fallbackPlayer, storage = undefined) {
  const store =
    storage !== undefined
      ? storage
      : typeof localStorage !== "undefined"
      ? localStorage
      : null;

  if (!store || typeof store.getItem !== "function") {
    return fallbackPlayer && typeof fallbackPlayer === "object" ? fallbackPlayer : {};
  }

  try {
    const raw = store.getItem("skillverse_save");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
    // If parse fails or storage throws, fallback safely
  }

  return fallbackPlayer && typeof fallbackPlayer === "object" ? fallbackPlayer : {};
}

/**
 * Checks whether the challenge has already been recorded as completed in the player profile.
 *
 * @param {object} player - Player profile state
 * @param {string} flagKey - Completion flag key
 * @param {object} [storage] - Optional storage interface
 * @returns {boolean} True if already recorded as completed
 */
export function isChallengeAlreadyCompleted(player, flagKey, storage = undefined) {
  if (!flagKey) return false;
  const effectivePlayer = getFreshestPlayerState(player, storage);
  return Boolean(effectivePlayer?.flags?.[flagKey]);
}

/**
 * Retrieves the ISO timestamp when the challenge was recorded as completed in player profile.
 *
 * @param {object} player - Player profile state
 * @param {string} completedAtKey - Completion timestamp key
 * @param {object} [storage] - Optional storage interface
 * @returns {string|null} ISO timestamp or null
 */
export function getChallengeCompletedAt(player, completedAtKey, storage = undefined) {
  if (!completedAtKey) return null;
  const effectivePlayer = getFreshestPlayerState(player, storage);
  return effectivePlayer?.flags?.[completedAtKey] || null;
}

/**
 * Generates a stable, unique reward transaction ID tied to player and challenge completion.
 *
 * @param {string} challengeId
 * @param {string} [timestamp]
 * @returns {string} Transaction ID
 */
export function generateRewardTransactionId(challengeId, timestamp = new Date().toISOString()) {
  const cleanId = String(challengeId || "challenge").replace(/[^a-zA-Z0-9_-]/g, "");
  const timeNum = Date.parse(timestamp) || Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `tx_sc_${cleanId}_${timeNum}_${rand}`;
}

/**
 * Computes deterministic player profile updates for granting challenge rewards.
 * Reuses the SkillVerse standard: 100 XP per level, with a 100-coin bonus on level-up.
 * Preserves all unrelated player profile fields (day, water, skills, english, etc.).
 *
 * @param {object} player - Current player profile
 * @param {object} rewardConfig - Challenge reward configuration
 * @param {string} [timestamp] - ISO timestamp string for completion record
 * @returns {object} Calculated updates and grant summary
 */
export function calculatePlayerChallengeRewardUpdates(
  player,
  rewardConfig,
  timestamp = new Date().toISOString()
) {
  const currentXP = Number.isFinite(player?.xp) ? player.xp : 0;
  const currentLevel = Number.isFinite(player?.level) && player.level > 0 ? player.level : 1;
  const currentCoins = Number.isFinite(player?.coins) ? player.coins : 0;

  const rewardXP = Number.isFinite(rewardConfig?.xp) ? Math.max(0, rewardConfig.xp) : 0;
  const rewardCoins = Number.isFinite(rewardConfig?.coins) ? Math.max(0, rewardConfig.coins) : 0;

  const newXP = currentXP + rewardXP;
  const newLevel = Math.floor(newXP / 100) + 1;
  const leveledUp = newLevel > currentLevel;
  const coinBonus = leveledUp ? 100 : 0;
  const newCoins = currentCoins + rewardCoins + coinBonus;

  const existingBadges = Array.isArray(player?.badges) ? player.badges : [];
  const badgeId = rewardConfig?.badgeId || rewardConfig?.badge;
  const newBadges =
    badgeId && !existingBadges.includes(badgeId)
      ? [...existingBadges, badgeId]
      : existingBadges;

  const transactionId = generateRewardTransactionId(rewardConfig?.flagKey || "challenge", timestamp);

  return {
    updates: {
      xp: newXP,
      level: newLevel,
      coins: newCoins,
      badges: newBadges,
      flags: {
        ...(rewardConfig?.flagKey ? { [rewardConfig.flagKey]: true } : {}),
        ...(rewardConfig?.completedAtKey ? { [rewardConfig.completedAtKey]: timestamp } : {}),
      },
    },
    grantSummary: {
      xp: rewardXP,
      coins: rewardCoins,
      badge: badgeId,
      leveledUp,
      newLevel,
      coinBonus,
      completedAt: timestamp,
      transactionId,
    },
  };
}

/**
 * In-process promise queue used as fallback when Web Locks API is unavailable.
 */
class InMemoryLockQueue {
  constructor() {
    this.queues = new Map();
  }

  acquire(lockName, callback) {
    const current = this.queues.get(lockName) || Promise.resolve();
    const next = current.catch(() => {}).then(() => callback());
    this.queues.set(lockName, next);
    return next;
  }
}

export const challengeLockQueue = new InMemoryLockQueue();

/**
 * Acquires a same-origin cross-tab lock using the Web Locks API if available,
 * or an explicit lock coordinator (for tests), or fallback in-process queue.
 *
 * @param {string} challengeId - Challenge ID
 * @param {Function} callback - Async critical section callback
 * @param {object} [lockCoordinator] - Optional custom lock coordinator
 * @returns {Promise<any>}
 */
export async function withStoryChallengeLock(
  challengeId,
  callback,
  lockCoordinator = undefined
) {
  if (typeof callback !== "function") {
    throw new Error("withStoryChallengeLock requires a callback function");
  }

  const lockName = getStoryChallengeLockName(challengeId);

  // 1. Explicit lock coordinator (e.g. mock Web Locks in tests)
  if (lockCoordinator && typeof lockCoordinator.request === "function") {
    return await lockCoordinator.request(lockName, callback);
  }

  // 2. Native Web Locks API supported in modern browsers
  if (
    typeof navigator !== "undefined" &&
    navigator?.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return await navigator.locks.request(lockName, { mode: "exclusive" }, callback);
  }

  // 3. Fallback to process-level promise queue
  return await challengeLockQueue.acquire(lockName, callback);
}

/**
 * Evaluates whether a challenge is eligible for reward granting,
 * taking into account objective validation and prior completion records.
 *
 * @param {object|string} challengeOrId
 * @param {object} doc
 * @param {object} [player]
 * @param {object} [storage]
 * @returns {object} Reward eligibility report
 */
export function evaluateChallengeRewardEligibility(
  challengeOrId,
  doc,
  player = null,
  storage = undefined
) {
  const challenge =
    typeof challengeOrId === "string" ? getChallengeById(challengeOrId) : challengeOrId;

  if (!challenge) {
    return {
      eligible: false,
      rewarded: false,
      isReplay: false,
      status: "unknown_challenge",
      reason: `Challenge not found: "${String(challengeOrId)}"`,
      validation: null,
      rewards: null,
    };
  }

  const validation = validateChallengeStory(challenge, doc);

  if (!validation.passed) {
    return {
      eligible: false,
      rewarded: false,
      isReplay: false,
      status: "ineligible",
      reason: "Challenge requirements are not yet satisfied.",
      remainingTasks: validation.summary.remainingTasks,
      validation,
      rewards: challenge.reward,
    };
  }

  const alreadyCompleted = isChallengeAlreadyCompleted(player, challenge.reward?.flagKey, storage);

  if (alreadyCompleted) {
    return {
      eligible: true,
      rewarded: false,
      isReplay: true,
      status: "already_completed",
      reason: "Challenge was previously completed. Replaying does not grant duplicate rewards.",
      validation,
      rewards: challenge.reward,
      completedAt: getChallengeCompletedAt(player, challenge.reward?.completedAtKey, storage),
    };
  }

  return {
    eligible: true,
    rewarded: true,
    isReplay: false,
    status: "eligible_for_reward",
    reason: "Challenge completed successfully! Eligible for one-time rewards.",
    validation,
    rewards: challenge.reward,
  };
}

/**
 * Executes challenge completion synchronously:
 * - Verifies story validity against real challenge schema.
 * - Re-reads freshest player state from storage to avoid stale closures.
 * - If already completed, returns replay outcome with 0 duplicate XP, coins, or badges.
 * - If first-time eligible, calculates rewards, persists via commitPlayerState,
 *   updates challenge progress model, and unlocks next challenge.
 * - If persistence fails, reports an honest error without recording a false success.
 *
 * @param {string} challengeId
 * @param {object} doc - Story document
 * @param {object} player - Player profile snapshot
 * @param {Function} commitPlayerState - Player update callback
 * @param {object} [options]
 * @param {object} [options.storage] - Custom storage interface
 * @param {string} [options.now] - Completion timestamp
 * @returns {object} Outcome report
 */
export function executeChallengeCompletionSync(
  challengeId,
  doc,
  player,
  commitPlayerState,
  { storage = undefined, now = new Date().toISOString() } = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: `Unknown challenge ID: "${challengeId}"`,
    };
  }

  const challengeStorage = createStoryChallengeStorage({ storage });

  // 1. Require a valid saved or persistently recoverable challenge attempt
  const hasAttempt = challengeStorage.hasChallengeStory(challenge.id) || Boolean(doc?.metadata?.challengeId === challenge.id);
  if (!hasAttempt) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: "No active challenge attempt was found to complete. Please start the challenge first.",
    };
  }

  // 2. Validate story document against challenge objectives
  const validation = validateChallengeStory(challenge, doc, now);
  if (!validation.passed) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: "Challenge requirements are not satisfied. Please review remaining objectives.",
      remainingTasks: validation.summary.remainingTasks,
      validation,
      rewards: challenge.reward,
    };
  }

  // 3. Freshest player state from storage
  const freshestPlayer = getFreshestPlayerState(player, storage);
  const alreadyCompletedInPlayer = isChallengeAlreadyCompleted(
    freshestPlayer,
    challenge.reward?.flagKey,
    storage
  );

  // Load latest progress state
  const { progressState } = challengeStorage.loadProgress();
  const challengeRecord = progressState.challenges[challenge.id];
  const alreadyCompletedInProgress = Boolean(challengeRecord?.completedAt);

  // 4. Idempotent Replay Handling
  if (alreadyCompletedInPlayer || alreadyCompletedInProgress) {
    // Record completion replay in progress model safely
    const progressRes = completeChallengeAttempt(progressState, challenge.id, {
      evaluationResult: validation,
      now,
    });
    if (progressRes.ok) {
      challengeStorage.saveProgress(progressRes.progressState);
    }

    return {
      success: true,
      eligible: true,
      rewarded: false,
      isReplay: true,
      message: `Challenge "${challenge.title}" replayed successfully! Rewards were already claimed.`,
      completedAt:
        challengeRecord?.completedAt ||
        getChallengeCompletedAt(freshestPlayer, challenge.reward?.completedAtKey, storage) ||
        now,
      validation,
      rewards: challenge.reward,
    };
  }

  // 5. If no commit function is provided and storage cannot be updated directly
  if (typeof commitPlayerState !== "function") {
    // Attempt direct localStorage save if available
    const store = storage !== undefined ? storage : typeof localStorage !== "undefined" ? localStorage : null;
    if (!store || typeof store.setItem !== "function") {
      return {
        success: false,
        eligible: true,
        rewarded: false,
        isReplay: false,
        error: "No player state update handler was provided. Rewards could not be persisted.",
        validation,
        rewards: challenge.reward,
      };
    }
  }

  // 6. Calculate rewards against freshest player snapshot
  const calc = calculatePlayerChallengeRewardUpdates(freshestPlayer, challenge.reward, now);

  // Apply to player profile
  try {
    if (typeof commitPlayerState === "function") {
      commitPlayerState(calc.updates);
    } else {
      const store = storage !== undefined ? storage : typeof localStorage !== "undefined" ? localStorage : null;
      const nextPlayer = {
        ...freshestPlayer,
        ...calc.updates,
        flags: {
          ...(freshestPlayer.flags || {}),
          ...calc.updates.flags,
        },
      };
      store.setItem("skillverse_save", JSON.stringify(nextPlayer));
    }
  } catch (err) {
    return {
      success: false,
      eligible: true,
      rewarded: false,
      isReplay: false,
      error: `Failed to persist player challenge rewards: ${err?.message || "Storage error"}`,
      validation,
      rewards: challenge.reward,
    };
  }

  // 7. Update and persist challenge progress model
  const progressRes = completeChallengeAttempt(progressState, challenge.id, {
    evaluationResult: validation,
    now,
  });

  let nextProgress = progressRes.ok ? progressRes.progressState : progressState;

  // Immutably mark reward awarded in challenge progress
  const rewardRes = recordChallengeRewardAwarded(nextProgress, challenge.id, {
    grantSummary: calc.grantSummary,
    now,
  });

  if (rewardRes.ok) {
    nextProgress = rewardRes.progressState;
  }

  challengeStorage.saveProgress(nextProgress);

  const nextChallenge = getNextChallenge(challenge.id);

  return {
    success: true,
    eligible: true,
    rewarded: true,
    isReplay: false,
    message: `Challenge "${challenge.title}" completed! Rewards successfully granted.`,
    grantSummary: calc.grantSummary,
    transactionId: calc.grantSummary.transactionId,
    newlyUnlockedChallengeId: progressRes.newlyUnlockedChallengeId || nextChallenge?.id || null,
    validation,
    rewards: challenge.reward,
    progressState: nextProgress,
  };
}

/**
 * Executes challenge completion with cross-tab lock protection.
 *
 * @param {string} challengeId
 * @param {object} doc
 * @param {object} player
 * @param {Function} commitPlayerState
 * @param {object} [options]
 * @returns {Promise<object>} Outcome report
 */
export async function executeChallengeCompletion(
  challengeId,
  doc,
  player,
  commitPlayerState,
  options = {}
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      error: `Unknown challenge: "${challengeId}"`,
    };
  }

  // Baseline validation before acquiring lock
  const preCheck = validateChallengeStory(challenge, doc);
  if (!preCheck.passed) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: "Challenge requirements are not satisfied. Please review remaining objectives.",
      remainingTasks: preCheck.summary.remainingTasks,
      validation: preCheck,
      rewards: challenge.reward,
    };
  }

  try {
    return await withStoryChallengeLock(
      challenge.id,
      async () => {
        return executeChallengeCompletionSync(
          challenge.id,
          doc,
          player,
          commitPlayerState,
          options
        );
      },
      options.lockCoordinator
    );
  } catch (err) {
    return {
      success: false,
      eligible: true,
      rewarded: false,
      isReplay: false,
      error: `Cross-tab lock acquisition failed: ${err?.message || "Lock error"}`,
      rewards: challenge.reward,
    };
  }
}
