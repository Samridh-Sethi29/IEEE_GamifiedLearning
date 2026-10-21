import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  GitBranch,
  Library,
  Lock,
  Pencil,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  CHALLENGES,
  CHALLENGE_IDS,
  CHALLENGE_ORDER,
  createChallengeStarterStory,
  getAllChallenges,
  getChallengeById,
  getPrerequisiteChallenge,
} from "../data/storyChallenges.js";
import {
  CHALLENGE_STATUSES,
  deriveAllChallengeStatuses,
  deriveChallengeStatus,
  getAllChallengesProgress,
  getChallengeProgress,
  normalizeProgressState,
  startChallengeAttempt,
} from "../engine/storyChallengeProgress.js";
import {
  createStoryChallengeStorage,
} from "../engine/storyChallengeStorage.js";

/**
 * Story Studio Challenge Hub and Level Selection Modal (C2).
 * Responsive level selection interface with objective breakdowns, lock states,
 * reward previews, and seamless navigation between challenges, the editor, and library.
 */
export default function StoryChallengeModal({
  isOpen,
  onClose,
  storage,
  currentStory,
  onStartChallenge,
  onOpenLibrary,
}) {
  const challengeStorage = useMemo(
    () => createStoryChallengeStorage({ storage }),
    [storage]
  );

  const [progressState, setProgressState] = useState(() => {
    const res = challengeStorage.loadProgress();
    return res.progressState;
  });

  // Default selected challenge to active one, or first incomplete, or Level 1
  const [selectedChallengeId, setSelectedChallengeId] = useState(() => {
    if (currentStory?.metadata?.challengeId) {
      return currentStory.metadata.challengeId;
    }
    const initialProgress = challengeStorage.loadProgress().progressState;
    for (const c of CHALLENGES) {
      const status = deriveChallengeStatus(c.id, initialProgress);
      if (status !== CHALLENGE_STATUSES.COMPLETED) {
        return c.id;
      }
    }
    return CHALLENGE_IDS.STORY_BEGINS;
  });

  // Reload progress whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const res = challengeStorage.loadProgress();
      const fresh = res.progressState;
      setProgressState(fresh);

      if (currentStory?.metadata?.challengeId) {
        setSelectedChallengeId(currentStory.metadata.challengeId);
      } else {
        // Pick active challenge, or first in-progress, or first available
        if (fresh.activeChallengeId) {
          setSelectedChallengeId(fresh.activeChallengeId);
        } else {
          for (const c of CHALLENGES) {
            const st = deriveChallengeStatus(c.id, fresh);
            if (st === CHALLENGE_STATUSES.IN_PROGRESS || st === CHALLENGE_STATUSES.UNLOCKED) {
              setSelectedChallengeId(c.id);
              break;
            }
          }
        }
      }
    }
  }, [isOpen, challengeStorage, currentStory]);

  // Handle keyboard: Escape closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedChallenge = getChallengeById(selectedChallengeId) || CHALLENGES[0];
  const challengeProgress = getChallengeProgress(progressState, selectedChallenge.id);
  const status = challengeProgress?.status || CHALLENGE_STATUSES.LOCKED;
  const prerequisite = getPrerequisiteChallenge(selectedChallenge.id);

  // Overall progress summary across all 5 challenges
  const allProgress = getAllChallengesProgress(progressState);
  const completedCount = allProgress.filter((p) => p.isCompleted).length;
  const inProgressCount = allProgress.filter((p) => p.isInProgress).length;

  const handleLaunch = () => {
    if (status === CHALLENGE_STATUSES.LOCKED) return;

    const freshProgress = challengeStorage.loadProgress().progressState;
    const startRes = startChallengeAttempt(freshProgress, selectedChallenge.id, {
      storyDoc:
        currentStory?.metadata?.challengeId === selectedChallenge.id
          ? currentStory
          : null,
      forceNew: false,
    });

    if (!startRes.ok) return;

    // Persist attempt updates
    challengeStorage.saveProgress(startRes.progressState);
    setProgressState(startRes.progressState);

    // Load or generate story document
    let storyToLoad = null;
    if (challengeStorage.hasChallengeStory(selectedChallenge.id)) {
      const storyRes = challengeStorage.loadChallengeStory(selectedChallenge.id);
      if (storyRes.ok && storyRes.story) {
        storyToLoad = storyRes.story;
      }
    }

    if (!storyToLoad) {
      storyToLoad = createChallengeStarterStory(selectedChallenge.id, {
        attemptId: startRes.attempt.id,
      });
      challengeStorage.saveChallengeStory(selectedChallenge.id, storyToLoad);
    }

    if (typeof onStartChallenge === "function") {
      onStartChallenge(storyToLoad, selectedChallenge);
    }

    onClose();
  };

  return (
    <div
      className="story-modal-overlay story-challenge-modal-overlay"
      onClick={onClose}
      data-testid="story-challenge-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-hub-title"
    >
      <div
        className="story-modal-dialog story-challenge-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="story-modal-header story-challenge-header">
          <div className="story-modal-title-group">
            <Trophy size={26} aria-hidden="true" className="story-challenge-header-icon" />
            <div>
              <h2 id="challenge-hub-title" className="story-modal-title">
                Story Studio Challenges
              </h2>
              <p className="story-modal-subtitle">
                Master narrative design, character depth, and interactive choices step-by-step
              </p>
            </div>
          </div>

          <div className="story-challenge-header-right">
            {/* Quick stats pill */}
            <div className="story-challenge-stat-badge" title="Total completed challenges">
              <Sparkles size={14} aria-hidden="true" />
              <span>
                {completedCount} of {CHALLENGES.length} Completed
              </span>
            </div>

            <button
              type="button"
              className="story-btn story-btn--ghost story-btn--sm story-modal-close"
              onClick={onClose}
              aria-label="Close Challenge Hub"
              title="Return to Story Studio editor"
              data-testid="challenge-modal-close-btn"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Roadmap list on left, detail inspector on right) */}
        <div className="story-modal-body story-challenge-body">
          {/* Left Column: Challenge Ladder */}
          <aside
            className="story-challenge-sidebar"
            aria-label="Challenge Selection List"
            data-testid="challenge-ladder"
          >
            <div className="story-challenge-sidebar-header">
              <h3 className="story-challenge-sidebar-title">Challenge Roadmap</h3>
              <span className="story-challenge-count-pill">
                Tier {Math.min(completedCount + 1, 5)} / 5
              </span>
            </div>

            <nav className="story-challenge-ladder" role="tablist" aria-orientation="vertical">
              {CHALLENGES.map((challenge, index) => {
                const prog = allProgress[index];
                const cStatus = prog?.status || CHALLENGE_STATUSES.LOCKED;
                const isSelected = challenge.id === selectedChallenge.id;
                const isCurrentlyActive =
                  currentStory?.metadata?.challengeId === challenge.id;

                return (
                  <button
                    key={challenge.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`challenge-panel-${challenge.id}`}
                    id={`challenge-tab-${challenge.id}`}
                    className={`story-challenge-ladder-item story-challenge-ladder-item--${cStatus} ${
                      isSelected ? "story-challenge-ladder-item--selected" : ""
                    } ${isCurrentlyActive ? "story-challenge-ladder-item--active" : ""}`}
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    data-testid={`challenge-item-${challenge.id}`}
                  >
                    <div className="story-challenge-item-level">
                      {cStatus === CHALLENGE_STATUSES.COMPLETED ? (
                        <div
                          className="story-challenge-status-icon story-challenge-status-icon--completed"
                          title="Challenge Completed"
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                        </div>
                      ) : cStatus === CHALLENGE_STATUSES.LOCKED ? (
                        <div
                          className="story-challenge-status-icon story-challenge-status-icon--locked"
                          title="Locked"
                        >
                          <Lock size={15} aria-hidden="true" />
                        </div>
                      ) : cStatus === CHALLENGE_STATUSES.IN_PROGRESS ? (
                        <div
                          className="story-challenge-status-icon story-challenge-status-icon--progress"
                          title="In Progress"
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </div>
                      ) : (
                        <div
                          className="story-challenge-status-icon story-challenge-status-icon--unlocked"
                          title="Available to play"
                        >
                          <Play size={14} aria-hidden="true" />
                        </div>
                      )}
                      <span className="story-challenge-item-num">Lvl {challenge.level}</span>
                    </div>

                    <div className="story-challenge-item-meta">
                      <span className="story-challenge-item-title">{challenge.title}</span>
                      <div className="story-challenge-item-tags">
                        <span className="story-challenge-item-diff">
                          {challenge.difficulty}
                        </span>
                        <span className="story-challenge-item-rewards">
                          +{challenge.reward.xp} XP
                        </span>
                      </div>
                    </div>

                    {isCurrentlyActive && (
                      <span
                        className="story-challenge-editing-indicator"
                        title="Currently open in editor"
                      >
                        Editing
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Navigation Switch to Story Library */}
            <div className="story-challenge-sidebar-footer">
              <button
                type="button"
                className="story-btn story-btn--ghost story-btn--sm story-challenge-library-link"
                onClick={() => {
                  onClose();
                  if (typeof onOpenLibrary === "function") {
                    onOpenLibrary();
                  }
                }}
                data-testid="challenge-switch-to-library-btn"
              >
                <Library size={15} aria-hidden="true" />
                <span>Open Personal Stories Library</span>
              </button>
            </div>
          </aside>

          {/* Right Column: Challenge Detail Inspector */}
          <main
            className="story-challenge-content"
            id={`challenge-panel-${selectedChallenge.id}`}
            role="tabpanel"
            aria-labelledby={`challenge-tab-${selectedChallenge.id}`}
            data-testid="challenge-detail-panel"
          >
            {/* Level Banner */}
            <div className="story-challenge-banner">
              <div className="story-challenge-banner-top">
                <div className="story-challenge-badge-row">
                  <span className="story-challenge-level-pill">
                    Level {selectedChallenge.level}
                  </span>
                  <span
                    className={`story-challenge-status-pill story-challenge-status-pill--${status}`}
                    data-testid="challenge-status-pill"
                  >
                    {status === CHALLENGE_STATUSES.COMPLETED && "Completed"}
                    {status === CHALLENGE_STATUSES.IN_PROGRESS && "In Progress"}
                    {status === CHALLENGE_STATUSES.UNLOCKED && "Available"}
                    {status === CHALLENGE_STATUSES.LOCKED && "Locked"}
                  </span>
                  <span className="story-challenge-difficulty-pill">
                    {selectedChallenge.difficulty}
                  </span>
                </div>

                <h3 className="story-challenge-title">{selectedChallenge.title}</h3>
                <p className="story-challenge-subtitle">{selectedChallenge.subtitle}</p>
              </div>

              <p className="story-challenge-description">{selectedChallenge.description}</p>
            </div>

            {/* Lock Explanation Banner (if locked) */}
            {status === CHALLENGE_STATUSES.LOCKED && prerequisite && (
              <div
                className="story-challenge-lock-banner"
                data-testid="challenge-lock-banner"
              >
                <Lock size={20} aria-hidden="true" className="story-challenge-lock-banner-icon" />
                <div>
                  <strong>This challenge is currently locked.</strong>
                  <p>
                    Complete <strong>Level {prerequisite.level}: {prerequisite.title}</strong> to unlock this challenge and earn its rewards.
                  </p>
                </div>
              </div>
            )}

            {/* Objectives Section */}
            <section
              className="story-challenge-section story-challenge-objectives-section"
              aria-labelledby="challenge-objectives-heading"
            >
              <div className="story-challenge-section-header">
                <h4 id="challenge-objectives-heading" className="story-challenge-section-title">
                  Required Objectives
                </h4>
                {challengeProgress?.evaluation && (
                  <span className="story-challenge-progress-eval-badge">
                    {challengeProgress.evaluation.summary?.metCount ?? 0} of{" "}
                    {challengeProgress.evaluation.summary?.totalCount ?? selectedChallenge.orderedObjectives.length}{" "}
                    Met ({challengeProgress.evaluation.summary?.percentComplete ?? 0}%)
                  </span>
                )}
              </div>

              <div className="story-challenge-objectives-list">
                {selectedChallenge.orderedObjectives.map((obj, oIdx) => {
                  const evalObj = challengeProgress?.evaluation?.objectives?.find(
                    (o) => o.id === obj.id
                  );
                  const isMet = Boolean(evalObj?.met);

                  return (
                    <div
                      key={obj.id}
                      className={`story-challenge-objective-card ${
                        isMet ? "story-challenge-objective-card--met" : ""
                      }`}
                      data-testid={`challenge-objective-${obj.id}`}
                    >
                      <div className="story-challenge-obj-status-indicator">
                        {isMet ? (
                          <div
                            className="story-challenge-obj-check"
                            title="Objective Satisfied"
                          >
                            <Check size={14} aria-hidden="true" />
                          </div>
                        ) : (
                          <div
                            className="story-challenge-obj-number"
                            title={`Objective ${oIdx + 1}`}
                          >
                            {oIdx + 1}
                          </div>
                        )}
                      </div>

                      <div className="story-challenge-obj-content">
                        <div className="story-challenge-obj-header">
                          <span className="story-challenge-obj-label">{obj.label}</span>
                          {evalObj && typeof evalObj.current !== "undefined" && (
                            <span
                              className={`story-challenge-obj-progress-pill ${
                                isMet ? "story-challenge-obj-progress-pill--met" : ""
                              }`}
                            >
                              {evalObj.current} / {evalObj.target} {obj.unit}
                            </span>
                          )}
                        </div>

                        <p className="story-challenge-obj-desc">{obj.description}</p>

                        {obj.hint && (
                          <p className="story-challenge-obj-hint">
                            <strong>Tip:</strong> {obj.hint}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reward Preview Card */}
            <section
              className="story-challenge-section story-challenge-rewards-section"
              aria-labelledby="challenge-rewards-heading"
            >
              <h4 id="challenge-rewards-heading" className="story-challenge-section-title">
                Challenge Rewards
              </h4>

              <div className="story-challenge-reward-card">
                <div className="story-challenge-reward-items">
                  <div className="story-challenge-reward-item">
                    <Sparkles size={20} className="story-challenge-reward-icon story-challenge-reward-icon--xp" aria-hidden="true" />
                    <div>
                      <span className="story-challenge-reward-value">
                        +{selectedChallenge.reward.xp} XP
                      </span>
                      <span className="story-challenge-reward-label">Player Experience</span>
                    </div>
                  </div>

                  <div className="story-challenge-reward-item">
                    <Coins size={20} className="story-challenge-reward-icon story-challenge-reward-icon--coins" aria-hidden="true" />
                    <div>
                      <span className="story-challenge-reward-value">
                        +{selectedChallenge.reward.coins} Coins
                      </span>
                      <span className="story-challenge-reward-label">SkillVerse Currency</span>
                    </div>
                  </div>

                  <div className="story-challenge-reward-item story-challenge-reward-item--badge">
                    <Award size={22} className="story-challenge-reward-icon story-challenge-reward-icon--badge" aria-hidden="true" />
                    <div>
                      <span className="story-challenge-reward-value">
                        {selectedChallenge.badge.name}
                      </span>
                      <span className="story-challenge-reward-label">
                        {selectedChallenge.badge.description}
                      </span>
                    </div>
                  </div>
                </div>

                {status === CHALLENGE_STATUSES.COMPLETED && challengeProgress?.record?.completedAt && (
                  <div className="story-challenge-reward-claimed-banner">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>
                      Challenge completed on{" "}
                      {new Date(challengeProgress.record.completedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      . Rewards have been recorded.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Action Footer */}
            <div className="story-challenge-actions-bar">
              <div className="story-challenge-actions-left">
                <button
                  type="button"
                  className="story-btn story-btn--ghost story-btn--sm"
                  onClick={onClose}
                  data-testid="challenge-back-to-editor-btn"
                >
                  Return to Editor
                </button>
              </div>

              <div className="story-challenge-actions-right">
                {status === CHALLENGE_STATUSES.LOCKED ? (
                  <button
                    type="button"
                    className="story-btn story-btn--outline story-btn--disabled"
                    disabled
                    data-testid="challenge-launch-btn-locked"
                    title={`Complete Level ${prerequisite?.level || 1} first`}
                  >
                    <Lock size={16} aria-hidden="true" />
                    <span>Locked — Complete Level {prerequisite?.level} First</span>
                  </button>
                ) : status === CHALLENGE_STATUSES.COMPLETED ? (
                  <button
                    type="button"
                    className="story-btn story-btn--outline story-challenge-replay-btn"
                    onClick={handleLaunch}
                    data-testid="challenge-launch-btn-replay"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    <span>Review & Replay Story</span>
                  </button>
                ) : status === CHALLENGE_STATUSES.IN_PROGRESS ? (
                  <button
                    type="button"
                    className="story-btn story-btn--primary story-challenge-primary-btn"
                    onClick={handleLaunch}
                    data-testid="challenge-launch-btn-continue"
                  >
                    <Pencil size={16} aria-hidden="true" />
                    <span>Continue Challenge (Level {selectedChallenge.level})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="story-btn story-btn--primary story-challenge-primary-btn"
                    onClick={handleLaunch}
                    data-testid="challenge-launch-btn-start"
                  >
                    <Play size={16} aria-hidden="true" />
                    <span>Start Challenge (Level {selectedChallenge.level})</span>
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
