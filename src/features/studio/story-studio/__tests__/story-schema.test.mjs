import test from "node:test";
import assert from "node:assert/strict";

import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_FACING,
  CHARACTER_SLOTS,
  DIALOGUE_TYPES,
  STORY_BACKGROUNDS,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTERS,
  STORY_CHARACTER_IDS,
  STORY_LIMITS,
  STORY_PROJECT_TYPE,
  STORY_PROPS,
  STORY_PROP_IDS,
  STORY_SCHEMA_VERSION,
  STORY_STORAGE_KEY,
  createCharacterPlacement,
  createDefaultScene,
  createDialogueLine,
  createSampleStoryDocument,
  createStoryDocument,
} from "../engine/storySchema.js";

import {
  normalizeStoryDocument,
  validateCharacterPlacement,
  validateDialogueLine,
  validateScene,
  validateStoryDocument,
} from "../engine/storyValidation.js";

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
// FACTORIES & CONSTANTS
// -----------------------------------------------------------------------------

test("1. createStoryDocument factory produces a valid document with expected defaults", () => {
  const story = createStoryDocument();
  assert.equal(typeof story.id, "string");
  assert.equal(story.schemaVersion, STORY_SCHEMA_VERSION);
  assert.equal(story.type, STORY_PROJECT_TYPE);
  assert.equal(story.title, "Untitled Story");
  assert.equal(story.author, "Explorer");
  assert.equal(Array.isArray(story.scenes), true);
  assert.equal(story.scenes.length, 1);
  assert.equal(typeof story.settings, "object");
  assert.equal(typeof story.metadata, "object");

  const check = validateStoryDocument(story);
  assert.equal(check.ok, true, `Validation failed: ${check.errors?.join(", ")}`);
});

test("2. createDefaultScene factory produces a valid scene", () => {
  const scene = createDefaultScene({ name: "Village Gathering" });
  assert.equal(scene.name, "Village Gathering");
  assert.equal(scene.background, "village-square");
  assert.deepEqual(scene.characters, []);
  assert.deepEqual(scene.dialogue, []);
  assert.deepEqual(scene.props, []);
  assert.deepEqual(scene.choices, []);

  const errors = validateScene(scene);
  assert.equal(errors.length, 0, `Scene errors: ${errors.join(", ")}`);
});

test("3. createCharacterPlacement and createDialogueLine factories produce valid entities", () => {
  const char = createCharacterPlacement({ characterId: "tariq", slot: "center" });
  assert.equal(char.characterId, "tariq");
  assert.equal(char.slot, "center");
  assert.equal(char.expression, "happy");
  assert.equal(char.facing, "right");

  const charErrors = validateCharacterPlacement(char);
  assert.equal(charErrors.length, 0);

  const diag = createDialogueLine({ speakerId: "tariq", text: "Look at the crops!", type: "thought" });
  assert.equal(diag.speakerId, "tariq");
  assert.equal(diag.text, "Look at the crops!");
  assert.equal(diag.type, "thought");

  const diagErrors = validateDialogueLine(diag);
  assert.equal(diagErrors.length, 0);
});

test("4. createSampleStoryDocument produces a valid 2-scene starter story with full content", () => {
  const sample = createSampleStoryDocument();
  assert.equal(sample.scenes.length, 2);
  assert.equal(sample.title, "The Mystery of the Quiet Well");

  const check = validateStoryDocument(sample);
  assert.equal(check.ok, true, `Sample story validation failed: ${check.errors?.join(", ")}`);
});

// -----------------------------------------------------------------------------
// DOCUMENT VALIDATION
// -----------------------------------------------------------------------------

test("5. Document validation: rejects non-object root and missing fields", () => {
  assert.equal(validateStoryDocument(null).ok, false);
  assert.equal(validateStoryDocument("string").ok, false);
  assert.equal(validateStoryDocument([]).ok, false);

  const missingTitle = createStoryDocument();
  delete missingTitle.title;
  assert.equal(validateStoryDocument(missingTitle).ok, false);
});

