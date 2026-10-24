import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { HISTORY_LIMIT, MAX_OBJECTS } from "../constants.js";
import { actions } from "../actions.js";
import { exportProject, selectCanRedo, selectCanUndo } from "../editorReducer.js";
import { createObject, validateProject } from "../schema.js";
import { getPaletteObjectTypes } from "../objectTypes.js";
import { add, makeEditor, newProject } from "./helpers.mjs";

test("1. add an object: appended on top, selected, valid, one undo step", () => {
  const ed = makeEditor();
  add(ed, "tree", "a");
  add(ed, "house", "b");
  assert.deepEqual(ed.doc.objects.map((o) => [o.id, o.layer]), [["a", 0], ["b", 1]]);
  assert.equal(ed.state.selectedId, "b");
  assert.equal(ed.past, 2);
  assert.equal(validateProject(ed.doc).ok, true);
});

test("2. select and move (absolute + relative), clamped inside the workspace", () => {
  const ed = makeEditor();
  add(ed, "rectangle", "a"); // 120x80
  ed.do(actions.select(null));
  assert.equal(ed.state.selectedId, null);
  ed.do(actions.select("a"));
  ed.do(actions.moveTo(300, 200));
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [300, 200]);
  ed.do(actions.moveBy(8, -8));
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [308, 192]);
  ed.do(actions.moveTo(-500, 9999));
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [60, 460]); // half extents 60 x 40
  const before = ed.state;
  ed.do(actions.moveBy(-8, 0)); // already at the left edge
  assert.equal(ed.state.history, before.history);
  assert.match(ed.state.notice.message, /edge/);
});

test("3. rotate and resize with limits; position is re-clamped", () => {
  const ed = makeEditor();
  add(ed, "rectangle", "a", { x: 60, y: 250 });
  ed.do(actions.rotateTo(450));
  assert.equal(ed.obj("a").rotation, 90);
  assert.ok(ed.obj("a").x >= 40, "rotated box must stay inside");
  ed.do(actions.rotateBy(-100));
  assert.equal(ed.obj("a").rotation, 350);
  ed.do(actions.resizeTo(200, 100));
  assert.deepEqual([ed.obj("a").width, ed.obj("a").height], [200, 100]);
  ed.do(actions.resizeTo(1, 1));
  assert.deepEqual([ed.obj("a").width, ed.obj("a").height], [24, 24]);
  const stepsBefore = ed.past;
  ed.do(actions.resizeBy(0.5));
  assert.equal(ed.past, stepsBefore);
  assert.match(ed.state.notice.message, /small/);
  ed.do(actions.resizeTo(5000, 5000));
  assert.equal(ed.obj("a").width, 400);
  assert.equal(ed.obj("a").height, 400);
});

test("4. delete removes the object, clears selection, renumbers layers", () => {
  const ed = makeEditor();
  add(ed, "tree", "a"); add(ed, "house", "b"); add(ed, "gear", "c");
  ed.do(actions.select("b"));
  ed.do(actions.remove());
  assert.deepEqual(ed.doc.objects.map((o) => [o.id, o.layer]), [["a", 0], ["c", 1]]);
  assert.equal(ed.state.selectedId, null);
  ed.do(actions.remove());
  assert.match(ed.state.notice.message, /Select an object/);
});

test("reorder front/back/forward/backward and no-op notices", () => {
  const ed = makeEditor();
  add(ed, "tree", "a"); add(ed, "house", "b"); add(ed, "gear", "c");
  ed.do(actions.select("a"));
  ed.do(actions.reorder("front"));
  assert.deepEqual(ed.doc.objects.map((o) => o.id), ["b", "c", "a"]);
  assert.deepEqual(ed.doc.objects.map((o) => o.layer), [0, 1, 2]);
  ed.do(actions.reorder("backward"));
  assert.deepEqual(ed.doc.objects.map((o) => o.id), ["b", "a", "c"]);
  ed.do(actions.reorder("back"));
  assert.deepEqual(ed.doc.objects.map((o) => o.id), ["a", "b", "c"]);
  const n = ed.past;
  ed.do(actions.reorder("back"));
  assert.equal(ed.past, n);
  assert.match(ed.state.notice.message, /already/);
});

