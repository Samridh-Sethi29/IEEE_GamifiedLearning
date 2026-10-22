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
import { getWaterStatus } from "../engine/waterStatusModel.js";

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
    title: "Mission Completion Test",
    objects,
  });
}

/**
 * Creates a fully valid baseline village:
 * - 1 Well at (100, 200) (cost: 18)
 * - Main pipes connecting Well to Farm at (350, 209) (cost: 8)
 * - 4 Households connected to pipe endpoints (cost: 4 * 7 = 28)
 * - 4 pipes total (cost: 4 * 4 = 16)
 * - Total construction cost = 70 coins (well: 18, farm: 8, 4 houses: 28, 4 pipes: 16)
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

test("0. Mission completion thresholds match authoritative configuration", () => {
  const thresholds = getMissionCompletionThresholds();

  assert.equal(thresholds.households, 4);
  assert.equal(thresholds.budgetLimit, 100);
  assert.equal(thresholds.budgetLimitUnit, "mission coins");
  assert.equal(thresholds.dailySupply, 100);
  assert.equal(thresholds.dailySupplyUnit, "litres per day");
  assert.equal(thresholds.minimumReserve, 10);
  assert.equal(thresholds.minimumReserveUnit, "litres");
  assert.equal(thresholds.farmTarget, 1);
  assert.equal(thresholds.wellTarget, 1);
});

test("1. Every requirement passing makes completion eligible", () => {
  const doc = makePassingVillage();
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  const result = evaluateMissionCompletion(doc, waterInputs);

  assert.equal(result.eligibleForCompletion, true);
  assert.equal(result.overallStatus, "eligible");
  assert.equal(result.failedRequirements.length, 0);
  assert.equal(result.unknownRequirements.length, 0);
  assert.equal(result.passedRequirements.length, 5);
  assert.deepEqual(result.passedRequirements.sort(), [
    "budget",
    "dailyWater",
    "households",
    "reserve",
    "waterNetwork",
  ]);
  assert.equal(result.remainingTasks.length, 0);
  assert.match(result.summary, /eligible for completion/i);
  assert.ok(result.readiness);
});

test("2. Any failed requirement prevents eligibility", () => {
  const baseDoc = makePassingVillage();

  // Scenario A: Disconnected network (well unconnected)
  const disconnectedDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("farm", { id: "f1", x: 800, y: 800 }),
  ]);
  const resA = evaluateMissionCompletion(disconnectedDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resA.eligibleForCompletion, false);
  assert.equal(resA.overallStatus, "needs-attention");
  assert.ok(resA.failedRequirements.includes("waterNetwork"));

  // Scenario B: Over budget
  const extraWells = Array.from({ length: 6 }, (_, i) =>
    createObject("well", { id: `w_extra_${i}`, x: 800, y: 100 + i * 50 })
  );
  const overBudgetDoc = makeDoc([...baseDoc.objects, ...extraWells]);
  const resB = evaluateMissionCompletion(overBudgetDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resB.eligibleForCompletion, false);
  assert.equal(resB.overallStatus, "needs-attention");
  assert.ok(resB.failedRequirements.includes("budget"));

  // Scenario C: Insufficient households (remove 2 houses)
  const fewHousesDoc = makeDoc(baseDoc.objects.filter((o) => o.id !== "h3" && o.id !== "h4"));
  const resC = evaluateMissionCompletion(fewHousesDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resC.eligibleForCompletion, false);
  assert.equal(resC.overallStatus, "needs-attention");
  assert.ok(resC.failedRequirements.includes("households"));

  // Scenario D: Insufficient supply
  const resD = evaluateMissionCompletion(baseDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 130,
    availableReserveLitres: 15,
  });
  assert.equal(resD.eligibleForCompletion, false);
  assert.equal(resD.overallStatus, "needs-attention");
  assert.ok(resD.failedRequirements.includes("dailyWater"));

  // Scenario E: Insufficient reserve
  const resE = evaluateMissionCompletion(baseDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 5,
  });
  assert.equal(resE.eligibleForCompletion, false);
  assert.equal(resE.overallStatus, "needs-attention");
  assert.ok(resE.failedRequirements.includes("reserve"));
});

test("3. Any required unknown value prevents eligibility", () => {
  const doc = makePassingVillage();

  // Missing reserve
  const resNoReserve = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
  });
  assert.equal(resNoReserve.eligibleForCompletion, false);
  assert.equal(resNoReserve.overallStatus, "incomplete");
  assert.ok(resNoReserve.unknownRequirements.includes("reserve"));
  assert.ok(resNoReserve.remainingTasks.some((t) => t.includes("reserve")));

  // Missing daily supply
  const resNoSupply = evaluateMissionCompletion(doc, {
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resNoSupply.eligibleForCompletion, false);
  assert.equal(resNoSupply.overallStatus, "incomplete");
  assert.ok(resNoSupply.unknownRequirements.includes("dailyWater"));
  assert.ok(resNoSupply.remainingTasks.some((t) => t.includes("daily water supply")));

  // Missing daily demand
  const resNoDemand = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    availableReserveLitres: 15,
  });
  assert.equal(resNoDemand.eligibleForCompletion, false);
  assert.equal(resNoDemand.overallStatus, "incomplete");
  assert.ok(resNoDemand.unknownRequirements.includes("dailyWater"));

  // Completely blank inputs
  const resBlank = evaluateMissionCompletion(doc, {});
  assert.equal(resBlank.eligibleForCompletion, false);
  assert.equal(resBlank.overallStatus, "incomplete");
  assert.ok(resBlank.unknownRequirements.includes("dailyWater"));
  assert.ok(resBlank.unknownRequirements.includes("reserve"));
});

test("4. Missing well, farm, or insufficient connected households prevents eligibility", () => {
  // 4a. Missing well
  const noWellDoc = makeDoc([
    createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 350, y: 209, width: 100, height: 100 }),
  ]);
  const resNoWell = evaluateMissionCompletion(noWellDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resNoWell.eligibleForCompletion, false);
  assert.ok(resNoWell.failedRequirements.includes("waterNetwork"));
  assert.ok(resNoWell.remainingTasks.some((t) => t.includes("well")));

  // 4b. Missing farm
  const noFarmDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 }),
  ]);
  const resNoFarm = evaluateMissionCompletion(noFarmDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resNoFarm.eligibleForCompletion, false);
  assert.ok(resNoFarm.failedRequirements.includes("waterNetwork"));
  assert.ok(resNoFarm.remainingTasks.some((t) => t.includes("farm")));

  // 4c. Only 3 households connected
  const baseDoc = makePassingVillage();
  const threeHousesDoc = makeDoc(baseDoc.objects.filter((o) => o.id !== "h4"));
  const resThree = evaluateMissionCompletion(threeHousesDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resThree.eligibleForCompletion, false);
  assert.ok(resThree.failedRequirements.includes("households"));
  assert.equal(resThree.requirements.households.details.shortfall, 1);
  assert.ok(resThree.remainingTasks.some((t) => t.includes("1 more household")));
});

test("5. Over-budget design prevents eligibility", () => {
  const baseDoc = makePassingVillage(); // cost = 70 coins
  // Add 10 extra pipes (10 * 4 = 40 coins -> 70 + 40 = 110 coins > 100)
  const extraPipes = Array.from({ length: 10 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const overBudgetDoc = makeDoc([...baseDoc.objects, ...extraPipes]);

  const result = evaluateMissionCompletion(overBudgetDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });

  assert.equal(result.eligibleForCompletion, false);
  assert.equal(result.overallStatus, "needs-attention");
  assert.ok(result.failedRequirements.includes("budget"));
  assert.equal(result.requirements.budget.actual, 110);
  assert.equal(result.requirements.budget.details.shortfall, 10);
  assert.ok(result.remainingTasks.some((t) => t.includes("10 coins")));
});

test("6. Insufficient daily supply prevents eligibility", () => {
  const doc = makePassingVillage();

  // 6a. Supply lower than demand (100 L/day supply, 125 L/day demand)
  const resLowerThanDemand = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 125,
    availableReserveLitres: 15,
  });
  assert.equal(resLowerThanDemand.eligibleForCompletion, false);
  assert.equal(resLowerThanDemand.overallStatus, "needs-attention");
  assert.ok(resLowerThanDemand.failedRequirements.includes("dailyWater"));
  assert.equal(resLowerThanDemand.requirements.dailyWater.details.shortfallLitres, 25);
  assert.ok(resLowerThanDemand.remainingTasks.some((t) => t.includes("shortfall")));

  // 6b. Supply lower than the configured 100 L/day mission threshold (85 L/day supply, 70 L/day demand)
  const resLowerThanMission = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 85,
    dailyDemandLitres: 70,
    availableReserveLitres: 15,
  });
  assert.equal(resLowerThanMission.eligibleForCompletion, false);
  assert.equal(resLowerThanMission.overallStatus, "needs-attention");
  assert.ok(resLowerThanMission.failedRequirements.includes("dailyWater"));
  assert.equal(resLowerThanMission.requirements.dailyWater.details.shortfallLitres, 15);
  assert.ok(resLowerThanMission.remainingTasks.some((t) => t.includes("15 L/day")));
});

test("7. Insufficient reserve prevents eligibility", () => {
  const doc = makePassingVillage();
  // 6 L stored reserve vs 10 L minimum required
  const result = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 6,
  });

  assert.equal(result.eligibleForCompletion, false);
  assert.equal(result.overallStatus, "needs-attention");
  assert.ok(result.failedRequirements.includes("reserve"));
  assert.equal(result.requirements.reserve.details.shortfallLitres, 4);
  assert.ok(result.remainingTasks.some((t) => t.includes("4 L")));
});

test("8. Exact thresholds pass correctly", () => {
  // Exactly 4 households connected
  // Exactly 100 coins budget limit:
  // Base village: well (18), farm (8), 4 houses (28), 4 pipes (16) = 70 coins.
  // Add 1 house (7), 5 pipes (20), 1 tank (5) -> 70 + 32 = 102.
  // Let's make an exact 100-coin village:
  // 1 well (18) + 1 farm (8) + 4 houses (28) + 7 pipes (28) + 2 tanks (10) = 92 + 2 pipes (8) = 100 coins!
  const well = createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 });
  const p1 = createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 });
  const p2 = createObject("pipe", { id: "p2", x: 250, y: 209, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 209, width: 100, height: 100 });

  const h1 = createObject("house", { id: "h1", x: 144, y: 184, width: 110, height: 100 });
  const h2 = createObject("house", { id: "h2", x: 244, y: 184, width: 110, height: 100 });
  const p3 = createObject("pipe", { id: "p3", x: 300, y: 267, width: 116, height: 30, rotation: 90 });
  const h3 = createObject("house", { id: "h3", x: 344, y: 300, width: 110, height: 100 });
  const p4 = createObject("pipe", { id: "p4", x: 300, y: 151, width: 116, height: 30, rotation: 90 });
  const h4 = createObject("house", { id: "h4", x: 344, y: 68, width: 110, height: 100 });

  // 70 coins so far (18 + 8 + 28 + 16). Need 30 more coins:
  // 1 tank (12) + 3 pipes (12) + 2 roads (6) = 30 coins -> Total = 100 coins!
  const extraTank = createObject("tank", { id: "te_1", x: 800, y: 300 });
  const extraPipes = Array.from({ length: 3 }, (_, i) =>
    createObject("pipe", { id: `pe_${i}`, x: 800, y: 100 + i * 20 })
  );
  const extraRoads = Array.from({ length: 2 }, (_, i) =>
    createObject("road", { id: `re_${i}`, x: 800, y: 200 + i * 20 })
  );

  const exactBudgetDoc = makeDoc([
    well, p1, p2, farm, h1, h2, p3, h3, p4, h4,
    extraTank,
    ...extraPipes,
    ...extraRoads,
  ]);

  // Exact budget calculation check
  const budget = evaluateConstructionBudget(exactBudgetDoc);
  assert.equal(budget.totalCost, 100);
  assert.equal(budget.withinBudget, true);

  // Exact 100 L/day supply, exact 100 L/day demand, exact 10 L reserve
  const result = evaluateMissionCompletion(exactBudgetDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 100,
    availableReserveLitres: 10,
    minimumReserveLitres: 10,
  });

  assert.equal(result.eligibleForCompletion, true);
  assert.equal(result.overallStatus, "eligible");
  assert.equal(result.failedRequirements.length, 0);
  assert.equal(result.unknownRequirements.length, 0);
  assert.equal(result.requirements.households.actual, 4);
  assert.equal(result.requirements.budget.actual, 100);
  assert.equal(result.requirements.dailyWater.actual, 100);
  assert.equal(result.requirements.reserve.actual, 10);
  assert.equal(result.remainingTasks.length, 0);
});

test("9. Failed and unknown diagnostics remain separately identifiable", () => {
  const baseDoc = makePassingVillage();
  // 1. Over budget (110 coins) -> budget fails
  const extraPipes = Array.from({ length: 10 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const overBudgetDoc = makeDoc([...baseDoc.objects, ...extraPipes]);

  // 2. Reserve omitted -> reserve unknown
  const result = evaluateMissionCompletion(overBudgetDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
  });

  // Overall status is needs-attention because failures take precedence
  assert.equal(result.eligibleForCompletion, false);
  assert.equal(result.overallStatus, "needs-attention");

  // Failed and unknown lists are separate
  assert.deepEqual(result.failedRequirements, ["budget"]);
  assert.deepEqual(result.unknownRequirements, ["reserve"]);
  assert.ok(result.passedRequirements.includes("waterNetwork"));
  assert.ok(result.passedRequirements.includes("households"));
  assert.ok(result.passedRequirements.includes("dailyWater"));

  // Remaining tasks covers both the failure and the unknown
  assert.ok(result.remainingTasks.some((t) => t.includes("budget")));
  assert.ok(result.remainingTasks.some((t) => t.includes("reserve")));
});

test("10. Equivalent inputs produce deterministic results", () => {
  const doc1 = makePassingVillage();
  const doc2 = makeDoc([...doc1.objects].reverse());
  const inputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  const res1 = evaluateMissionCompletion(doc1, inputs);
  const res2 = evaluateMissionCompletion(doc2, inputs);

  assert.equal(res1.eligibleForCompletion, res2.eligibleForCompletion);
  assert.equal(res1.overallStatus, res2.overallStatus);
  assert.deepEqual([...res1.passedRequirements].sort(), [...res2.passedRequirements].sort());
  assert.deepEqual([...res1.failedRequirements].sort(), [...res2.failedRequirements].sort());
  assert.deepEqual([...res1.unknownRequirements].sort(), [...res2.unknownRequirements].sort());

  // Repeated runs on identical doc
  const res3 = evaluateMissionCompletion(doc1, inputs);
  assert.deepEqual(res1, res3);
});

test("11. Inputs and saved designs are not mutated", () => {
  const doc = makePassingVillage();
  const waterInputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  };

  Object.freeze(doc);
  Object.freeze(doc.objects);
  for (const obj of doc.objects) Object.freeze(obj);
  Object.freeze(waterInputs);

  const initialDocJson = JSON.stringify(doc);
  const initialInputsJson = JSON.stringify(waterInputs);

  const result = evaluateMissionCompletion(doc, waterInputs);

  assert.equal(result.eligibleForCompletion, true);
  assert.equal(JSON.stringify(doc), initialDocJson);
  assert.equal(JSON.stringify(waterInputs), initialInputsJson);
});

test("12. Existing Test Village, Water Status, dashboard, serialization, save/reload, and player-save isolation remain unchanged", () => {
  const doc = makePassingVillage();

  // 1. Test Village trial still works
  const trial = runVillageTrial(doc);
  assert.equal(trial.status, "pass");
  assert.equal(trial.ok, true);

  // 2. Check Water System still works
  const waterStatus = getWaterStatus(doc);
  assert.equal(waterStatus.status, "connected");

  // 3. Mission readiness evaluator still works
  const readiness = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(readiness.ready, true);
  assert.equal(readiness.overallStatus, "ready");

  // 4. Serialization round-trip still works
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);
  const resDeser = evaluateMissionCompletion(deser.project, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(resDeser.eligibleForCompletion, true);

  // 5. Player-save isolation across all engine files
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
    "world-builder/engine/missionReadiness.js",
    "world-builder/engine/missionCompletion.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /localStorage/, `${rel} touches localStorage`);
  }
});
