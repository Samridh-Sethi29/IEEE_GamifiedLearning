import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  SNAP_TOLERANCE,
  buildWaterGraph,
  distanceToFarmBoundary,
  euclideanDistance,
  evaluateWaterNetwork,
  getWaterPorts,
  transformLocalToWorld,
} from "../engine/waterNetwork.js";

import { createObject, createProject, validateProject } from "../../engine/schema.js";
import { deserializeProject, serializeProject } from "../../storage/serialization.js";

const here = dirname(fileURLToPath(import.meta.url));

// Helper to quickly build a valid World Builder document with given objects
function makeDoc(objects = []) {
  return createProject({
    id: "wb-doc",
    type: "world-builder",
    objects,
  });
}

test("1. Port coordinates for a horizontal pipe", () => {
  const pipe = {
    id: "pipe-1",
    type: "pipe",
    x: 200,
    y: 100,
    width: 100,
    height: 30,
    rotation: 0,
  };
  const ports = getWaterPorts(pipe);
  assert.equal(ports.length, 2);
  const [endA, endB] = ports;

  assert.equal(endA.id, "endA");
  assert.equal(endA.x, 150); // 200 - 50
  assert.equal(endA.y, 100);

  assert.equal(endB.id, "endB");
  assert.equal(endB.x, 250); // 200 + 50
  assert.equal(endB.y, 100);
});

test("2. Port coordinates for pipes rotated by 90, 180, and 270 degrees", () => {
  const base = { id: "p", type: "pipe", x: 200, y: 100, width: 100, height: 30 };

  // 90 deg clockwise: local +x points down (+y in world space)
  const p90 = getWaterPorts({ ...base, rotation: 90 });
  assert.deepEqual([p90[0].x, p90[0].y], [200, 50]);
  assert.deepEqual([p90[1].x, p90[1].y], [200, 150]);

  // 180 deg: local +x points left (-x in world space)
  const p180 = getWaterPorts({ ...base, rotation: 180 });
  assert.deepEqual([p180[0].x, p180[0].y], [250, 100]);
  assert.deepEqual([p180[1].x, p180[1].y], [150, 100]);

  // 270 deg: local +x points up (-y in world space)
  const p270 = getWaterPorts({ ...base, rotation: 270 });
  assert.deepEqual([p270[0].x, p270[0].y], [200, 150]);
  assert.deepEqual([p270[1].x, p270[1].y], [200, 50]);
});

test("3a. Well port position matches the chosen visible connection point near its opening", () => {
  // Well opening is an ellipse centered at local (0, height * 0.08).
  // Port is placed at local (0, height * 0.1), which corresponds to the water-drawing opening.
  const well = { id: "well-1", type: "well", x: 100, y: 150, width: 80, height: 90, rotation: 0 };
  const wellPorts = getWaterPorts(well);
  assert.equal(wellPorts.length, 1);
  assert.equal(wellPorts[0].id, "output");
  assert.equal(wellPorts[0].kind, "output");
  // y = 150 + 90 * 0.1 = 159
  assert.equal(wellPorts[0].x, 100);
  assert.equal(wellPorts[0].y, 159);
});

test("3b. Tank inlet and outlet match their chosen visible connection points", () => {
  // Tank inlet is near top lid ellipse (local (0, -height * 0.42)).
  // Tank outlet is near bottom support base (local (0, height * 0.45)).
  const tank = { id: "tank-1", type: "tank", x: 200, y: 250, width: 80, height: 100, rotation: 0 };
  const tankPorts = getWaterPorts(tank);
  assert.equal(tankPorts.length, 2);
  const [inlet, outlet] = tankPorts;

  assert.equal(inlet.id, "inlet");
  assert.equal(inlet.kind, "inlet");
  assert.equal(inlet.x, 200);
  assert.equal(inlet.y, 208); // 250 - 42

  assert.equal(outlet.id, "outlet");
  assert.equal(outlet.kind, "outlet");
  assert.equal(outlet.x, 200);
  assert.equal(outlet.y, 295); // 250 + 45
});

