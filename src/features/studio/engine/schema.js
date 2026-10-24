// Project document model: creation, validation and normalisation.
//
// A project is plain JSON:
// {
//   id, schemaVersion, title, type,            // type: one of PROJECT_TYPES
//   createdAt, modifiedAt,                      // ISO-8601 strings
//   canvas: { width, height },
//   objects: [ { id, type, x, y, rotation, width, height, layer, props } ],  // back -> front
//   metadata: { ...any plain JSON... }
// }
// Object x/y are the object's CENTRE in workspace units. rotation is degrees in [0, 360).
// `objects` array order is the stacking order (index 0 = back); `layer` mirrors that order and
// is normalised to 0..n-1 whenever a document is loaded or edited.

import {
  CANVAS_LIMITS, DEFAULT_CANVAS, MAX_OBJECTS, MAX_TITLE_LENGTH, PROJECT_TYPES, SCHEMA_VERSION,
} from "./constants.js";
import { OBJECT_TYPES, checkPropValue, defaultProps, getObjectTypes, isObjectType } from "./objectTypes.js";

export { getObjectTypes };

let idCounter = 0;
/** Unique-enough id for projects/objects. Not used inside the reducer (ids arrive via actions). */
export function createId(prefix = "id") {
  idCounter += 1;
  const rand =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${rand}`;
}

export function createProject({
  id = createId("proj"), title = "Untitled creation", type = "sandbox", canvas = DEFAULT_CANVAS,
  objects = [], metadata = {}, now = new Date().toISOString(),
} = {}) {
  return normalizeProject({
    id, schemaVersion: SCHEMA_VERSION, title, type, createdAt: now, modifiedAt: now,
    canvas: { width: canvas.width, height: canvas.height }, objects, metadata,
  });
}

/** Build a valid object of `type` (defaults for size and props, overridable). */
export function createObject(type, overrides = {}, projectType = undefined) {
  const pType = projectType ?? overrides.projectType;
  if (pType !== undefined) {
    if (!isObjectType(type, pType)) {
      throw new Error(`Object type "${String(type)}" is not allowed in a ${String(pType)} project`);
    }
  } else if (!isObjectType(type)) {
    throw new Error(`Unknown object type: ${String(type)}`);
  }
  const def = OBJECT_TYPES[type];
  return {
    id: overrides.id ?? createId("obj"),
    type,
    x: overrides.x ?? DEFAULT_CANVAS.width / 2,
    y: overrides.y ?? DEFAULT_CANVAS.height / 2,
    rotation: overrides.rotation ?? 0,
    width: overrides.width ?? def.defaultSize.width,
    height: overrides.height ?? def.defaultSize.height,
    layer: overrides.layer ?? 0,
    props: { ...defaultProps(type), ...(overrides.props ?? {}) },
  };
}

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isPlainObject = (v) => isObj(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** True only for values that survive JSON.stringify -> JSON.parse unchanged. */
export function isJsonValue(v, depth = 0) {
  if (depth > 8) return false;
  if (v === null || typeof v === "string" || typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.every((x) => isJsonValue(x, depth + 1));
  if (isPlainObject(v)) return Object.values(v).every((x) => isJsonValue(x, depth + 1));
  return false;
}

const OBJECT_KEYS = ["id", "type", "x", "y", "rotation", "width", "height", "layer", "props"];
const PROJECT_KEYS = ["id", "schemaVersion", "title", "type", "createdAt", "modifiedAt", "canvas", "objects", "metadata"];

/** Validate one object. `canvas` is optional (enables the bounds check). Returns string[]. */
export function validateObject(obj, canvasOrOptions, path = "object", projectType = undefined) {
  const errors = [];
  if (!isPlainObject(obj)) return [`${path} must be an object`];

  let canvas = canvasOrOptions;
  let p = path;
  let pType = projectType;

  if (isPlainObject(canvasOrOptions) && ("projectType" in canvasOrOptions || "canvas" in canvasOrOptions || ("path" in canvasOrOptions && !("width" in canvasOrOptions || "height" in canvasOrOptions)))) {
    canvas = canvasOrOptions.canvas;
    if ("path" in canvasOrOptions) p = canvasOrOptions.path;
    if ("projectType" in canvasOrOptions) pType = canvasOrOptions.projectType;
  }

  for (const k of Object.keys(obj)) if (!OBJECT_KEYS.includes(k)) errors.push(`${p}.${k} is not a known field`);
  if (typeof obj.id !== "string" || obj.id === "") errors.push(`${p}.id must be a non-empty string`);
  if (!isObjectType(obj.type)) {
    errors.push(`${p}.type "${String(obj.type)}" is not a supported object type`);
    return errors;
  }
  if (pType !== undefined && !isObjectType(obj.type, pType)) {
    errors.push(`${p}.type "${String(obj.type)}" is not allowed in a ${pType} project`);
  }
  const def = OBJECT_TYPES[obj.type];
  for (const k of ["x", "y", "rotation", "width", "height"]) {
    if (!isNum(obj[k])) errors.push(`${p}.${k} must be a finite number`);
  }
  if (isNum(obj.rotation) && (obj.rotation < 0 || obj.rotation >= 360)) errors.push(`${p}.rotation must be from 0 up to (not including) 360`);
  for (const k of ["width", "height"]) {
    if (isNum(obj[k]) && (obj[k] < def.minSize || obj[k] > def.maxSize)) {
      errors.push(`${p}.${k} must be between ${def.minSize} and ${def.maxSize} for a ${def.label}`);
    }
  }
  if (!Number.isInteger(obj.layer) || obj.layer < 0) errors.push(`${p}.layer must be a whole number, 0 or more`);
  if (!isPlainObject(obj.props)) {
    errors.push(`${p}.props must be an object`);
  } else {
    for (const k of Object.keys(obj.props)) if (!def.props[k]) errors.push(`${p}.props.${k} is not a property of ${def.label}`);
    for (const [k, pdef] of Object.entries(def.props)) {
      if (!(k in obj.props)) errors.push(`${p}.props.${k} is missing`);
      else {
        const problem = checkPropValue(pdef, obj.props[k]);
        if (problem) errors.push(`${p}.props.${k} ${problem}`);
      }
    }
  }
  if (canvas && isNum(obj.x) && isNum(obj.y) && (obj.x < 0 || obj.y < 0 || obj.x > canvas.width || obj.y > canvas.height)) {
    errors.push(`${p} centre (${obj.x}, ${obj.y}) is outside the workspace`);
  }
  return errors;
}

/** Validate a whole project. Returns { ok, errors }. Never throws on bad input. */
export function validateProject(doc) {
  const errors = [];
  if (!isPlainObject(doc)) return { ok: false, errors: ["project must be an object"] };
  for (const k of Object.keys(doc)) if (!PROJECT_KEYS.includes(k)) errors.push(`project.${k} is not a known field`);
  if (typeof doc.id !== "string" || doc.id === "") errors.push("project.id must be a non-empty string");
  if (!Number.isInteger(doc.schemaVersion)) errors.push("project.schemaVersion must be a whole number");
  else if (doc.schemaVersion !== SCHEMA_VERSION) errors.push(`project.schemaVersion ${doc.schemaVersion} is not supported (expected ${SCHEMA_VERSION})`);
  if (typeof doc.title !== "string" || doc.title.trim() === "" || doc.title.length > MAX_TITLE_LENGTH) {
    errors.push(`project.title must be 1-${MAX_TITLE_LENGTH} characters`);
  }
  if (!PROJECT_TYPES.includes(doc.type)) errors.push(`project.type must be one of: ${PROJECT_TYPES.join(", ")}`);
  for (const k of ["createdAt", "modifiedAt"]) {
    if (typeof doc[k] !== "string" || Number.isNaN(Date.parse(doc[k]))) errors.push(`project.${k} must be an ISO date string`);
  }
  let canvasOk = false;
  if (!isPlainObject(doc.canvas)) errors.push("project.canvas must be an object");
  else {
    canvasOk = true;
    for (const k of ["width", "height"]) {
      const v = doc.canvas[k];
      if (!isNum(v) || v < CANVAS_LIMITS.min || v > CANVAS_LIMITS.max) {
        canvasOk = false;
        errors.push(`project.canvas.${k} must be a number from ${CANVAS_LIMITS.min} to ${CANVAS_LIMITS.max}`);
      }
    }
  }
  if (!isPlainObject(doc.metadata) || !isJsonValue(doc.metadata)) errors.push("project.metadata must be a plain JSON object");
  if (!Array.isArray(doc.objects)) errors.push("project.objects must be an array");
  else {
    if (doc.objects.length > MAX_OBJECTS) errors.push(`project.objects has more than ${MAX_OBJECTS} objects`);
    const ids = new Set();
    const layers = new Set();
    doc.objects.forEach((o, i) => {
      errors.push(...validateObject(o, canvasOk ? doc.canvas : undefined, `objects[${i}]`, doc.type));
      if (isPlainObject(o)) {
        if (typeof o.id === "string") {
          if (ids.has(o.id)) errors.push(`objects[${i}].id "${o.id}" is duplicated`);
          ids.add(o.id);
        }
        if (Number.isInteger(o.layer)) {
          if (layers.has(o.layer)) errors.push(`objects[${i}].layer ${o.layer} is duplicated`);
          layers.add(o.layer);
        }
      }
    });
  }
  return { ok: errors.length === 0, errors };
}

/** Sort objects by layer and renumber layers 0..n-1. Returns a NEW document; input untouched. */
export function normalizeProject(doc) {
  return { ...doc, objects: normalizeLayers(doc.objects) };
}

export function normalizeLayers(objects) {
  const ordered = objects.every((o) => Number.isInteger(o?.layer))
    ? [...objects].sort((a, b) => a.layer - b.layer)
    : objects;
  return ordered.map((o, i) => (o.layer === i ? o : { ...o, layer: i }));
}
