import { useCallback, useEffect, useState } from "react";
import { Play, Redo2, RotateCcw, Save, Trash2, Undo2, Upload } from "lucide-react";
import Canvas from "./Canvas.jsx";
import Palette from "./Palette.jsx";
import PropertiesPanel from "./PropertiesPanel.jsx";
import { actions } from "./actions.js";
import { GROUP_RELEASE_KEYS, keyToAction } from "./keyboard.js";
import { OBJECT_TYPES } from "./objectTypes.js";
import { useEditor } from "./useEditor.js";
import WaterPortOverlay from "../world-builder/components/WaterPortOverlay.jsx";
import VillageTrialCard from "../world-builder/components/VillageTrialCard.jsx";
import { isTrialStale, runVillageTrial } from "../world-builder/engine/villageTrialModel.js";
import { getBuilderHint } from "../world-builder/engine/builderHint.js";
import { WORLD_BUILDER_PALETTE_HINTS } from "../world-builder/data/paletteHints.js";
import "./engine.css";

// Shared editing workspace: palette + canvas + properties + toolbar.
// It knows nothing about a particular activity or the player profile. Activities pass in an
// initial project (and, optionally, a storage adapter for the demo save/load buttons).

const isTextEntry = (el) => !!el?.closest?.("input, textarea, select, [contenteditable='true']");

