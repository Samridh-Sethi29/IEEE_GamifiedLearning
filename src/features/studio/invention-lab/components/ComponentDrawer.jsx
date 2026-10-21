import React from "react";
import { COMPONENT_CATALOG } from "../data/missions";

/**
 * Component Drawer (Left Sidebar)
 * Filters available parts based on current active mission's allowedParts.
 */
export default function ComponentDrawer({ allowedPartIds, onAddPart }) {
  const parts = (allowedPartIds || Object.keys(COMPONENT_CATALOG)).map(
    (id) => COMPONENT_CATALOG[id]
  ).filter(Boolean);

  const handleDragStart = (e, partType) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ partType }));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
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
            onClick={() => onAddPart(part.type)}
            title="Drag to workbench or click to add"
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
  );
}
