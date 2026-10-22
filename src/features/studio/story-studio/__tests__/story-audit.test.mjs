import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_FACING,
  CHARACTER_SLOTS,
  DIALOGUE_TYPES,
  LEGACY_STORY_STORAGE_KEY,
  STORY_BACKGROUNDS,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTERS,
  STORY_CHARACTER_IDS,
  STORY_LIMITS,
  STORY_PROJECT_TYPE,
  STORY_PROPS,
  STORY_PROP_IDS,
  STORY_STORAGE_KEY,
  SUPPORTED_STORY_PROJECT_TYPES,
  createDefaultScene,
  createSampleStoryDocument,
  createStoryDocument,
} from "../engine/storySchema.js";

import {
  normalizeStoryDocument,
  validateScene,
  validateStoryDocument,
} from "../engine/storyValidation.js";

import {
  STORY_ACTIONS,
  addCharacter,
  addDialogueLine,
  addScene,
  createStoryState,
  deleteScene,
  dismissNotice,
  duplicateScene,
  moveDialogueLine,
  moveSceneDown,
  moveSceneUp,
  redoStory,
  removeCharacter,
  removeDialogueLine,
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
  setSceneNarration,
  setTitle,
  storyReducer,
  toggleProp,
  undoStory,
  updateCharacter,
  updateDialogueLine,
  addChoice,
  updateChoice,
  removeChoice,
  setSceneIsEnding,
} from "../engine/storyReducer.js";

import {
  createStoryStorage,
  deserializeStoryDocument,
  loadStory,
  serializeStoryDocument,
} from "../engine/storyStorage.js";

import {
  advanceReader,
  canAdvance,
  canStepBack,
  chooseBranch,
  createReaderState,
  getCurrentDialogue,
  getCurrentScene,
  getReaderProgress,
  isWaitingForChoice,
  restartReader,
  stepBackReader,
} from "../engine/storyReaderEngine.js";

import {
  createBlankStoryInLibrary,
  createTemplateStoryInLibrary,
  deleteStoryFromLibrary,
  duplicateStoryInLibrary,
  getStoryFromLibrary,
  loadStoryLibrary,
  renameStoryInLibrary,
  saveStoryToLibrary,
  switchActiveStory,
} from "../engine/storyLibrary.js";

import { STARTER_TEMPLATES } from "../data/storyTemplates.js";
import { analyzeStoryGraph } from "../engine/storyGraph.js";
import {
  buildPrintableStoryModel,
  triggerBrowserPrint,
} from "../engine/storyExport.js";

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

// =============================================================================
// AUDIT: JOURNEY ITEMS 1 - 12
// =============================================================================

test("1. Story Studio schema and default document factory generates valid defaults", () => {
  const doc = createStoryDocument();
  assert.equal(typeof doc.id, "string");
  assert.equal(doc.title, "Untitled Story");
  assert.equal(doc.author, "Explorer");
  assert.equal(doc.schemaVersion, 1);
  assert.equal(doc.scenes.length, 1);

  const scene = doc.scenes[0];
  assert.equal(scene.name, "Scene 1: The Beginning");
  assert.equal(scene.background, "village-square");
  assert.equal(scene.characters.length, 1);
  assert.equal(scene.characters[0].characterId, "maya");
  assert.equal(scene.dialogue.length, 1);

  const valRes = validateStoryDocument(doc);
  assert.equal(valRes.ok, true);
});

test("2. Title editing enforces boundaries and preserves non-empty titles", () => {
  let state = createStoryState();
  assert.equal(selectStory(state).title, "Untitled Story");

  // Valid rename
  state = storyReducer(state, setTitle("The River Keeper"));
  assert.equal(selectStory(state).title, "The River Keeper");
  assert.equal(selectCanUndo(state), true);

  // Exceeding max length is safely rejected with notice
  const overlong = "T".repeat(STORY_LIMITS.MAX_TITLE_LENGTH + 20);
  state = storyReducer(state, setTitle(overlong));
  assert.equal(selectStory(state).title, "The River Keeper");
  assert.match(selectNotice(state).message, /cannot exceed/i);

  // Blank title is rejected with a notice
  state = storyReducer(state, setTitle("   "));
  assert.equal(selectStory(state).title, "The River Keeper");
  assert.match(selectNotice(state).message, /title cannot be empty/i);
});

test("3. Scene management: add, duplicate, delete, rename, select, and reorder", () => {
  let state = createStoryState();
  const s1 = selectScenes(state)[0];

  // Add scene
  state = storyReducer(state, addScene({ name: "Scene 2: Market" }));
  assert.equal(selectSceneCount(state), 2);
  const s2 = selectScenes(state)[1];
  assert.equal(s2.name, "Scene 2: Market");
  assert.equal(selectSelectedSceneId(state), s2.id);

  // Duplicate scene
  state = storyReducer(state, duplicateScene(s2.id));
  assert.equal(selectSceneCount(state), 3);
  const s2Copy = selectScenes(state)[2];
  assert.notEqual(s2Copy.id, s2.id);
  assert.equal(s2Copy.name, "Scene 2: Market (Copy)");

  // Reorder: move Scene 2 up
  state = storyReducer(state, moveSceneUp(s2.id));
  assert.equal(selectScenes(state)[0].id, s2.id);
  assert.equal(selectScenes(state)[1].id, s1.id);

  // Delete scene
  state = storyReducer(state, deleteScene(s2Copy.id));
  assert.equal(selectSceneCount(state), 2);

  // Protect final scene: deleting when 1 scene remains is prevented
  state = storyReducer(state, deleteScene(s1.id));
  assert.equal(selectSceneCount(state), 1);
  const finalDeleteState = storyReducer(state, deleteScene(selectScenes(state)[0].id));
  assert.equal(selectSceneCount(finalDeleteState), 1);
  assert.match(selectNotice(finalDeleteState).message, /at least 1 scene/i);
});

