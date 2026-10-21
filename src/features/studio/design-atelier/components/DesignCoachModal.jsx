import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, LogOut, RotateCcw, Wrench } from "lucide-react";

/**
 * DesignCoachModal
 * Shows actionable critique from the Design Coach:
 * - If failed: What went wrong + Actionable fix hint + Fix on Canvas button.
 * - If passed: Celebration + Next Project (or Exit to Studio Campus on Project 4).
 */
export default function DesignCoachModal({ result, onClose, onNextProject, hasNextProject, onExitStudio }) {
  if (!result) return null;

  return (
    <div className="lab-modal-backdrop" data-testid="coach-result-modal">
      <div className="lab-modal-card">
        {/* Header */}
        <div className={`lab-modal-header ${result.passed ? "success" : "fail"}`}>
          <div className="lab-modal-title">
            {result.passed ? (
              <>
                <CheckCircle size={22} className="text-emerald-400" />
                <span>{hasNextProject ? "Design Coach Approved! 🎨" : "Master Designer Certified! 🏆"}</span>
              </>
            ) : (
              <>
                <AlertCircle size={22} className="text-rose-400" />
                <span>Coach Feedback: {result.failureTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="lab-modal-body">
          {result.passed ? (
            <div className="lab-success-box">
              <h4 className="text-lg font-bold text-emerald-300 mb-2">{result.title}</h4>
              <p className="text-sm text-slate-200">{result.summary}</p>
              {!hasNextProject && (
                <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                  🎉 Fantastic visual communication! You have created posters for awareness, community, events, and digital safety like a professional designer!
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="lab-fail-box">
                <span className="font-bold text-rose-300 text-sm">What can be improved:</span>
                <span className="text-slate-200 text-xs">{result.failureReason}</span>
              </div>

              {result.hint && (
                <div className="lab-hint-box">
                  <Wrench size={18} className="shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block text-xs">How to fix it:</span>
                    <span className="text-slate-200 text-xs">{result.hint}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lab-modal-footer">
          <button className="lab-btn lab-btn-ghost" onClick={onClose}>
            <RotateCcw size={14} />
            <span>{result.passed ? "Keep Editing" : "Improve on Canvas"}</span>
          </button>

          {result.passed && hasNextProject && (
            <button
              className="lab-btn lab-btn-amber"
              style={{ background: "#8b5cf6", color: "#fff", borderColor: "#7c3aed" }}
              onClick={onNextProject}
            >
              <span>Next Project 🚀</span>
            </button>
          )}

          {result.passed && !hasNextProject && (
            <Link to="/world/studio" className="lab-btn lab-btn-test flex items-center gap-1.5" onClick={onExitStudio}>
              <LogOut size={15} />
              <span>Exit to Studio Campus</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