test("6. Document validation: rejects unsupported schemaVersion", () => {
  const badV1 = { ...createStoryDocument(), schemaVersion: 0 };
  assert.equal(validateStoryDocument(badV1).ok, false);

  const badV2 = { ...createStoryDocument(), schemaVersion: 2 };
  assert.equal(validateStoryDocument(badV2).ok, false);

  const badV3 = { ...createStoryDocument(), schemaVersion: "1" };
  assert.equal(validateStoryDocument(badV3).ok, false);
});

test("7. Document validation: rejects invalid project type (must be story-studio)", () => {
  const badType1 = { ...createStoryDocument(), type: "world-builder" };
  assert.equal(validateStoryDocument(badType1).ok, false);

  const badType2 = { ...createStoryDocument(), type: "sandbox" };
  assert.equal(validateStoryDocument(badType2).ok, false);
});

test("8. Document validation: enforces title length limits", () => {
  const emptyTitle = { ...createStoryDocument(), title: "   " };
  assert.equal(validateStoryDocument(emptyTitle).ok, false);

  const longTitle = { ...createStoryDocument(), title: "A".repeat(STORY_LIMITS.MAX_TITLE_LENGTH + 1) };
  assert.equal(validateStoryDocument(longTitle).ok, false);

  const maxTitle = { ...createStoryDocument(), title: "A".repeat(STORY_LIMITS.MAX_TITLE_LENGTH) };
  assert.equal(validateStoryDocument(maxTitle).ok, true);
});

test("9. Document validation: enforces author length limits", () => {
  const emptyAuthor = { ...createStoryDocument(), author: "" };
  assert.equal(validateStoryDocument(emptyAuthor).ok, false);

  const longAuthor = { ...createStoryDocument(), author: "B".repeat(STORY_LIMITS.MAX_AUTHOR_LENGTH + 1) };
  assert.equal(validateStoryDocument(longAuthor).ok, false);
});

test("10. Document validation: rejects malformed ISO date strings", () => {
  const badCreated = { ...createStoryDocument(), createdAt: "not-a-date" };
  assert.equal(validateStoryDocument(badCreated).ok, false);

  const badMod = { ...createStoryDocument(), modifiedAt: "yesterday" };
  assert.equal(validateStoryDocument(badMod).ok, false);
});

// -----------------------------------------------------------------------------
// SCENE LIMITS & CONSTRAINTS
// -----------------------------------------------------------------------------

test("11. Scene limits: rejects empty scenes array (< MIN_SCENES)", () => {
  const zeroScenes = { ...createStoryDocument(), scenes: [] };
  assert.equal(validateStoryDocument(zeroScenes).ok, false);
});

test("12. Scene limits: accepts up to 12 scenes and rejects 13 scenes (> MAX_SCENES)", () => {
  const twelveScenes = Array.from({ length: 12 }, (_, i) =>
    createDefaultScene({ id: `scene_${i + 1}`, name: `Scene ${i + 1}` })
  );
  const doc12 = { ...createStoryDocument(), scenes: twelveScenes };
  assert.equal(validateStoryDocument(doc12).ok, true);

  const thirteenScenes = Array.from({ length: 13 }, (_, i) =>
    createDefaultScene({ id: `scene_${i + 1}`, name: `Scene ${i + 1}` })
  );
  const doc13 = { ...createStoryDocument(), scenes: thirteenScenes };
  assert.equal(validateStoryDocument(doc13).ok, false);
});

test("13. Duplicate scene IDs: rejects documents containing duplicate scene IDs", () => {
  const dupes = [
    createDefaultScene({ id: "scene_dup", name: "First" }),
    createDefaultScene({ id: "scene_dup", name: "Second" }),
  ];
  const doc = { ...createStoryDocument(), scenes: dupes };
  const check = validateStoryDocument(doc);
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((e) => e.includes("duplicated")));
});

test("14. Scene validation: rejects unsupported background ID", () => {
  const badBg = createDefaultScene({ background: "outer-space-nebula" });
  const doc = createStoryDocument({ scenes: [badBg] });
  const check = validateStoryDocument(doc);
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((e) => e.includes("not a supported background")));
});

