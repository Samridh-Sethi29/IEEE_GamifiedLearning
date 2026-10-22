import React from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

/**
 * WorkbenchGuidePopup
 * Renders an interactive instruction banner floating directly over the workbench grid.
 * Explains what parts to drag, what each does, and steps to build.
 * Automatically advances to the next step when the current step's action is performed!
 */
export default function WorkbenchGuidePopup({
  guides,
  currentStep,
  onStepChange,
  onDismiss,
}) {
  if (!guides || guides.length === 0) return null;
  const guide = guides[currentStep] || guides[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === guides.length - 1;

  return (
    <div className="lab-workbench-guide" data-testid="workbench-guide">
      <div className="lab-guide-header">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 animate-pulse" />
          <span className="font-bold text-amber-300 text-xs tracking-wider uppercase">
            Workbench Guidance: {guide.title}
          </span>
        </div>
        <button
          className="lab-guide-close-btn"
          onClick={onDismiss}
          title="Minimize guide (re-open anytime with 'Guide' button)"
        >
          <X size={14} />
        </button>
      </div>

      <div className="lab-guide-content">
        <p className="text-xs text-slate-100 font-medium leading-relaxed">
          {guide.instruction}
        </p>
      </div>

      <div className="lab-guide-footer">
        <div className="flex items-center gap-1.5">
          {guides.map((_, idx) => (
            <button
              key={idx}
              className={`lab-guide-dot ${idx === currentStep ? "active" : ""} ${
                idx < currentStep ? "completed" : ""
              }`}
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
              onClick={() => onStepChange(Math.min(guides.length - 1, currentStep + 1))}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          ) : (
            <button className="lab-guide-btn done" onClick={onDismiss}>
              <CheckCircle2 size={13} />
              <span>Ready to Build!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
