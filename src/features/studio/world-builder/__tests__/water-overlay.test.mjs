import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { getWaterOverlayData } from "../engine/waterOverlayModel.js";
import {
  SNAP_TOLERANCE,
  buildWaterGraph,
  getWaterPorts,
} from "../engine/waterNetwork.js";

import { createObject, createProject, validateProject } from "../../engine/schema.js";
import { createEditorState, editorReducer } from "../../engine/editorReducer.js";
import { actions } from "../../engine/actions.js";
import { deserializeProject, serializeProject } from "../../storage/serialization.js";

const here = dirname(fileURLToPath(import.meta.url));

function makeDoc(objects = []) {
  return createProject({
    id: "wb-doc",
    type: "world-builder",
    objects,
  });
}

test("1. Water-port overlays appear for supported water objects", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 150, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 170, y: 159, width: 100, height: 30 }),
    createObject("tank", { id: "t1", x: 300, y: 200, width: 80, height: 100 }),
    createObject("farm", { id: "f1", x: 450, y: 200, width: 120, height: 90 }),
  ]);

  const overlay = getWaterOverlayData(doc);
  assert.equal(overlay.active, true);
  assert.equal(overlay.totalWaterObjects, 4);

  // 1 well output + 2 pipe endpoints + 2 tank ports (inlet + outlet) = 5 discrete ports
  assert.equal(overlay.discretePorts.length, 5);
  const kinds = overlay.discretePorts.map((p) => p.kind).sort();
  assert.deepEqual(kinds, ["endpoint", "endpoint", "inlet", "outlet", "output"]);

  // 1 farm boundary
  assert.equal(overlay.farmBoundaries.length, 1);
  assert.equal(overlay.farmBoundaries[0].id, "f1");
});

test("2. Non-water objects do not display water ports", () => {
  const doc = makeDoc([
    createObject("house", { id: "h1", x: 100, y: 100 }),
    createObject("tree", { id: "t1", x: 200, y: 100 }),
    createObject("road", { id: "r1", x: 300, y: 100 }),
  ]);

  const overlay = getWaterOverlayData(doc);
  assert.equal(overlay.active, false);
  assert.equal(overlay.totalWaterObjects, 0);
  assert.equal(overlay.discretePorts.length, 0);
  assert.equal(overlay.farmBoundaries.length, 0);
  assert.equal(overlay.connections.length, 0);
  assert.equal(overlay.farmContacts.length, 0);
});

test("3. Overlay coordinates match the logic module's port positions", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 150, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 200, y: 159, width: 100, height: 30 });
  const tank = createObject("tank", { id: "t1", x: 350, y: 250, width: 80, height: 100 });
  const doc = makeDoc([well, pipe, tank]);

  const overlay = getWaterOverlayData(doc);
  const wellExpected = getWaterPorts(well);
  const pipeExpected = getWaterPorts(pipe);
  const tankExpected = getWaterPorts(tank);

  // Well output matches
  const wellOverlayPort = overlay.discretePorts.find((p) => p.id === "w1:output");
  assert.equal(wellOverlayPort.x, wellExpected[0].x);
  assert.equal(wellOverlayPort.y, wellExpected[0].y);

  // Pipe endpoints match
  const pipeEndA = overlay.discretePorts.find((p) => p.id === "p1:endA");
  const pipeEndB = overlay.discretePorts.find((p) => p.id === "p1:endB");
  assert.equal(pipeEndA.x, pipeExpected[0].x);
  assert.equal(pipeEndA.y, pipeExpected[0].y);
  assert.equal(pipeEndB.x, pipeExpected[1].x);
  assert.equal(pipeEndB.y, pipeExpected[1].y);

  // Tank inlet & outlet match
  const tankInlet = overlay.discretePorts.find((p) => p.id === "t1:inlet");
  const tankOutlet = overlay.discretePorts.find((p) => p.id === "t1:outlet");
  assert.equal(tankInlet.x, tankExpected[0].x);
  assert.equal(tankInlet.y, tankExpected[0].y);
  assert.equal(tankOutlet.x, tankExpected[1].x);
  assert.equal(tankOutlet.y, tankExpected[1].y);
});

