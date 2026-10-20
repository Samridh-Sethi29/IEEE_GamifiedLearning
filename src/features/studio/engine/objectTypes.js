// Object type definitions. Pure, serializable data only (no React): rendering lives in
// objectArt.jsx and is looked up by type id. The validation rules for an object's type-specific
// `props` are derived from the `props` schema below.
//
// Prop kinds:
//   color -> "#rrggbb" string
//   int   -> integer within [min, max]
//   enum  -> exact match with one of options/values
//   bool  -> boolean (true or false)

import { PROJECT_OBJECT_TYPES } from "./constants.js";

export const COLOR_CHOICES = [
  "#ef4444", "#f97316", "#facc15", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#78716c", "#e2e8f0",
];

export const OBJECT_TYPES = {
  rectangle: {
    label: "Rectangle",
    defaultSize: { width: 120, height: 80 },
    minSize: 24,
    maxSize: 400,
    props: { fill: { kind: "color", default: "#3b82f6", label: "Colour" } },
  },
  circle: {
    label: "Circle",
    defaultSize: { width: 90, height: 90 },
    minSize: 24,
    maxSize: 400,
    props: { fill: { kind: "color", default: "#f97316", label: "Colour" } },
  },
  triangle: {
    label: "Triangle",
    defaultSize: { width: 100, height: 90 },
    minSize: 24,
    maxSize: 400,
    props: { fill: { kind: "color", default: "#8b5cf6", label: "Colour" } },
  },
  tree: {
    label: "Tree",
    defaultSize: { width: 70, height: 100 },
    minSize: 30,
    maxSize: 300,
    props: { foliage: { kind: "color", default: "#22c55e", label: "Leaves" } },
  },
  house: {
    label: "House",
    defaultSize: { width: 110, height: 100 },
    minSize: 40,
    maxSize: 320,
    props: {
      wall: { kind: "color", default: "#facc15", label: "Walls" },
      roof: { kind: "color", default: "#ef4444", label: "Roof" },
    },
  },
  gear: {
    label: "Gear",
    defaultSize: { width: 90, height: 90 },
    minSize: 30,
    maxSize: 300,
    props: {
      fill: { kind: "color", default: "#78716c", label: "Colour" },
      teeth: { kind: "int", min: 6, max: 16, default: 10, label: "Teeth" },
    },
  },
  farm: {
    label: "Farm",
    defaultSize: { width: 120, height: 90 },
    minSize: 40,
    maxSize: 320,
    props: {
      irrigation: { kind: "enum", options: ["flood", "drip"], default: "flood", label: "Irrigation" },
    },
  },
  well: {
    label: "Well",
    defaultSize: { width: 80, height: 90 },
    minSize: 30,
    maxSize: 300,
    props: {
      roof: { kind: "color", default: "#ef4444", label: "Roof" },
    },
  },
  tank: {
    label: "Tank",
    defaultSize: { width: 80, height: 100 },
    minSize: 30,
    maxSize: 300,
    props: {
      fill: { kind: "color", default: "#3b82f6", label: "Colour" },
    },
  },
  pipe: {
    label: "Pipe",
    defaultSize: { width: 100, height: 30 },
    minSize: 20,
    maxSize: 400,
    props: {
      fill: { kind: "color", default: "#14b8a6", label: "Colour" },
    },
  },
  road: {
    label: "Road",
    defaultSize: { width: 120, height: 50 },
    minSize: 24,
    maxSize: 400,
    props: {
      fill: { kind: "color", default: "#facc15", label: "Surface" },
    },
  },
};

export const OBJECT_TYPE_IDS = Object.keys(OBJECT_TYPES);

export { PROJECT_OBJECT_TYPES };

export function getObjectTypes(projectType) {
  if (typeof projectType !== "string" || !Object.prototype.hasOwnProperty.call(PROJECT_OBJECT_TYPES, projectType)) {
    return [];
  }
  const allowed = PROJECT_OBJECT_TYPES[projectType];
  return Array.isArray(allowed) ? [...allowed] : [];
}

/**
 * Returns allowed object types for a project that have valid palette presentations.
 * Safely filters out and reports any types missing palette presentation definitions.
 */
export function getPaletteObjectTypes(projectType) {
  const types = getObjectTypes(projectType);
  return types.filter((type) => {
    const def = OBJECT_TYPES[type];
    if (!def || !def.defaultSize || typeof def.label !== "string") {
      console.warn(`[Palette] Object type "${type}" has no valid presentation definition.`);
      return false;
    }
    return true;
  });
}

export function isObjectType(type, projectType = undefined) {
  if (typeof type !== "string" || !Object.prototype.hasOwnProperty.call(OBJECT_TYPES, type)) {
    return false;
  }
  if (projectType !== undefined) {
    return getObjectTypes(projectType).includes(type);
  }
  return true;
}

export function defaultProps(type) {
  const out = {};
  for (const [key, def] of Object.entries(OBJECT_TYPES[type].props)) out[key] = def.default;
  return out;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Returns an error string for a bad prop value, or null when it is valid. */
export function checkPropValue(def, value) {
  if (!def || typeof def !== "object") return "has an invalid property definition";
  if (def.kind === "color") return typeof value === "string" && HEX.test(value) ? null : "must be a #rrggbb colour";
  if (def.kind === "int") {
    return Number.isInteger(value) && value >= def.min && value <= def.max
      ? null
      : `must be a whole number from ${def.min} to ${def.max}`;
  }
  if (def.kind === "enum") {
    const allowed = Array.isArray(def.options) ? def.options : Array.isArray(def.values) ? def.values : null;
    if (!allowed || allowed.length === 0) return "has no allowed values defined";
    return allowed.includes(value) ? null : `must be one of: ${allowed.join(", ")}`;
  }
  if (def.kind === "bool") {
    return typeof value === "boolean" ? null : "must be a boolean";
  }
  return "has an unknown kind";
}
