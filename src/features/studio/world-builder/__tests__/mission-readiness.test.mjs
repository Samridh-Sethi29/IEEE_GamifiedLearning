import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateMissionReadiness } from "../engine/missionReadiness.js";
import { evaluateWaterNetwork } from "../engine/waterNetwork.js";
import { evaluateConstructionBudget, getConstructionBudgetLimit } from "../engine/constructionBudget.js";
import {
  evaluateWaterBalance,
  getMissionDailyWaterSupply,
  getMissionMinimumReserve,
} from "../engine/waterReserve.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";
import { createProject, createObject, validateProject } from "../../engine/schema.js";
import { serializeProject, deserializeProject } from "../../storage/serialization.js";
import { MISSION } from "../data/mission.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Mission Readiness Test",
    objects,
  });
}

/**
 * Creates a fully valid baseline village:
 * - 1 Well at (100, 100)
 * - Main pipes connecting Well to Farm at (350, 109)
 * - 4 Households connected to pipe endpoints
 * - Construction cost = 70 coins (well: 18, farm: 8, 4 pipes: 16, 4 houses: 28)
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

test("1. Every underlying model is called or reused through its actual API", () => {
  const doc = makePassingVillage();
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  // Directly verify that underlying evaluations are present and matched
  assert.ok(report.evaluation);
  assert.ok(report.evaluation.waterNetwork);
  assert.ok(report.evaluation.budget);
  assert.ok(report.evaluation.waterBalance);

  // Compare report data with direct calls to underlying modules
  const directNetwork = evaluateWaterNetwork(doc);
  const directBudget = evaluateConstructionBudget(doc);
  const directWater = evaluateWaterBalance(waterInputs);

  assert.equal(report.evaluation.waterNetwork.ok, directNetwork.ok);
  assert.equal(report.evaluation.budget.totalCost, directBudget.totalCost);
  assert.equal(report.evaluation.waterBalance.supplyAdequate, directWater.supplyAdequate);
  assert.equal(report.evaluation.waterBalance.reserveAdequate, directWater.reserveAdequate);
});

test("2. A design satisfying all configured requirements returns ready", () => {
  const doc = makePassingVillage();
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 75, availableReserveLitres: 20 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, true);
  assert.equal(report.overallStatus, "ready");
  assert.equal(report.failedRequirements.length, 0);
  assert.equal(report.unknownRequirements.length, 0);
  assert.equal(report.passedRequirements.length, 5);

  assert.deepEqual(report.passedRequirements.sort(), [
    "budget",
    "dailyWater",
    "households",
    "reserve",
    "waterNetwork",
  ]);

  assert.equal(report.requirements.waterNetwork.status, "pass");
  assert.equal(report.requirements.households.status, "pass");
  assert.equal(report.requirements.budget.status, "pass");
  assert.equal(report.requirements.dailyWater.status, "pass");
  assert.equal(report.requirements.reserve.status, "pass");
});

test("3. A disconnected water network returns needs-attention", () => {
  // Well and farm with no connecting pipes
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, false);
  assert.equal(report.overallStatus, "needs-attention");
  assert.ok(report.failedRequirements.includes("waterNetwork"));
  assert.equal(report.requirements.waterNetwork.status, "fail");
  assert.ok(report.diagnostics.some((d) => d.requirementId === "waterNetwork"));
});

test("4. Fewer than four connected households fails the configured household requirement", () => {
  // Passing route to farm, but only 2 houses connected
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 109, width: 100, height: 100 });
  const h1 = createObject("house", { id: "h1", x: 144, y: 84, width: 110, height: 100 });
  const h2 = createObject("house", { id: "h2", x: 244, y: 84, width: 110, height: 100 });

  const doc = makeDoc([well, pipe1, pipe2, farm, h1, h2]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, false);
  assert.equal(report.overallStatus, "needs-attention");
  assert.ok(report.failedRequirements.includes("households"));
  assert.equal(report.requirements.households.status, "fail");
  assert.equal(report.requirements.households.actual, 2);
  assert.equal(report.requirements.households.details.shortfall, 2);
});

test("5. A construction budget exceeding the limit fails readiness", () => {
  // Base passing village + 6 extra wells (6 * 18 = 108 extra coins -> 70 + 108 = 178 coins > 100)
  const baseDoc = makePassingVillage();
  const extraWells = Array.from({ length: 6 }, (_, i) =>
    createObject("well", { id: `w_extra_${i}`, x: 800, y: 100 + i * 50 })
  );
  const overBudgetDoc = makeDoc([...baseDoc.objects, ...extraWells]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(overBudgetDoc, waterInputs);

  assert.equal(report.ready, false);
  assert.equal(report.overallStatus, "needs-attention");
  assert.ok(report.failedRequirements.includes("budget"));
  assert.equal(report.requirements.budget.status, "fail");
  assert.equal(report.requirements.budget.actual, 178);
  assert.equal(report.requirements.budget.details.overBudget, true);
});

test("6. Unknown daily supply prevents a false water-supply pass", () => {
  const doc = makePassingVillage();
  // No dailyDemandLitres provided -> daily water requirement is unknown
  const waterInputs = { availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, false);
  // Status should be incomplete because no requirement failed, but one is unknown
  assert.equal(report.overallStatus, "incomplete");
  assert.ok(report.unknownRequirements.includes("dailyWater"));
  assert.equal(report.requirements.dailyWater.status, "unknown");
});

test("7. Unknown storage capacity or reserve data prevents a false reserve pass", () => {
  const doc = makePassingVillage();
  // Daily demand provided, but no availableReserveLitres
  const waterInputs = { dailyDemandLitres: 80 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, false);
  assert.equal(report.overallStatus, "incomplete");
  assert.ok(report.unknownRequirements.includes("reserve"));
  assert.equal(report.requirements.reserve.status, "unknown");
});

test("8. Adequate supply and reserve can pass independently of connectivity", () => {
  // Disconnected layout
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.requirements.waterNetwork.status, "fail");
  assert.equal(report.requirements.dailyWater.status, "pass");
  assert.equal(report.requirements.reserve.status, "pass");
});

test("9. A design can pass connectivity but fail the budget", () => {
  const baseDoc = makePassingVillage();
  // Add 10 extra pipes (10 * 4 = 40 coins -> 70 + 40 = 110 coins > 100)
  const extraPipes = Array.from({ length: 10 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const doc = makeDoc([...baseDoc.objects, ...extraPipes]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.requirements.waterNetwork.status, "pass");
  assert.equal(report.requirements.budget.status, "fail");
  assert.equal(report.overallStatus, "needs-attention");
});

test("10. A design can be within budget but fail connectivity", () => {
  // Disconnected well and farm: cost = 18 + 8 = 26 coins (within 100 budget)
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const waterInputs = { dailyDemandLitres: 80, availableReserveLitres: 15 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.requirements.budget.status, "pass");
  assert.equal(report.requirements.waterNetwork.status, "fail");
  assert.equal(report.overallStatus, "needs-attention");
});

test("11. Mixed failed and unknown requirements retain both sets of diagnostics", () => {
  // 1. Budget fails: cost 110 coins
  const baseDoc = makePassingVillage();
  const extraPipes = Array.from({ length: 10 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const doc = makeDoc([...baseDoc.objects, ...extraPipes]);

  // 2. Reserve is unknown (no availableReserveLitres supplied)
  const waterInputs = { dailyDemandLitres: 80 };

  const report = evaluateMissionReadiness(doc, waterInputs);

  // Overall status must be needs-attention (failures take precedence)
  assert.equal(report.overallStatus, "needs-attention");
  assert.ok(report.failedRequirements.includes("budget"));
  assert.ok(report.unknownRequirements.includes("reserve"));

  // Both failure and unknown diagnostics are preserved
  assert.ok(report.diagnostics.some((d) => d.requirementId === "budget" && d.status === "fail"));
  assert.ok(report.diagnostics.some((d) => d.requirementId === "reserve" && d.status === "unknown"));
});

test("12. Exact configured thresholds are handled correctly", () => {
  // Exactly 4 houses connected (from makePassingVillage)
  const doc = makePassingVillage();

  // Exactly 100 L/day demand, exactly 10 L reserve
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 100,
    availableReserveLitres: 10,
    minimumReserveLitres: 10,
  };

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.requirements.households.status, "pass");
  assert.equal(report.requirements.households.actual, 4);

  assert.equal(report.requirements.dailyWater.status, "pass");
  assert.equal(report.requirements.dailyWater.details.shortfallLitres, 0);

  assert.equal(report.requirements.reserve.status, "pass");
  assert.equal(report.requirements.reserve.details.shortfallLitres, 0);

  assert.equal(report.ready, true);
  assert.equal(report.overallStatus, "ready");
});

test("13. Invalid documents and malformed inputs are handled safely", () => {
  // Null document
  const repNull = evaluateMissionReadiness(null);
  assert.equal(repNull.ready, false);
  assert.equal(repNull.overallStatus, "needs-attention");
  assert.equal(repNull.requirements.waterNetwork.status, "fail");
  assert.equal(repNull.requirements.budget.status, "fail");

  // Malformed doc without objects array
  const repBadDoc = evaluateMissionReadiness({ title: "No objects" });
  assert.equal(repBadDoc.ready, false);
  assert.equal(repBadDoc.overallStatus, "needs-attention");

  // Negative water inputs
  const repNegative = evaluateMissionReadiness(makePassingVillage(), {
    dailyDemandLitres: -10,
    availableReserveLitres: -5,
  });
  assert.equal(repNegative.ready, false);
  assert.equal(repNegative.requirements.dailyWater.status, "fail");
  assert.equal(repNegative.requirements.reserve.status, "fail");
});

test("14. Equivalent inputs yield equivalent results", () => {
  const doc1 = makePassingVillage();
  // Reverse the objects array
  const doc2 = makeDoc([...doc1.objects].reverse());
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 };

  const rep1 = evaluateMissionReadiness(doc1, waterInputs);
  const rep2 = evaluateMissionReadiness(doc2, waterInputs);

  assert.equal(rep1.ready, rep2.ready);
  assert.equal(rep1.overallStatus, rep2.overallStatus);
  assert.deepEqual(rep1.passedRequirements.sort(), rep2.passedRequirements.sort());
  assert.deepEqual(rep1.failedRequirements.sort(), rep2.failedRequirements.sort());
  assert.deepEqual(rep1.unknownRequirements.sort(), rep2.unknownRequirements.sort());
  assert.equal(rep1.requirements.budget.actual, rep2.requirements.budget.actual);
  assert.equal(rep1.requirements.households.actual, rep2.requirements.households.actual);
});

test("15. Evaluation does not mutate the document or planning inputs", () => {
  const doc = makePassingVillage();
  const waterInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 };

  Object.freeze(doc);
  Object.freeze(doc.objects);
  for (const obj of doc.objects) Object.freeze(obj);
  Object.freeze(waterInputs);

  const initialDocJson = JSON.stringify(doc);
  const initialInputsJson = JSON.stringify(waterInputs);

  const report = evaluateMissionReadiness(doc, waterInputs);

  assert.equal(report.ready, true);
  assert.equal(JSON.stringify(doc), initialDocJson);
  assert.equal(JSON.stringify(waterInputs), initialInputsJson);
});

test("16. Existing Test Village, household, budget, and reserve tests remain intact", () => {
  const doc = makePassingVillage();

  // Test village trial
  const trial = runVillageTrial(doc);
  assert.equal(trial.status, "pass");
  assert.equal(trial.ok, true);

  // Household target
  const net = evaluateWaterNetwork(doc);
  assert.equal(net.householdTargetMet, true);
  assert.equal(net.housesConnected, 4);

  // Budget
  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.ok, true);
  assert.equal(budget.withinBudget, true);

  // Water reserve
  const water = evaluateWaterBalance({ dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 15 });
  assert.equal(water.ok, true);
  assert.equal(water.overallStatus, "pass");
});

test("17. Serialization, save/reload, and player-save isolation remain intact", () => {
  const doc = makePassingVillage();

  // Serialization round-trip
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);

  const repDeser = evaluateMissionReadiness(deser.project, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repDeser.ready, true);

  // Verify player-save isolation across all engine files
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
    "world-builder/engine/missionReadiness.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /localStorage/, `${rel} touches localStorage`);
  }
});

test("18. Blank planned daily supply input remains unknown and separate from the 100 L/day mission threshold", () => {
  const doc = makePassingVillage();

  // 1. Omitted daily supply input remains unknown and readiness is incomplete
  const repBlank = evaluateMissionReadiness(doc, {
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repBlank.ready, false);
  assert.equal(repBlank.overallStatus, "incomplete");
  assert.equal(repBlank.requirements.dailyWater.status, "unknown");
  assert.equal(repBlank.requirements.dailyWater.actual, null, "Planned supply is null when unconfigured");
  assert.equal(repBlank.requirements.dailyWater.target, 100, "Mission requirement is 100 L/day");
  assert.ok(repBlank.unknownRequirements.includes("dailyWater"));
  assert.ok(
    repBlank.requirements.dailyWater.diagnostics.some((d) =>
      d.includes("Planned daily water supply is unconfigured")
    )
  );

  // 2. Both supply and demand omitted
  const repBothOmitted = evaluateMissionReadiness(doc, {
    availableReserveLitres: 15,
  });
  assert.equal(repBothOmitted.ready, false);
  assert.equal(repBothOmitted.overallStatus, "incomplete");
  assert.equal(repBothOmitted.requirements.dailyWater.status, "unknown");
  assert.equal(repBothOmitted.requirements.dailyWater.actual, null);
  assert.ok(
    repBothOmitted.requirements.dailyWater.diagnostics.some((d) =>
      d.includes("Planned daily water supply and demand are unconfigured")
    )
  );

  // 3. Entering a valid supply value allows the requirement to be evaluated
  const repPass = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repPass.ready, true);
  assert.equal(repPass.overallStatus, "ready");
  assert.equal(repPass.requirements.dailyWater.status, "pass");
  assert.equal(repPass.requirements.dailyWater.actual, 100);

  // 4. Shortfall when supply < demand
  const repFail = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 60,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repFail.ready, false);
  assert.equal(repFail.overallStatus, "needs-attention");
  assert.equal(repFail.requirements.dailyWater.status, "fail");
  assert.equal(repFail.requirements.dailyWater.details.shortfallLitres, 20);

  // 5. The mission required threshold (100 L/day) remains separate from the planned supply (150 L/day)
  const repCustom = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 150,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(repCustom.requirements.dailyWater.target, 100);
  assert.equal(repCustom.requirements.dailyWater.actual, 150);
  assert.equal(repCustom.requirements.dailyWater.details.dailyRequirementLitres, 100);
  assert.equal(repCustom.requirements.dailyWater.details.dailySupplyLitres, 150);
});