test("4. Connected and unconnected states reflect graph results", () => {
  // Case A: Unconnected pipe sitting alone
  const docUnconnected = makeDoc([
    createObject("pipe", { id: "p-alone", x: 200, y: 200, width: 100, height: 30 }),
  ]);
  const overlayUnconn = getWaterOverlayData(docUnconnected);
  assert.equal(overlayUnconn.connections.length, 0);
  for (const p of overlayUnconn.discretePorts) {
    assert.equal(p.connected, false);
  }

  // Case B: Well connected to Pipe 1, but Pipe 1 endB is free
  // Well at x=80, y=200, height 90 -> output at (80, 209)
  // Pipe at x=130, y=209, width 100 -> endA at (80, 209), endB at (180, 209)
  const docConnected = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
  ]);
  const overlayConn = getWaterOverlayData(docConnected);
  assert.equal(overlayConn.connections.length, 1);
  const wOut = overlayConn.discretePorts.find((p) => p.id === "w1:output");
  const pEndA = overlayConn.discretePorts.find((p) => p.id === "p1:endA");
  const pEndB = overlayConn.discretePorts.find((p) => p.id === "p1:endB");
  assert.equal(wOut.connected, true);
  assert.equal(pEndA.connected, true);
  assert.equal(pEndB.connected, false, "Free pipe endpoint must stay unconnected");

  // Case C: Pipe 1 endB connects to Farm
  const docFarm = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 240, y: 209, width: 120, height: 90 }),
  ]);
  const overlayFarm = getWaterOverlayData(docFarm);
  const pEndBConn = overlayFarm.discretePorts.find((p) => p.id === "p1:endB");
  const farmBound = overlayFarm.farmBoundaries.find((f) => f.id === "f1");
  assert.equal(pEndBConn.connected, true);
  assert.equal(farmBound.connected, true);
  assert.equal(overlayFarm.farmContacts.length, 1);
  assert.equal(overlayFarm.farmContacts[0].farmId, "f1");
});

test("5. Candidate-connection feedback uses the same tolerance and compatibility rules as the graph builder", () => {
  // Pipe 1 endB is at (150, 100)
  const p1 = createObject("pipe", { id: "p1", x: 100, y: 100, width: 100, height: 30 });

  // Pipe 2 at x=216: endA is at 216 - 50 = 166 (distance = 16.0 <= SNAP_TOLERANCE)
  const docSnap = makeDoc([p1, createObject("pipe", { id: "p2", x: 216, y: 100, width: 100, height: 30 })]);
  const overlaySnap = getWaterOverlayData(docSnap);
  assert.equal(overlaySnap.connections.length, 1, "Should indicate candidate connection at 16 units");
  assert.equal(overlaySnap.connections[0].distance, 16);

  // Pipe 3 at x=217: endA is at 217 - 50 = 167 (distance = 17.0 > SNAP_TOLERANCE)
  const docBeyond = makeDoc([p1, createObject("pipe", { id: "p3", x: 217, y: 100, width: 100, height: 30 })]);
  const overlayBeyond = getWaterOverlayData(docBeyond);
  assert.equal(overlayBeyond.connections.length, 0, "No candidate connection beyond tolerance");

  // Parallel pipes separated vertically by 30 units: no candidate connection
  const docParallel = makeDoc([
    createObject("pipe", { id: "p-a", x: 100, y: 100, width: 100, height: 30 }),
    createObject("pipe", { id: "p-b", x: 100, y: 130, width: 100, height: 30 }),
  ]);
  const overlayParallel = getWaterOverlayData(docParallel);
  assert.equal(overlayParallel.connections.length, 0);
});

test("6. Rotated and moved objects update indicator positions", () => {
  const pipe = createObject("pipe", { id: "p1", x: 100, y: 100, width: 100, height: 30, rotation: 0 });
  const doc1 = makeDoc([pipe]);
  const o1 = getWaterOverlayData(doc1);
  const p1EndA = o1.discretePorts.find((p) => p.id === "p1:endA");
  assert.equal(p1EndA.x, 50);
  assert.equal(p1EndA.y, 100);

  // Move pipe to (200, 200) and rotate by 90 degrees
  const movedPipe = { ...pipe, x: 200, y: 200, rotation: 90 };
  const doc2 = makeDoc([movedPipe]);
  const o2 = getWaterOverlayData(doc2);
  const p2EndA = o2.discretePorts.find((p) => p.id === "p1:endA");
  // At 90 deg: local (-50, 0) transforms to (200, 200 - 50) = (200, 150)
  assert.equal(p2EndA.x, 200);
  assert.equal(p2EndA.y, 150);
});

