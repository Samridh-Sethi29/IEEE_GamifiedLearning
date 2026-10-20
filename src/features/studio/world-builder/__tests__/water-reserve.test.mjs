import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getMissionDailyWaterSupply,
  getMissionMinimumReserve,
  getMissionWaterThresholds,
  UNCONFIGURED_BALANCING_PARAMETERS,
  evaluateDailyWaterSupply,
  evaluateStoredWaterReserve,
  evaluateWaterBalance,
} from "../engine/waterReserve.js";

import { MISSION } from "../data/mission.js";
import { createProject, createObject, validateProject } from "../../engine/schema.js";
import { serializeProject, deserializeProject } from "../../storage/serialization.js";
import { evaluateWaterNetwork } from "../engine/waterNetwork.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";
import { evaluateConstructionBudget } from "../engine/constructionBudget.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Water Reserve Test",
    objects,
  });
}

test("1. Mission thresholds are read from the intended configuration", () => {
  const daily = getMissionDailyWaterSupply();
  const reserve = getMissionMinimumReserve();
  const thresholds = getMissionWaterThresholds();

  assert.equal(daily, 100);
  assert.equal(daily, MISSION.resources.water.value);
  assert.equal(thresholds.dailySupplyUnit, "litres per day");

  assert.equal(reserve, 10);
  const missionReserveObjective = MISSION.objectives.find((o) => o.id === "reserve");
  assert.equal(reserve, missionReserveObjective.target);
  assert.equal(thresholds.minimumReserveUnit, "litres");

  assert.deepEqual(thresholds, {
    dailySupply: 100,
    dailySupplyUnit: "litres per day",
    minimumReserve: 10,
    minimumReserveUnit: "litres",
  });

  // Verify list of unconfigured parameters
  assert.ok(Array.isArray(UNCONFIGURED_BALANCING_PARAMETERS));
  assert.ok(UNCONFIGURED_BALANCING_PARAMETERS.includes("householdDemandLitresPerDay"));
  assert.ok(UNCONFIGURED_BALANCING_PARAMETERS.includes("tankStorageCapacityLitres"));
});

test("2. Adequate daily supply passes its individual requirement", () => {
  // 100 L/day supply, 80 L/day demand
  const res = evaluateDailyWaterSupply(100, 80);

  assert.equal(res.ok, true);
  assert.equal(res.status, "pass");
  assert.equal(res.supplyAdequate, true);
  assert.equal(res.dailySupplyLitres, 100);
  assert.equal(res.dailyDemandLitres, 80);
  assert.equal(res.shortfallLitres, 0);
  assert.equal(res.surplusLitres, 20);
  assert.equal(res.unit, "litres per day");
  assert.equal(res.errors.length, 0);
  assert.equal(res.warnings.length, 0);
});

test("3. Insufficient supply reports the correct shortfall", () => {
  // 100 L/day supply, 125 L/day demand -> shortfall = 25 L/day
  const res = evaluateDailyWaterSupply(100, 125);

  assert.equal(res.ok, true);
  assert.equal(res.status, "fail");
  assert.equal(res.supplyAdequate, false);
  assert.equal(res.shortfallLitres, 25);
  assert.equal(res.surplusLitres, -25);
  assert.ok(res.warnings.some((w) => w.code === "SUPPLY_INSUFFICIENT" && w.message.includes("25 L/day")));
});

test("4. Exact daily-demand thresholds are handled correctly", () => {
  // Exactly 100 L/day supply and 100 L/day demand
  const res = evaluateDailyWaterSupply(100, 100);

  assert.equal(res.ok, true);
  assert.equal(res.status, "pass");
  assert.equal(res.supplyAdequate, true);
  assert.equal(res.shortfallLitres, 0);
  assert.equal(res.surplusLitres, 0);
  assert.equal(res.warnings.length, 0);
});

