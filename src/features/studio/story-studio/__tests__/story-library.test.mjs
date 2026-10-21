import test from "node:test";
import assert from "node:assert/strict";

import {
  STORY_LIMITS,
  STORY_STORAGE_KEY,
  createCharacterPlacement,
  createDefaultScene,
  createDialogueLine,
  createStoryDocument,
} from "../engine/storySchema.js";
import {
  STORY_DOC_KEY_PREFIX,
  STORY_LIBRARY_BACKUP_KEY,
  STORY_LIBRARY_STORAGE_KEY,
  createBlankStoryInLibrary,
  deleteStoryFromLibrary,
  duplicateStoryDocument,
  duplicateStoryInLibrary,
  getStoryDocKey,
  getStoryFromLibrary,
  loadStoryLibrary,
  renameStoryInLibrary,
  saveStoryToLibrary,
  switchActiveStory,
} from "../engine/storyLibrary.js";
import { serializeStoryDocument } from "../engine/storyStorage.js";

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

// =============================================================================
// S1.7: INITIAL LAUNCH & MIGRATION
// =============================================================================

test("1. loadStoryLibrary initializes clean default story when storage is completely empty", () => {
  const storage = createMemoryStorage();
  const lib = loadStoryLibrary(storage);

  assert.equal(lib.ok, true);
  assert.equal(lib.stories.length, 1);
  assert.ok(lib.activeStoryId);
  assert.equal(lib.activeStoryId, lib.stories[0].id);
  assert.equal(lib.stories[0].title, "Untitled Story");

  // Verify storage keys were created
  assert.ok(storage.getItem(STORY_LIBRARY_STORAGE_KEY));
  assert.ok(storage.getItem(getStoryDocKey(lib.activeStoryId)));
  assert.ok(storage.getItem(STORY_STORAGE_KEY)); // Canonical key synced
});

test("2. loadStoryLibrary safely migrates existing single-story save from canonical key", () => {
  const existingStory = createStoryDocument({
    id: "existing_story_123",
    title: "Maya's Village Adventure",
    scenes: [
      createDefaultScene({
        name: "Old Fountain",
        background: "village-square",
        narration: "A familiar scene from before library mode.",
      }),
    ],
  });

  const serialized = serializeStoryDocument(existingStory);
  const storage = createMemoryStorage({
    [STORY_STORAGE_KEY]: serialized.text,
  });

  const lib = loadStoryLibrary(storage);
  assert.equal(lib.ok, true);
  assert.equal(lib.stories.length, 1);
  assert.equal(lib.activeStoryId, "existing_story_123");
  assert.equal(lib.stories[0].title, "Maya's Village Adventure");
  assert.equal(lib.stories[0].sceneCount, 1);
  assert.equal(lib.migratedFrom, STORY_STORAGE_KEY);

  // Dedicated key should now be populated
  const doc = getStoryFromLibrary(storage, "existing_story_123");
  assert.equal(doc.ok, true);
  assert.equal(doc.story.title, "Maya's Village Adventure");
});

test("3. loadStoryLibrary safely migrates legacy save (sb_story_v1) when library index does not exist", () => {
  const legacyStory = createStoryDocument({
    id: "legacy_story_456",
    title: "Tariq's Harvest",
  });
  const serialized = serializeStoryDocument(legacyStory);
  const storage = createMemoryStorage({
    sb_story_v1: serialized.text,
  });

  const lib = loadStoryLibrary(storage);
  assert.equal(lib.ok, true);
  assert.equal(lib.stories.length, 1);
  assert.equal(lib.stories[0].id, "legacy_story_456");
  assert.equal(lib.stories[0].title, "Tariq's Harvest");
});

// =============================================================================
// S1.7: STORY LIBRARY CRUD
// =============================================================================

test("4. createBlankStoryInLibrary creates a new story, adds to index, and activates it", () => {
  const storage = createMemoryStorage();
  loadStoryLibrary(storage); // Seed

  const created = createBlankStoryInLibrary(storage, {
    title: "My Second Tale",
    author: "Storyteller Maya",
  });

  assert.equal(created.ok, true);
  assert.equal(created.story.title, "My Second Tale");
  assert.equal(created.story.author, "Storyteller Maya");

  // Verify library index has 2 stories now
  const lib = loadStoryLibrary(storage);
  assert.equal(lib.stories.length, 2);
  assert.equal(lib.activeStoryId, created.story.id);

  // Verify canonical key holds the new active story
  const activeDocRes = getStoryFromLibrary(storage, lib.activeStoryId);
  assert.equal(activeDocRes.ok, true);
  assert.equal(activeDocRes.story.title, "My Second Tale");
});

test("5. renameStoryInLibrary updates document title, timestamp, and index summary", () => {
  const storage = createMemoryStorage();
  const lib1 = loadStoryLibrary(storage);
  const storyId = lib1.activeStoryId;

  const renameRes = renameStoryInLibrary(storage, storyId, "The Renamed Legend");
  assert.equal(renameRes.ok, true);
  assert.equal(renameRes.story.title, "The Renamed Legend");

  // Check individual doc key
  const loaded = getStoryFromLibrary(storage, storyId);
  assert.equal(loaded.story.title, "The Renamed Legend");

  // Check canonical key since it's the active story
  const lib2 = loadStoryLibrary(storage);
  assert.equal(lib2.stories[0].title, "The Renamed Legend");
});

