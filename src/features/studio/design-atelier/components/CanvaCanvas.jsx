import React, { useRef, useState, useEffect } from "react";
import { Copy, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Creative Poster Artboard Canvas
 * Features:
 * - Direct click to type & edit ANY text or badge inline.
 * - Draggable positioning.
 * - Press & drag corner resize handles on elements, shapes, and uploaded images.
 * - Image uploads rendering.
 * - Shape rendering (rect, circle, pill, divider) with dynamic width & height.
 */
export default function CanvaCanvas({
  elements,
  bgColor,
  selectedId,
  isScanning,
  isPreview,
  onSelect,
  onUpdateElement,
  onRemoveElement,
}) {
  const artboardRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);

  // Moving element
  const handlePointerDown = (e, el) => {
    if (isPreview || e.target.closest(".canva-transform-bar") || e.target.closest(".canva-resize-handle")) return;
    onSelect(el.id);

    // If user clicked inside textarea, let them type
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
      return;
    }

    e.stopPropagation();
    setDragState({
      elId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: el.x,
      initY: el.y,
    });
  };

  // Resizing element via corner handle (press & drag)
  const handleResizePointerDown = (e, el, handleCorner) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(el.id);

    const initWidth = el.width || (el.type === "image" ? 180 : el.type === "shape" ? 160 : 200);
    const initHeight = el.height || (el.type === "image" ? 180 : el.type === "shape" ? 100 : 80);

    setResizeState({
      elId: el.id,
      corner: handleCorner,
      startX: e.clientX,
      startY: e.clientY,
      initWidth,
      initHeight,
      initScale: el.scale || 1,
      initX: el.x,
      initY: el.y,
    });
  };

  const handlePointerMove = (e) => {
    if (dragState && artboardRef.current) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const rect = artboardRef.current.getBoundingClientRect();

      const newX = Math.max(-40, Math.min(rect.width - 40, dragState.initX + dx));
      const newY = Math.max(-20, Math.min(rect.height - 40, dragState.initY + dy));

      onUpdateElement(dragState.elId, { x: Math.round(newX), y: Math.round(newY) });
      return;
    }

    if (resizeState && artboardRef.current) {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;

      const newWidth = Math.max(40, Math.min(500, Math.round(resizeState.initWidth + dx)));
      const newHeight = Math.max(20, Math.min(500, Math.round(resizeState.initHeight + dy)));

      // Also compute proportional scale for stickers / images
      const scaleDelta = (dx + dy) / 300;
      const newScale = Math.max(0.4, Math.min(3.0, +(resizeState.initScale + scaleDelta).toFixed(2)));

      onUpdateElement(resizeState.elId, {
        width: newWidth,
        height: newHeight,
        scale: newScale,
      });
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    setResizeState(null);
  };

  const handleRotate = (e, el) => {
    e.stopPropagation();
    const cur = el.rotation || 0;
    onUpdateElement(el.id, { rotation: (cur + 15) % 360 });
  };

  const handleStepScale = (e, el, factor) => {
    e.stopPropagation();
    const curScale = el.scale || 1;
    const newScale = Math.max(0.5, Math.min(3.0, +(curScale * factor).toFixed(2)));
    onUpdateElement(el.id, { scale: newScale });
  };

  return (
    <div
      className="canva-artboard-stage"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelect(null)}
    >
      <div
        ref={artboardRef}
        className="canva-poster-artboard"
        style={{ backgroundColor: bgColor }}
        data-testid="poster-artboard"
      >
        {/* Critique Scanner Beam */}
        {isScanning && <div className="atelier-critique-scan" />}

        {/* Empty Canvas Guidance */}
        {elements.length === 0 && !isPreview && (
          <div className="atl-empty">
            <div className="atl-empty-card">
              <span className="atl-empty-emoji" aria-hidden="true">🎨</span>
              <span className="atl-empty-title">Your poster starts here</span>
              <span className="atl-empty-text">
                Pick text, stickers or shapes from the tools to add them. Tap and drag to move things around!
              </span>
            </div>
          </div>
        )}

        {/* Elements */}
        {elements.map((el) => {
          const isSelected = !isPreview && selectedId === el.id;
          const scale = el.scale || 1;
          const width = el.width || (el.type === "text" ? 360 : el.type === "image" ? 200 : el.type === "shape" ? 180 : "auto");
          const height = el.height || (el.type === "shape" ? 100 : el.type === "image" ? 200 : "auto");

          return (
            <div
              key={el.id}
              className={`canva-element-box ${isSelected ? "selected" : ""}`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                transform: `rotate(${el.rotation || 0}deg) scale(${scale})`,
                transformOrigin: "center center",
                zIndex: isSelected ? 30 : 10,
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
              }}
              onPointerDown={(e) => handlePointerDown(e, el)}
            >
              {/* Canva Transform Bar on Selected */}
              {isSelected && (
                <div className="canva-transform-bar">
                  <button
                    className="canva-mini-btn"
                    onClick={(e) => handleRotate(e, el)}
                    title="Rotate element"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button
                    className="canva-mini-btn"
                    onClick={(e) => handleStepScale(e, el, 1.15)}
                    title="Scale Up (+)"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    className="canva-mini-btn"
                    onClick={(e) => handleStepScale(e, el, 0.85)}
                    title="Scale Down (-)"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    className="canva-mini-btn danger"
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

              {/* Press & Drag Corner Resize Handles on Selected */}
              {isSelected && (
                <>
                  <div
                    className="canva-resize-handle nw"
                    onPointerDown={(e) => handleResizePointerDown(e, el, "nw")}
                    title="Drag to resize"
                  />
                  <div
                    className="canva-resize-handle ne"
                    onPointerDown={(e) => handleResizePointerDown(e, el, "ne")}
                    title="Drag to resize"
                  />
                  <div
                    className="canva-resize-handle sw"
                    onPointerDown={(e) => handleResizePointerDown(e, el, "sw")}
                    title="Drag to resize"
                  />
                  <div
                    className="canva-resize-handle se"
                    onPointerDown={(e) => handleResizePointerDown(e, el, "se")}
                    title="Drag to resize"
                  />
                </>
              )}

              {/* Editable Text Area (Direct typing) */}
              {el.type === "text" && (
                <textarea
                  className="canva-inline-textarea"
                  value={el.text}
                  placeholder="Type your message..."
                  rows={Math.max(1, (el.text.match(/\n/g) || []).length + 1)}
                  style={{
                    fontSize: `${el.fontSize || 24}px`,
                    fontWeight: el.variant === "heading" ? 900 : 700,
                    color: el.color || "#ffffff",
                    textAlign: el.align || "center",
                    textTransform: el.variant === "heading" ? "uppercase" : "none",
                  }}
                  onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Action Badge */}
              {el.type === "badge" && (
                <div className="inline-block w-full text-center">
                  <input
                    type="text"
                    className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-slate-950 font-black px-6 py-2.5 rounded-full shadow-2xl text-xs uppercase tracking-wider border-none outline-none text-center cursor-text w-full"
                    value={el.text}
                    onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Visual Sticker */}
              {el.type === "sticker" && (
                <div className="flex items-center justify-center p-1 pointer-events-none select-none w-full h-full">
                  <span className="text-6xl drop-shadow-2xl">{el.icon}</span>
                </div>
              )}

              {/* Uploaded Image */}
              {el.type === "image" && (
                <div className="w-full h-full rounded-lg overflow-hidden border border-white/20 shadow-xl pointer-events-none select-none">
                  <img
                    src={el.src}
                    alt={el.name || "Upload"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Geometric Shapes (Resizable dynamically) */}
              {el.type === "shape" && (
                <div className="w-full h-full pointer-events-none select-none">
                  {el.shape === "rect" && (
                    <div
                      className="w-full h-full rounded-2xl bg-slate-800/80 border-2 border-cyan-400/80 shadow-lg"
                      style={{ backgroundColor: el.color || "rgba(30, 41, 59, 0.75)" }}
                    />
                  )}
                  {el.shape === "circle" && (
                    <div
                      className="w-full h-full rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg"
                      style={{ borderColor: el.color || "#00c4cc" }}
                    />
                  )}
                  {el.shape === "pill" && (
                    <div
                      className="w-full h-full rounded-full bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center shadow-lg"
                    />
                  )}
                  {el.shape === "divider" && (
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded mt-2" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
