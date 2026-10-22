import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONSTRUCTION_COSTS,
  SUPPORTED_CONSTRUCTION_TYPES,
  getConstructionBudgetLimit,
  getObjectConstructionCost,
  isSupportedConstructionType,
  calculateTotalConstructionCost,
  evaluateConstructionBudget,
} from "../engine/constructionBudget.js";

import {
  createProject,
  createObject,
  validateProject,
} from "../../engine/schema.js";

import {
  serializeProject,
  deserializeProject,
} from "../../storage/serialization.js";

import { PROJECT_OBJECT_TYPES } from "../../engine/constants.js";
import { OBJECT_TYPES, getPaletteObjectTypes } from "../../engine/objectTypes.js";
import { evaluateWaterNetwork } from "../engine/waterNetwork.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";
import { evaluateMissionReadiness } from "../engine/missionReadiness.js";
import { evaluateMissionCompletion } from "../engine/missionCompletion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Construction Budget Test",
    objects,
  });
}

test("1. Empty village has zero construction cost", () => {
  const doc = makeDoc([]);
  const cost = calculateTotalConstructionCost(doc);
  assert.equal(cost, 0);

  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.ok, true);
  assert.equal(budget.budgetLimit, 100);
  assert.equal(budget.totalCost, 0);
  assert.equal(budget.remainingBudget, 100);
  assert.equal(budget.withinBudget, true);
  assert.equal(budget.overBudget, false);
  assert.equal(budget.objectCount, 0);
  assert.equal(budget.unsupportedObjects.length, 0);
  assert.equal(budget.errors.length, 0);

  for (const type of SUPPORTED_CONSTRUCTION_TYPES) {
    assert.equal(budget.breakdown[type].count, 0);
    assert.equal(budget.breakdown[type].subtotal, 0);
    assert.equal(budget.breakdown[type].unitCost, CONSTRUCTION_COSTS[type]);
  }
});

test("2. Each supported object type has the correct unit cost", () => {
  const expectedCosts = {
    house: 7,
    tree: 2,
    farm: 8,
    well: 18,
    tank: 12,
    pipe: 4,
    road: 3,
  };

  assert.deepEqual(CONSTRUCTION_COSTS, expectedCosts);
  assert.deepEqual([...SUPPORTED_CONSTRUCTION_TYPES].sort(), Object.keys(expectedCosts).sort());
  assert.deepEqual([...SUPPORTED_CONSTRUCTION_TYPES].sort(), [...PROJECT_OBJECT_TYPES["world-builder"]].sort());

  for (const [type, expectedCost] of Object.entries(expectedCosts)) {
    assert.equal(getObjectConstructionCost(type), expectedCost, `Unit cost for type string "${type}"`);
    const obj = createObject(type, { id: `test_${type}` });
    assert.equal(getObjectConstructionCost(obj), expectedCost, `Unit cost for object of type "${type}"`);
    assert.equal(isSupportedConstructionType(type), true);
  }

  // A document with exactly one of each supported type
  const oneOfEach = Object.keys(expectedCosts).map((type, idx) =>
    createObject(type, { id: `obj_${idx}`, x: 50 + idx * 50, y: 100 })
  );
  const doc = makeDoc(oneOfEach);
  const sumExpected = 7 + 2 + 8 + 18 + 12 + 4 + 3; // 54

  assert.equal(calculateTotalConstructionCost(doc), sumExpected);
  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.totalCost, sumExpected);
  assert.equal(budget.remainingBudget, 100 - sumExpected);
  assert.equal(budget.withinBudget, true);
  assert.equal(budget.overBudget, false);
  assert.equal(budget.objectCount, 7);
});