test("set prop validates values", () => {
  const ed = makeEditor();
  add(ed, "gear", "g");
  ed.do(actions.setProp("teeth", 12));
  assert.equal(ed.obj("g").props.teeth, 12);
  const n = ed.past;
  ed.do(actions.setProp("teeth", 99));
  ed.do(actions.setProp("fill", "red"));
  ed.do(actions.setProp("nope", 1));
  assert.equal(ed.past, n);
  assert.equal(ed.obj("g").props.teeth, 12);
});

test("5. undo and redo restore real document states for every operation", () => {
  const ed = makeEditor();
  const snaps = [ed.doc];
  const step = (a) => { ed.do(a); snaps.push(ed.doc); };
  step(actions.addObject("tree", { id: "a", x: 400, y: 250 }));
  step(actions.moveTo(100, 100));
  step(actions.rotateTo(45));
  step(actions.resizeTo(80, 120));
  step(actions.setProp("foliage", "#ef4444"));
  step(actions.addObject("house", { id: "b", x: 200, y: 200 }));
  step(actions.reorder("back"));
  step(actions.remove());
  for (let i = snaps.length - 1; i > 0; i--) {
    ed.do(actions.undo());
    assert.deepEqual(ed.doc.objects, snaps[i - 1].objects, `undo to step ${i - 1}`);
  }
  assert.equal(selectCanUndo(ed.state), false);
  for (let i = 1; i < snaps.length; i++) {
    ed.do(actions.redo());
    assert.deepEqual(ed.doc.objects, snaps[i].objects, `redo to step ${i}`);
  }
  assert.equal(selectCanRedo(ed.state), false);
  const noop = ed.state;
  ed.do(actions.redo());
  assert.match(ed.state.notice.message, /nothing to redo/i);
  assert.equal(ed.state.history, noop.history);
});

test("undo prunes a selection that no longer exists", () => {
  const ed = makeEditor();
  add(ed, "tree", "a");
  assert.equal(ed.state.selectedId, "a");
  ed.do(actions.undo());
  assert.equal(ed.state.selectedId, null);
});

test("6. a new operation after undo clears the redo stack", () => {
  const ed = makeEditor();
  add(ed, "tree", "a"); add(ed, "house", "b");
  ed.do(actions.undo());
  assert.equal(ed.future, 1);
  assert.equal(selectCanRedo(ed.state), true);
  add(ed, "gear", "c");
  assert.equal(ed.future, 0);
  assert.equal(selectCanRedo(ed.state), false);
});

test("7. one drag = one history step (no matter how many pointer moves)", () => {
  const ed = makeEditor();
  add(ed, "tree", "a", { x: 100, y: 100 });
  const base = ed.past;
  ed.do(actions.beginTransaction());
  for (let i = 1; i <= 300; i++) ed.do({ type: "MOVE", id: "a", x: 100 + i, y: 100 + i / 2 });
  assert.equal(ed.past, base, "live moves add no history");
  assert.equal(selectCanUndo(ed.state), false, "undo disabled mid-drag");
  ed.do(actions.commitTransaction());
  assert.equal(ed.past, base + 1);
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [400, 250]);
  ed.do(actions.undo());
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [100, 100]);
  ed.do(actions.redo());
  assert.deepEqual([ed.obj("a").x, ed.obj("a").y], [400, 250]);
});

test("a click without movement leaves no history step; cancel restores exactly", () => {
  const ed = makeEditor();
  add(ed, "tree", "a", { x: 100, y: 100 });
  const base = ed.past;
  ed.do(actions.beginTransaction());
  ed.do(actions.commitTransaction());
  assert.equal(ed.past, base);
  const before = ed.doc;
  ed.do(actions.beginTransaction());
  ed.do({ type: "MOVE", id: "a", x: 300, y: 300 });
  ed.do(actions.cancelTransaction());
  assert.equal(ed.doc, before, "pointer cancel restores the very same document");
  assert.equal(ed.past, base);
  assert.equal(ed.state.pending, null);
});