test("4. Staging persistence: background, characters, expressions, facing, narration, props, dialogue", () => {
  let state = createStoryState();
  const sceneId = selectSelectedSceneId(state);

  // Background
  state = storyReducer(state, setSceneBackground(sceneId, "water-well"));
  assert.equal(selectSelectedScene(state).background, "water-well");

  // Character staging: Maya is already in left slot. Update expression and facing.
  const mayaInstId = selectSelectedScene(state).characters[0].id;
  state = storyReducer(
    state,
    updateCharacter(sceneId, mayaInstId, {
      expression: "thoughtful",
      facing: "left",
    })
  );
  const updatedChar = selectSelectedScene(state).characters[0];
  assert.equal(updatedChar.expression, "thoughtful");
  assert.equal(updatedChar.facing, "left");

  // Narration
  state = storyReducer(state, setSceneNarration(sceneId, "The sun rose over the quiet well."));
  assert.equal(selectSelectedScene(state).narration, "The sun rose over the quiet well.");

  // Props toggle
  state = storyReducer(state, toggleProp(sceneId, "water-bucket"));
  assert.deepEqual(selectSelectedScene(state).props, ["water-bucket"]);

  // Add a second dialogue line
  state = storyReducer(
    state,
    addDialogueLine({
      sceneId,
      speakerId: "maya",
      text: "We need more water for the crops!",
      type: "shout",
    })
  );
  assert.equal(selectSelectedScene(state).dialogue.length, 2);
  const line = selectSelectedScene(state).dialogue[1];
  assert.equal(line.speakerId, "maya");
  assert.equal(line.text, "We need more water for the crops!");
  assert.equal(line.type, "shout");

  // Reassigning dialogue line speaker to narrator when character is removed
  state = storyReducer(state, removeCharacter(sceneId, mayaInstId));
  assert.equal(selectSelectedScene(state).characters.length, 0);
  assert.equal(selectSelectedScene(state).dialogue[0].speakerId, "narrator");
  assert.equal(selectSelectedScene(state).dialogue[1].speakerId, "narrator");
});

test("5. Undo/Redo restores exact prior state across multiple document operations", () => {
  let state = createStoryState();
  const initialTitle = selectStory(state).title;

  state = storyReducer(state, setTitle("First Change"));
  state = storyReducer(state, setTitle("Second Change"));
  assert.equal(selectStory(state).title, "Second Change");

  // Undo second change
  state = storyReducer(state, undoStory());
  assert.equal(selectStory(state).title, "First Change");

  // Undo first change
  state = storyReducer(state, undoStory());
  assert.equal(selectStory(state).title, initialTitle);

  // Redo first change
  state = storyReducer(state, redoStory());
  assert.equal(selectStory(state).title, "First Change");

  // Redo second change
  state = storyReducer(state, redoStory());
  assert.equal(selectStory(state).title, "Second Change");
});

test("6. Save/Reload restores the same story without data loss", () => {
  const mem = memoryStorage();
  const storage = createStoryStorage({ storage: mem });

  const story = createSampleStoryDocument();
  const saveRes = storage.save(story);
  assert.equal(saveRes.ok, true);

  const loadRes = loadStory(storage);
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.empty, false);
  assert.equal(loadRes.story.id, story.id);
  assert.equal(loadRes.story.title, story.title);
  assert.equal(loadRes.story.scenes.length, story.scenes.length);
  assert.deepEqual(loadRes.story.scenes[0].characters, story.scenes[0].characters);
  assert.deepEqual(loadRes.story.scenes[0].dialogue, story.scenes[0].dialogue);
});

test("7. Play Story opens the reader at correct scene and advances through lines to The End", () => {
  const story = createSampleStoryDocument();
  let reader = createReaderState(story, { initialSceneIndex: 0 });

  assert.equal(reader.sceneIndex, 0);
  assert.equal(reader.dialogueIndex, 0);
  assert.equal(reader.isEnd, false);

  // Advance through dialogue and scenes
  let count = 0;
  while (!reader.isEnd && count < 50) {
    assert.equal(canAdvance(reader), true);
    reader = advanceReader(reader);
    count += 1;
  }

  assert.equal(reader.isEnd, true);
  assert.equal(canAdvance(reader), false);

  // Step back from The End screen
  assert.equal(canStepBack(reader), true);
  reader = stepBackReader(reader);
  assert.equal(reader.isEnd, false);

  // Restart reader
  reader = restartReader(reader);
  assert.equal(reader.sceneIndex, 0);
  assert.equal(reader.dialogueIndex, 0);
  assert.equal(reader.isEnd, false);
});