test("5. Adequate stored reserve passes its individual requirement", () => {
  // 15 L stored, 10 L minimum required
  const res = evaluateStoredWaterReserve(15, 10);

  assert.equal(res.ok, true);
  assert.equal(res.status, "pass");
  assert.equal(res.reserveAdequate, true);
  assert.equal(res.availableReserveLitres, 15);
  assert.equal(res.minimumReserveLitres, 10);
  assert.equal(res.shortfallLitres, 0);
  assert.equal(res.surplusLitres, 5);
  assert.equal(res.unit, "litres");
  assert.equal(res.errors.length, 0);
  assert.equal(res.warnings.length, 0);
});

test("6. Insufficient reserve reports the correct shortfall", () => {
  // 6 L stored, 10 L minimum required -> shortfall = 4 L
  const res = evaluateStoredWaterReserve(6, 10);

  assert.equal(res.ok, true);
  assert.equal(res.status, "fail");
  assert.equal(res.reserveAdequate, false);
  assert.equal(res.shortfallLitres, 4);
  assert.equal(res.surplusLitres, -4);
  assert.ok(res.warnings.some((w) => w.code === "RESERVE_INSUFFICIENT" && w.message.includes("4 L")));
});

test("7. Exact reserve thresholds are handled correctly", () => {
  // Exactly 10 L stored, 10 L minimum required
  const res = evaluateStoredWaterReserve(10, 10);

  assert.equal(res.ok, true);
  assert.equal(res.status, "pass");
  assert.equal(res.reserveAdequate, true);
  assert.equal(res.shortfallLitres, 0);
  assert.equal(res.surplusLitres, 0);
  assert.equal(res.warnings.length, 0);
});

test("8. Daily litres and stored litres are not confused", () => {
  // Scenario A: Daily flow is adequate (100 >= 80), but stored volume is insufficient (4 < 10)
  const balanceA = evaluateWaterBalance({
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 4,
    minimumReserveLitres: 10,
  });

  assert.equal(balanceA.supplyAdequate, true);
  assert.equal(balanceA.reserveAdequate, false);
  assert.equal(balanceA.supplyShortfallLitres, 0);
  assert.equal(balanceA.reserveShortfallLitres, 6);
  assert.equal(balanceA.overallStatus, "fail");

  // Scenario B: Stored volume is adequate (20 >= 10), but daily flow is insufficient (100 < 120)
  const balanceB = evaluateWaterBalance({
    dailySupplyLitres: 100,
    dailyDemandLitres: 120,
    availableReserveLitres: 20,
    minimumReserveLitres: 10,
  });

  assert.equal(balanceB.supplyAdequate, false);
  assert.equal(balanceB.reserveAdequate, true);
  assert.equal(balanceB.supplyShortfallLitres, 20);
  assert.equal(balanceB.reserveShortfallLitres, 0);
  assert.equal(balanceB.overallStatus, "fail");

  // Scenario C: Both adequate
  const balanceC = evaluateWaterBalance({
    dailySupplyLitres: 100,
    dailyDemandLitres: 75,
    availableReserveLitres: 15,
    minimumReserveLitres: 10,
  });

  assert.equal(balanceC.supplyAdequate, true);
  assert.equal(balanceC.reserveAdequate, true);
  assert.equal(balanceC.overallStatus, "pass");
});

test("9. Unknown or unconfigured values do not produce a false success", () => {
  // Calling with no inputs
  const balanceEmpty = evaluateWaterBalance({});

  assert.equal(balanceEmpty.ok, true);
  assert.equal(balanceEmpty.dailySupplyLitres, null);
  assert.equal(balanceEmpty.dailyDemandLitres, null);
  assert.equal(balanceEmpty.availableReserveLitres, null);
  assert.equal(balanceEmpty.supplyAdequate, null);
  assert.equal(balanceEmpty.reserveAdequate, null);
  // Must NOT produce "pass"!
  assert.equal(balanceEmpty.overallStatus, "unknown");
  assert.ok(balanceEmpty.unconfiguredParameters.includes("dailySupplyLitres"));
  assert.ok(balanceEmpty.unconfiguredParameters.includes("dailyDemandLitres"));
  assert.ok(balanceEmpty.unconfiguredParameters.includes("availableReserveLitres"));
  assert.ok(balanceEmpty.warnings.some((w) => w.code === "SUPPLY_UNKNOWN"));
  assert.ok(balanceEmpty.warnings.some((w) => w.code === "DEMAND_UNKNOWN"));
  assert.ok(balanceEmpty.warnings.some((w) => w.code === "RESERVE_UNKNOWN"));

  // Providing a doc alone without explicit balancing inputs also does not claim pass
  const doc = makeDoc([
    createObject("well", { id: "w1" }),
    createObject("tank", { id: "t1" }),
    createObject("house", { id: "h1" }),
  ]);
  const balanceDoc = evaluateWaterBalance({ doc });
  assert.equal(balanceDoc.overallStatus, "unknown");
  assert.equal(balanceDoc.dailySupplyLitres, null);
  assert.equal(balanceDoc.supplyAdequate, null);
  assert.equal(balanceDoc.reserveAdequate, null);
});