test("15. Scene validation: enforces narration text length limit", () => {
  const longNarration = createDefaultScene({
    narration: "X".repeat(STORY_LIMITS.MAX_NARRATION_LENGTH + 1),
  });
  const doc = createStoryDocument({ scenes: [longNarration] });
  assert.equal(validateStoryDocument(doc).ok, false);

  const maxNarration = createDefaultScene({
    narration: "X".repeat(STORY_LIMITS.MAX_NARRATION_LENGTH),
  });
  assert.equal(validateStoryDocument(createStoryDocument({ scenes: [maxNarration] })).ok, true);
});

// -----------------------------------------------------------------------------
// CHARACTER PLACEMENTS & SLOTS
// -----------------------------------------------------------------------------

test("16. Character limits: accepts up to 3 characters per scene and rejects 4", () => {
  const threeChars = [
    createCharacterPlacement({ id: "c1", characterId: "maya", slot: "left" }),
    createCharacterPlacement({ id: "c2", characterId: "tariq", slot: "center" }),
    createCharacterPlacement({ id: "c3", characterId: "pip", slot: "right" }),
  ];
  const scene3 = createDefaultScene({ characters: threeChars });
  assert.equal(validateScene(scene3).length, 0);

  const fourChars = [
    ...threeChars,
    createCharacterPlacement({ id: "c4", characterId: "dr-leo", slot: "left" }),
  ];
  const scene4 = createDefaultScene({ characters: fourChars });
  assert.ok(validateScene(scene4).some((e) => e.includes("maximum is 3")));
});

test("17. Character slot collisions: rejects two characters occupying the same slot in a scene", () => {
  const collision = [
    createCharacterPlacement({ id: "c1", characterId: "maya", slot: "center" }),
    createCharacterPlacement({ id: "c2", characterId: "tariq", slot: "center" }),
  ];
  const scene = createDefaultScene({ characters: collision });
  const errors = validateScene(scene);
  assert.ok(errors.some((e) => e.includes("already occupied")));
});

test("18. Character placement validation: rejects invalid characterId, slot, expression, or facing", () => {
  assert.ok(validateCharacterPlacement(createCharacterPlacement({ characterId: "alien" })).length > 0);
  assert.ok(validateCharacterPlacement(createCharacterPlacement({ slot: "top" })).length > 0);
  assert.ok(validateCharacterPlacement(createCharacterPlacement({ expression: "enraged" })).length > 0);
  assert.ok(validateCharacterPlacement(createCharacterPlacement({ facing: "up" })).length > 0);
});

test("19. Duplicate character IDs: rejects duplicate placement IDs within a scene", () => {
  const dupes = [
    createCharacterPlacement({ id: "c_same", characterId: "maya", slot: "left" }),
    createCharacterPlacement({ id: "c_same", characterId: "tariq", slot: "right" }),
  ];
  const scene = createDefaultScene({ characters: dupes });
  assert.ok(validateScene(scene).some((e) => e.includes("duplicated")));
});

// -----------------------------------------------------------------------------
// DIALOGUE LINES & SPEAKER INTEGRITY
// -----------------------------------------------------------------------------

test("20. Dialogue limits: accepts up to 20 dialogue lines and rejects 21 lines", () => {
  const lines20 = Array.from({ length: 20 }, (_, i) =>
    createDialogueLine({ id: `d_${i}`, speakerId: "narrator", text: `Line ${i + 1}` })
  );
  const scene20 = createDefaultScene({ dialogue: lines20 });
  assert.equal(validateScene(scene20).length, 0);

  const lines21 = [
    ...lines20,
    createDialogueLine({ id: "d_21", speakerId: "narrator", text: "One too many" }),
  ];
  const scene21 = createDefaultScene({ dialogue: lines21 });
  assert.ok(validateScene(scene21).some((e) => e.includes("maximum is 20")));
});

test("21. Dialogue line validation: rejects empty text, excessive length, or invalid bubble type", () => {
  assert.ok(validateDialogueLine(createDialogueLine({ text: "" })).length > 0);
  assert.ok(
    validateDialogueLine(createDialogueLine({ text: "A".repeat(STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH + 1) }))
      .length > 0
  );
  assert.ok(validateDialogueLine(createDialogueLine({ text: "Hello", type: "whisper" })).length > 0);
});

