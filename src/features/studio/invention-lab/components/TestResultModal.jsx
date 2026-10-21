import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Home, LogOut, RotateCcw, Wrench } from "lucide-react";

/**
 * Result modal shown when clicking "Test Invention".
 * - If failed: Shows exactly what went wrong and 1 specific actionable fix hint.
 * - If passed:
 *   - If there is a next mission: "Next Mission" button.
 *   - If last mission completed: "Exit to Studio Campus" button.
 */
export default function TestResultModal({ result, onClose, onNextMission, hasNextMission, onExitStudio }) {
  if (!result) return null;

  return (
    <div className="lab-modal-backdrop" data-testid="test-result-modal">
      <div className="lab-modal-card">
        {/* Header */}
        <div className={`lab-modal-header ${result.passed ? "success" : "fail"}`}>
          <div className="lab-modal-title">
            {result.passed ? (
              <>
                <CheckCircle size={22} className="text-emerald-400" />
                <span>{hasNextMission ? "Mission Complete!" : "All Missions Mastered! 🏆"}</span>
              </>
            ) : (
              <>
                <AlertCircle size={22} className="text-rose-400" />
                <span>Test Failed: {result.failureTitle}</span>
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
              {!hasNextMission && (
                <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                  🎉 Outstanding engineering! You have completed all 4 Invention Lab missions and mastered mechanical and electrical systems!
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="lab-fail-box">
                <span className="font-bold text-rose-300 text-sm">What went wrong:</span>
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
            <span>{result.passed ? "Inspect Machine" : "Fix on Workbench"}</span>
          </button>

          {result.passed && hasNextMission && (
            <button className="lab-btn lab-btn-amber" onClick={onNextMission}>
              <span>Next Mission 🚀</span>
            </button>
          )}

          {result.passed && !hasNextMission && (
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