test("3. Multiple houses and pipes aggregate correctly", () => {
  const houses = [
    createObject("house", { id: "h1" }),
    createObject("house", { id: "h2" }),
    createObject("house", { id: "h3" }),
    createObject("house", { id: "h4" }),
  ];
  const pipes = [
    createObject("pipe", { id: "p1" }),
    createObject("pipe", { id: "p2" }),
    createObject("pipe", { id: "p3" }),
    createObject("pipe", { id: "p4" }),
    createObject("pipe", { id: "p5" }),
  ];

  const doc = makeDoc([...houses, ...pipes]);
  const budget = evaluateConstructionBudget(doc);

  // 4 houses @ 7 = 28; 5 pipes @ 4 = 20; Total = 48
  assert.equal(budget.totalCost, 48);
  assert.equal(budget.remainingBudget, 52);
  assert.equal(budget.breakdown.house.count, 4);
  assert.equal(budget.breakdown.house.subtotal, 28);
  assert.equal(budget.breakdown.pipe.count, 5);
  assert.equal(budget.breakdown.pipe.subtotal, 20);
  assert.equal(budget.objectCount, 9);
});

test("4. Total cost and remaining balance are correct", () => {
  // 1 well (18) + 1 tank (12) + 1 farm (8) + 2 pipes (8) = 46
  const doc = makeDoc([
    createObject("well", { id: "w1" }),
    createObject("tank", { id: "t1" }),
    createObject("farm", { id: "f1" }),
    createObject("pipe", { id: "p1" }),
    createObject("pipe", { id: "p2" }),
  ]);

  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.totalCost, 46);
  assert.equal(budget.budgetLimit, 100);
  assert.equal(budget.remainingBudget, 54);
  assert.equal(budget.withinBudget, true);
  assert.equal(budget.overBudget, false);
});

test("5. Exactly 100 coins is within budget", () => {
  // 2 wells (2 * 18 = 36) + 3 farms (3 * 8 = 24) + 10 pipes (10 * 4 = 40) = 100
  const objects = [
    createObject("well", { id: "w1" }),
    createObject("well", { id: "w2" }),
    createObject("farm", { id: "f1" }),
    createObject("farm", { id: "f2" }),
    createObject("farm", { id: "f3" }),
    ...Array.from({ length: 10 }, (_, i) => createObject("pipe", { id: `p${i}` })),
  ];

  const doc = makeDoc(objects);
  const budget = evaluateConstructionBudget(doc);

  assert.equal(budget.totalCost, 100);
  assert.equal(budget.remainingBudget, 0);
  assert.equal(budget.withinBudget, true);
  assert.equal(budget.overBudget, false);
});

test("6. A design costing more than 100 coins is over budget", () => {
  // 6 wells (6 * 18 = 108)
  const wells = Array.from({ length: 6 }, (_, i) => createObject("well", { id: `w${i}` }));
  const doc = makeDoc(wells);

  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.totalCost, 108);
  assert.equal(budget.withinBudget, false);
  assert.equal(budget.overBudget, true);
  assert.ok(budget.warnings.some((w) => w.code === "BUDGET_EXCEEDED"));
});

test("7. Negative remaining budget is reported correctly", () => {
  // 6 wells = 108 coins -> remaining = 100 - 108 = -8
  const wells = Array.from({ length: 6 }, (_, i) => createObject("well", { id: `w${i}` }));
  const doc = makeDoc(wells);

  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.remainingBudget, -8);

  // Custom limit: 50 budget, 60 cost -> -10
  const doc50 = makeDoc([
    createObject("well", { id: "w1" }), // 18
    createObject("well", { id: "w2" }), // 18
    createObject("tank", { id: "t1" }), // 12
    createObject("tank", { id: "t2" }), // 12
    // total = 60
  ]);
  const budget50 = evaluateConstructionBudget(doc50, { budgetLimit: 50 });
  assert.equal(budget50.totalCost, 60);
  assert.equal(budget50.budgetLimit, 50);
  assert.equal(budget50.remainingBudget, -10);
  assert.equal(budget50.withinBudget, false);
  assert.equal(budget50.overBudget, true);
});

