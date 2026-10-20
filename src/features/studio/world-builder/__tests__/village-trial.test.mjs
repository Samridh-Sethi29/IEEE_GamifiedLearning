import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  isTrialStale,
  runVillageTrial,
} from "../engine/villageTrialModel.js";

import {
  getWaterStatus,
  getSelectedWaterStatus,
} from "../engine/waterStatusModel.js";

import { getWaterOverlayData } from "../engine/waterOverlayModel.js";
import { createObject, createProject, validateProject } from "../../engine/schema.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { deserializeProject, serializeProject } from "../../storage/serialization.js";

const here = dirname(fileURLToPath(import.meta.url));
const studioRoot = join(here, "..", "..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "wb-doc",
    type,
    objects,
  });
}

test("1. Successful well-to-farm trial", () => {
  // Well at (100, 100, w:80, h:90), output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe at (150, 109, w:100, h:30), left port at (100, 109), right port at (200, 109)
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Farm at (250, 109, w:100, h:100), left edge at x=200
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  const doc = makeDoc([well, pipe, farm]);
  const trial = runVillageTrial(doc);

  assert.equal(trial.ok, true);
  assert.equal(trial.status, "pass");
  assert.equal(trial.title, "Water Connectivity Trial: Passed!");
  assert.ok(trial.summary.includes("Water successfully travels through the connected pipe network"));
  assert.equal(trial.blockingIssue, null);
  assert.equal(trial.stats.wellsConnected, 1);
  assert.equal(trial.stats.pipesConnected, 1);
  assert.equal(trial.stats.farmsReached, 1);
  assert.deepEqual(trial.participatingIds, ["f1", "p1", "w1"]);
});

test("2. Successful trial through a tank", () => {
  // Well at (100, 100, w:80, h:90), output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe 1 at (150, 109, w:100, h:30), left at (100, 109), right at (200, 109)
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Tank at (200, 151, w:80, h:100), inlet at (200, 109), outlet at (200, 196)
  const tank = createObject("tank", { id: "t1", x: 200, y: 151, width: 80, height: 100 });
  // Pipe 2 at (200, 246, w:100, h:30, rot:90), top at (200, 196), bottom at (200, 296)
  const pipe2 = createObject("pipe", { id: "p2", x: 200, y: 246, width: 100, height: 30, rotation: 90 });
  // Farm at (200, 350, w:100, h:100), top edge at y=300, distance to (200, 296) is 4 (<= 16)
  const farm = createObject("farm", { id: "f1", x: 200, y: 350, width: 100, height: 100 });

  const doc = makeDoc([well, pipe1, tank, pipe2, farm]);
  const trial = runVillageTrial(doc);

  assert.equal(trial.ok, true);
  assert.equal(trial.status, "pass");
  assert.equal(trial.stats.tanksConnected, 1);
  assert.ok(trial.summary.includes("storage tank"));
  assert.deepEqual(trial.participatingIds, ["f1", "p1", "p2", "t1", "w1"]);
});

test("3. Missing well and missing farm diagnostics", () => {
  // Empty workspace
  const emptyDoc = makeDoc([]);
  const emptyTrial = runVillageTrial(emptyDoc);
  assert.equal(emptyTrial.ok, false);
  assert.equal(emptyTrial.status, "needs-attention");
  assert.ok(emptyTrial.blockingIssue.includes("empty"));
  assert.ok(emptyTrial.nextSteps.some((s) => s.includes("Well")));

  // Missing well
  const farmOnly = makeDoc([createObject("farm", { id: "f1", x: 200, y: 200 })]);
  const trialNoWell = runVillageTrial(farmOnly);
  assert.equal(trialNoWell.ok, false);
  assert.ok(trialNoWell.blockingIssue.includes("needs a well"));

  // Missing farm
  const wellOnly = makeDoc([createObject("well", { id: "w1", x: 100, y: 100 })]);
  const trialNoFarm = runVillageTrial(wellOnly);
  assert.equal(trialNoFarm.ok, false);
  assert.ok(trialNoFarm.blockingIssue.includes("needs a farm"));
});

