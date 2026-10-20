import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BUILDER_GUIDE_HONESTY_NOTE,
  BUILDER_GUIDE_STEPS,
} from "../data/guideSteps.js";
import {
  GUIDE_TARGET_SELECTORS,
  applyHighlight,
  expandPanelForSelector,
  navigateToGuideTarget,
} from "../engine/guideNavigation.js";

import { makeEl, makeDoc, fakeWin, styleOf } from "./fake-dom.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");
const worldBuilderRoot = resolve(studioRoot, "world-builder");

function read(...parts) {
  return readFileSync(resolve(studioRoot, ...parts), "utf-8");
}

test("1. Guided start data model: contains exactly 6 ordered steps with titles and actions", () => {
  assert.equal(Array.isArray(BUILDER_GUIDE_STEPS), true);
  assert.equal(BUILDER_GUIDE_STEPS.length, 6, "Must define exactly 6 guided building steps");

  const expectedSteps = [
    { step: 1, title: "Place a well as the water source", testId: "wb-guide-step-1" },
    { step: 2, title: "Add pipes and align connection points", testId: "wb-guide-step-2" },
    { step: 3, title: "Add a tank if desired", testId: "wb-guide-step-3" },
    { step: 4, title: "Connect farm and 4+ households", testId: "wb-guide-step-4" },
    { step: 5, title: "Check Water System or Test Village", testId: "wb-guide-step-5" },
    { step: 6, title: "Check budget and enter water planning", testId: "wb-guide-step-6" },
  ];

  expectedSteps.forEach((expected, i) => {
    const actual = BUILDER_GUIDE_STEPS[i];
    assert.equal(actual.step, expected.step, `Step ${i + 1} number mismatch`);
    assert.equal(actual.title, expected.title, `Step ${i + 1} title mismatch`);
    assert.equal(actual.testId, expected.testId, `Step ${i + 1} testId mismatch`);
    assert.ok(actual.description && actual.description.length > 10, `Step ${i + 1} must have descriptive text`);
    assert.ok(actual.actionLabel && actual.actionLabel.length > 0, `Step ${i + 1} must have an action label`);
    assert.ok(actual.targetSelector && actual.targetSelector.length > 0, `Step ${i + 1} must have a targetSelector`);
  });
});

test("2. Guided start data model: honesty note clearly explains connection rules and trial scope", () => {
  assert.ok(typeof BUILDER_GUIDE_HONESTY_NOTE === "string" && BUILDER_GUIDE_HONESTY_NOTE.length > 0);

  // Must explicitly state that visual proximity alone does not establish connectivity
  assert.match(
    BUILDER_GUIDE_HONESTY_NOTE,
    /visual proximity alone does not establish connectivity/i,
    "Guide must explain that proximity alone is not connectivity"
  );

  // Must explicitly state that the trial checks logical connectivity rather than fluid dynamics
  assert.match(
    BUILDER_GUIDE_HONESTY_NOTE,
    /logical network connectivity rather than physical fluid dynamics/i,
    "Guide must clarify logical vs physical fluid dynamics"
  );

  // Must instruct players on aligning connection points
  assert.match(
    BUILDER_GUIDE_HONESTY_NOTE,
    /connection points|cyan rings/i,
    "Guide must mention connection points"
  );
});

