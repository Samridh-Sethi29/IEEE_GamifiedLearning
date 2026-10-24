// Pure keyboard mapping: a key event description in, an action (or null) out.
// Kept free of DOM/React so it can be unit-tested. The component decides WHEN it applies
// (only while focus is on the canvas, never inside text inputs / sliders).

import { MOVE_STEP, MOVE_STEP_FINE, RESIZE_FACTOR, ROTATE_STEP } from "./constants.js";
import { actions } from "./actions.js";

/**
 * @param {{key:string, shiftKey?:boolean, ctrlKey?:boolean, metaKey?:boolean}} e
 * @param {{hasSelection:boolean, scope:"canvas"|"global"}} ctx
 * @returns {object|null} an editor action, or null if the key isn't ours
 */
export function keyToAction(e, { hasSelection, scope }) {
  const mod = e.ctrlKey || e.metaKey;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (mod && k === "z") return e.shiftKey ? actions.redo() : actions.undo();
  if (mod && k === "y") return actions.redo();
  if (scope !== "canvas" || mod) return null;

  if (k === "Escape") return actions.select(null);
  if (!hasSelection) return null;

  const step = e.shiftKey ? MOVE_STEP_FINE : MOVE_STEP;
  switch (k) {
    case "ArrowLeft": return actions.moveBy(-step, 0, "kb-move");
    case "ArrowRight": return actions.moveBy(step, 0, "kb-move");
    case "ArrowUp": return actions.moveBy(0, -step, "kb-move");
    case "ArrowDown": return actions.moveBy(0, step, "kb-move");
    case "r": return actions.rotateBy(e.shiftKey ? -ROTATE_STEP : ROTATE_STEP, "kb-rotate");
    case "+": case "=": return actions.resizeBy(RESIZE_FACTOR, "kb-resize");
    case "-": case "_": return actions.resizeBy(1 / RESIZE_FACTOR, "kb-resize");
    case "Delete": case "Backspace": return actions.remove();
    case "]": return actions.reorder("forward");
    case "[": return actions.reorder("backward");
    default: return null;
  }
}

/** Keys whose release should close a merge group (so each separate press is its own undo step). */
export const GROUP_RELEASE_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "r", "R", "+", "=", "-", "_"];
