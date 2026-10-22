// Water network graph builder and topology evaluator for World Builder.
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Evaluates whether water from a well can reach village farms through a connected pipe network.

export const SNAP_TOLERANCE = 16;

export const round2 = (n) => Math.round(n * 100) / 100;

export function normalizeAngle(deg) {
  if (typeof deg !== "number" || !Number.isFinite(deg)) return 0;
  const a = ((deg % 360) + 360) % 360;
  return round2(a);
}

export function euclideanDistance(p1, p2) {
  if (!p1 || !p2) return Infinity;
  const dx = (p1.x ?? 0) - (p2.x ?? 0);
  const dy = (p1.y ?? 0) - (p2.y ?? 0);
  return round2(Math.hypot(dx, dy));
}

/**
 * Transforms a local point (lx, ly) relative to obj center to world coordinates,
 * taking into account clockwise rotation in degrees.
 */
export function transformLocalToWorld(obj, lx, ly) {
  const ox = obj?.x ?? 0;
  const oy = obj?.y ?? 0;
  const rot = normalizeAngle(obj?.rotation ?? 0);
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const wx = ox + lx * cos - ly * sin;
  const wy = oy + lx * sin + ly * cos;
  return { x: round2(wx), y: round2(wy) };
}

/**
 * Calculates the shortest Euclidean distance from a world-space point (px, py)
 * to the perimeter boundary of a farm (accounting for rotation and dimensions).
 */
export function distanceToFarmBoundary(farm, px, py) {
  if (!farm) return Infinity;
  const w = farm.width ?? 0;
  const h = farm.height ?? 0;
  const hw = w / 2;
  const hh = h / 2;
  const rot = normalizeAngle(farm.rotation ?? 0);
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Translate world point relative to farm center
  const dx = px - (farm.x ?? 0);
  const dy = py - (farm.y ?? 0);

  // Un-rotate world point into farm's local coordinate frame
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  // The 4 perimeter segments of the rectangle [-hw, hw] x [-hh, hh]:
  const topClampedX = clamp(lx, -hw, hw);
  const distTop = Math.hypot(lx - topClampedX, ly - (-hh));

  const botClampedX = clamp(lx, -hw, hw);
  const distBot = Math.hypot(lx - botClampedX, ly - hh);

  const leftClampedY = clamp(ly, -hh, hh);
  const distLeft = Math.hypot(lx - (-hw), ly - leftClampedY);

  const rightClampedY = clamp(ly, -hh, hh);
  const distRight = Math.hypot(lx - hw, ly - rightClampedY);

  return round2(Math.min(distTop, distBot, distLeft, distRight));
}

/**
 * Returns the closest world-space point on the perimeter of a farm to the given point (px, py).
 */
export function closestPointOnFarmBoundary(farm, px, py) {
  if (!farm) return { x: px, y: py };
  const w = farm.width ?? 0;
  const h = farm.height ?? 0;
  const hw = w / 2;
  const hh = h / 2;
  const rot = normalizeAngle(farm.rotation ?? 0);
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = px - (farm.x ?? 0);
  const dy = py - (farm.y ?? 0);

  // Un-rotate into farm's local coordinate frame
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  // The 4 perimeter segments of [-hw, hw] x [-hh, hh]:
  const candidates = [
    { x: clamp(lx, -hw, hw), y: -hh }, // top
    { x: clamp(lx, -hw, hw), y: hh },  // bottom
    { x: -hw, y: clamp(ly, -hh, hh) }, // left
    { x: hw, y: clamp(ly, -hh, hh) },  // right
  ];

  let best = candidates[0];
  let bestDist = Math.hypot(lx - best.x, ly - best.y);
  for (let i = 1; i < candidates.length; i++) {
    const d = Math.hypot(lx - candidates[i].x, ly - candidates[i].y);
    if (d < bestDist) {
      bestDist = d;
      best = candidates[i];
    }
  }

  // Transform best local point back to world space
  const wx = (farm.x ?? 0) + best.x * cos - best.y * sin;
  const wy = (farm.y ?? 0) + best.x * sin + best.y * cos;

  return { x: round2(wx), y: round2(wy) };
}