test("3. Guided start component: renders header, title, honesty note, steps, minimize and action targets", () => {
  const guideSource = readFileSync(
    resolve(worldBuilderRoot, "components", "WorldBuilderGuide.jsx"),
    "utf-8"
  );

  // Region and test ids
  assert.match(guideSource, /data-testid="wb-guide-card"/);
  assert.match(guideSource, /data-testid="wb-guide-title"/);
  assert.match(guideSource, /How to Build Your Water System/);
  assert.match(guideSource, /data-testid="wb-guide-honesty-note"/);
  assert.match(guideSource, /data-testid="wb-guide-steps"/);
  assert.match(guideSource, /data-testid="wb-guide-minimize-btn"/);
  assert.match(guideSource, /data-testid="wb-guide-body"/);

  // Imports and uses data model
  assert.match(guideSource, /BUILDER_GUIDE_HONESTY_NOTE/);
  assert.match(guideSource, /BUILDER_GUIDE_STEPS/);
  assert.match(guideSource, /navigateToGuideTarget/);

  // Dismiss and minimize buttons
  assert.match(guideSource, /data-testid="wb-guide-dismiss-btn"/);
  assert.match(guideSource, /data-testid="wb-guide-got-it-btn"/);
  assert.match(guideSource, /Got it, let('?|&apos;)s build!/);

  // Navigation action function
  assert.match(guideSource, /navigateToSection/);
});

test("4. Guided start in WorldBuilderWorkspace: open / minimized / closed state lives outside the editor", () => {
  const workspaceSource = readFileSync(
    resolve(worldBuilderRoot, "components", "WorldBuilderWorkspace.jsx"),
    "utf-8"
  );

  // Open state defaults to open; minimized state is separate and viewport-aware (short screens start slim).
  assert.match(workspaceSource, /const \[isGuideOpen, setIsGuideOpen\] = useState\(true\)/);
  assert.match(workspaceSource, /const \[isGuideMinimized, setIsGuideMinimized\] = useState\(/);
  assert.match(workspaceSource, /window\.innerHeight < 720/);

  // Header toggle stays available in every state, with accessibility attribute and dynamic label
  assert.match(workspaceSource, /data-testid="wb-guide-toggle-btn"/);
  assert.match(workspaceSource, /aria-expanded=\{isGuideOpen\}/);
  assert.match(workspaceSource, /isGuideOpen \? "Hide Guide" : "How to Build Guide"/);
  assert.match(workspaceSource, /setIsGuideOpen\(\(prev\) => !prev\);\s*setIsGuideMinimized\(false\);/, "Reopening always shows the expanded guide");

  // Guide receives controlled minimized state and a dismiss callback
  assert.match(
    workspaceSource,
    /\{isGuideOpen && \(\s*<WorldBuilderGuide\s+isMinimized=\{isGuideMinimized\}\s+onMinimizedChange=\{setIsGuideMinimized\}\s+onDismiss=\{\(\) => setIsGuideOpen\(false\)\}/
  );

  // The editor (and therefore the village design) is a stable sibling: guide state cannot remount it
  assert.match(workspaceSource, /<EditorWorkspace\s+key="world-builder"/);
  const guideIdx = workspaceSource.indexOf("<WorldBuilderGuide");
  const editorIdx = workspaceSource.indexOf("<EditorWorkspace");
  assert.ok(guideIdx > 0 && editorIdx > guideIdx, "Guide renders before, and independently of, the editor");
});

test("5. D3.6D Regression: each of the six guide actions targets its exact section and element", () => {
  // Step 1: Find Well in Palette -> specific well button in palette
  const step1 = BUILDER_GUIDE_STEPS[0];
  assert.equal(step1.actionLabel, "Find Well in Palette");
  assert.equal(step1.targetSelector, GUIDE_TARGET_SELECTORS.well);
  assert.equal(step1.targetSelector, '[data-testid="sce-add-well"]');

  // Step 2: View Canvas -> main canvas element
  const step2 = BUILDER_GUIDE_STEPS[1];
  assert.equal(step2.actionLabel, "View Canvas");
  assert.equal(step2.targetSelector, GUIDE_TARGET_SELECTORS.canvas);
  assert.equal(step2.targetSelector, '[data-testid="sce-canvas"]');

  // Step 3: Find Tank in Palette -> specific tank button in palette
  const step3 = BUILDER_GUIDE_STEPS[2];
  assert.equal(step3.actionLabel, "Find Tank in Palette");
  assert.equal(step3.targetSelector, GUIDE_TARGET_SELECTORS.tank);
  assert.equal(step3.targetSelector, '[data-testid="sce-add-tank"]');

  // Step 4: Check Household Goal -> household requirement row in dashboard
  const step4 = BUILDER_GUIDE_STEPS[3];
  assert.equal(step4.actionLabel, "Check Household Goal");
  assert.equal(step4.targetSelector, GUIDE_TARGET_SELECTORS.householdGoal);
  assert.equal(step4.targetSelector, '[data-testid="wb-dashboard-item-households"]');

  // Step 5: Check Water System -> check water button in inspector
  const step5 = BUILDER_GUIDE_STEPS[4];
  assert.equal(step5.actionLabel, "Check Water System");
  assert.equal(step5.targetSelector, GUIDE_TARGET_SELECTORS.waterSystem);
  assert.equal(step5.targetSelector, '[data-testid="wb-check-water-btn"]');
  // Step 5 secondary action: Test Village button
  assert.equal(step5.secondaryActionLabel, "Test Village");
  assert.equal(step5.secondaryTargetSelector, GUIDE_TARGET_SELECTORS.testVillage);
  assert.equal(step5.secondaryTargetSelector, '[data-testid="wb-test-village-btn"]');

  // Step 6: Open Mission Dashboard -> planning inputs area
  const step6 = BUILDER_GUIDE_STEPS[5];
  assert.equal(step6.actionLabel, "Open Mission Dashboard");
  assert.equal(step6.targetSelector, GUIDE_TARGET_SELECTORS.missionDashboard);
  assert.equal(step6.targetSelector, '[data-testid="wb-planning-inputs"]');
});

test("6. D3.6D Regression: palette navigation identifies the exact object rather than generic container", () => {
  const wellSelector = BUILDER_GUIDE_STEPS[0].targetSelector;
  const tankSelector = BUILDER_GUIDE_STEPS[2].targetSelector;

  assert.notEqual(wellSelector, '[data-testid="sce-palette"]', "Well selector must identify well object, not whole palette");
  assert.notEqual(tankSelector, '[data-testid="sce-palette"]', "Tank selector must identify tank object, not whole palette");
  assert.match(wellSelector, /sce-add-well/);
  assert.match(tankSelector, /sce-add-tank/);
});

test("7. D3.6D Regression: dashboard links target specific requirements and planning input area", () => {
  const householdSelector = BUILDER_GUIDE_STEPS[3].targetSelector;
  const dashboardSelector = BUILDER_GUIDE_STEPS[5].targetSelector;

  assert.equal(householdSelector, '[data-testid="wb-dashboard-item-households"]');
  assert.equal(dashboardSelector, '[data-testid="wb-planning-inputs"]');
  assert.notEqual(dashboardSelector, '[data-testid="sce-props"]');
});

test("8. Guide navigation runs the minimize callback before touching the DOM and reports success", async () => {
  const order = [];
  const target = makeEl({ id: "well", testid: "sce-add-well", rect: { top: 40, height: 60 } });
  const doc = makeDoc([target]);
  const res = await navigateToGuideTarget('[data-testid="sce-add-well"]', {
    onBeforeNavigate: () => order.push("minimize"),
    rootDocument: doc,
    win: fakeWin(),
    getStyle: styleOf,
  });
  assert.equal(res.ok, true);
  assert.deepEqual(order, ["minimize"]);
  assert.equal(target.classList.has("wb-guide-highlight-target"), true, "target is highlighted");
});

test("9. Missing targets fail gracefully (ok:false, no throw) and legacy helpers tolerate bad input", async () => {
  const doc = makeDoc([]);
  const res = await navigateToGuideTarget('[data-testid="non-existent-element"]', {
    rootDocument: doc,
    win: fakeWin(),
    getStyle: styleOf,
  });
  assert.equal(res.ok, false);
  assert.equal(res.reason, "target-not-found");

  assert.deepEqual(await navigateToGuideTarget("", { rootDocument: doc }), { ok: false, reason: "no-document-or-selector" });

  assert.doesNotThrow(() => {
    applyHighlight(null);
    applyHighlight({});
    expandPanelForSelector(null, null);
    expandPanelForSelector("invalid-sel", doc);
  });
});

test("10. D3.6D Regression: keyboard-accessible controls and visible focus indicators", () => {
  const guideSource = readFileSync(
    resolve(worldBuilderRoot, "components", "WorldBuilderGuide.jsx"),
    "utf-8"
  );
  const css = readFileSync(
    resolve(worldBuilderRoot, "world-builder.css"),
    "utf-8"
  );

  // All buttons must have explicit type="button" and accessible names/labels
  assert.match(guideSource, /type="button"\s+className="wb-guide-minimize-btn"/);
  assert.match(guideSource, /type="button"\s+className="wb-guide-dismiss-btn"/);
  assert.match(guideSource, /type="button"\s+className="wb-guide-step-action"/);
  assert.match(guideSource, /aria-label=/);

  // Visible focus styles in CSS
  assert.match(css, /\.wb-guide-minimize-btn:focus-visible/);
  assert.match(css, /\.wb-guide-dismiss-btn:focus-visible/);
  assert.match(css, /\.wb-guide-step-action:focus-visible/);
  assert.match(css, /\.wb-guide-got-it-btn:focus-visible/);
});

test("11. D3.6D Regression: reopening and repeated navigation clears earlier highlight without state corruption", () => {
  let addCount = 0;
  let removeCount = 0;

  const mockTarget = {
    classList: {
      add: (cls) => {
        if (cls === "wb-guide-highlight-target") addCount++;
      },
      remove: (cls) => {
        if (cls === "wb-guide-highlight-target") removeCount++;
      },
    },
  };

  applyHighlight(mockTarget, 50);
  assert.equal(addCount, 1);

  // Applying to another target clears the first target
  const mockTarget2 = {
    classList: {
      add: () => {},
      remove: () => {},
    },
  };
  applyHighlight(mockTarget2, 50);
  assert.equal(removeCount, 1, "Must remove highlight from previous target when a new target is highlighted");
});

test("12. Guided start: Sandbox is strictly isolated and does not render the guide", () => {
  const engineLab = read("pages", "EngineLab.jsx");
  const editorWorkspace = read("engine", "EditorWorkspace.jsx");
  const propertiesPanel = read("engine", "PropertiesPanel.jsx");

  // Sandbox page and shared editor do not import or render WorldBuilderGuide
  assert.doesNotMatch(engineLab, /WorldBuilderGuide/);
  assert.doesNotMatch(editorWorkspace, /WorldBuilderGuide/);
  assert.doesNotMatch(propertiesPanel, /WorldBuilderGuide/);

  // Only World Builder workspace imports WorldBuilderGuide
  const workspaceSource = readFileSync(
    resolve(worldBuilderRoot, "components", "WorldBuilderWorkspace.jsx"),
    "utf-8"
  );
  assert.match(workspaceSource, /import WorldBuilderGuide from "\.\/WorldBuilderGuide\.jsx"/);
});

test("13. Guided start: responsive layout with independent scrollable body and highlight pulse", () => {
  const css = readFileSync(
    resolve(worldBuilderRoot, "world-builder.css"),
    "utf-8"
  );

  assert.match(css, /\.wb-guide-card/);
  assert.match(css, /\.wb-guide-card--minimized/);
  assert.match(css, /\.wb-guide-body/);
  assert.match(css, /overflow-y:\s*auto;/);
  assert.match(css, /\.wb-guide-steps/);
  // 1 column by default (phones), 2 from 700px, 3 from 1100px
  assert.match(css, /\.wb-guide-steps\s*\{[^}]*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media\s*\(min-width:\s*700px\)\s*\{\s*\.wb-guide-steps\s*\{\s*grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media\s*\(min-width:\s*1100px\)\s*\{\s*\.wb-guide-steps\s*\{\s*grid-template-columns:\s*repeat\(3,/);
  // height-capped by the viewport, never squeezed by the editor, body scrolls inside
  assert.match(css, /\.wb-guide-card\s*\{[^}]*flex:\s*0 0 auto;/);
  assert.match(css, /\.wb-guide-card\s*\{[^}]*max-height:\s*min\(\d+px,\s*\d+dvh\);/);
  assert.match(css, /\.wb-guide-highlight-target/);
  assert.match(css, /@keyframes wb-target-pulse/);

  // Does not overlay or position absolute/fixed over canvas
  assert.doesNotMatch(css, /\.wb-guide-card\s*\{[^}]*position:\s*fixed;/);
  assert.doesNotMatch(css, /\.wb-guide-card\s*\{[^}]*pointer-events:\s*none;/);
});
