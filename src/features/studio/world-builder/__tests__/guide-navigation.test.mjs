import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { BUILDER_GUIDE_STEPS } from "../data/guideSteps.js";
import {
  computeScrollTop,
  findScrollContainers,
  scrollTargetIntoView,
  expandCollapsedAncestors,
  navigateToGuideTarget,
  GUIDE_FALLBACK_SELECTORS,
} from "../engine/guideNavigation.js";
import { makeEl, makeDoc, fakeWin, styleOf } from "./fake-dom.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const studioRoot = resolve(here, "../..");
const read = (...p) => readFileSync(resolve(studioRoot, ...p), "utf-8");

/* ---------- pure scroll maths ---------- */

test("computeScrollTop centres a target inside its container and clamps to the scroll range", () => {
  // 200px-tall viewport over 1000px content; target 40px tall sitting 500px down (scrollTop 0)
  const base = { scrollTop: 0, clientHeight: 200, scrollHeight: 1000, containerTop: 0, targetHeight: 40 };
  assert.equal(computeScrollTop({ ...base, targetTop: 500 }), 420); // 500 - (200 - 40) / 2
});

test("computeScrollTop: clamps at both ends and aligns tall targets to the top inset", () => {
  const base = { scrollTop: 0, clientHeight: 200, scrollHeight: 1000, containerTop: 0 };
  assert.equal(computeScrollTop({ ...base, targetTop: 10, targetHeight: 40 }), 0);
  assert.equal(computeScrollTop({ ...base, targetTop: 990, targetHeight: 40 }), 800);
  assert.equal(computeScrollTop({ ...base, targetTop: 300, targetHeight: 500, insetTop: 12 }), 288, "taller than viewport: top edge below the inset");
});

test("computeScrollTop respects a container that is already scrolled and offset on screen", () => {
  const r = computeScrollTop({ scrollTop: 300, clientHeight: 400, scrollHeight: 2000, containerTop: 100, targetTop: 700, targetHeight: 60 });
  // target offset in content = 300 + (700-100) = 900 ; centred => 900 - (400-60)/2 = 730
  assert.equal(r, 730);
});

/* ---------- scroll container discovery ---------- */

function buildEditorTree() {
  // page(scroll) > shell(overflow hidden: must be ignored) > props panel body (scroll) > dashboard > target
  const target = makeEl({ testid: "wb-planning-inputs", top: 900, height: 80 });
  const dashboard = makeEl({ testid: "wb-mission-dashboard", top: 0, height: 1400, children: [target] });
  const propsBody = makeEl({ cls: ["sce-panel-body"], id: "sce-props-body", overflowY: "auto", top: 100, height: 500, clientHeight: 500, scrollHeight: 1400, children: [dashboard] });
  const shell = makeEl({ cls: ["sce-shell"], overflowY: "hidden", top: 0, height: 800, clientHeight: 800, scrollHeight: 1200, children: [propsBody] });
  return { target, propsBody, shell };
}

test("findScrollContainers only returns real (auto/scroll) overflowing containers and skips overflow:hidden", () => {
  const { target, propsBody, shell } = buildEditorTree();
  const doc = makeDoc([shell]);
  const found = findScrollContainers(target, { getStyle: styleOf, rootDocument: doc });
  assert.deepEqual(found.map((c) => c.element), [propsBody]);
  assert.ok(!found.some((c) => c.element === shell), "overflow:hidden shell must never be scrolled");
});