test("8. Breakdown quantities and subtotals are deterministic", () => {
  const doc = makeDoc([
    createObject("house", { id: "h1" }),
    createObject("house", { id: "h2" }),
    createObject("tree", { id: "t1" }),
    createObject("road", { id: "r1" }),
    createObject("road", { id: "r2" }),
    createObject("road", { id: "r3" }),
  ]);

  const budget = evaluateConstructionBudget(doc);
  // house: 2 * 7 = 14
  // tree: 1 * 2 = 2
  // road: 3 * 3 = 9
  // total = 25
  assert.equal(budget.totalCost, 25);
  assert.equal(budget.breakdown.house.count, 2);
  assert.equal(budget.breakdown.house.subtotal, 14);
  assert.equal(budget.breakdown.tree.count, 1);
  assert.equal(budget.breakdown.tree.subtotal, 2);
  assert.equal(budget.breakdown.road.count, 3);
  assert.equal(budget.breakdown.road.subtotal, 9);
  assert.equal(budget.breakdown.farm.count, 0);
  assert.equal(budget.breakdown.farm.subtotal, 0);
  assert.equal(budget.breakdown.well.count, 0);
  assert.equal(budget.breakdown.well.subtotal, 0);
  assert.equal(budget.breakdown.tank.count, 0);
  assert.equal(budget.breakdown.tank.subtotal, 0);
  assert.equal(budget.breakdown.pipe.count, 0);
  assert.equal(budget.breakdown.pipe.subtotal, 0);

  // Sum of subtotals in breakdown matches totalCost
  const breakdownSum = Object.values(budget.breakdown).reduce((acc, item) => acc + item.subtotal, 0);
  assert.equal(breakdownSum, budget.totalCost);

  // Items array matches breakdown exactly
  const itemsSum = budget.items.reduce((acc, item) => acc + item.subtotal, 0);
  assert.equal(itemsSum, budget.totalCost);
});

test("9. Reordering objects produces an equivalent summary", () => {
  const obj1 = createObject("well", { id: "w1" });
  const obj2 = createObject("tank", { id: "t1" });
  const obj3 = createObject("farm", { id: "f1" });
  const obj4 = createObject("pipe", { id: "p1" });
  const obj5 = createObject("house", { id: "h1" });
  const obj6 = createObject("tree", { id: "tr1" });
  const obj7 = createObject("road", { id: "rd1" });

  const docForward = makeDoc([obj1, obj2, obj3, obj4, obj5, obj6, obj7]);
  const docReverse = makeDoc([obj7, obj6, obj5, obj4, obj3, obj2, obj1]);
  const docMixed = makeDoc([obj4, obj1, obj7, obj3, obj5, obj2, obj6]);

  const summaryFwd = evaluateConstructionBudget(docForward);
  const summaryRev = evaluateConstructionBudget(docReverse);
  const summaryMixed = evaluateConstructionBudget(docMixed);

  assert.deepEqual(summaryFwd, summaryRev);
  assert.deepEqual(summaryFwd, summaryMixed);
});

