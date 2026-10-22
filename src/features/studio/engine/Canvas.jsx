import { useRef } from "react";
import { actions } from "./actions.js";
import { ObjectArt } from "./objectArt.jsx";
import { OBJECT_TYPES } from "./objectTypes.js";

// SVG workspace. Pointer events (mouse, touch, pen) drive dragging through ONE transaction per
// drag: BEGIN on press, live MOVEs, COMMIT on release (a single undo step) or CANCEL when the
// browser cancels the pointer or Escape is pressed.

function toWorkspace(svg, e) {
  const m = svg.getScreenCTM();
  if (!m) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

export default function Canvas({ doc, selectedId, dispatch, onKeyDown, onKeyUp, onBlur, overlay }) {
  const svgRef = useRef(null);
  const drag = useRef(null);

  const endDrag = (commit) => {
    if (!drag.current) return;
    const { pointerId } = drag.current;
    drag.current = null;
    try { svgRef.current?.releasePointerCapture(pointerId); } catch { /* already released */ }
    dispatch(commit ? actions.commitTransaction() : actions.cancelTransaction());
  };

  const onObjectDown = (e, obj) => {
    if (e.button !== undefined && e.button !== 0) return; // primary button / touch only
    e.stopPropagation(); // never let the background see this press
    e.preventDefault(); // no text selection / native drag
    const svg = svgRef.current;
    const pt = svg && toWorkspace(svg, e);
    e.currentTarget.focus({ preventScroll: true }); // so keyboard controls work right after a click
    dispatch(actions.select(obj.id));
    if (!pt) return;
    drag.current = { id: obj.id, pointerId: e.pointerId, dx: obj.x - pt.x, dy: obj.y - pt.y };
    svg.setPointerCapture(e.pointerId);
    dispatch(actions.beginTransaction());
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const pt = toWorkspace(svgRef.current, e);
    if (pt) dispatch({ type: "MOVE", id: d.id, x: pt.x + d.dx, y: pt.y + d.dy });
  };

  const onUp = (e) => {
    if (drag.current && e.pointerId === drag.current.pointerId) endDrag(true);
  };

  const onCancel = (e) => {
    if (drag.current && e.pointerId === drag.current.pointerId) endDrag(false);
  };

  const keyDown = (e) => {
    if (e.key === "Escape" && drag.current) {
      e.preventDefault();
      endDrag(false);
      return;
    }
    onKeyDown(e);
  };

  return (
    <svg
      ref={svgRef}
      className="sce-canvas"
      style={{ aspectRatio: `${doc.canvas.width} / ${doc.canvas.height}`, "--sce-ratio": doc.canvas.width / doc.canvas.height }}
      viewBox={`0 0 ${doc.canvas.width} ${doc.canvas.height}`}
      role="application"
      aria-label={`Workspace with ${doc.objects.length} ${doc.objects.length === 1 ? "object" : "objects"}`}
      data-testid="sce-canvas"
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onLostPointerCapture={onCancel}
      onPointerDown={(e) => {
        // Background press: clear the selection only. Never starts a drag or navigates.
        if (e.target === e.currentTarget || e.target.dataset.bg) dispatch(actions.select(null));
      }}
      onKeyDown={keyDown}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
    >
      <defs>
        <pattern id="sce-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect data-bg="1" width={doc.canvas.width} height={doc.canvas.height} fill="#f8fafc" />
      <rect data-bg="1" width={doc.canvas.width} height={doc.canvas.height} fill="url(#sce-grid)" />

      {doc.objects.map((o) => {
        const selected = o.id === selectedId;
        const label = OBJECT_TYPES[o.type].label;
        const pad = 6;
        return (
          <g
            key={o.id}
            className="sce-object"
            data-selected={selected ? "true" : undefined}
            data-testid={`sce-object-${o.id}`}
            transform={`translate(${o.x} ${o.y}) rotate(${o.rotation})`}
            tabIndex={0}
            role="button"
            aria-pressed={selected}
            aria-label={`${label}, layer ${o.layer + 1} of ${doc.objects.length}${selected ? ", selected" : ""}`}
            onPointerDown={(e) => onObjectDown(e, o)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                dispatch(actions.select(o.id));
              }
            }}
            onFocus={() => dispatch(actions.select(o.id))}
          >
            <ObjectArt type={o.type} width={o.width} height={o.height} props={o.props} />
            {selected && (
              <rect
                className="sce-selection"
                x={-o.width / 2 - pad}
                y={-o.height / 2 - pad}
                width={o.width + pad * 2}
                height={o.height + pad * 2}
                rx={4}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
      {overlay}

      {doc.objects.length === 0 && (
        <g pointerEvents="none" data-testid="sce-empty">
          <text className="sce-empty-title" x={doc.canvas.width / 2} y={doc.canvas.height / 2 - 8} textAnchor="middle">
            Your workspace is empty
          </text>
          <text className="sce-empty-sub" x={doc.canvas.width / 2} y={doc.canvas.height / 2 + 24} textAnchor="middle">
            Pick something from the palette to add it here.
          </text>
        </g>
      )}
    </svg>
  );
}