test("22. Dialogue speaker reference: allows 'narrator' as a universal speaker", () => {
  const scene = createDefaultScene({
    characters: [],
    dialogue: [createDialogueLine({ speakerId: "narrator", text: "The village was silent." })],
  });
  assert.equal(validateScene(scene).length, 0);
});

test("23. Dialogue speaker reference: allows characters present on the stage as speaker", () => {
  const scene = createDefaultScene({
    characters: [createCharacterPlacement({ id: "char_maya", characterId: "maya", slot: "left" })],
    dialogue: [
      createDialogueLine({ speakerId: "char_maya", text: "Speaking via placement ID" }),
      createDialogueLine({ speakerId: "maya", text: "Speaking via characterId" }),
    ],
  });
  assert.equal(validateScene(scene).length, 0);
});

test("24. Dialogue speaker reference: rejects dialogue referencing a speaker not present in the scene", () => {
  const scene = createDefaultScene({
    characters: [createCharacterPlacement({ id: "char_maya", characterId: "maya", slot: "left" })],
    dialogue: [
      createDialogueLine({ speakerId: "tariq", text: "I am not on stage!" }),
    ],
  });
  const errors = validateScene(scene);
  assert.ok(errors.some((e) => e.includes('speakerId "tariq" is not present in this scene')));
});

// -----------------------------------------------------------------------------
// BRANCHING CHOICES FORWARD COMPATIBILITY
// -----------------------------------------------------------------------------

test("25. Branching choices: forward-compatible choice validation rejects non-existent targetSceneId", () => {
  const scene1 = createDefaultScene({
    id: "s1",
    choices: [{ id: "c1", text: "Go to market", targetSceneId: "s2" }],
  });
  const scene2 = createDefaultScene({ id: "s2", name: "Market" });
  const validDoc = createStoryDocument({ scenes: [scene1, scene2] });
  assert.equal(validateStoryDocument(validDoc).ok, true);

  const danglingScene = createDefaultScene({
    id: "s_dangle",
    choices: [{ id: "c_bad", text: "Go to moon", targetSceneId: "s_non_existent" }],
  });
  const badDoc = createStoryDocument({ scenes: [danglingScene] });
  const check = validateStoryDocument(badDoc);
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((e) => e.includes("references a non-existent scene")));
});

// -----------------------------------------------------------------------------
// SERIALIZATION & DESERIALIZATION
// -----------------------------------------------------------------------------

test("26. Serialization round trip: valid story survives serialize -> deserialize identically", () => {
  const original = createSampleStoryDocument();
  const ser = serializeStoryDocument(original);
  assert.equal(ser.ok, true);
  assert.equal(typeof ser.text, "string");

  const deser = deserializeStoryDocument(ser.text);
  assert.equal(deser.ok, true);
  assert.deepEqual(deser.story, original);
});

test("27. Serialization error handling: serializeStoryDocument rejects invalid document without throwing", () => {
  const invalid = { ...createStoryDocument(), title: "" };
  const res = serializeStoryDocument(invalid);
  assert.equal(res.ok, false);
  assert.equal(res.code, "invalid_story");
  assert.ok(res.errors.length > 0);
});

test("28. Deserialization error handling: rejects malformed JSON, wrong schema, or damaged input", () => {
  assert.equal(deserializeStoryDocument("not-json").code, "malformed_json");
  assert.equal(deserializeStoryDocument("").code, "malformed_json");
  assert.equal(deserializeStoryDocument(null).code, "malformed_json");

  const future = JSON.stringify({ ...createStoryDocument(), schemaVersion: 99 });
  const futureRes = deserializeStoryDocument(future);
  assert.equal(futureRes.code, "unsupported_version");

  const invalid = JSON.stringify({ ...createStoryDocument(), type: "invalid-type" });
  const invalidRes = deserializeStoryDocument(invalid);
  assert.equal(invalidRes.code, "invalid_story");
});

// -----------------------------------------------------------------------------
// STORAGE & ISOLATION
// -----------------------------------------------------------------------------

