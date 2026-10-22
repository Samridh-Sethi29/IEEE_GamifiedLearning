import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateMissionReadiness } from "../engine/missionReadiness.js";
import { evaluateWaterNetwork } from "../engine/waterNetwork.js";
import { evaluateConstructionBudget } from "../engine/constructionBudget.js";
import { evaluateWaterBalance } from "../engine/waterReserve.js";
import { getWaterStatus } from "../engine/waterStatusModel.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";

import { createProject, createObject, validateProject } from "../../engine/schema.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { serializeProject, deserializeProject } from "../../storage/serialization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Mission Dashboard Test",
    objects,
  });
}

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

test("1. The dashboard accurately renders a successful readiness assessment", () => {
  const doc = makePassingVillage();
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 };

  const readiness = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(readiness.ready, true);
  assert.equal(readiness.overallStatus, "ready");
  assert.equal(readiness.requirements.waterNetwork.status, "pass");
  assert.equal(readiness.requirements.households.status, "pass");
  assert.equal(readiness.requirements.budget.status, "pass");
  assert.equal(readiness.requirements.dailyWater.status, "pass");
  assert.equal(readiness.requirements.reserve.status, "pass");

  // Verify dashboard component source code contract
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /data-testid="wb-mission-dashboard"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-overall"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-item-waterNetwork"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-item-households"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-item-budget"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-item-dailyWater"/);
  assert.match(dashboardSrc, /data-testid="wb-dashboard-item-reserve"/);
  assert.match(dashboardSrc, /data-testid="wb-planning-inputs"/);
});

test("2. Failed connectivity appears independently of budget status", () => {
  // Disconnected well and farm: cost is 26 coins (well: 18 + farm: 8)
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const readiness = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(readiness.requirements.waterNetwork.status, "fail");
  assert.equal(readiness.requirements.budget.status, "pass");
  assert.equal(readiness.requirements.budget.actual, 26);
  assert.equal(readiness.overallStatus, "needs-attention");
});

test("3. Household count and target are correctly displayed", () => {
  // Pass village has 4 households
  const doc4 = makePassingVillage();
  const readiness4 = evaluateMissionReadiness(doc4);
  assert.equal(readiness4.requirements.households.actual, 4);
  assert.equal(readiness4.requirements.households.target, 4);
  assert.equal(readiness4.requirements.households.status, "pass");

  // Remove two houses so only 2 remain
  const doc2 = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 209, width: 100, height: 100 }),
    createObject("house", { id: "h1", x: 144, y: 184, width: 110, height: 100 }),
  ]);
  const readiness2 = evaluateMissionReadiness(doc2);
  assert.equal(readiness2.requirements.households.actual, 1);
  assert.equal(readiness2.requirements.households.target, 4);
  assert.equal(readiness2.requirements.households.status, "fail");
  assert.equal(readiness2.requirements.households.details.shortfall, 3);
});

test("4. Over-budget designs show the correct total and shortfall", () => {
  const baseDoc = makePassingVillage(); // cost = 70 coins
  // Add 12 pipes (12 * 4 = 48 coins -> 70 + 48 = 118 coins > 100)
  const extraPipes = Array.from({ length: 12 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const overBudgetDoc = makeDoc([...baseDoc.objects, ...extraPipes]);

  const readiness = evaluateMissionReadiness(overBudgetDoc);

  assert.equal(readiness.requirements.budget.status, "fail");
  assert.equal(readiness.requirements.budget.actual, 118);
  assert.equal(readiness.requirements.budget.target, 100);
  assert.equal(readiness.requirements.budget.details.overBudget, true);
  assert.equal(readiness.requirements.budget.details.shortfall, 18);
});

test("5. Unknown water supply is clearly reported as unknown", () => {
  const doc = makePassingVillage();
  // No dailySupplyLitres or dailyDemandLitres provided
  const readiness = evaluateMissionReadiness(doc, {});

  assert.equal(readiness.requirements.dailyWater.status, "unknown");
  assert.equal(readiness.requirements.dailyWater.actual, null);
  assert.equal(readiness.requirements.dailyWater.target, 100);
  assert.equal(readiness.requirements.dailyWater.details.dailySupplyLitres, null);
  assert.equal(readiness.requirements.dailyWater.details.dailyDemandLitres, null);
  assert.ok(readiness.unknownRequirements.includes("dailyWater"));
  assert.equal(readiness.ready, false);
  assert.equal(readiness.overallStatus, "incomplete");
});

test("6. Insufficient daily supply displays the actual calculated shortfall", () => {
  const doc = makePassingVillage();
  // Supply = 100 L/day, Demand = 135 L/day -> shortfall = 35 L/day
  const readiness = evaluateMissionReadiness(doc, { dailySupplyLitres: 100, dailyDemandLitres: 135 });

  assert.equal(readiness.requirements.dailyWater.status, "fail");
  assert.equal(readiness.requirements.dailyWater.details.shortfallLitres, 35);
  assert.ok(
    readiness.requirements.dailyWater.diagnostics.some((d) => d.includes("35 L/day"))
  );
});

test("7. Insufficient reserve displays the actual reserve shortfall", () => {
  const doc = makePassingVillage();
  // Stored = 6 L, Minimum required = 10 L -> shortfall = 4 L
  const readiness = evaluateMissionReadiness(doc, { availableReserveLitres: 6 });

  assert.equal(readiness.requirements.reserve.status, "fail");
  assert.equal(readiness.requirements.reserve.details.shortfallLitres, 4);
  assert.ok(
    readiness.requirements.reserve.diagnostics.some((d) => d.includes("4 L"))
  );
});

test("8. Valid planning-input changes trigger an updated readiness assessment", () => {
  const doc = makePassingVillage();

  // Initially incomplete (no inputs)
  const repInitial = evaluateMissionReadiness(doc, {});
  assert.equal(repInitial.requirements.dailyWater.status, "unknown");
  assert.equal(repInitial.requirements.reserve.status, "unknown");
  assert.equal(repInitial.overallStatus, "incomplete");

  // Updated with valid planning inputs
  const repUpdated = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 85,
    availableReserveLitres: 14,
  });
  assert.equal(repUpdated.requirements.dailyWater.status, "pass");
  assert.equal(repUpdated.requirements.reserve.status, "pass");
  assert.equal(repUpdated.overallStatus, "ready");
});

