/**
 * Pure JavaScript Story Studio Library and Draft Management Engine (S1.7).
 * Zero React, zero DOM, zero external dependencies.
 *
 * Implements multi-story draft management, migration from single-story storage,
 * index resilience, deep duplicate with fresh IDs, deletion with safe fallback,
 * and canonical active-story synchronization.
 *
 * Storage Keys:
 * - Library Index: "skillverse_story_studio_library_v1"
 * - Library Backup: "skillverse_story_studio_library_v1__backup"
 * - Story Docs: "skillverse_story_studio_doc_<storyId>"
 * - Active Story (Canonical): "skillverse_story_studio_doc_v1"
 *
 * Completely isolated from:
 * - World Builder: "skillverse_world_builder_doc_v1"
 * - Sandbox: "skillverse_studio_engine_document_v1"
 * - Player Profile: "skillverse_save"
 */

import {
  LEGACY_STORY_STORAGE_KEY,
  STORY_LIMITS,
  STORY_STORAGE_KEY,
  createCharacterPlacementId,
  createChoiceId,
  createDialogueId,
  createSceneId,
  createStoryDocument,
  createStoryId,
} from "./storySchema.js";
import {
  deserializeStoryDocument,
  serializeStoryDocument,
} from "./storyStorage.js";
import { validateStoryDocument } from "./storyValidation.js";
import { createTemplateStory } from "../data/storyTemplates.js";

export const STORY_LIBRARY_STORAGE_KEY = "skillverse_story_studio_library_v1";
export const STORY_LIBRARY_BACKUP_KEY = "skillverse_story_studio_library_v1__backup";
export const STORY_DOC_KEY_PREFIX = "skillverse_story_studio_doc_";
export const STORY_LIBRARY_VERSION = 1;

/**
 * Returns the individual storage key for a story document.
 */
export function getStoryDocKey(storyId) {
  return `${STORY_DOC_KEY_PREFIX}${String(storyId)}`;
}

/**
 * Resolves a Storage implementation from custom or global localStorage.
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
    if (s && typeof s.getItem === "function") {
      return s;
    }
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts a lightweight metadata summary from a full story document.
 */
export function buildStorySummary(story) {
  if (!story || typeof story !== "object") {
    return {
      id: createStoryId(),
      title: "Untitled Story",
      author: "Explorer",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      sceneCount: 1,
      firstSceneBackground: "village-square",
    };
  }

  const scenes = Array.isArray(story.scenes) ? story.scenes : [];
  const firstBg = scenes[0]?.background || "village-square";

  return {
    id: String(story.id),
    title: String(story.title || "Untitled Story").slice(0, STORY_LIMITS.MAX_TITLE_LENGTH),
    author: String(story.author || "Explorer").slice(0, STORY_LIMITS.MAX_AUTHOR_LENGTH),
    createdAt: String(story.createdAt || new Date().toISOString()),
    modifiedAt: String(story.modifiedAt || new Date().toISOString()),
    sceneCount: scenes.length,
    firstSceneBackground: String(firstBg),
  };
}

/**
 * Creates a deep copy of a story document with fresh unique IDs
 * for the document, each scene, each character placement, each dialogue line,
 * and updates any scene references in choices.
 */
export function duplicateStoryDocument(sourceStory, { titlePrefix = "Copy of " } = {}) {
  const check = validateStoryDocument(sourceStory);
  if (!check.ok) {
    throw new Error(`Cannot duplicate invalid story: ${check.errors[0]}`);
  }

  const now = new Date().toISOString();
  const rawTitle = `${titlePrefix}${sourceStory.title || "Untitled Story"}`;
  const title = rawTitle.slice(0, STORY_LIMITS.MAX_TITLE_LENGTH);
  const newStoryId = createStoryId();

  // Map old scene IDs to newly generated scene IDs
  const sceneIdMap = new Map();
  sourceStory.scenes.forEach((scene) => {
    sceneIdMap.set(scene.id, createSceneId());
  });

  const duplicatedScenes = sourceStory.scenes.map((scene) => {
    const newSceneId = sceneIdMap.get(scene.id) || createSceneId();

    return {
      id: newSceneId,
      name: String(scene.name || "Scene"),
      background: String(scene.background || "village-square"),
      narration: String(scene.narration || ""),
      characters: (scene.characters || []).map((c) => ({
        ...c,
        id: createCharacterPlacementId(),
      })),
      props: [...(scene.props || [])],
      dialogue: (scene.dialogue || []).map((d) => ({
        ...d,
        id: createDialogueId(),
      })),
      choices: (scene.choices || []).map((ch) => ({
        ...ch,
        id: createChoiceId(),
        targetSceneId: sceneIdMap.get(ch.targetSceneId) || ch.targetSceneId || "",
      })),
    };
  });

  return {
    ...sourceStory,
    id: newStoryId,
    title,
    createdAt: now,
    modifiedAt: now,
    scenes: duplicatedScenes,
  };
}

