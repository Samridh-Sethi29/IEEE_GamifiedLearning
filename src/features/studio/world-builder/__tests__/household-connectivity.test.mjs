import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  SNAP_TOLERANCE,
  buildWaterGraph,
  evaluateWaterNetwork,
  getWaterPorts,
  transformLocalToWorld,
} from "../engine/waterNetwork.js";

import { runVillageTrial } from "../engine/villageTrialModel.js";
import { getWaterStatus, getSelectedWaterStatus } from "../engine/waterStatusModel.js";
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

test("1. House port coordinates match the selected exterior point in the artwork", () => {
  const house = createObject("house", { id: "h1", x: 100, y: 100, width: 110, height: 100, rotation: 0 });
  const ports = getWaterPorts(house);

  assert.equal(ports.length, 1);
  const port = ports[0];
  assert.equal(port.id, "intake");
  assert.equal(port.kind, "intake");
  assert.equal(port.objectId, "h1");

  // Left exterior wall midpoint: lx = -round2(110 * 0.4) = -44, ly = round2(100 * 0.25) = 25
  // World coordinates: (100 - 44, 100 + 25) = (56, 125)
  assert.equal(port.x, 56);
  assert.equal(port.y, 125);
});

test("2. Rotated houses transform their water port correctly", () => {
  const w = 110;
  const h = 100;

  for (const rot of [0, 90, 180, 270]) {
    const house = createObject("house", { id: "h1", x: 200, y: 200, width: w, height: h, rotation: rot });
    const ports = getWaterPorts(house);
    assert.equal(ports.length, 1);

    const expected = transformLocalToWorld(house, -Math.round(w * 0.4 * 100) / 100, Math.round(h * 0.25 * 100) / 100);
    assert.equal(ports[0].x, expected.x);
    assert.equal(ports[0].y, expected.y);
  }
});

test("3. A connected well -> pipe -> house counts that house as supplied", () => {
  // Well at (100, 100, w:80, h:90) -> output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe 1 at (150, 109, w:100, h:30) -> left at (100, 109), right at (200, 109)
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Pipe 2 at (200, 167, w:116, h:30, rot:90) -> top at (200, 109), bottom at (200, 225)
  const pipe2 = createObject("pipe", { id: "p2", x: 200, y: 167, width: 116, height: 30, rotation: 90 });
  // House at (244, 200, w:110, h:100) -> intake at (244 - 44, 200 + 25) = (200, 225)
  const house = createObject("house", { id: "h1", x: 244, y: 200, width: 110, height: 100 });
  // Farm at (350, 109, w:100, h:100) connected via pipe3 at (250, 109, w:100, h:30)
  const pipe3 = createObject("pipe", { id: "p3", x: 250, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 109, width: 100, height: 100 });

  const doc = makeDoc([well, pipe1, pipe2, house, pipe3, farm]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesCount, 1);
  assert.equal(res.housesConnected, 1);
  assert.deepEqual(res.connectedHouseIds, ["h1"]);
  assert.deepEqual(res.unreachedHouseIds, []);
  assert.equal(res.householdDiagnostics.length, 0);
});

test("4. Multiple connected households are counted exactly once each", () => {
  // Well at (100, 100, w:80, h:90) -> output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Farm at (350, 109, w:100, h:100) connected via two pipe segments:
  // Pipe 1 from x=100 to x=200: center (150, 109), width 100
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Pipe 2 from x=200 to x=300: center (250, 109), width 100
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 109, width: 100, height: 100 });

  // 4 houses connected to different branch points:
  // House 1: intake at (100, 109) - connected near well output / pipe1 endA
  const h1 = createObject("house", { id: "h1", x: 144, y: 84, width: 110, height: 100 }); // intake at (100, 109)
  // House 2: intake at (200, 109) - connected at pipe1 endB / pipe2 endA junction
  const h2 = createObject("house", { id: "h2", x: 244, y: 84, width: 110, height: 100 }); // intake at (200, 109)
  // House 3: connected via branch pipe p_br3 at junction (300, 109)
  const pBr3 = createObject("pipe", { id: "p_br3", x: 300, y: 167, width: 116, height: 30, rotation: 90 }); // top at (300, 109), bottom at (300, 225)
  const h3 = createObject("house", { id: "h3", x: 344, y: 200, width: 110, height: 100 }); // intake at (300, 225)
  // House 4: connected via branch pipe p_br4 at junction (300, 109)
  const pBr4 = createObject("pipe", { id: "p_br4", x: 300, y: 51, width: 116, height: 30, rotation: 90 }); // bottom at (300, 109), top at (300, -7)
  const h4 = createObject("house", { id: "h4", x: 344, y: -32, width: 110, height: 100 }); // intake at (300, -7)

  const doc = makeDoc([well, pipe1, pipe2, farm, h1, h2, pBr3, h3, pBr4, h4]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesCount, 4);
  assert.equal(res.housesConnected, 4);
  assert.deepEqual(res.connectedHouseIds, ["h1", "h2", "h3", "h4"]);
  assert.deepEqual(res.unreachedHouseIds, []);
  assert.equal(res.householdTargetMet, true);
});

