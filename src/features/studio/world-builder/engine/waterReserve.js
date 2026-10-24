// World Builder water reserve and daily supply model for the "Save Our Village" mission.
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Evaluates daily water flow rates (L/day) and stored reserve volume (L) against mission targets.
//
// Units and Physical Concepts:
// - Daily flow rate: Litres per day (L/day) — daily water requirement, daily supply, and daily demand.
// - Stored reserve: Litres (L) — static water storage volume held in tanks.
// Daily flow rates and static storage volumes are strictly distinct concepts and must not be conflated.
//
// Separation of Concerns:
// This model evaluates numerical flow and reserve parameters. It is independent of graph connectivity,
// household network discovery, construction budget, and player progression.

import { MISSION } from "../data/mission.js";

/**
 * List of physical water parameters that are unconfigured in the current codebase
 * and require future game-design balancing decisions.
 */
export const UNCONFIGURED_BALANCING_PARAMETERS = Object.freeze([
  "householdDemandLitresPerDay",
  "farmDemandFloodLitresPerDay",
  "farmDemandDripLitresPerDay",
  "wellDailySupplyLitresPerDay",
  "tankStorageCapacityLitres",
]);

/**
 * Returns the mission's authoritative daily water supply requirement (100 L/day).
 * Sourced directly from MISSION.resources.water.value.
 *
 * @returns {number} Daily water supply requirement in litres per day
 */
export function getMissionDailyWaterSupply() {
  const missionWater = MISSION?.resources?.water?.value;
  return typeof missionWater === "number" && Number.isFinite(missionWater)
    ? missionWater
    : 100;
}

/**
 * Returns the mission's authoritative minimum water reserve requirement (10 L).
 * Sourced directly from MISSION.objectives.find((o) => o.id === "reserve")?.target.
 *
 * @returns {number} Minimum water reserve requirement in litres
 */
export function getMissionMinimumReserve() {
  const reserveObj = Array.isArray(MISSION?.objectives)
    ? MISSION.objectives.find((o) => o.id === "reserve")
    : null;
  const target = reserveObj?.target;
  return typeof target === "number" && Number.isFinite(target) ? target : 10;
}

/**
 * Returns both authoritative mission water thresholds in a single object.
 *
 * @returns {{ dailySupply: number, dailySupplyUnit: string, minimumReserve: number, minimumReserveUnit: string }}
 */
export function getMissionWaterThresholds() {
  return {
    dailySupply: getMissionDailyWaterSupply(),
    dailySupplyUnit: "litres per day",
    minimumReserve: getMissionMinimumReserve(),
    minimumReserveUnit: "litres",
  };
}

/**
 * Helper to validate a numeric planning input.
 * Returns { valid: true, value } or { valid: false, reason, error }.
 */
function validateNumericInput(val, fieldName) {
  if (val === undefined || val === null) {
    return { valid: true, missing: true, value: null };
  }
  if (typeof val !== "number" || !Number.isFinite(val)) {
    return {
      valid: false,
      missing: false,
      error: {
        code: "INVALID_NUMERIC_INPUT",
        severity: "error",
        field: fieldName,
        message: `${fieldName} must be a valid, finite number. Received: ${String(val)}.`,
      },
    };
  }
  if (val < 0) {
    return {
      valid: false,
      missing: false,
      error: {
        code: "NEGATIVE_VALUE_NOT_ALLOWED",
        severity: "error",
        field: fieldName,
        message: `${fieldName} cannot be negative. Received: ${val}.`,
      },
    };
  }
  return { valid: true, missing: false, value: val };
}

/**
 * Evaluates whether daily water supply meets daily demand.
 * Both inputs must be non-negative flow rates in litres per day.
 * Pure function: does not mutate inputs.
 *
 * @param {number} dailySupplyLitres - Available daily supply in L/day
 * @param {number} dailyDemandLitres - Planned daily consumption in L/day
 * @returns {object} Evaluation of daily supply adequacy
 */
