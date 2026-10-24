// World Builder mission rewards and progression integration model.
// Pure JavaScript: zero React, zero DOM, and zero direct storage mutation.
// Evaluates reward eligibility, handles safe replay protection, and computes atomic player progression updates.

import { evaluateMissionCompletion } from "./missionCompletion.js";
import { MISSION_REWARDS } from "../data/rewards.js";

/**
 * Retrieves the freshest player profile state from storage if available,
 * falling back to the provided in-memory player snapshot.
 * Guarantees that newer coin, XP, level, or flag changes are not overwritten.
 *
 * @param {object} fallbackPlayer - In-memory player state snapshot
 * @param {object} [storage] - Optional storage interface (defaults to global localStorage if present)
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
 * Checks whether the mission has already been recorded as completed in the player profile.
 * Optionally inspects storage to verify the durable record.
 *
 * @param {object} player - Player profile state
 * @param {string} [flagKey] - Completion flag key
 * @param {object} [storage] - Optional storage interface
 * @returns {boolean} True if already recorded as completed
 */
export function isMissionAlreadyCompleted(
  player,
  flagKey = MISSION_REWARDS.flagKey,
  storage = undefined
) {
  const effectivePlayer = getFreshestPlayerState(player, storage);
  return Boolean(effectivePlayer?.flags?.[flagKey]);
}

/**
 * Retrieves the ISO timestamp when the mission was recorded as completed, if available.
 *
 * @param {object} player - Player profile state
 * @param {string} [completedAtKey] - Completion timestamp key
 * @param {object} [storage] - Optional storage interface
 * @returns {string|null} ISO timestamp or null
 */
export function getMissionCompletedAt(
  player,
  completedAtKey = MISSION_REWARDS.completedAtKey,
  storage = undefined
) {
  const effectivePlayer = getFreshestPlayerState(player, storage);
  return effectivePlayer?.flags?.[completedAtKey] || null;
}

/**
 * Evaluates whether a World Builder village design is eligible for reward granting,
 * taking into account completion eligibility and prior completion records.
 *
 * @param {object} doc - Studio project document
 * @param {object} [waterInputs] - Numerical water planning inputs
 * @param {object} [player] - Current player profile
 * @param {object} [rewardConfig] - Configured reward amounts
 * @param {object} [storage] - Optional storage interface
 * @returns {object} Reward eligibility report
 */
export function evaluateMissionRewardEligibility(
  doc,
  waterInputs = {},
  player = null,
  rewardConfig = MISSION_REWARDS,
  storage = undefined
) {
  const completion = evaluateMissionCompletion(doc, waterInputs);

  if (!completion.eligibleForCompletion) {
    return {
      eligible: false,
      rewarded: false,
      isReplay: false,
      status: "ineligible",
      reason: "Mission requirements are not yet satisfied.",
      completion,
      rewards: rewardConfig,
    };
  }

  const alreadyCompleted = isMissionAlreadyCompleted(player, rewardConfig.flagKey, storage);

  if (alreadyCompleted) {
    return {
      eligible: true,
      rewarded: false,
      isReplay: true,
      status: "already_completed",
      reason: "Mission was previously completed. Replaying does not repeat rewards.",
      completion,
      rewards: rewardConfig,
      completedAt: getMissionCompletedAt(player, rewardConfig.completedAtKey, storage),
    };
  }

  return {
    eligible: true,
    rewarded: true,
    isReplay: false,
    status: "eligible_for_reward",
    reason: "Mission completed successfully. Eligible for one-time rewards.",
    completion,
    rewards: rewardConfig,
  };
}

/**
 * Computes deterministic player profile updates for granting mission rewards.
 * Reuses the SkillVerse standard: 100 XP per level, with a 100-coin bonus on level-up.
 * Preserves all unrelated player profile fields (day, water, skills, english, etc.).
 *
 * @param {object} player - Current player profile
 * @param {object} [rewardConfig] - Reward configuration
 * @param {string} [timestamp] - ISO timestamp string for completion record
 * @returns {object} Calculated updates and grant summary
 */