/**
 * Loads a story document by ID from storage.
 */
export function getStoryFromLibrary(storage, storyId) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  const docKey = getStoryDocKey(storyId);
  let raw = store.getItem(docKey);

  // If not found in individual key, check if this is the active story in canonical key
  if (raw === null) {
    const canonicalRaw = store.getItem(STORY_STORAGE_KEY);
    if (canonicalRaw !== null) {
      const parsedCanonical = deserializeStoryDocument(canonicalRaw);
      if (parsedCanonical.ok && parsedCanonical.story && parsedCanonical.story.id === storyId) {
        // Cache it in the dedicated key
        store.setItem(docKey, canonicalRaw);
        return { ok: true, story: parsedCanonical.story };
      }
    }
    return { ok: false, code: "not_found", message: `Story "${storyId}" was not found.` };
  }

  const parsed = deserializeStoryDocument(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      code: parsed.code || "corrupted_story",
      message: parsed.message || `Story "${storyId}" could not be read.`,
      errors: parsed.errors,
    };
  }

  return { ok: true, story: parsed.story };
}

/**
 * Writes the library index to storage with an automatic backup copy.
 */
function persistLibraryIndex(store, libraryData) {
  const json = JSON.stringify(libraryData);
  try {
    const existing = store.getItem(STORY_LIBRARY_STORAGE_KEY);
    if (existing !== null) {
      store.setItem(STORY_LIBRARY_BACKUP_KEY, existing);
    }
  } catch {}
  store.setItem(STORY_LIBRARY_STORAGE_KEY, json);
}

/**
 * Reads and validates the library index, or safely falls back to backup.
 */
function readRawLibraryIndex(store) {
  const raw = store.getItem(STORY_LIBRARY_STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.stories)) {
        return { ok: true, data: parsed, fromBackup: false };
      }
    } catch {
      // Primary corrupted, attempt recovery from backup
    }
  }

  // Try backup
  const backup = store.getItem(STORY_LIBRARY_BACKUP_KEY);
  if (backup !== null) {
    try {
      const parsedBackup = JSON.parse(backup);
      if (parsedBackup && typeof parsedBackup === "object" && Array.isArray(parsedBackup.stories)) {
        return { ok: true, data: parsedBackup, fromBackup: true };
      }
    } catch {}
  }

  return { ok: false };
}

/**
 * Loads the Story Library.
 * Automatically performs migration on first launch:
 * - If single-story draft exists at STORY_STORAGE_KEY or LEGACY_STORY_STORAGE_KEY, migrates it into the library.
 * - If storage is empty, initializes the library with a clean default story.
 * - If library index is corrupted, recovers gracefully from backup or reconstructs index.
 */
