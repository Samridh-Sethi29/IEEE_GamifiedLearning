// World Builder construction budget model for the "Save Our Village" mission.
// Pure JavaScript: no React, no DOM, no external dependencies, and no document mutation.
// Calculates the total construction cost of village designs against the mission's 100-coin limit.
//
// Mission-specific budget only: separate from player profile, global coin balance, or economy progression.
// This evaluation is purely informational and strictly independent of water connectivity.

import { MISSION } from "../data/mission.js";
import { PROJECT_OBJECT_TYPES } from "../../engine/constants.js";

/**
 * Authoritative, immutable construction cost table for the "Save Our Village" mission.
 * These unit costs represent mission-design values that balance gameplay and can be adjusted later.
 */
export const CONSTRUCTION_COSTS = Object.freeze({
  house: 7,
  tree: 2,
  farm: 8,
  well: 18,
  tank: 12,
  pipe: 4,
  road: 3,
});

/**
 * List of object types supported by the World Builder construction cost model.
 * Matches PROJECT_OBJECT_TYPES["world-builder"] in constants.js.
 */
export const SUPPORTED_CONSTRUCTION_TYPES = Object.freeze(Object.keys(CONSTRUCTION_COSTS));

/**
 * Returns the authoritative construction budget limit for the World Builder mission.
 * Sourced directly from MISSION.resources.budget.value in mission configuration.
 *
 * @returns {number} Budget limit in mission coins (100)
 */
export function getConstructionBudgetLimit() {
  const missionBudget = MISSION?.resources?.budget?.value;
  return typeof missionBudget === "number" && Number.isFinite(missionBudget)
    ? missionBudget
    : 100;
}

/**
 * Returns the construction cost of an individual supported object or object type.
 * Accepts either an object (e.g. `{ type: "house" }`) or a type string (e.g. `"house"`).
 * Returns 0 for unsupported types or malformed input.
 *
 * @param {string|{type?: string}} objOrType
 * @returns {number} Unit construction cost in mission coins
 */
export function getObjectConstructionCost(objOrType) {
  if (!objOrType) return 0;
  const type = typeof objOrType === "string" ? objOrType : objOrType?.type;
  if (typeof type === "string" && Object.prototype.hasOwnProperty.call(CONSTRUCTION_COSTS, type)) {
    return CONSTRUCTION_COSTS[type];
  }
  return 0;
}

/**
 * Checks whether an object type is a recognized World Builder construction type.
 *
 * @param {string|{type?: string}} objOrType
 * @returns {boolean}
 */
export function isSupportedConstructionType(objOrType) {
  if (!objOrType) return false;
  const type = typeof objOrType === "string" ? objOrType : objOrType?.type;
  return typeof type === "string" && Object.prototype.hasOwnProperty.call(CONSTRUCTION_COSTS, type);
}

/**
 * Calculates the total construction cost of all valid objects in a World Builder document.
 * Pure calculation: never mutates the document.
 *
 * @param {object} doc - Studio project document
 * @returns {number} Total construction cost in mission coins
 */
export function calculateTotalConstructionCost(doc) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.objects)) {
    return 0;
  }

  let total = 0;
  for (const obj of doc.objects) {
    if (obj && typeof obj === "object" && typeof obj.type === "string") {
      total += getObjectConstructionCost(obj);
    }
  }
  return total;
}

/**
 * Evaluates the construction budget for a World Builder document.
 * Returns a comprehensive, deterministic budget summary.
 *
 * @param {object} doc - Studio project document
 * @param {object} [options]
 * @param {number} [options.budgetLimit] - Optional override for the budget limit (defaults to mission limit)
 * @returns {object} Budget evaluation summary
 */