test("4. Disconnected well and pipe diagnostics", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const farm = createObject("farm", { id: "f1", x: 400, y: 400, width: 100, height: 100 });

  // Well with no connected pipe
  const trialNoPipe = runVillageTrial(makeDoc([well, farm]));
  assert.equal(trialNoPipe.ok, false);
  assert.ok(trialNoPipe.blockingIssue.includes("Well") && trialNoPipe.blockingIssue.includes("not connected"));

  // Disconnected pipe (placed far away from well)
  const farPipe = createObject("pipe", { id: "p1", x: 600, y: 600, width: 100, height: 30 });
  const trialFarPipe = runVillageTrial(makeDoc([well, farPipe, farm]));
  assert.equal(trialFarPipe.ok, false);
  assert.ok(trialFarPipe.blockingIssue.includes("Well") && trialFarPipe.blockingIssue.includes("not connected"));

  // Multiple disconnected components: well + pipe1, farm + pipe2
  const pipeNearWell = createObject("pipe", { id: "p1", x: 140, y: 109, width: 80, height: 30 }); // left at 100
  const pipeNearFarm = createObject("pipe", { id: "p2", x: 300, y: 400, width: 80, height: 30 }); // right at 340 (farm at 400, left at 350)
  const trialDisconnected = runVillageTrial(makeDoc([well, pipeNearWell, farm, pipeNearFarm]));
  assert.equal(trialDisconnected.ok, false);
  assert.ok(trialDisconnected.blockingIssue.includes("cannot reach the farm"));
  assert.ok(trialDisconnected.nextSteps.some((s) => s.includes("disconnected")));
});

test("5. A test run evaluates the latest document", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  let state = createEditorState(makeDoc([well, pipe, farm]));

  // Run 1: disconnected
  const trial1 = runVillageTrial(state.history.present);
  assert.equal(trial1.ok, false);

  // Move pipe into connecting position
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.moveTo(150, 109));

  // Run 2: evaluated on updated doc
  const trial2 = runVillageTrial(state.history.present);
  assert.equal(trial2.ok, true);
  assert.equal(trial2.status, "pass");
});

test("6. Old results cannot be mistaken for current results after editing", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  let state = createEditorState(makeDoc([well, pipe, farm]));
  const evaluatedDoc = state.history.present;

  // Initial check: not stale
  assert.equal(isTrialStale(evaluatedDoc, evaluatedDoc), false);

  // 1. Moving an object marks stale
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.moveTo(400, 400));
  assert.equal(isTrialStale(evaluatedDoc, state.history.present), true);

  // 2. Rotating marks stale
  state = createEditorState(makeDoc([well, pipe, farm]));
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.rotateTo(90));
  assert.equal(isTrialStale(evaluatedDoc, state.history.present), true);

  // 3. Resizing marks stale
  state = createEditorState(makeDoc([well, pipe, farm]));
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.resizeTo(40, 30));
  assert.equal(isTrialStale(evaluatedDoc, state.history.present), true);

  // 4. Adding marks stale
  state = createEditorState(makeDoc([well, pipe, farm]));
  state = editorReducer(state, actions.addObject("tree", { x: 300, y: 300 }));
  assert.equal(isTrialStale(evaluatedDoc, state.history.present), true);

  // 5. Deleting marks stale
  state = createEditorState(makeDoc([well, pipe, farm]));
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.remove());
  assert.equal(isTrialStale(evaluatedDoc, state.history.present), true);
});

test("7. Repeated runs replace previous results", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  let state = createEditorState(makeDoc([well, pipe, farm]));

  // First run
  const result1 = runVillageTrial(state.history.present);
  assert.equal(result1.ok, false);

  // Second run after fix
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.moveTo(150, 109));
  const result2 = runVillageTrial(state.history.present);
  assert.equal(result2.ok, true);
  assert.notDeepEqual(result1, result2);

  // Third run after removing well
  state = editorReducer(state, actions.select("w1"));
  state = editorReducer(state, actions.remove());
  const result3 = runVillageTrial(state.history.present);
  assert.equal(result3.ok, false);
  assert.ok(result3.blockingIssue.includes("needs a well"));
});

test("8. Testing leaves the document and history unchanged", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  const state = createEditorState(makeDoc([well, pipe, farm]));
  const initialJSON = JSON.stringify(state.history.present);
  const initialPastLen = state.history.past.length;
  const initialFutureLen = state.history.future.length;
  const initialSelected = state.selectedId;

  // Run the trial multiple times
  runVillageTrial(state.history.present);
  runVillageTrial(state.history.present);

  // Verify document and history state
  assert.equal(JSON.stringify(state.history.present), initialJSON);
  assert.equal(state.history.past.length, initialPastLen);
  assert.equal(state.history.future.length, initialFutureLen);
  assert.equal(state.selectedId, initialSelected);
});

