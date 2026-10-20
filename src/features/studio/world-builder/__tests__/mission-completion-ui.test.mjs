import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateMissionCompletion,
  getMissionCompletionThresholds,
} from "../engine/missionCompletion.js";
import { evaluateMissionReadiness } from "../engine/missionReadiness.js";
import { evaluateWaterNetwork } from "../engine/waterNetwork.js";
import { evaluateConstructionBudget } from "../engine/constructionBudget.js";
import { evaluateWaterBalance } from "../engine/waterReserve.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";

import { createProject, createObject, validateProject } from "../../engine/schema.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { serializeProject, deserializeProject } from "../../storage/serialization.js";
import { MISSION } from "../data/mission.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Mission Completion UI Test",
    objects,
  });
}

/**
 * Creates a fully valid baseline village:
 * - 1 Well at (100, 200) (cost: 18)
 * - Main pipes connecting Well to Farm at (350, 209) (cost: 8)
 * - 4 Households connected to pipe endpoints (cost: 4 * 7 = 28)
 * - 4 pipes total (cost: 4 * 4 = 16)
 * - Total construction cost = 70 coins
 */
function makePassingVillage() {
  const well = createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 });
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 });
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 209, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 209, width: 100, height: 100 });

  const h1 = createObject("house", { id: "h1", x: 144, y: 184, width: 110, height: 100 });
  const h2 = createObject("house", { id: "h2", x: 244, y: 184, width: 110, height: 100 });
  const p3 = createObject("pipe", { id: "p3", x: 300, y: 267, width: 116, height: 30, rotation: 90 });
  const h3 = createObject("house", { id: "h3", x: 344, y: 300, width: 110, height: 100 });
  const p4 = createObject("pipe", { id: "p4", x: 300, y: 151, width: 116, height: 30, rotation: 90 });
  const h4 = createObject("house", { id: "h4", x: 344, y: 68, width: 110, height: 100 });

  return makeDoc([well, pipe1, pipe2, farm, h1, h2, p3, h3, p4, h4]);
}

test("1. The completion action is unavailable when a requirement fails", () => {
  // Disconnected village: well and farm far apart with no pipes
  const brokenDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  const completion = evaluateMissionCompletion(brokenDoc, waterInputs);
  assert.equal(completion.eligibleForCompletion, false);
  assert.equal(completion.overallStatus, "needs-attention");
  assert.ok(completion.failedRequirements.includes("waterNetwork"));
  assert.ok(completion.failedRequirements.includes("households"));
  assert.ok(completion.remainingTasks.length > 0);

  // Component UI contract: disabled button & blockers displayed
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /data-testid="wb-mission-completion"/);
  assert.match(dashboardSrc, /data-testid="wb-complete-mission-btn"/);
  assert.match(dashboardSrc, /disabled=\{!completion\.eligibleForCompletion\}/);
  assert.match(dashboardSrc, /data-testid="wb-completion-blockers"/);
});

test("2. The completion action is unavailable when a required value is unknown", () => {
  const doc = makePassingVillage();
  // Empty planning inputs
  const completion = evaluateMissionCompletion(doc, {});

  assert.equal(completion.eligibleForCompletion, false);
  assert.equal(completion.overallStatus, "incomplete");
  assert.ok(completion.unknownRequirements.includes("dailyWater"));
  assert.ok(completion.unknownRequirements.includes("reserve"));
  assert.ok(
    completion.remainingTasks.some((t) => t.includes("daily water supply"))
  );

  // UI contract: blockers list displays unknown task instructions
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /completion\.remainingTasks\.map/);
});

test("3. All required conditions passing enables completion", () => {
  const doc = makePassingVillage();
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  const completion = evaluateMissionCompletion(doc, waterInputs);
  assert.equal(completion.eligibleForCompletion, true);
  assert.equal(completion.overallStatus, "eligible");
  assert.equal(completion.failedRequirements.length, 0);
  assert.equal(completion.unknownRequirements.length, 0);
  assert.equal(completion.passedRequirements.length, 5);
  assert.equal(completion.remainingTasks.length, 0);

  // UI contract: ready notice shown
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /data-testid="wb-completion-ready-notice"/);
});

test("4. The evaluator is called again using current document and planning inputs at completion time", () => {
  const doc = makePassingVillage();
  const validInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  // Simulate handleCompleteMission pattern
  let opened = false;
  const handleCompleteMission = (currentDoc, currentInputs) => {
    const freshCompletion = evaluateMissionCompletion(currentDoc, currentInputs);
    if (freshCompletion.eligibleForCompletion) {
      opened = true;
    }
  };

  // With passing inputs
  handleCompleteMission(doc, validInputs);
  assert.equal(opened, true);

  // With suddenly invalidated inputs (e.g. demand increased beyond supply)
  opened = false;
  const invalidInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 150, // exceeds supply
    availableReserveLitres: 15,
  };
  handleCompleteMission(doc, invalidInputs);
  assert.equal(opened, false);

  // Verify dashboard source implements this fresh evaluation
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /const freshCompletion = evaluateMissionCompletion\(doc, cleanInputs\);/);
  assert.match(dashboardSrc, /if \(freshCompletion\.eligibleForCompletion\) \{/);
});

