import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  getSelectedWaterStatus,
  getWaterStatus,
  getWaterStatusChecklist,
  getWaterStatusMessages,
  isDocModified,
} from "../engine/waterStatusModel.js";

import {
  buildWaterGraph,
  evaluateWaterNetwork,
  getWaterPorts,
} from "../engine/waterNetwork.js";

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

test("1. Successful well-to-farm connectivity displays a success result", () => {
  // Well at (100, 100, w:80, h:90), output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe at (150, 109, w:100), endA at (100, 109), endB at (200, 109)
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Farm at (250, 109, w:100, h:100), left edge at x=200 touches pipe endB
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  const doc = makeDoc([well, pipe, farm]);
  const status = getWaterStatus(doc);

  assert.equal(status.status, "connected");
  assert.equal(status.statusLabel, "Water System Connected");
  assert.equal(status.summaryText, "Water can reach your farm!");

  const successMsg = status.messages.find((m) => m.text === "Water can reach your farm!");
  assert.ok(successMsg, "Should include child-friendly success message");
  assert.equal(successMsg.kind, "success");

  // Checklist verification
  const sourceItem = status.checklist.find((c) => c.id === "source");
  const wellItem = status.checklist.find((c) => c.id === "well_connection");
  const pipeItem = status.checklist.find((c) => c.id === "pipes");
  const farmItem = status.checklist.find((c) => c.id === "farm_delivery");

  assert.equal(sourceItem.ok, true);
  assert.equal(wellItem.ok, true);
  assert.equal(pipeItem.ok, true);
  assert.equal(farmItem.ok, true);
});

test("2. Missing well displays the correct diagnostic", () => {
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const doc = makeDoc([pipe, farm]);

  const status = getWaterStatus(doc);
  assert.equal(status.status, "attention");
  assert.equal(status.statusLabel, "Needs Attention");

  const missingWellMsg = status.messages.find((m) => m.text === "Place a well to provide water.");
  assert.ok(missingWellMsg, "Should show 'Place a well to provide water.'");
  assert.equal(missingWellMsg.kind, "error");

  const sourceItem = status.checklist.find((c) => c.id === "source");
  assert.equal(sourceItem.ok, false);
});

test("3. Missing farm displays the correct diagnostic", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const doc = makeDoc([well, pipe]);

  const status = getWaterStatus(doc);
  assert.equal(status.status, "attention");

  const missingFarmMsg = status.messages.find((m) => m.text === "Place a farm to receive water.");
  assert.ok(missingFarmMsg, "Should show 'Place a farm to receive water.'");
  assert.equal(missingFarmMsg.kind, "error");

  const farmItem = status.checklist.find((c) => c.id === "farm_delivery");
  assert.equal(farmItem.ok, false);
});

test("4. A disconnected well and disconnected pipe display appropriate diagnostics", () => {
  // Well at (100, 100) far from pipe
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe at (500, 500) isolated
  const pipe = createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 });
  // Farm at (300, 300) unreached
  const farm = createObject("farm", { id: "f1", x: 300, y: 300, width: 100, height: 100 });
  const doc = makeDoc([well, pipe, farm]);

  const status = getWaterStatus(doc);
  assert.equal(status.status, "attention");

  const msgTexts = status.messages.map((m) => m.text);
  assert.ok(msgTexts.includes("Connect a pipe to the well."), "Shows well disconnected warning");
  assert.ok(msgTexts.includes("Some pipes are not connected to the water system."), "Shows pipe disconnected warning");
  assert.ok(msgTexts.includes("Your farm is not receiving water yet."), "Shows farm unreachable warning");
});

test("5. A reachable tank and farm receive accurate status", () => {
  // Well output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe1 from (100, 109) to (200, 109)
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Tank inlet at (200, 109), outlet at (200, 196) (tank center at 200, 151, height: 100)
  const tank = createObject("tank", { id: "t1", x: 200, y: 151, width: 80, height: 100 });
  // Pipe2 from (200, 196) to (300, 196)
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 196, width: 100, height: 30 });
  // Farm at (350, 196, w:100, h:100), left perimeter at x=300
  const farm = createObject("farm", { id: "f1", x: 350, y: 196, width: 100, height: 100 });

  const doc = makeDoc([well, pipe1, tank, pipe2, farm]);
  const status = getWaterStatus(doc);

  assert.equal(status.status, "connected");
  assert.equal(status.evaluation.summary.tanksConnected, 1);
  assert.equal(status.evaluation.summary.farmsReached, 1);

  // Selected tank status
  const tankStatus = getSelectedWaterStatus(doc, "t1", status.evaluation);
  assert.ok(tankStatus);
  assert.equal(tankStatus.connected, true);
  assert.equal(tankStatus.status, "Connected to water system");

  // Selected farm status
  const farmStatus = getSelectedWaterStatus(doc, "f1", status.evaluation);
  assert.ok(farmStatus);
  assert.equal(farmStatus.connected, true);
  assert.equal(farmStatus.status, "Receiving water from well");
});

