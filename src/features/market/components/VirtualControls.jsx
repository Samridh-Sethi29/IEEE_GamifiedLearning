import React, { useRef, useState, useEffect } from "react";
import { Hand } from "lucide-react";

export default function VirtualControls({
  onDirectionChange,
  onInteract,
  canInteract = false,
  interactLabel = "INSPECT"
}) {
  const joystickRef = useRef(null);
  const [touching, setTouching] = useState(false);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });

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

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || centerX;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || centerY;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2 - 16;

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

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-end p-3 md:p-5 overflow-hidden" style={{ paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
      <div className="w-full flex items-end justify-between">
        
        {/* Virtual Joystick (Bottom Left: Hand Movement) - Light Pastel Sky Blue */}
        <div
          ref={joystickRef}
          onPointerDown={handlePointerDown}
          style={{ width: 92, height: 92, minWidth: 92, minHeight: 92 }}
          className="pointer-events-auto relative rounded-full bg-[#e0f2fe]/90 backdrop-blur-md border-[2.5px] border-[#38bdf8] shadow-lg shadow-sky-950/15 flex items-center justify-center cursor-pointer touch-none select-none active:scale-95 transition-transform"
          title="Move Vendor"
        >
          {/* Subtle Directional Compass Marks */}
          <span className="absolute top-1 text-[8px] font-black text-[#0284c7] pointer-events-none">▲</span>
          <span className="absolute bottom-1 text-[8px] font-black text-[#0284c7] pointer-events-none">▼</span>
          <span className="absolute left-1 text-[8px] font-black text-[#0284c7] pointer-events-none">◄</span>
          <span className="absolute right-1 text-[8px] font-black text-[#0284c7] pointer-events-none">►</span>

          {/* Thumb Knob */}
          <div
            style={{ 
              width: 42, 
              height: 42, 
              transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)` 
            }}
            className="rounded-full bg-white border-2 border-[#0284c7] shadow-md flex items-center justify-center pointer-events-none transition-transform duration-75"
          >
            <div className="w-3 h-3 rounded-full bg-[#38bdf8]" />
          </div>
        </div>

        {/* Action Button (Bottom Right: Interact / Hand) - Light Pastel Amber / Goldenrod */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 select-none">
          <button
            onClick={onInteract}
            style={{ width: 70, height: 70, minWidth: 70, minHeight: 70 }}
            className={`rounded-full border-[2.5px] shadow-xl flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
              canInteract
                ? "bg-[#fde047] border-[#d97706] scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
                : "bg-[#fef3c7] border-[#f59e0b] hover:bg-[#fde68a]"
            }`}
            title="Interact (E)"
          >
            <Hand 
              className={`w-8 h-8 stroke-[2.4] transition-colors ${
                canInteract ? "text-[#78350f]" : "text-[#b45309]"
              }`} 
            />
          </button>

          {/* Under-button label pill: "INSPECT (E)" / "CHECKOUT (E)" */}
          <div className={`px-3 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase select-none border transition-colors shadow-sm ${
            canInteract
              ? "bg-[#fef08a] text-[#713f12] border-[#ca8a04] shadow-amber-500/20"
              : "bg-white/95 border-[#f59e0b] text-[#92400e]"
          }`}>
            {interactLabel} (E)
          </div>
        </div>

      </div>
    </div>
  );
}