test("grouped keyboard/slider edits merge until the group ends", () => {
  const ed = makeEditor();
  add(ed, "tree", "a", { x: 100, y: 100 });
  const base = ed.past;
  for (let i = 0; i < 10; i++) ed.do(actions.moveBy(8, 0, "kb-move"));
  assert.equal(ed.past, base + 1);
  assert.equal(ed.obj("a").x, 180);
  ed.do(actions.endGroup());
  ed.do(actions.moveBy(8, 0, "kb-move"));
  assert.equal(ed.past, base + 2, "a separate press is a separate step");
  ed.do(actions.rotateBy(15, "kb-rotate"));
  ed.do(actions.rotateBy(15, "kb-rotate"));
  assert.equal(ed.past, base + 3);
  ed.do(actions.undo());
  assert.equal(ed.obj("a").rotation, 0);
});

test("history is bounded", () => {
  const ed = makeEditor();
  add(ed, "tree", "a", { x: 100, y: 100 });
  for (let i = 0; i < HISTORY_LIMIT + 40; i++) ed.do(actions.moveTo(100 + (i % 2 ? 5 : 10), 100 + i));
  assert.equal(ed.past, HISTORY_LIMIT);
});

test("object count is capped with a notice", () => {
  const ed = makeEditor();
  for (let i = 0; i < MAX_OBJECTS; i++) add(ed, "circle", `o${i}`);
  const n = ed.doc.objects.length;
  add(ed, "circle", "extra");
  assert.equal(ed.doc.objects.length, n);
  assert.match(ed.state.notice.message, /full/);
});

test("rejects duplicate ids and invalid objects without changing the document", () => {
  const ed = makeEditor();
  add(ed, "tree", "a");
  const before = ed.state.history;
  add(ed, "tree", "a");
  assert.equal(ed.state.history, before);
  ed.do({ type: "ADD_OBJECT", object: { id: "z", type: "dragon" } });
  assert.equal(ed.state.history, before);
  assert.equal(ed.state.notice.kind, "warning");
});

test("reset returns to the initial document as one undoable step", () => {
  const start = newProject({ objects: [{ id: "s", type: "tree", x: 100, y: 100, rotation: 0, width: 70, height: 100, layer: 0, props: { foliage: "#22c55e" } }] });
  const ed = makeEditor(start);
  ed.do(actions.select("s"));
  ed.do(actions.moveTo(300, 300));
  add(ed, "house", "h");
  ed.do(actions.reset());
  assert.deepEqual(ed.doc.objects, start.objects);
  assert.equal(ed.state.selectedId, null);
  ed.do(actions.undo());
  assert.equal(ed.doc.objects.length, 2, "reset can be undone");
  ed.do(actions.reset());
  ed.do(actions.reset());
  assert.match(ed.state.notice.message, /start/);
});

test("8. export is a detached plain JSON copy, and reloads", () => {
  const ed = makeEditor();
  add(ed, "gear", "g");
  const out = exportProject(ed.state);
  assert.deepEqual(out, JSON.parse(JSON.stringify(ed.doc)));
  assert.notEqual(out, ed.doc);
  out.objects[0].x = 1; // mutating the export must not touch the editor
  assert.notEqual(ed.obj("g").x, 1);
  const ed2 = makeEditor(newProject());
  ed2.do(actions.load(exportProject(ed.state)));
  assert.deepEqual(ed2.doc.objects, ed.doc.objects);
  assert.equal(ed2.past, 0);
  assert.equal(ed2.state.selectedId, null);
});

test("load rejects an invalid project and keeps the current work", () => {
  const ed = makeEditor();
  add(ed, "tree", "a");
  const before = ed.state.history;
  ed.do(actions.load({ nope: true }));
  assert.equal(ed.state.history, before);
  assert.equal(ed.state.notice.kind, "warning");
});

test("modifiedAt only changes through the action timestamp (reducer stays pure)", () => {
  const ed = makeEditor();
  ed.do({ ...actions.addObject("tree", { id: "t" }), at: Date.parse("2026-05-05T00:00:00Z") });
  assert.equal(ed.doc.modifiedAt, "2026-05-05T00:00:00.000Z");
  assert.equal(ed.doc.createdAt, "2026-01-01T00:00:00.000Z");
});