/**
 * Returns logical water ports for supported objects:
 * - pipe: two endpoint ports (endA at -w/2, endB at +w/2 in local space)
 * - well: one source output port positioned near its opening: local (0, height * 0.1)
 * - tank: inlet port near top: local (0, -height * 0.42); outlet port near bottom: local (0, height * 0.45)
 * - farm: perimeter intake boundary
 * - other types (house, tree, road, etc.): []
 */
export function getWaterPorts(obj) {
  if (!obj || typeof obj !== "object" || typeof obj.type !== "string") {
    return [];
  }
  const { type, width = 0, height = 0, rotation = 0 } = obj;

  switch (type) {
    case "pipe": {
      const halfW = width / 2;
      const pA = transformLocalToWorld(obj, -halfW, 0);
      const pB = transformLocalToWorld(obj, halfW, 0);
      return [
        { id: "endA", kind: "endpoint", objectId: obj.id, x: pA.x, y: pA.y },
        { id: "endB", kind: "endpoint", objectId: obj.id, x: pB.x, y: pB.y },
      ];
    }

    case "well": {
      const pOut = transformLocalToWorld(obj, 0, round2(height * 0.1));
      return [
        { id: "output", kind: "output", objectId: obj.id, x: pOut.x, y: pOut.y },
      ];
    }

    case "tank": {
      const pIn = transformLocalToWorld(obj, 0, -round2(height * 0.42));
      const pOut = transformLocalToWorld(obj, 0, round2(height * 0.45));
      return [
        { id: "inlet", kind: "inlet", objectId: obj.id, x: pIn.x, y: pIn.y },
        { id: "outlet", kind: "outlet", objectId: obj.id, x: pOut.x, y: pOut.y },
      ];
    }

    case "farm": {
      return [
        {
          id: "intake",
          kind: "boundary",
          type: "boundary",
          objectId: obj.id,
          x: round2(obj.x ?? 0),
          y: round2(obj.y ?? 0),
          width,
          height,
          rotation: normalizeAngle(rotation),
        },
      ];
    }

    case "house": {
      const pIn = transformLocalToWorld(obj, -round2(width * 0.4), round2(height * 0.25));
      return [
        { id: "intake", kind: "intake", objectId: obj.id, x: pIn.x, y: pIn.y },
      ];
    }

    default:
      return [];
  }
}

/**
 * Builds a deterministic connectivity graph for water-capable objects.
 * Connections require Euclidean distance <= SNAP_TOLERANCE (16 units).
 * Pipe endpoints can connect to other pipe endpoints, well outputs, tank ports, or farm boundaries.
 * Internal edges connect pipe endA <-> endB and tank inlet <-> outlet.
 * Input document is never modified.
 */