test("7. Deleting an object does not leave stale indicators", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
  ]);

  let state = createEditorState(doc);
  // Select pipe and delete it
  state = editorReducer(state, actions.select("p1"));
  state = editorReducer(state, actions.remove());

  const overlayAfterDelete = getWaterOverlayData(state.history.present);
  assert.equal(overlayAfterDelete.totalWaterObjects, 1);
  assert.equal(overlayAfterDelete.discretePorts.length, 1); // Only well remains
  assert.equal(overlayAfterDelete.discretePorts[0].id, "w1:output");
  assert.equal(overlayAfterDelete.discretePorts[0].connected, false);
  assert.equal(overlayAfterDelete.connections.length, 0);
});

test("8. Overlay rendering does not mutate document data", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200 }),
    createObject("pipe", { id: "p1", x: 130, y: 209 }),
    createObject("farm", { id: "f1", x: 240, y: 209 }),
  ]);

  const before = JSON.stringify(doc);
  getWaterOverlayData(doc, "w1");
  assert.equal(JSON.stringify(doc), before, "Document must remain unmodified after overlay calculation");
});

test("9. Overlay elements do not intercept canvas pointer interactions", () => {
  const doc = makeDoc([createObject("pipe", { id: "p1", x: 100, y: 100 })]);
  const overlay = getWaterOverlayData(doc);
  assert.equal(overlay.pointerEvents, "none");

  // Verify component source code sets pointerEvents="none"
  const overlaySrc = readFileSync(join(here, "..", "components", "WaterPortOverlay.jsx"), "utf8");
  assert.match(overlaySrc, /pointerEvents=\{pointerEvents\}|pointerEvents="none"/);

  // Verify Canvas.jsx preserves pointer event handling and does not wrap objects in overlay
  const canvasSrc = readFileSync(join(here, "..", "..", "engine", "Canvas.jsx"), "utf8");
  assert.match(canvasSrc, /onPointerMove=\{onMove\}/);
  assert.match(canvasSrc, /onPointerDown=\{\(e\) => onObjectDown\(e, o\)\}/);
  assert.match(canvasSrc, /\{overlay\}/);
});

test("10. Existing object editing, selection, undo/redo, serialization, and player-save isolation remain intact", () => {
  // Test isolation
  const overlayModelSrc = readFileSync(join(here, "..", "engine", "waterOverlayModel.js"), "utf8");
  const overlayCompSrc = readFileSync(join(here, "..", "components", "WaterPortOverlay.jsx"), "utf8");

  for (const [name, src] of [["waterOverlayModel.js", overlayModelSrc], ["WaterPortOverlay.jsx", overlayCompSrc]]) {
    assert.doesNotMatch(src, /skillverse_save/, `${name} touches player save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${name} touches player state`);
    assert.doesNotMatch(src, /\b(xp|coins|level)\b\s*[:=]/i, `${name} defines progression fields`);
  }

  // Test undo / redo with overlay
  const doc = makeDoc([createObject("well", { id: "w1", x: 80, y: 200 })]);
  let state = createEditorState(doc);
  state = editorReducer(state, actions.addObject("pipe", { id: "p1", x: 130, y: 209 }));
  assert.equal(getWaterOverlayData(state.history.present).discretePorts.length, 3);

  // Undo
  state = editorReducer(state, actions.undo());
  assert.equal(getWaterOverlayData(state.history.present).discretePorts.length, 1);

  // Redo
  state = editorReducer(state, actions.redo());
  assert.equal(getWaterOverlayData(state.history.present).discretePorts.length, 3);

  // Serialization round-trip
  const ser = serializeProject(state.history.present);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);
  assert.deepEqual(deser.project, state.history.present);
});