test("9. Invalid and negative planning inputs are rejected", () => {
  const doc = makePassingVillage();

  // Negative inputs
  const repNegative = evaluateMissionReadiness(doc, {
    dailyDemandLitres: -25,
    availableReserveLitres: -10,
  });
  assert.equal(repNegative.requirements.dailyWater.status, "fail");
  assert.equal(repNegative.requirements.reserve.status, "fail");
  assert.equal(repNegative.overallStatus, "needs-attention");

  // Component handles errors inline
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /Cannot be negative/);
  assert.match(dashboardSrc, /wb-planning-error/);
});

test("10. Results cannot be mistaken for current after a relevant document edit", () => {
  const doc = makePassingVillage();
  let state = createEditorState(doc);

  // Check 1: 4 houses connected -> ready
  const rep1 = evaluateMissionReadiness(state.history.present, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(rep1.ready, true);
  assert.equal(rep1.requirements.households.actual, 4);

  // Edit: select and delete h4
  state = editorReducer(state, actions.select("h4"));
  state = editorReducer(state, actions.remove());
  const docEdited = state.history.present;

  // Check 2: Immediately recomputes from current doc
  const rep2 = evaluateMissionReadiness(docEdited, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(rep2.ready, false);
  assert.equal(rep2.overallStatus, "needs-attention");
  assert.equal(rep2.requirements.households.actual, 3);
  assert.equal(rep2.requirements.households.status, "fail");
});

test("11. Overall status respects the D3.4E rules for ready, needs-attention, and incomplete", () => {
  const doc = makePassingVillage();

  // 1. Ready: all 5 pass
  const rReady = evaluateMissionReadiness(doc, { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 });
  assert.equal(rReady.overallStatus, "ready");

  // 2. Incomplete: none fail, but daily water is unknown
  const rIncomplete = evaluateMissionReadiness(doc, { availableReserveLitres: 15 });
  assert.equal(rIncomplete.overallStatus, "incomplete");

  // 3. Needs-attention: one requirement fails
  const rAttention = evaluateMissionReadiness(doc, { dailySupplyLitres: 100, dailyDemandLitres: 150, availableReserveLitres: 15 });
  assert.equal(rAttention.overallStatus, "needs-attention");

  // 4. Mixed: one fails and one is unknown -> needs-attention takes precedence
  const rMixed = evaluateMissionReadiness(doc, { dailySupplyLitres: 100, dailyDemandLitres: 150 }); // demand fails (150 > 100), reserve unknown
  assert.equal(rMixed.overallStatus, "needs-attention");
  assert.ok(rMixed.failedRequirements.includes("dailyWater"));
  assert.ok(rMixed.unknownRequirements.includes("reserve"));
});

test("12. The dashboard does not duplicate or contradict the underlying model outputs", () => {
  const doc = makePassingVillage();
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 };

  const readiness = evaluateMissionReadiness(doc, waterInputs);
  const net = evaluateWaterNetwork(doc);
  const budget = evaluateConstructionBudget(doc);
  const water = evaluateWaterBalance(waterInputs);

  assert.equal(readiness.requirements.waterNetwork.details.reachesFarm, net.reachesFarm);
  assert.equal(readiness.requirements.households.actual, net.housesConnected);
  assert.equal(readiness.requirements.budget.actual, budget.totalCost);
  assert.equal(readiness.requirements.dailyWater.details.dailyDemandLitres, water.dailyDemandLitres);
  assert.equal(readiness.requirements.reserve.details.availableReserveLitres, water.availableReserveLitres);
});

test("13. Test Village still reports connectivity rather than full mission completion", () => {
  // A village with well connected to farm, but 0 houses and no reserve
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);

  const trial = runVillageTrial(doc);
  // Trial passes connectivity trial
  assert.equal(trial.ok, true);
  assert.equal(trial.status, "pass");

  // But full mission readiness fails
  const readiness = evaluateMissionReadiness(doc, {});
  assert.equal(readiness.ready, false);
  assert.equal(readiness.requirements.households.status, "fail");
});