export function buildWaterGraph(doc) {
  const objects = Array.isArray(doc?.objects) ? doc.objects : [];

  const wells = objects.filter((o) => o?.type === "well");
  const tanks = objects.filter((o) => o?.type === "tank");
  const pipes = objects.filter((o) => o?.type === "pipe");
  const farms = objects.filter((o) => o?.type === "farm");
  const houses = objects.filter((o) => o?.type === "house");
  const ignoredObjects = objects
    .filter((o) => !["well", "tank", "pipe", "farm", "house"].includes(o?.type))
    .map((o) => ({ id: o?.id, type: o?.type }));

  const nodes = {};
  const edges = [];

  // Register port nodes
  const registerNode = (nodeId, objectId, objectType, port) => {
    nodes[nodeId] = {
      id: nodeId,
      objectId,
      objectType,
      portId: port.id,
      kind: port.kind,
      x: port.x,
      y: port.y,
      connections: [],
    };
  };

  for (const w of wells) {
    for (const p of getWaterPorts(w)) {
      registerNode(`${w.id}:${p.id}`, w.id, "well", p);
    }
  }

  for (const t of tanks) {
    for (const p of getWaterPorts(t)) {
      registerNode(`${t.id}:${p.id}`, t.id, "tank", p);
    }
  }

  for (const p of pipes) {
    for (const port of getWaterPorts(p)) {
      registerNode(`${p.id}:${port.id}`, p.id, "pipe", port);
    }
  }

  for (const f of farms) {
    for (const p of getWaterPorts(f)) {
      registerNode(`${f.id}:${p.id}`, f.id, "farm", p);
    }
  }

  for (const h of houses) {
    for (const p of getWaterPorts(h)) {
      registerNode(`${h.id}:${p.id}`, h.id, "house", p);
    }
  }

  const addEdge = (uId, vId, distance, type) => {
    if (!nodes[uId] || !nodes[vId]) return;
    if (!nodes[uId].connections.includes(vId)) {
      nodes[uId].connections.push(vId);
    }
    if (!nodes[vId].connections.includes(uId)) {
      nodes[vId].connections.push(uId);
    }
    edges.push({ from: uId, to: vId, distance, type });
  };

  // 1. Internal edges
  // Pipe segments connect their two endpoints
  for (const p of pipes) {
    const u = `${p.id}:endA`;
    const v = `${p.id}:endB`;
    if (nodes[u] && nodes[v]) {
      addEdge(u, v, round2(p.width ?? 0), "internal");
    }
  }

  // Tank connects inlet and outlet
  for (const t of tanks) {
    const u = `${t.id}:inlet`;
    const v = `${t.id}:outlet`;
    if (nodes[u] && nodes[v]) {
      addEdge(u, v, euclideanDistance(nodes[u], nodes[v]), "internal");
    }
  }

  // 2. External edges: Pipe endpoints to other elements
  // Compare every pipe endpoint against:
  // a) other pipe endpoints
  for (let i = 0; i < pipes.length; i++) {
    const p1 = pipes[i];
    const ports1 = getWaterPorts(p1);
    for (let j = i + 1; j < pipes.length; j++) {
      const p2 = pipes[j];
      const ports2 = getWaterPorts(p2);
      for (const pt1 of ports1) {
        for (const pt2 of ports2) {
          const d = euclideanDistance(pt1, pt2);
          if (d <= SNAP_TOLERANCE) {
            addEdge(`${p1.id}:${pt1.id}`, `${p2.id}:${pt2.id}`, d, "external");
          }
        }
      }
    }
  }

  // b) pipe endpoints to well output
  for (const p of pipes) {
    const pPorts = getWaterPorts(p);
    for (const w of wells) {
      const wPorts = getWaterPorts(w);
      for (const pt of pPorts) {
        for (const wpt of wPorts) {
          const d = euclideanDistance(pt, wpt);
          if (d <= SNAP_TOLERANCE) {
            addEdge(`${w.id}:${wpt.id}`, `${p.id}:${pt.id}`, d, "external");
          }
        }
      }
    }
  }

  // c) pipe endpoints to tank ports
  for (const p of pipes) {
    const pPorts = getWaterPorts(p);
    for (const t of tanks) {
      const tPorts = getWaterPorts(t);
      for (const pt of pPorts) {
        for (const tpt of tPorts) {
          const d = euclideanDistance(pt, tpt);
          if (d <= SNAP_TOLERANCE) {
            addEdge(`${t.id}:${tpt.id}`, `${p.id}:${pt.id}`, d, "external");
          }
        }
      }
    }
  }

  // d) pipe endpoints to farm intake boundary
  for (const p of pipes) {
    const pPorts = getWaterPorts(p);
    for (const f of farms) {
      for (const pt of pPorts) {
        const d = distanceToFarmBoundary(f, pt.x, pt.y);
        if (d <= SNAP_TOLERANCE) {
          addEdge(`${p.id}:${pt.id}`, `${f.id}:intake`, d, "external");
        }
      }
    }
  }

  // e) pipe endpoints to house intake
  for (const p of pipes) {
    const pPorts = getWaterPorts(p);
    for (const h of houses) {
      const hPorts = getWaterPorts(h);
      for (const pt of pPorts) {
        for (const hpt of hPorts) {
          const d = euclideanDistance(pt, hpt);
          if (d <= SNAP_TOLERANCE) {
            addEdge(`${p.id}:${pt.id}`, `${h.id}:${hpt.id}`, d, "external");
          }
        }
      }
    }
  }

  // Ensure connections in each node are deterministically sorted
  for (const node of Object.values(nodes)) {
    node.connections.sort();
  }

  // Sort edges deterministically
  edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  return {
    nodes,
    edges,
    objects: {
      wells: wells.map((w) => ({ id: w.id })),
      tanks: tanks.map((t) => ({ id: t.id })),
      pipes: pipes.map((p) => ({ id: p.id })),
      farms: farms.map((f) => ({ id: f.id })),
      houses: houses.map((h) => ({ id: h.id })),
    },
    ignoredObjects,
  };
}

