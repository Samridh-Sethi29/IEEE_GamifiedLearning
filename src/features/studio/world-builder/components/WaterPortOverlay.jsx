import { useMemo } from "react";
import { getWaterOverlayData } from "../engine/waterOverlayModel.js";

/**
 * Visual water-port overlay for World Builder canvas.
 * Renders SVG indicators for water ports, connections, and candidate alignment.
 * Pure rendering: does not mutate documents, does not intercept pointer events,
 * and derives all connectivity strictly from buildWaterGraph.
 */
export default function WaterPortOverlay({ doc, selectedId, highlightedObjectIds = null }) {
  const overlayData = useMemo(
    () => getWaterOverlayData(doc, selectedId, { highlightedObjectIds }),
    [doc, selectedId, highlightedObjectIds]
  );

  if (!overlayData.active) return null;

  const { discretePorts, connections, farmBoundaries, farmContacts, pointerEvents } = overlayData;

  return (
    <g className="sce-water-overlay" data-testid="sce-water-overlay" pointerEvents={pointerEvents}>
      {/* 1. Farm perimeter boundary indicators */}
      {farmBoundaries.map((f) => {
        const hw = f.width / 2;
        const hh = f.height / 2;
        return (
          <g
            key={`farm-bound-${f.id}`}
            transform={`translate(${f.x} ${f.y}) rotate(${f.rotation})`}
            data-testid={`water-farm-boundary-${f.id}`}
            data-connected={f.connected ? "true" : "false"}
            data-highlighted={f.highlighted ? "true" : "false"}
          >
            {f.highlighted && (
              <rect
                x={-hw - 2}
                y={-hh - 2}
                width={f.width + 4}
                height={f.height + 4}
                rx={8}
                fill="none"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                opacity={0.8}
                data-testid={`water-farm-route-glow-${f.id}`}
              />
            )}
            <rect
              x={-hw}
              y={-hh}
              width={f.width}
              height={f.height}
              rx={6}
              fill={f.connected ? "#10b981" : "#0284c7"}
              fillOpacity={f.connected ? 0.06 : 0.02}
              stroke={f.connected ? "#10b981" : "#0284c7"}
              strokeWidth={f.connected ? 2.5 : 1.5}
              strokeDasharray={f.connected ? "6 4" : "4 4"}
              opacity={f.connected ? 0.85 : 0.55}
            />
          </g>
        );
      })}

      {/* 2. Connection lines (candidate alignment / connected bridges between discrete ports) */}
      {connections.map((c) => (
        <g
          key={`conn-${c.key}`}
          data-testid={`water-connection-${c.key}`}
          data-distance={c.distance}
          data-highlighted={c.highlighted ? "true" : "false"}
        >
          {c.highlighted && (
            <line
              x1={c.from.x}
              y1={c.from.y}
              x2={c.to.x}
              y2={c.to.y}
              stroke="#0284c7"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.45}
              data-testid={`water-route-glow-${c.key}`}
            />
          )}
          <line
            x1={c.from.x}
            y1={c.from.y}
            x2={c.to.x}
            y2={c.to.y}
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="4 2"
          />
          {c.distance > 4 && (
            <circle
              cx={(c.from.x + c.to.x) / 2}
              cy={(c.from.y + c.to.y) / 2}
              r={2}
              fill="#059669"
            />
          )}
        </g>
      ))}

      {/* 3. Farm contact connection lines */}
      {farmContacts.map((c) => (
        <g
          key={`farm-conn-${c.key}`}
          data-testid={`water-farm-contact-${c.key}`}
          data-distance={c.distance}
          data-highlighted={c.highlighted ? "true" : "false"}
        >
          {c.highlighted && (
            <line
              x1={c.pipeNode.x}
              y1={c.pipeNode.y}
              x2={c.contactPoint.x}
              y2={c.contactPoint.y}
              stroke="#0284c7"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.45}
              data-testid={`water-farm-route-glow-${c.key}`}
            />
          )}
          <line
            x1={c.pipeNode.x}
            y1={c.pipeNode.y}
            x2={c.contactPoint.x}
            y2={c.contactPoint.y}
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="4 2"
          />
          <circle
            cx={c.contactPoint.x}
            cy={c.contactPoint.y}
            r={4}
            fill="#10b981"
            stroke="#059669"
            strokeWidth={1.5}
          />
        </g>
      ))}

      {/* 4. Discrete port indicators (well output, tank ports, pipe endpoints) */}
      {discretePorts.map((n) => {
        return (
          <g
            key={`port-${n.id}`}
            data-testid={`water-port-${n.id}`}
            data-connected={n.connected ? "true" : "false"}
            data-highlighted={n.highlighted ? "true" : "false"}
            data-port-kind={n.kind}
            data-x={n.x}
            data-y={n.y}
          >
            {n.highlighted && (
              <circle
                cx={n.x}
                cy={n.y}
                r={n.selected ? 11 : 10}
                fill="none"
                stroke="#0284c7"
                strokeWidth={2}
                opacity={0.7}
                data-testid={`water-port-route-glow-${n.id}`}
              />
            )}
            {n.connected ? (
              // Connected State (Emerald ring + solid center)
              <g>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.selected ? 8 : 7}
                  fill="#10b981"
                  fillOpacity={0.25}
                  stroke="#059669"
                  strokeWidth={2}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              </g>
            ) : (
              // Unconnected State (Sky dashed ring + socket dot)
              <g>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.selected ? 6.5 : 5.5}
                  fill="#ffffff"
                  fillOpacity={0.85}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  strokeDasharray="2.5 1.5"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={2}
                  fill="#38bdf8"
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