test("29. Storage isolation: uses dedicated key and never touches player profile, Sandbox, or World Builder", () => {
  const foreignSave = '{"name":"Explorer","coins":200}';
  const wbSave = '{"type":"world-builder","id":"wb_1"}';
  const sbSave = '{"type":"sandbox","id":"sb_1"}';

  const st = memoryStorage({
    skillverse_save: foreignSave,
    skillverse_world_builder_doc_v1: wbSave,
    skillverse_studio_engine_document_v1: sbSave,
  });

  const store = createStoryStorage({ storage: st });
  assert.equal(store.key, STORY_STORAGE_KEY);
  assert.equal(store.backupKey, `${STORY_STORAGE_KEY}__backup`);

  // Initial load is empty
  const initLoad = store.load();
  assert.equal(initLoad.ok, true);
  assert.equal(initLoad.empty, true);
  assert.equal(initLoad.story, null);

  // Save story
  const story = createSampleStoryDocument();
  const saveRes = store.save(story);
  assert.equal(saveRes.ok, true);

  // Other keys remain untouched
  assert.equal(st.data.skillverse_save, foreignSave);
  assert.equal(st.data.skillverse_world_builder_doc_v1, wbSave);
  assert.equal(st.data.skillverse_studio_engine_document_v1, sbSave);

  // Story key has data
  assert.ok(st.data[STORY_STORAGE_KEY].includes("The Mystery of the Quiet Well"));
});

test("30. Storage loadStory helper loads existing story or returns clean document on empty", () => {
  const st = memoryStorage();
  const store = createStoryStorage({ storage: st });

  // On empty storage, loadStory returns default story
  const emptyRes = loadStory(store);
  assert.equal(emptyRes.ok, true);
  assert.equal(emptyRes.empty, true);
  assert.ok(emptyRes.story);

  // Save and reload
  const custom = createStoryDocument({ title: "Custom Tale" });
  store.save(custom);

  const loadedRes = loadStory(store);
  assert.equal(loadedRes.ok, true);
  assert.equal(loadedRes.empty, false);
  assert.equal(loadedRes.story.title, "Custom Tale");
});

test("31. Storage unreadable protection: refuses to overwrite corrupt data and preserves backup", () => {
  const junk = "{bad_json_data";
  const st = memoryStorage({ [STORY_STORAGE_KEY]: junk });
  const store = createStoryStorage({ storage: st });

  // Loading returns corrupt code
  assert.equal(store.load().code, "malformed_json");
  assert.equal(st.data[STORY_STORAGE_KEY], junk, "Corrupt data is never altered on load");

  // Attempting to save without replaceUnreadable is refused
  const goodStory = createStoryDocument({ title: "Safe Story" });
  const refused = store.save(goodStory);
  assert.equal(refused.ok, false);
  assert.equal(refused.code, "would_overwrite_unreadable");
  assert.equal(st.data[STORY_STORAGE_KEY], junk);

  // Saving with replaceUnreadable preserves corrupt data to backupKey
  const allowed = store.save(goodStory, { replaceUnreadable: true });
  assert.equal(allowed.ok, true);
  assert.equal(st.data[store.backupKey], junk, "Corrupt file backed up");
  assert.equal(store.hasBackup(), true);

  // New story now loaded cleanly
  assert.equal(store.load().story.title, "Safe Story");
});

test("32. Storage backup restoration: restores story from backup copy", () => {
  const original = createStoryDocument({ title: "Original Backup Story" });
  const originalJson = JSON.stringify(original);

  const st = memoryStorage({
    [STORY_STORAGE_KEY]: '{"corrupted":true',
    [`${STORY_STORAGE_KEY}__backup`]: originalJson,
  });

  const store = createStoryStorage({ storage: st });
  assert.equal(store.hasBackup(), true);

  const restoreRes = store.restoreBackup();
  assert.equal(restoreRes.ok, true);
  assert.equal(restoreRes.story.title, "Original Backup Story");
  assert.equal(store.load().story.title, "Original Backup Story");
});

test("33. Document immutability: normalization and factory functions do not mutate inputs", () => {
  const original = createSampleStoryDocument();
  const serialized = JSON.stringify(original);

  const copy = normalizeStoryDocument(original);
  copy.title = "Mutated Title";
  copy.scenes[0].name = "Mutated Scene Name";

  assert.equal(original.title, "The Mystery of the Quiet Well");
  assert.equal(original.scenes[0].name, "Morning at the Fountain");
  assert.equal(JSON.stringify(original), serialized);
});