test("10. Negative, missing, malformed, and non-finite values are handled safely", () => {
  // Negative values
  const resNegative = evaluateWaterBalance({
    dailySupplyLitres: -50,
    dailyDemandLitres: -20,
    availableReserveLitres: -10,
  });
  assert.equal(resNegative.ok, false);
  assert.equal(resNegative.overallStatus, "error");
  assert.ok(resNegative.errors.some((e) => e.code === "NEGATIVE_VALUE_NOT_ALLOWED" && e.field === "dailySupplyLitres"));
  assert.ok(resNegative.errors.some((e) => e.code === "NEGATIVE_VALUE_NOT_ALLOWED" && e.field === "dailyDemandLitres"));
  assert.ok(resNegative.errors.some((e) => e.code === "NEGATIVE_VALUE_NOT_ALLOWED" && e.field === "availableReserveLitres"));

  // Non-finite values
  const resNonFinite = evaluateWaterBalance({
    dailyDemandLitres: NaN,
    availableReserveLitres: Infinity,
    dailySupplyLitres: "lots",
  });
  assert.equal(resNonFinite.ok, false);
  assert.equal(resNonFinite.overallStatus, "error");
  assert.ok(resNonFinite.errors.some((e) => e.code === "INVALID_NUMERIC_INPUT"));

  // Individual evaluation functions also handle bad values safely
  const supplyBad = evaluateDailyWaterSupply("bad", -5);
  assert.equal(supplyBad.ok, false);
  assert.equal(supplyBad.status, "error");

  const reserveBad = evaluateStoredWaterReserve(-1, "unknown");
  assert.equal(reserveBad.ok, false);
  assert.equal(reserveBad.status, "error");
});

test("11. Repeated evaluations are deterministic", () => {
  const inputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 65,
    availableReserveLitres: 12,
    minimumReserveLitres: 10,
    storedCapacityLitres: 50,
  };

  const res1 = evaluateWaterBalance(inputs);
  const res2 = evaluateWaterBalance(inputs);

  assert.deepEqual(res1, res2);
});

test("12. Inputs remain unchanged", () => {
  const inputs = {
    dailySupplyLitres: 100,
    dailyDemandLitres: 85,
    availableReserveLitres: 14,
    minimumReserveLitres: 10,
  };

  Object.freeze(inputs);

  const initialJson = JSON.stringify(inputs);
  const res = evaluateWaterBalance(inputs);

  assert.equal(res.ok, true);
  assert.equal(JSON.stringify(inputs), initialJson);
});

test("13. Water-reserve results are independent of graph connectivity", () => {
  // Connected village
  const connectedDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);
  const netConnected = evaluateWaterNetwork(connectedDoc);
  assert.equal(netConnected.ok, true);

  // Disconnected village
  const disconnectedDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 900, y: 900, width: 100, height: 100 }),
  ]);
  const netDisconnected = evaluateWaterNetwork(disconnectedDoc);
  assert.equal(netDisconnected.ok, false);

  // Both evaluated with the same planning inputs yield identical water balance summaries
  const plan = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: 12 };
  const balanceConnected = evaluateWaterBalance({ ...plan, doc: connectedDoc });
  const balanceDisconnected = evaluateWaterBalance({ ...plan, doc: disconnectedDoc });

  assert.deepEqual(balanceConnected, balanceDisconnected);
  assert.equal(balanceConnected.overallStatus, "pass");
});