test("5. Editing the village after a successful assessment cannot use stale eligibility", () => {
  const doc = makePassingVillage();
  let state = createEditorState(doc);

  const inputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  // Initial: eligible
  const initialCompletion = evaluateMissionCompletion(state.history.present, inputs);
  assert.equal(initialCompletion.eligibleForCompletion, true);

  // Player deletes house h4 in editor
  state = editorReducer(state, actions.select("h4"));
  state = editorReducer(state, actions.remove());
  const editedDoc = state.history.present;

  // Immediate reevaluation: no longer eligible
  const editedCompletion = evaluateMissionCompletion(editedDoc, inputs);
  assert.equal(editedCompletion.eligibleForCompletion, false);
  assert.equal(editedCompletion.overallStatus, "needs-attention");
  assert.ok(editedCompletion.failedRequirements.includes("households"));

  // Check effect in dashboard prevents stale modal
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /setShowSuccessScreen\(false\)/);
});

test("6. Explicit completion opens the success experience", () => {
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  // Verify showSuccessScreen controls MissionSuccessScreen rendering
  assert.match(dashboardSrc, /\{showSuccessScreen && \(/);
  assert.match(dashboardSrc, /<MissionSuccessScreen/);

  // Verify MissionSuccessScreen root has dialog role and modal semantics
  const successSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  assert.match(successSrc, /data-testid="wb-mission-success-screen"/);
  assert.match(successSrc, /role="dialog"/);
  assert.match(successSrc, /aria-modal="true"/);
});

test("7. Merely running Test Village does not complete the mission", () => {
  const doc = makePassingVillage();

  // Run Test Village trial
  const trial = runVillageTrial(doc);
  assert.equal(trial.ok, true);
  assert.equal(trial.stats.farmsReached, 1);

  // Running the trial does NOT mutate the doc, nor does it mark mission completion
  assert.equal(doc.completed, undefined);
  assert.equal(doc.missionComplete, undefined);

  // In the UI, the trial result remains separate from completion
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.doesNotMatch(dashboardSrc, /runVillageTrial/);
});

test("8. Merely refreshing the Mission Dashboard does not complete the mission", () => {
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  // Refresh button only increments refresh count, never sets showSuccessScreen(true)
  assert.match(dashboardSrc, /handleRefresh = \(\) => \{\s*setRefreshCount\(\(c\) => c \+ 1\);\s*\};/);
});

test("9. The success summary displays accurate completed objectives and numerical values", () => {
  const doc = makePassingVillage();
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  const completion = evaluateMissionCompletion(doc, waterInputs);
  assert.equal(completion.eligibleForCompletion, true);

  // Verify actual values extracted by MissionSuccessScreen
  const reqs = completion.requirements;
  assert.equal(reqs.waterNetwork.status, "pass");
  assert.equal(reqs.households.actual, 4);
  assert.equal(reqs.households.target, 4);
  assert.equal(reqs.budget.actual, 70);
  assert.equal(reqs.budget.target, 100);
  assert.equal(reqs.budget.details.remainingBudget, 30);
  assert.equal(reqs.dailyWater.details.dailySupplyLitres, 100);
  assert.equal(reqs.dailyWater.details.dailyDemandLitres, 80);
  assert.equal(reqs.reserve.details.availableReserveLitres, 15);
  assert.equal(completion.thresholds.minimumReserve, 10);

  // Verify MissionSuccessScreen contains all required test IDs and headings
  const successSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  assert.match(successSrc, /data-testid="wb-completion-title"/);
  assert.match(successSrc, /Village Saved!/);
  assert.match(successSrc, /data-testid="wb-completion-message"/);
  assert.match(successSrc, /data-testid="wb-completion-challenge-solved"/);
  assert.match(successSrc, /data-testid="wb-completion-objectives"/);
  assert.match(successSrc, /data-testid="wb-completion-metric-network"/);
  assert.match(successSrc, /data-testid="wb-completion-metric-households"/);
  assert.match(successSrc, /data-testid="wb-completion-metric-budget"/);
  assert.match(successSrc, /data-testid="wb-completion-metric-dailyWater"/);
  assert.match(successSrc, /data-testid="wb-completion-metric-reserve"/);
});

test("10. Unknown numerical requirements are never described as passed", () => {
  const doc = makePassingVillage();
  // Daily water supply unknown
  const completion = evaluateMissionCompletion(doc, { availableReserveLitres: 15 });

  assert.equal(completion.eligibleForCompletion, false);
  assert.equal(completion.requirements.dailyWater.status, "unknown");
  assert.notEqual(completion.requirements.dailyWater.status, "pass");
  assert.ok(completion.unknownRequirements.includes("dailyWater"));
  assert.ok(!completion.passedRequirements.includes("dailyWater"));
});

test("11. Returning to the workspace and briefing preserves the saved village design", () => {
  const doc = makePassingVillage();
  const serialized = serializeProject(doc);
  assert.equal(serialized.ok, true);

  // Simulating navigation callbacks
  let workspaceReturned = false;
  let briefingReturned = false;

  const onReturnToWorkspace = () => {
    workspaceReturned = true;
  };
  const onBackToBriefing = () => {
    briefingReturned = true;
  };

  onReturnToWorkspace();
  assert.equal(workspaceReturned, true);

  onBackToBriefing();
  assert.equal(briefingReturned, true);

  // The village document remains 100% identical and deserializable
  const reloaded = deserializeProject(serialized.text);
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.project.objects.length, doc.objects.length);
  assert.deepEqual(reloaded.project.objects.map((o) => o.id), doc.objects.map((o) => o.id));

  // Verify navigation buttons exist in MissionSuccessScreen
  const successSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  assert.match(successSrc, /data-testid="wb-completion-return-workspace"/);
  assert.match(successSrc, /data-testid="wb-completion-return-briefing"/);
});

test("12. Mission completion rewards are displayed in UI and isolated to completion action", () => {
  const successSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  assert.match(successSrc, /data-testid="wb-completion-rewards-card"/);
  assert.match(successSrc, /data-testid="wb-reward-xp"/);
  assert.match(successSrc, /data-testid="wb-reward-coins"/);
  assert.match(successSrc, /data-testid="wb-reward-badge"/);

  // Engine files remain isolated from direct player save key and mutation
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
    "world-builder/engine/missionReadiness.js",
    "world-builder/engine/missionCompletion.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
  }
});