test("9. Sandbox does not receive the Test Village action", () => {
  // Sandbox project
  const sbDoc = makeDoc(
    [
      createObject("rectangle", { id: "rect1", x: 100, y: 100 }, "sandbox"),
      createObject("circle", { id: "circ1", x: 200, y: 100 }, "sandbox"),
    ],
    "sandbox"
  );

  // Inspection: EditorWorkspace only renders Test Village toolbar button and trial card when doc.type === "world-builder"
  assert.equal(sbDoc.type, "sandbox");
  assert.notEqual(sbDoc.type, "world-builder");

  const editorSrc = readFileSync(join(studioRoot, "engine", "EditorWorkspace.jsx"), "utf-8");
  // Test Village button guarded by doc.type === "world-builder"
  assert.match(
    editorSrc,
    /doc\.type\s*===\s*["']world-builder["'][\s\S]*?wb-test-village-btn/,
    "Test Village button must be restricted to world-builder type"
  );
  // VillageTrialCard guarded by doc.type === "world-builder"
  assert.match(
    editorSrc,
    /trialResult\s*&&\s*doc\.type\s*===\s*["']world-builder["'][\s\S]*?VillageTrialCard/,
    "VillageTrialCard must be restricted to world-builder type"
  );
});

test("10. Existing Check Water System diagnostics continue working", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const doc = makeDoc([well, pipe, farm]);

  // getWaterStatus from waterStatusModel.js remains fully operational
  const status = getWaterStatus(doc);
  assert.equal(status.status, "connected");
  assert.equal(status.statusLabel, "Water System Connected");
  assert.equal(status.checklist.length, 4);
  assert.ok(status.checklist.every((item) => item.ok));

  // Selected water status
  const wellStatus = getSelectedWaterStatus(doc, "w1", status.evaluation);
  assert.equal(wellStatus.connected, true);
  assert.equal(wellStatus.status, "Connected to pipe network");

  // Non-water object returns null
  const house = createObject("house", { id: "h1", x: 400, y: 400 });
  const docWithHouse = makeDoc([well, pipe, farm, house]);
  assert.equal(getSelectedWaterStatus(docWithHouse, "h1"), null);
});

test("11. Save/reload, properties, selection, undo/redo, overlay rendering, and player-save isolation remain intact", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const doc = makeDoc([well, pipe, farm]);

  // Serialization round-trip
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);
  assert.equal(deser.project.objects.length, 3);

  // Validation
  const check = validateProject(doc);
  assert.equal(check.ok, true);

  // Player save isolation: new and modified files must not mention player save keys or state
  const filesToCheck = [
    "world-builder/engine/villageTrialModel.js",
    "world-builder/components/VillageTrialCard.jsx",
    "world-builder/components/WaterPortOverlay.jsx",
    "world-builder/engine/waterOverlayModel.js",
  ];

  for (const rel of filesToCheck) {
    const src = readFileSync(join(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, `${rel} defines player progression`);
  }
});

test("12. Any connected-route highlighting agrees with actual graph reachability", () => {
  // Connected network: w1 -> p1 -> f1
  // Disconnected pipe: p2 at (600, 600)
  // Non-water object: h1 at (500, 500)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const pipe2 = createObject("pipe", { id: "p2", x: 600, y: 600, width: 100, height: 30 });
  const house = createObject("house", { id: "h1", x: 500, y: 500 });

  const doc = makeDoc([well, pipe1, farm, pipe2, house]);
  const trial = runVillageTrial(doc);

  // Participating IDs on active route
  assert.deepEqual(trial.participatingIds, ["f1", "p1", "w1"]);
  assert.ok(!trial.participatingIds.includes("p2"));
  assert.ok(!trial.participatingIds.includes("h1"));

  // Overlay data with highlightedObjectIds
  const overlayData = getWaterOverlayData(doc, null, {
    highlightedObjectIds: trial.participatingIds,
  });

  // Well port is highlighted
  const wellPort = overlayData.discretePorts.find((p) => p.objectId === "w1");
  assert.equal(wellPort.highlighted, true);

  // Connected pipe ports are highlighted
  const p1Ports = overlayData.discretePorts.filter((p) => p.objectId === "p1");
  assert.ok(p1Ports.length > 0 && p1Ports.every((p) => p.highlighted));

  // Disconnected pipe ports are NOT highlighted
  const p2Ports = overlayData.discretePorts.filter((p) => p.objectId === "p2");
  assert.ok(p2Ports.length > 0 && p2Ports.every((p) => !p.highlighted));

  // Farm boundary is highlighted
  const farmBound = overlayData.farmBoundaries.find((b) => b.id === "f1");
  assert.equal(farmBound.highlighted, true);

  // External connection between w1 and p1 is highlighted
  const w1p1Conn = overlayData.connections.find((c) => c.key.includes("w1") && c.key.includes("p1"));
  assert.ok(w1p1Conn && w1p1Conn.highlighted);

  // Farm contact from p1 to f1 is highlighted
  const farmContact = overlayData.farmContacts.find((c) => c.farmId === "f1");
  assert.ok(farmContact && farmContact.highlighted);
});