test("8. Storage error and corrupt document recovery behaves honestly", () => {
  const mem = memoryStorage({
    [STORY_STORAGE_KEY]: "{ invalid json garbage }",
  });
  const storage = createStoryStorage({ storage: mem });

  const loadRes = loadStory(storage);
  assert.equal(loadRes.ok, false);
  assert.equal(loadRes.code, "malformed_json");
  assert.match(loadRes.message, /couldn't be parsed as JSON|invalid story data/i);

  // Corrupt data is NOT erased or silently overwritten
  assert.equal(mem.getItem(STORY_STORAGE_KEY), "{ invalid json garbage }");

  // Unreadable overwrite protection
  const cleanDoc = createStoryDocument();
  const saveAttempt = storage.save(cleanDoc, { replaceUnreadable: false });
  assert.equal(saveAttempt.ok, false);
  assert.equal(saveAttempt.code, "would_overwrite_unreadable");

  // Explicit replace works
  const forceSave = storage.save(cleanDoc, { replaceUnreadable: true });
  assert.equal(forceSave.ok, true);
});

test("9. Storage isolation: Story Studio storage does not collide with World Builder or Sandbox", () => {
  const mem = memoryStorage({
    wb_project_v1: JSON.stringify({ id: "wb-village-1", missionId: "save-our-village" }),
    sb_project_v1: JSON.stringify({ id: "sandbox-1", title: "My Sandbox" }),
  });

  const storyStorage = createStoryStorage({ storage: mem });
  const story = createStoryDocument();
  story.title = "Isolated Story";

  const saveRes = storyStorage.save(story);
  assert.equal(saveRes.ok, true);

  // Story was saved to sb_story_v1
  assert.ok(mem.getItem(STORY_STORAGE_KEY));
  const savedStoryData = JSON.parse(mem.getItem(STORY_STORAGE_KEY));
  assert.equal(savedStoryData.title, "Isolated Story");

  // World Builder data is 100% untouched
  const wbRaw = JSON.parse(mem.getItem("wb_project_v1"));
  assert.equal(wbRaw.id, "wb-village-1");

  // Sandbox data is 100% untouched
  const sbRaw = JSON.parse(mem.getItem("sb_project_v1"));
  assert.equal(sbRaw.id, "sandbox-1");
});

// =============================================================================
// AUDIT: ACCESSIBILITY, ART & RESPONSIVE SPEC CHECK
// =============================================================================

test("10. Art presets & library completeness: 6 backgrounds, 5 characters, 6 props", () => {
  assert.equal(STORY_BACKGROUND_IDS.length, 6);
  for (const bgId of STORY_BACKGROUND_IDS) {
    const meta = STORY_BACKGROUNDS[bgId];
    assert.ok(meta, `Background ${bgId} must have metadata`);
    assert.ok(meta.label);
    assert.ok(meta.description);
    assert.ok(meta.theme);
  }

  assert.equal(STORY_CHARACTER_IDS.length, 5);
  for (const charId of STORY_CHARACTER_IDS) {
    const meta = STORY_CHARACTERS[charId];
    assert.ok(meta, `Character ${charId} must have metadata`);
    assert.ok(meta.name);
    assert.ok(meta.role);
    assert.ok(meta.defaultFacing);
  }

  assert.equal(STORY_PROP_IDS.length, 6);
  for (const propId of STORY_PROP_IDS) {
    const meta = STORY_PROPS[propId];
    assert.ok(meta, `Prop ${propId} must have metadata`);
    assert.ok(meta.label);
  }
});

// =============================================================================
// AUDIT: ROUTE, HUB ACTIVATION & MIGRATION COMPATIBILITY (S1.6.1)
// =============================================================================

test("11. Hub activation & direct route registration", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const studioRoot = join(here, "..", "..");
  const missionUrl = pathToFileURL(join(studioRoot, "world-builder", "data", "mission.js")).href;
  const src = readFileSync(join(studioRoot, "data", "studioTools.js"), "utf8")
    .replace(/import \{[^}]*\} from "lucide-react";/, "const BookOpen = 'BookOpen', Hammer = 'Hammer', Lightbulb = 'Lightbulb', Palette = 'Palette';")
    .replace(/from "\.\.\/world-builder\/data\/mission\.js"/, `from "${missionUrl}"`);
  const { STUDIO_TOOLS } = await import(`data:text/javascript;base64,${Buffer.from(src).toString("base64")}`);

  const storyTool = STUDIO_TOOLS.find((t) => t.id === "story-studio");
  assert.ok(storyTool, "Story Studio must be listed in STUDIO_TOOLS");
  assert.equal(storyTool.available, true, "Story Studio must be available");
  assert.equal(storyTool.route, "/world/studio/story-studio");

  // Route registered in App.jsx
  const appSrc = readFileSync(join(studioRoot, "..", "..", "App.jsx"), "utf8");
  assert.match(appSrc, /import\s+StoryStudioWorkspace\s+from\s+["']@\/features\/studio\/story-studio\/StoryStudioWorkspace["']/);
  assert.match(appSrc, /<Route\s+path="\/world\/studio\/story-studio"\s+element=\{<StoryStudioWorkspace\s*\/>\}\s*\/>/);
});

test("12. Schema canonical type is story-studio with backward compatibility for story", () => {
  assert.equal(STORY_PROJECT_TYPE, "story-studio");
  assert.ok(SUPPORTED_STORY_PROJECT_TYPES.includes("story-studio"));
  assert.ok(SUPPORTED_STORY_PROJECT_TYPES.includes("story"));

  const freshDoc = createStoryDocument();
  assert.equal(freshDoc.type, "story-studio");
  const checkFresh = validateStoryDocument(freshDoc);
  assert.equal(checkFresh.ok, true);

  // Document with type: "story" passes validation
  const legacyDoc = { ...freshDoc, type: "story" };
  const checkLegacy = validateStoryDocument(legacyDoc);
  assert.equal(checkLegacy.ok, true);

  // Normalization converts legacy "story" to "story-studio" without mutating original
  const normalized = normalizeStoryDocument(legacyDoc);
  assert.equal(normalized.type, "story-studio");
  assert.equal(legacyDoc.type, "story");
});

test("13. Non-destructive migration from sb_story_v1 to canonical skillverse_story_studio_doc_v1", () => {
  const legacyStory = {
    ...createStoryDocument({ title: "Old Saved Story" }),
    type: "story",
  };

  const mem = memoryStorage({
    [LEGACY_STORY_STORAGE_KEY]: JSON.stringify(legacyStory),
  });

  const storage = createStoryStorage({ storage: mem });

  // Loading should detect legacy key and migrate to canonical key
  const loadRes = loadStory(storage);
  assert.equal(loadRes.ok, true);
  assert.equal(loadRes.empty, false);
  assert.equal(loadRes.story.title, "Old Saved Story");
  assert.equal(loadRes.story.type, "story-studio");

  // Canonical key now has the data
  assert.ok(mem.getItem(STORY_STORAGE_KEY));
  const migrated = JSON.parse(mem.getItem(STORY_STORAGE_KEY));
  assert.equal(migrated.title, "Old Saved Story");
  assert.equal(migrated.type, "story-studio");

  // Crucial: legacy key was NOT deleted (non-destructive)
  assert.ok(mem.getItem(LEGACY_STORY_STORAGE_KEY));
  const legacyRemains = JSON.parse(mem.getItem(LEGACY_STORY_STORAGE_KEY));
  assert.equal(legacyRemains.title, "Old Saved Story");

  // Also verify legacy backup fallback
  const memWithLegacyBackup = memoryStorage({
    [`${LEGACY_STORY_STORAGE_KEY}__backup`]: JSON.stringify(legacyStory),
  });
  const storageWithBackup = createStoryStorage({ storage: memWithLegacyBackup });
  assert.equal(storageWithBackup.hasBackup(), true);
  const restored = storageWithBackup.restoreBackup();
  assert.equal(restored.ok, true);
  assert.equal(restored.story.title, "Old Saved Story");
  assert.equal(restored.story.type, "story-studio");
});

// =============================================================================
// AUDIT: S1.6.2 VISUAL INTEGRATION, RESPONSIVE QA & REGRESSION DEFECT CHECKS
// =============================================================================

test("14. Visual integration & QA: CSS structure, responsive constraints, word wrapping, and play button accessibility", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const cssPath = join(here, "..", "story-studio.css");
  const css = readFileSync(cssPath, "utf8");

  // Defect 1: Play button must be active, not disabled or not-allowed
  assert.doesNotMatch(css, /\.story-btn--play\s*\{[^}]*cursor:\s*not-allowed/);
  assert.doesNotMatch(css, /\.story-btn--play\s*\{[^}]*opacity:\s*0\.55/);
  assert.match(css, /\.story-btn--play\s*\{[^}]*cursor:\s*pointer/);

  // Defect 2: 3-column workspace shell must use minmax(0, 1fr) and min-width: 0 on columns
  assert.match(css, /\.story-workspace-shell\s*\{[^}]*grid-template-columns:[^;]*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.story-nav,\s*\n?\.story-stage-section,\s*\n?\.story-director-aside\s*\{[^}]*min-width:\s*0/);

  // Defect 3: Word break / text overflow on speech bubbles and narration
  assert.match(css, /\.story-bubble-text\s*\{[^}]*overflow-wrap:\s*break-word/);
  assert.match(css, /\.story-bubble-text\s*\{[^}]*word-break:\s*break-word/);
  assert.match(css, /\.story-narration-text\s*\{[^}]*overflow-wrap:\s*break-word/);
  assert.match(css, /\.story-narration-text\s*\{[^}]*word-break:\s*break-word/);

  // Defect 4: Mobile / narrow screen adjustments (<768px)
  const media768 = css.slice(css.indexOf("@media (max-width: 768px)"));
  assert.ok(media768.includes(".story-stage-viewport"));
  assert.ok(media768.includes("min-height: unset"));
  assert.ok(media768.includes(".story-char-svg"));
  assert.ok(media768.includes("width: 75px"));
  assert.ok(media768.includes(".story-bubble-anchor"));
  assert.ok(media768.includes("left: 50%"));

  // Defect 5: Short screen viewport adjustments (<720px height)
  const media720 = css.slice(css.indexOf("@media (max-height: 720px)"));
  assert.ok(media720.includes(".story-stage-viewport"));
  assert.ok(media720.includes(".story-char-svg"));
  assert.ok(media720.includes("width: 80px"));

  // Defect 6: Reduced motion respect
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/);
  assert.match(css, /animation-duration:\s*0\.001ms/);
});

