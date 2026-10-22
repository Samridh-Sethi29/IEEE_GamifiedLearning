import React from "react";
import { Lightbulb, X } from "lucide-react";

/**
 * 2-Hint Modal for Design Atelier
 */
export default function ProjectHintsModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="lab-modal-backdrop" data-testid="hints-modal">
      <div className="lab-modal-card">
        <div className="lab-modal-header teaching" style={{ background: "linear-gradient(135deg, #4c1d95 0%, #1e293b 100%)" }}>
          <div className="lab-modal-title">
            <Lightbulb size={20} className="text-amber-400" />
            <span>Project {project.number} Hints</span>
          </div>
          <button className="lab-tool-btn" onClick={onClose} aria-label="Close hints">
            <X size={16} />
          </button>
        </div>

        <div className="lab-modal-body">
          <div className="flex flex-col gap-3">
            {project.hints.map((hint, idx) => (
              <div key={idx} className="lab-hint-box">
                <span className="font-extrabold text-amber-400 shrink-0 text-sm">💡 Hint {idx + 1}:</span>
                <span className="text-xs text-slate-100">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lab-modal-footer">
          <span className="text-xs text-slate-400">Apply these ideas on your canvas!</span>
          <button
            className="lab-btn"
            style={{ background: "#8b5cf6", color: "#fff", borderColor: "#7c3aed" }}
            onClick={onClose}
          >
            <span>Got it!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