export default function EditorWorkspace({ initialProject, storage, renderOverlay, onBackToBriefing }) {
  const { state, dispatch, doc, selected, canUndo, canRedo } = useEditor(initialProject);
  const [saveMsg, setSaveMsg] = useState(null); // { kind, text, offerReplace? }
  const [trialResult, setTrialResult] = useState(null);
  const [trialDoc, setTrialDoc] = useState(null);

  const runTrial = useCallback(() => {
    const result = runVillageTrial(doc);
    setTrialResult(result);
    setTrialDoc(doc);
  }, [doc]);

  const isTrialResultStale = trialDoc !== null && isTrialStale(trialDoc, doc);

  // Auto-dismiss notices. Each notice has a unique id, so a repeat of the same message re-arms it.
  const noticeId = state.notice?.id;
  useEffect(() => {
    if (!noticeId) return undefined;
    const t = setTimeout(() => dispatch(actions.dismissNotice(noticeId)), 4500);
    return () => clearTimeout(t);
  }, [noticeId, dispatch]);

  const add = useCallback(
    (type) => {
      const n = doc.objects.length;
      const x = doc.canvas.width / 2 + ((n % 6) - 2.5) * 24;
      const y = doc.canvas.height / 2 + ((n % 6) - 2.5) * 16;
      dispatch(actions.addObject(type, { x, y }));
    },
    [doc.objects.length, doc.canvas.width, doc.canvas.height, dispatch],
  );

  const onCanvasKey = (e) => {
    const a = keyToAction(e, { hasSelection: !!selected, scope: "canvas" });
    if (!a) return;
    e.preventDefault();
    e.stopPropagation(); // handled here; keep the workspace-level handler from repeating it
    dispatch(a);
  };
  const onCanvasKeyUp = (e) => {
    if (GROUP_RELEASE_KEYS.includes(e.key)) dispatch(actions.endGroup());
  };

  // Undo/redo shortcuts work anywhere in the workspace except inside text fields.
  const onRootKey = (e) => {
    if (isTextEntry(e.target)) return;
    const a = keyToAction(e, { hasSelection: !!selected, scope: "global" });
    if (a) {
      e.preventDefault();
      dispatch(a);
    }
  };

  const save = (opts) => {
    const r = storage.save(state.history.present, opts);
    if (r.ok) setSaveMsg({ kind: "ok", text: "Saved on this device." });
    else setSaveMsg({ kind: "error", text: r.message, offerReplace: r.code === "would_overwrite_unreadable" });
  };
  const load = () => {
    const r = storage.load();
    if (!r.ok) return setSaveMsg({ kind: "error", text: r.message });
    if (r.empty) return setSaveMsg({ kind: "info", text: "Nothing has been saved yet." });
    dispatch(actions.load(r.project));
    setSaveMsg({ kind: "ok", text: "Loaded your saved workspace." });
  };

  const sel = selected ? OBJECT_TYPES[selected.type].label : null;
  const status = sel
    ? `${sel} selected at ${Math.round(selected.x)}, ${Math.round(selected.y)}, rotated ${Math.round(selected.rotation)} degrees.`
    : "No object selected.";

  return (
    <div className="sce-workspace" onKeyDown={onRootKey} data-testid="sce-workspace">
      <div className="sce-toolbar" role="toolbar" aria-label="Editing tools">
        <div className="sce-group" role="group" aria-label="History">
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.undo())} disabled={!canUndo} data-testid="sce-undo">
          <Undo2 size={16} aria-hidden="true" /> <span className="sce-btn-label">Undo</span>
        </button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.redo())} disabled={!canRedo} data-testid="sce-redo">
          <Redo2 size={16} aria-hidden="true" /> <span className="sce-btn-label">Redo</span>
        </button>
        </div>
        <div className="sce-group" role="group" aria-label="Object">
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.remove())} disabled={!selected} data-testid="sce-delete">
          <Trash2 size={16} aria-hidden="true" /> <span className="sce-btn-label">Delete</span>
        </button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.reset())} data-testid="sce-reset">
          <RotateCcw size={16} aria-hidden="true" /> <span className="sce-btn-label">Reset</span>
        </button>
        </div>
        {storage && (
          <>
            <div className="sce-group" role="group" aria-label="Save and load">
            <button type="button" className="sce-btn" onClick={() => save()} data-testid="sce-save">
              <Save size={16} aria-hidden="true" /> <span className="sce-btn-label">Save</span>
            </button>
            <button type="button" className="sce-btn" onClick={load} data-testid="sce-load">
              <Upload size={16} aria-hidden="true" /> <span className="sce-btn-label">Load</span>
            </button>
            </div>
          </>
        )}
        {doc.type === "world-builder" && (
          <div className="sce-group wb-trial-toolbar-group" role="group" aria-label="Village Trial">
            <button
              type="button"
              className="sce-btn wb-test-village-btn wb-primary-btn"
              onClick={runTrial}
              data-testid="wb-test-village-btn"
            >
              <Play size={15} aria-hidden="true" fill="currentColor" /> <span className="sce-btn-label">Test Village</span>
            </button>
          </div>
        )}
        <span className="sce-count" data-testid="sce-count">{doc.objects.length} {doc.objects.length === 1 ? "object" : "objects"}</span>
      </div>

      <div className="sce-messages" data-testid="sce-status">
        {!state.notice && !saveMsg && (
          <p className="sce-hint-default">
            {doc.type === "world-builder"
              ? getBuilderHint(doc, selected).text
              : doc.objects.length === 0 ? "Ready. Pick an object from the palette to begin." : selected ? "Drag it, or use the controls on the right." : "Click an object to select it."}
          </p>
        )}
        <p
          className={`sce-notice${state.notice ? ` sce-notice--${state.notice.kind}` : ""}`}
          role="status"
          aria-live="polite"
          data-testid="sce-notice"
        >
          {state.notice?.message ?? ""}
        </p>
        {saveMsg && (
          <p className={`sce-save sce-save--${saveMsg.kind}`} role="status" data-testid="sce-save-msg">
            {saveMsg.text}{" "}
            {saveMsg.offerReplace && (
              <button type="button" className="sce-link" onClick={() => save({ replaceUnreadable: true })}>
                Replace it (a backup copy is kept)
              </button>
            )}
          </p>
        )}
      </div>

      <div className="sce-layout">
        <Palette onAdd={add} projectType={doc.type} doc={doc} hints={doc.type === "world-builder" ? WORLD_BUILDER_PALETTE_HINTS : undefined} />
        <div className="sce-stage">
          {trialResult && doc.type === "world-builder" && (
            <VillageTrialCard
              trialResult={trialResult}
              isStale={isTrialResultStale}
              onRetest={runTrial}
              onDismiss={() => {
                setTrialResult(null);
                setTrialDoc(null);
              }}
            />
          )}
          <div className="sce-canvas-wrap">
            <Canvas
              doc={doc}
              selectedId={state.selectedId}
              dispatch={dispatch}
              onKeyDown={onCanvasKey}
              onKeyUp={onCanvasKeyUp}
              onBlur={() => dispatch(actions.endGroup())}
              overlay={
                renderOverlay
                  ? renderOverlay({ doc, selectedId: state.selectedId, selected })
                  : doc.type === "world-builder"
                  ? (
                    <WaterPortOverlay
                      doc={doc}
                      selectedId={state.selectedId}
                      highlightedObjectIds={
                        trialResult?.ok && !isTrialResultStale ? trialResult.participatingIds : null
                      }
                    />
                  )
                  : null
              }
            />
          </div>
          <p className="sce-sr" role="status" aria-live="polite">{status}</p>
          <details className="sce-keys">
            <summary>Keyboard controls</summary>
            <ul>
              <li><kbd>Tab</kbd> to an object, then <kbd>Enter</kbd> to select it</li>
              <li><kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> move (hold <kbd>Shift</kbd> for small steps)</li>
              <li><kbd>R</kbd> rotate (<kbd>Shift</kbd>+<kbd>R</kbd> the other way), <kbd>+</kbd> / <kbd>−</kbd> resize</li>
              <li><kbd>[</kbd> / <kbd>]</kbd> layer down / up, <kbd>Delete</kbd> remove, <kbd>Esc</kbd> deselect</li>
              <li><kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Z</kbd> undo, <kbd>Shift</kbd>+<kbd>Z</kbd> redo</li>
            </ul>
          </details>
        </div>
        <PropertiesPanel doc={doc} selected={selected} dispatch={dispatch} onBackToBriefing={onBackToBriefing} />
      </div>
    </div>
  );
}