test("14. Existing Test Village, household connectivity, budget calculations, serialization, and player-save isolation remain intact", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
    createObject("house", { id: "h1", x: 144, y: 84, width: 110, height: 100 }),
  ]);

  // Schema validation
  assert.equal(validateProject(doc).ok, true);

  // Serialization round-trip
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);

  // Connectivity trial
  const trial = runVillageTrial(doc);
  assert.equal(trial.status, "pass");
  assert.ok(trial.households);

  // Budget calculation
  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.ok, true);
  assert.equal(budget.withinBudget, true);

  // Water reserve evaluation
  const balance = evaluateWaterBalance({ dailySupplyLitres: 100, dailyDemandLitres: 90, availableReserveLitres: 10 });
  assert.equal(balance.ok, true);
  assert.equal(balance.overallStatus, "pass");

  // Player-save isolation across all World Builder engine modules
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /localStorage/, `${rel} touches localStorage`);
  }
});

test("15. Planned daily supply defaults remain unknown and separate from the mission threshold", () => {
  // 1. Blank/null/undefined supply returns unknown and does not fallback to 100
  const supplyBlank = evaluateDailyWaterSupply(null, 80);
  assert.equal(supplyBlank.ok, true);
  assert.equal(supplyBlank.status, "unknown");
  assert.equal(supplyBlank.supplyAdequate, null);
  assert.equal(supplyBlank.dailySupplyLitres, null);
  assert.equal(supplyBlank.dailyDemandLitres, 80);
  assert.ok(supplyBlank.warnings.some((w) => w.code === "SUPPLY_UNKNOWN"));

  const supplyUndefined = evaluateDailyWaterSupply(undefined, 80);
  assert.equal(supplyUndefined.status, "unknown");
  assert.equal(supplyUndefined.supplyAdequate, null);
  assert.equal(supplyUndefined.dailySupplyLitres, null);

  // 2. Entering a valid supply value allows evaluation
  const supplyPass = evaluateDailyWaterSupply(100, 80);
  assert.equal(supplyPass.status, "pass");
  assert.equal(supplyPass.supplyAdequate, true);
  assert.equal(supplyPass.dailySupplyLitres, 100);
  assert.equal(supplyPass.dailyDemandLitres, 80);
  assert.equal(supplyPass.shortfallLitres, 0);
  assert.equal(supplyPass.surplusLitres, 20);

  const supplyFail = evaluateDailyWaterSupply(70, 80);
  assert.equal(supplyFail.status, "fail");
  assert.equal(supplyFail.supplyAdequate, false);
  assert.equal(supplyFail.dailySupplyLitres, 70);
  assert.equal(supplyFail.shortfallLitres, 10);

  // 3. The mission threshold (100 L/day) remains separate from planned supply in evaluateWaterBalance
  const balanceBlank = evaluateWaterBalance({ dailyDemandLitres: 80, availableReserveLitres: 15 });
  assert.equal(balanceBlank.dailyRequirementLitres, 100, "Mission requirement remains 100 L/day");
  assert.equal(balanceBlank.dailySupplyLitres, null, "Planned daily supply is null when omitted");
  assert.equal(balanceBlank.supplyAdequate, null, "Adequacy cannot be claimed without planned supply");
  assert.equal(balanceBlank.overallStatus, "unknown");
  assert.ok(balanceBlank.unconfiguredParameters.includes("dailySupplyLitres"));

  const balanceCustomSupply = evaluateWaterBalance({
    dailySupplyLitres: 150,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(balanceCustomSupply.dailyRequirementLitres, 100, "Mission requirement is still 100 L/day");
  assert.equal(balanceCustomSupply.dailySupplyLitres, 150, "Planned supply is 150 L/day");
  assert.equal(balanceCustomSupply.supplyAdequate, true);
  assert.equal(balanceCustomSupply.overallStatus, "pass");
});