test("6. Selected-object status agrees with graph reachability", () => {
  // Connected components: w1 -> p1
  const w1 = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const p1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });

  // Disconnected components
  const w2 = createObject("well", { id: "w2", x: 600, y: 100, width: 80, height: 90 });
  const p2 = createObject("pipe", { id: "p2", x: 600, y: 300, width: 100, height: 30 });
  const t2 = createObject("tank", { id: "t2", x: 600, y: 500, width: 80, height: 100 });
  const f2 = createObject("farm", { id: "f2", x: 600, y: 700, width: 100, height: 100 });

  const doc = makeDoc([w1, p1, w2, p2, t2, f2]);
  const status = getWaterStatus(doc);

  // Connected well
  const w1Status = getSelectedWaterStatus(doc, "w1", status.evaluation);
  assert.equal(w1Status.connected, true);
  assert.equal(w1Status.status, "Connected to pipe network");

  // Disconnected well
  const w2Status = getSelectedWaterStatus(doc, "w2", status.evaluation);
  assert.equal(w2Status.connected, false);
  assert.equal(w2Status.status, "Not connected to any pipe");

  // Connected pipe
  const p1Status = getSelectedWaterStatus(doc, "p1", status.evaluation);
  assert.equal(p1Status.connected, true);
  assert.equal(p1Status.status, "Connected to water system");

  // Disconnected pipe
  const p2Status = getSelectedWaterStatus(doc, "p2", status.evaluation);
  assert.equal(p2Status.connected, false);
  assert.equal(p2Status.status, "Not connected to water source");

  // Disconnected tank
  const t2Status = getSelectedWaterStatus(doc, "t2", status.evaluation);
  assert.equal(t2Status.connected, false);
  assert.equal(t2Status.status, "Not connected to water source");

  // Unreached farm
  const f2Status = getSelectedWaterStatus(doc, "f2", status.evaluation);
  assert.equal(f2Status.connected, false);
  assert.equal(f2Status.status, "Not receiving water");
});

test("7. Unsupported object types do not receive water-system statuses", () => {
  const house = createObject("house", { id: "h1", x: 100, y: 100 });
  const tree = createObject("tree", { id: "tr1", x: 200, y: 100 });
  const road = createObject("road", { id: "rd1", x: 300, y: 100 });
  const doc = makeDoc([house, tree, road]);

  assert.equal(getSelectedWaterStatus(doc, "h1"), null);
  assert.equal(getSelectedWaterStatus(doc, "tr1"), null);
  assert.equal(getSelectedWaterStatus(doc, "rd1"), null);
  assert.equal(getSelectedWaterStatus(doc, "non-existent"), null);
  assert.equal(getSelectedWaterStatus(doc, null), null);

  // Sandbox objects
  const sbDoc = makeDoc(
    [
      createObject("rectangle", { id: "rect1", x: 100, y: 100 }, "sandbox"),
      createObject("circle", { id: "circ1", x: 200, y: 100 }, "sandbox"),
    ],
    "sandbox"
  );
  assert.equal(getSelectedWaterStatus(sbDoc, "rect1"), null);
  assert.equal(getSelectedWaterStatus(sbDoc, "circ1"), null);
});

test("8. Rechecking after a document edit does not display stale results", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe initially far away at (500, 500)
  const pipe = createObject("pipe", { id: "p1", x: 500, y: 500, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  let state = createEditorState(makeDoc([well, pipe, farm]));
  const doc0 = state.history.present;

  // Unmodified comparison returns false
  assert.equal(isDocModified(doc0, doc0), false);

  // Check 1: pipe is disconnected
  const status1 = getWaterStatus(doc0);
  assert.equal(status1.status, "attention");
  assert.ok(status1.messages.some((m) => m.text === "Connect a pipe to the well."));

  // 1. Moving: move pipe into connecting position at (150, 109)
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.moveTo(150, 109));
  const docMoved = state.history.present;
  assert.equal(isDocModified(doc0, docMoved), true);

  // Fresh check after moving
  const statusMoved = getWaterStatus(docMoved);
  assert.equal(statusMoved.status, "connected");
  assert.equal(statusMoved.summaryText, "Water can reach your farm!");

  // 2. Rotating: rotate connected pipe away by 90 degrees
  state = editorReducer(state, actions.rotateTo(90));
  const docRotated = state.history.present;
  assert.equal(isDocModified(docMoved, docRotated), true);

  // Fresh check after rotating
  const statusRotated = getWaterStatus(docRotated);
  assert.equal(statusRotated.status, "attention");

  // Rotate back to 0
  state = editorReducer(state, actions.rotateTo(0));
  const docRestored = state.history.present;
  assert.equal(getWaterStatus(docRestored).status, "connected");

  // 3. Resizing: resize pipe to be too short to bridge well and farm (minSize: 40)
  state = editorReducer(state, actions.resizeTo(40, 30));
  const docResized = state.history.present;
  assert.equal(isDocModified(docRestored, docResized), true);

  // Fresh check after resizing
  const statusResized = getWaterStatus(docResized);
  assert.equal(statusResized.status, "attention");

  // Resize back to 100
  state = editorReducer(state, actions.resizeTo(100, 30));
  const docResizedBack = state.history.present;
  assert.equal(getWaterStatus(docResizedBack).status, "connected");

  // 4. Adding: add a new disconnected pipe
  state = editorReducer(state, actions.addObject("pipe", { id: "p2", x: 400, y: 400 }));
  const docAdded = state.history.present;
  assert.equal(isDocModified(docResizedBack, docAdded), true);

  // Fresh check after adding
  const statusAdded = getWaterStatus(docAdded);
  assert.ok(statusAdded.evaluation.summary.disconnectedPipeIds.includes("p2"));

  // 5. Deleting: select and delete p2
  state = editorReducer(state, actions.select("p2"));
  state = editorReducer(state, actions.remove());
  const docDeleted = state.history.present;
  assert.equal(isDocModified(docAdded, docDeleted), true);

  // Fresh check after deleting
  const statusDeleted = getWaterStatus(docDeleted);
  assert.equal(statusDeleted.status, "connected");
  assert.equal(statusDeleted.evaluation.summary.disconnectedPipeIds.length, 0);
});

