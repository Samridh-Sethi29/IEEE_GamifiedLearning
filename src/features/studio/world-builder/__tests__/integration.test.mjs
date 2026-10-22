import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { createObject, createProject, validateProject } from "../../engine/schema.js";
import { getPaletteObjectTypes } from "../../engine/objectTypes.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { getWaterOverlayData } from "../engine/waterOverlayModel.js";
import {
  WORLD_BUILDER_STORAGE_KEY,
  createWorldBuilderStorage,
  initializeWorldBuilderProject,
  resolveWorldBuilderView,
} from "../engine/worldBuilderWorkspaceModel.js";
import { MISSION } from "../data/mission.js";

const here = dirname(fileURLToPath(import.meta.url));
const studioRoot = join(here, "..", "..");

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}

test("1. Start Designing action is enabled in mission data and configuration", () => {
  assert.equal(MISSION.startAction.enabled, true);
  assert.equal(MISSION.startAction.label, "Start Designing");
  assert.equal(typeof MISSION.startAction.preparingTitle, "string");
  assert.ok(MISSION.startAction.preparingTitle.length > 0);
});

test("2. View state routing resolves correctly between briefing and workspace", () => {
  // Empty or default search params resolve to briefing
  assert.equal(resolveWorldBuilderView(new URLSearchParams("")), "briefing");
  assert.equal(resolveWorldBuilderView(new URLSearchParams("tab=overview")), "briefing");
  assert.equal(resolveWorldBuilderView(null), "briefing");
  assert.equal(resolveWorldBuilderView({}), "briefing");

  // mode=edit resolves to editor
  assert.equal(resolveWorldBuilderView(new URLSearchParams("mode=edit")), "editor");
  assert.equal(resolveWorldBuilderView({ mode: "edit" }), "editor");

  // Briefing component source verifies searchParams wiring
  const briefingSrc = readFileSync(
    join(studioRoot, "world-builder", "pages", "WorldBuilderBriefing.jsx"),
    "utf8"
  );
  assert.match(briefingSrc, /resolveWorldBuilderView/);
  assert.match(briefingSrc, /setSearchParams\(\{\s*mode:\s*"edit"\s*\}\)/);
  assert.match(briefingSrc, /<WorldBuilderWorkspace\s+onBack=/);
});

test("3. WorldBuilderWorkspace uses dedicated storage key isolated from sandbox and player", () => {
  assert.equal(WORLD_BUILDER_STORAGE_KEY, "skillverse_world_builder_doc_v1");
  const storage = createWorldBuilderStorage(memoryStorage());
  assert.equal(storage.key, WORLD_BUILDER_STORAGE_KEY);
  assert.doesNotMatch(storage.key, /sandbox|demo|player|save/i);
});

test("4. Workspace initialization automatically restores saved work or creates a new project", () => {
  const mem = memoryStorage();
  const storage = createWorldBuilderStorage(mem);

  // When empty: creates a fresh world-builder document
  const fresh = initializeWorldBuilderProject(storage);
  assert.equal(fresh.type, "world-builder");
  assert.equal(fresh.objects.length, 0);

  // Save a document
  const doc = createProject({
    title: "Saved Village",
    type: "world-builder",
    objects: [
      createObject("well", { id: "w1", x: 100, y: 100 }),
      createObject("pipe", { id: "p1", x: 150, y: 109 }),
    ],
  });
  const saveRes = storage.save(doc);
  assert.equal(saveRes.ok, true);

  // On reopening: automatically restores the saved project
  const restored = initializeWorldBuilderProject(storage);
  assert.equal(restored.type, "world-builder");
  assert.equal(restored.objects.length, 2);
  assert.equal(restored.objects[0].id, "w1");
  assert.equal(restored.objects[1].id, "p1");

  // Explicit Load via storage adapter also returns the project
  const explicitLoad = storage.load();
  assert.equal(explicitLoad.ok, true);
  assert.equal(explicitLoad.project.objects.length, 2);
});