export function calculatePlayerRewardUpdates(
  player,
  rewardConfig = MISSION_REWARDS,
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
  const badgeId = rewardConfig?.badge;
  const newBadges =
    badgeId && !existingBadges.includes(badgeId)
      ? [...existingBadges, badgeId]
      : existingBadges;

  return {
    updates: {
      xp: newXP,
      level: newLevel,
      coins: newCoins,
      badges: newBadges,
      flags: {
        [rewardConfig.flagKey]: true,
        [rewardConfig.completedAtKey]: timestamp,
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
    },
  };
}

/**
 * Authoritative cross-tab lock name prefix for mission completions.
 */
export const MISSION_LOCK_NAME_PREFIX = "skillverse_lock_mission_";

/**
 * Returns the canonical cross-tab lock name for a mission.
 * @param {string} [missionId="save-our-village"]
 * @returns {string}
 */
export function getMissionLockName(missionId = MISSION_REWARDS.missionId) {
  return `${MISSION_LOCK_NAME_PREFIX}${missionId || "world-builder"}`;
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

export const inMemoryLockQueue = new InMemoryLockQueue();

/**
 * Acquires a same-origin cross-tab lock using the Web Locks API if available,
 * or an explicit lock coordinator (for tests), or fallback in-process queue.
 *
 * @param {string} lockName - Name of the lock resource
 * @param {Function} callback - Async critical section callback
 * @param {object} [lockCoordinator] - Optional custom lock coordinator
 * @returns {Promise<any>}
 */
export async function withCrossTabLock(
  lockName = getMissionLockName(),
  callback,
  lockCoordinator = undefined
) {
  if (typeof callback !== "function") {
    throw new Error("withCrossTabLock requires a callback function");
  }

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
  return await inMemoryLockQueue.acquire(lockName, callback);
}

/**
 * Executes mission completion synchronously against the player state:
 * - Checks fresh eligibility and freshest player state from storage.
 * - If already completed, returns a replay result without duplicate rewards.
 * - If eligible and not completed, computes updates against freshest player state
 *   and applies them via commitPlayerState.
 * - If commitPlayerState fails or throws, returns a failure result with actionable error.
 * - Never claims rewards are granted if persistence failed or was not provided.
 *
 * @param {object} doc - Studio project document
 * @param {object} waterInputs - Numerical water planning inputs
 * @param {object} player - Current player profile snapshot
 * @param {Function} commitPlayerState - Player state update callback (e.g. updatePlayer from usePlayer)
 * @param {object} [rewardConfig] - Reward configuration
 * @param {object} [storage] - Optional storage interface
 * @returns {object} Execution outcome report
 */
export function executeMissionCompletionSync(
  doc,
  waterInputs,
  player,
  commitPlayerState,
  rewardConfig = MISSION_REWARDS,
  storage = undefined
) {
  // Re-read freshest player state from storage to avoid stale closures or cross-tab races
  const freshestPlayer = getFreshestPlayerState(player, storage);

  const evalResult = evaluateMissionRewardEligibility(
    doc,
    waterInputs,
    freshestPlayer,
    rewardConfig,
    storage
  );

  if (!evalResult.eligible) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: "Mission requirements are not satisfied. Please check the dashboard.",
      completion: evalResult.completion,
      rewards: rewardConfig,
    };
  }

  // Idempotency: Replay scenario
  if (evalResult.isReplay) {
    return {
      success: true,
      eligible: true,
      rewarded: false,
      isReplay: true,
      message: "Village saved again! Rewards were already claimed on previous completion.",
      completion: evalResult.completion,
      rewards: rewardConfig,
      completedAt: evalResult.completedAt,
    };
  }

  // If no commit function was provided, we cannot persist rewards
  if (typeof commitPlayerState !== "function") {
    return {
      success: false,
      eligible: true,
      rewarded: false,
      isReplay: false,
      error: "No player state update handler was provided. Rewards could not be persisted.",
      completion: evalResult.completion,
      rewards: rewardConfig,
    };
  }

  // First-time completion: calculate updates against freshest player snapshot
  const calc = calculatePlayerRewardUpdates(freshestPlayer, rewardConfig);

  try {
    commitPlayerState(calc.updates);
  } catch (err) {
    return {
      success: false,
      eligible: true,
      rewarded: false,
      isReplay: false,
      error: `Failed to persist mission rewards: ${err?.message || "Storage error"}`,
      completion: evalResult.completion,
      rewards: rewardConfig,
    };
  }

  return {
    success: true,
    eligible: true,
    rewarded: true,
    isReplay: false,
    message: "Village saved! Rewards successfully granted and recorded.",
    grantSummary: calc.grantSummary,
    completion: evalResult.completion,
    rewards: rewardConfig,
  };
}

/**
 * Executes mission completion with cross-tab lock protection:
 * - Serializes execution through Web Locks API across same-origin browser tabs.
 * - Re-reads freshest player state from storage AFTER acquiring lock.
 * - Re-evaluates eligibility against current document and fresh state.
 * - Guarantees that only the first tab to acquire the lock grants one-time rewards.
 * - Competing tabs re-evaluating the updated storage safely detect the durable flag
 *   and route to replay mode (0 duplicate XP, coins, or badges).
 *
 * @param {object} doc - Studio project document
 * @param {object} waterInputs - Numerical water planning inputs
 * @param {object} player - Current player profile snapshot
 * @param {Function} commitPlayerState - Player state update callback
 * @param {object} [rewardConfig] - Reward configuration
 * @param {object} [storage] - Optional storage interface
 * @param {object} [lockCoordinator] - Optional custom lock coordinator
 * @returns {Promise<object>} Execution outcome report
 */
export async function executeMissionCompletion(
  doc,
  waterInputs,
  player,
  commitPlayerState,
  rewardConfig = MISSION_REWARDS,
  storage = undefined,
  lockCoordinator = undefined
) {
  // Baseline validation before acquiring lock
  const preCheck = evaluateMissionCompletion(doc, waterInputs);
  if (!preCheck.eligibleForCompletion) {
    return {
      success: false,
      eligible: false,
      rewarded: false,
      isReplay: false,
      error: "Mission requirements are not satisfied. Please check the dashboard.",
      completion: preCheck,
      rewards: rewardConfig,
    };
  }

  const lockName = getMissionLockName(rewardConfig?.missionId);

  try {
    return await withCrossTabLock(
      lockName,
      async () => {
        // Critical section: Re-read freshest state inside lock and execute sync core
        return executeMissionCompletionSync(
          doc,
          waterInputs,
          player,
          commitPlayerState,
          rewardConfig,
          storage
        );
      },
      lockCoordinator
    );
  } catch (err) {
    return {
      success: false,
      eligible: true,
      rewarded: false,
      isReplay: false,
      error: `Cross-tab lock acquisition failed: ${err?.message || "Lock error"}`,
      rewards: rewardConfig,
    };
  }
}