test("9. Checking the network does not mutate the document or its history", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("tank", { id: "t1", x: 300, y: 200, width: 80, height: 100 }),
    createObject("farm", { id: "f1", x: 450, y: 200, width: 120, height: 90 }),
    createObject("house", { id: "h1", x: 100, y: 300 }),
    createObject("tree", { id: "tr1", x: 200, y: 300 }),
    createObject("road", { id: "rd1", x: 300, y: 300 }),
  ]);

  const state = createEditorState(doc);
  const docSnapshotBefore = JSON.stringify(doc);
  const stateSnapshotBefore = JSON.stringify(state);

  const status = getWaterStatus(doc);
  const selectedWell = getSelectedWaterStatus(doc, "w1", status.evaluation);
  const selectedPipe = getSelectedWaterStatus(doc, "p1", status.evaluation);
  const selectedHouse = getSelectedWaterStatus(doc, "h1", status.evaluation);

  assert.equal(JSON.stringify(doc), docSnapshotBefore, "Document data must not be mutated");
  assert.equal(JSON.stringify(state), stateSnapshotBefore, "Editor state and history must not be mutated");
});

test("10. The action is limited to World Builder and does not alter Sandbox behavior", () => {
  // PropertiesPanel renders WaterStatusInspector only when doc.type === 'world-builder'
  const propsPanelSrc = readFileSync(join(studioRoot, "engine", "PropertiesPanel.jsx"), "utf8");
  assert.match(
    propsPanelSrc,
    /doc\.type\s*===\s*"world-builder"\s*&&\s*\(?\s*<WaterStatusInspector\s+doc=\{doc\}\s+selected=\{selected\}\s*\/>/
  );

  // Sandbox project creates and validates with only sandbox shapes
  const sbDoc = makeDoc(
    [
      createObject("rectangle", { id: "rect1", x: 100, y: 100 }, "sandbox"),
      createObject("circle", { id: "circ1", x: 200, y: 100 }, "sandbox"),
    ],
    "sandbox"
  );
  assert.equal(validateProject(sbDoc).ok, true);

  // Inspector component returns null for non-water objects
  for (const obj of sbDoc.objects) {
    assert.equal(getSelectedWaterStatus(sbDoc, obj.id), null);
  }
});

test("11. Existing overlay, property editing, undo/redo, serialization, and player-save isolation remain intact", () => {
  // Overlay data model continues to work seamlessly
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const doc = makeDoc([well, pipe]);

  const overlay = getWaterOverlayData(doc);
  assert.equal(overlay.active, true);
  assert.equal(overlay.totalWaterObjects, 2);

  // Undo / redo editing
  let s = createEditorState(doc);
  s = editorReducer(s, actions.select("p1"));
  s = editorReducer(s, actions.moveTo(250, 200));
  assert.equal(s.history.present.objects.find((o) => o.id === "p1").x, 250);
  s = editorReducer(s, actions.undo());
  assert.equal(s.history.present.objects.find((o) => o.id === "p1").x, 150);

  // Serialization round trip
  const json = serializeProject(s.history.present);
  assert.equal(json.ok, true);
  const deserialized = deserializeProject(json.text);
  assert.equal(deserialized.ok, true);

  // Player save isolation
  const inspectorSrc = readFileSync(
    join(studioRoot, "world-builder", "components", "WaterStatusInspector.jsx"),
    "utf8"
  );
  const modelSrc = readFileSync(
    join(studioRoot, "world-builder", "engine", "waterStatusModel.js"),
    "utf8"
  );

  for (const [name, src] of [["WaterStatusInspector.jsx", inspectorSrc], ["waterStatusModel.js", modelSrc]]) {
    assert.doesNotMatch(src, /skillverse_save/, `${name} must not touch skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${name} must not touch player state`);
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, `${name} must not award or define progression`);
  }
});