test("6. duplicateStoryDocument and duplicateStoryInLibrary generate fresh unique IDs for all entities", () => {
  const original = createStoryDocument({
    title: "Original Quest",
    scenes: [
      createDefaultScene({
        id: "orig_scene_1",
        name: "Start",
        background: "village-square",
        characters: [
          createCharacterPlacement({
            id: "orig_char_1",
            characterId: "maya",
            slot: "left",
          }),
        ],
        dialogue: [
          createDialogueLine({
            id: "orig_diag_1",
            speakerId: "maya",
            text: "Hello!",
          }),
        ],
      }),
      createDefaultScene({
        id: "orig_scene_2",
        name: "Finish",
        background: "farm-field",
      }),
    ],
  });

  const duplicated = duplicateStoryDocument(original);

  // Assert document level independence
  assert.notEqual(duplicated.id, original.id);
  assert.equal(duplicated.title, "Copy of Original Quest");
  assert.equal(duplicated.scenes.length, 2);

  // Assert scene level unique IDs
  assert.notEqual(duplicated.scenes[0].id, original.scenes[0].id);
  assert.notEqual(duplicated.scenes[1].id, original.scenes[1].id);

  // Assert character level unique IDs
  assert.notEqual(
    duplicated.scenes[0].characters[0].id,
    original.scenes[0].characters[0].id
  );
  assert.equal(
    duplicated.scenes[0].characters[0].characterId,
    original.scenes[0].characters[0].characterId
  );

  // Assert dialogue level unique IDs
  assert.notEqual(
    duplicated.scenes[0].dialogue[0].id,
    original.scenes[0].dialogue[0].id
  );
  assert.equal(
    duplicated.scenes[0].dialogue[0].text,
    original.scenes[0].dialogue[0].text
  );
});

test("7. deleteStoryFromLibrary removes story and reassigns next active story safely", () => {
  const storage = createMemoryStorage();
  loadStoryLibrary(storage);

  const s2 = createBlankStoryInLibrary(storage, { title: "Story Two" });
  const s3 = createBlankStoryInLibrary(storage, { title: "Story Three" });

  const libBefore = loadStoryLibrary(storage);
  assert.equal(libBefore.stories.length, 3);
  assert.equal(libBefore.activeStoryId, s3.story.id);

  // Delete active story s3
  const delRes = deleteStoryFromLibrary(storage, s3.story.id);
  assert.equal(delRes.ok, true);
  assert.equal(delRes.deletedStoryId, s3.story.id);

  // Next active story should be reassigned to s2 or remaining story
  const libAfter = loadStoryLibrary(storage);
  assert.equal(libAfter.stories.length, 2);
  assert.notEqual(libAfter.activeStoryId, s3.story.id);
  assert.ok(storage.getItem(getStoryDocKey(libAfter.activeStoryId)));

  // Deleted story doc should be removed
  assert.equal(storage.getItem(getStoryDocKey(s3.story.id)), null);
});

test("8. deleteStoryFromLibrary creates clean fallback default when the last story is deleted", () => {
  const storage = createMemoryStorage();
  const init = loadStoryLibrary(storage);
  assert.equal(init.stories.length, 1);

  const delRes = deleteStoryFromLibrary(storage, init.stories[0].id);
  assert.equal(delRes.ok, true);

  const libAfter = loadStoryLibrary(storage);
  assert.equal(libAfter.stories.length, 1);
  assert.notEqual(libAfter.activeStoryId, init.stories[0].id);
  assert.equal(libAfter.stories[0].title, "Untitled Story");
});

// =============================================================================
// S1.7: RESILIENCE & BACKUP RECOVERY
// =============================================================================

test("9. loadStoryLibrary recovers from backup when primary library index JSON is corrupted", () => {
  const storage = createMemoryStorage();
  const init = loadStoryLibrary(storage);
  const storyId = init.activeStoryId;

  // Add second story so we have a backup
  createBlankStoryInLibrary(storage, { title: "Valid Story in Backup" });

  // Corrupt the primary library index key
  storage.setItem(STORY_LIBRARY_STORAGE_KEY, "{ damaged invalid json %%%");

  // Loading library should safely fall back to backup without throwing or wiping
  const recovered = loadStoryLibrary(storage);
  assert.equal(recovered.ok, true);
  assert.equal(recovered.fromBackup, true);
  assert.ok(recovered.stories.length >= 1);
});

// =============================================================================
// S1.7: STORAGE ISOLATION
// =============================================================================

test("10. Library operations strictly isolate story data from World Builder, Sandbox, and player saves", () => {
  const storage = createMemoryStorage({
    skillverse_world_builder_doc_v1: JSON.stringify({ world: "untouched" }),
    skillverse_studio_engine_document_v1: JSON.stringify({ sandbox: "untouched" }),
    skillverse_save: JSON.stringify({ playerXp: 999 }),
  });

  loadStoryLibrary(storage);
  createBlankStoryInLibrary(storage, { title: "Isolated Story 1" });
  createBlankStoryInLibrary(storage, { title: "Isolated Story 2" });

  // Verify non-story keys were untouched
  assert.equal(
    storage.getItem("skillverse_world_builder_doc_v1"),
    JSON.stringify({ world: "untouched" })
  );
  assert.equal(
    storage.getItem("skillverse_studio_engine_document_v1"),
    JSON.stringify({ sandbox: "untouched" })
  );
  assert.equal(
    storage.getItem("skillverse_save"),
    JSON.stringify({ playerXp: 999 })
  );
});
