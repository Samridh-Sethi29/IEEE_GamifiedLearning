// World Builder mission readiness evaluator for the "Save Our Village" mission.
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Integrates water-network connectivity, household connectivity, construction budget,
// and water-reserve calculations into a structured, unified readiness assessment.
//
// Readiness Assessment only:
// - Never awards rewards, XP, coins, or progression changes.
// - Never persists readiness results to saved documents or player profile.
// - Does not infer water volumes or capacities from graph connectivity or object counts.

import { MISSION } from "../data/mission.js";
import { evaluateWaterNetwork } from "./waterNetwork.js";
import { evaluateConstructionBudget, getConstructionBudgetLimit } from "./constructionBudget.js";
import {
  evaluateWaterBalance,
  getMissionDailyWaterSupply,
  getMissionMinimumReserve,
  UNCONFIGURED_BALANCING_PARAMETERS,
} from "./waterReserve.js";

/**
 * Evaluates the mission readiness of a World Builder village design against all 5 mission requirements:
 * 1. Water Network Connectivity (well connected and reaches farm)
 * 2. Household Water Supply (at least 4 connected households)
 * 3. Construction Budget (total cost within 100 mission coins)
 * 4. Daily Water Supply & Demand (daily supply meets daily demand)
 * 5. Water Reserve Storage (stored water meets 10 L minimum reserve)
 *
 * @param {object} doc - Studio project document
 * @param {object} [waterInputs] - Explicit numeric water planning inputs
 * @param {number} [waterInputs.dailySupplyLitres] - Planned daily water supply in L/day
 * @param {number} [waterInputs.dailyDemandLitres] - Daily water demand in L/day
 * @param {number} [waterInputs.availableReserveLitres] - Stored water reserve volume in L
 * @param {number} [waterInputs.minimumReserveLitres] - Minimum required reserve in L (defaults to mission 10 L)
 * @param {number} [waterInputs.storedCapacityLitres] - Stored tank capacity in L
 * @returns {object} Comprehensive mission readiness report
 */
