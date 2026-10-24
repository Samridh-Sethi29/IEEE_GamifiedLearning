// Editor state + reducer. Isolated from the player profile: nothing here imports player code.
//
// State:
//   history   { past[], present, future[] }  document snapshots (see history.js)
//   initial   the document the session started from (target of RESET)
//   selectedId  id of the selected object, or null (selection is NOT part of history)
//   pending   null, or { base } while a transaction (e.g. a drag) is open
//   group     null, or a string naming the current merge group (see below)
//   notice    null, or { id, kind: "info"|"warning", message } for user feedback
//   noticeSeq counter that makes every notice unique
//
// History boundaries:
//   * A normal edit action = one undo step.
//   * BEGIN_TRANSACTION ... COMMIT_TRANSACTION = one undo step, however many live edits between.
//     CANCEL_TRANSACTION restores the document from before BEGIN (no step, no corruption).
//   * Edits carrying `group` merge into the previous step while the same group is active
//     (holding an arrow key, dragging a slider). END_GROUP, or any other action, closes it.

import { MAX_OBJECTS, RESIZE_FACTOR, ROTATE_STEP } from "./constants.js";
import { clamp, clampPosition, normalizeAngle, round2 } from "./geometry.js";
import * as H from "./history.js";
import { OBJECT_TYPES } from "./objectTypes.js";
import { normalizeLayers, normalizeProject, validateObject, validateProject } from "./schema.js";

export function createEditorState(project) {
  const check = validateProject(project);
  if (!check.ok) throw new Error(`Cannot open invalid project: ${check.errors[0]}`);
  const doc = normalizeProject(project);
  return { history: H.createHistory(doc), initial: doc, selectedId: null, pending: null, group: null, notice: null, noticeSeq: 0 };
}

// ---- selectors -------------------------------------------------------------------------------
export const selectDocument = (s) => s.history.present;
export const selectObject = (s, id = s.selectedId) => s.history.present.objects.find((o) => o.id === id) ?? null;
export const selectCanUndo = (s) => !s.pending && H.canUndo(s.history);
export const selectCanRedo = (s) => !s.pending && H.canRedo(s.history);
/** A plain, detached JSON copy of the current document. */
export const exportProject = (s) => JSON.parse(JSON.stringify(s.history.present));

// ---- helpers ---------------------------------------------------------------------------------
const note = (s, kind, message) => ({ ...s, noticeSeq: s.noticeSeq + 1, notice: { id: s.noticeSeq + 1, kind, message } });
const stamp = (doc, at) => (typeof at === "number" ? { ...doc, modifiedAt: new Date(at).toISOString() } : doc);

function withObjects(doc, objects, at) {
  return stamp({ ...doc, objects }, at);
}

function updateObject(doc, id, patch, at) {
  let changed = false;
  const objects = doc.objects.map((o) => {
    if (o.id !== id) return o;
    const next = { ...o, ...patch };
    if (Object.keys(patch).every((k) => Object.is(o[k], patch[k]) || (k === "props" && sameProps(o.props, patch.props)))) return o;
    changed = true;
    return next;
  });
  return changed ? withObjects(doc, objects, at) : doc;
}

function sameProps(a, b) {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
}

/** Apply a document change using the right history rule (live / merge / new step). */
function applyEdit(s, nextDoc, group) {
  if (nextDoc === s.history.present) return s;
  if (s.pending) return { ...s, history: H.replacePresent(s.history, nextDoc), notice: null };
  if (group && s.group === group) return { ...s, history: H.replacePresent(s.history, nextDoc), notice: null };
  return { ...s, history: H.commit(s.history, nextDoc), group: group ?? null, notice: null };
}

function pruneSelection(s) {
  return s.selectedId && !selectObject(s) ? { ...s, selectedId: null } : s;
}

const needSelection = (s, id) => {
  const target = selectObject(s, id ?? s.selectedId);
  return target ? { target } : { error: note(s, "warning", "Select an object first.") };
};

