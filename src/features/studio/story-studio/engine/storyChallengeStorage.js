/**
 * Story Studio Challenge Storage Adapter (C1).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements isolated, resilient persistence for Story Studio Challenge Mode:
 * - Versioned progress storage key: "skillverse_story_studio_challenges_v1"
 * - Automated backup key: "skillverse_story_studio_challenges_v1__backup"
 * - Isolated challenge story document key prefix: "skillverse_story_studio_challenge_doc_"
 *
 * Completely isolated from:
 * - Freeform Active Story: "skillverse_story_studio_doc_v1"
 * - Freeform Story Library: "skillverse_story_studio_library_v1"
 * - World Builder: "skillverse_world_builder_doc_v1"
 * - Sandbox: "skillverse_studio_engine_document_v1"
 * - Player Profile: "skillverse_save"
 */

import {
  createInitialProgressState,
  normalizeProgressState,
  validateProgressState,
} from "./storyChallengeProgress.js";
import {
  createStoryStorage,
} from "./storyStorage.js";

export const STORY_CHALLENGES_STORAGE_KEY = "skillverse_story_studio_challenges_v1";
export const STORY_CHALLENGES_BACKUP_KEY = "skillverse_story_studio_challenges_v1__backup";
export const STORY_CHALLENGE_DOC_PREFIX = "skillverse_story_studio_challenge_doc_";

/**
 * Returns the individual storage key for a challenge's active story document.
 * @param {string} challengeId
 * @returns {string}
 */
