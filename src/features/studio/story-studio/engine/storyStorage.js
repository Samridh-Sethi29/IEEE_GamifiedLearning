/**
 * Authoritative Story Studio serialization and storage adapter (S1.1).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements isolated storage using the project's existing createDocumentStorage
 * infrastructure with key: "skillverse_story_studio_doc_v1".
 *
 * Fully isolated from:
 * - World Builder: "skillverse_world_builder_doc_v1"
 * - Sandbox: "skillverse_studio_engine_document_v1"
 * - Player Profile: "skillverse_save"
 */

import { createDocumentStorage } from "../../storage/documentStorage.js";
import {
  LEGACY_STORY_STORAGE_KEY,
  STORY_SCHEMA_VERSION,
  STORY_STORAGE_KEY,
  SUPPORTED_STORY_SCHEMA_VERSIONS,
  createStoryDocument,
} from "./storySchema.js";
import {
  normalizeStoryDocument,
  validateStoryDocument,
} from "./storyValidation.js";

/**
 * Serializes a Story Studio document into JSON text.
 * Never throws on bad input.
 */
export function serializeStoryDocument(story) {
  const check = validateStoryDocument(story);
  if (!check.ok) {
    return {
      ok: false,
      code: "invalid_story",
      message: `This story cannot be saved: ${check.errors[0]}`,
      errors: check.errors,
    };
  }
  return {
    ok: true,
    text: JSON.stringify(normalizeStoryDocument(story)),
  };
}

/**
 * Deserializes JSON text into a validated Story Studio document.
 * Never throws on bad input.
 */
export function deserializeStoryDocument(text) {
  if (typeof text !== "string") {
    return {
      ok: false,
      code: "malformed_json",
      message: "There is no story text to read.",
    };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      ok: false,
      code: "malformed_json",
      message: "This isn't valid story data (it couldn't be parsed as JSON).",
    };
  }

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return {
      ok: false,
      code: "not_a_story",
      message: "This does not look like a Story Studio document.",
    };
  }

  const v = data.schemaVersion;
  if (!Number.isInteger(v)) {
    return {
      ok: false,
      code: "unsupported_version",
      version: v,
      message: "This story has no readable schema version, so it cannot be opened safely.",
    };
  }

  if (!SUPPORTED_STORY_SCHEMA_VERSIONS.includes(v)) {
    const newer = v > STORY_SCHEMA_VERSION;
    return {
      ok: false,
      code: "unsupported_version",
      version: v,
      message: newer
        ? `This story was made with a newer version of Story Studio (schema ${v}). This copy understands schema ${STORY_SCHEMA_VERSION}. Your data was left untouched.`
        : `This story uses an unsupported legacy format (schema ${v}). Your data was left untouched.`,
    };
  }

  const check = validateStoryDocument(data);
  if (!check.ok) {
    return {
      ok: false,
      code: "invalid_story",
      message: `This story is damaged or invalid: ${check.errors[0]}`,
      errors: check.errors,
    };
  }

  return {
    ok: true,
    story: normalizeStoryDocument(data),
    project: normalizeStoryDocument(data), // For compatibility with storage adapter
  };
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates isolated document storage for Story Studio using the shared createDocumentStorage
 * engine with the dedicated STORY_STORAGE_KEY and legacy storage compatibility.
 *
 * @param {object} [options]
 * @param {Storage} [options.storage] - Custom Storage implementation for testing or isolation
 * @param {string} [options.key=STORY_STORAGE_KEY] - Storage key
 * @param {string} [options.legacyKey=LEGACY_STORY_STORAGE_KEY] - Legacy storage key for backward compatibility
 */
