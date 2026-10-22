import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTER_EXPRESSIONS, CHARACTER_EXPRESSION_META } from "../engine/storySchema.js";

const here = dirname(fileURLToPath(import.meta.url));

test("new moods are part of the schema and keep the original five", () => {
  for (const m of ["happy", "thoughtful", "surprised", "worried", "determined", "excited", "sad", "angry", "sleepy"]) {
    assert.ok(CHARACTER_EXPRESSIONS.includes(m), m);
  }
  assert.equal(new Set(CHARACTER_EXPRESSIONS).size, CHARACTER_EXPRESSIONS.length);
});

test("every mood has a label and emoji for the picker, and nothing extra", () => {
  assert.deepEqual(Object.keys(CHARACTER_EXPRESSION_META).sort(), [...CHARACTER_EXPRESSIONS].sort());
  for (const meta of Object.values(CHARACTER_EXPRESSION_META)) {
    assert.ok(meta.label && meta.emoji);
  }
});

test("every mood has a drawn face in the art", () => {
  const art = readFileSync(join(here, "..", "art", "StoryArtComponents.jsx"), "utf8");
  for (const m of CHARACTER_EXPRESSIONS) {
    if (m === "happy") continue; // default branch
    assert.match(art, new RegExp(`case "${m}":`), m);
  }
});
