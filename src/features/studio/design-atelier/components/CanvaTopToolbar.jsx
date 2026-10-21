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
      <div className="canva-context-toolbar text-xs text-slate-400">
        <span>Select any text or graphic on the poster to customize fonts, colors, and sizes.</span>
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
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
          <button
            className="canva-mini-btn"
            onClick={() => handleFontSize(-2)}
            title="Decrease font size"
          >
            <Minus size={13} />
          </button>
          <span className="text-xs font-bold text-slate-200 px-1">{fontSize}px</span>
          <button
            className="canva-mini-btn"
            onClick={() => handleFontSize(2)}
            title="Increase font size"
          >
            <Plus size={13} />
          </button>
        </div>
      )}

      {/* Text Alignment */}
      {isText && (
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            className={`canva-mini-btn ${selectedElement.align === "left" ? "bg-cyan-500 text-slate-950" : ""}`}
            onClick={() => handleAlign("left")}
            title="Align Left"
          >
            <AlignLeft size={13} />
          </button>
          <button
            className={`canva-mini-btn ${(!selectedElement.align || selectedElement.align === "center") ? "bg-cyan-500 text-slate-950" : ""}`}
            onClick={() => handleAlign("center")}
            title="Align Center"
          >
            <AlignCenter size={13} />
          </button>
          <button
            className={`canva-mini-btn ${selectedElement.align === "right" ? "bg-cyan-500 text-slate-950" : ""}`}
            onClick={() => handleAlign("right")}
            title="Align Right"
          >
            <AlignRight size={13} />
          </button>
        </div>
      )}

      {/* Color Swatches */}
      {isText && (
        <div className="flex items-center gap-1.5 ml-2">
          {["#ffffff", "#facc15", "#38bdf8", "#f43f5e", "#10b981", "#c084fc"].map((c) => (
            <button
              key={c}
              className="canva-color-swatch-circle"
              style={{ backgroundColor: c }}
              onClick={() => handleColor(c)}
              title={c}
            />
          ))}
        </div>
      )}

      {/* Delete Item */}
      <button
        className="canva-tool-btn ml-auto text-rose-400 hover:text-rose-300"
        onClick={() => onRemoveElement(selectedElement.id)}
      >
        <Trash2 size={13} />
        <span>Delete</span>
      </button>
    </div>
  );
}
