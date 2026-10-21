import test from "node:test";
import assert from "node:assert/strict";

import {
  STARTER_TEMPLATES,
  createTemplateStory,
  getAllTemplates,
  getTemplateById,
} from "../data/storyTemplates.js";
import { validateStoryDocument } from "../engine/storyValidation.js";
import {
  createStoryState,
  storyReducer,
  setSceneNarration,
  addDialogueLine,
  selectStory,
} from "../engine/storyReducer.js";
import {
  createReaderState,
  advanceReader,
  getReaderProgress,
} from "../engine/storyReaderEngine.js";
import {
  loadStoryLibrary,
  createTemplateStoryInLibrary,
  getStoryFromLibrary,
} from "../engine/storyLibrary.js";

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
// S1.8: TEMPLATE INTEGRITY & METADATA
// =============================================================================

test("1. STARTER_TEMPLATES contains four distinct, high-quality starter stories", () => {
  const templates = getAllTemplates();
  assert.equal(templates.length, 4);

  const titles = templates.map((t) => t.title);
  assert.ok(titles.includes("The Mystery of the Missing Water Bucket"));
  assert.ok(titles.includes("A Friendship Mix-Up"));
  assert.ok(titles.includes("The Tiny Robot's Big Idea"));
  assert.ok(titles.includes("A Journey Under the Stars"));

  templates.forEach((t) => {
    assert.ok(t.id, "Template must have an id");
    assert.ok(t.title, "Template must have a title");
    assert.ok(t.premise, "Template must have a premise");
    assert.ok(t.category, "Template must have a category");
    assert.ok(t.author, "Template must have an author");
    assert.ok(t.sceneCount >= 3, "Template must have at least 3 scenes");
    assert.ok(Array.isArray(t.featuredCharacters) && t.featuredCharacters.length > 0);
    assert.ok(t.firstSceneBackground, "Template must define firstSceneBackground");
  });
});

test("2. Every starter template instantiates as a 100% valid Story Studio document", () => {
  const templates = getAllTemplates();

  templates.forEach((tmpl) => {
    const doc = createTemplateStory(tmpl.id);
    const check = validateStoryDocument(doc);
    assert.equal(
      check.ok,
      true,
      `Template "${tmpl.title}" failed validation: ${check.errors?.join("; ")}`
    );

    assert.equal(doc.scenes.length, tmpl.sceneCount);
    assert.equal(doc.metadata.templateId, tmpl.id);
  });
});

test("3. Multiple instantiations of the same template produce completely unique disjoint IDs", () => {
  const docA = createTemplateStory("template-missing-bucket");
  const docB = createTemplateStory("template-missing-bucket");

  // Document IDs differ
  assert.notEqual(docA.id, docB.id);

  // Scene IDs differ
  const sceneIdsA = docA.scenes.map((s) => s.id);
  const sceneIdsB = docB.scenes.map((s) => s.id);
  sceneIdsA.forEach((id) => assert.ok(!sceneIdsB.includes(id)));

  // Character placement IDs differ
  const charIdsA = docA.scenes.flatMap((s) => s.characters.map((c) => c.id));
  const charIdsB = docB.scenes.flatMap((s) => s.characters.map((c) => c.id));
  charIdsA.forEach((id) => assert.ok(!charIdsB.includes(id)));

  // Dialogue IDs differ
  const diagIdsA = docA.scenes.flatMap((s) => s.dialogue.map((d) => d.id));
  const diagIdsB = docB.scenes.flatMap((s) => s.dialogue.map((d) => d.id));
  diagIdsA.forEach((id) => assert.ok(!diagIdsB.includes(id)));
});

// =============================================================================
// S1.8: EDITABILITY & WORKSPACE COMPATIBILITY
// =============================================================================

test("4. Template-derived story is fully editable using the existing reducer without schema violations", () => {
  const templateStory = createTemplateStory("template-tiny-robot");
  let state = createStoryState(templateStory);

  const scene0Id = templateStory.scenes[0].id;

  // Edit narration
  state = storyReducer(state, setSceneNarration(scene0Id, "Little Siphon whirrs to life!"));
  assert.equal(
    selectStory(state).scenes[0].narration,
    "Little Siphon whirrs to life!"
  );

  // Add a new dialogue line
  state = storyReducer(
    state,
    addDialogueLine({
      sceneId: scene0Id,
      speakerId: "maya",
      text: "Look at the gears turn, Dr. Leo!",
      type: "speech",
    })
  );

  const updatedDoc = selectStory(state);
  const check = validateStoryDocument(updatedDoc);
  assert.equal(check.ok, true, `Validation failed: ${check.errors?.join("; ")}`);
});

// =============================================================================
// S1.8: PERSISTENCE & STORY LIBRARY
// =============================================================================

test("5. Template stories can be instantiated into the Story Library and reopened cleanly", () => {
  const storage = createMemoryStorage();
  loadStoryLibrary(storage);

  const created = createTemplateStoryInLibrary(storage, "template-journey-stars");
  assert.equal(created.ok, true);
  assert.equal(created.story.title, "A Journey Under the Stars");

  // Reopen from library
  const reopened = getStoryFromLibrary(storage, created.story.id);
  assert.equal(reopened.ok, true);
  assert.equal(reopened.story.title, "A Journey Under the Stars");
  assert.equal(reopened.story.scenes.length, 3);
});

// =============================================================================
// S1.8: READER PLAYBACK
// =============================================================================

test("6. Template stories play smoothly through all scenes in Story Reader to 'The End'", () => {
  const templateStory = createTemplateStory("template-friendship-mixup");
  let reader = createReaderState(templateStory);

  let steps = 0;
  while (!reader.isEnd && steps < 50) {
    reader = advanceReader(reader);
    steps += 1;
  }

  assert.equal(reader.isEnd, true, "Reader should reach the end screen");
  assert.ok(steps >= 6, `Expected at least 6 steps, got ${steps}`);
});

// =============================================================================
// S1.8: SYSTEM ISOLATION
// =============================================================================

test("7. Template instantiation leaves World Builder and player save data untouched", () => {
  const storage = createMemoryStorage({
    skillverse_world_builder_doc_v1: "WB_DATA_PRESERVED",
    skillverse_save: "PLAYER_SAVE_PRESERVED",
  });

  createTemplateStoryInLibrary(storage, "template-missing-bucket");

  assert.equal(storage.getItem("skillverse_world_builder_doc_v1"), "WB_DATA_PRESERVED");
  assert.equal(storage.getItem("skillverse_save"), "PLAYER_SAVE_PRESERVED");
});