test("5. A disconnected house does not count as supplied", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  // House far away at (600, 600)
  const disconnectedHouse = createObject("house", { id: "h_far", x: 600, y: 600, width: 110, height: 100 });

  const doc = makeDoc([well, pipe, farm, disconnectedHouse]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesCount, 1);
  assert.equal(res.housesConnected, 0);
  assert.deepEqual(res.connectedHouseIds, []);
  assert.deepEqual(res.unreachedHouseIds, ["h_far"]);
  assert.equal(res.householdTargetMet, false);
  assert.ok(res.householdDiagnostics.some((d) => d.houseId === "h_far" && d.code === "HOUSE_NOT_CONNECTED"));
});

test("6. A house connected to a disconnected pipe branch does not count as supplied", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });

  // Separate, disconnected pipe and house
  const deadPipe = createObject("pipe", { id: "p_dead", x: 500, y: 500, width: 100, height: 30 }); // left at (450, 500), right at (550, 500)
  const deadHouse = createObject("house", { id: "h_dead", x: 594, y: 475, width: 110, height: 100 }); // intake at (550, 500)

  const doc = makeDoc([well, pipe1, farm, deadPipe, deadHouse]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesCount, 1);
  assert.equal(res.housesConnected, 0);
  assert.deepEqual(res.unreachedHouseIds, ["h_dead"]);
});

test("7. A well -> pipe -> tank -> pipe -> house route works", () => {
  // Well at (100, 100, w:80, h:90) -> output at (100, 109)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe 1 at (150, 109, w:100, h:30) -> left at (100, 109), right at (200, 109)
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  // Tank at (200, 151, w:80, h:100) -> inlet at (200, 109), outlet at (200, 196)
  const tank = createObject("tank", { id: "t1", x: 200, y: 151, width: 80, height: 100 });
  // Pipe 2 at (250, 196, w:100, h:30) -> left at (200, 196), right at (300, 196)
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 196, width: 100, height: 30 });
  // House at (344, 171, w:110, h:100) -> intake at (344 - 44, 171 + 25) = (300, 196)
  const house = createObject("house", { id: "h1", x: 344, y: 171, width: 110, height: 100 });
  // Farm connected directly to pipe 1
  const farm = createObject("farm", { id: "f1", x: 150, y: 25, width: 100, height: 100 });

  const doc = makeDoc([well, pipe1, tank, pipe2, house, farm]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesConnected, 1);
  assert.deepEqual(res.connectedHouseIds, ["h1"]);
});

test("8. The four-household target is correctly reported below, at, and above four houses", () => {
  // 0 houses
  const doc0 = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);
  assert.equal(evaluateWaterNetwork(doc0).householdTargetMet, false);

  // 3 connected houses (below 4)
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const p1 = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const p2 = createObject("pipe", { id: "p2", x: 250, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 109, width: 100, height: 100 });
  const h1 = createObject("house", { id: "h1", x: 144, y: 84, width: 110, height: 100 });
  const h2 = createObject("house", { id: "h2", x: 244, y: 84, width: 110, height: 100 });
  const p3 = createObject("pipe", { id: "p3", x: 300, y: 167, width: 116, height: 30, rotation: 90 });
  const h3 = createObject("house", { id: "h3", x: 344, y: 200, width: 110, height: 100 });

  const doc3 = makeDoc([well, p1, p2, farm, h1, h2, p3, h3]);
  const res3 = evaluateWaterNetwork(doc3);
  assert.equal(res3.housesConnected, 3);
  assert.equal(res3.householdTargetMet, false);

  // 4 connected houses (at 4)
  const p4 = createObject("pipe", { id: "p4", x: 300, y: 51, width: 116, height: 30, rotation: 90 });
  const h4 = createObject("house", { id: "h4", x: 344, y: -32, width: 110, height: 100 });
  const doc4 = makeDoc([well, p1, p2, farm, h1, h2, p3, h3, p4, h4]);
  const res4 = evaluateWaterNetwork(doc4);
  assert.equal(res4.housesConnected, 4);
  assert.equal(res4.householdTargetMet, true);

  // 5 connected houses (above 4)
  const p5 = createObject("pipe", { id: "p5", x: 100, y: 167, width: 116, height: 30, rotation: 90 });
  const h5 = createObject("house", { id: "h5", x: 144, y: 200, width: 110, height: 100 });
  const doc5 = makeDoc([well, p1, p2, farm, h1, h2, p3, h3, p4, h4, p5, h5]);
  const res5 = evaluateWaterNetwork(doc5);
  assert.equal(res5.housesConnected, 5);
  assert.equal(res5.householdTargetMet, true);
});

