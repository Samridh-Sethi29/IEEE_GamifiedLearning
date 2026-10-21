import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  ExternalLink,
  HelpCircle,
  LogOut,
  Sparkles,
  Trophy,
} from "lucide-react";

import { getChallengeById } from "../data/storyChallenges.js";
import { evaluateChallenge } from "../engine/storyChallengeEngine.js";

/**
 * Story Studio Challenge HUD (C3).
 * Renders at the top of the editor workspace when an active challenge is loaded.
 * Provides real-time objective feedback, instructions, progress status,
 * navigation to the Challenge Hub, and safe exit back to personal stories.
 */
export default function StoryChallengeHUD({
  challengeId,
  currentStory,
  onOpenHub,
  onExitChallenge,
  onJumpToSection,
  onCheckChallenge,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState(null);

  const challenge = useMemo(
    () => getChallengeById(challengeId),
    [challengeId]
  );

  // Real-time deterministic objective evaluation on the active story document
  const evaluation = useMemo(() => {
    if (!challenge || !currentStory) return null;
    return evaluateChallenge(challenge, currentStory);
  }, [challenge, currentStory]);

  if (!challenge || !evaluation) return null;

  const { objectives, summary, eligibleForCompletion } = evaluation;

  // Maps objective IDs to relevant editor controls for helpful jump action
  const getJumpTarget = (objId) => {
    switch (objId) {
      case "scenes-count":
        return { label: "Scene Navigator", target: "navigator" };
      case "narration":
      case "narration-depth":
        return { label: "Narration", target: "narration" };
      case "dialogue":
      case "character-dialogue":
      case "ensemble-dialogue":
        return { label: "Dialogue Lines", target: "dialogue" };
      case "character-placed":
      case "distinct-characters":
      case "distinct-expressions":
        return { label: "Characters", target: "characters" };
      case "distinct-backgrounds":
        return { label: "Backgrounds", target: "backgrounds" };
      case "props-placed":
        return { label: "Props", target: "props" };
      case "branching-choice":
      case "distinct-targets":
      case "reachable-endings":
      case "branching-endings":
        return { label: "Choices", target: "choices" };
      default:
        return null;
    }
  };

  const handleJump = (target) => {
    if (typeof onJumpToSection === "function") {
      onJumpToSection(target);
    } else {
      // Default DOM smooth scroll to relevant section
      const selectorMap = {
        navigator: ".scene-navigator",
        narration: ".scene-director-narration",
        dialogue: ".scene-director-dialogue",
        characters: ".scene-director-characters",
        backgrounds: ".scene-director-backgrounds",
        props: ".scene-director-props",
        choices: ".scene-director-choices",
      };
      const selector = selectorMap[target];
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  };

  const handleCheckClick = () => {
    if (typeof onCheckChallenge === "function") {
      const res = onCheckChallenge(evaluation);
      if (res && res.message) {
        setCheckFeedback({
          type: res.success ? "success" : "warning",
          message: res.message,
          remainingTasks: res.remainingTasks || [],
        });
      }
    } else {
      if (eligibleForCompletion) {
        setCheckFeedback({
          type: "success",
          message: "All challenge objectives are verified! You are ready to complete this challenge.",
          remainingTasks: [],
        });
      } else {
        setIsExpanded(true);
        setCheckFeedback({
          type: "warning",
          message: `Challenge incomplete: ${summary.totalCount - summary.metCount} objective(s) remaining.`,
          remainingTasks: summary.remainingTasks || [],
        });
      }
    }
  };

  return (
    <aside
      className={`story-challenge-hud ${
        isExpanded ? "story-challenge-hud--expanded" : ""
      } ${eligibleForCompletion ? "story-challenge-hud--complete" : ""}`}
      aria-label="Active Challenge Objectives"
      data-testid="story-challenge-hud"
    >
      {/* Top Banner / Collapsed Strip */}
      <div className="story-challenge-hud-bar">
        <div className="story-challenge-hud-left">
          <div className="story-challenge-hud-badge">
            <Trophy size={16} aria-hidden="true" className="story-challenge-hud-trophy" />
            <span className="story-challenge-hud-level">
              Level {challenge.level}
            </span>
          </div>

          <div className="story-challenge-hud-title-wrap">
            <strong className="story-challenge-hud-title" data-testid="challenge-hud-title">
              {challenge.title}
            </strong>
            <span className="story-challenge-hud-subtitle">
              {challenge.subtitle}
            </span>
          </div>
        </div>

        <div className="story-challenge-hud-center">
          <div
            className={`story-challenge-hud-progress-pill ${
              eligibleForCompletion ? "story-challenge-hud-progress-pill--all-met" : ""
            }`}
            data-testid="challenge-hud-progress-pill"
          >
            {eligibleForCompletion ? (
              <>
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>All {summary.totalCount} Objectives Met (100%)</span>
              </>
            ) : (
              <>
                <Clock size={14} aria-hidden="true" />
                <span>
                  {summary.metCount} of {summary.totalCount} Objectives Met ({summary.percentComplete}%)
                </span>
              </>
            )}
          </div>
        </div>

        <div className="story-challenge-hud-right">
          <button
            type="button"
            className={`story-btn story-btn--sm story-challenge-hud-check-btn ${
              eligibleForCompletion
                ? "story-btn--primary story-challenge-hud-check-btn--ready"
                : "story-btn--ghost"
            }`}
            onClick={handleCheckClick}
            data-testid="challenge-hud-check-btn"
            title={
              eligibleForCompletion
                ? "All requirements met! Click to verify and complete challenge"
                : "Check your progress against challenge objectives"
            }
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>{eligibleForCompletion ? "Complete Challenge" : "Check Challenge"}</span>
          </button>

          <button
            type="button"
            className="story-btn story-btn--ghost story-btn--sm story-challenge-hud-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="challenge-hud-tray"
            data-testid="challenge-hud-toggle-btn"
            title={isExpanded ? "Hide Objectives Checklist" : "View Objectives Checklist"}
          >
            <span>{isExpanded ? "Hide Objectives" : "View Objectives"}</span>
            {isExpanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="story-btn story-btn--ghost story-btn--sm story-challenge-hud-btn"
            onClick={onOpenHub}
            data-testid="challenge-hud-open-hub-btn"
            title="Open Challenge Hub (View all levels and rewards)"
          >
            <Trophy size={14} aria-hidden="true" />
            <span>Hub</span>
          </button>

          <button
            type="button"
            className="story-btn story-btn--ghost story-btn--sm story-challenge-hud-exit-btn"
            onClick={onExitChallenge}
            data-testid="challenge-hud-exit-btn"
            title="Save challenge draft and return to personal stories"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>Exit Challenge</span>
          </button>
        </div>
      </div>

      {/* Expandable Tray: Detailed Objectives Checklist */}
      {isExpanded && (
        <div
          id="challenge-hud-tray"
          className="story-challenge-hud-tray"
          data-testid="challenge-hud-tray"
        >
          {checkFeedback && (
            <div
              className={`story-challenge-hud-feedback story-challenge-hud-feedback--${checkFeedback.type}`}
              data-testid="challenge-hud-feedback-banner"
            >
              <div className="story-challenge-hud-feedback-header">
                <strong>{checkFeedback.message}</strong>
              </div>
              {checkFeedback.remainingTasks && checkFeedback.remainingTasks.length > 0 && (
                <ul className="story-challenge-hud-remaining-list">
                  {checkFeedback.remainingTasks.map((task, tIdx) => (
                    <li key={tIdx}>{task}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="story-challenge-hud-instructions">
            <p>
              <strong>Mission:</strong> {challenge.description}
            </p>
          </div>

          <div className="story-challenge-hud-objectives-grid">
            {objectives.map((obj, index) => {
              const jump = getJumpTarget(obj.id);

              return (
                <div
                  key={obj.id}
                  className={`story-challenge-hud-obj-item ${
                    obj.met ? "story-challenge-hud-obj-item--met" : ""
                  }`}
                  data-testid={`hud-objective-${obj.id}`}
                >
                  <div className="story-challenge-hud-obj-status">
                    {obj.met ? (
                      <div
                        className="story-challenge-hud-check"
                        title="Requirement satisfied"
                      >
                        <Check size={13} aria-hidden="true" />
                      </div>
                    ) : (
                      <div
                        className="story-challenge-hud-num"
                        title={`Objective ${index + 1}`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="story-challenge-hud-obj-body">
                    <div className="story-challenge-hud-obj-title-row">
                      <span className="story-challenge-hud-obj-label">
                        {obj.label}
                      </span>
                      <span
                        className={`story-challenge-hud-obj-badge ${
                          obj.met ? "story-challenge-hud-obj-badge--met" : ""
                        }`}
                      >
                        {obj.met ? (
                          "Met"
                        ) : (
                          `${obj.current ?? 0} / ${obj.target} ${obj.unit || ""}`
                        )}
                      </span>
                    </div>

                    <p className="story-challenge-hud-obj-desc">
                      {obj.description}
                    </p>

                    {!obj.met && (
                      <div className="story-challenge-hud-obj-unmet">
                        <span className="story-challenge-hud-obj-detail">
                          {obj.unmetRequirement || obj.details}
                        </span>
                        {jump && (
                          <button
                            type="button"
                            className="story-challenge-hud-jump-btn"
                            onClick={() => handleJump(jump.target)}
                            title={`Jump to ${jump.label}`}
                            data-testid={`hud-jump-${obj.id}`}
                          >
                            <span>Go to {jump.label}</span>
                            <ExternalLink size={11} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
