// Undo/redo as a pure "past / present / future" structure of whole-document snapshots.
// Documents are immutable, so snapshots share unchanged objects and are cheap to keep.
// Undo/redo therefore restores real previous documents rather than reversing an effect.

import { HISTORY_LIMIT } from "./constants.js";

export const createHistory = (present) => ({ past: [], present, future: [] });
export const canUndo = (h) => h.past.length > 0;
export const canRedo = (h) => h.future.length > 0;

/** Commit `next` as a new undoable step. Drops redo history and trims to the limit. */
export function commit(h, next, limit = HISTORY_LIMIT) {
  if (next === h.present) return h;
  const past = [...h.past, h.present];
  while (past.length > limit) past.shift();
  return { past, present: next, future: [] };
}

/** Change the present WITHOUT adding a step (used while a drag is in progress, or when merging). */
export function replacePresent(h, next) {
  return next === h.present ? h : { ...h, present: next };
}

export function undo(h) {
  if (!canUndo(h)) return h;
  const past = h.past.slice(0, -1);
  return { past, present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
}

export function redo(h) {
  if (!canRedo(h)) return h;
  const [next, ...future] = h.future;
  return { past: [...h.past, h.present], present: next, future };
}
