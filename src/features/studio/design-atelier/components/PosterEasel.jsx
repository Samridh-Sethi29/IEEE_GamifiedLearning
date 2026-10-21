import React, { useRef, useState } from "react";
import { Copy, Edit3, Move, Palette, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Creative Poster Easel
 * An exhibition poster display with freeform creative positioning,
 * interactive scale slider, rotation, double-click inline typing,
 * and neon alignment glow.
 */
export default function PosterEasel({
  elements,
  bgColor,
  selectedId,
  isScanning,
  isPreview,
  onSelect,
  onUpdateElement,
  onRemoveElement,
}) {
  const frameRef = useRef(null);
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
    if (!dragState || !frameRef.current) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const rect = frameRef.current.getBoundingClientRect();

    const newX = Math.max(-20, Math.min(rect.width - 50, dragState.initX + dx));
    const newY = Math.max(-10, Math.min(rect.height - 40, dragState.initY + dy));

    onUpdateElement(dragState.elId, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const handleRotate = (e, el) => {
    e.stopPropagation();
    const cur = el.rotation || 0;
    onUpdateElement(el.id, { rotation: (cur + 15) % 360 });
  };

  const handleResize = (e, el, factor) => {
    e.stopPropagation();
    const curScale = el.scale || 1;
    const newScale = Math.max(0.65, Math.min(2.4, +(curScale * factor).toFixed(2)));
    onUpdateElement(el.id, { scale: newScale });
  };

  return (
    <div
      className="atelier-easel-stage"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        onSelect(null);
        setEditingId(null);
      }}
    >
      <div
        ref={frameRef}
        className="atelier-poster-frame"
        style={{ backgroundColor: bgColor }}
        data-testid="poster-frame"
      >
        {/* Critique Scanner Beam */}
        {isScanning && <div className="atelier-critique-scan" />}

        {/* Empty Canvas Friendly Helper */}
        {elements.length === 0 && !isPreview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <span className="text-4xl mb-2 opacity-40">✨🎨</span>
            <span className="text-sm font-extrabold text-slate-300 tracking-wide">
              YOUR BLANK CANVAS AWAITS
            </span>
            <span className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Use the palette on the right to drop headings, stickers & badges!
            </span>
          </div>
        )}

        {/* Elements */}
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
              {/* Floating Action Ribbon on Selected */}
              {isSelected && (
                <div className="atelier-item-toolbar">
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleRotate(e, el)}
                    title="Rotate angle"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleResize(e, el, 1.15)}
                    title="Size up (+)"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn"
                    onClick={(e) => handleResize(e, el, 0.85)}
                    title="Size down (-)"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    className="atelier-tool-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveElement(el.id);
                    }}
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {/* Text Render */}
              {el.type === "text" && (
                <div className="p-1 cursor-text">
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-slate-900/90 text-white font-extrabold px-3 py-1.5 border-2 border-pink-500 rounded-lg outline-none shadow-2xl"
                      style={{ fontSize: `${el.fontSize || 20}px` }}
                      value={el.text}
                      autoFocus
                      onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: `${el.fontSize || 20}px`,
                        fontWeight: el.variant === "heading" ? 900 : 700,
                        color: el.color || "#ffffff",
                        letterSpacing: el.variant === "heading" ? "0.05em" : "normal",
                      }}
                      className="select-none drop-shadow-lg block font-sans"
                    >
                      {el.text}
                    </span>
                  )}
                </div>
              )}

              {/* Action Badge Render */}
              {el.type === "badge" && (
                <div className="cursor-text">
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-full outline-none shadow-2xl"
                      value={el.text}
                      autoFocus
                      onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    />
                  ) : (
                    <span className="inline-block bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black px-5 py-2 rounded-full shadow-2xl text-xs uppercase tracking-wider transform hover:scale-105 transition-transform">
                      ⚡ {el.text}
                    </span>
                  )}
                </div>
              )}

              {/* Sticker Illustration Render */}
              {el.type === "sticker" && (
                <div className="flex items-center justify-center p-1">
                  <span className="text-6xl drop-shadow-2xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    {el.icon}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
