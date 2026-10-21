import test from "node:test";
import assert from "node:assert/strict";

import {
  STORY_LIMITS,
  createDefaultScene,
  createSampleStoryDocument,
  createStoryDocument,
} from "../engine/storySchema.js";

import {
  STORY_ACTIONS,
  addScene,
  createStoryState,
  deleteScene,
  dismissNotice,
  duplicateScene,
  moveScene,
  moveSceneDown,
  moveSceneUp,
  redoStory,
  renameScene,
  resetStory,
  selectCanAddScene,
  selectCanDeleteScene,
  selectCanRedo,
  selectCanUndo,
  selectNotice,
  selectScene,
  selectSceneCount,
  selectScenes,
  selectSelectedScene,
  selectSelectedSceneId,
  selectSelectedSceneIndex,
  selectStory,
  setSceneBackground,
  setTitle,
  storyReducer,
  undoStory,
} from "../engine/storyReducer.js";

import {
  createStoryStorage,
  deserializeStoryDocument,
  loadStory,
  serializeStoryDocument,
} from "../engine/storyStorage.js";

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
// INITIALIZATION & STATE
// -----------------------------------------------------------------------------

test("1. createStoryState initializes with clean defaults and selects first scene", () => {
  const state = createStoryState();
  const story = selectStory(state);

  assert.equal(typeof story.id, "string");
  assert.equal(story.scenes.length, 1);
  assert.equal(selectSceneCount(state), 1);
  assert.equal(selectSelectedSceneId(state), story.scenes[0].id);
  assert.equal(selectSelectedSceneIndex(state), 0);
  assert.equal(selectSelectedScene(state).id, story.scenes[0].id);
  assert.equal(selectCanUndo(state), false);
  assert.equal(selectCanRedo(state), false);
  assert.equal(selectCanAddScene(state), true);
  assert.equal(selectCanDeleteScene(state), false);
  assert.equal(selectNotice(state), null);
});

test("2. createStoryState accepts existing document and normalizes it", () => {
  const sample = createSampleStoryDocument();
  const state = createStoryState(sample);

  assert.equal(selectStory(state).title, "The Mystery of the Quiet Well");
  assert.equal(selectSceneCount(state), 2);
  assert.equal(selectSelectedSceneId(state), sample.scenes[0].id);
  assert.equal(selectCanDeleteScene(state), true);
});

// -----------------------------------------------------------------------------
// ADD SCENE
// -----------------------------------------------------------------------------

test("3. ADD_SCENE appends a new scene with fresh unique ID and selects it", () => {
  let state = createStoryState();
  const initialScene = selectScenes(state)[0];

  state = storyReducer(state, addScene({ name: "The Old Windmill" }));

  const scenes = selectScenes(state);
  assert.equal(scenes.length, 2);
  assert.equal(scenes[0].id, initialScene.id);
  assert.notEqual(scenes[1].id, initialScene.id);
  assert.equal(scenes[1].name, "The Old Windmill");
  assert.equal(selectSelectedSceneId(state), scenes[1].id);
  assert.equal(selectSelectedSceneIndex(state), 1);
  assert.equal(selectCanUndo(state), true);
});

test("4. ADD_SCENE can insert a scene after a specific scene ID", () => {
  let state = createStoryState(createSampleStoryDocument()); // 2 scenes
  const [s1, s2] = selectScenes(state);

  state = storyReducer(
    state,
    addScene({ name: "Interlude", insertAfterId: s1.id })
  );

  const scenes = selectScenes(state);
  assert.equal(scenes.length, 3);
  assert.equal(scenes[0].id, s1.id);
  assert.equal(scenes[1].name, "Interlude");
  assert.equal(scenes[2].id, s2.id);
  assert.equal(selectSelectedSceneId(state), scenes[1].id);
});

test("5. ADD_SCENE enforces maximum of 12 scenes", () => {
  let state = createStoryState();
  for (let i = 2; i <= STORY_LIMITS.MAX_SCENES; i += 1) {
    state = storyReducer(state, addScene({ name: `Scene ${i}` }));
  }
  assert.equal(selectSceneCount(state), 12);
  assert.equal(selectCanAddScene(state), false);

  // Attempting to add 13th scene
  const rejectedState = storyReducer(state, addScene({ name: "Scene 13" }));
  assert.equal(selectSceneCount(rejectedState), 12);
  assert.match(selectNotice(rejectedState).message, /up to 12 scenes/i);
});

// -----------------------------------------------------------------------------
// SELECT SCENE
// -----------------------------------------------------------------------------