test("World Builder project in reducer: accepts all seven types, rejects rectangle/circle/triangle/gear", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);
  assert.equal(ed.doc.type, "world-builder");

  // All seven types can be added
  const permitted = ["house", "tree", "farm", "well", "tank", "pipe", "road"];
  for (let i = 0; i < permitted.length; i++) {
    const t = permitted[i];
    add(ed, t, `wb_${t}`);
    assert.equal(ed.doc.objects.length, i + 1);
    assert.equal(ed.doc.objects[i].id, `wb_${t}`);
    assert.equal(ed.doc.objects[i].type, t);
  }

  // Rectangle, circle, triangle, gear are rejected with warning notice
  const beforeCount = ed.doc.objects.length;
  for (const badType of ["rectangle", "circle", "triangle", "gear"]) {
    add(ed, badType, `bad_${badType}`);
    assert.equal(ed.doc.objects.length, beforeCount);
    assert.equal(ed.state.notice.kind, "warning");
    assert.match(ed.state.notice.message, /not allowed in a world-builder project/);
  }

  // Undo and redo work as expected across added objects
  ed.do(actions.undo());
  assert.equal(ed.doc.objects.length, 6);
  assert.equal(ed.doc.objects[5].id, "wb_pipe");

  ed.do(actions.redo());
  assert.equal(ed.doc.objects.length, 7);
  assert.equal(ed.doc.objects[6].id, "wb_road");
});

test("World Builder editor rejects loading a document with invalid types", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);
  add(ed, "house", "h1");

  const invalidDoc = newProject({
    type: "world-builder",
    objects: [createObject("rectangle", { id: "r1", layer: 0 })],
  });

  ed.do(actions.load(invalidDoc));
  // Preserves current work
  assert.equal(ed.doc.objects.length, 1);
  assert.equal(ed.doc.objects[0].id, "h1");
  assert.equal(ed.state.notice.kind, "warning");

  // createEditorState directly throws on invalid project
  assert.throws(() => makeEditor(invalidDoc), /not allowed in a world-builder project/);

  // SET_PROP validates within World Builder project
  ed.do(actions.select("h1"));
  ed.do(actions.setProp("roof", "#3b82f6"));
  assert.equal(ed.obj("h1").props.roof, "#3b82f6");

  const beforeHistory = ed.state.history;
  ed.do(actions.setProp("roof", "invalid-color"));
  assert.equal(ed.state.history, beforeHistory);
  assert.equal(ed.state.notice.kind, "warning");
});

test("World Builder SET_PROP updates properties for all five new object types", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);

  // 1. Farm irrigation update
  add(ed, "farm", "f1");
  ed.do(actions.select("f1"));
  assert.equal(ed.obj("f1").props.irrigation, "flood");
  ed.do(actions.setProp("irrigation", "drip"));
  assert.equal(ed.obj("f1").props.irrigation, "drip");

  // Invalid irrigation rejected
  const histBefore = ed.state.history;
  ed.do(actions.setProp("irrigation", "sprinkler"));
  assert.equal(ed.state.history, histBefore);
  assert.equal(ed.obj("f1").props.irrigation, "drip");
  assert.equal(ed.state.notice.kind, "warning");

  // 2. Well roof update
  add(ed, "well", "w1");
  ed.do(actions.select("w1"));
  ed.do(actions.setProp("roof", "#3b82f6"));
  assert.equal(ed.obj("w1").props.roof, "#3b82f6");

  // 3. Tank fill update
  add(ed, "tank", "tk1");
  ed.do(actions.select("tk1"));
  ed.do(actions.setProp("fill", "#22c55e"));
  assert.equal(ed.obj("tk1").props.fill, "#22c55e");

  // 4. Pipe fill update
  add(ed, "pipe", "p1");
  ed.do(actions.select("p1"));
  ed.do(actions.setProp("fill", "#ef4444"));
  assert.equal(ed.obj("p1").props.fill, "#ef4444");

  // 5. Road fill update
  add(ed, "road", "r1");
  ed.do(actions.select("r1"));
  ed.do(actions.setProp("fill", "#78716c"));
  assert.equal(ed.obj("r1").props.fill, "#78716c");
});

