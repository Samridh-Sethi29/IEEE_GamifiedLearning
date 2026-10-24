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
                <CheckCircle size={24} className="atl-icon-good" />
                <span>{hasNextProject ? "Design Coach Approved! 🎨" : "Master Designer Certified! 🏆"}</span>
              </>
            ) : (
              <>
                <AlertCircle size={24} className="atl-icon-bad" />
                <span>Coach Feedback: {result.failureTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="lab-modal-body">
          {result.passed ? (
            <div className="lab-success-box">
              <h4 className="atl-result-title">{result.title}</h4>
              <p className="atl-result-text">{result.summary}</p>
              {!hasNextProject && (
                <div className="atl-celebrate">
                  🎉 Fantastic visual communication! You have created posters for awareness, community, events, and digital safety like a professional designer!
                </div>
              )}
            </div>
          ) : (
            <div className="atl-stack">
              <div className="lab-fail-box">
                <strong className="atl-result-label">What can be improved</strong>
                <span className="atl-result-text">{result.failureReason}</span>
              </div>

              {result.hint && (
                <div className="lab-hint-box">
                  <Wrench size={20} className="atl-icon-hint" />
                  <div>
                    <strong className="atl-result-label">How to fix it</strong>
                    <span className="atl-result-text">{result.hint}</span>
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
              className="lab-btn lab-btn-violet"
              onClick={onNextProject}
            >
              <span>Next Project 🚀</span>
            </button>
          )}

          {result.passed && !hasNextProject && (
            <Link to="/world/studio" className="lab-btn lab-btn-test" onClick={onExitStudio}>
              <LogOut size={15} />
              <span>Exit to Studio Campus</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
