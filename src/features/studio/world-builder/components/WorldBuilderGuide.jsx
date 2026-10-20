import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";
import {
  BUILDER_GUIDE_HONESTY_NOTE,
  BUILDER_GUIDE_STEPS,
} from "../data/guideSteps.js";
import { navigateToGuideTarget } from "../engine/guideNavigation.js";

/**
 * Child-friendly Guided Start Experience for World Builder (D3.6A / D3.6D).
 * Explains the 6 essential steps to building a valid water system for "Save Our Village".
 *
 * Improvements in D3.6D:
 * - Compact header with title, subtitle, minimize toggle, and close button.
 * - Responsive grid on desktop, single-column layout on narrow screens.
 * - Independent scrollable body to keep the main editor and toolbar easily accessible.
 * - Accurate target selectors for every action (Well, Canvas, Tank, Household, Water System, Dashboard).
 * - Smooth scroll with scrollIntoView({ behavior: 'smooth', block: 'center' }).
 * - Automatically expands collapsed panels on narrow viewports before scrolling.
 * - Closes or minimizes the guide before navigating so the overlay does not obscure the target.
 * - Applies a temporary, accessible highlight treatment that automatically clears without altering data.
 *
 * @param {object} props
 * @param {Function} props.onDismiss - Callback when player dismisses or closes the guide
 */
export default function WorldBuilderGuide({ onDismiss }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const navigateToSection = (selector) => {
    // Delegated to authoritative navigation engine
    // Ensures scrollIntoView, panel expansion, highlight, and dismissal
    navigateToGuideTarget(selector, { onDismiss });
  };

  return (
    <section
      className={`wb-guide-card${isMinimized ? " wb-guide-card--minimized" : ""}`}
      data-testid="wb-guide-card"
      role="region"
      aria-label="How to build your water system guide"
    >
      <div className="wb-guide-header">
        <div className="wb-guide-title-wrap">
          <BookOpen className="wb-guide-icon" size={20} aria-hidden="true" />
          <div>
            <h2 className="wb-guide-title" data-testid="wb-guide-title">
              How to Build Your Water System
            </h2>
            <p className="wb-guide-subtitle">
              {isMinimized
                ? "Guide minimized — click expand to view all 6 building steps"
                : "Follow these 6 steps to solve the village water crisis"}
            </p>
          </div>
        </div>
        <div className="wb-guide-header-actions">
          <button
            type="button"
            className="wb-guide-minimize-btn"
            onClick={() => setIsMinimized((m) => !m)}
            data-testid="wb-guide-minimize-btn"
            aria-label={isMinimized ? "Expand building guide" : "Minimize building guide"}
            title={isMinimized ? "Expand guide" : "Minimize guide"}
          >
            {isMinimized ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="wb-guide-dismiss-btn"
            onClick={onDismiss}
            data-testid="wb-guide-dismiss-btn"
            aria-label="Dismiss building guide"
            title="Dismiss guide"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="wb-guide-body" data-testid="wb-guide-body">
          <div className="wb-guide-honesty-note" data-testid="wb-guide-honesty-note">
            <strong>Builder Tip:</strong> {BUILDER_GUIDE_HONESTY_NOTE}
          </div>

          <ol className="wb-guide-steps" data-testid="wb-guide-steps">
            {BUILDER_GUIDE_STEPS.map((s) => (
              <li className="wb-guide-step" key={s.id} data-testid={s.testId}>
                <div className="wb-guide-step-header">
                  <span className="wb-guide-step-num">{s.step}</span>
                  <h3 className="wb-guide-step-title">{s.title}</h3>
                </div>
                <p className="wb-guide-step-desc">{s.description}</p>
                <div className="wb-guide-actions-row">
                  <button
                    type="button"
                    className="wb-guide-step-action"
                    onClick={() => navigateToSection(s.targetSelector)}
                    data-testid={s.actionTestId}
                    aria-label={`${s.actionLabel} for step ${s.step}`}
                  >
                    {s.actionLabel} <ChevronRight size={12} aria-hidden="true" />
                  </button>
                  {s.secondaryActionLabel && (
                    <button
                      type="button"
                      className="wb-guide-step-action wb-guide-step-action--secondary"
                      onClick={() => navigateToSection(s.secondaryTargetSelector)}
                      data-testid={s.secondaryActionTestId}
                      aria-label={`${s.secondaryActionLabel} for step ${s.step}`}
                    >
                      {s.secondaryActionLabel} <ChevronRight size={12} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="wb-guide-footer">
            <p className="wb-guide-footer-tip">
              You can reopen this guide anytime using the <strong>How to Build Guide</strong> button in the top bar.
            </p>
            <button
              type="button"
              className="wb-guide-got-it-btn"
              onClick={onDismiss}
              data-testid="wb-guide-got-it-btn"
            >
              Got it, let&apos;s build!
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