test("scrollTargetIntoView scrolls the nested Properties panel, not the hidden shell", () => {
  const { target, propsBody, shell } = buildEditorTree();
  const doc = makeDoc([shell]);
  const ops = scrollTargetIntoView(target, { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.equal(ops.length, 1);
  assert.equal(ops[0].element, propsBody);
  assert.equal(shell.scrollTop, 0, "app-mode shell keeps its position");
  const tr = target.getBoundingClientRect();
  const cr = propsBody.getBoundingClientRect();
  assert.ok(tr.top >= cr.top && tr.bottom <= cr.bottom, "target ends up fully inside the visible panel area");
});

test("nested scrolling: page scroller and inner panel are both adjusted, innermost first", () => {
  const target = makeEl({ testid: "t", top: 1500, height: 60 });
  const inner = makeEl({ overflowY: "auto", top: 600, height: 300, clientHeight: 300, scrollHeight: 2000, children: [target] });
  const page = makeEl({ overflowY: "auto", top: 0, height: 800, clientHeight: 800, scrollHeight: 2400, children: [inner] });
  const doc = makeDoc([page]);
  const ops = scrollTargetIntoView(target, { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.deepEqual(ops.map((o) => o.element), [inner, page]);
  const tr = target.getBoundingClientRect();
  assert.ok(tr.top >= 0 && tr.bottom <= 800, "target visible in the viewport");
  const ir = inner.getBoundingClientRect();
  assert.ok(tr.top >= ir.top && tr.bottom <= ir.bottom, "and inside the inner container");
});

test("smooth scrolling is used by default and disabled for prefers-reduced-motion", () => {
  const mk = () => {
    const { target, propsBody, shell } = buildEditorTree();
    return { doc: makeDoc([shell]), target, propsBody };
  };
  const a = mk();
  scrollTargetIntoView(a.target, { rootDocument: a.doc, win: fakeWin(), getStyle: styleOf });
  assert.equal(a.propsBody.scrollCalls[0].behavior, "smooth");
  const b = mk();
  scrollTargetIntoView(b.target, { rootDocument: b.doc, win: fakeWin({ reduceMotion: true }), getStyle: styleOf });
  assert.equal(b.propsBody.scrollCalls[0].behavior, "auto");
});

/* ---------- collapsed panels ---------- */

function buildCollapsedPalette() {
  const well = makeEl({ testid: "sce-add-well", top: 10, height: 70, attrs: {}, focusable: true });
  const body = makeEl({ id: "sce-palette-body", cls: ["sce-panel-body"], hidden: true, height: 300, children: [well] });
  const toggle = makeEl({
    attrs: { "aria-controls": "sce-palette-body", "aria-expanded": "false" },
    onClick: (el) => { el.attributes["aria-expanded"] = "true"; body.removeAttribute("hidden"); },
  });
  return { well, body, toggle, root: makeEl({ children: [toggle, body], height: 800 }) };
}

test("collapsed panels are expanded (via aria-controls) before the target is measured", async () => {
  const { well, toggle, root } = buildCollapsedPalette();
  const doc = makeDoc([root]);
  const res = await navigateToGuideTarget('[data-testid="sce-add-well"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.equal(toggle.clicks, 1, "palette toggle clicked exactly once");
  assert.equal(res.ok, true);
  assert.equal(well.closest("[hidden]"), null);
  assert.equal(well.classList.has("wb-guide-highlight-target"), true);
});

test("expandCollapsedAncestors is a no-op for visible targets and never throws on odd input", () => {
  const { well, toggle, root } = buildCollapsedPalette();
  const doc = makeDoc([root]);
  expandCollapsedAncestors(well, doc);
  toggle.clicks = 0;
  assert.equal(expandCollapsedAncestors(well, doc), false, "already expanded -> nothing clicked");
  assert.equal(toggle.clicks, 0);
  assert.equal(expandCollapsedAncestors(null, doc), false);
  assert.equal(expandCollapsedAncestors({}, null), false);
});

test("a target stuck inside a panel that cannot be expanded fails gracefully", async () => {
  const t = makeEl({ testid: "wb-check-water-btn", height: 30 });
  const body = makeEl({ id: "orphan-body", hidden: true, children: [t] });
  const doc = makeDoc([makeEl({ children: [body] })]);
  const res = await navigateToGuideTarget('[data-testid="wb-check-water-btn"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.equal(res.ok, false);
  assert.equal(res.reason, "target-hidden");
});

/* ---------- failure handling, fallbacks, focus ---------- */

test("fallback selectors are used when the primary target is absent", async () => {
  assert.ok(GUIDE_FALLBACK_SELECTORS['[data-testid="wb-planning-inputs"]'].includes('[data-testid="wb-mission-dashboard"]'));
  const dash = makeEl({ testid: "wb-mission-dashboard", height: 100 });
  const doc = makeDoc([makeEl({ children: [dash] })]);
  const res = await navigateToGuideTarget('[data-testid="wb-planning-inputs"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.equal(res.ok, true);
  assert.equal(res.target, dash);
});

test("a throwing minimize callback or style reader cannot break navigation", async () => {
  const t = makeEl({ testid: "sce-canvas", height: 50 });
  const doc = makeDoc([makeEl({ children: [t] })]);
  const res = await navigateToGuideTarget('[data-testid="sce-canvas"]', {
    rootDocument: doc, win: fakeWin(),
    onBeforeNavigate: () => { throw new Error("boom"); },
    getStyle: () => { throw new Error("style boom"); },
  });
  assert.equal(res.ok, true);
});

test("focus: buttons are focused with preventScroll; the dashboard input is focused only when the player is not typing elsewhere", async () => {
  const btn = makeEl({ testid: "wb-check-water-btn", height: 30, focusable: true });
  const input = makeEl({ id: "wb-input-daily-supply", height: 30, focusable: true });
  const planning = makeEl({ testid: "wb-planning-inputs", height: 120, children: [input] });
  const doc = makeDoc([makeEl({ children: [btn, planning] })]);
  await navigateToGuideTarget('[data-testid="wb-check-water-btn"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf });
  assert.deepEqual(btn.focusCalls, [{ preventScroll: true }]);

  await navigateToGuideTarget('[data-testid="wb-planning-inputs"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf, focusSelector: "#wb-input-daily-supply" });
  assert.equal(input.focusCalls.length, 1);

  // Player is typing in another text field: do not steal focus.
  const other = makeEl({ tag: "input", id: "other", focusable: true });
  other.closest = (sel) => (sel.includes("input") ? other : null);
  doc.activeElement = other;
  input.focusCalls.length = 0;
  await navigateToGuideTarget('[data-testid="wb-planning-inputs"]', { rootDocument: doc, win: fakeWin(), getStyle: styleOf, focusSelector: "#wb-input-daily-supply" });
  assert.equal(input.focusCalls.length, 0);
});

test("repeated navigation clears the previous highlight (no stale highlighted targets)", async () => {
  const a = makeEl({ testid: "sce-add-well", height: 30 });
  const b = makeEl({ testid: "sce-add-tank", height: 30 });
  const doc = makeDoc([makeEl({ children: [a, b] })]);
  const opts = { rootDocument: doc, win: fakeWin(), getStyle: styleOf };
  for (let i = 0; i < 3; i += 1) {
    await navigateToGuideTarget('[data-testid="sce-add-well"]', opts);
    await navigateToGuideTarget('[data-testid="sce-add-tank"]', opts);
  }
  assert.equal(a.classList.has("wb-guide-highlight-target"), false);
  assert.equal(b.classList.has("wb-guide-highlight-target"), true);
});

/* ---------- every guide action reaches a real target ---------- */

test("every guide step action resolves to a selector that exists in the real component sources", () => {
  const sources = [
    read("engine", "Palette.jsx"),
    read("engine", "Canvas.jsx"),
    read("engine", "EditorWorkspace.jsx"),
    read("world-builder", "components", "MissionDashboard.jsx"),
    read("world-builder", "components", "WaterStatusInspector.jsx"),
  ].join("\n");
  const objectTypes = read("engine", "objectTypes.js");

  const selectors = [];
  for (const s of BUILDER_GUIDE_STEPS) {
    selectors.push(s.targetSelector);
    if (s.secondaryActionLabel) selectors.push(s.secondaryTargetSelector);
  }
  assert.equal(selectors.length, 7, "6 steps, step 5 has two actions");
  for (const sel of selectors) {
    const m = sel.match(/data-testid="([^"]+)"/);
    assert.ok(m, `selector uses a stable data-testid: ${sel}`);
    const id = m[1];
    if (id.startsWith("sce-add-")) {
      assert.match(sources, /data-testid=\{`sce-add-\$\{type\}`\}/, "palette renders sce-add-<type>");
      assert.match(objectTypes, new RegExp(`\\b${id.replace("sce-add-", "")}\\b`), `${id} type is registered`);
    } else {
      assert.ok(sources.includes(`data-testid="${id}"`), `${id} exists in a component`);
    }
    assert.ok(!/href="#"/.test(sel));
  }
  assert.ok(BUILDER_GUIDE_STEPS[5].focusSelector === "#wb-input-daily-supply");
  assert.ok(read("world-builder", "components", "MissionDashboard.jsx").includes('id="wb-input-daily-supply"'));
});

test("each guide step navigates (in the layout fake) to its own distinct target, scrolling the right container", async () => {
  // A miniature editor: palette panel + props panel (both scroll), canvas, toolbar button.
  const mk = (testid, top, h = 40, extra = {}) => makeEl({ testid, top, height: h, focusable: true, ...extra });
  const well = mk("sce-add-well", 20); const tank = mk("sce-add-tank", 900);
  const palette = makeEl({ id: "sce-palette-body", overflowY: "auto", top: 100, height: 400, clientHeight: 400, scrollHeight: 1200, children: [well, tank] });
  const canvas = mk("sce-canvas", 150, 300);
  const households = mk("wb-dashboard-item-households", 600, 80);
  const check = mk("wb-check-water-btn", 1800, 40);
  const planning = mk("wb-planning-inputs", 1300, 160, { children: [makeEl({ id: "wb-input-daily-supply", top: 10, height: 30, focusable: true })] });
  const props = makeEl({ id: "sce-props-body", overflowY: "auto", top: 100, height: 400, clientHeight: 400, scrollHeight: 2200, children: [households, planning, check] });
  const test = mk("wb-test-village-btn", 20);
  const doc = makeDoc([makeEl({ overflowY: "hidden", height: 800, children: [test, palette, canvas, props] })]);

  const seen = new Set();
  const visibleIn = (el, c) => { const a = el.getBoundingClientRect(); const b = c.getBoundingClientRect(); return a.top >= b.top && a.bottom <= b.bottom; };
  for (const s of BUILDER_GUIDE_STEPS) {
    const targets = [[s.targetSelector, s.focusSelector]];
    if (s.secondaryActionLabel) targets.push([s.secondaryTargetSelector]);
    for (const [sel, focusSelector] of targets) {
      let minimized = 0;
      const res = await navigateToGuideTarget(sel, { rootDocument: doc, win: fakeWin(), getStyle: styleOf, focusSelector, onBeforeNavigate: () => { minimized += 1; } });
      assert.equal(res.ok, true, `step ${s.step} -> ${sel}`);
      assert.equal(minimized, 1, "guide minimized exactly once per action");
      seen.add(res.target);
      const container = res.target.closest("#sce-palette-body") ? palette : res.target.closest("#sce-props-body") ? props : null;
      if (container) assert.ok(visibleIn(res.target, container), `${sel} is visible inside its own scroll container`);
    }
  }
  assert.equal(seen.size, 7, "seven actions reach seven distinct targets");
  assert.equal(doc.documentElement.scrollTop, 0);
});
