import assert from "node:assert/strict";
import { test } from "node:test";
import { HISTORY_LIMIT, MAX_OBJECTS } from "../constants.js";
import { actions } from "../actions.js";
import { exportProject, selectCanRedo, selectCanUndo } from "../editorReducer.js";
import { validateProject } from "../schema.js";
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