test("9. Houses and pipes that are merely nearby do not falsely connect", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  // Pipe ends at x=200, y=109
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  // House intake is at (x - 44, y + 25)
  // If house is placed at x=265, y=84 -> intake at (221, 109)
  // Distance from pipe end (200, 109) is 21 units (> 16 SNAP_TOLERANCE)
  const houseNearby = createObject("house", { id: "h_near", x: 265, y: 84, width: 110, height: 100 });

  const doc = makeDoc([well, pipe, farm, houseNearby]);
  const res = evaluateWaterNetwork(doc);

  assert.equal(res.housesConnected, 0);
  assert.deepEqual(res.unreachedHouseIds, ["h_near"]);
});

test("10. Trees and roads remain excluded from the water graph", () => {
  const tree = createObject("tree", { id: "t1", x: 100, y: 100 });
  const road = createObject("road", { id: "r1", x: 200, y: 100 });

  assert.deepEqual(getWaterPorts(tree), []);
  assert.deepEqual(getWaterPorts(road), []);

  const doc = makeDoc([tree, road]);
  const graph = buildWaterGraph(doc);

  assert.equal(Object.keys(graph.nodes).length, 0);
  assert.equal(graph.edges.length, 0);
  assert.equal(graph.ignoredObjects.length, 2);
  assert.deepEqual(graph.ignoredObjects.map((o) => o.type).sort(), ["road", "tree"]);
});

test("11. Sandbox behavior remains unchanged", () => {
  const sbDoc = makeDoc(
    [
      createObject("rectangle", { id: "r1", x: 100, y: 100 }, "sandbox"),
      createObject("house", { id: "h1", x: 200, y: 100 }, "sandbox"),
    ],
    "sandbox"
  );

  // In sandbox, water overlay is never active
  const overlay = getWaterOverlayData(sbDoc);
  assert.equal(overlay.active, false);
});

test("12. Existing well-to-farm evaluator semantics remain unchanged", () => {
  // A layout with well, pipe, farm, and 0 houses passes ok === true
  const docNoHouses = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);
  const res = evaluateWaterNetwork(docNoHouses);
  assert.equal(res.ok, true);
  assert.equal(res.reachesFarm, true);

  // A layout with well, pipe, farm, and an UNCONNECTED house STILL passes ok === true
  const docWithUnconnectedHouse = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
    createObject("house", { id: "h1", x: 600, y: 600, width: 110, height: 100 }),
  ]);
  const res2 = evaluateWaterNetwork(docWithUnconnectedHouse);
  assert.equal(res2.ok, true);
  assert.equal(res2.reachesFarm, true);
  assert.equal(res2.householdTargetMet, false); // separate household metric
});

test("13. Existing D3.4A trial results do not silently start requiring four houses", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 }),
  ]);

  const trial = runVillageTrial(doc);
  // Trial passes for well-to-farm connectivity trial
  assert.equal(trial.ok, true);
  assert.equal(trial.status, "pass");
  // Exposes household tracking information
  assert.ok(trial.households);
  assert.equal(trial.households.total, 0);
  assert.equal(trial.households.connected, 0);
  assert.equal(trial.households.targetMet, false);
});

test("14. Serialization, undo/redo, save/reload, and player-save isolation remain intact", () => {
  const well = createObject("well", { id: "w1", x: 100, y: 100, width: 80, height: 90 });
  const pipe = createObject("pipe", { id: "p1", x: 150, y: 109, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 250, y: 109, width: 100, height: 100 });
  const house = createObject("house", { id: "h1", x: 244, y: 200, width: 110, height: 100 });

  const doc = makeDoc([well, pipe, farm, house]);

  // Serialization round-trip
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const deser = deserializeProject(ser.text);
  assert.equal(deser.ok, true);
  assert.equal(deser.project.objects.length, 4);

  // Validation
  const check = validateProject(doc);
  assert.equal(check.ok, true);

  // Undo / redo
  let state = createEditorState(doc);
  state = editorReducer(state, actions.select("h1"));
  state = editorReducer(state, actions.moveTo(300, 300));
  assert.equal(state.history.present.objects.find((o) => o.id === "h1").x, 300);
  state = editorReducer(state, actions.undo());
  assert.equal(state.history.present.objects.find((o) => o.id === "h1").x, 244);
  state = editorReducer(state, actions.redo());
  assert.equal(state.history.present.objects.find((o) => o.id === "h1").x, 300);

  // Player save isolation
  for (const rel of [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/waterOverlayModel.js",
  ]) {
    const src = readFileSync(join(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
  }
});
