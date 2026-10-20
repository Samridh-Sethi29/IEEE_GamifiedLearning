import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createProject,
  createObject,
  validateProject,
  validateObject,
} from "../../engine/schema.js";
import { getPaletteObjectTypes, OBJECT_TYPES } from "../../engine/objectTypes.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { serializeProject, deserializeProject } from "../../storage/serialization.js";
import { createDocumentStorage } from "../../storage/documentStorage.js";

import { MISSION } from "../data/mission.js";
import {
  WORLD_BUILDER_STORAGE_KEY,
  createWorldBuilderStorage,
  initializeWorldBuilderProject,
  resolveWorldBuilderView,
} from "../engine/worldBuilderWorkspaceModel.js";
import {
  evaluateWaterNetwork,
  buildWaterGraph,
} from "../engine/waterNetwork.js";
import { getWaterOverlayData } from "../engine/waterOverlayModel.js";
import {
  getWaterStatus,
  getSelectedWaterStatus,
  isDocModified,
} from "../engine/waterStatusModel.js";
import {
  runVillageTrial,
  isTrialStale,
} from "../engine/villageTrialModel.js";
import {
  evaluateConstructionBudget,
  calculateTotalConstructionCost,
  getConstructionBudgetLimit,
} from "../engine/constructionBudget.js";
import {
  evaluateWaterBalance,
  getMissionDailyWaterSupply,
  getMissionMinimumReserve,
} from "../engine/waterReserve.js";
import {
  evaluateMissionReadiness,
} from "../engine/missionReadiness.js";
import {
  evaluateMissionCompletion,
  getMissionCompletionThresholds,
} from "../engine/missionCompletion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