export function getStoryChallengeDocKey(challengeId) {
  const clean = String(challengeId || "challenge").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${STORY_CHALLENGE_DOC_PREFIX}${clean}`;
}

/**
 * Resolves safe storage implementation (falling back to custom wrapper or global).
 */
export function resolveStorage(storage) {
  if (storage && typeof storage.getItem === "function") {
    return storage;
  }
  if (storage?.storage && typeof storage.storage.getItem === "function") {
    return storage.storage;
  }
  if (typeof storage?.getStore === "function") {
    const s = storage.getStore();
    if (s && typeof s.getItem === "function") return s;
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Serializes progress state into JSON text. Never throws.
 */
export function serializeProgress(state) {
  const normalized = normalizeProgressState(state);
  return {
    ok: true,
    text: JSON.stringify(normalized),
  };
}

/**
 * Deserializes JSON text into a validated, normalized progress state. Never throws.
 */
export function deserializeProgress(text) {
  if (typeof text !== "string" || !text.trim()) {
    return {
      ok: false,
      code: "empty_text",
      message: "There is no progress text to read.",
    };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      ok: false,
      code: "malformed_json",
      message: "Could not parse challenge progress data as JSON.",
    };
  }

  const check = validateProgressState(data);
  const normalized = normalizeProgressState(data);

  return {
    ok: true,
    progressState: normalized,
    hadValidationErrors: !check.ok,
    validationErrors: check.errors,
  };
}

/**
 * Creates isolated storage adapter for Story Studio Challenge Mode.
 *
 * @param {object} [options]
 * @param {Storage} [options.storage] - Custom storage interface (for testing or isolation)
 * @param {string} [options.key=STORY_CHALLENGES_STORAGE_KEY]
 * @param {string} [options.backupKey=STORY_CHALLENGES_BACKUP_KEY]
 */
export function createStoryChallengeStorage({
  storage,
  key = STORY_CHALLENGES_STORAGE_KEY,
  backupKey = STORY_CHALLENGES_BACKUP_KEY,
} = {}) {
  const store = () => resolveStorage(storage);

  return {
    key,
    backupKey,
    storage: store(),

    /**
     * Loads challenge progress, with automatic fallback to backup and recovery on corruption.
     * Never throws.
     */
    loadProgress() {
      const s = store();
      if (!s || typeof s.getItem !== "function") {
        return {
          ok: false,
          code: "storage_unavailable",
          message: "Local storage is not available in this environment.",
          progressState: createInitialProgressState(),
        };
      }

      let raw = null;
      try {
        raw = s.getItem(key);
      } catch (err) {
        return {
          ok: false,
          code: "storage_error",
          message: `Failed to read storage key "${key}": ${err?.message || err}`,
          progressState: createInitialProgressState(),
        };
      }

      // If empty primary, try backup key
      if (raw === null) {
        try {
          const backupRaw = s.getItem(backupKey);
          if (backupRaw !== null) {
            const backupParsed = deserializeProgress(backupRaw);
            if (backupParsed.ok) {
              return {
                ok: true,
                empty: false,
                restoredFromBackup: true,
                progressState: backupParsed.progressState,
              };
            }
          }
        } catch {}

        return {
          ok: true,
          empty: true,
          progressState: createInitialProgressState(),
        };
      }

      // Parse primary
      const parsed = deserializeProgress(raw);
      if (parsed.ok) {
        return {
          ok: true,
          empty: false,
          progressState: parsed.progressState,
        };
      }

      // Primary corrupted: attempt recovery from backup
      try {
        const backupRaw = s.getItem(backupKey);
        if (backupRaw !== null) {
          const backupParsed = deserializeProgress(backupRaw);
          if (backupParsed.ok) {
            return {
              ok: true,
              empty: false,
              restoredFromBackup: true,
              progressState: backupParsed.progressState,
            };
          }
        }
      } catch {}

      // Both corrupt: return fresh initial state defensively
      return {
        ok: true,
        recovered: true,
        code: "corrupted_state_recovered",
        message: "Damaged challenge progress was safely recovered with a fresh starting state.",
        progressState: createInitialProgressState(),
      };
    },

    /**
     * Saves challenge progress to primary key and maintains rolling backup.
     * Never throws.
     */
    saveProgress(progressState) {
      const s = store();
      if (!s || typeof s.setItem !== "function") {
        return {
          ok: false,
          code: "storage_unavailable",
          message: "Local storage is not available to save challenge progress.",
        };
      }

      const serialized = serializeProgress(progressState);

      // Rotate existing primary to backup
      try {
        const existing = s.getItem(key);
        if (existing !== null) {
          s.setItem(backupKey, existing);
        }
      } catch {}

      try {
        s.setItem(key, serialized.text);
        return {
          ok: true,
        };
      } catch (err) {
        return {
          ok: false,
          code: "save_failed",
          message: `Failed to write challenge progress: ${err?.message || err}`,
        };
      }
    },

    /**
     * Loads the story document for a specific challenge.
     * @param {string} challengeId
     */
    loadChallengeStory(challengeId) {
      const docKey = getStoryChallengeDocKey(challengeId);
      const storyStorage = createStoryStorage({
        storage: store(),
        key: docKey,
      });
      return storyStorage.load();
    },

    /**
     * Saves the story document for a specific challenge.
     * @param {string} challengeId
     * @param {object} storyDoc
     */
    saveChallengeStory(challengeId, storyDoc) {
      const docKey = getStoryChallengeDocKey(challengeId);
      const storyStorage = createStoryStorage({
        storage: store(),
        key: docKey,
      });
      return storyStorage.save(storyDoc);
    },

    /**
     * Checks if a story document exists for a challenge.
     * @param {string} challengeId
     */
    hasChallengeStory(challengeId) {
      const s = store();
      if (!s || typeof s.getItem !== "function") return false;
      const docKey = getStoryChallengeDocKey(challengeId);
      try {
        return s.getItem(docKey) !== null;
      } catch {
        return false;
      }
    },

    /**
     * Resets progress to initial state (for testing or author reset).
     */
    resetProgress() {
      const s = store();
      if (!s) return { ok: false };
      try {
        const initial = createInitialProgressState();
        s.setItem(key, JSON.stringify(initial));
        return { ok: true, progressState: initial };
      } catch (err) {
        return { ok: false, message: err?.message || err };
      }
    },
  };
}
