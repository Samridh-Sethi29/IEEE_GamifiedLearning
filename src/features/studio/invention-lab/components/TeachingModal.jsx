import React from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Play, X } from "lucide-react";

/**
 * Teaching Modal shown before each mission starts.
 * Teaches:
 * 1. How to drag and drop parts onto the workbench.
 * 2. What each allowed part does.
 * 3. How to connect/snap and test them.
 */
export default function TeachingModal({ mission, currentStep, onNext, onPrev, onClose, onStartMission }) {
  if (!mission || !mission.teaching) return null;

  const slides = mission.teaching;
  const slide = slides[currentStep] || slides[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === slides.length - 1;

  return (
    <div className="lab-modal-backdrop" data-testid="teaching-modal">
      <div className="lab-modal-card">
        {/* Header */}
        <div className="lab-modal-header teaching">
          <div className="lab-modal-title">
            <span>{mission.icon}</span>
            <span>Mission {mission.number} Training: {slide.title}</span>
          </div>
          <button className="lab-tool-btn" onClick={onClose} aria-label="Close teaching modal">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="lab-modal-body">
          <p className="text-slate-200 font-medium">{slide.description}</p>

          {slide.parts && (
            <div className="lab-parts-preview-grid">
              {slide.parts.map((p, idx) => (
                <div key={idx} className="lab-part-preview-row">
                  <span className="font-bold text-amber-400 text-sm">{p.name}:</span>
                  <span className="text-xs text-slate-300">{p.desc}</span>
                </div>
              ))}
            </div>
          )}

          {slide.tip && (
            <div className="lab-hint-box">
              <Lightbulb size={18} className="shrink-0 text-amber-400 mt-0.5" />
              <span><strong>Builder Tip:</strong> {slide.tip}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lab-modal-footer">
          <div className="lab-step-dots">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`lab-step-dot ${i === currentStep ? "active" : ""}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button className="lab-btn lab-btn-ghost" onClick={onPrev}>
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}

            {!isLast ? (
              <button className="lab-btn lab-btn-amber" onClick={onNext}>
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button className="lab-btn lab-btn-test" onClick={onStartMission}>
                <Play size={14} fill="currentColor" />
                <span>Start Mission {mission.number}!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