export function createStoryStorage({
  storage,
  key = STORY_STORAGE_KEY,
  legacyKey = LEGACY_STORY_STORAGE_KEY,
} = {}) {
  const store = () => storage ?? defaultStorage();
  const innerStorage = createDocumentStorage({
    storage,
    key,
    serialize: serializeStoryDocument,
    deserialize: deserializeStoryDocument,
  });

  return {
    key: innerStorage.key,
    backupKey: innerStorage.backupKey,
    legacyKey,
    storage: store(),
    getStore: store,

    load() {
      const res = innerStorage.load();
      if (!res.ok) return res;
      if (!res.empty) {
        return { ok: true, empty: false, story: res.story ?? res.project };
      }

      // Check legacy storage key (sb_story_v1) for backward compatibility
      const s = store();
      if (s && legacyKey && legacyKey !== key) {
        try {
          const raw = s.getItem(legacyKey);
          if (raw !== null) {
            const parsed = deserializeStoryDocument(raw);
            if (parsed.ok && parsed.story) {
              // Non-destructively copy to canonical key; legacyKey is preserved
              innerStorage.save(parsed.story);
              return { ok: true, empty: false, story: parsed.story, migratedFrom: legacyKey };
            }
            if (!parsed.ok) {
              return parsed;
            }
          }
        } catch {}
      }

      return { ok: true, empty: true, story: null };
    },

    save(story, options) {
      return innerStorage.save(story, options);
    },

    hasBackup() {
      if (innerStorage.hasBackup()) return true;
      const s = store();
      if (s && legacyKey && legacyKey !== key) {
        try {
          return s.getItem(`${legacyKey}__backup`) !== null;
        } catch {
          return false;
        }
      }
      return false;
    },

    loadBackup() {
      const res = innerStorage.loadBackup();
      if (!res.ok) return res;
      if (!res.empty) {
        return { ok: true, empty: false, story: res.story ?? res.project };
      }

      const s = store();
      if (s && legacyKey && legacyKey !== key) {
        try {
          const raw = s.getItem(`${legacyKey}__backup`);
          if (raw !== null) {
            const parsed = deserializeStoryDocument(raw);
            if (parsed.ok && parsed.story) {
              return { ok: true, empty: false, story: parsed.story, migratedFrom: `${legacyKey}__backup` };
            }
          }
        } catch {}
      }

      return { ok: true, empty: true, story: null };
    },

    restoreBackup() {
      if (innerStorage.hasBackup()) {
        const res = innerStorage.restoreBackup();
        if (!res.ok) return res;
        return { ok: true, story: res.story ?? res.project };
      }

      const s = store();
      if (s && legacyKey && legacyKey !== key) {
        try {
          const raw = s.getItem(`${legacyKey}__backup`);
          if (raw !== null) {
            const parsed = deserializeStoryDocument(raw);
            if (parsed.ok && parsed.story) {
              const saveRes = innerStorage.save(parsed.story);
              if (!saveRes.ok) return saveRes;
              return { ok: true, story: parsed.story, restoredFrom: `${legacyKey}__backup` };
            }
            if (!parsed.ok) return parsed;
          }
        } catch {}
      }

      return { ok: false, code: "no_backup", message: "No backup document was found." };
    },
  };
}

/**
 * Loads a story from storage, returning a clean structured result.
 */
export function loadStory(storage) {
  if (!storage || typeof storage.load !== "function") {
    return {
      ok: true,
      empty: true,
      story: createStoryDocument(),
    };
  }

  const loaded = storage.load();
  if (!loaded.ok) {
    return {
      ok: false,
      empty: false,
      code: loaded.code || "load_failed",
      message: loaded.message || "Failed to load story.",
      errors: loaded.errors || [],
      version: loaded.version,
      story: null,
    };
  }

  if (loaded.empty || !loaded.story) {
    return {
      ok: true,
      empty: true,
      story: createStoryDocument(),
    };
  }

  return {
    ok: true,
    empty: false,
    story: loaded.story,
  };
}

/**
 * High-level story document initialization.
 * Automatically restores from storage if present, or creates a clean new story document.
 */
export function initializeStoryDocument(storage) {
  const res = loadStory(storage);
  if (res.ok && res.story) {
    return res.story;
  }
  return createStoryDocument();
}
