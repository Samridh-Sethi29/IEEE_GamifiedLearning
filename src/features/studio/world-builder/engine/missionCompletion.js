// World Builder mission completion rules for the "Save Our Village" mission.
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Evaluates completion eligibility based on authoritative mission requirements.
//
// Eligibility Evaluation only:
// - Evaluates whether a village design satisfies all configured mission requirements.
// - Never awards rewards, XP, coins, achievements, or progression changes.
// - Never marks a mission as complete in saved documents or player profile.
// - Does not infer actual water volumes or capacities from graph connectivity or object counts.

import { MISSION } from "../data/mission.js";
import { evaluateMissionReadiness } from "./missionReadiness.js";
import {
  getMissionDailyWaterSupply,
  getMissionMinimumReserve,
} from "./waterReserve.js";
import { getConstructionBudgetLimit } from "./constructionBudget.js";

/**
 * Returns the authoritative mission completion thresholds sourced from configuration.
 *
 * @returns {object} Authoritative completion thresholds
 */
export function getMissionCompletionThresholds() {
  return {
    households:
      MISSION?.objectives?.find((o) => o.id === "households")?.target ?? 4,
    budgetLimit: getConstructionBudgetLimit(),
    budgetLimitUnit: "mission coins",
    dailySupply: getMissionDailyWaterSupply(),
    dailySupplyUnit: "litres per day",
    minimumReserve: getMissionMinimumReserve(),
    minimumReserveUnit: "litres",
    farmTarget:
      MISSION?.objectives?.find((o) => o.id === "farm")?.target ?? 1,
    wellTarget:
      MISSION?.objectives?.find((o) => o.id === "well")?.target ?? 1,
  };
}

/**
 * Evaluates whether a World Builder village design is eligible for completion.
 * Reuses evaluateMissionReadiness as the authoritative combined evaluator.
 *
 * Eligibility requires ALL 5 conditions to be explicitly satisfied:
 * 1. Water Network: Well-to-farm connection passes.
 * 2. Households: At least 4 connected households receiving water.
 * 3. Budget: Construction cost within the 100-coin limit.
 * 4. Daily Water: Planned supply meets or exceeds the 100 L/day requirement AND satisfies daily demand.
 * 5. Reserve: Available reserve meets or exceeds the 10 L minimum.
 *
 * If any requirement fails or is unknown/unconfigured, completion remains ineligible.
 *
 * @param {object} doc - Studio project document
 * @param {object} [waterInputs] - Explicit numeric water planning inputs
 * @param {number} [waterInputs.dailySupplyLitres] - Planned daily water supply in L/day
 * @param {number} [waterInputs.dailyDemandLitres] - Planned daily water demand in L/day
 * @param {number} [waterInputs.availableReserveLitres] - Stored water reserve volume in L
 * @param {number} [waterInputs.minimumReserveLitres] - Minimum required reserve in L
 * @param {number} [waterInputs.storedCapacityLitres] - Stored tank capacity in L
 * @returns {object} Deterministic mission completion eligibility report
 */