test("6. SELECT_SCENE updates selected scene without creating undo step", () => {
  let state = createStoryState(createSampleStoryDocument());
  const [s1, s2] = selectScenes(state);

  assert.equal(selectSelectedSceneId(state), s1.id);

  state = storyReducer(state, selectScene(s2.id));
  assert.equal(selectSelectedSceneId(state), s2.id);
  assert.equal(selectSelectedSceneIndex(state), 1);
  assert.equal(selectCanUndo(state), false); // Selection is NOT an undoable doc change

  // Selecting non-existent scene produces warning
  const notFoundState = storyReducer(state, selectScene("ghost_scene"));
  assert.equal(selectSelectedSceneId(notFoundState), s2.id);
  assert.match(selectNotice(notFoundState).message, /does not exist/i);
});

// -----------------------------------------------------------------------------
// RENAME SCENE
// -----------------------------------------------------------------------------

test("7. RENAME_SCENE immutably changes the scene name and commits history", () => {
  let state = createStoryState(createSampleStoryDocument());
  const [s1, s2] = selectScenes(state);

  state = storyReducer(state, renameScene(s1.id, "A Quiet Morning"));

  const scenes = selectScenes(state);
  assert.equal(scenes[0].name, "A Quiet Morning");
  assert.equal(scenes[1].name, s2.name); // Other scene completely untouched
  assert.equal(selectCanUndo(state), true);
});

test("8. RENAME_SCENE rejects empty names or oversized names with warnings", () => {
  let state = createStoryState();
  const s1 = selectScenes(state)[0];

  const emptyState = storyReducer(state, renameScene(s1.id, "   "));
  assert.equal(selectScenes(emptyState)[0].name, s1.name);
  assert.match(selectNotice(emptyState).message, /cannot be empty/i);

  const longName = "A".repeat(STORY_LIMITS.MAX_SCENE_NAME_LENGTH + 5);
  const longState = storyReducer(state, renameScene(s1.id, longName));
  assert.equal(selectScenes(longState)[0].name, s1.name);
  assert.match(selectNotice(longState).message, /cannot exceed/i);
});

// -----------------------------------------------------------------------------
// DUPLICATE SCENE
// -----------------------------------------------------------------------------

test("9. DUPLICATE_SCENE deep copies a scene with brand new unique IDs for scene, characters, dialogue, and choices", () => {
  let state = createStoryState(createSampleStoryDocument());
  const source = selectScenes(state)[0];
  assert.ok(source.characters.length > 0);
  assert.ok(source.dialogue.length > 0);

  state = storyReducer(state, duplicateScene(source.id));

  const scenes = selectScenes(state);
  assert.equal(scenes.length, 3);
  const copy = scenes[1]; // inserted right after source (index 0)

  // Verify copy properties
  assert.notEqual(copy.id, source.id);
  assert.equal(copy.name, `${source.name} (Copy)`);
  assert.equal(copy.background, source.background);
  assert.equal(copy.narration, source.narration);

  // Character IDs must be freshly regenerated
  assert.equal(copy.characters.length, source.characters.length);
  for (let i = 0; i < copy.characters.length; i += 1) {
    assert.notEqual(copy.characters[i].id, source.characters[i].id);
    assert.equal(copy.characters[i].characterId, source.characters[i].characterId);
    assert.equal(copy.characters[i].slot, source.characters[i].slot);
  }

  // Dialogue IDs must be freshly regenerated
  assert.equal(copy.dialogue.length, source.dialogue.length);
  for (let i = 0; i < copy.dialogue.length; i += 1) {
    assert.notEqual(copy.dialogue[i].id, source.dialogue[i].id);
    assert.equal(copy.dialogue[i].text, source.dialogue[i].text);
    assert.equal(copy.dialogue[i].speakerId, source.dialogue[i].speakerId);
  }

  // Newly duplicated scene is automatically selected
  assert.equal(selectSelectedSceneId(state), copy.id);
  assert.equal(selectCanUndo(state), true);
});

test("10. DUPLICATE_SCENE respects the 12-scene limit", () => {
  let state = createStoryState();
  for (let i = 2; i <= 12; i += 1) {
    state = storyReducer(state, addScene({ name: `Scene ${i}` }));
  }
  const s1 = selectScenes(state)[0];

  const fullState = storyReducer(state, duplicateScene(s1.id));
  assert.equal(selectSceneCount(fullState), 12);
  assert.match(selectNotice(fullState).message, /up to 12 scenes/i);
});

