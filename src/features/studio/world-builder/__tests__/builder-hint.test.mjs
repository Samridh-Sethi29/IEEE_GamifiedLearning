import test from "node:test";
import assert from "node:assert/strict";
import { getBuilderHint } from "../engine/builderHint.js";
import { WORLD_BUILDER_PALETTE_HINTS } from "../data/paletteHints.js";
import { PROJECT_OBJECT_TYPES } from "../../engine/constants.js";

const doc = (...types) => ({ objects: types.map((type) => ({ type })) });

test("hint walks the player through well, pipes, then houses and farm", () => {
  assert.equal(getBuilderHint(doc()).id, "add-well");
  assert.equal(getBuilderHint(doc("house", "tree")).id, "add-well");
  assert.equal(getBuilderHint(doc("well")).id, "add-pipes");
  assert.equal(getBuilderHint(doc("well", "pipe")).id, "add-demand");
  assert.equal(getBuilderHint(doc("well", "pipe", "house")).id, "add-more-demand");
  assert.equal(getBuilderHint(doc("well", "pipe", "farm", "house", "house", "house")).id, "add-more-demand");
});

test("hint switches to selection / ready once the village has the pieces", () => {
  const full = doc("well", "pipe", "farm", "house", "house", "house", "house");
  assert.equal(getBuilderHint(full).id, "ready");
  assert.equal(getBuilderHint(full, { type: "house" }).id, "selected");
});

test("hint never throws on bad input and does not mutate the document", () => {
  assert.equal(getBuilderHint(null).id, "add-well");
  assert.equal(getBuilderHint({}).id, "add-well");
  const d = doc("well");
  const before = JSON.stringify(d);
  getBuilderHint(d);
  assert.equal(JSON.stringify(d), before);
});

test("every World Builder palette piece has a role hint, and nothing else does", () => {
  const types = [...PROJECT_OBJECT_TYPES["world-builder"]];
  assert.deepEqual(Object.keys(WORLD_BUILDER_PALETTE_HINTS).sort(), types.sort());
});