test("D3.2A-5: Palette action invocation creates all permitted objects for World Builder and Sandbox", () => {
  // World Builder: all seven objects can be added via palette action
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const wbEd = makeEditor(wbProject);
  const wbPaletteTypes = getPaletteObjectTypes(wbEd.doc.type);
  assert.deepEqual(wbPaletteTypes, ["house", "tree", "farm", "well", "tank", "pipe", "road"]);

  for (let i = 0; i < wbPaletteTypes.length; i++) {
    const type = wbPaletteTypes[i];
    add(wbEd, type, `wb_${type}`);
    assert.equal(wbEd.doc.objects.length, i + 1);
    assert.equal(wbEd.doc.objects[i].type, type);
    assert.equal(wbEd.doc.objects[i].layer, i);
    assert.equal(wbEd.state.selectedId, `wb_${type}`);
  }
  assert.equal(validateProject(wbEd.doc).ok, true);

  // Sandbox: all six palette objects can be added
  const sbProject = newProject({ type: "sandbox", objects: [] });
  const sbEd = makeEditor(sbProject);
  const sbPaletteTypes = getPaletteObjectTypes(sbEd.doc.type);
  assert.deepEqual(sbPaletteTypes, ["rectangle", "circle", "triangle", "tree", "house", "gear"]);

  for (let i = 0; i < sbPaletteTypes.length; i++) {
    const type = sbPaletteTypes[i];
    add(sbEd, type, `sb_${type}`);
    assert.equal(sbEd.doc.objects.length, i + 1);
    assert.equal(sbEd.doc.objects[i].type, type);
    assert.equal(sbEd.doc.objects[i].layer, i);
    assert.equal(sbEd.state.selectedId, `sb_${type}`);
  }
  assert.equal(validateProject(sbEd.doc).ok, true);
});

test("World Builder object manipulation: select, move, rotate, resize, layer order, and delete work for new objects", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);

  // Add farm, pipe, tank
  add(ed, "farm", "f1");
  add(ed, "pipe", "p1");
  add(ed, "tank", "tk1");
  assert.equal(ed.state.selectedId, "tk1");

  // Move
  ed.do(actions.select("f1"));
  assert.equal(ed.state.selectedId, "f1");
  ed.do(actions.moveBy(20, -15));
  assert.equal(ed.obj("f1").x, 420);
  assert.equal(ed.obj("f1").y, 235);

  // Rotate
  ed.do(actions.rotateBy(45));
  assert.equal(ed.obj("f1").rotation, 45);

  // Resize
  ed.do(actions.select("p1"));
  ed.do(actions.resizeTo(150, 40));
  assert.equal(ed.obj("p1").width, 150);
  assert.equal(ed.obj("p1").height, 40);

  // Reorder
  ed.do(actions.reorder("back"));
  assert.equal(ed.doc.objects[0].id, "p1");
  assert.equal(ed.doc.objects[0].layer, 0);

  // Delete
  ed.do(actions.remove());
  assert.equal(ed.doc.objects.length, 2);
  assert.equal(ed.doc.objects.find((o) => o.id === "p1"), undefined);
  assert.equal(ed.state.selectedId, null);
});

test("PropertiesPanel supports accessible enum property controls alongside color and int", () => {
  const panelSrc = fs.readFileSync(new URL("../PropertiesPanel.jsx", import.meta.url), "utf8");
  assert.match(panelSrc, /pdef\.kind\s*===\s*["']enum["']/);
  assert.match(panelSrc, /aria-pressed=\{selected\.props\[key\]\s*===\s*opt\}/);
  assert.match(panelSrc, /actions\.setProp\(key,\s*opt\)/);
});

test("D3.2C-5: Property edits on World Builder objects support undo and redo", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);

  add(ed, "farm", "f1");
  assert.equal(ed.obj("f1").props.irrigation, "flood");

  // Edit irrigation
  ed.do(actions.select("f1"));
  ed.do(actions.setProp("irrigation", "drip"));
  assert.equal(ed.obj("f1").props.irrigation, "drip");

  // Undo restores "flood"
  ed.do(actions.undo());
  assert.equal(ed.obj("f1").props.irrigation, "flood");

  // Redo restores "drip"
  ed.do(actions.redo());
  assert.equal(ed.obj("f1").props.irrigation, "drip");

  // Edit color property on tank
  add(ed, "tank", "tk1");
  assert.equal(ed.obj("tk1").props.fill, "#3b82f6");
  ed.do(actions.select("tk1"));
  ed.do(actions.setProp("fill", "#22c55e"));
  assert.equal(ed.obj("tk1").props.fill, "#22c55e");

  // Undo restores default color
  ed.do(actions.undo());
  assert.equal(ed.obj("tk1").props.fill, "#3b82f6");

  // Redo restores updated color
  ed.do(actions.redo());
  assert.equal(ed.obj("tk1").props.fill, "#22c55e");
});