test("3c. Rotated equipment produces correctly transformed port coordinates", () => {
  const well = { id: "well-1", type: "well", x: 100, y: 150, width: 80, height: 90 };
  // Rotated 90 deg clockwise: local (0, +9) maps to world (-9, 0) relative to center
  const wellRot90 = getWaterPorts({ ...well, rotation: 90 });
  assert.deepEqual([wellRot90[0].x, wellRot90[0].y], [91, 150]);

  // Rotated 180 deg: local (0, +9) maps to world (0, -9) relative to center
  const wellRot180 = getWaterPorts({ ...well, rotation: 180 });
  assert.deepEqual([wellRot180[0].x, wellRot180[0].y], [100, 141]);

  // Rotated 270 deg: local (0, +9) maps to world (+9, 0) relative to center
  const wellRot270 = getWaterPorts({ ...well, rotation: 270 });
  assert.deepEqual([wellRot270[0].x, wellRot270[0].y], [109, 150]);

  const tank = { id: "tank-1", type: "tank", x: 200, y: 250, width: 80, height: 100 };
  // Rotated 90 deg:
  // inlet local (0, -42) -> world (+42, 0) -> (242, 250)
  // outlet local (0, +45) -> world (-45, 0) -> (155, 250)
  const tankRot90 = getWaterPorts({ ...tank, rotation: 90 });
  assert.deepEqual([tankRot90[0].x, tankRot90[0].y], [242, 250]);
  assert.deepEqual([tankRot90[1].x, tankRot90[1].y], [155, 250]);
});

test("4. Farm intake connection behavior around its boundary", () => {
  // Farm 120 x 90, centered at (300, 200), rotation 0.
  // Half extents hw=60, hh=45.
  // Left edge x=240, right edge x=360, top edge y=155, bottom edge y=245.
  const farm = { id: "farm-1", type: "farm", x: 300, y: 200, width: 120, height: 90, rotation: 0 };

  // On left edge
  assert.equal(distanceToFarmBoundary(farm, 240, 200), 0);

  // 15 units outside left edge -> within tolerance
  assert.equal(distanceToFarmBoundary(farm, 225, 200), 15);

  // 17 units outside left edge -> beyond tolerance
  assert.equal(distanceToFarmBoundary(farm, 223, 200), 17);

  // 5 units inside left edge -> within tolerance
  assert.equal(distanceToFarmBoundary(farm, 245, 200), 5);

  // At the center of the farm: closest edge is top/bottom at distance 45
  assert.equal(distanceToFarmBoundary(farm, 300, 200), 45);

  // Top edge test
  assert.equal(distanceToFarmBoundary(farm, 300, 145), 10);

  // Rotated farm (90 deg): width and height axes swap in world space
  const farmRot = { ...farm, rotation: 90 };
  // Rotated 90 deg, local +x (hw=60) is along world y, local +y (hh=45) is along world -x.
  // Left edge in world space is at 300 - 45 = 255.
  assert.equal(distanceToFarmBoundary(farmRot, 255, 200), 0);
  assert.equal(distanceToFarmBoundary(farmRot, 245, 200), 10);
});

test("5. Unsupported object types do not create water connections", () => {
  for (const t of ["tree", "road", "rectangle", "circle", "triangle", "gear"]) {
    const obj = { id: `obj-${t}`, type: t, x: 100, y: 100, width: 100, height: 100 };
    assert.deepEqual(getWaterPorts(obj), [], `Type ${t} must have no water ports`);
  }

  const doc = makeDoc([
    createObject("tree", { id: "t1", x: 200, y: 100 }),
    createObject("road", { id: "r1", x: 300, y: 100 }),
  ]);
  const graph = buildWaterGraph(doc);
  assert.equal(Object.keys(graph.nodes).length, 0);
  assert.equal(graph.edges.length, 0);
  assert.equal(graph.ignoredObjects.length, 2);
});

