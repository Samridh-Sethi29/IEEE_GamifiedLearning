import { actions } from "../actions.js";
import { createEditorState, editorReducer } from "../editorReducer.js";
import { createProject } from "../schema.js";

export function deepFreeze(o) {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    Object.values(o).forEach(deepFreeze);
  }
  return o;
}

const NOW = "2026-01-01T00:00:00.000Z";
export const newProject = (extra = {}) => deepFreeze(createProject({ id: "p1", now: NOW, ...extra }));

/** Reducer wrapper that deep-freezes state after every step, so any mutation throws. */
export function makeEditor(project = newProject()) {
  let state = deepFreeze(createEditorState(project));
  return {
    get state() { return state; },
    get doc() { return state.history.present; },
    get past() { return state.history.past.length; },
    get future() { return state.history.future.length; },
    do(action) { state = deepFreeze(editorReducer(state, action)); return state; },
    obj(id) { return state.history.present.objects.find((o) => o.id === id); },
  };
}

export const add = (ed, type, id, pos = {}) => ed.do(actions.addObject(type, { id, x: 400, y: 250, ...pos }));
