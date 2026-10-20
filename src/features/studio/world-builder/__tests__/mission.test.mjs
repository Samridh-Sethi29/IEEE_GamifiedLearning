import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import { MISSION } from "../data/mission.js";

const here = dirname(fileURLToPath(import.meta.url));
const studioRoot = join(here, "..", "..");
const read = (...p) => readFileSync(join(studioRoot, ...p), "utf8");

// studioTools.js imports lucide-react icons (React components). Load the real file with the icon
// import swapped for stubs, and its relative mission import made absolute, so the test needs no
// bundler or installed packages.
async function loadStudioTools() {
  const missionUrl = pathToFileURL(join(studioRoot, "world-builder", "data", "mission.js")).href;
  const src = read("data", "studioTools.js")
    .replace(/import \{[^}]*\} from "lucide-react";/, "const BookOpen = 'BookOpen', Hammer = 'Hammer', Lightbulb = 'Lightbulb', Palette = 'Palette';")
    .replace(/from "\.\.\/world-builder\/data\/mission\.js"/, `from "${missionUrl}"`);
  assert.doesNotMatch(src, /lucide-react/);
  return import(`data:text/javascript;base64,${Buffer.from(src).toString("base64")}`);
}

test("D2a. only World Builder is available, at the correct route", async () => {
  const { STUDIO_TOOLS } = await loadStudioTools();
  assert.equal(STUDIO_TOOLS.length, 4);
  const available = STUDIO_TOOLS.filter((t) => t.available);
  assert.deepEqual(available.map((t) => t.id), ["world-builder"]);
  assert.equal(available[0].route, "/world/studio/world-builder");
  assert.equal(available[0].route, MISSION.route);
});

test("D2b. the other three activities stay unavailable and unchanged", async () => {
  const { STUDIO_TOOLS } = await loadStudioTools();
  const others = STUDIO_TOOLS.filter((t) => t.id !== "world-builder");
  assert.deepEqual(others.map((t) => t.id), ["invention-lab", "story-studio", "design-studio"]);
  for (const t of others) {
    assert.equal(t.available, false, `${t.id} must stay Coming Soon`);
    assert.equal(t.availabilityNote, undefined);
  }
  assert.deepEqual(others.map((t) => t.route), ["/world/studio/invention-lab", "/world/studio/story-studio", "/world/studio/design-studio"]);
});

test("D2c. World Builder text no longer says the mission is unavailable; hub shares mission copy", async () => {
  const { STUDIO_TOOLS, STUDIO_MISSION } = await loadStudioTools();
  const wb = STUDIO_TOOLS.find((t) => t.id === "world-builder");
  assert.doesNotMatch(`${wb.purpose} ${wb.availabilityNote}`, /not available|isn't playable|preview only/i);
  assert.match(wb.availabilityNote, /construction workspace is coming soon/i);
  assert.equal(STUDIO_MISSION.title, MISSION.title);
  assert.equal(STUDIO_MISSION.subtitle, MISSION.subtitle);
});

test("D2d. only World Builder and the engine lab routes are registered under /world/studio", () => {
  const app = readFileSync(join(studioRoot, "..", "..", "App.jsx"), "utf8");
  const routes = [...app.matchAll(/path="(\/world\/studio[^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(routes.sort(), ["/world/studio", "/world/studio/engine-lab", "/world/studio/world-builder"]);
  assert.match(app, /path="\/world\/studio\/world-builder" element=\{<WorldBuilderBriefing \/>\}/);
});

test("D2e. mission resources are 100 mission coins and 100 litres/day", () => {
  assert.equal(MISSION.resources.budget.value, 100);
  assert.equal(MISSION.resources.budget.unit, "mission coins");
  assert.equal(MISSION.resources.water.value, 100);
  assert.equal(MISSION.resources.water.unit, "litres per day");
  assert.match(MISSION.resourcesNote, /mission only/i);
  assert.match(MISSION.resourcesNote, /separate/i);
});

test("D2f. the five objective definitions are present", () => {
  assert.deepEqual(MISSION.objectives.map((o) => o.id), ["budget", "households", "farm", "well", "reserve"]);
  assert.deepEqual(MISSION.objectives.map((o) => o.target), [100, 4, 1, 1, 10]);
  assert.equal(MISSION.objectives[0].target, MISSION.resources.budget.value);
  for (const o of MISSION.objectives) assert.ok(o.text.length > 10);
  assert.match(MISSION.objectives[3].text, /well/);
  assert.match(MISSION.objectives[4].text, /10 litres\/day/);
});

test("D2g. briefing copy, learning loop and enabled start action", () => {
  assert.equal(MISSION.title, "Save Our Village");
  assert.equal(MISSION.subtitle, "Design a Better Water System");
  assert.deepEqual(MISSION.loop.map((s) => s.label), ["Plan", "Build", "Test", "Improve"]);
  assert.equal(MISSION.backTo, "/world/studio");
  assert.equal(MISSION.startAction.enabled, true);
  assert.equal(MISSION.startAction.label, "Start Designing");
  assert.match(MISSION.howItWorks.map((h) => h.text).join(" "), /connected to the well through pipes/);
  assert.match(MISSION.howItWorks.map((h) => h.text).join(" "), /drip irrigation reduces/i);
});

test("D2h. the page's Start Designing is enabled and opens the World Builder workspace", () => {
  const page = read("world-builder", "pages", "WorldBuilderBriefing.jsx");
  const workspace = read("world-builder", "components", "WorldBuilderWorkspace.jsx");
  assert.equal(MISSION.startAction.enabled, true);
  assert.match(page, /resolveWorldBuilderView/);
  assert.match(page, /setSearchParams\(\{\s*mode:\s*"edit"\s*\}\)/);
  assert.match(page, /<WorldBuilderWorkspace\s+onBack=/);
  assert.match(workspace, /<EditorWorkspace/);
  assert.match(workspace, /key="world-builder"/);
  assert.match(workspace, /data-testid="world-builder-back-to-briefing"/);
});

test("D2i. mission data and page do not depend on or modify player progression", () => {
  for (const f of [["world-builder", "data", "mission.js"], ["world-builder", "pages", "WorldBuilderBriefing.jsx"], ["world-builder", "world-builder.css"]]) {
    const src = read(...f);
    assert.doesNotMatch(src, /skillverse_save|usePlayer|updatePlayer|features\/player|localStorage/, f.join("/"));
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, f.join("/"));
  }
  const mission = read("world-builder", "data", "mission.js");
  assert.doesNotMatch(mission, /^\s*import\s/m, "mission.js must be dependency-free data");
});

test("D2j. the engine's core files are untouched by D2 (no mission imports)", () => {
  for (const f of ["editorReducer.js", "schema.js", "objectTypes.js", "history.js", "Canvas.jsx"]) {
    assert.doesNotMatch(read("engine", f), /world-builder|mission/i, f);
  }
  assert.doesNotMatch(read("storage", "documentStorage.js"), /world-builder|mission/i);
});
