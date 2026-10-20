// Pure data model generator for the World Builder water-port overlay.
// Translates document state and water-graph connectivity into visual indicator descriptors.
// Pure JavaScript: zero React, zero DOM, zero document mutation.

import {
  SNAP_TOLERANCE,
  buildWaterGraph,
  closestPointOnFarmBoundary,
} from "./waterNetwork.js";

/**
 * Derives visual overlay data for the canvas from doc, selection state, and optional route highlight.
 * All positions and connection states are derived strictly from buildWaterGraph.
 */
export function getWaterOverlayData(doc, selectedId = null, options = {}) {
  const highlightSet =
    Array.isArray(options?.highlightedObjectIds) || options?.highlightedObjectIds instanceof Set
      ? new Set(options.highlightedObjectIds)
      : null;

  if (!doc || typeof doc !== "object" || !Array.isArray(doc.objects)) {
    return {
      active: false,
      totalWaterObjects: 0,
      discretePorts: [],
      connections: [],
      farmBoundaries: [],
      farmContacts: [],
      pointerEvents: "none",
    };
  }

  const graph = buildWaterGraph(doc);

  const totalWaterObjects =
    graph.objects.wells.length +
    graph.objects.tanks.length +
    graph.objects.pipes.length +
    graph.objects.farms.length;

  if (totalWaterObjects === 0) {
    return {
      active: false,
      totalWaterObjects: 0,
      discretePorts: [],
      connections: [],
      farmBoundaries: [],
      farmContacts: [],
      pointerEvents: "none",
    };
  }

  // Find all external edges
  const externalEdges = graph.edges.filter((e) => e.type === "external");

  // Determine connected nodes from external edges
  const connectedNodeIds = new Set();
  for (const e of externalEdges) {
    connectedNodeIds.add(e.from);
    connectedNodeIds.add(e.to);
  }

  // Discrete ports (pipe endpoints, well output, tank ports)
  const discretePorts = Object.values(graph.nodes)
    .filter((n) => n.kind !== "boundary" && n.objectType !== "house")
    .map((n) => ({
      id: n.id,
      objectId: n.objectId,
      objectType: n.objectType,
      portId: n.portId,
      kind: n.kind,
      x: n.x,
      y: n.y,
      connected: connectedNodeIds.has(n.id),
      selected: n.objectId === selectedId,
      highlighted: highlightSet ? highlightSet.has(n.objectId) : false,
    }));

  // Connection bridges between discrete ports
  const connections = [];
  const farmContacts = [];

  for (const e of externalEdges) {
    const u = graph.nodes[e.from];
    const v = graph.nodes[e.to];
    if (!u || !v) continue;

    if (u.kind !== "boundary" && v.kind !== "boundary") {
      const isHighlighted = highlightSet
        ? highlightSet.has(u.objectId) && highlightSet.has(v.objectId)
        : false;
      connections.push({
        key: `${e.from}-${e.to}`,
        from: { x: u.x, y: u.y, id: u.id, objectType: u.objectType },
        to: { x: v.x, y: v.y, id: v.id, objectType: v.objectType },
        distance: e.distance,
        highlighted: isHighlighted,
      });
    } else {
      // Pipe to Farm intake connection
      const pipeNode = u.objectType === "farm" ? v : u;
      const farmNode = u.objectType === "farm" ? u : v;
      const farmObj = doc.objects.find((o) => o?.id === farmNode.objectId);
      if (farmObj && pipeNode) {
        const contactPt = closestPointOnFarmBoundary(farmObj, pipeNode.x, pipeNode.y);
        const isHighlighted = highlightSet
          ? highlightSet.has(pipeNode.objectId) && highlightSet.has(farmObj.id)
          : false;
        farmContacts.push({
          key: `${e.from}-${e.to}`,
          pipeNode: { id: pipeNode.id, objectId: pipeNode.objectId, x: pipeNode.x, y: pipeNode.y },
          contactPoint: contactPt,
          farmId: farmObj.id,
          distance: e.distance,
          highlighted: isHighlighted,
        });
      }
    }
  }

  // Farm perimeter boundaries
  const farmObjects = doc.objects.filter((o) => o?.type === "farm");
  const farmBoundaries = farmObjects.map((f) => ({
    id: f.id,
    x: f.x ?? 0,
    y: f.y ?? 0,
    width: f.width ?? 0,
    height: f.height ?? 0,
    rotation: f.rotation ?? 0,
    connected: connectedNodeIds.has(`${f.id}:intake`),
    selected: f.id === selectedId,
    highlighted: highlightSet ? highlightSet.has(f.id) : false,
  }));

  return {
    active: true,
    totalWaterObjects,
    discretePorts,
    connections,
    farmBoundaries,
    farmContacts,
    pointerEvents: "none",
  };
}