test("D3.2C-6: Property editing does not mutate or change unrelated objects", () => {
  const wbProject = newProject({ type: "world-builder", objects: [] });
  const ed = makeEditor(wbProject);

  add(ed, "house", "h1");
  add(ed, "farm", "f1");
  add(ed, "tank", "tk1");

  const houseSnapshot = JSON.parse(JSON.stringify(ed.obj("h1")));
  const tankSnapshot = JSON.parse(JSON.stringify(ed.obj("tk1")));

  // Edit farm property
  ed.do(actions.select("f1"));
  ed.do(actions.setProp("irrigation", "drip"));
  assert.equal(ed.obj("f1").props.irrigation, "drip");

  // Unrelated objects must remain strictly identical
  assert.deepEqual(JSON.parse(JSON.stringify(ed.obj("h1"))), houseSnapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(ed.obj("tk1"))), tankSnapshot);

  // Edit house roof property
  const farmSnapshot = JSON.parse(JSON.stringify(ed.obj("f1")));
  ed.do(actions.select("h1"));
  ed.do(actions.setProp("roof", "#3b82f6"));
  assert.equal(ed.obj("h1").props.roof, "#3b82f6");

  assert.deepEqual(JSON.parse(JSON.stringify(ed.obj("f1"))), farmSnapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(ed.obj("tk1"))), tankSnapshot);
});

test("D3.2C-7: Existing Sandbox properties and behavior remain completely intact", () => {
  const sbProject = newProject({ type: "sandbox", objects: [] });
  const ed = makeEditor(sbProject);

  // Sandbox objects can be added and have their properties edited
  add(ed, "gear", "g1");
  assert.equal(ed.obj("g1").props.teeth, 10);
  assert.equal(ed.obj("g1").props.fill, "#78716c");

  // Valid property updates
  ed.do(actions.select("g1"));
  ed.do(actions.setProp("teeth", 14));
  assert.equal(ed.obj("g1").props.teeth, 14);

  ed.do(actions.setProp("fill", "#ef4444"));
  assert.equal(ed.obj("g1").props.fill, "#ef4444");

  // Invalid teeth (out of range [6, 16]) rejected without mutating document
  const teethHist = ed.state.history;
  ed.do(actions.setProp("teeth", 25));
  assert.equal(ed.state.history, teethHist);
  assert.equal(ed.obj("g1").props.teeth, 14);
  assert.equal(ed.state.notice.kind, "warning");

  // Non-existent property rejected
  ed.do(actions.setProp("irrigation", "flood"));
  assert.equal(ed.state.history, teethHist);
  assert.equal(ed.state.notice.kind, "warning");

  // Rectangle, tree, house properties work as before
  add(ed, "tree", "t1");
  ed.do(actions.select("t1"));
  ed.do(actions.setProp("foliage", "#3b82f6"));
  assert.equal(ed.obj("t1").props.foliage, "#3b82f6");
});

test("D3.2D-1: EngineLab supports mode switching between Sandbox (6 objects) and World Builder (7 objects)", () => {
  const engineLabSrc = fs.readFileSync(new URL("../../pages/EngineLab.jsx", import.meta.url), "utf8");
  assert.match(engineLabSrc, /useSearchParams/);
  assert.match(engineLabSrc, /rawType\s*===\s*["']world-builder["']/);
  assert.match(engineLabSrc, /data-testid=["']engine-lab-type-sandbox["']/);
  assert.match(engineLabSrc, /data-testid=["']engine-lab-type-world-builder["']/);
  assert.match(engineLabSrc, /to=["']\/world\/studio\/engine-lab\?type=world-builder["']/);
});
