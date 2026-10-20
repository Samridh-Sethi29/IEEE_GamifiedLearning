// Water network connectivity trial model for World Builder ("Test Village").
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Evaluates whether water from a well can reach village farms through a connected pipe network.
// Pure trial evaluation: strictly distinct from complete village mission validation.

import { evaluateWaterNetwork } from "./waterNetwork.js";
import { isDocModified } from "./waterStatusModel.js";

/**
 * Runs the Test Village connectivity trial on the given document.
 * Returns a child-friendly, structured trial report.
 * Does not mutate doc.
 */
export function runVillageTrial(doc) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.objects)) {
    return {
      ok: false,
      status: "needs-attention",
      title: "Water Connectivity Trial: Needs Attention",
      subtitle: "Water connectivity test — not complete mission validation.",
      summary: "Invalid village layout.",
      blockingIssue: "The village workspace could not be read.",
      nextSteps: ["Open the village workspace to begin designing."],
      stats: {
        wellsTotal: 0,
        wellsConnected: 0,
        pipesTotal: 0,
        pipesConnected: 0,
        tanksTotal: 0,
        tanksConnected: 0,
        farmsTotal: 0,
        farmsReached: 0,
        housesTotal: 0,
        housesConnected: 0,
        householdTargetMet: false,
      },
      households: {
        total: 0,
        connected: 0,
        targetMet: false,
        target: 4,
        connectedHouseIds: [],
        unreachedHouseIds: [],
        diagnostics: [],
      },
      participatingIds: [],
      warnings: [],
      timestamp: Date.now(),
      evaluation: null,
    };
  }

  const evaluation = evaluateWaterNetwork(doc);
  const { ok, errors, warnings, summary, graph } = evaluation;

  // Gather object IDs that actively participate in the connected water route
  const participatingIds = [];
  if (graph?.objects) {
    // 1. Connected wells
    for (const w of graph.objects.wells) {
      if (!summary.disconnectedWellIds.includes(w.id)) {
        participatingIds.push(w.id);
      }
    }
    // 2. Connected pipes (pipes reached from connected wells)
    for (const p of graph.objects.pipes) {
      if (!summary.disconnectedPipeIds.includes(p.id)) {
        participatingIds.push(p.id);
      }
    }
    // 3. Connected tanks (tanks reached from connected wells)
    for (const t of graph.objects.tanks) {
      const isDisconnected = warnings.some(
        (warn) => warn.code === "TANK_DISCONNECTED" && warn.tankId === t.id
      );
      if (!isDisconnected) {
        participatingIds.push(t.id);
      }
    }
    // 4. Reached farms
    for (const f of graph.objects.farms) {
      if (!summary.unreachedFarmIds.includes(f.id)) {
        participatingIds.push(f.id);
      }
    }
    // 5. Reached houses
    if (graph.objects.houses) {
      for (const h of graph.objects.houses) {
        if (!summary.unreachedHouseIds?.includes(h.id)) {
          participatingIds.push(h.id);
        }
      }
    }
  }

  const stats = {
    wellsTotal: summary.wellsTotal,
    wellsConnected: summary.wellsConnected,
    pipesTotal: summary.pipesTotal,
    pipesConnected: summary.pipesConnected,
    tanksTotal: summary.tanksTotal,
    tanksConnected: summary.tanksConnected,
    farmsTotal: summary.farmsTotal,
    farmsReached: summary.farmsReached,
    housesTotal: summary.housesTotal ?? 0,
    housesConnected: summary.housesConnected ?? 0,
    householdTargetMet: summary.householdTargetMet ?? false,
  };

  const households = {
    total: summary.housesTotal ?? 0,
    connected: summary.housesConnected ?? 0,
    targetMet: summary.householdTargetMet ?? false,
    target: 4,
    connectedHouseIds: summary.connectedHouseIds ?? [],
    unreachedHouseIds: summary.unreachedHouseIds ?? [],
    diagnostics: summary.householdDiagnostics ?? [],
  };

  const warningTexts = warnings.map((w) => w.message);

  if (ok) {
    const hasTank = summary.tanksConnected > 0;
    const summaryText = hasTank
      ? "Water successfully flows from the well, through the storage tank, and reaches the village farm!"
      : "Water successfully travels through the connected pipe network from the well to the farm!";

    const nextSteps = [];
    if (warnings.length > 0) {
      for (const w of warnings) {
        nextSteps.push(w.message);
      }
    } else {
      nextSteps.push("All water equipment is connected and working together properly.");
    }

    return {
      ok: true,
      status: "pass",
      title: "Water Connectivity Trial: Passed!",
      subtitle: "Water connectivity test confirmed — full village simulation checks households, reserve, and budget.",
      summary: summaryText,
      blockingIssue: null,
      nextSteps,
      stats,
      households,
      participatingIds: participatingIds.sort(),
      warnings: warningTexts,
      timestamp: Date.now(),
      evaluation,
    };
  }

  // Failed / Needs Attention
  let blockingIssue = "Water cannot reach the village farm yet.";
  const nextSteps = [];

  if (doc.objects.length === 0) {
    blockingIssue = "Your village workspace is empty.";
    nextSteps.push("Pick a Well from the palette to supply water.");
    nextSteps.push("Add Pipes to carry water across the village.");
    nextSteps.push("Place a Farm to receive water.");
  } else if (errors.some((e) => e.code === "MISSING_WELL")) {
    blockingIssue = "Your village needs a well to supply water.";
    nextSteps.push("Place a well from the palette to provide water for the village.");
  } else if (errors.some((e) => e.code === "MISSING_FARM")) {
    blockingIssue = "Your village needs a farm to receive water.";
    nextSteps.push("Place a farm from the palette that needs water.");
  } else if (errors.some((e) => e.code === "DISCONNECTED_WELL")) {
    const wellErr = errors.find((e) => e.code === "DISCONNECTED_WELL");
    blockingIssue = wellErr ? wellErr.message : "The well is not connected to any pipe.";
    nextSteps.push("Connect a pipe endpoint within 16 units of the well opening.");
  } else if (errors.some((e) => e.code === "FARM_UNREACHABLE")) {
    blockingIssue = "Water from the well cannot reach the farm.";
    if (summary.disconnectedPipeIds.length > 0) {
      nextSteps.push(`${summary.disconnectedPipeIds.length} pipe(s) are disconnected. Reconnect the separated pipe sections.`);
    } else {
      nextSteps.push("Connect pipes all the way from the well to the farm boundary.");
    }
  }

  if (nextSteps.length === 0) {
    nextSteps.push("Check that pipes form an unbroken line from well to farm.");
  }

  return {
    ok: false,
    status: "needs-attention",
    title: "Water Connectivity Trial: Needs Attention",
    subtitle: "Water connectivity test only — full village simulation checks households, reserve, and budget.",
    summary: "Water cannot travel from the well to the farm yet.",
    blockingIssue,
    nextSteps,
    stats,
    households,
    participatingIds: participatingIds.sort(),
    warnings: warningTexts,
    timestamp: Date.now(),
    evaluation,
  };
}

/**
 * Checks whether the document has been modified since the trial was evaluated.
 */
export function isTrialStale(lastEvaluatedDoc, currentDoc) {
  return isDocModified(lastEvaluatedDoc, currentDoc);
}