test("14. Check Water System still provides its existing diagnostics", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);

  const waterStatus = getWaterStatus(doc);
  assert.equal(waterStatus.status, "attention");
  assert.ok(waterStatus.checklist.length > 0);
  assert.ok(waterStatus.messages.length > 0);
});

test("15. Sandbox remains unaffected", () => {
  // Verify PropertiesPanel mounts MissionDashboard conditionally
  const panelSrc = readFileSync(resolve(studioRoot, "engine/PropertiesPanel.jsx"), "utf8");
  assert.match(
    panelSrc,
    /doc\.type\s*===\s*"world-builder"\s*&&\s*\(\s*<MissionDashboard/
  );

  // In sandbox, doc.type === 'sandbox'
  const sbDoc = makeDoc(
    [createObject("rectangle", { id: "r1", x: 100, y: 100 }, "sandbox")],
    "sandbox"
  );
  assert.equal(sbDoc.type, "sandbox");
  assert.equal(validateProject(sbDoc).ok, true);
});

test("16. Save/reload, selection, editing, undo/redo, properties, overlay rendering, and player-save isolation remain intact", () => {
  const doc = makePassingVillage();

  // Serialization roundtrip
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);

  // Undo / Redo
  let state = createEditorState(doc);
  state = editorReducer(state, actions.select("w1"));
  state = editorReducer(state, actions.moveTo(120, 200));
  assert.equal(state.history.present.objects.find((o) => o.id === "w1").x, 120);
  state = editorReducer(state, actions.undo());
  assert.equal(state.history.present.objects.find((o) => o.id === "w1").x, 100);

  // Player-save isolation across all World Builder components and engine modules
  const allWbFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
    "world-builder/engine/missionReadiness.js",
    "world-builder/engine/missionCompletion.js",
    "world-builder/components/WaterStatusInspector.jsx",
    "world-builder/components/VillageTrialCard.jsx",
  ];

  for (const rel of allWbFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /localStorage/, `${rel} touches localStorage directly`);
  }
});

test("17. MissionDashboard starts with blank daily supply and requires explicit entry to become ready", () => {
  const doc = makePassingVillage();

  // 1. Inspect source code contract for blank initial state and updated placeholder/hint
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(
    dashboardSrc,
    /dailySupplyLitres:\s*initialPlanningInputs\?\.dailySupplyLitres\s*\?\?\s*""/,
    "dailySupplyLitres defaults to empty string"
  );
  assert.match(
    dashboardSrc,
    /placeholder="e\.g\.\s*100"/,
    "input placeholder is 'e.g. 100'"
  );
  assert.match(
    dashboardSrc,
    /planningInputs\.dailySupplyLitres\s*===\s*""/,
    "missing-hint check checks dailySupplyLitres === ''"
  );

  // 2. Until the player enters a valid supply value, report supply as unknown and mission as incomplete
  const repInitial = evaluateMissionReadiness(doc, {
    dailySupplyLitres: null, // represents blank input
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repInitial.requirements.dailyWater.status, "unknown");
  assert.equal(repInitial.requirements.dailyWater.actual, null);
  assert.equal(repInitial.requirements.dailyWater.target, 100);
  assert.equal(repInitial.ready, false);
  assert.equal(repInitial.overallStatus, "incomplete");

  // 3. Entering a valid supply value allows complete evaluation
  const repSupplied = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repSupplied.requirements.dailyWater.status, "pass");
  assert.equal(repSupplied.requirements.dailyWater.actual, 100);
  assert.equal(repSupplied.ready, true);
  assert.equal(repSupplied.overallStatus, "ready");

  // 4. Mission requirement remains separate from planned supply (e.g. 120 L/day planned vs 100 L/day mission target)
  const repDifferentSupply = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 120,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repDifferentSupply.requirements.dailyWater.target, 100, "Mission required threshold stays 100");
  assert.equal(repDifferentSupply.requirements.dailyWater.actual, 120, "Planned supply is 120");
  assert.equal(repDifferentSupply.requirements.dailyWater.details.dailyRequirementLitres, 100);
  assert.equal(repDifferentSupply.requirements.dailyWater.details.dailySupplyLitres, 120);
});