test("6. A valid well -> pipe -> farm chain passes", () => {
  const doc = makeDoc([
    // Well at x=80, y=200, height 90 -> output at (80, 209)
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90, rotation: 0 }),
    // Pipe at x=130, y=209, width 100 -> endA at (80, 209), endB at (180, 209)
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30, rotation: 0 }),
    // Farm at x=240, y=209, width 120 -> left perimeter at x=180, y=209
    createObject("farm", { id: "f1", x: 240, y: 209, width: 120, height: 90, rotation: 0 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, true);
  assert.equal(res.sourceCount, 1);
  assert.equal(res.pipesConnected, 1);
  assert.equal(res.reachesFarm, true);
  assert.equal(res.errors.length, 0);
  assert.equal(res.warnings.length, 0);
  assert.equal(res.summary.wellsConnected, 1);
  assert.equal(res.summary.farmsReached, 1);
});

test("7. A valid well -> pipe -> tank -> pipe -> farm chain passes", () => {
  const doc = makeDoc([
    // Well at x=40, y=100, height 90 -> output at (40, 109)
    createObject("well", { id: "w1", x: 40, y: 100, width: 80, height: 90 }),
    // Pipe 1 at x=90, y=109, width 100 -> endA at (40, 109), endB at (140, 109)
    createObject("pipe", { id: "p1", x: 90, y: 109, width: 100, height: 30 }),
    // Tank at x=140, y=151, height 100 -> inlet at (140, 109), outlet at (140, 196)
    createObject("tank", { id: "t1", x: 140, y: 151, width: 80, height: 100 }),
    // Pipe 2 at x=190, y=196, width 100 -> endA at (140, 196), endB at (240, 196)
    createObject("pipe", { id: "p2", x: 190, y: 196, width: 100, height: 30 }),
    // Farm at x=300, y=196, width 120 -> left edge at x=240, y=196
    createObject("farm", { id: "f1", x: 300, y: 196, width: 120, height: 90 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, true);
  assert.equal(res.sourceCount, 1);
  assert.equal(res.pipesConnected, 2);
  assert.equal(res.reachesFarm, true);
  assert.equal(res.summary.tanksConnected, 1);
  assert.equal(res.errors.length, 0);
  assert.equal(res.warnings.length, 0);
});

test("8. Missing well produces the correct diagnostic", () => {
  const doc = makeDoc([
    createObject("pipe", { id: "p1", x: 170, y: 200 }),
    createObject("farm", { id: "f1", x: 280, y: 200 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, false);
  assert.equal(res.sourceCount, 0);
  assert.ok(res.errors.some((e) => e.code === "MISSING_WELL"));
});

test("9. Missing farm produces the correct diagnostic", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200 }),
    createObject("pipe", { id: "p1", x: 170, y: 200 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, false);
  assert.equal(res.reachesFarm, false);
  assert.ok(res.errors.some((e) => e.code === "MISSING_FARM"));
});

test("10. Well without a connected pipe produces the correct diagnostic", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200 }),
    // Farm exists, but no pipe connects to the well
    createObject("farm", { id: "f1", x: 400, y: 200 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.code === "DISCONNECTED_WELL" && e.wellId === "w1"));
  assert.ok(res.errors.some((e) => e.code === "FARM_UNREACHABLE" && e.farmId === "f1"));
});

test("11. Disconnected pipe segments are reported", () => {
  const doc = makeDoc([
    // Connected chain
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 240, y: 209, width: 120, height: 90 }),
    // Stray disconnected pipe
    createObject("pipe", { id: "p-stray", x: 600, y: 400, width: 100, height: 30 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  // Source-to-farm connectivity passes, stray pipe produces a warning
  assert.equal(res.ok, true);
  assert.equal(res.pipesConnected, 1);
  assert.equal(res.summary.pipesTotal, 2);
  assert.deepEqual(res.summary.disconnectedPipeIds, ["p-stray"]);
  assert.ok(res.warnings.some((w) => w.code === "PIPE_DISCONNECTED" && w.pipeId === "p-stray"));
});

test("12. A nearby endpoint within tolerance connects correctly", () => {
  // Pipe 1 endB is at (150, 100)
  const p1 = createObject("pipe", { id: "p1", x: 100, y: 100, width: 100, height: 30 });
  // Pipe 2 endA is at 216 - 50 = 166. Distance from 150 to 166 is exactly 16 (SNAP_TOLERANCE)
  const p2 = createObject("pipe", { id: "p2", x: 216, y: 100, width: 100, height: 30 });

  const doc = makeDoc([p1, p2]);
  const graph = buildWaterGraph(doc);
  assert.ok(graph.nodes["p1:endB"].connections.includes("p2:endA"));
  assert.ok(graph.nodes["p2:endA"].connections.includes("p1:endB"));
});

test("13. Endpoints beyond tolerance do not connect", () => {
  // Pipe 1 endB is at (150, 100)
  const p1 = createObject("pipe", { id: "p1", x: 100, y: 100, width: 100, height: 30 });
  // Pipe 2 endA is at 217 - 50 = 167. Distance from 150 to 167 is 17 (> SNAP_TOLERANCE 16)
  const p2 = createObject("pipe", { id: "p2", x: 217, y: 100, width: 100, height: 30 });

  const doc = makeDoc([p1, p2]);
  const graph = buildWaterGraph(doc);
  assert.ok(!graph.nodes["p1:endB"].connections.includes("p2:endA"));
  assert.ok(!graph.nodes["p2:endA"].connections.includes("p1:endB"));
});

test("14. Overlapping bounding boxes or nearby object centers alone do not create a connection", () => {
  // Two parallel pipes side by side with overlapping x extents, but endpoints separated by 30 units
  const p1 = createObject("pipe", { id: "p1", x: 100, y: 100, width: 100, height: 30 });
  const p2 = createObject("pipe", { id: "p2", x: 100, y: 130, width: 100, height: 30 });

  const docPipes = makeDoc([p1, p2]);
  const graph = buildWaterGraph(docPipes);
  // No connection between p1 and p2 endpoints
  assert.deepEqual(graph.nodes["p1:endA"].connections, ["p1:endB"]);
  assert.deepEqual(graph.nodes["p1:endB"].connections, ["p1:endA"]);

  // Well and farm colocated at the same center with no pipe
  const docColocated = makeDoc([
    createObject("well", { id: "w1", x: 200, y: 200, width: 80, height: 90 }),
    createObject("farm", { id: "f1", x: 200, y: 200, width: 120, height: 90 }),
  ]);
  const res = evaluateWaterNetwork(docColocated);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.code === "DISCONNECTED_WELL"));
  assert.ok(res.errors.some((e) => e.code === "FARM_UNREACHABLE"));
});

test("15. Rotated and moved objects are evaluated using their current transforms", () => {
  // L-shaped layout:
  // Well at x=100, y=150, height 90 -> output at (100, 159)
  const well = createObject("well", { id: "w1", x: 100, y: 150, width: 80, height: 90 });
  // Pipe 1 (horizontal) at x=150, y=159, width 100 -> endA (100, 159), endB (200, 159)
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 159, width: 100, height: 30, rotation: 0 });
  // Pipe 2 (vertical, rotated 90) at x=200, y=209, width 100 -> endA (200, 159), endB (200, 259)
  const pipe2 = createObject("pipe", { id: "p2", x: 200, y: 209, width: 100, height: 30, rotation: 90 });
  // Farm at x=200, y=310, width 120, height 90 -> top edge at y = 310 - 45 = 265
  // Pipe 2 endB is at (200, 259), distance to farm top edge is 6 (<= 16)
  const farm = createObject("farm", { id: "f1", x: 200, y: 310, width: 120, height: 90, rotation: 0 });

  const doc = makeDoc([well, pipe1, pipe2, farm]);
  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, true);
  assert.equal(res.pipesConnected, 2);
  assert.equal(res.reachesFarm, true);
});