// -----------------------------------------------------------------------------
// DELETE SCENE
// -----------------------------------------------------------------------------

test("11. DELETE_SCENE removes target scene and shifts selection safely", () => {
  let state = createStoryState(createSampleStoryDocument()); // 2 scenes: s1, s2
  const [s1, s2] = selectScenes(state);

  // Delete s1 while s1 is selected -> selection shifts to s2
  state = storyReducer(state, deleteScene(s1.id));
  assert.equal(selectSceneCount(state), 1);
  assert.equal(selectScenes(state)[0].id, s2.id);
  assert.equal(selectSelectedSceneId(state), s2.id);
  assert.equal(selectCanUndo(state), true);
});

test("12. DELETE_SCENE maintains at least 1 scene and refuses to delete final scene", () => {
  let state = createStoryState(); // 1 scene
  const s1 = selectScenes(state)[0];

  state = storyReducer(state, deleteScene(s1.id));
  assert.equal(selectSceneCount(state), 1);
  assert.equal(selectScenes(state)[0].id, s1.id);
  assert.match(selectNotice(state).message, /must have at least 1 scene/i);
});

test("13. DELETE_SCENE preserves current selection if non-active scene was deleted", () => {
  let state = createStoryState();
  state = storyReducer(state, addScene({ name: "Scene 2" }));
  state = storyReducer(state, addScene({ name: "Scene 3" }));

  const scenes = selectScenes(state);
  const [s1, s2, s3] = scenes;

  // Active scene is s3
  assert.equal(selectSelectedSceneId(state), s3.id);

  // Delete s2
  state = storyReducer(state, deleteScene(s2.id));
  assert.equal(selectSceneCount(state), 2);
  assert.equal(selectSelectedSceneId(state), s3.id);
});

// -----------------------------------------------------------------------------
// REORDER / MOVE SCENE
// -----------------------------------------------------------------------------

test("14. MOVE_SCENE_UP and MOVE_SCENE_DOWN reorder scenes and keep selection on moved scene", () => {
  let state = createStoryState();
  state = storyReducer(state, addScene({ name: "Scene B" }));
  state = storyReducer(state, addScene({ name: "Scene C" }));

  const [sA, sB, sC] = selectScenes(state);

  // Initial order: [A, B, C]. Move C up -> [A, C, B]
  state = storyReducer(state, moveSceneUp(sC.id));
  let order = selectScenes(state).map((s) => s.id);
  assert.deepEqual(order, [sA.id, sC.id, sB.id]);
  assert.equal(selectSelectedSceneId(state), sC.id);

  // Move A down -> [C, A, B]
  state = storyReducer(state, moveSceneDown(sA.id));
  order = selectScenes(state).map((s) => s.id);
  assert.deepEqual(order, [sC.id, sA.id, sB.id]);
  assert.equal(selectSelectedSceneId(state), sA.id);
});

test("15. MOVE_SCENE at boundaries is disabled and does not add undo steps", () => {
  let state = createStoryState(createSampleStoryDocument()); // [s1, s2]
  const [s1, s2] = selectScenes(state);

  // Moving first scene UP is invalid
  const noUp = storyReducer(state, moveSceneUp(s1.id));
  assert.equal(noUp, state);
  assert.equal(selectCanUndo(noUp), false);

  // Moving last scene DOWN is invalid
  const noDown = storyReducer(state, moveSceneDown(s2.id));
  assert.equal(noDown, state);
  assert.equal(selectCanUndo(noDown), false);
});

// -----------------------------------------------------------------------------
// UNDO & REDO
// -----------------------------------------------------------------------------

test("16. UNDO and REDO accurately roll back and reapply document changes", () => {
  let state = createStoryState();
  const initialScene = selectScenes(state)[0];

  state = storyReducer(state, addScene({ name: "Scene 2" }));
  const addedSceneId = selectScenes(state)[1].id;
  assert.equal(selectSceneCount(state), 2);

  // Undo add
  state = storyReducer(state, undoStory());
  assert.equal(selectSceneCount(state), 1);
  assert.equal(selectScenes(state)[0].id, initialScene.id);
  assert.equal(selectSelectedSceneId(state), initialScene.id);
  assert.equal(selectCanRedo(state), true);

  // Redo add
  state = storyReducer(state, redoStory());
  assert.equal(selectSceneCount(state), 2);
  assert.equal(selectScenes(state)[1].id, addedSceneId);
  assert.ok(selectScenes(state).some((s) => s.id === selectSelectedSceneId(state)));
});

