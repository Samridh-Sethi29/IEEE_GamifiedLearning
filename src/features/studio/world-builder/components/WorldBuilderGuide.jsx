import { BookOpen, ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";
import {
  BUILDER_GUIDE_HONESTY_NOTE,
  BUILDER_GUIDE_STEPS,
} from "../data/guideSteps.js";
import { navigateToGuideTarget } from "../engine/guideNavigation.js";

/**
 * Child-friendly Guided Start Experience for World Builder.
 * Explains the 6 essential steps to building a valid water system for "Save Our Village".
 *
 * Space behaviour:
 * - Expanded: compact header, one-line tip, steps in a 3 / 2 / 1 column grid. The card is height-capped
 *   by the viewport and its body scrolls on its own, so it can never push the editor off screen.
 * - Minimized: a single slim banner row (expand + close). The header "How to Build Guide" button stays.
 * - Every action goes through `navigateToGuideTarget`, which minimizes the guide first so it cannot
 *   cover the target, then scrolls the real container, highlights, and (optionally) focuses.
 * - Open / minimized state lives in WorldBuilderWorkspace, outside the editor, so toggling the guide
 *   never touches (or remounts) the village design.
 *
 * @param {object} props
 * @param {boolean} props.isMinimized
 * @param {Function} props.onMinimizedChange - (nextMinimized: boolean) => void
 * @param {Function} props.onDismiss - Callback when the player closes the guide
 */
export default function WorldBuilderGuide({ isMinimized = false, onMinimizedChange, onDismiss }) {
  const setMinimized = (next) => {
    if (typeof onMinimizedChange === "function") onMinimizedChange(next);
  };

  const navigateToSection = (selector, focusSelector) => {
    // Delegated to the authoritative navigation engine: minimize -> layout -> expand panels ->
    // scroll real containers -> highlight -> focus.
    navigateToGuideTarget(selector, {
      onBeforeNavigate: () => setMinimized(true),
      focusSelector,
    });
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
                ? "6 steps — expand to read them"
                : "Follow these 6 steps to solve the village water crisis"}
            </p>
          </div>
        </div>
        <div className="wb-guide-header-actions">
          <button
            type="button"
            className="wb-guide-minimize-btn"
            onClick={() => setMinimized(!isMinimized)}
            aria-expanded={!isMinimized}
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
                    onClick={() => navigateToSection(s.targetSelector, s.focusSelector)}
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
