import React, { useRef, useState } from "react";
import { RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { getPortAbsolutePos } from "../engine/evaluator";

/**
 * Interactive Build Bench Canvas
 * Solves:
 * 1. Image 1 fix: Package and Cart Chassis text cleanly padded within their container (no truncated text).
 * 2. Image 2 fix: Motor and Spur Gear snap side-by-side on the drive shaft with dedicated terminal lugs.
 * 3. Toolbar moved safely above the component so it never covers gears or wires.
 */
export default function BuildBench({
  components,
  wires,
  selectedId,
  isTesting,
  testResult,
  activeMissionId,
  onSelect,
  onUpdateComponent,
  onRemoveComponent,
  onAddWire,
  onDropNewPart,
}) {
  const benchRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [wireStart, setWireStart] = useState(null);

  // Drag-and-drop from drawer
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const { partType } = JSON.parse(dataStr);
      if (!partType || !benchRef.current) return;
      const rect = benchRef.current.getBoundingClientRect();
      const x = Math.max(20, Math.min(rect.width - 130, e.clientX - rect.left - 45));
      const y = Math.max(20, Math.min(rect.height - 130, e.clientY - rect.top - 30));
      onDropNewPart(partType, Math.round(x), Math.round(y));
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  // Moving existing component
  const handlePointerDown = (e, comp) => {
    if (e.target.closest(".lab-item-toolbar") || e.target.closest(".lab-port-dot")) return;
    e.stopPropagation();
    onSelect(comp.id);
    setDragState({
      compId: comp.id,
      startX: e.clientX,
      startY: e.clientY,
      initCompX: comp.x,
      initCompY: comp.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState || !benchRef.current) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const rect = benchRef.current.getBoundingClientRect();

    const newX = Math.max(0, Math.min(rect.width - 60, dragState.initCompX + dx));
    const newY = Math.max(0, Math.min(rect.height - 90, dragState.initCompY + dy));

    onUpdateComponent(dragState.compId, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  // Port wiring
  const handlePortClick = (e, comp, port) => {
    e.stopPropagation();
    if (!wireStart) {
      setWireStart({ compId: comp.id, portId: port.id });
    } else {
      if (wireStart.compId !== comp.id) {
        onAddWire(wireStart.compId, wireStart.portId, comp.id, port.id);
      }
      setWireStart(null);
    }
  };

  // Toggle switch
  const handleToggleState = (e, comp) => {
    e.stopPropagation();
    if (comp.type === "switch") {
      const closed = !(comp.state?.closed ?? true);
      onUpdateComponent(comp.id, { state: { ...comp.state, closed } });
    }
  };

  // Rotate
  const handleRotate = (e, comp) => {
    e.stopPropagation();
    const cur = comp.rotation || 0;
    onUpdateComponent(comp.id, { rotation: (cur + 90) % 360 });
  };

  // Resize (+ / -)
  const handleResize = (e, comp, factor) => {
    e.stopPropagation();
    const curScale = comp.scale || 1;
    const newScale = Math.max(0.65, Math.min(1.8, +(curScale * factor).toFixed(2)));
    const newWidth = Math.round((comp.baseWidth || comp.width) * newScale);
    const newHeight = Math.round((comp.baseHeight || comp.height) * newScale);

    onUpdateComponent(comp.id, {
      scale: newScale,
      width: newWidth,
      height: newHeight,
      baseWidth: comp.baseWidth || comp.width,
      baseHeight: comp.baseHeight || comp.height,
    });
  };

  const isSimulating = isTesting || testResult?.passed;

  // Kinematics elements
  const leverComp = components.find((c) => c.type === "lever");
  const cargoComp = components.find((c) => c.type === "cargo");
  const weightComp = components.find((c) => c.type === "counterweight");

  return (
    <div
      ref={benchRef}
      className={`lab-bench-container ${isTesting ? "is-testing-active" : ""}`}
      data-testid="build-bench"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        onSelect(null);
        setWireStart(null);
      }}
    >
      <div className="lab-bench-grid" />

      {/* Testing Simulation Banner */}
      {isTesting && (
        <div className="lab-testing-banner">
          <span className="animate-spin text-xl">⚙️</span>
          <span>Running Machine Investigation Simulation...</span>
        </div>
      )}

      {/* Wiring Guide Banner */}
      {wireStart && (
        <div className="lab-wire-guide-pill">
          <span>Click a terminal port on another part to complete the wire</span>
          <button
            className="text-xs underline text-amber-300 ml-2 font-bold cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setWireStart(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* SVG Wire Overlay */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        {wires.map((w, idx) => {
          const compA = components.find((c) => c.id === w.fromCompId);
          const compB = components.find((c) => c.id === w.toCompId);
          if (!compA || !compB) return null;
          const portA = compA.ports.find((p) => p.id === w.fromPortId) || compA.ports[0];
          const portB = compB.ports.find((p) => p.id === w.toPortId) || compB.ports[0];
          const posA = getPortAbsolutePos(compA, portA);
          const posB = getPortAbsolutePos(compB, portB);

          const isCurrentActive = isSimulating;

          return (
            <g key={idx}>
              <line
                x1={posA.x}
                y1={posA.y}
                x2={posB.x}
                y2={posB.y}
                stroke={isCurrentActive ? "#facc15" : "#38bdf8"}
                strokeWidth={isCurrentActive ? 4 : 3}
                strokeDasharray={isCurrentActive ? "8 4" : "none"}
                className={isCurrentActive ? "lab-wire-flowing" : ""}
              />
              <circle cx={posA.x} cy={posA.y} r={3.5} fill="#f59e0b" />
              <circle cx={posB.x} cy={posB.y} r={3.5} fill="#f59e0b" />
            </g>
          );
        })}
      </svg>

      {/* Canvas Components */}
      {components.map((comp) => {
        const isSelected = selectedId === comp.id;
        const isBulbLit = comp.type === "bulb" && isSimulating;
        const isSwitchClosed = comp.type === "switch" && (comp.state?.closed ?? true);

        let transformStyle = `rotate(${comp.rotation || 0}deg)`;
        let animClass = "";

        // MISSION 1: Rigid Lever Kinematics
        if (activeMissionId === "mission-1" && isSimulating && leverComp) {
          const leverCenterX = leverComp.x + leverComp.width / 2;
          const leverCenterY = leverComp.y + leverComp.height / 2;

          const weightOnRight = weightComp
            ? weightComp.x + weightComp.width / 2 >= leverCenterX
            : true;
          const tiltAngleDeg = weightOnRight ? 16 : -16;
          const rad = (tiltAngleDeg * Math.PI) / 180;

          if (comp.type === "lever") {
            transformStyle = `rotate(${tiltAngleDeg}deg)`;
          } else if (comp.type === "cargo" || comp.type === "counterweight") {
            const boxCenterX = comp.x + comp.width / 2;
            const boxBottomY = comp.y + comp.height;
            const rx = boxCenterX - leverCenterX;
            const ry = boxBottomY - leverCenterY;

            const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
            const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);

            const deltaX = rotX - rx;
            const deltaY = rotY - ry;

            transformStyle = `translate(${Math.round(deltaX)}px, ${Math.round(deltaY)}px) rotate(${tiltAngleDeg}deg)`;
          }
        }

        // MISSION 2: Pulse & Glow
        if (activeMissionId === "mission-2" && isSimulating) {
          if (comp.type === "bulb") animClass = " lab-anim-glow";
          if (comp.type === "battery") animClass = " lab-anim-pulse";
        }

        // MISSION 3: Smooth Ramp Rolling
        if (activeMissionId === "mission-3" && isSimulating) {
          if (comp.type === "cart-chassis" || comp.type === "package") {
            transformStyle = "translate(160px, 40px)";
          }
          if (comp.type === "wheel") {
            transformStyle = "translate(160px, 40px) rotate(360deg)";
          }
        }

        // MISSION 4: Automation
        if (activeMissionId === "mission-4" && isSimulating) {
          if (comp.type === "pressure-plate") transformStyle = "scaleY(0.8)";
          if (comp.type === "motor" || comp.type === "gear") {
            animClass = " lab-anim-spin";
          }
        }

        return (
          <div
            key={comp.id}
            className={`lab-canvas-item ${isSelected ? "selected" : ""}`}
            style={{
              left: `${comp.x}px`,
              top: `${comp.y}px`,
              width: `${comp.width}px`,
              height: `${comp.height}px`,
              transform: transformStyle,
              transformOrigin: comp.type === "lever" ? "50% 50%" : "50% 100%",
              transition: isTesting
                ? "transform 1.4s cubic-bezier(0.2, 0.9, 0.3, 1), width 0.15s ease, height 0.15s ease"
                : "transform 0.3s ease-out, width 0.15s ease, height 0.15s ease",
            }}
            onPointerDown={(e) => handlePointerDown(e, comp)}
            onClick={(e) => handleToggleState(e, comp)}
          >
            {/* Quick Action Toolbar on Selected */}
            {isSelected && (
              <div className="lab-item-toolbar">
                <button
                  className="lab-tool-btn"
                  onClick={(e) => handleRotate(e, comp)}
                  title="Rotate 90°"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  className="lab-tool-btn"
                  onClick={(e) => handleResize(e, comp, 1.15)}
                  title="Make Bigger (+)"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  className="lab-tool-btn"
                  onClick={(e) => handleResize(e, comp, 0.85)}
                  title="Make Smaller (-)"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  className="lab-tool-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveComponent(comp.id);
                  }}
                  title="Delete part"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Component Body (Generous styling, clean borders, crisp typography) */}
            <div className={`lab-item-body ${comp.type} ${isBulbLit ? "lit" : ""} ${animClass}`}>
              {comp.type === "pivot" && (
                <svg width="100%" height="100%" viewBox="0 0 70 55" preserveAspectRatio="none">
                  <polygon points="35,4 66,51 4,51" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="35" cy="8" r="4" fill="#f59e0b" />
                </svg>
              )}

              {comp.type === "lever" && (
                <div className="lab-lever-inner">
                  <span className="lab-lever-dot left" />
                  <span className="lab-lever-title">LEVER BEAM</span>
                  <span className="lab-lever-dot right" />
                </div>
              )}

              {comp.type === "battery" && (
                <div className="lab-battery-card">
                  <div className="lab-battery-header">
                    <span>9V BATTERY</span>
                  </div>
                  <div className="lab-battery-polarity">
                    <span className="text-red-400 font-extrabold">(+)</span>
                    <span className="text-blue-400 font-extrabold">(-)</span>
                  </div>
                </div>
              )}

              {comp.type === "switch" && (
                <div className="lab-switch-card">
                  <span className={`text-[11px] font-black tracking-wide ${isSwitchClosed ? "text-emerald-400" : "text-rose-400"}`}>
                    {isSwitchClosed ? "ON" : "OFF"}
                  </span>
                  <div className={`lab-switch-paddle ${isSwitchClosed ? "closed" : "open"}`} />
                </div>
              )}

              {comp.type === "bulb" && (
                <div className="lab-bulb-card">
                  <span className="text-3xl leading-none">{isBulbLit ? "💡" : "💡"}</span>
                  <span className="text-[9px] font-bold text-amber-300 mt-1">LIGHT BEACON</span>
                </div>
              )}

              {comp.type === "cargo" && (
                <div className="lab-box-inner cargo">
                  <span className="text-2xl leading-none">📦</span>
                  <span className="lab-box-tag">CARGO (25kg)</span>
                </div>
              )}

              {comp.type === "counterweight" && (
                <div className="lab-box-inner weight">
                  <span className="text-2xl leading-none">⚖️</span>
                  <span className="lab-box-tag">WEIGHT (35kg)</span>
                </div>
              )}

              {comp.type === "cart-chassis" && (
                <div className="lab-cart-card">
                  <span className="text-[11px] font-black text-slate-100 tracking-wider">CART CHASSIS</span>
                </div>
              )}

              {comp.type === "wheel" && (
                <div className="lab-wheel-inner">
                  <span className="text-2xl">⚙️</span>
                </div>
              )}

              {comp.type === "ramp" && (
                <svg width="100%" height="100%" viewBox="0 0 160 80" preserveAspectRatio="none">
                  <polygon points="0,80 160,80 0,10" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                  <text x="45" y="70" fill="#cbd5e1" fontSize="11" fontWeight="bold">SLOPE 30°</text>
                </svg>
              )}

              {comp.type === "pressure-plate" && (
                <div className="lab-sensor-card">
                  <span className="text-[10px] font-black text-emerald-400 tracking-wider">TRIGGER PAD</span>
                </div>
              )}

              {comp.type === "motor" && (
                <div className="lab-motor-card">
                  <div className="flex items-center justify-between w-full px-2">
                    <span className={`text-2xl ${isSimulating ? "animate-spin" : ""}`}>🌀</span>
                    <span className="text-[10px] font-black text-indigo-300">MOTOR</span>
                    <span className="lab-shaft-pip" title="Drive Shaft" />
                  </div>
                </div>
              )}

              {comp.type === "gear" && (
                <div className="lab-gear-inner">
                  <span className={`text-3xl ${isSimulating ? "animate-spin" : ""}`}>⚙️</span>
                </div>
              )}

              {comp.type === "package" && (
                <div className="lab-box-inner package">
                  <span className="text-2xl leading-none">📫</span>
                  <span className="lab-box-tag">PACKAGE</span>
                </div>
              )}
            </div>

            {/* Wire Terminals: Clean Lug Dots ONLY for Electrical Missions */}
            {(activeMissionId === "mission-2" || activeMissionId === "mission-4") &&
              comp.ports
                .filter((p) => p.type.startsWith("electric"))
                .map((port) => {
                  const isWiringThis =
                    wireStart && wireStart.compId === comp.id && wireStart.portId === port.id;
                  const px = port.nx !== undefined ? port.nx * comp.width : port.x;
                  const py = port.ny !== undefined ? port.ny * comp.height : port.y;

                  return (
                    <div
                      key={port.id}
                      className={`lab-port-dot ${isWiringThis ? "active-wire" : ""}`}
                      style={{
                        left: `${px}px`,
                        top: `${py}px`,
                      }}
                      title={`Wire Terminal: ${port.label}`}
                      onClick={(e) => handlePortClick(e, comp, port)}
                    />
                  );
                })}
          </div>
        );
      })}

      {/* Ground plane */}
      <div className="lab-bench-ground">
        <span>WORKSHOP BENCH SURFACE</span>
      </div>
    </div>
  );
}
