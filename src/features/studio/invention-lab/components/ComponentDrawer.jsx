import React, { useState, useRef, useEffect } from "react";
import { COMPONENT_CATALOG } from "../data/missions";

/**
 * Component Drawer (Left Sidebar)
 * Filters available parts based on current active mission's allowedParts.
 * Supports:
 * 1. Desktop HTML5 drag-and-drop onto the workbench
 * 2. Mobile touch-drag with floating ghost dropped on the bench
 * 3. Tap to instantly add to workbench with visual feedback
 */
export default function ComponentDrawer({ allowedPartIds, onAddPart, onDropNewPart }) {
  const parts = (allowedPartIds || Object.keys(COMPONENT_CATALOG))
    .map((id) => COMPONENT_CATALOG[id])
    .filter(Boolean);

  const [toastText, setToastText] = useState(null);
  const toastTimerRef = useRef(null);

  // Active touch drag state: { part, x, y }
  const [touchDrag, setTouchDrag] = useState(null);
  const touchStartRef = useRef(null);

  const showToast = (name) => {
    setToastText(`Added ${name} to workbench!`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastText(null), 1400);
  };

  const handleDragStart = (e, partType) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ partType }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCardPointerDown = (e, part) => {
    // Only track primary pointer
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touchStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      part,
      isDragging: false,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!touchStartRef.current) return;
      const { startX, startY, part, isDragging } = touchStartRef.current;
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);

      if (!isDragging && dist > 10) {
        touchStartRef.current.isDragging = true;
      }

      if (touchStartRef.current.isDragging) {
        setTouchDrag({
          part,
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    const handlePointerUp = (e) => {
      if (!touchStartRef.current) return;
      const { part, isDragging } = touchStartRef.current;
      touchStartRef.current = null;

      if (isDragging) {
        setTouchDrag(null);
        // Find bench under pointer release
        const benchEl = document.querySelector(".lab-bench-container");
        if (benchEl) {
          const rect = benchEl.getBoundingClientRect();
          // Check if release is over or near bench
          if (
            e.clientX >= rect.left - 20 &&
            e.clientX <= rect.right + 20 &&
            e.clientY >= rect.top - 20 &&
            e.clientY <= rect.bottom + 20
          ) {
            const dropX = Math.max(10, Math.min(rect.width - 90, e.clientX - rect.left - 45));
            const dropY = Math.max(10, Math.min(rect.height - 90, e.clientY - rect.top - 30));
            if (onDropNewPart) {
              onDropNewPart(part.type, Math.round(dropX), Math.round(dropY));
            } else {
              onAddPart(part.type, Math.round(dropX), Math.round(dropY));
            }
            showToast(part.name);
            return;
          }
        }
        // If released outside bench, add it anyway with feedback
        onAddPart(part.type);
        showToast(part.name);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [onAddPart, onDropNewPart]);

  const handleCardClick = (part) => {
    // Regular tap / click to add
    onAddPart(part.type);
    showToast(part.name);
  };

  return (
    <>
      <aside className="lab-drawer" data-testid="component-drawer">
        <div className="lab-drawer-header">
          <span>Parts Drawer</span>
          <span className="text-[10px] text-amber-400 font-bold">{parts.length} available</span>
        </div>

        <div className="lab-parts-list">
          {parts.map((part) => (
            <div
              key={part.type}
              className="lab-part-card"
              draggable
              onDragStart={(e) => handleDragStart(e, part.type)}
              onPointerDown={(e) => handleCardPointerDown(e, part)}
              onClick={() => handleCardClick(part)}
              title="Drag to workbench or tap to add"
            >
              <div className="lab-part-icon">{part.icon}</div>
              <div className="lab-part-info">
                <span className="lab-part-name">{part.name}</span>
                <span className="lab-part-desc">{part.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Floating Ghost during touch drag */}
      {touchDrag && (
        <div
          className="lab-touch-ghost"
          style={{
            left: `${touchDrag.x}px`,
            top: `${touchDrag.y}px`,
          }}
        >
          <span className="text-2xl">{touchDrag.part.icon}</span>
          <span className="font-extrabold text-sm">{touchDrag.part.name}</span>
        </div>
      )}

      {/* Instant visual feedback toast on tap-add */}
      {toastText && <div className="lab-toast-pill">{toastText}</div>}
    </>
  );
}