export function evaluateConstructionBudget(doc, options = {}) {
  const budgetLimit =
    typeof options?.budgetLimit === "number" && Number.isFinite(options.budgetLimit)
      ? options.budgetLimit
      : getConstructionBudgetLimit();

  const diagnostics = [];
  const unsupportedObjects = [];

  // Initialize breakdown counters in fixed order
  const breakdown = {};
  for (const type of SUPPORTED_CONSTRUCTION_TYPES) {
    breakdown[type] = {
      type,
      count: 0,
      unitCost: CONSTRUCTION_COSTS[type],
      subtotal: 0,
    };
  }

  // Handle missing or invalid document safely
  if (!doc || typeof doc !== "object") {
    diagnostics.push({
      code: "INVALID_DOCUMENT",
      severity: "error",
      message: "Document is missing or not an object.",
    });
    return {
      ok: false,
      budgetLimit,
      totalCost: 0,
      remainingBudget: budgetLimit,
      withinBudget: true,
      overBudget: false,
      objectCount: 0,
      breakdown,
      items: SUPPORTED_CONSTRUCTION_TYPES.map((t) => ({ ...breakdown[t] })),
      unsupportedObjects: [],
      diagnostics,
      errors: diagnostics.filter((d) => d.severity === "error"),
      warnings: [],
    };
  }

  if (!Array.isArray(doc.objects)) {
    diagnostics.push({
      code: "INVALID_OBJECTS_ARRAY",
      severity: "error",
      message: "Document does not contain a valid objects array.",
    });
    return {
      ok: false,
      budgetLimit,
      totalCost: 0,
      remainingBudget: budgetLimit,
      withinBudget: true,
      overBudget: false,
      objectCount: 0,
      breakdown,
      items: SUPPORTED_CONSTRUCTION_TYPES.map((t) => ({ ...breakdown[t] })),
      unsupportedObjects: [],
      diagnostics,
      errors: diagnostics.filter((d) => d.severity === "error"),
      warnings: [],
    };
  }

  let totalCost = 0;
  let objectCount = 0;

  for (const obj of doc.objects) {
    if (!obj || typeof obj !== "object") {
      diagnostics.push({
        code: "MALFORMED_OBJECT",
        severity: "warning",
        message: "Encountered a non-object entry in the document objects array.",
      });
      continue;
    }

    const { id, type } = obj;

    if (typeof type !== "string" || !type) {
      diagnostics.push({
        code: "MISSING_OBJECT_TYPE",
        severity: "warning",
        objectId: id ?? null,
        message: `Object "${id ?? "unknown"}" is missing a valid type string.`,
      });
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(CONSTRUCTION_COSTS, type)) {
      unsupportedObjects.push({ id: id ?? null, type });
      diagnostics.push({
        code: "UNSUPPORTED_OBJECT_TYPE",
        severity: "warning",
        objectId: id ?? null,
        type,
        message: `Object "${id ?? "unknown"}" has unsupported type "${type}" for World Builder construction budget.`,
      });
      continue;
    }

    // Supported object
    objectCount += 1;
    const unitCost = CONSTRUCTION_COSTS[type];
    breakdown[type].count += 1;
    breakdown[type].subtotal += unitCost;
    totalCost += unitCost;
  }

  // Sort unsupported objects deterministically by id/type for order-independent output
  unsupportedObjects.sort((a, b) => {
    const idA = String(a.id ?? "");
    const idB = String(b.id ?? "");
    if (idA !== idB) return idA.localeCompare(idB);
    return String(a.type).localeCompare(String(b.type));
  });

  // Sort diagnostics deterministically
  diagnostics.sort((a, b) => {
    const codeDiff = String(a.code).localeCompare(String(b.code));
    if (codeDiff !== 0) return codeDiff;
    const idA = String(a.objectId ?? "");
    const idB = String(b.objectId ?? "");
    return idA.localeCompare(idB);
  });

  const remainingBudget = budgetLimit - totalCost;
  const withinBudget = totalCost <= budgetLimit;
  const overBudget = totalCost > budgetLimit;

  if (overBudget) {
    diagnostics.push({
      code: "BUDGET_EXCEEDED",
      severity: "warning",
      message: `Total construction cost (${totalCost} coins) exceeds the budget limit of ${budgetLimit} coins by ${totalCost - budgetLimit} coins.`,
    });
  }

  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");

  return {
    ok: errors.length === 0,
    budgetLimit,
    totalCost,
    remainingBudget,
    withinBudget,
    overBudget,
    objectCount,
    breakdown,
    items: SUPPORTED_CONSTRUCTION_TYPES.map((t) => ({ ...breakdown[t] })),
    unsupportedObjects,
    diagnostics,
    errors,
    warnings,
  };
}
