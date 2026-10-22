// Pure evaluation and presentation data model for the World Builder Water Status Inspector.
// Bridges evaluateWaterNetwork results into child-friendly statuses, checklists, and diagnostics.
// Pure JavaScript: zero React, zero DOM, and zero document mutation.

import { evaluateWaterNetwork } from "./waterNetwork.js";

/**
 * Derives child-friendly messages for school-age players from evaluation errors and warnings.
 * Only outputs messages supported by the actual evaluation result.
 */
export function getWaterStatusMessages(evaluation) {
  if (!evaluation || typeof evaluation !== "object") return [];
  const msgs = [];

  if (evaluation.ok) {
    msgs.push({ kind: "success", text: "Water can reach your farm!" });
    if (Array.isArray(evaluation.warnings)) {
      if (evaluation.warnings.some((w) => w.code === "PIPE_DISCONNECTED")) {
        msgs.push({ kind: "warning", text: "Some pipes are not connected to the water system." });
      }
      if (evaluation.warnings.some((w) => w.code === "TANK_DISCONNECTED")) {
        msgs.push({ kind: "warning", text: "Water tank is not connected to the network." });
      }
    }
    return msgs;
  }

  const errors = Array.isArray(evaluation.errors) ? evaluation.errors : [];
  const warnings = Array.isArray(evaluation.warnings) ? evaluation.warnings : [];
  const codes = new Set(errors.map((e) => e.code));

  if (codes.has("MISSING_WELL")) {
    msgs.push({ kind: "error", text: "Place a well to provide water." });
  }
  if (codes.has("DISCONNECTED_WELL")) {
    msgs.push({ kind: "error", text: "Connect a pipe to the well." });
  }
  if (codes.has("MISSING_FARM")) {
    msgs.push({ kind: "error", text: "Place a farm to receive water." });
  }
  if (codes.has("FARM_UNREACHABLE")) {
    msgs.push({ kind: "error", text: "Your farm is not receiving water yet." });
  }

  if (warnings.some((w) => w.code === "PIPE_DISCONNECTED")) {
    msgs.push({ kind: "warning", text: "Some pipes are not connected to the water system." });
  }
  if (warnings.some((w) => w.code === "TANK_DISCONNECTED")) {
    msgs.push({ kind: "warning", text: "Water tank is not connected to the network." });
  }

  if (codes.has("INVALID_DOCUMENT")) {
    msgs.push({ kind: "error", text: "Village layout is invalid or missing objects." });
  }

  return msgs;
}

/**
 * Builds structured checklist items reflecting the water network's key subsystems.
 */
export function getWaterStatusChecklist(evaluation) {
  if (!evaluation || !evaluation.summary) {
    return [
      { id: "source", label: "Water Source", ok: false, detail: "No well placed in village." },
      { id: "well_connection", label: "Well Connected", ok: false, detail: "Needs a well first." },
      { id: "pipes", label: "Pipes", ok: false, detail: "No pipes placed." },
      { id: "farm_delivery", label: "Farm Delivery", ok: false, detail: "No farm placed in village." },
    ];
  }

  const s = evaluation.summary;
  const hasWell = s.wellsTotal > 0;
  const wellConnected = hasWell && s.wellsConnected > 0 && s.disconnectedWellIds.length === 0;
  const hasPipes = s.pipesTotal > 0;
  const pipesOk = hasPipes && s.pipesConnected > 0 && s.disconnectedPipeIds.length === 0;
  const hasFarm = s.farmsTotal > 0;
  const farmReached = hasFarm && s.farmsReached === s.farmsTotal;

  return [
    {
      id: "source",
      label: "Water Source",
      ok: hasWell,
      detail: hasWell
        ? `${s.wellsTotal} well${s.wellsTotal > 1 ? "s" : ""} in village.`
        : "No well placed in village.",
    },
    {
      id: "well_connection",
      label: "Well Connected",
      ok: wellConnected,
      detail: !hasWell
        ? "Needs a well first."
        : s.disconnectedWellIds.length > 0
        ? "Well is not connected to any pipe."
        : "Well is connected to the pipe network.",
    },
    {
      id: "pipes",
      label: "Pipes",
      ok: pipesOk,
      detail: !hasPipes
        ? "No pipes placed."
        : s.disconnectedPipeIds.length > 0
        ? `${s.disconnectedPipeIds.length} pipe(s) not connected to water source.`
        : "All pipes connected to water network.",
    },
    {
      id: "farm_delivery",
      label: "Farm Delivery",
      ok: farmReached,
      detail: !hasFarm
        ? "No farm placed in village."
        : farmReached
        ? "Water reaches all farms."
        : "Farm is not receiving water yet.",
    },
  ];
}