export function evaluateMissionCompletion(doc, waterInputs = {}) {
  // Reuse authoritative combined evaluator
  const readiness = evaluateMissionReadiness(doc, waterInputs);

  const thresholds = getMissionCompletionThresholds();
  const reqs = { ...readiness.requirements };

  const passedRequirements = [...readiness.passedRequirements];
  const failedRequirements = [...readiness.failedRequirements];
  const unknownRequirements = [...readiness.unknownRequirements];

  // Specific check: Daily supply must meet or exceed the mission threshold (100 L/day)
  // in addition to satisfying planned daily demand.
  const dailySupply = reqs.dailyWater?.actual;
  const supplyBelowRequirement =
    typeof dailySupply === "number" && dailySupply < thresholds.dailySupply;

  if (supplyBelowRequirement) {
    const shortfall = thresholds.dailySupply - dailySupply;
    const supplyDiagnostic = `Daily water supply (${dailySupply} L/day) is below the configured mission requirement of ${thresholds.dailySupply} L/day by ${shortfall} L/day.`;

    reqs.dailyWater = {
      ...reqs.dailyWater,
      status: "fail",
      targetMet: false,
      diagnostics: [supplyDiagnostic, ...reqs.dailyWater.diagnostics],
      details: {
        ...reqs.dailyWater.details,
        shortfallLitres: Math.max(reqs.dailyWater.details.shortfallLitres || 0, shortfall),
      },
    };

    const passIdx = passedRequirements.indexOf("dailyWater");
    if (passIdx !== -1) {
      passedRequirements.splice(passIdx, 1);
    }
    if (!failedRequirements.includes("dailyWater")) {
      failedRequirements.push("dailyWater");
    }
  }

  // Determine completion eligibility
  const eligibleForCompletion =
    failedRequirements.length === 0 &&
    unknownRequirements.length === 0 &&
    readiness.ready === true &&
    !supplyBelowRequirement;

  // Determine overall completion status
  let overallStatus = "eligible";
  if (failedRequirements.length > 0) {
    overallStatus = "needs-attention";
  } else if (unknownRequirements.length > 0) {
    overallStatus = "incomplete";
  }

  // Construct actionable remaining tasks
  const remainingTasks = [];

  // 1. Water Network tasks
  if (reqs.waterNetwork.status !== "pass") {
    if (reqs.waterNetwork.details.wellsTotal === 0) {
      remainingTasks.push("Place at least one well in the village.");
    } else if (reqs.waterNetwork.details.wellsConnected === 0) {
      remainingTasks.push("Connect pipes to the well to start the water network.");
    } else if (reqs.waterNetwork.details.farmsTotal === 0) {
      remainingTasks.push("Place at least one farm plot in the village.");
    } else if (!reqs.waterNetwork.details.reachesFarm) {
      remainingTasks.push("Connect pipes between the well and a farm plot intake.");
    } else {
      remainingTasks.push("Resolve water network errors so water flows to the farm.");
    }
  }

  // 2. Household tasks
  if (reqs.households.status !== "pass") {
    const shortfall = reqs.households.details.shortfall;
    remainingTasks.push(
      `Connect ${shortfall} more household(s) to reach the ${thresholds.households}-household target.`
    );
  }

  // 3. Budget tasks
  if (reqs.budget.status !== "pass") {
    const shortfall = reqs.budget.details.shortfall;
    remainingTasks.push(
      `Reduce village construction cost by ${shortfall} coins to stay within the ${thresholds.budgetLimit}-coin budget.`
    );
  }

  // 4. Daily Water tasks
  if (reqs.dailyWater.status === "unknown") {
    if (reqs.dailyWater.details.dailySupplyLitres === null && reqs.dailyWater.details.dailyDemandLitres === null) {
      remainingTasks.push("Enter planned daily water supply and demand to evaluate water flow balance.");
    } else if (reqs.dailyWater.details.dailySupplyLitres === null) {
      remainingTasks.push("Enter planned daily water supply in litres per day.");
    } else {
      remainingTasks.push("Enter planned daily water demand in litres per day.");
    }
  } else if (reqs.dailyWater.status === "fail") {
    if (supplyBelowRequirement) {
      const shortfall = thresholds.dailySupply - dailySupply;
      remainingTasks.push(
        `Increase daily water supply by ${shortfall} L/day to meet the ${thresholds.dailySupply} L/day mission requirement.`
      );
    } else {
      remainingTasks.push(
        `Increase daily water supply or reduce demand to cover the ${reqs.dailyWater.details.shortfallLitres} L/day shortfall.`
      );
    }
  }

  // 5. Reserve tasks
  if (reqs.reserve.status === "unknown") {
    remainingTasks.push("Enter available water reserve volume in litres.");
  } else if (reqs.reserve.status === "fail") {
    const shortfall = reqs.reserve.details.shortfallLitres;
    remainingTasks.push(
      `Increase stored water reserve by ${shortfall} L to meet the ${thresholds.minimumReserve} L minimum reserve requirement.`
    );
  }

  // Readable summary
  let summary = "All mission requirements are satisfied. The village is eligible for completion.";
  if (overallStatus === "needs-attention") {
    summary = `The village is not eligible for completion: ${failedRequirements.length} requirement(s) need attention.`;
  } else if (overallStatus === "incomplete") {
    summary = `The village is not eligible for completion: ${unknownRequirements.length} requirement(s) have unknown or unconfigured values.`;
  }

  return {
    eligibleForCompletion,
    overallStatus,
    summary,
    remainingTasks,
    passedRequirements,
    failedRequirements,
    unknownRequirements,
    requirements: reqs,
    thresholds,
    readiness,
  };
}