test("10. Unsupported object types and malformed documents are handled safely", () => {
  // Null and malformed docs
  assert.equal(calculateTotalConstructionCost(null), 0);
  assert.equal(calculateTotalConstructionCost(undefined), 0);
  assert.equal(calculateTotalConstructionCost({}), 0);

  const budgetNull = evaluateConstructionBudget(null);
  assert.equal(budgetNull.ok, false);
  assert.equal(budgetNull.totalCost, 0);
  assert.ok(budgetNull.errors.some((e) => e.code === "INVALID_DOCUMENT"));

  const budgetNoObjects = evaluateConstructionBudget({ title: "Bad doc" });
  assert.equal(budgetNoObjects.ok, false);
  assert.ok(budgetNoObjects.errors.some((e) => e.code === "INVALID_OBJECTS_ARRAY"));

  // Doc with non-object entries in objects array
  const docCorruptObjects = {
    objects: [null, "bad-string", 42, undefined, createObject("house", { id: "h1" })],
  };
  const budgetCorrupt = evaluateConstructionBudget(docCorruptObjects);
  assert.equal(budgetCorrupt.totalCost, 7);
  assert.equal(budgetCorrupt.objectCount, 1);
  assert.ok(budgetCorrupt.warnings.some((w) => w.code === "MALFORMED_OBJECT"));

  // Doc with sandbox shapes or unrecognized types
  const docUnsupported = {
    objects: [
      { id: "gear_1", type: "gear", x: 100, y: 100 },
      { id: "rect_1", type: "rectangle", x: 100, y: 100 },
      { id: "circle_1", type: "circle", x: 100, y: 100 },
      { id: "alien_1", type: "ufo", x: 100, y: 100 },
      createObject("house", { id: "h1" }), // 7
      createObject("pipe", { id: "p1" }),  // 4
    ],
  };

  const budgetUnsupported = evaluateConstructionBudget(docUnsupported);
  // Supported objects still costed: 7 + 4 = 11
  assert.equal(budgetUnsupported.totalCost, 11);
  assert.equal(budgetUnsupported.objectCount, 2);
  assert.equal(budgetUnsupported.unsupportedObjects.length, 4);
  assert.deepEqual(
    budgetUnsupported.unsupportedObjects.map((u) => u.type).sort(),
    ["circle", "gear", "rectangle", "ufo"]
  );

  // Unsupported objects have 0 unit cost
  assert.equal(getObjectConstructionCost("gear"), 0);
  assert.equal(getObjectConstructionCost("rectangle"), 0);
  assert.equal(getObjectConstructionCost("ufo"), 0);
  assert.equal(isSupportedConstructionType("gear"), false);
});

test("11. Budget evaluation does not mutate document data", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109 });
  const house = createObject("house", { id: "h1", x: 300, y: 200 });

  const doc = makeDoc([well, pipe, farm, house]);

  // Deep freeze doc before evaluation
  Object.freeze(well);
  Object.freeze(pipe);
  Object.freeze(farm);
  Object.freeze(house);
  Object.freeze(doc.objects);
  Object.freeze(doc.canvas);
  Object.freeze(doc);

  const initialJson = JSON.stringify(doc);

  const cost = calculateTotalConstructionCost(doc);
  const budget = evaluateConstructionBudget(doc);

  assert.equal(cost, 18 + 4 + 8 + 7);
  assert.equal(budget.totalCost, 37);
  assert.equal(JSON.stringify(doc), initialJson);
});

test("12. Budget results are independent of well-to-farm connectivity", () => {
  // Layout A: Well -> pipe -> farm (fully connected, water network passes)
  // Well output at (100, 109), Pipe left at (100, 109) & right at (200, 109), Farm at (250, 109)
  const connectedDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);

  const waterNetConnected = evaluateWaterNetwork(connectedDoc);
  assert.equal(waterNetConnected.ok, true);
  assert.equal(waterNetConnected.reachesFarm, true);

  const budgetConnected = evaluateConstructionBudget(connectedDoc);
  // Cost: well 18 + pipe 4 + farm 8 = 30
  assert.equal(budgetConnected.totalCost, 30);
  assert.equal(budgetConnected.withinBudget, true);

  // Layout B: Same objects but completely scattered / disconnected
  const disconnectedDoc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 900, y: 900, width: 100, height: 100 }),
  ]);

  const waterNetDisconnected = evaluateWaterNetwork(disconnectedDoc);
  assert.equal(waterNetDisconnected.ok, false);
  assert.equal(waterNetDisconnected.reachesFarm, false);

  const budgetDisconnected = evaluateConstructionBudget(disconnectedDoc);
  // Cost: still well 18 + pipe 4 + farm 8 = 30
  assert.equal(budgetDisconnected.totalCost, 30);
  assert.equal(budgetDisconnected.withinBudget, true);
  assert.equal(budgetDisconnected.remainingBudget, 70);

  // Layout C: Connected route that is over budget
  // 1 well (18) + 1 farm (8) + 20 pipes (80) + 1 tank (12) = 118 coins (> 100)
  const overBudgetObjects = [
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
    createObject("tank", { id: "t1", x: 800, y: 800, width: 80, height: 100 }),
    ...Array.from({ length: 19 }, (_, i) => createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 200 + i * 10 })),
  ];
  const overBudgetDoc = makeDoc(overBudgetObjects);
  const waterNetOver = evaluateWaterNetwork(overBudgetDoc);
  assert.equal(waterNetOver.ok, true); // Water connectivity passes

  const budgetOver = evaluateConstructionBudget(overBudgetDoc);
  assert.equal(budgetOver.totalCost, 118);
  assert.equal(budgetOver.withinBudget, false);
  assert.equal(budgetOver.overBudget, true);
  assert.equal(budgetOver.remainingBudget, -18);
});