test("17. UNDO adjusts selectedSceneId if active scene does not exist in undone state", () => {
  let state = createStoryState();
  const s1 = selectScenes(state)[0];

  state = storyReducer(state, addScene({ name: "Scene 2" }));
  const s2 = selectScenes(state)[1];
  assert.equal(selectSelectedSceneId(state), s2.id);

  // Undoing drops Scene 2 from document. Selection must fall back to Scene 1
  state = storyReducer(state, undoStory());
  assert.equal(selectSelectedSceneId(state), s1.id);
});

// -----------------------------------------------------------------------------
// IMMUTABILITY & ISOLATION
// -----------------------------------------------------------------------------

test("18. Editing one scene never mutates other scenes or earlier snapshots", () => {
  const initialStory = createSampleStoryDocument();
  const originalS2Chars = JSON.stringify(initialStory.scenes[1].characters);
  const originalS2Dialogue = JSON.stringify(initialStory.scenes[1].dialogue);

  let state = createStoryState(initialStory);
  const s1 = selectScenes(state)[0];
  const s2 = selectScenes(state)[1];

  // Rename scene 1
  state = storyReducer(state, renameScene(s1.id, "Renamed Scene 1"));

  // S2 must be strictly untouched in memory and contents
  const currentS2 = selectScenes(state)[1];
  assert.equal(currentS2, s2);
  assert.equal(JSON.stringify(currentS2.characters), originalS2Chars);
  assert.equal(JSON.stringify(currentS2.dialogue), originalS2Dialogue);
});

// -----------------------------------------------------------------------------
// SAVE, RELOAD & DISMISS NOTICE
// -----------------------------------------------------------------------------

test("19. Story state survives storage serialization, saving, and restoration", () => {
  const mem = memoryStorage();
  const storage = createStoryStorage({ storage: mem });

  let state = createStoryState();
  state = storyReducer(state, setTitle("The Brave Little Robot"));
  state = storyReducer(state, addScene({ name: "Finding the Battery" }));
  state = storyReducer(state, setSceneBackground(selectScenes(state)[1].id, "starry-night"));

  const currentDoc = selectStory(state);
  const saveRes = storage.save(currentDoc);
  assert.equal(saveRes.ok, true);

  const loadRes = loadStory(storage);
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.empty, false);
  assert.equal(loadRes.story.title, "The Brave Little Robot");
  assert.equal(loadRes.story.scenes.length, 2);
  assert.equal(loadRes.story.scenes[1].name, "Finding the Battery");
  assert.equal(loadRes.story.scenes[1].background, "starry-night");
});

test("20. DISMISS_NOTICE clears notice cleanly", () => {
  let state = createStoryState();
  // Trigger notice via bad rename
  state = storyReducer(state, renameScene(selectScenes(state)[0].id, ""));
  assert.ok(selectNotice(state));

  state = storyReducer(state, dismissNotice(selectNotice(state).id));
  assert.equal(selectNotice(state), null);
});

test("21. RESET restores initial document when called without argument", () => {
  let state = createStoryState();
  const initialTitle = selectStory(state).title;

  state = storyReducer(state, setTitle("Modified Title"));
  state = storyReducer(state, addScene({ name: "Added Scene" }));
  assert.equal(selectStory(state).title, "Modified Title");
  assert.equal(selectSceneCount(state), 2);

  state = storyReducer(state, resetStory());
  assert.equal(selectStory(state).title, initialTitle);
  assert.equal(selectSceneCount(state), 1);
  assert.equal(selectCanUndo(state), false);
});

test("22. RESET replaces document and updates selection when given a new valid story", () => {
  let state = createStoryState();

  const newDoc = createStoryDocument({
    id: "story_new_replacement",
    title: "Brand New Adventure",
    scenes: [
      createDefaultScene({ id: "sc_alpha", name: "Chapter One" }),
      createDefaultScene({ id: "sc_beta", name: "Chapter Two" }),
    ],
  });

  state = storyReducer(state, resetStory(newDoc));
  assert.equal(selectStory(state).id, "story_new_replacement");
  assert.equal(selectStory(state).title, "Brand New Adventure");
  assert.equal(selectSceneCount(state), 2);
  assert.equal(selectSelectedSceneId(state), "sc_alpha");
  assert.equal(selectCanUndo(state), false);

  // If passed an invalid document, it rejects and issues a warning notice
  const invalidState = storyReducer(state, resetStory({ invalid: true }));
  assert.ok(selectNotice(invalidState));
  assert.equal(selectStory(invalidState).id, "story_new_replacement");
});

