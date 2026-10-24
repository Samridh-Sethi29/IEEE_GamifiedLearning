import { useCallback, useMemo, useReducer } from "react";
import { createEditorState, editorReducer, exportProject, selectCanRedo, selectCanUndo, selectObject } from "./editorReducer.js";

/**
 * React binding for the pure editor reducer. Adds the only impure bit: a timestamp on actions.
 * Holds editor state locally. It is NOT connected to the player profile.
 */
export function useEditor(initialProject) {
  const [state, rawDispatch] = useReducer(editorReducer, initialProject, createEditorState);
  const dispatch = useCallback((action) => rawDispatch(action.at === undefined ? { ...action, at: Date.now() } : action), []);
  return useMemo(
    () => ({
      state,
      dispatch,
      doc: state.history.present,
      selected: selectObject(state),
      canUndo: selectCanUndo(state),
      canRedo: selectCanRedo(state),
      exportProject: () => exportProject(state),
    }),
    [state, dispatch],
  );
}