test("13. The evaluator does not read or modify player coin balances", () => {
  const budgetSrc = readFileSync(resolve(studioRoot, "world-builder/engine/constructionBudget.js"), "utf-8");

  // Verify complete isolation from player progression and save APIs
  assert.doesNotMatch(budgetSrc, /skillverse_save/, "Touches skillverse_save");
  assert.doesNotMatch(budgetSrc, /usePlayer|updatePlayer|features\/player/, "Touches player progression");
  assert.doesNotMatch(budgetSrc, /localStorage/, "Touches localStorage");
  assert.doesNotMatch(budgetSrc, /wallet|transaction|purchase/, "Contains wallet/transaction mechanisms");

  // Verify budget source is MISSION.resources.budget
  assert.match(budgetSrc, /MISSION.*resources.*budget/);
});

test("14. Existing schema, serialization, Test Village, household connectivity, and player-save isolation remain intact", () => {
  // All 7 World Builder object types in one document
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100 }),
    createObject("pipe", { id: "p1", x: 150, y: 109 }),
    createObject("farm", { id: "f1", x: 250, y: 109 }),
    createObject("house", { id: "h1", x: 300, y: 200 }),
    createObject("tank", { id: "t1", x: 400, y: 200 }),
    createObject("tree", { id: "tr1", x: 500, y: 200 }),
    createObject("road", { id: "rd1", x: 600, y: 200 }),
  ]);

  // Schema validation
  const valid = validateProject(doc);
  assert.equal(valid.ok, true);

  // Serialization roundtrip
  const serialized = serializeProject(doc);
  assert.equal(serialized.ok, true);
  const deserialized = deserializeProject(serialized.text);
  assert.equal(deserialized.ok, true);
  assert.equal(deserialized.project.objects.length, 7);

  // Water trial remains functional
  const trial = runVillageTrial(doc);
  assert.equal(trial.status, "pass");
  assert.ok(trial.households);

  // Budget on deserialized document matches
  const budget = evaluateConstructionBudget(deserialized.project);
  assert.equal(budget.ok, true);
  assert.equal(budget.totalCost, 54);
  assert.equal(budget.withinBudget, true);

  // All World Builder engine files respect player-save isolation
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
  }
});