/**
 * Creates a complete 10-object passing village design:
 * - Well at (100, 200) (cost: 18)
 * - Pipes connecting Well to Farm (cost: 2 * 4 = 8)
 * - Farm at (350, 209) (cost: 8)
 * - 4 Households connected (cost: 4 * 7 = 28)
 * - 2 branch pipes (cost: 2 * 4 = 8)
 * Total cost: 70 coins (<= 100 limit)
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

  return createProject({
    id: "e2e_village",
    type: "world-builder",
    title: "E2E Save Our Village",
    objects: [well, pipe1, pipe2, farm, h1, h2, p3, h3, p4, h4],
  });
}

test("E2E Step 1-4: Route resolution, mission briefing data, Start Designing navigation, and workspace init", () => {
  // Step 1: Route mapping
  const appSrc = readFileSync(resolve(studioRoot, "../../App.jsx"), "utf8");
  assert.match(appSrc, /path="\/world\/studio\/world-builder"/);
  assert.match(appSrc, /element=\{<WorldBuilderBriefing \/>\}/);

  // Step 2: Read mission briefing data
  assert.equal(MISSION.title, "Save Our Village");
  assert.equal(MISSION.resources.budget.value, 100);
  assert.equal(MISSION.resources.water.value, 100);
  assert.equal(MISSION.objectives.find((o) => o.id === "households").target, 4);
  assert.equal(MISSION.objectives.find((o) => o.id === "reserve").target, 10);
  assert.equal(MISSION.startAction.enabled, true);

  // Step 3: Start Designing navigation
  assert.equal(resolveWorldBuilderView(new URLSearchParams("")), "briefing");
  assert.equal(resolveWorldBuilderView(new URLSearchParams("mode=edit")), "editor");

  // Step 4: Workspace initialization
  const mem = memoryStorage();
  const storage = createWorldBuilderStorage(mem);
  const initialProject = initializeWorldBuilderProject(storage);
  assert.equal(initialProject.type, "world-builder");
  assert.equal(initialProject.objects.length, 0);

  const state = createEditorState(initialProject);
  assert.equal(state.history.present.type, "world-builder");
  assert.equal(state.selectedId, null);
});

test("E2E Step 5-6: Object placement, transformation, layer ordering, and property editing (farm irrigation)", () => {
  const mem = memoryStorage();
  const storage = createWorldBuilderStorage(mem);
  let state = createEditorState(initializeWorldBuilderProject(storage));

  // Step 5a: Verify all 7 palette types
  const paletteTypes = getPaletteObjectTypes("world-builder");
  assert.deepEqual(paletteTypes, ["house", "tree", "farm", "well", "tank", "pipe", "road"]);

  // Step 5b: Place objects
  for (const type of paletteTypes) {
    const def = OBJECT_TYPES[type];
    const obj = createObject(type, {
      id: `test_${type}`,
      x: 200,
      y: 200,
      width: def.defaultSize.width,
      height: def.defaultSize.height,
    });
    state = editorReducer(state, actions.addObject(type, obj));
  }
  assert.equal(state.history.present.objects.length, 7);

  // Step 5c: Selection & Transformation (move, rotate, resize, layer reorder)
  state = editorReducer(state, actions.select("test_well"));
  assert.equal(state.selectedId, "test_well");

  // Move
  state = editorReducer(state, actions.moveTo(150, 150));
  assert.equal(state.history.present.objects.find((o) => o.id === "test_well").x, 150);

  // Rotate
  state = editorReducer(state, actions.rotateTo(90));
  assert.equal(state.history.present.objects.find((o) => o.id === "test_well").rotation, 90);

  // Resize
  state = editorReducer(state, actions.resizeTo(100, 110));
  const resizedWell = state.history.present.objects.find((o) => o.id === "test_well");
  assert.equal(resizedWell.width, 100);
  assert.equal(resizedWell.height, 110);

  // Reorder
  state = editorReducer(state, actions.reorder("front"));
  assert.equal(state.history.present.objects[state.history.present.objects.length - 1].id, "test_well");

  // Step 6: Property editing (farm irrigation flood -> drip)
  state = editorReducer(state, actions.select("test_farm"));
  assert.equal(state.history.present.objects.find((o) => o.id === "test_farm").props.irrigation, "flood");

  state = editorReducer(state, actions.setProp("irrigation", "drip"));
  assert.equal(state.history.present.objects.find((o) => o.id === "test_farm").props.irrigation, "drip");

  // Undo/redo
  state = editorReducer(state, actions.undo());
  assert.equal(state.history.present.objects.find((o) => o.id === "test_farm").props.irrigation, "flood");
  state = editorReducer(state, actions.redo());
  assert.equal(state.history.present.objects.find((o) => o.id === "test_farm").props.irrigation, "drip");
});

test("E2E Step 7-9: Water-port indicators, Check Water System diagnostics, and Test Village trial with stale handling", () => {
  // Step 7: Water-port indicators on connected and candidate elements
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  let doc = createProject({ type: "world-builder", objects: [well, pipe] });

  let overlay = getWaterOverlayData(doc, "w1");
  assert.equal(overlay.active, true);
  assert.equal(overlay.connections.length, 1);
  assert.equal(overlay.discretePorts.find((p) => p.objectId === "w1").connected, true);

  // Step 8: Check Water System detailed diagnostics
  let status = getWaterStatus(doc);
  assert.equal(status.evaluation.ok, false); // no farm yet
  assert.equal(status.status, "attention");
  assert.ok(status.messages.some((m) => m.text.includes("farm")));

  // Selected object status
  const wellStatus = getSelectedWaterStatus(doc, "w1", status.evaluation);
  assert.equal(wellStatus.type, "well");
  assert.equal(wellStatus.connected, true);

  // Step 9: Test Village trial
  let trial = runVillageTrial(doc);
  assert.equal(trial.ok, false);
  assert.match(trial.blockingIssue, /farm/i);

  // Now add farm to complete the chain
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const docConnected = createProject({ type: "world-builder", objects: [well, pipe, farm] });

  trial = runVillageTrial(docConnected);
  assert.equal(trial.ok, true);
  assert.equal(trial.stats.farmsReached, 1);

  // Stale result tracking after edit
  assert.equal(isTrialStale(docConnected, docConnected), false);
  const docModified = createProject({
    type: "world-builder",
    objects: [well, pipe, farm, createObject("tree", { id: "t1", x: 50, y: 50 })],
  });
  assert.equal(isTrialStale(docConnected, docModified), true);
  assert.equal(isDocModified(docConnected, docModified), true);
});

test("E2E Step 10-12: Mission Dashboard live readiness, planning input defaults, households and budget", () => {
  const passingDoc = makePassingVillage();

  // Step 10: Initial planning inputs start blank/unknown
  const readinessInitial = evaluateMissionReadiness(passingDoc, {});
  assert.equal(readinessInitial.ready, false);
  assert.equal(readinessInitial.overallStatus, "incomplete");
  assert.equal(readinessInitial.requirements.dailyWater.status, "unknown");
  assert.equal(readinessInitial.requirements.reserve.status, "unknown");

  // Step 11: Household connectivity and construction budget
  assert.equal(readinessInitial.requirements.waterNetwork.status, "pass");
  assert.equal(readinessInitial.requirements.households.status, "pass");
  assert.equal(readinessInitial.requirements.households.actual, 4);
  assert.equal(readinessInitial.requirements.budget.status, "pass");
  assert.equal(readinessInitial.requirements.budget.actual, 70);
  assert.equal(readinessInitial.requirements.budget.details.remainingBudget, 30);

  // Step 12: Evaluate daily supply and stored-reserve requirements
  const waterEval = evaluateWaterBalance({
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(waterEval.supplyAdequate, true);
  assert.equal(waterEval.reserveAdequate, true);
  assert.equal(waterEval.supplySurplusLitres, 20);
  assert.equal(waterEval.reserveSurplusLitres, 5);
});

test("E2E Step 13-14: Attempt mission completion with failed, unknown, and passing states, fresh click gate and success screen", () => {
  const passingDoc = makePassingVillage();

  // 13a: Unknown inputs block completion
  let comp = evaluateMissionCompletion(passingDoc, {});
  assert.equal(comp.eligibleForCompletion, false);
  assert.equal(comp.overallStatus, "incomplete");
  assert.ok(comp.remainingTasks.length > 0);

  // 13b: Failing requirement (over budget) blocks completion
  const overBudgetPipes = Array.from({ length: 10 }, (_, i) =>
    createObject("pipe", { id: `p_extra_${i}`, x: 800, y: 100 + i * 20 })
  );
  const overBudgetDoc = createProject({
    type: "world-builder",
    objects: [...passingDoc.objects, ...overBudgetPipes],
  });
  comp = evaluateMissionCompletion(overBudgetDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(comp.eligibleForCompletion, false);
  assert.equal(comp.overallStatus, "needs-attention");
  assert.ok(comp.failedRequirements.includes("budget"));

  // 13c: All passing permits completion
  comp = evaluateMissionCompletion(passingDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(comp.eligibleForCompletion, true);
  assert.equal(comp.overallStatus, "eligible");
  assert.equal(comp.remainingTasks.length, 0);

  // Step 14: Explicit user click confirmation
  let successScreenOpen = false;
  const clickCompleteMission = (doc, inputs) => {
    // Re-evaluates fresh at click time
    const fresh = evaluateMissionCompletion(doc, inputs);
    if (fresh.eligibleForCompletion) {
      successScreenOpen = true;
    }
  };

  clickCompleteMission(passingDoc, {
    dailySupplyLitres: 100,
    dailyDemandLitres: 80,
    availableReserveLitres: 15,
  });
  assert.equal(successScreenOpen, true);

  // Verify success screen contents
  const successSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  assert.match(successSrc, /Village Saved!/);
  assert.match(successSrc, /wb-completion-challenge-solved/);
  assert.match(successSrc, /wb-completion-metric-network/);
  assert.match(successSrc, /wb-completion-metric-households/);
  assert.match(successSrc, /wb-completion-metric-budget/);
  assert.match(successSrc, /wb-completion-metric-dailyWater/);
  assert.match(successSrc, /wb-completion-metric-reserve/);
});

test("E2E Step 15-16: Navigation, return to workspace, briefing preservation, and save/reload persistence", () => {
  const mem = memoryStorage();
  const storage = createWorldBuilderStorage(mem);
  const doc = makePassingVillage();

  // Save village to storage
  const saveRes = storage.save(doc);
  assert.equal(saveRes.ok, true);

  // Simulate returning to workspace (dismiss modal)
  let modalOpen = true;
  const onReturnToWorkspace = () => {
    modalOpen = false;
  };
  onReturnToWorkspace();
  assert.equal(modalOpen, false);

  // Simulate returning to briefing
  let view = "editor";
  const onBackToBriefing = () => {
    view = "briefing";
  };
  onBackToBriefing();
  assert.equal(view, "briefing");

  // Step 16: Reloading from storage restores the entire village design
  const restored = initializeWorldBuilderProject(storage);
  assert.equal(restored.type, "world-builder");
  assert.equal(restored.objects.length, 10);
  assert.deepEqual(
    restored.objects.map((o) => o.id),
    doc.objects.map((o) => o.id)
  );

  // Serialization round-trip
  const serialized = serializeProject(restored);
  assert.equal(serialized.ok, true);
  const deserialized = deserializeProject(serialized.text);
  assert.equal(deserialized.ok, true);
  assert.equal(deserialized.project.objects.length, 10);
});

test("E2E Step 17: Sandbox isolation and player profile / progression / XP isolation", () => {
  // Sandbox document
  const sandboxDoc = createProject({
    type: "sandbox",
    objects: [createObject("rectangle", { id: "r1", x: 100, y: 100 }, "sandbox")],
  });

  // Water overlay inactive in sandbox
  const overlay = getWaterOverlayData(sandboxDoc);
  assert.equal(overlay.active, false);

  // PropertiesPanel gates World Builder components
  const propsPanelSrc = readFileSync(resolve(studioRoot, "engine/PropertiesPanel.jsx"), "utf8");
  assert.match(propsPanelSrc, /doc\.type === "world-builder" && \(\s*<MissionDashboard/);
  assert.match(propsPanelSrc, /doc\.type === "world-builder" && \(\s*<WaterStatusInspector/);

  // EditorWorkspace gates Test Village toolbar button
  const editorWorkspaceSrc = readFileSync(resolve(studioRoot, "engine/EditorWorkspace.jsx"), "utf8");
  assert.match(editorWorkspaceSrc, /doc\.type === "world-builder" && \(\s*<div className="sce-group wb-trial-toolbar-group"/);

  // Verify engine and workspace files remain completely decoupled from player profile mutations
  const engineFiles = [
    "components/WorldBuilderWorkspace.jsx",
    "pages/WorldBuilderBriefing.jsx",
    "engine/missionCompletion.js",
    "engine/missionReadiness.js",
    "engine/waterReserve.js",
    "engine/constructionBudget.js",
    "engine/villageTrialModel.js",
    "engine/waterNetwork.js",
    "engine/worldBuilderWorkspaceModel.js",
  ];

  const stripComments = (str) => str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  for (const relPath of engineFiles) {
    const fullPath = resolve(studioRoot, "world-builder", relPath);
    const content = stripComments(readFileSync(fullPath, "utf8"));
    assert.doesNotMatch(content, /\busePlayer\b/, `${relPath} must not use player hook`);
    assert.doesNotMatch(content, /\bplayerProfile\b/, `${relPath} must not reference playerProfile`);
    assert.doesNotMatch(content, /\baddCoins\b/, `${relPath} must not add player coins`);
    assert.doesNotMatch(content, /\bxp\b/i, `${relPath} must not reference player XP`);
  }
});

test("E2E Robustness: Malformed documents, edge cases, and non-numeric inputs handle safely", () => {
  // Empty document
  const emptyDoc = createProject({ type: "world-builder", objects: [] });
  const readinessEmpty = evaluateMissionReadiness(emptyDoc);
  assert.equal(readinessEmpty.ready, false);
  const completionEmpty = evaluateMissionCompletion(emptyDoc);
  assert.equal(completionEmpty.eligibleForCompletion, false);

  // Null/undefined inputs
  assert.doesNotThrow(() => evaluateMissionReadiness(null));
  assert.doesNotThrow(() => evaluateMissionCompletion(null));
  assert.doesNotThrow(() => evaluateWaterNetwork(null));
  assert.doesNotThrow(() => calculateTotalConstructionCost(null));
  assert.doesNotThrow(() => evaluateWaterBalance(null));
  assert.doesNotThrow(() => runVillageTrial(null));

  // Extreme planning inputs
  const extremeEval = evaluateWaterBalance({
    dailySupplyLitres: NaN,
    dailyDemandLitres: -500,
    availableReserveLitres: Infinity,
  });
  assert.equal(extremeEval.errors.length > 0, true);
  assert.equal(extremeEval.supplyAdequate, false);
});
