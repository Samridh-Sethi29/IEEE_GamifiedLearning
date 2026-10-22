import React from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

/**
 * AtelierGuidePopup
 * Renders an auto-advancing instruction banner floating directly over the design canvas.
 */
export default function AtelierGuidePopup({ guides, currentStep, onStepChange, onDismiss }) {
  if (!guides || guides.length === 0) return null;
  const guide = guides[currentStep] || guides[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === guides.length - 1;

  return (
    <div className="atelier-canvas-guide" data-testid="atelier-guide">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400 animate-pulse" />
          <span className="font-bold text-violet-300 text-xs tracking-wider uppercase">
            Design Step: {guide.title}
          </span>
        </div>
        <button
          className="lab-guide-close-btn"
          onClick={onDismiss}
          title="Minimize guide (re-open with 'Guide' button)"
        >
          <X size={14} />
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-2.5">
        <p className="text-xs text-slate-100 font-medium leading-relaxed">
          {guide.instruction}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {guides.map((_, idx) => (
            <button
              key={idx}
              className={`lab-guide-dot ${idx === currentStep ? "active" : ""} ${
                idx < currentStep ? "completed" : ""
              }`}
              style={idx === currentStep ? { background: "#8b5cf6" } : {}}
              onClick={() => onStepChange(idx)}
              title={`Step ${idx + 1}`}
            />
          ))}
          <span className="text-[10px] text-slate-400 ml-1 font-bold">
            Step {currentStep + 1} of {guides.length}
          </span>
        </div>

        <div className="flex gap-2">
          {!isFirst && (
            <button
              className="lab-guide-btn ghost"
              onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>
          )}

          {!isLast ? (
            <button
              className="lab-guide-btn"
              style={{ background: "#8b5cf6", borderColor: "#7c3aed", color: "#fff" }}
              onClick={() => onStepChange(Math.min(guides.length - 1, currentStep + 1))}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          ) : (
            <button className="lab-guide-btn done" onClick={onDismiss}>
              <CheckCircle2 size={13} />
              <span>Ready to Create!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
