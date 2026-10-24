import React, { useRef, useState, useEffect } from "react";
import { Sprout } from "lucide-react";

/**
 * Mobile touch controls for 2D Farm Game.
 * Features a tactile virtual joystick on bottom-left and quick action button on bottom-right.
 * Styled with earthy greens and warm ambers to match the Farm world aesthetic.
 */
export default function FarmVirtualControls({
  onDirectionChange,
  onAction,
  actionLabel = "FARM",
  canAct = false,
}) {
  const joystickRef = useRef(null);
  const [touching, setTouching] = useState(false);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setTouching(true);
    updateThumb(e);
  };

  const updateThumb = (e) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX =
      e.clientX || (e.touches && e.touches[0]?.clientX) || centerX;
    const clientY =
      e.clientY || (e.touches && e.touches[0]?.clientY) || centerY;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2 - 14;

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setThumbPos({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    onDirectionChange(normX, normY);
  };

  const handlePointerMove = (e) => {
    if (!touching) return;
    e.preventDefault();
    updateThumb(e);
  };

  const handlePointerUp = () => {
    setTouching(false);
    setThumbPos({ x: 0, y: 0 });
    onDirectionChange(0, 0);
  };

  useEffect(() => {
    if (touching) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [touching]);

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 45,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "16px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {/* Virtual Joystick (Bottom Left) */}
        <div
          ref={joystickRef}
          onPointerDown={handlePointerDown}
          style={{
            width: 88,
            height: 88,
            minWidth: 88,
            minHeight: 88,
            borderRadius: "50%",
            backgroundColor: "rgba(254, 243, 199, 0.9)",
            border: "2.5px solid #d97706",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(6px)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            touchAction: "none",
            cursor: "pointer",
          }}
          title="Move Farmer"
        >
          {/* Compass Arrows */}
          <span style={{ position: "absolute", top: 2, fontSize: 9, fontWeight: 900, color: "#b45309" }}>▲</span>
          <span style={{ position: "absolute", bottom: 2, fontSize: 9, fontWeight: 900, color: "#b45309" }}>▼</span>
          <span style={{ position: "absolute", left: 3, fontSize: 9, fontWeight: 900, color: "#b45309" }}>◀</span>
          <span style={{ position: "absolute", right: 3, fontSize: 9, fontWeight: 900, color: "#b45309" }}>▶</span>

          {/* Thumb Knob */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              border: "2px solid #065f46",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              transition: "transform 0.05s ease-out",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#a7f3d0" }} />
          </div>
        </div>

        {/* Action Button (Bottom Right) */}
        {onAction && (
          <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={onAction}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: canAct ? "#10b981" : "#fef3c7",
                border: canAct ? "3px solid #059669" : "3px solid #d97706",
                color: canAct ? "#ffffff" : "#b45309",
                boxShadow: canAct
                  ? "0 0 20px rgba(16, 185, 129, 0.6), 0 4px 14px rgba(0,0,0,0.25)"
                  : "0 4px 12px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={actionLabel}
            >
              <Sprout size={28} strokeWidth={2.5} />
            </button>
            <div
              style={{
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #d97706",
                color: "#78350f",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {actionLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