export function evaluateMissionReadiness(doc, waterInputs = {}) {
  const safeWaterInputs = waterInputs && typeof waterInputs === "object" ? waterInputs : {};

  // 1. Evaluate water network & household connectivity
  const networkEval = evaluateWaterNetwork(doc);

  // 2. Evaluate construction budget
  const budgetEval = evaluateConstructionBudget(doc);

  // 3. Evaluate water reserve & supply balance
  const waterEval = evaluateWaterBalance(safeWaterInputs);

  // Mission thresholds from authoritative sources
  const householdTarget =
    MISSION?.objectives?.find((o) => o.id === "households")?.target ?? 4;
  const budgetLimit = getConstructionBudgetLimit();
  const dailyRequirementLitres = getMissionDailyWaterSupply();
  const minimumReserveLitres = getMissionMinimumReserve();

  const isDocValid = Boolean(doc && typeof doc === "object" && Array.isArray(doc.objects));

  // --- Requirement 1: Water Network Connectivity (Well to Farm) ---
  const wellsCount = networkEval?.summary?.wellsTotal ?? 0;
  const wellsConnected = networkEval?.summary?.wellsConnected ?? 0;
  const farmsCount = networkEval?.summary?.farmsTotal ?? 0;
  const farmsReached = networkEval?.summary?.farmsReached ?? 0;
  const reachesFarm = Boolean(networkEval?.reachesFarm);
  const networkOk = Boolean(networkEval?.ok);

  const networkDiagnostics = [];
  let networkStatus = "pass";

  if (!isDocValid) {
    networkStatus = "fail";
    networkDiagnostics.push("Village document is invalid or missing objects.");
  } else if (wellsCount === 0) {
    networkStatus = "fail";
    networkDiagnostics.push("No well placed in village. Connect at least one well.");
  } else if (wellsConnected === 0) {
    networkStatus = "fail";
    networkDiagnostics.push("The well is not connected to any pipes.");
  } else if (farmsCount === 0) {
    networkStatus = "fail";
    networkDiagnostics.push("No farm plot placed in village. Connect at least one farm.");
  } else if (!reachesFarm) {
    networkStatus = "fail";
    networkDiagnostics.push("Water from the well does not reach a farm plot.");
  } else if (!networkOk) {
    networkStatus = "fail";
    if (networkEval?.errors?.length > 0) {
      networkDiagnostics.push(...networkEval.errors.map((e) => e.message || String(e)));
    } else {
      networkDiagnostics.push("Water network contains errors.");
    }
  }

  const reqWaterNetwork = {
    id: "waterNetwork",
    label: "Water Network Connectivity",
    status: networkStatus,
    description: "Connect a well to village farm plots through pipes.",
    details: {
      wellsTotal: wellsCount,
      wellsConnected,
      farmsTotal: farmsCount,
      farmsReached,
      reachesFarm,
    },
    diagnostics: networkDiagnostics,
  };

  // --- Requirement 2: Household Water Supply ---
  const housesTotal = networkEval?.housesCount ?? 0;
  const housesConnected = networkEval?.housesConnected ?? 0;
  const householdTargetMet = housesConnected >= householdTarget;

  const householdDiagnostics = [];
  let householdStatus = "pass";

  if (!isDocValid) {
    householdStatus = "fail";
    householdDiagnostics.push("Village document is invalid or missing objects.");
  } else if (!householdTargetMet) {
    householdStatus = "fail";
    const shortfall = householdTarget - housesConnected;
    householdDiagnostics.push(
      `Only ${housesConnected} of ${householdTarget} households receive water. Connect ${shortfall} more household(s).`
    );
  }

  const reqHouseholds = {
    id: "households",
    label: "Household Water Supply",
    status: householdStatus,
    target: householdTarget,
    actual: housesConnected,
    targetMet: householdTargetMet,
    description: `Supply at least ${householdTarget} connected households.`,
    details: {
      housesTotal,
      housesConnected,
      target: householdTarget,
      shortfall: Math.max(0, householdTarget - housesConnected),
      connectedHouseIds: networkEval?.connectedHouseIds ?? [],
      unreachedHouseIds: networkEval?.unreachedHouseIds ?? [],
    },
    diagnostics: householdDiagnostics,
  };

  // --- Requirement 3: Construction Budget ---
  const totalCost = budgetEval?.totalCost ?? 0;
  const remainingBudget = budgetEval?.remainingBudget ?? budgetLimit;
  const withinBudget = Boolean(budgetEval?.withinBudget);

  const budgetDiagnostics = [];
  let budgetStatus = "pass";

  if (!isDocValid || !budgetEval?.ok) {
    budgetStatus = "fail";
    budgetDiagnostics.push("Could not evaluate construction budget for this document.");
  } else if (!withinBudget) {
    budgetStatus = "fail";
    const overCost = totalCost - budgetLimit;
    budgetDiagnostics.push(
      `Construction cost (${totalCost} coins) exceeds the budget limit of ${budgetLimit} coins by ${overCost} coins.`
    );
  }

  const reqBudget = {
    id: "budget",
    label: "Construction Budget",
    status: budgetStatus,
    target: budgetLimit,
    actual: totalCost,
    withinBudget,
    description: `Stay within the ${budgetLimit}-coin construction budget.`,
    details: {
      totalCost,
      budgetLimit,
      remainingBudget,
      overBudget: !withinBudget,
      shortfall: Math.max(0, totalCost - budgetLimit),
    },
    diagnostics: budgetDiagnostics,
  };

  // --- Requirement 4: Daily Water Supply & Demand ---
  const supplyAdequate = waterEval?.supplyAdequate ?? null;
  const dailySupplyLitres = waterEval?.dailySupplyLitres ?? null;
  const dailyDemandLitres = waterEval?.dailyDemandLitres ?? null;

  const dailyWaterDiagnostics = [];
  let dailyWaterStatus = "unknown";

  if (!waterEval?.ok) {
    dailyWaterStatus = "fail";
    if (waterEval?.errors?.length > 0) {
      dailyWaterDiagnostics.push(...waterEval.errors.map((e) => e.message || String(e)));
    }
  } else if (supplyAdequate === true) {
    dailyWaterStatus = "pass";
  } else if (supplyAdequate === false) {
    dailyWaterStatus = "fail";
    const shortfall = waterEval?.supplyShortfallLitres ?? 0;
    dailyWaterDiagnostics.push(
      `Daily water demand (${dailyDemandLitres} L/day) exceeds daily supply (${dailySupplyLitres} L/day) by ${shortfall} L/day.`
    );
  } else {
    dailyWaterStatus = "unknown";
    if (dailySupplyLitres === null && dailyDemandLitres === null) {
      dailyWaterDiagnostics.push(
        "Planned daily water supply and demand are unconfigured. Enter planning assumptions below."
      );
    } else if (dailySupplyLitres === null) {
      dailyWaterDiagnostics.push(
        "Planned daily water supply is unconfigured. Enter planned well output below."
      );
    } else {
      dailyWaterDiagnostics.push(
        "Daily water demand is unconfigured. Household and farm consumption rates require future balancing decisions."
      );
    }
  }

  const reqDailyWater = {
    id: "dailyWater",
    label: "Daily Water Supply & Demand",
    status: dailyWaterStatus,
    target: dailyRequirementLitres,
    actual: dailySupplyLitres,
    description: "Available daily water supply meets village daily demand.",
    details: {
      dailyRequirementLitres,
      dailySupplyLitres,
      dailyDemandLitres,
      supplyAdequate,
      shortfallLitres: waterEval?.supplyShortfallLitres ?? null,
      surplusLitres: waterEval?.supplySurplusLitres ?? null,
      unit: "litres per day",
    },
    diagnostics: dailyWaterDiagnostics,
  };

  // --- Requirement 5: Water Reserve Storage ---
  const reserveAdequate = waterEval?.reserveAdequate ?? null;
  const availableReserveLitres = waterEval?.availableReserveLitres ?? null;
  const storedCapacityLitres = waterEval?.storedCapacityLitres ?? null;

  const reserveDiagnostics = [];
  let reserveStatus = "unknown";

  if (!waterEval?.ok) {
    reserveStatus = "fail";
    if (waterEval?.errors?.length > 0) {
      reserveDiagnostics.push(...waterEval.errors.map((e) => e.message || String(e)));
    }
  } else if (reserveAdequate === true) {
    reserveStatus = "pass";
  } else if (reserveAdequate === false) {
    reserveStatus = "fail";
    const shortfall = waterEval?.reserveShortfallLitres ?? 0;
    reserveDiagnostics.push(
      `Available water reserve (${availableReserveLitres} L) is below the minimum required reserve (${minimumReserveLitres} L) by ${shortfall} L.`
    );
  } else {
    reserveStatus = "unknown";
    reserveDiagnostics.push(
      "Water reserve storage is unconfigured. Tank storage capacity and fill levels require future balancing decisions."
    );
  }

  const reqReserve = {
    id: "reserve",
    label: "Water Reserve Storage",
    status: reserveStatus,
    target: minimumReserveLitres,
    actual: availableReserveLitres,
    description: `Keep at least ${minimumReserveLitres} litres of water in reserve.`,
    details: {
      minimumReserveLitres,
      availableReserveLitres,
      storedCapacityLitres,
      reserveAdequate,
      shortfallLitres: waterEval?.reserveShortfallLitres ?? null,
      surplusLitres: waterEval?.reserveSurplusLitres ?? null,
      unit: "litres",
    },
    diagnostics: reserveDiagnostics,
  };

  // --- Group and categorize requirements ---
  const requirements = {
    waterNetwork: reqWaterNetwork,
    households: reqHouseholds,
    budget: reqBudget,
    dailyWater: reqDailyWater,
    reserve: reqReserve,
  };

  const requirementList = [
    reqWaterNetwork,
    reqHouseholds,
    reqBudget,
    reqDailyWater,
    reqReserve,
  ];

  const passedRequirements = [];
  const failedRequirements = [];
  const unknownRequirements = [];

  for (const req of requirementList) {
    if (req.status === "pass") {
      passedRequirements.push(req.id);
    } else if (req.status === "fail") {
      failedRequirements.push(req.id);
    } else {
      unknownRequirements.push(req.id);
    }
  }

  // --- Overall Status Calculation ---
  // - ready: every required condition is explicitly satisfied
  // - needs-attention: at least one configured requirement fails
  // - incomplete: no requirement fails, but one or more required conditions remain unknown
  let overallStatus = "ready";
  if (failedRequirements.length > 0) {
    overallStatus = "needs-attention";
  } else if (unknownRequirements.length > 0) {
    overallStatus = "incomplete";
  }

  const ready = overallStatus === "ready";

  // Combine actionable diagnostics (failures first, then warnings/unknowns)
  const allDiagnostics = [];
  for (const req of requirementList) {
    for (const msg of req.diagnostics) {
      allDiagnostics.push({
        requirementId: req.id,
        requirementLabel: req.label,
        status: req.status,
        message: msg,
      });
    }
  }

  let title = "Village Mission: Ready";
  let summary = "All configured village mission requirements are satisfied.";

  if (overallStatus === "needs-attention") {
    title = "Village Mission: Needs Attention";
    summary = `${failedRequirements.length} requirement(s) need attention before the village is ready.`;
  } else if (overallStatus === "incomplete") {
    title = "Village Mission: Incomplete";
    summary = `${unknownRequirements.length} requirement(s) require balancing data before mission readiness can be determined.`;
  }

  return {
    ready,
    overallStatus,
    title,
    summary,
    requirements,
    requirementList,
    passedRequirements,
    failedRequirements,
    unknownRequirements,
    diagnostics: allDiagnostics,
    unconfiguredParameters: waterEval?.unconfiguredParameters ?? [...UNCONFIGURED_BALANCING_PARAMETERS],
    evaluation: {
      waterNetwork: networkEval,
      budget: budgetEval,
      waterBalance: waterEval,
    },
  };
}