// ---- reducer ---------------------------------------------------------------------------------
export function editorReducer(state, action) {
  const next = reduce(state, action);
  // Any action outside the open merge group (other than a notice timeout) closes that group.
  if (next.group && !action.group && action.type !== "DISMISS_NOTICE") return { ...next, group: null };
  return next;
}

function reduce(s, a) {
  switch (a.type) {
    case "ADD_OBJECT": {
      const doc = s.history.present;
      if (doc.objects.length >= MAX_OBJECTS) return note(s, "warning", `The workspace is full (${MAX_OBJECTS} objects). Delete something first.`);
      const errors = validateObject({ ...a.object, layer: doc.objects.length }, undefined, "object", doc.type);
      if (errors.length) return note(s, "warning", `That object can't be added: ${errors[0]}.`);
      if (doc.objects.some((o) => o.id === a.object.id)) return note(s, "warning", "An object with that id already exists.");
      const placed = { ...a.object, layer: doc.objects.length };
      Object.assign(placed, clampPosition(placed, doc.canvas));
      const edited = applyEdit(s, withObjects(doc, [...doc.objects, placed], a.at));
      return { ...edited, selectedId: placed.id };
    }

    case "SELECT": {
      if (a.id === null || a.id === undefined) return s.selectedId === null ? s : { ...s, selectedId: null };
      if (!selectObject(s, a.id)) return note(s, "warning", "That object no longer exists.");
      return s.selectedId === a.id ? s : { ...s, selectedId: a.id };
    }

    case "MOVE":
    case "MOVE_BY": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const wantX = a.type === "MOVE" ? a.x : target.x + a.dx;
      const wantY = a.type === "MOVE" ? a.y : target.y + a.dy;
      if (![wantX, wantY].every(Number.isFinite)) return note(s, "warning", "That position isn't valid.");
      const pos = clampPosition(target, s.history.present.canvas, wantX, wantY);
      if (pos.x === target.x && pos.y === target.y) {
        const blocked = a.type === "MOVE_BY" && (wantX !== target.x || wantY !== target.y);
        return blocked ? note(s, "info", "That's the edge of the workspace.") : s;
      }
      return applyEdit(s, updateObject(s.history.present, target.id, pos, a.at), a.group);
    }

    case "ROTATE":
    case "ROTATE_BY": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const raw = a.type === "ROTATE" ? a.rotation : target.rotation + (a.delta ?? ROTATE_STEP);
      if (!Number.isFinite(raw)) return note(s, "warning", "That angle isn't valid.");
      const rotated = { ...target, rotation: normalizeAngle(raw) };
      const patch = { rotation: rotated.rotation, ...clampPosition(rotated, s.history.present.canvas) };
      return applyEdit(s, updateObject(s.history.present, target.id, patch, a.at), a.group);
    }

    case "RESIZE":
    case "RESIZE_BY": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const def = OBJECT_TYPES[target.type];
      const canvas = s.history.present.canvas;
      const maxSide = Math.min(def.maxSize, canvas.width, canvas.height);
      const limit = (v) => round2(clamp(v, def.minSize, maxSide));
      const wantW = a.type === "RESIZE" ? a.width ?? target.width : target.width * (a.factor ?? RESIZE_FACTOR);
      const wantH = a.type === "RESIZE" ? a.height ?? target.height : target.height * (a.factor ?? RESIZE_FACTOR);
      if (![wantW, wantH].every(Number.isFinite)) return note(s, "warning", "That size isn't valid.");
      const sized = { ...target, width: limit(wantW), height: limit(wantH) };
      if (sized.width === target.width && sized.height === target.height) {
        if (wantW === target.width && wantH === target.height) return s;
        const bigger = wantW + wantH > target.width + target.height;
        return note(s, "info", `That's as ${bigger ? "large" : "small"} as a ${def.label.toLowerCase()} can get.`);
      }
      const patch = { width: sized.width, height: sized.height, ...clampPosition(sized, canvas) };
      return applyEdit(s, updateObject(s.history.present, target.id, patch, a.at), a.group);
    }

    case "SET_PROP": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const pdef = OBJECT_TYPES[target.type].props[a.key];
      if (!pdef) return note(s, "warning", `A ${OBJECT_TYPES[target.type].label.toLowerCase()} has no "${a.key}" setting.`);
      const candidate = { ...target, props: { ...target.props, [a.key]: a.value } };
      if (validateObject(candidate, undefined, "object", s.history.present.type).length) return note(s, "warning", `That value isn't allowed for ${pdef.label.toLowerCase()}.`);
      return applyEdit(s, updateObject(s.history.present, target.id, { props: candidate.props }, a.at), a.group);
    }

    case "DELETE": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const doc = s.history.present;
      const objects = normalizeLayers(doc.objects.filter((o) => o.id !== target.id));
      const edited = applyEdit(s, withObjects(doc, objects, a.at));
      return { ...edited, selectedId: edited.selectedId === target.id ? null : edited.selectedId };
    }

    case "REORDER": {
      const { target, error } = needSelection(s, a.id);
      if (error) return error;
      const doc = s.history.present;
      const from = doc.objects.findIndex((o) => o.id === target.id);
      const last = doc.objects.length - 1;
      const to = { front: last, back: 0, forward: Math.min(last, from + 1), backward: Math.max(0, from - 1) }[a.to];
      if (to === undefined) return note(s, "warning", "Unknown layer move.");
      if (to === from) return note(s, "info", from === last && (a.to === "front" || a.to === "forward") ? "It's already at the front." : "It's already at the back.");
      const list = doc.objects.filter((o) => o.id !== target.id);
      list.splice(to, 0, target);
      return applyEdit(s, withObjects(doc, normalizeLayers(list.map((o, i) => ({ ...o, layer: i }))), a.at));
    }

    case "BEGIN_TRANSACTION":
      return s.pending ? s : { ...s, pending: { base: s.history.present }, group: null };

    case "COMMIT_TRANSACTION": {
      if (!s.pending) return s;
      const { base } = s.pending;
      const present = s.history.present;
      // Put the pre-drag document back as `present`, then commit the finished one as ONE step.
      const reopened = { ...s.history, present: base };
      return { ...s, pending: null, group: null, history: H.commit(reopened, present) };
    }

    case "CANCEL_TRANSACTION": {
      if (!s.pending) return s;
      return pruneSelection({ ...s, pending: null, group: null, history: H.replacePresent(s.history, s.pending.base) });
    }

    case "END_GROUP":
      return s.group ? { ...s, group: null } : s;

    case "UNDO": {
      if (s.pending) return s;
      if (!H.canUndo(s.history)) return note(s, "info", "There's nothing to undo.");
      return pruneSelection({ ...s, group: null, notice: null, history: H.undo(s.history) });
    }

    case "REDO": {
      if (s.pending) return s;
      if (!H.canRedo(s.history)) return note(s, "info", "There's nothing to redo.");
      return pruneSelection({ ...s, group: null, notice: null, history: H.redo(s.history) });
    }

    case "RESET": {
      if (s.pending) return s;
      if (sameContent(s.history.present, s.initial)) return note(s, "info", "Already back at the start.");
      // Reset is itself one undoable step, so an accidental reset can be undone.
      const edited = applyEdit(s, stamp(s.initial, a.at));
      return pruneSelection({ ...edited, group: null });
    }

    case "LOAD_PROJECT": {
      const check = validateProject(a.project);
      if (!check.ok) return note(s, "warning", `That project can't be opened: ${check.errors[0]}.`);
      return createEditorState(a.project);
    }

    case "DISMISS_NOTICE":
      return s.notice && (a.id === undefined || a.id === s.notice.id) ? { ...s, notice: null } : s;

    default:
      return s;
  }
}

function sameContent(a, b) {
  return JSON.stringify([a.title, a.canvas, a.objects, a.metadata]) === JSON.stringify([b.title, b.canvas, b.objects, b.metadata]);
}