export function loadStoryLibrary(storage) {
  const store = resolveStorage(storage);
  if (!store) {
    const defaultDoc = createStoryDocument();
    return {
      ok: true,
      activeStoryId: defaultDoc.id,
      stories: [buildStorySummary(defaultDoc)],
      activeStory: defaultDoc,
    };
  }

  const rawRes = readRawLibraryIndex(store);

  if (rawRes.ok) {
    const data = rawRes.data;
    const stories = data.stories.filter(
      (s) => s && typeof s === "object" && typeof s.id === "string"
    );

    let activeStoryId = data.activeStoryId;
    if (!stories.some((s) => s.id === activeStoryId)) {
      activeStoryId = stories[0]?.id || null;
    }

    // Attempt to load the active story document
    let activeStory = null;
    if (activeStoryId) {
      const loaded = getStoryFromLibrary(store, activeStoryId);
      if (loaded.ok) {
        activeStory = loaded.story;
      }
    }

    // If active story document was missing or corrupted, check canonical key
    if (!activeStory && store.getItem(STORY_STORAGE_KEY)) {
      const canonical = deserializeStoryDocument(store.getItem(STORY_STORAGE_KEY));
      if (canonical.ok && canonical.story) {
        activeStory = canonical.story;
        activeStoryId = canonical.story.id;
        if (!stories.some((s) => s.id === activeStoryId)) {
          stories.unshift(buildStorySummary(activeStory));
        }
      }
    }

    // If still no valid stories, create a clean default
    if (stories.length === 0 || !activeStory) {
      const fallbackDoc = createStoryDocument();
      activeStory = fallbackDoc;
      activeStoryId = fallbackDoc.id;
      const summary = buildStorySummary(fallbackDoc);
      stories.push(summary);

      const serialized = serializeStoryDocument(fallbackDoc);
      if (serialized.ok) {
        store.setItem(getStoryDocKey(fallbackDoc.id), serialized.text);
        store.setItem(STORY_STORAGE_KEY, serialized.text);
      }
      persistLibraryIndex(store, {
        version: STORY_LIBRARY_VERSION,
        activeStoryId,
        stories,
      });
    }

    return {
      ok: true,
      activeStoryId,
      stories,
      activeStory,
      fromBackup: rawRes.fromBackup,
    };
  }

  // --- Migration & Seeding ---
  // No library index existed. Check for existing single-story saves.
  let seedStory = null;
  let migratedFrom = null;

  // 1. Check canonical single-story key
  const canonicalRaw = store.getItem(STORY_STORAGE_KEY);
  if (canonicalRaw !== null) {
    const parsed = deserializeStoryDocument(canonicalRaw);
    if (parsed.ok && parsed.story) {
      seedStory = parsed.story;
      migratedFrom = STORY_STORAGE_KEY;
    }
  }

  // 2. Check legacy single-story key (sb_story_v1)
  if (!seedStory && LEGACY_STORY_STORAGE_KEY) {
    const legacyRaw = store.getItem(LEGACY_STORY_STORAGE_KEY);
    if (legacyRaw !== null) {
      const parsed = deserializeStoryDocument(legacyRaw);
      if (parsed.ok && parsed.story) {
        seedStory = parsed.story;
        migratedFrom = LEGACY_STORY_STORAGE_KEY;
      }
    }
  }

  // 3. If no existing story, create clean default
  if (!seedStory) {
    seedStory = createStoryDocument();
  }

  const serialized = serializeStoryDocument(seedStory);
  if (serialized.ok) {
    store.setItem(getStoryDocKey(seedStory.id), serialized.text);
    store.setItem(STORY_STORAGE_KEY, serialized.text);
  }

  const summary = buildStorySummary(seedStory);
  const libraryData = {
    version: STORY_LIBRARY_VERSION,
    activeStoryId: seedStory.id,
    stories: [summary],
  };

  persistLibraryIndex(store, libraryData);

  return {
    ok: true,
    activeStoryId: seedStory.id,
    stories: [summary],
    activeStory: seedStory,
    migratedFrom,
  };
}

/**
 * Saves a story to the library:
 * - Writes to individual key "skillverse_story_studio_doc_<id>".
 * - Updates library index summary.
 * - If setActive is true or this story is already active, syncs to canonical key.
 */
export function saveStoryToLibrary(storage, story, { setActive = true } = {}) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  const ser = serializeStoryDocument(story);
  if (!ser.ok) {
    return { ok: false, code: ser.code, message: ser.message, errors: ser.errors };
  }

  const docKey = getStoryDocKey(story.id);
  store.setItem(docKey, ser.text);

  // Load current library index
  const libRes = loadStoryLibrary(store);
  let stories = libRes.stories || [];
  let activeStoryId = libRes.activeStoryId;

  if (setActive || activeStoryId === story.id) {
    activeStoryId = story.id;
    store.setItem(STORY_STORAGE_KEY, ser.text);
  }

  const summary = buildStorySummary(story);
  const existingIdx = stories.findIndex((s) => s.id === story.id);
  if (existingIdx >= 0) {
    stories = [
      ...stories.slice(0, existingIdx),
      summary,
      ...stories.slice(existingIdx + 1),
    ];
  } else {
    stories = [summary, ...stories];
  }

  persistLibraryIndex(store, {
    version: STORY_LIBRARY_VERSION,
    activeStoryId,
    stories,
  });

  return { ok: true, story, summary, activeStoryId };
}

/**
 * Creates a new blank story, adds it to the library, and sets it active.
 */
export function createBlankStoryInLibrary(storage, { title = "Untitled Story", author = "Explorer" } = {}) {
  const store = resolveStorage(storage);
  const newStory = createStoryDocument({ title, author });
  return saveStoryToLibrary(store, newStory, { setActive: true });
}

/**
 * Deep-duplicates an existing story in the library with fresh unique IDs.
 */
export function duplicateStoryInLibrary(storage, storyId, { titlePrefix = "Copy of " } = {}) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  const srcRes = getStoryFromLibrary(store, storyId);
  if (!srcRes.ok) {
    return srcRes;
  }

  let duplicated;
  try {
    duplicated = duplicateStoryDocument(srcRes.story, { titlePrefix });
  } catch (err) {
    return { ok: false, code: "duplication_failed", message: err.message };
  }

  // Save the duplicated story to its own key (keep current active story active)
  const ser = serializeStoryDocument(duplicated);
  if (!ser.ok) {
    return { ok: false, code: ser.code, message: ser.message };
  }

  store.setItem(getStoryDocKey(duplicated.id), ser.text);

  // Add to library index
  const libRes = loadStoryLibrary(store);
  const summary = buildStorySummary(duplicated);
  const stories = [summary, ...(libRes.stories || [])];

  persistLibraryIndex(store, {
    version: STORY_LIBRARY_VERSION,
    activeStoryId: libRes.activeStoryId,
    stories,
  });

  return { ok: true, story: duplicated, summary };
}