export function evaluateDailyWaterSupply(dailySupplyLitres, dailyDemandLitres) {
  const errors = [];
  const warnings = [];
  const diagnostics = [];

  const valSupply = validateNumericInput(dailySupplyLitres, "dailySupplyLitres");
  const valDemand = validateNumericInput(dailyDemandLitres, "dailyDemandLitres");

  if (!valSupply.valid && valSupply.error) errors.push(valSupply.error);
  if (!valDemand.valid && valDemand.error) errors.push(valDemand.error);

  if (errors.length > 0) {
    diagnostics.push(...errors);
    return {
      ok: false,
      dailySupplyLitres: valSupply.valid ? valSupply.value : null,
      dailyDemandLitres: valDemand.valid ? valDemand.value : null,
      unit: "litres per day",
      supplyAdequate: false,
      shortfallLitres: null,
      surplusLitres: null,
      status: "error",
      diagnostics,
      errors,
      warnings,
    };
  }

  // Handle missing supply or demand
  if (valSupply.missing) {
    warnings.push({
      code: "SUPPLY_UNKNOWN",
      severity: "warning",
      message: "Daily supply is unconfigured or not provided. Well output capacity requires player planning or future balancing decisions.",
    });
  }
  if (valDemand.missing) {
    warnings.push({
      code: "DEMAND_UNKNOWN",
      severity: "warning",
      message: "Daily demand is unconfigured or not provided. Future balancing decisions will establish household and farm consumption rates.",
    });
  }

  if (valSupply.missing || valDemand.missing) {
    diagnostics.push(...warnings);
    return {
      ok: true,
      dailySupplyLitres: valSupply.value,
      dailyDemandLitres: valDemand.value,
      unit: "litres per day",
      supplyAdequate: null,
      shortfallLitres: null,
      surplusLitres: null,
      status: "unknown",
      diagnostics,
      errors: [],
      warnings,
    };
  }

  const supply = valSupply.value;
  const demand = valDemand.value;

  const surplus = supply - demand;
  const shortfall = Math.max(0, demand - supply);
  const supplyAdequate = supply >= demand;

  if (!supplyAdequate) {
    warnings.push({
      code: "SUPPLY_INSUFFICIENT",
      severity: "warning",
      message: `Daily water demand (${demand} L/day) exceeds daily supply (${supply} L/day) by ${shortfall} L/day.`,
    });
  }

  diagnostics.push(...warnings);

  return {
    ok: true,
    dailySupplyLitres: supply,
    dailyDemandLitres: demand,
    unit: "litres per day",
    supplyAdequate,
    shortfallLitres: shortfall,
    surplusLitres: surplus,
    status: supplyAdequate ? "pass" : "fail",
    diagnostics,
    errors: [],
    warnings,
  };
}

/**
 * Evaluates whether stored water meets the minimum reserve requirement.
 * Inputs are volumes in litres.
 * Pure function: does not mutate inputs.
 *
 * @param {number} availableReserveLitres - Stored water volume in litres
 * @param {number} [minimumReserveLitres] - Minimum required reserve volume in litres (defaults to mission target: 10 L)
 * @param {number} [storedCapacityLitres] - Optional total storage capacity in litres
 * @returns {object} Evaluation of stored reserve adequacy
 */
export function evaluateStoredWaterReserve(
  availableReserveLitres,
  minimumReserveLitres,
  storedCapacityLitres
) {
  const errors = [];
  const warnings = [];
  const diagnostics = [];

  const valReserve = validateNumericInput(availableReserveLitres, "availableReserveLitres");
  const valMin = validateNumericInput(minimumReserveLitres, "minimumReserveLitres");
  const valCap = validateNumericInput(storedCapacityLitres, "storedCapacityLitres");

  if (!valReserve.valid && valReserve.error) errors.push(valReserve.error);
  if (!valMin.valid && valMin.error) errors.push(valMin.error);
  if (!valCap.valid && valCap.error) errors.push(valCap.error);

  if (errors.length > 0) {
    diagnostics.push(...errors);
    return {
      ok: false,
      availableReserveLitres: valReserve.valid ? valReserve.value : null,
      minimumReserveLitres: valMin.valid ? valMin.value : null,
      storedCapacityLitres: valCap.valid ? valCap.value : null,
      unit: "litres",
      reserveAdequate: false,
      shortfallLitres: null,
      surplusLitres: null,
      status: "error",
      diagnostics,
      errors,
      warnings,
    };
  }

  // Handle missing / unknown available reserve
  if (valReserve.missing) {
    warnings.push({
      code: "RESERVE_UNKNOWN",
      severity: "warning",
      message: "Available water reserve is unconfigured or not provided. Tank storage capacity and fill levels require future balancing decisions.",
    });
    diagnostics.push(...warnings);
    return {
      ok: true,
      availableReserveLitres: null,
      minimumReserveLitres: valMin.missing ? getMissionMinimumReserve() : valMin.value,
      storedCapacityLitres: valCap.value,
      unit: "litres",
      reserveAdequate: null,
      shortfallLitres: null,
      surplusLitres: null,
      status: "unknown",
      diagnostics,
      errors: [],
      warnings,
    };
  }

  const minReserve = valMin.missing ? getMissionMinimumReserve() : valMin.value;
  const available = valReserve.value;
  const capacity = valCap.value;

  const surplus = available - minReserve;
  const shortfall = Math.max(0, minReserve - available);
  const reserveAdequate = available >= minReserve;

  if (!reserveAdequate) {
    warnings.push({
      code: "RESERVE_INSUFFICIENT",
      severity: "warning",
      message: `Available water reserve (${available} L) is below the minimum required reserve (${minReserve} L) by ${shortfall} L.`,
    });
  }

  // Optional capacity check: available cannot physically exceed capacity if capacity is specified
  if (capacity !== null && available > capacity) {
    warnings.push({
      code: "RESERVE_EXCEEDS_CAPACITY",
      severity: "warning",
      message: `Available reserve (${available} L) exceeds stated storage capacity (${capacity} L).`,
    });
  }

  diagnostics.push(...warnings);

  return {
    ok: true,
    availableReserveLitres: available,
    minimumReserveLitres: minReserve,
    storedCapacityLitres: capacity,
    unit: "litres",
    reserveAdequate,
    shortfallLitres: shortfall,
    surplusLitres: surplus,
    status: reserveAdequate ? "pass" : "fail",
    diagnostics,
    errors: [],
    warnings,
  };
}

