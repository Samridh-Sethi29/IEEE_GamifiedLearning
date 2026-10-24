import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

/**
 * CanvaTopToolbar
 * Appears dynamically when an element on the canvas is selected.
 * Lets users adjust font size (+ / -), text color, alignment, and delete.
 */
export default function CanvaTopToolbar({ selectedElement, onUpdateElement, onRemoveElement }) {
  if (!selectedElement) {
    return (
      <div className="canva-context-toolbar">
        <span className="atl-hint">Tap any text or picture on the poster to change its size, colour and position.</span>
      </div>
    );
  }

  const isText = selectedElement.type === "text";
  const fontSize = selectedElement.fontSize || 22;

  const handleFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(64, fontSize + delta));
    onUpdateElement(selectedElement.id, { fontSize: newSize });
  };

  const handleAlign = (align) => {
    onUpdateElement(selectedElement.id, { align });
  };

  const handleColor = (color) => {
    onUpdateElement(selectedElement.id, { color });
  };

  return (
    <div className="canva-context-toolbar" data-testid="canva-toolbar">
      {/* Font Size (+ / -) */}
      {isText && (
        <div className="atl-tool-group">
          <button
            className="canva-mini-btn"
            onClick={() => handleFontSize(-2)}
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            <Minus size={13} />
          </button>
          <span className="atl-size-label">{fontSize}px</span>
          <button
            className="canva-mini-btn"
            onClick={() => handleFontSize(2)}
            title="Increase font size"
            aria-label="Increase font size"
          >
            <Plus size={13} />
          </button>
        </div>
      )}

      {/* Text Alignment */}
      {isText && (
        <div className="atl-tool-group">
          <button
            className={`canva-mini-btn ${selectedElement.align === "left" ? "is-on" : ""}`}
            onClick={() => handleAlign("left")}
            title="Align Left"
            aria-label="Align Left"
          >
            <AlignLeft size={13} />
          </button>
          <button
            className={`canva-mini-btn ${(!selectedElement.align || selectedElement.align === "center") ? "is-on" : ""}`}
            onClick={() => handleAlign("center")}
            title="Align Center"
            aria-label="Align Center"
          >
            <AlignCenter size={13} />
          </button>
          <button
            className={`canva-mini-btn ${selectedElement.align === "right" ? "is-on" : ""}`}
            onClick={() => handleAlign("right")}
            title="Align Right"
            aria-label="Align Right"
          >
            <AlignRight size={13} />
          </button>
        </div>
      )}

      {/* Color Swatches */}
      {isText && (
        <div className="atl-tool-group atl-swatches">
          {["#ffffff", "#facc15", "#38bdf8", "#f43f5e", "#10b981", "#c084fc"].map((c) => (
            <button
              key={c}
              className="canva-color-swatch-circle"
              style={{ backgroundColor: c }}
              onClick={() => handleColor(c)}
              title={c}
              aria-label={`Text colour ${c}`}
            />
          ))}
        </div>
      )}

      {/* Delete Item */}
      <button
        className="canva-tool-btn danger atl-delete"
        onClick={() => onRemoveElement(selectedElement.id)}
      >
        <Trash2 size={13} />
        <span>Delete</span>
      </button>
    </div>
  );
}