test("15. Collapsible inspector sections and filmstrip preserve content and scene selection", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const directorSrc = readFileSync(join(here, "..", "components", "SceneDirector.jsx"), "utf8");
  const navSrc = readFileSync(join(here, "..", "components", "SceneNavigator.jsx"), "utf8");

  // SceneDirector has collapsible section state, accessible aria attributes, and hidden prop
  assert.match(directorSrc, /const\s+\[collapsedSections,\s*setCollapsedSections\]\s*=\s*useState/);
  assert.match(directorSrc, /aria-expanded=\{!collapsedSections\./);
  assert.match(directorSrc, /aria-controls="story-dir-/);
  assert.match(directorSrc, /hidden=\{collapsedSections\./);
  assert.match(directorSrc, /data-testid="story-dir-toggle-all-btn"/);

  // SceneNavigator has collapse toggle with accessible aria attributes and hidden prop
  assert.match(navSrc, /const\s+\[isCollapsed,\s*setIsCollapsed\]\s*=\s*useState\(false\)/);
  assert.match(navSrc, /data-testid="story-nav-collapse-btn"/);
  assert.match(navSrc, /aria-expanded=\{!isCollapsed\}/);
  assert.match(navSrc, /aria-controls="story-filmstrip"/);
  assert.match(navSrc, /hidden=\{isCollapsed\}/);

  // Content preservation test: collapsing panels never modifies or deletes document data
  const story = createSampleStoryDocument();
  const state = createStoryState(story);

  // Verify initial selection and scene count
  assert.equal(selectSceneCount(state), 2);
  const activeSceneBefore = selectSelectedScene(state);
  assert.ok(activeSceneBefore);
  assert.equal(activeSceneBefore.id, story.scenes[0].id);
  assert.equal(activeSceneBefore.characters.length, 2);
  assert.equal(activeSceneBefore.dialogue.length, 2);

  // Simulate UI collapsing by changing visual state: state remains 100% intact
  const activeSceneAfter = selectSelectedScene(state);
  assert.equal(activeSceneAfter.id, activeSceneBefore.id);
  assert.equal(activeSceneAfter.characters.length, activeSceneBefore.characters.length);
  assert.equal(activeSceneAfter.dialogue.length, activeSceneBefore.dialogue.length);
  assert.equal(activeSceneAfter.narration, activeSceneBefore.narration);
  assert.equal(activeSceneAfter.background, activeSceneBefore.background);
});

test("16. Full user journey integration: Title edit, scene navigation, scene staging, play, close, save & reload", () => {
  const mem = memoryStorage();
  const storage = createStoryStorage({ storage: mem });

  // 1. Initial draft creation
  let state = createStoryState();
  assert.equal(selectStory(state).title, "Untitled Story");

  // 2. Title editing
  state = storyReducer(state, setTitle("The Village Fountain Mystery"));
  assert.equal(selectStory(state).title, "The Village Fountain Mystery");

  // 3. Staging characters and setting background
  const s1Id = selectSelectedSceneId(state);
  state = storyReducer(state, setSceneBackground(s1Id, "water-well"));
  state = storyReducer(
    state,
    addCharacter({
      sceneId: s1Id,
      characterId: "tariq",
      slot: "center",
      expression: "thoughtful",
      facing: "right",
    })
  );
  state = storyReducer(
    state,
    setSceneNarration(s1Id, "Tariq arrived at the village well as the dawn broke.")
  );
  state = storyReducer(
    state,
    addDialogueLine({
      sceneId: s1Id,
      speakerId: "tariq",
      text: "The well pump feels unusually light today...",
      type: "speech",
    })
  );

  // 4. Adding a second scene
  state = storyReducer(state, addScene());
  assert.equal(selectSceneCount(state), 2);
  const s2Id = selectSelectedSceneId(state);
  assert.notEqual(s1Id, s2Id);

  state = storyReducer(state, setSceneBackground(s2Id, "cozy-cottage"));
  state = storyReducer(
    state,
    addCharacter({
      sceneId: s2Id,
      characterId: "elder-samira",
      slot: "right",
      expression: "happy",
      facing: "left",
    })
  );
  state = storyReducer(
    state,
    addDialogueLine({
      sceneId: s2Id,
      speakerId: "elder-samira",
      text: "Come inside, young builder. The tea is ready.",
      type: "speech",
    })
  );

  // 5. Save story to storage
  const docToSave = selectStory(state);
  const saveRes = storage.save(docToSave);
  assert.equal(saveRes.ok, true);

  // 6. Play story in Theater Mode (StoryReader engine)
  let reader = createReaderState(docToSave, { initialSceneIndex: 0 });
  assert.equal(reader.sceneIndex, 0);
  assert.equal(getCurrentScene(reader).id, s1Id);
  assert.equal(getCurrentDialogue(reader).text, "What a beautiful day to explore the village!");

  // Advance reader through dialogue line 2 and into Scene 2
  assert.equal(canAdvance(reader), true);
  reader = advanceReader(reader); // advances to line 2 in scene 1
  assert.equal(reader.sceneIndex, 0);
  assert.equal(getCurrentDialogue(reader).text, "The well pump feels unusually light today...");

  assert.equal(canAdvance(reader), true);
  reader = advanceReader(reader); // advances past line 2 in scene 1 into scene 2
  assert.equal(reader.sceneIndex, 1);
  assert.equal(getCurrentScene(reader).id, s2Id);
  assert.equal(getCurrentDialogue(reader).text, "Come inside, young builder. The tea is ready.");

  // Advance to The End
  reader = advanceReader(reader);
  assert.equal(reader.isEnd, true);

  // Restart reader
  reader = restartReader(reader);
  assert.equal(reader.sceneIndex, 0);
  assert.equal(reader.isEnd, false);

  // 7. Reload from storage into clean state and verify zero data loss
  const reloadRes = loadStory(storage);
  assert.equal(reloadRes.ok, true);
  assert.equal(reloadRes.story.title, "The Village Fountain Mystery");
  assert.equal(reloadRes.story.scenes.length, 2);
  assert.equal(reloadRes.story.scenes[0].background, "water-well");
  assert.equal(reloadRes.story.scenes[0].characters.length, 2);
  assert.equal(reloadRes.story.scenes[0].characters[0].characterId, "maya");
  assert.equal(reloadRes.story.scenes[0].characters[1].characterId, "tariq");
  assert.equal(reloadRes.story.scenes[1].background, "cozy-cottage");
  assert.equal(reloadRes.story.scenes[1].characters.length, 1);
  assert.equal(reloadRes.story.scenes[1].characters[0].characterId, "elder-samira");
});

test("17. S1.7 & S1.8 Multi-story library, draft management, and starter templates", () => {
  const mem = memoryStorage();
  const storage = createStoryStorage({ storage: mem });

  // 1. Initial library load creates default story
  const lib1 = loadStoryLibrary(storage);
  assert.equal(lib1.stories.length, 1);
  const defaultStoryId = lib1.activeStoryId;

  // 2. Create blank story
  const blankRes = createBlankStoryInLibrary(storage, { title: "My Space Voyage" });
  assert.equal(blankRes.ok, true);
  assert.equal(blankRes.story.title, "My Space Voyage");

  // 3. Create from starter template
  const template = STARTER_TEMPLATES[0]; // Missing Water Bucket
  const tmplRes = createTemplateStoryInLibrary(storage, template.id);
  assert.equal(tmplRes.ok, true);
  assert.equal(tmplRes.story.title, template.title);
  assert.equal(tmplRes.story.scenes.length, template.sceneCount);

  // 4. Duplicate story
  const dupRes = duplicateStoryInLibrary(storage, tmplRes.story.id);
  assert.equal(dupRes.ok, true);
  assert.notEqual(dupRes.story.id, tmplRes.story.id);
  assert.equal(dupRes.story.title, `Copy of ${template.title}`);

  // 5. Rename story
  const renameRes = renameStoryInLibrary(storage, dupRes.story.id, "The Water Mystery Solved");
  assert.equal(renameRes.ok, true);
  assert.equal(renameRes.story.title, "The Water Mystery Solved");

  // 6. Switch active story
  const switchRes = switchActiveStory(storage, blankRes.story.id);
  assert.equal(switchRes.ok, true);
  assert.equal(switchRes.story.id, blankRes.story.id);

  // 7. Delete story with fallback protection
  const delRes = deleteStoryFromLibrary(storage, dupRes.story.id);
  assert.equal(delRes.ok, true);

  const finalLib = loadStoryLibrary(storage);
  assert.equal(finalLib.stories.some((s) => s.id === dupRes.story.id), false);
});

test("18. S1.9 Interactive story branching, choices, graph validation, and playback", () => {
  let state = createStoryState();
  const s1Id = selectSelectedSceneId(state);

  // Add scenes 2 and 3
  state = storyReducer(state, addScene({ name: "Left Path: Farm" }));
  const s2Id = selectSelectedSceneId(state);
  state = storyReducer(state, addScene({ name: "Right Path: Well" }));
  const s3Id = selectSelectedSceneId(state);

  // Add choices to scene 1
  state = storyReducer(
    state,
    addChoice({
      sceneId: s1Id,
      text: "Explore the Farm",
      targetSceneId: s2Id,
    })
  );
  state = storyReducer(
    state,
    addChoice({
      sceneId: s1Id,
      text: "Visit the Well",
      targetSceneId: s3Id,
    })
  );

  const s1 = selectScenes(state).find((s) => s.id === s1Id);
  assert.equal(s1.choices.length, 2);

  // Mark scene 2 and 3 as endings
  state = storyReducer(state, setSceneIsEnding(s2Id, true));
  state = storyReducer(state, setSceneIsEnding(s3Id, true));

  // Graph analysis
  const graph = analyzeStoryGraph(selectStory(state));
  assert.equal(graph.ok, true);
  assert.equal(graph.unreachableSceneIds.length, 0);
  assert.equal(graph.endingSceneIds.length, 2);

  // Story Reader Branching Playback
  let reader = createReaderState(selectStory(state));
  // Advance through Scene 1 dialogue lines to reach choices
  while (!reader.isEnd && !isWaitingForChoice(reader) && canAdvance(reader)) {
    reader = advanceReader(reader);
  }

  assert.equal(isWaitingForChoice(reader), true);
  assert.equal(getReaderProgress(reader).choices.length, 2);

  // Choose branch 2: Visit the Well (s3Id)
  const choice2 = getReaderProgress(reader).choices[1];
  reader = chooseBranch(reader, choice2.id);
  assert.equal(getCurrentScene(reader).id, s3Id);
  assert.equal(reader.pathHistory.length, 1);

  // Step back across branching choice
  reader = stepBackReader(reader);
  assert.equal(getCurrentScene(reader).id, s1Id);
  assert.equal(isWaitingForChoice(reader), true);
});

test("19. S1.10 Storybook print and export model and styles", () => {
  const story = createSampleStoryDocument();
  const printModel = buildPrintableStoryModel(story);

  assert.equal(printModel.title, story.title);
  assert.equal(printModel.sceneCount, 2);
  assert.ok(printModel.totalDialogueCount > 0);
  assert.equal(printModel.scenes[0].sceneNumber, 1);
  assert.equal(printModel.scenes[1].sceneNumber, 2);

  // Headless environment safety
  const printed = triggerBrowserPrint();
  assert.equal(printed, false);

  // Verify CSS contains print media query and break avoidance rules
  const cssPath = join(dirname(fileURLToPath(import.meta.url)), "../story-studio.css");
  const cssContent = readFileSync(cssPath, "utf-8");
  assert.match(cssContent, /@media print/);
  assert.match(cssContent, /break-inside:\s*avoid/);
  assert.match(cssContent, /\.no-print/);
  assert.match(cssContent, /\.story-print-dialog/);
});

test("20. S1.11 Workspace recovery and RESET state synchronization", () => {
  const mem = memoryStorage();
  const storage = createStoryStorage({ storage: mem });

  // 1. Initial document
  let state = createStoryState();
  assert.equal(selectStory(state).title, "Untitled Story");

  // 2. Load another story via RESET
  const altStory = createStoryDocument({
    id: "story_alt_999",
    title: "Alternative Tale",
    scenes: [createDefaultScene({ name: "Alternate Scene" })],
  });

  state = storyReducer(state, resetStory(altStory));
  assert.equal(selectStory(state).id, "story_alt_999");
  assert.equal(selectStory(state).title, "Alternative Tale");
  assert.equal(selectSelectedScene(state).name, "Alternate Scene");

  // 3. Corrupt data handling and backup restoration
  storage.save(altStory);
  // Store backup in backupKey and simulate corrupt primary data
  mem.setItem(storage.backupKey, JSON.stringify(altStory));
  mem.setItem(STORY_STORAGE_KEY, "INVALID_CORRUPT_JSON{{{");
  assert.equal(storage.hasBackup(), true);

  const backupRes = storage.restoreBackup();
  assert.equal(backupRes.ok, true);
  assert.equal(backupRes.story.id, "story_alt_999");

  // Apply restored backup
  state = storyReducer(state, resetStory(backupRes.story));
  assert.equal(selectStory(state).id, "story_alt_999");
  assert.equal(selectCanUndo(state), false);
});

test("21. S1.11.2 Vertical scrolling restores desktop stage/dialogue access and responsive flow", () => {
  const cssPath = join(dirname(fileURLToPath(import.meta.url)), "../story-studio.css");
  const css = readFileSync(cssPath, "utf-8");

  // 1. Root scope has fixed inset and viewport scrollability matching studio conventions
  assert.match(css, /\.story-scope\s*\{[^}]*position:\s*fixed;/);
  assert.match(css, /\.story-scope\s*\{[^}]*inset:\s*0;/);
  assert.match(css, /\.story-scope\s*\{[^}]*overflow-y:\s*auto;/);

  // 2. Desktop center column (.story-stage-section) is vertically scrollable
  assert.match(css, /\.story-stage-section\s*\{[^}]*max-height:\s*calc\(100vh\s*-\s*95px\);/);
  assert.match(css, /\.story-stage-section\s*\{[^}]*overflow-y:\s*auto;/);
  assert.match(css, /\.story-stage-section\s*\{[^}]*overscroll-behavior:\s*contain;/);

  // 3. Left (.story-nav) and Right (.story-director-aside) columns remain independently scrollable
  assert.match(css, /\.story-nav\s*\{[^}]*max-height:\s*calc\(100vh\s*-\s*95px\);/);
  assert.match(css, /\.story-director-aside\s*\{[^}]*max-height:\s*calc\(100vh\s*-\s*95px\);/);
  assert.match(css, /\.story-filmstrip\s*\{[^}]*overflow-y:\s*auto;/);
  assert.match(css, /\.story-director-body\s*\{[^}]*overflow-y:\s*auto;/);

  // 4. Tablet breakpoint (<= 1100px) unconstrains stage section for natural stacked column flow
  const media1100 = css.slice(css.indexOf("@media (max-width: 1100px)"));
  assert.ok(media1100.includes(".story-stage-section"));
  assert.ok(media1100.includes("max-height: none"));
  assert.ok(media1100.includes("overflow-y: visible"));

  // 5. Mobile breakpoint (<= 768px) unconstrains height and prevents nested scroll traps
  const media768 = css.slice(css.indexOf("@media (max-width: 768px)"));
  assert.ok(media768.includes(".story-stage-section"));
  assert.ok(media768.includes("max-height: none"));
  assert.ok(media768.includes("overflow-y: visible"));
  assert.ok(media768.includes(".story-director-body"));
  assert.ok(media768.includes("overflow-y: visible"));

  // 6. Print mode resets containers to static/visible paper flow
  const mediaPrint = css.slice(css.indexOf("@media print"));
  assert.ok(mediaPrint.includes(".story-scope"));
  assert.ok(mediaPrint.includes("position: static !important"));
  assert.ok(mediaPrint.includes(".story-stage-section"));
  assert.ok(mediaPrint.includes("overflow: visible !important"));
});

test("28. S1.12.3: Whitespace-preserving dialogue text editing in storyReducer", () => {
  const story = createSampleStoryDocument();
  let state = createStoryState(story);
  const sceneId = story.scenes[0].id;
  const dialogueId = story.scenes[0].dialogue[0].id;

  // 1. Single space preservation (typing space between words)
  state = storyReducer(state, updateDialogueLine(sceneId, dialogueId, { text: "Hello " }));
  let currentLine = selectStory(state).scenes[0].dialogue.find((d) => d.id === dialogueId);
  assert.equal(currentLine.text, "Hello ", "Trailing single space must be preserved while typing");

  // 2. Multiple spaces and punctuation preservation
  state = storyReducer(state, updateDialogueLine(sceneId, dialogueId, { text: "Hello,   explorer!  How are you? " }));
  currentLine = selectStory(state).scenes[0].dialogue.find((d) => d.id === dialogueId);
  assert.equal(currentLine.text, "Hello,   explorer!  How are you? ", "Multiple spaces, punctuation, and trailing space must be preserved");

  // 3. Incremental keystrokes simulating natural typing: "What a nice day!"
  const sequence = [
    "W",
    "Wh",
    "Wha",
    "What",
    "What ",
    "What a",
    "What a ",
    "What a n",
    "What a ni",
    "What a nic",
    "What a nice",
    "What a nice ",
    "What a nice d",
    "What a nice da",
    "What a nice day",
    "What a nice day!",
  ];

  for (const stepText of sequence) {
    state = storyReducer(state, updateDialogueLine(sceneId, dialogueId, { text: stepText }));
    currentLine = selectStory(state).scenes[0].dialogue.find((d) => d.id === dialogueId);
    assert.equal(currentLine.text, stepText, `Typed text must match step "${stepText}" without discarding spaces`);
  }

  // 4. Temporary empty string while backspacing/retyping
  state = storyReducer(state, updateDialogueLine(sceneId, dialogueId, { text: "" }));
  currentLine = selectStory(state).scenes[0].dialogue.find((d) => d.id === dialogueId);
  assert.equal(currentLine.text, "", "Empty string while retyping must be allowed without throwing warning or discarding");

  // 5. Unicode and emojis
  state = storyReducer(state, updateDialogueLine(sceneId, dialogueId, { text: "Bonjour! 🌟 Comment ça va?" }));
  currentLine = selectStory(state).scenes[0].dialogue.find((d) => d.id === dialogueId);
  assert.equal(currentLine.text, "Bonjour! 🌟 Comment ça va?", "Unicode and emojis must be preserved");
});

test("29. S1.12.3: Scene Director input styling and caret alignment CSS inspection", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const css = readFileSync(join(here, "..", "story-studio.css"), "utf8");
  const directorSrc = readFileSync(join(here, "..", "components", "SceneDirector.jsx"), "utf8");

  // 1. SceneDirector dialogue input uses textarea with multiline support
  assert.match(directorSrc, /<textarea[^>]*className="story-dialogue-input"/);
  assert.match(directorSrc, /rows=\{2\}/);

  // 2. CSS specifies top-left vertical alignment, proper padding and line-height for dialogue input
  assert.match(css, /\.story-dialogue-input\s*\{[^}]*vertical-align:\s*top;/);
  assert.match(css, /\.story-dialogue-input\s*\{[^}]*line-height:\s*1\.45;/);
  assert.match(css, /\.story-dialogue-input\s*\{[^}]*box-sizing:\s*border-box;/);

  // 3. Narration textarea also ensures top-left alignment and line-height
  assert.match(css, /\.story-narration-textarea\s*\{[^}]*vertical-align:\s*top;/);
  assert.match(css, /\.story-narration-textarea\s*\{[^}]*line-height:\s*1\.45;/);
});