/**
 * Comprehensive water evaluation for the "Save Our Village" mission.
 * Pure function: does not mutate inputs.
 * Accepts explicit numeric planning values, keeping daily flow and stored volume separate.
 *
 * @param {object} [inputs]
 * @param {number} [inputs.dailySupplyLitres] - Planned daily water supply (L/day)
 * @param {number} [inputs.dailyDemandLitres] - Planned daily water demand (L/day)
 * @param {number} [inputs.availableReserveLitres] - Stored water reserve volume (L)
 * @param {number} [inputs.minimumReserveLitres] - Required minimum reserve (L, defaults to mission 10 L)
 * @param {number} [inputs.storedCapacityLitres] - Stored tank capacity (L)
 * @param {object} [inputs.doc] - Optional studio document (for inspection; capacities are never guessed)
 * @returns {object} Deterministic water reserve and supply summary
 */
export function evaluateWaterBalance(inputs = {}) {
  const dailyRequirementLitres = getMissionDailyWaterSupply();
  const minimumReserveLitres = getMissionMinimumReserve();

  const suppliedDailySupply = inputs?.dailySupplyLitres ?? null;
  const suppliedDailyDemand = inputs?.dailyDemandLitres ?? null;
  const suppliedAvailableReserve = inputs?.availableReserveLitres ?? null;
  const suppliedMinReserve = inputs?.minimumReserveLitres ?? minimumReserveLitres;
  const suppliedCapacity = inputs?.storedCapacityLitres ?? null;

  // Run individual evaluations
  const supplyEval = evaluateDailyWaterSupply(suppliedDailySupply, suppliedDailyDemand);
  const reserveEval = evaluateStoredWaterReserve(suppliedAvailableReserve, suppliedMinReserve, suppliedCapacity);

  const errors = [...supplyEval.errors, ...reserveEval.errors];
  const warnings = [...supplyEval.warnings, ...reserveEval.warnings];
  const diagnostics = [...supplyEval.diagnostics, ...reserveEval.diagnostics];

  // Document unconfigured parameters that require future game-design balancing decisions
  const unconfiguredParameters = [];
  if (supplyEval.dailySupplyLitres === null) {
    unconfiguredParameters.push("dailySupplyLitres");
  }
  if (supplyEval.dailyDemandLitres === null) {
    unconfiguredParameters.push("dailyDemandLitres");
  }
  if (reserveEval.availableReserveLitres === null) {
    unconfiguredParameters.push("availableReserveLitres");
  }

  // Determine overall status
  let overallStatus = "pass";
  if (errors.length > 0) {
    overallStatus = "error";
  } else if (supplyEval.status === "fail" || reserveEval.status === "fail") {
    overallStatus = "fail";
  } else if (supplyEval.status === "unknown" || reserveEval.status === "unknown") {
    overallStatus = "unknown";
  }

  return {
    ok: errors.length === 0,
    dailyRequirementLitres,
    dailySupplyLitres: supplyEval.dailySupplyLitres,
    dailyDemandLitres: supplyEval.dailyDemandLitres,
    minimumReserveLitres: reserveEval.minimumReserveLitres,
    availableReserveLitres: reserveEval.availableReserveLitres,
    storedCapacityLitres: reserveEval.storedCapacityLitres,
    supplyAdequate: supplyEval.supplyAdequate,
    supplyShortfallLitres: supplyEval.shortfallLitres,
    supplySurplusLitres: supplyEval.surplusLitres,
    reserveAdequate: reserveEval.reserveAdequate,
    reserveShortfallLitres: reserveEval.shortfallLitres,
    reserveSurplusLitres: reserveEval.surplusLitres,
    overallStatus,
    unconfiguredParameters,
    diagnostics,
    errors,
    warnings,
  };
}