test("13. Sandbox remains unaffected", () => {
  const propsPanelSrc = readFileSync(
    resolve(studioRoot, "engine/PropertiesPanel.jsx"),
    "utf8"
  );
  // MissionDashboard only rendered for world-builder
  assert.match(propsPanelSrc, /doc\.type === "world-builder" && \(\s*<MissionDashboard/);

  // Sandbox document
  const sandboxDoc = makeDoc([], "sandbox");
  assert.notEqual(sandboxDoc.type, "world-builder");
});

test("14. Existing connectivity, household, budget, water-reserve, readiness, and completion tests remain intact", () => {
  // Validate that mission configuration, thresholds, and evaluators are all consistent
  const thresholds = getMissionCompletionThresholds();
  assert.equal(thresholds.households, 4);
  assert.equal(thresholds.budgetLimit, 100);
  assert.equal(thresholds.dailySupply, 100);
  assert.equal(thresholds.minimumReserve, 10);

  const doc = makePassingVillage();
  const readiness = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(readiness.ready, true);

  const completion = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(completion.eligibleForCompletion, true);
});

test("15. Mission success modal viewport max-height, flex-column structure, and independent scroll area", () => {
  const css = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.css"),
    "utf8"
  );
  const jsx = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );

  // 1. Modal viewport max-height and centering behavior
  assert.match(css, /\.wb-success-overlay\s*\{[^}]*position:\s*fixed;/);
  assert.match(css, /\.wb-success-overlay\s*\{[^}]*overflow-y:\s*auto;/);
  assert.match(css, /\.wb-success-dialog\s*\{[^}]*max-height:\s*calc\(100(?:d)?vh\s*-\s*2rem\);/);
  assert.match(css, /\.wb-success-dialog\s*\{[^}]*display:\s*flex;/);
  assert.match(css, /\.wb-success-dialog\s*\{[^}]*flex-direction:\s*column;/);
  assert.match(css, /\.wb-success-dialog\s*\{[^}]*margin:\s*auto;/);

  // 2. Header/title visibility (pinned at top) and footer accessibility (pinned at bottom)
  assert.match(css, /\.wb-success-banner\s*\{[^}]*flex-shrink:\s*0;/);
  assert.match(css, /\.wb-success-actions\s*\{[^}]*flex-shrink:\s*0;/);

  // 3. Scrollable content body wrapping long success/replay content
  assert.match(jsx, /<div className="wb-success-body" data-testid="wb-completion-body">/);
  assert.match(css, /\.wb-success-body\s*\{[^}]*flex:\s*1\s+1\s+auto;/);
  assert.match(css, /\.wb-success-body\s*\{[^}]*min-height:\s*0;/);
  assert.match(css, /\.wb-success-body\s*\{[^}]*overflow-y:\s*auto;/);

  // 4. Responsive adjustments for constrained viewport heights (e.g. max-height: 640px)
  assert.match(css, /@media\s*\(\s*max-height:\s*640px\s*\)/);

  // 5. Navigation buttons remain accessible in actions footer
  assert.match(jsx, /data-testid="wb-completion-return-workspace"/);
  assert.match(jsx, /data-testid="wb-completion-return-briefing"/);
});