test("16. Multiple branches and multiple components are evaluated deterministically", () => {
  // Well forks into two pipe branches, reaching Farm 1 and Farm 2
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 50, y: 150, width: 80, height: 90 }),
    // Pipe 1 (trunk) connected to well output at (50, 159)
    createObject("pipe", { id: "p1", x: 100, y: 159, width: 100, height: 30 }),
    // Branch A: Pipe 2 reaching Farm 1
    createObject("pipe", { id: "p2", x: 200, y: 159, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 310, y: 159, width: 120, height: 90 }),
    // Branch B: Pipe 3 (vertical) reaching Farm 2 (connected to p1 endB at (150, 159))
    createObject("pipe", { id: "p3", x: 150, y: 209, width: 100, height: 30, rotation: 90 }),
    createObject("farm", { id: "f2", x: 150, y: 310, width: 120, height: 90 }),
  ]);

  const res = evaluateWaterNetwork(doc);
  assert.equal(res.ok, true);
  assert.equal(res.summary.farmsTotal, 2);
  assert.equal(res.summary.farmsReached, 2);
  assert.equal(res.pipesConnected, 3);
  assert.deepEqual(res.summary.unreachedFarmIds, []);
});

test("17. Repeated evaluations of the same document return equivalent results", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 240, y: 209, width: 120, height: 90 }),
    createObject("house", { id: "h1", x: 100, y: 50 }),
  ]);

  const r1 = evaluateWaterNetwork(doc);
  const r2 = evaluateWaterNetwork(doc);
  assert.deepEqual(r1, r2);
});