/**
 * Evaluates water network reachability from source wells to farms.
 *
 * Definition of `ok`:
 * `ok` is true iff:
 * - At least one well exists (sourceCount >= 1)
 * - All wells are connected to at least one pipe (no DISCONNECTED_WELL)
 * - At least one farm exists
 * - All farms in the document are reached from a well (reachesFarm === true)
 * - Zero validation errors are present (errors.length === 0)
 *
 * Disconnected pipes are reported in warnings and summary without blocking `ok`
 * unless they cause farm unreachability.
 */
export function evaluateWaterNetwork(doc) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.objects)) {
    return {
      ok: false,
      sourceCount: 0,
      pipesConnected: 0,
      reachesFarm: false,
      housesCount: 0,
      housesConnected: 0,
      householdTargetMet: false,
      connectedHouseIds: [],
      unreachedHouseIds: [],
      householdDiagnostics: [],
      errors: [{ code: "INVALID_DOCUMENT", message: "Document is missing or has invalid objects." }],
      warnings: [],
      summary: {
        wellsTotal: 0,
        wellsConnected: 0,
        farmsTotal: 0,
        farmsReached: 0,
        tanksTotal: 0,
        tanksConnected: 0,
        pipesTotal: 0,
        pipesConnected: 0,
        housesTotal: 0,
        housesConnected: 0,
        connectedHouseIds: [],
        unreachedHouseIds: [],
        householdTargetMet: false,
        householdDiagnostics: [],
        disconnectedPipeIds: [],
        unreachedFarmIds: [],
        disconnectedWellIds: [],
      },
      graph: { nodes: {}, edges: [], objects: { wells: [], tanks: [], pipes: [], farms: [], houses: [] }, ignoredObjects: [] },
    };
  }

  const graph = buildWaterGraph(doc);
  const errors = [];
  const warnings = [];

  const wells = graph.objects.wells;
  const farms = graph.objects.farms;
  const pipes = graph.objects.pipes;
  const tanks = graph.objects.tanks;

  // 1. Check for missing well
  if (wells.length === 0) {
    errors.push({
      code: "MISSING_WELL",
      message: "Your village needs a well to supply water.",
    });
  }

  // 2. Check for missing farm
  if (farms.length === 0) {
    errors.push({
      code: "MISSING_FARM",
      message: "Your village needs a farm to receive water.",
    });
  }

  // 3. Check for disconnected wells
  const disconnectedWellIds = [];
  for (const w of wells) {
    const outNode = graph.nodes[`${w.id}:output`];
    // Must connect to at least one pipe endpoint
    const hasPipeConnection = outNode?.connections.some((cId) => graph.nodes[cId]?.objectType === "pipe");
    if (!hasPipeConnection) {
      disconnectedWellIds.push(w.id);
      errors.push({
        code: "DISCONNECTED_WELL",
        wellId: w.id,
        message: `Well "${w.id}" is not connected to any pipe.`,
      });
    }
  }

  // 4. BFS Traversal starting from all connected wells
  const visitedNodes = new Set();
  const queue = [];

  const connectedWellIds = wells.map((w) => w.id).filter((id) => !disconnectedWellIds.includes(id));
  connectedWellIds.sort();

  for (const wId of connectedWellIds) {
    const outNodeId = `${wId}:output`;
    visitedNodes.add(outNodeId);
    queue.push(outNodeId);
  }

  while (queue.length > 0) {
    const currId = queue.shift();
    const currNode = graph.nodes[currId];
    if (!currNode) continue;

    for (const nextId of currNode.connections) {
      if (!visitedNodes.has(nextId)) {
        visitedNodes.add(nextId);
        queue.push(nextId);
      }
    }
  }

  // 5. Gather reached objects
  const reachedObjectIds = new Set();
  for (const nodeId of visitedNodes) {
    const n = graph.nodes[nodeId];
    if (n?.objectId) {
      reachedObjectIds.add(n.objectId);
    }
  }

  const reachedPipes = pipes.filter((p) => reachedObjectIds.has(p.id));
  const disconnectedPipes = pipes.filter((p) => !reachedObjectIds.has(p.id));
  const disconnectedPipeIds = disconnectedPipes.map((p) => p.id).sort();

  const reachedFarms = farms.filter((f) => reachedObjectIds.has(f.id));
  const unreachedFarms = farms.filter((f) => !reachedObjectIds.has(f.id));
  const unreachedFarmIds = unreachedFarms.map((f) => f.id).sort();

  const reachedTanks = tanks.filter((t) => reachedObjectIds.has(t.id));
  const disconnectedTanks = tanks.filter((t) => !reachedObjectIds.has(t.id));

  // 6. Report unreached farms
  for (const fId of unreachedFarmIds) {
    errors.push({
      code: "FARM_UNREACHABLE",
      farmId: fId,
      message: `The farm "${fId}" is not receiving water from a well.`,
    });
  }

  // 7. Report disconnected pipes
  for (const pId of disconnectedPipeIds) {
    warnings.push({
      code: "PIPE_DISCONNECTED",
      pipeId: pId,
      message: `Pipe "${pId}" is not connected to the water network.`,
    });
  }

  // 8. Report disconnected tanks
  for (const t of disconnectedTanks) {
    warnings.push({
      code: "TANK_DISCONNECTED",
      tankId: t.id,
      message: `Tank "${t.id}" is not connected to the water network.`,
    });
  }

  // 9. Gather reached and unreached houses
  const houses = graph.objects.houses || [];
  const reachedHouses = houses.filter((h) => reachedObjectIds.has(h.id));
  const unreachedHouses = houses.filter((h) => !reachedObjectIds.has(h.id));
  const connectedHouseIds = reachedHouses.map((h) => h.id).sort();
  const unreachedHouseIds = unreachedHouses.map((h) => h.id).sort();
  const householdTargetMet = reachedHouses.length >= 4;

  const householdDiagnostics = unreachedHouseIds.map((hId) => ({
    code: "HOUSE_NOT_CONNECTED",
    houseId: hId,
    message: `House "${hId}" is not receiving water from a well.`,
  }));

  const reachesFarm = farms.length > 0 && unreachedFarmIds.length === 0;
  const ok = Boolean(wells.length > 0 && reachesFarm && errors.length === 0);

  return {
    ok,
    sourceCount: wells.length,
    pipesConnected: reachedPipes.length,
    reachesFarm,
    housesCount: houses.length,
    housesConnected: reachedHouses.length,
    householdTargetMet,
    connectedHouseIds,
    unreachedHouseIds,
    householdDiagnostics,
    errors,
    warnings,
    summary: {
      wellsTotal: wells.length,
      wellsConnected: connectedWellIds.length,
      farmsTotal: farms.length,
      farmsReached: reachedFarms.length,
      tanksTotal: tanks.length,
      tanksConnected: reachedTanks.length,
      pipesTotal: pipes.length,
      pipesConnected: reachedPipes.length,
      housesTotal: houses.length,
      housesConnected: reachedHouses.length,
      connectedHouseIds,
      unreachedHouseIds,
      householdTargetMet,
      householdDiagnostics,
      disconnectedPipeIds,
      unreachedFarmIds,
      disconnectedWellIds,
    },
    graph,
  };
}
