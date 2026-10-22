// Action creators. Anything impure (new ids, timestamps) happens HERE, so the reducer stays pure.
import { createId, createObject } from "./schema.js";

export const actions = {
  /** Add a new object of `type` (id is generated here, not in the reducer). */
  addObject: (type, { x, y, id = createId("obj"), props } = {}) => ({
    type: "ADD_OBJECT",
    object: createObject(type, { id, x, y, props }),
  }),
  select: (id) => ({ type: "SELECT", id }),
  moveTo: (x, y, { id, group } = {}) => ({ type: "MOVE", id, x, y, group }),
  moveBy: (dx, dy, group) => ({ type: "MOVE_BY", dx, dy, group }),
  rotateTo: (rotation, group) => ({ type: "ROTATE", rotation, group }),
  rotateBy: (delta, group) => ({ type: "ROTATE_BY", delta, group }),
  resizeTo: (width, height, group) => ({ type: "RESIZE", width, height, group }),
  resizeBy: (factor, group) => ({ type: "RESIZE_BY", factor, group }),
  setProp: (key, value, group) => ({ type: "SET_PROP", key, value, group }),
  remove: () => ({ type: "DELETE" }),
  reorder: (to) => ({ type: "REORDER", to }),
  beginTransaction: () => ({ type: "BEGIN_TRANSACTION" }),
  commitTransaction: () => ({ type: "COMMIT_TRANSACTION" }),
  cancelTransaction: () => ({ type: "CANCEL_TRANSACTION" }),
  endGroup: () => ({ type: "END_GROUP" }),
  undo: () => ({ type: "UNDO" }),
  redo: () => ({ type: "REDO" }),
  reset: () => ({ type: "RESET" }),
  load: (project) => ({ type: "LOAD_PROJECT", project }),
  dismissNotice: (id) => ({ type: "DISMISS_NOTICE", id }),
};
