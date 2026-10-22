import React from "react";
import { Lightbulb, X } from "lucide-react";

/**
 * 2-Hint Accordion/Panel for the active mission.
 * Kept concise and only revealed when the child wants help.
 */
export default function MissionHintsModal({ mission, onClose }) {
  if (!mission) return null;

  return (
    <div className="lab-modal-backdrop" data-testid="hints-modal">
      <div className="lab-modal-card">
        <div className="lab-modal-header teaching">
          <div className="lab-modal-title">
            <Lightbulb size={20} className="text-amber-400" />
            <span>Mission {mission.number} Hints</span>
          </div>
          <button className="lab-tool-btn" onClick={onClose} aria-label="Close hints">
            <X size={16} />
          </button>
        </div>

        <div className="lab-modal-body">
          <div className="flex flex-col gap-3">
            {mission.hints.map((hint, idx) => (
              <div key={idx} className="lab-hint-box">
                <span className="font-extrabold text-amber-400 shrink-0 text-sm">💡 Hint {idx + 1}:</span>
                <span className="text-xs text-slate-100">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lab-modal-footer">
          <span className="text-xs text-slate-400">Try these tips on the workbench!</span>
          <button className="lab-btn lab-btn-amber" onClick={onClose}>
            <span>Got it!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
