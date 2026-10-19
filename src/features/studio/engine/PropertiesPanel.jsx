import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Trash2 } from "lucide-react";
import CollapsiblePanel from "./CollapsiblePanel.jsx";
import { actions } from "./actions.js";
import { ROTATE_STEP } from "./constants.js";
import { COLOR_CHOICES, OBJECT_TYPES } from "./objectTypes.js";

// Accessible controls for the selected object: number fields + sliders (no dragging needed),
// colour swatches, layer buttons, delete, and a layer list to pick any object without a pointer.

export default function PropertiesPanel({ doc, selected, dispatch }) {
  const [lock, setLock] = useState(true);
  const endGroup = () => dispatch(actions.endGroup());
  // Spread onto controls so one slider drag / typing burst is a single undo step.
  const grouped = { onPointerUp: endGroup, onKeyUp: endGroup, onBlur: endGroup };
  const num = (v) => (v === "" ? NaN : Number(v));

  return (
    <CollapsiblePanel id="sce-props" title="Properties" className="sce-props" testId="sce-props">

      {!selected ? (
        <p className="sce-hint" data-testid="sce-no-selection">
          Nothing selected. Click an object, or choose one from the layer list below.
        </p>
      ) : (
        <SelectedControls {...{ doc, selected, dispatch, lock, setLock, grouped, num }} />
      )}

      <h3 className="sce-subtitle">Layers (front first)</h3>
      {doc.objects.length === 0 ? (
        <p className="sce-hint">No objects yet.</p>
      ) : (
        <ol className="sce-layers" reversed data-testid="sce-layers">
          {[...doc.objects].reverse().map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="sce-layer-btn"
                aria-pressed={o.id === selected?.id}
                onClick={() => dispatch(actions.select(o.id))}
              >
                {OBJECT_TYPES[o.type].label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </CollapsiblePanel>
  );
}

function SelectedControls({ doc, selected, dispatch, lock, setLock, grouped, num }) {
  const def = OBJECT_TYPES[selected.type];
  const maxSide = Math.min(def.maxSize, doc.canvas.width, doc.canvas.height);
  const g = (kind) => `ui-${kind}-${selected.id}`;
  const setSize = (which, raw) => {
    const v = num(raw);
    if (Number.isNaN(v)) return;
    const ratio = selected.width / selected.height;
    if (!lock) return dispatch(actions.resizeTo(which === "w" ? v : selected.width, which === "h" ? v : selected.height, g("size")));
    dispatch(which === "w" ? actions.resizeTo(v, v / ratio, g("size")) : actions.resizeTo(v * ratio, v, g("size")));
  };

  return (
    <div className="sce-controls" data-testid="sce-selected">
      <p className="sce-selected-name">
        {def.label} <span className="sce-chip">selected</span>
      </p>

      <div className="sce-row">
        <label>
          X
          <input type="number" value={Math.round(selected.x)} onChange={(e) => { const v = num(e.target.value); if (!Number.isNaN(v)) dispatch(actions.moveTo(v, selected.y, { group: g("move") })); }} {...grouped} data-testid="sce-x" />
        </label>
        <label>
          Y
          <input type="number" value={Math.round(selected.y)} onChange={(e) => { const v = num(e.target.value); if (!Number.isNaN(v)) dispatch(actions.moveTo(selected.x, v, { group: g("move") })); }} {...grouped} data-testid="sce-y" />
        </label>
      </div>

      <label className="sce-slider">
        <span>Rotation <b>{Math.round(selected.rotation)}°</b></span>
        <input type="range" min={0} max={359} step={1} value={Math.round(selected.rotation)} onChange={(e) => dispatch(actions.rotateTo(Number(e.target.value), g("rotate")))} {...grouped} data-testid="sce-rotation" />
      </label>
      <div className="sce-btn-row">
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.rotateBy(-ROTATE_STEP))}>Rotate −{ROTATE_STEP}°</button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.rotateBy(ROTATE_STEP))}>Rotate +{ROTATE_STEP}°</button>
      </div>

      <label className="sce-slider">
        <span>Width <b>{Math.round(selected.width)}</b></span>
        <input type="range" min={def.minSize} max={maxSide} step={1} value={Math.round(selected.width)} onChange={(e) => setSize("w", e.target.value)} {...grouped} data-testid="sce-width" />
      </label>
      <label className="sce-slider">
        <span>Height <b>{Math.round(selected.height)}</b></span>
        <input type="range" min={def.minSize} max={maxSide} step={1} value={Math.round(selected.height)} onChange={(e) => setSize("h", e.target.value)} {...grouped} data-testid="sce-height" />
      </label>
      <label className="sce-check">
        <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Keep proportions
      </label>

      {Object.entries(def.props).map(([key, pdef]) =>
        pdef.kind === "color" ? (
          <fieldset className="sce-swatches" key={key}>
            <legend>{pdef.label}</legend>
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                className="sce-swatch"
                style={{ background: c }}
                aria-label={`${pdef.label} ${c}`}
                aria-pressed={selected.props[key].toLowerCase() === c}
                onClick={() => dispatch(actions.setProp(key, c))}
              />
            ))}
          </fieldset>
        ) : (
          <label className="sce-slider" key={key}>
            <span>{pdef.label} <b>{selected.props[key]}</b></span>
            <input type="range" min={pdef.min} max={pdef.max} step={1} value={selected.props[key]} onChange={(e) => dispatch(actions.setProp(key, Number(e.target.value), g(key)))} {...grouped} />
          </label>
        ),
      )}

      <div className="sce-btn-row" role="group" aria-label="Layer order">
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.reorder("front"))} title="Bring to front"><ChevronsUp size={16} aria-hidden="true" /> Front</button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.reorder("forward"))} title="Move forward"><ArrowUp size={16} aria-hidden="true" /> Forward</button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.reorder("backward"))} title="Move backward"><ArrowDown size={16} aria-hidden="true" /> Back one</button>
        <button type="button" className="sce-btn" onClick={() => dispatch(actions.reorder("back"))} title="Send to back"><ChevronsDown size={16} aria-hidden="true" /> Back</button>
      </div>

      <button type="button" className="sce-btn sce-btn--danger" onClick={() => dispatch(actions.remove())} data-testid="sce-delete-side">
        <Trash2 size={16} aria-hidden="true" /> Delete object
      </button>
    </div>
  );
}