test("18. The input document remains unchanged after graph construction and evaluation", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 80, y: 200, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 130, y: 209, width: 100, height: 30 }),
    createObject("farm", { id: "f1", x: 240, y: 209, width: 120, height: 90 }),
  ]);

  const snapshot = JSON.stringify(doc);
  buildWaterGraph(doc);
  evaluateWaterNetwork(doc);
  assert.equal(JSON.stringify(doc), snapshot, "evaluateWaterNetwork must not mutate input doc");
});

test("19. Existing schema validation and serialization remain unaffected", () => {
  const doc = makeDoc([
    createObject("well", { id: "w1", x: 40, y: 100, width: 80, height: 90 }),
    createObject("pipe", { id: "p1", x: 90, y: 109, width: 100, height: 30 }),
    createObject("tank", { id: "t1", x: 140, y: 151, width: 80, height: 100 }),
    createObject("farm", { id: "f1", x: 260, y: 196, width: 120, height: 90, props: { irrigation: "drip" } }),
  ]);

  const check = validateProject(doc);
  assert.equal(check.ok, true, `Validation errors: ${check.errors.join(", ")}`);

  const serialized = serializeProject(doc);
  assert.equal(serialized.ok, true);

  const deserialized = deserializeProject(serialized.text);
  assert.equal(deserialized.ok, true);
  assert.deepEqual(deserialized.project, doc);

  const evalResult = evaluateWaterNetwork(deserialized.project);
  assert.equal(typeof evalResult.ok, "boolean");
});

test("20. Existing player-save isolation remains intact", () => {
  const code = readFileSync(join(here, "..", "engine", "waterNetwork.js"), "utf8");
  assert.doesNotMatch(code, /skillverse_save/, "Mentions player save key");
  assert.doesNotMatch(code, /usePlayer|updatePlayer|features\/player/, "Touches player state");
  assert.doesNotMatch(code, /\b(xp|coins|level)\b\s*[:=]/i, "Defines player progression fields");
});

test("21. Malformed and edge-case inputs are safely handled without throwing", () => {
  assert.equal(evaluateWaterNetwork(null).ok, false);
  assert.equal(evaluateWaterNetwork(undefined).ok, false);
  assert.equal(evaluateWaterNetwork({}).ok, false);
  assert.equal(evaluateWaterNetwork({ objects: "invalid" }).ok, false);
  assert.equal(getWaterPorts(null).length, 0);
  assert.equal(getWaterPorts({}).length, 0);
  assert.equal(distanceToFarmBoundary(null, 0, 0), Infinity);
  assert.equal(euclideanDistance(null, null), Infinity);
});