test("15. Final object registry and budget consistency check (D3.6C.1)", () => {
  // 1. Exactly seven World Builder types appear in the intended order
  const intendedTypes = ["house", "tree", "farm", "well", "tank", "pipe", "road"];
  assert.deepEqual(PROJECT_OBJECT_TYPES["world-builder"], intendedTypes);
  assert.deepEqual(getPaletteObjectTypes("world-builder"), intendedTypes);
  assert.equal(PROJECT_OBJECT_TYPES["world-builder"].length, 7);

  // 2. The road object remains supported end-to-end
  assert.equal(isSupportedConstructionType("road"), true);
  assert.equal(getObjectConstructionCost("road"), 3);
  assert.ok(OBJECT_TYPES.road);
  assert.equal(OBJECT_TYPES.road.label, "Road");
  const roadObj = createObject("road", { id: "rd_test" });
  assert.equal(roadObj.type, "road");
  assert.equal(getObjectConstructionCost(roadObj), 3);

  // 3. No unsupported crop-field type is accidentally introduced
  assert.equal(isSupportedConstructionType("crop-field"), false);
  assert.equal(isSupportedConstructionType("crop_field"), false);
  assert.equal(isSupportedConstructionType("cropField"), false);
  assert.equal(getObjectConstructionCost("crop-field"), 0);
  assert.equal(Object.prototype.hasOwnProperty.call(OBJECT_TYPES, "crop-field"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(OBJECT_TYPES, "crop_field"), false);
  assert.equal(PROJECT_OBJECT_TYPES["world-builder"].includes("crop-field"), false);

  // 4. Each object's cost agrees with the authoritative budget model
  const expectedCosts = {
    house: 7,
    tree: 2,
    farm: 8,
    well: 18,
    tank: 12,
    pipe: 4,
    road: 3,
  };
  assert.deepEqual(CONSTRUCTION_COSTS, expectedCosts);

  // 5. A known village design has the exact same total in budget model, readiness, and completion
  // Baseline village: 1 well (18) + 1 farm (8) + 4 houses (28) + 4 pipes (16) + 1 tank (12) + 2 roads (6) + 1 tree (2) = 90
  const villageObjects = [
    createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 }),
    createObject("farm", { id: "f1", x: 350, y: 209, width: 100, height: 100 }),
    createObject("house", { id: "h1", x: 144, y: 184, width: 110, height: 100 }),
    createObject("house", { id: "h2", x: 244, y: 184, width: 110, height: 100 }),
    createObject("house", { id: "h3", x: 344, y: 300, width: 110, height: 100 }),
    createObject("house", { id: "h4", x: 344, y: 68, width: 110, height: 100 }),
    createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 }),
    createObject("pipe", { id: "p2", x: 250, y: 209, width: 100, height: 30 }),
    createObject("pipe", { id: "p3", x: 300, y: 267, width: 116, height: 30, rotation: 90 }),
    createObject("pipe", { id: "p4", x: 300, y: 151, width: 116, height: 30, rotation: 90 }),
    createObject("tank", { id: "t1", x: 450, y: 200 }),
    createObject("road", { id: "r1", x: 500, y: 300 }),
    createObject("road", { id: "r2", x: 620, y: 300 }),
    createObject("tree", { id: "tr1", x: 550, y: 150 }),
  ];
  const doc = makeDoc(villageObjects);
  const totalCost = calculateTotalConstructionCost(doc);
  assert.equal(totalCost, 90);

  const budget = evaluateConstructionBudget(doc);
  assert.equal(budget.totalCost, 90);
  assert.equal(budget.remainingBudget, 10);
  assert.equal(budget.withinBudget, true);

  const readiness = evaluateMissionReadiness(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(readiness.requirements.budget.actual, 90);
  assert.equal(readiness.requirements.budget.target, 100);
  assert.equal(readiness.requirements.budget.status, "pass");

  const completion = evaluateMissionCompletion(doc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(completion.requirements.budget.actual, 90);
  assert.equal(completion.requirements.budget.target, 100);
  assert.equal(completion.requirements.budget.status, "pass");

  // 6. Sandbox remains unchanged with exactly the original 6 types
  assert.deepEqual(PROJECT_OBJECT_TYPES.sandbox, ["rectangle", "circle", "triangle", "tree", "house", "gear"]);
  assert.equal(PROJECT_OBJECT_TYPES.sandbox.includes("road"), false);
  assert.equal(PROJECT_OBJECT_TYPES.sandbox.includes("well"), false);
  assert.equal(PROJECT_OBJECT_TYPES.sandbox.includes("tank"), false);
  assert.equal(PROJECT_OBJECT_TYPES.sandbox.includes("pipe"), false);
  assert.equal(PROJECT_OBJECT_TYPES.sandbox.includes("farm"), false);
});