/**
 * Renames a story in the library.
 */
export function renameStoryInLibrary(storage, storyId, newTitle) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  const trimmed = String(newTitle || "").trim().slice(0, STORY_LIMITS.MAX_TITLE_LENGTH);
  if (!trimmed) {
    return { ok: false, code: "empty_title", message: "Story title cannot be empty." };
  }

  const getRes = getStoryFromLibrary(store, storyId);
  if (!getRes.ok) {
    return getRes;
  }

  const updatedStory = {
    ...getRes.story,
    title: trimmed,
    modifiedAt: new Date().toISOString(),
  };

  const ser = serializeStoryDocument(updatedStory);
  if (!ser.ok) {
    return { ok: false, code: ser.code, message: ser.message };
  }

  store.setItem(getStoryDocKey(storyId), ser.text);

  const libRes = loadStoryLibrary(store);
  let stories = libRes.stories || [];

  if (libRes.activeStoryId === storyId) {
    store.setItem(STORY_STORAGE_KEY, ser.text);
  }

  const summary = buildStorySummary(updatedStory);
  stories = stories.map((s) => (s.id === storyId ? summary : s));

  persistLibraryIndex(store, {
    version: STORY_LIBRARY_VERSION,
    activeStoryId: libRes.activeStoryId,
    stories,
  });

  return { ok: true, story: updatedStory, summary };
}

/**
 * Deletes a story from the library.
 * If the deleted story was the active story:
 * - If other stories remain, activates the next story.
 * - If no stories remain, creates a clean default story.
 */
export function deleteStoryFromLibrary(storage, storyId) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  // Read current library index before deleting
  const libRes = loadStoryLibrary(store);
  let stories = (libRes.stories || []).filter((s) => s.id !== storyId);
  let nextActiveStoryId = libRes.activeStoryId;
  let nextActiveStory = null;

  if (nextActiveStoryId === storyId) {
    if (stories.length > 0) {
      nextActiveStoryId = stories[0].id;
      const loaded = getStoryFromLibrary(store, nextActiveStoryId);
      if (loaded.ok) {
        nextActiveStory = loaded.story;
        const ser = serializeStoryDocument(nextActiveStory);
        if (ser.ok) {
          store.setItem(STORY_STORAGE_KEY, ser.text);
        }
      }
    } else {
      // All stories were deleted; create clean default story so workspace stays valid
      const freshDoc = createStoryDocument();
      nextActiveStory = freshDoc;
      nextActiveStoryId = freshDoc.id;
      const summary = buildStorySummary(freshDoc);
      stories = [summary];

      const ser = serializeStoryDocument(freshDoc);
      if (ser.ok) {
        store.setItem(getStoryDocKey(freshDoc.id), ser.text);
        store.setItem(STORY_STORAGE_KEY, ser.text);
      }
    }
  }

  // Remove individual doc key
  try {
    store.removeItem(getStoryDocKey(storyId));
  } catch {}

  persistLibraryIndex(store, {
    version: STORY_LIBRARY_VERSION,
    activeStoryId: nextActiveStoryId,
    stories,
  });

  return {
    ok: true,
    deletedStoryId: storyId,
    nextActiveStoryId,
    nextActiveStory,
    stories,
  };
}

/**
 * Switches the active story in the library and syncs it to canonical storage.
 */
export function switchActiveStory(storage, storyId) {
  const store = resolveStorage(storage);
  if (!store) {
    return { ok: false, code: "no_storage", message: "Storage is not available." };
  }

  const loaded = getStoryFromLibrary(store, storyId);
  if (!loaded.ok) {
    return loaded;
  }

  const ser = serializeStoryDocument(loaded.story);
  if (ser.ok) {
    store.setItem(STORY_STORAGE_KEY, ser.text);
  }

  const libRes = loadStoryLibrary(store);
  persistLibraryIndex(store, {
    version: STORY_LIBRARY_VERSION,
    activeStoryId: storyId,
    stories: libRes.stories,
  });

  return { ok: true, story: loaded.story };
}

/**
 * Instantiates a template, saves it as an independent story in the library,
 * and activates it.
 */
export function createTemplateStoryInLibrary(storage, templateId, overrides = {}) {
  const store = resolveStorage(storage);
  const story = createTemplateStory(templateId, overrides);
  return saveStoryToLibrary(store, story, { setActive: true });
}

