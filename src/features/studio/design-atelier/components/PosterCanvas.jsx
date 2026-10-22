import React, { useRef, useState } from "react";
import { Edit3, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Interactive Poster Canvas
 * Supports:
 * - Direct drag and drop of elements
 * - Selection outline and quick action toolbar (+, -, rotate, delete)
 * - Inline text editing on double-click
 * - Clean preview mode
 * - Design Coach scan line animation
 */
export default function PosterCanvas({
  elements,
  bgColor,
  selectedId,
  isScanning,
  isPreview,
  onSelect,
  onUpdateElement,
  onRemoveElement,
}) {
  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handlePointerDown = (e, el) => {
    if (isPreview || e.target.closest(".atelier-item-toolbar")) return;
    e.stopPropagation();
    onSelect(el.id);
    setDragState({
      elId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: el.x,
      initY: el.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState || !canvasRef.current) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const rect = canvasRef.current.getBoundingClientRect();

    const newX = Math.max(-20, Math.min(rect.width - 50, dragState.initX + dx));
    const newY = Math.max(-10, Math.min(rect.height - 40, dragState.initY + dy));

    onUpdateElement(dragState.elId, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  // Rotate
  const handleRotate = (e, el) => {
    e.stopPropagation();
    const cur = el.rotation || 0;
    onUpdateElement(el.id, { rotation: (cur + 15) % 360 });
  };

  // Resize
  const handleResize = (e, el, factor) => {
    e.stopPropagation();
    const curScale = el.scale || 1;
    const newScale = Math.max(0.6, Math.min(2.2, +(curScale * factor).toFixed(2)));
    onUpdateElement(el.id, { scale: newScale });
  };

  return (
    <div
      className="atelier-desk"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        onSelect(null);
        setEditingId(null);
      }}
    >
      <div
        ref={canvasRef}
        className="atelier-poster-canvas"
        style={{ backgroundColor: bgColor }}
        data-testid="poster-canvas"
      >
        {/* Design Coach Scanning Line */}
        {isScanning && <div className="atelier-scanning-line" />}

        {/* Canvas Elements */}
        {elements.map((el) => {
          const isSelected = !isPreview && selectedId === el.id;
          const isEditing = editingId === el.id;
          const scale = el.scale || 1;

          return (
            <div
              key={el.id}
              className={`atelier-canvas-item ${isSelected ? "selected" : ""}`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                transform: `rotate(${el.rotation || 0}deg) scale(${scale})`,
                transformOrigin: "center center",
                zIndex: isSelected ? 30 : 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, el)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === "text" || el.type === "badge") {
                  setEditingId(el.id);
                }
              }}
            >
              {/* Quick Action Toolbar on Selected */}
              {isSelected && (
                <div className="atelier-item-toolbar">
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleRotate(e, el)}
                    title="Rotate element"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleResize(e, el, 1.15)}
                    title="Make Bigger (+)"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleResize(e, el, 0.85)}
                    title="Make Smaller (-)"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveElement(el.id);
                    }}
                    title="Delete element"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {/* Render Typography */}
              {el.type === "text" && (
                <div className="p-1 cursor-text">
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-slate-900 text-white font-bold px-2 py-1 border border-violet-400 rounded outline-none"
                      style={{ fontSize: `${el.fontSize || 18}px` }}
                      value={el.text}
                      autoFocus
                      onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: `${el.fontSize || 18}px`,
                        fontWeight: el.variant === "heading" ? 900 : 700,
                        color: el.color || "#ffffff",
                        letterSpacing: el.variant === "heading" ? "0.04em" : "normal",
                      }}
                      className="select-none drop-shadow-md"
                    >
                      {el.text}
                    </span>
                  )}
                </div>
              )}

              {/* Render Action Badge */}
              {el.type === "badge" && (
                <div className="cursor-text">
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-full outline-none"
                      value={el.text}
                      autoFocus
                      onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    />
                  ) : (
                    <span className="inline-block bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-lg text-sm uppercase tracking-wider">
                      {el.text}
                    </span>
                  )}
                </div>
              )}

              {/* Render Sticker Illustration */}
              {el.type === "sticker" && (
                <div className="flex items-center justify-center p-2">
                  <span className="text-6xl drop-shadow-2xl">{el.icon}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