/**
 * Evaluates the full document and builds a comprehensive status report for the inspector.
 * Never mutates doc.
 */
export function getWaterStatus(doc) {
  const evaluation = evaluateWaterNetwork(doc);
  const status = evaluation.ok ? "connected" : "attention";
  const statusLabel = evaluation.ok ? "Water System Connected" : "Needs Attention";
  const summaryText = evaluation.ok
    ? "Water can reach your farm!"
    : "Water cannot reach the village farm yet.";

  return {
    evaluation,
    status,
    statusLabel,
    summaryText,
    messages: getWaterStatusMessages(evaluation),
    checklist: getWaterStatusChecklist(evaluation),
  };
}

/**
 * Returns concise water-connection status for the currently selected object.
 * Strictly limited to water-capable objects: well, pipe, tank, farm.
 * Returns null for house, tree, road, sandbox objects, or when no object is selected.
 */
export function getSelectedWaterStatus(doc, selectedId, evaluation = null) {
  if (!doc || !selectedId || !Array.isArray(doc.objects)) return null;
  const obj = doc.objects.find((o) => o?.id === selectedId);
  if (!obj || !["well", "pipe", "tank", "farm"].includes(obj.type)) return null;

  const ev = evaluation || evaluateWaterNetwork(doc);
  const s = ev.summary;

  switch (obj.type) {
    case "well": {
      const isDisconnected = s.disconnectedWellIds?.includes(obj.id) ?? true;
      const connected = !isDisconnected;
      return {
        id: obj.id,
        type: "well",
        label: "Water Well",
        connected,
        status: connected ? "Connected to pipe network" : "Not connected to any pipe",
        detail: connected
          ? "Supplying water to connected pipes."
          : "Connect a pipe endpoint within 16 units of the well opening.",
      };
    }

    case "pipe": {
      const isDisconnected = s.disconnectedPipeIds?.includes(obj.id) ?? true;
      const connected = !isDisconnected;
      return {
        id: obj.id,
        type: "pipe",
        label: "Water Pipe",
        connected,
        status: connected ? "Connected to water system" : "Not connected to water source",
        detail: connected
          ? "Carrying water through the network."
          : "Connect this pipe to a well or connected pipe network.",
      };
    }

    case "tank": {
      const isDisconnected = ev.warnings?.some(
        (w) => w.code === "TANK_DISCONNECTED" && w.tankId === obj.id
      ) ?? true;
      const connected = !isDisconnected;
      return {
        id: obj.id,
        type: "tank",
        label: "Water Tank",
        connected,
        status: connected ? "Connected to water system" : "Not connected to water source",
        detail: connected
          ? "Water flows through the tank."
          : "Connect inlet and outlet to the water network.",
      };
    }

    case "farm": {
      const isUnreached = s.unreachedFarmIds?.includes(obj.id) ?? true;
      const connected = !isUnreached;
      return {
        id: obj.id,
        type: "farm",
        label: "Village Farm",
        connected,
        status: connected ? "Receiving water from well" : "Not receiving water",
        detail: connected
          ? "Water successfully reaches this farm."
          : "Connect a pipe from the well network to the farm boundary.",
      };
    }

    default:
      return null;
  }
}

/**
 * Checks whether the document has been modified since the last evaluation.
 */
export function isDocModified(lastEvaluatedDoc, currentDoc) {
  if (!lastEvaluatedDoc || !currentDoc) return true;
  if (lastEvaluatedDoc === currentDoc) return false;

  const objsA = Array.isArray(lastEvaluatedDoc.objects) ? lastEvaluatedDoc.objects : [];
  const objsB = Array.isArray(currentDoc.objects) ? currentDoc.objects : [];
  if (objsA.length !== objsB.length) return true;

  // Check object ids, types, transforms, and props
  for (let i = 0; i < objsA.length; i++) {
    const a = objsA[i];
    const b = objsB[i];
    if (a.id !== b.id || a.type !== b.type || a.x !== b.x || a.y !== b.y) return true;
    if (a.width !== b.width || a.height !== b.height || a.rotation !== b.rotation) return true;
    if (JSON.stringify(a.props) !== JSON.stringify(b.props)) return true;
  }

  return false;
}