test("5. Exactly seven object types appear in the World Builder palette in correct order", () => {
  const types = getPaletteObjectTypes("world-builder");
  assert.deepEqual(types, ["house", "tree", "farm", "well", "tank", "pipe", "road"]);
  assert.equal(types.length, 7);
});

test("6. A house, well, pipe, tank, farm, tree, and road can be placed on the canvas and validated", () => {
  const objects = [
    createObject("house", { id: "h1", x: 100, y: 100 }),
    createObject("well", { id: "w1", x: 200, y: 100 }),
    createObject("pipe", { id: "p1", x: 300, y: 100 }),
    createObject("tank", { id: "t1", x: 400, y: 100 }),
    createObject("farm", { id: "f1", x: 500, y: 100 }),
    createObject("tree", { id: "tr1", x: 600, y: 100 }),
    createObject("road", { id: "r1", x: 700, y: 100 }),
  ];

  const doc = createProject({
    title: "Test World",
    type: "world-builder",
    objects,
  });

  const validation = validateProject(doc);
  assert.equal(validation.ok, true);
  assert.equal(doc.objects.length, 7);
});

test("7. Water-port indicators appear for World Builder water objects and update on move/rotate", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const doc = createProject({ type: "world-builder", objects: [well, pipe] });

  const overlay1 = getWaterOverlayData(doc);
  assert.equal(overlay1.active, true);
  assert.equal(overlay1.connections.length, 1);

  // Rotate pipe by 90 degrees -> endpoint moves, connection breaks
  let s = createEditorState(doc);
  s = editorReducer(s, actions.select("p1"));
  s = editorReducer(s, actions.rotateTo(90));
  const overlay2 = getWaterOverlayData(s.history.present);
  assert.equal(overlay2.connections.length, 0);
});

test("8. Properties can be edited and undo/redo functions cleanly", () => {
  const farm = createObject("farm", { id: "f1", x: 100, y: 100, props: { irrigation: "flood" } });
  let s = createEditorState(createProject({ type: "world-builder", objects: [farm] }));

  s = editorReducer(s, actions.select("f1"));
  s = editorReducer(s, actions.setProp("irrigation", "drip"));
  assert.equal(s.history.present.objects[0].props.irrigation, "drip");

  s = editorReducer(s, actions.undo());
  assert.equal(s.history.present.objects[0].props.irrigation, "flood");

  s = editorReducer(s, actions.redo());
  assert.equal(s.history.present.objects[0].props.irrigation, "drip");
});

test("9. Sandbox still works without World Builder port indicators", () => {
  const sbDoc = createProject({
    type: "sandbox",
    objects: [
      createObject("rectangle", { id: "r1", x: 100, y: 100 }, "sandbox"),
      createObject("circle", { id: "c1", x: 200, y: 100 }, "sandbox"),
    ],
  });

  const overlay = getWaterOverlayData(sbDoc);
  assert.equal(overlay.active, false);
  assert.equal(overlay.discretePorts.length, 0);
});

test("10. Player profile, XP, and coins remain completely isolated and unchanged", () => {
  const workspaceSrc = readFileSync(
    join(studioRoot, "world-builder", "components", "WorldBuilderWorkspace.jsx"),
    "utf8"
  );
  const briefingSrc = readFileSync(
    join(studioRoot, "world-builder", "pages", "WorldBuilderBriefing.jsx"),
    "utf8"
  );
  const modelSrc = readFileSync(
    join(studioRoot, "world-builder", "engine", "worldBuilderWorkspaceModel.js"),
    "utf8"
  );

  for (const [name, src] of [
    ["WorldBuilderWorkspace.jsx", workspaceSrc],
    ["WorldBuilderBriefing.jsx", briefingSrc],
    ["worldBuilderWorkspaceModel.js", modelSrc],
  ]) {
    assert.doesNotMatch(src, /skillverse_save/, `${name} must not touch player save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${name} must not touch player state`);
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, `${name} must not define XP/coins`);
  }
});
