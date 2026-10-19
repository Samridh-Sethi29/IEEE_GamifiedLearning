import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { actions } from "../actions.js";
import { keyToAction } from "../keyboard.js";
import { createEditorState, editorReducer } from "../editorReducer.js";
import { createDocumentStorage } from "../../storage/documentStorage.js";
import { createProject } from "../schema.js";

const studioRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === "__tests__") return [];
    return statSync(p).isDirectory() ? files(p) : /\.(js|jsx|css)$/.test(n) ? [p] : [];
  });
}

test("11a. engine, storage and world-builder code never reference the player profile or XP/coins/skills", () => {
  const targets = [...files(join(studioRoot, "engine")), ...files(join(studioRoot, "storage")), ...files(join(studioRoot, "world-builder")), join(studioRoot, "pages", "EngineLab.jsx")];
  assert.ok(targets.length > 10);
  for (const f of targets) {
    const src = readFileSync(f, "utf8");
    assert.doesNotMatch(src, /skillverse_save/, `${f} mentions the player save key`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${f} touches player state`);
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, `${f} appears to define XP/coins/level`);
  }
});

test("11b. a full editing + save session leaves the player profile byte-identical", () => {
  const playerSave = JSON.stringify({ name: "Explorer", level: 3, xp: 40, coins: 150, skills: { life: 2 } });
  const data = { skillverse_save: playerSave };
  const storage = { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } };
  let s = createEditorState(createProject({ id: "p" }));
  for (const a of [
    actions.addObject("tree", { id: "t", x: 100, y: 100 }), actions.moveBy(8, 8), actions.rotateBy(15),
    actions.resizeBy(1.1), actions.reorder("front"), actions.undo(), actions.redo(), actions.reset(), actions.remove(),
  ]) s = editorReducer(s, a);
  assert.equal(createDocumentStorage({ storage }).save(s.history.present).ok, true);
  assert.equal(data.skillverse_save, playerSave);
  assert.equal(JSON.parse(data.skillverse_save).xp, 40);
});

const ctx = { hasSelection: true, scope: "canvas" };
test("keyboard: arrows move, shift is fine, r rotates, +/- resize, Delete removes", () => {
  assert.deepEqual(keyToAction({ key: "ArrowLeft" }, ctx), actions.moveBy(-8, 0, "kb-move"));
  assert.deepEqual(keyToAction({ key: "ArrowDown", shiftKey: true }, ctx), actions.moveBy(0, 1, "kb-move"));
  assert.equal(keyToAction({ key: "r" }, ctx).delta, 15);
  assert.equal(keyToAction({ key: "R", shiftKey: true }, ctx).delta, -15);
  assert.ok(keyToAction({ key: "+" }, ctx).factor > 1);
  assert.ok(keyToAction({ key: "-" }, ctx).factor < 1);
  assert.equal(keyToAction({ key: "Delete" }, ctx).type, "DELETE");
  assert.equal(keyToAction({ key: "Escape" }, ctx).type, "SELECT");
  assert.equal(keyToAction({ key: "a" }, ctx), null);
});

test("keyboard: nothing happens without a selection, undo/redo shortcuts work anywhere", () => {
  assert.equal(keyToAction({ key: "ArrowLeft" }, { hasSelection: false, scope: "canvas" }), null);
  assert.equal(keyToAction({ key: "Delete" }, { hasSelection: false, scope: "canvas" }), null);
  assert.equal(keyToAction({ key: "ArrowLeft" }, { hasSelection: true, scope: "global" }), null);
  assert.equal(keyToAction({ key: "z", ctrlKey: true }, { hasSelection: false, scope: "global" }).type, "UNDO");
  assert.equal(keyToAction({ key: "z", metaKey: true, shiftKey: true }, ctx).type, "REDO");
  assert.equal(keyToAction({ key: "y", ctrlKey: true }, ctx).type, "REDO");
});
