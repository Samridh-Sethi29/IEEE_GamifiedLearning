import { useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  GitFork,
  MessageCircle,
  Printer,
  Sparkles,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import {
  STORY_BACKGROUNDS,
  STORY_CHARACTERS,
  STORY_PROPS,
} from "../engine/storySchema.js";
import {
  buildPrintableStoryModel,
  triggerBrowserPrint,
} from "../engine/storyExport.js";
import {
  StoryBackdrop,
  StoryCharacter,
  StoryProp,
} from "../art/StoryArtComponents.jsx";

/**
 * Storybook Print & Export Preview Modal (S1.10).
 *
 * Provides:
 * 1. Screen preview of the formatted, multi-scene illustrated storybook
 * 2. Standard browser Print / "Save as PDF" triggering via window.print()
 * 3. Print-specific layout (@media print) hiding editor toolbars and controls
 * 4. Page-break avoidance on scene cards and dialogue blocks
 * 5. Consistent SVG backdrops and character illustrations
 */
export default function StoryPrintPreviewModal({
  isOpen,
  onClose,
  story,
}) {
  const modalRef = useRef(null);

  const printModel = useMemo(() => {
    if (!story) return null;
    try {
      return buildPrintableStoryModel(story);
    } catch {
      return null;
    }
  }, [story]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose && onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    triggerBrowserPrint();
  };

  if (!isOpen || !printModel) return null;

  return (
    <div
      ref={modalRef}
      className="story-modal-overlay story-print-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-print-modal-title"
      data-testid="story-print-preview-modal"
    >
      <div className="story-modal-dialog story-print-dialog">
        {/* Screen Controls Header (Hidden in Print via CSS) */}
        <header className="story-modal-header story-print-header no-print">
          <div className="story-modal-title-group">
            <Printer size={22} className="story-modal-icon" aria-hidden="true" />
            <div>
              <h2 id="story-print-modal-title" className="story-modal-title">
                Print & Export Storybook
              </h2>
              <p className="story-modal-subtitle">
                Preview your illustrated picture-book before printing or saving as PDF
              </p>
            </div>
          </div>

          <div className="story-modal-header-actions">
            <button
              type="button"
              className="story-btn story-btn--primary story-btn--md"
              onClick={handlePrint}
              data-testid="story-print-submit-btn"
            >
              <Printer size={16} aria-hidden="true" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              className="story-icon-btn story-modal-close"
              onClick={onClose}
              aria-label="Close Print Preview"
              data-testid="story-print-close-btn"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Print Tip Banner (Hidden in Print) */}
        <div className="story-print-tip-banner no-print">
          <Sparkles size={16} aria-hidden="true" />
          <span>
            <strong>Printing Tip:</strong> In your browser's print dialog, choose <em>"Save as PDF"</em> to export a digital book file, and make sure <em>"Background graphics"</em> is checked for full-color illustrations.
          </span>
        </div>

        {/* Printable Storybook Scroll Container */}
        <div className="story-print-viewport" data-testid="story-print-viewport">
          <div className="story-printable-document" data-testid="story-printable-document">
            {/* Book Cover Header */}
            <header className="story-print-cover">
              <div className="story-print-brand">SkillVerse Story Studio</div>
              <h1 className="story-print-title" data-testid="story-print-title">
                {printModel.title}
              </h1>
              <div className="story-print-byline">
                <span>Written by <strong>{printModel.author}</strong></span>
                <span>•</span>
                <span>{printModel.formattedDate}</span>
                <span>•</span>
                <span>{printModel.sceneCount} {printModel.sceneCount === 1 ? "Scene" : "Scenes"}</span>
              </div>
            </header>

            {/* Ordered Scenes */}
            <div className="story-print-scenes-list">
              {printModel.scenes.map((scene) => {
                // Map character slots
                const slotMap = { left: null, center: null, right: null };
                (scene.characters || []).forEach((c) => {
                  if (c.slot && slotMap[c.slot] !== undefined) {
                    slotMap[c.slot] = c;
                  }
                });

                return (
                  <article
                    key={scene.id}
                    className="story-print-scene-card"
                    data-testid={`story-print-scene-${scene.id}`}
                  >
                    {/* Scene Chapter Banner */}
                    <div className="story-print-scene-banner">
                      <h2 className="story-print-scene-title">
                        Scene {scene.sceneNumber}: {scene.name}
                      </h2>
                      <span className="story-print-scene-setting">
                        Setting: <strong>{scene.backgroundLabel}</strong>
                      </span>
                    </div>

                    {/* Stage Illustration */}
                    <div className="story-print-stage-frame">
                      <div className="story-print-stage-aspect">
                        {/* Background Vector Art */}
                        <div className="story-stage-backdrop-layer">
                          <StoryBackdrop background={scene.background} />
                        </div>

                        {/* Props Layer */}
                        {scene.props.length > 0 && (
                          <div className="story-stage-props-layer">
                            {scene.props.map((p) => (
                              <div
                                key={p.id}
                                className={`story-placed-prop story-placed-prop--${p.id}`}
                                title={p.label}
                              >
                                <StoryProp propId={p.id} />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actors Staged */}
                        <div className="story-stage-slots-layer">
                          {/* Left Slot */}
                          <div className="story-stage-slot story-stage-slot--left">
                            {slotMap.left && (
                              <div className="story-staged-actor">
                                <StoryCharacter
                                  characterId={slotMap.left.characterId}
                                  expression={slotMap.left.expression}
                                  facing={slotMap.left.facing}
                                />
                                <span className="story-actor-label-tag">
                                  {slotMap.left.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Center Slot */}
                          <div className="story-stage-slot story-stage-slot--center">
                            {slotMap.center && (
                              <div className="story-staged-actor">
                                <StoryCharacter
                                  characterId={slotMap.center.characterId}
                                  expression={slotMap.center.expression}
                                  facing={slotMap.center.facing}
                                />
                                <span className="story-actor-label-tag">
                                  {slotMap.center.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Slot */}
                          <div className="story-stage-slot story-stage-slot--right">
                            {slotMap.right && (
                              <div className="story-staged-actor">
                                <StoryCharacter
                                  characterId={slotMap.right.characterId}
                                  expression={slotMap.right.expression}
                                  facing={slotMap.right.facing}
                                />
                                <span className="story-actor-label-tag">
                                  {slotMap.right.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Narration Block */}
                    {scene.narration && (
                      <div className="story-print-narration-block">
                        <BookOpen size={16} aria-hidden="true" className="story-print-narration-icon" />
                        <p className="story-print-narration-text">{scene.narration}</p>
                      </div>
                    )}

                    {/* Dialogue Script */}
                    {scene.dialogue.length > 0 && (
                      <div className="story-print-dialogue-section">
                        <h3 className="story-print-dialogue-heading">Dialogue</h3>
                        <div className="story-print-dialogue-list">
                          {scene.dialogue.map((line) => (
                            <div
                              key={line.id}
                              className={`story-print-dialogue-row story-print-dialogue-row--${line.type}`}
                            >
                              <div className="story-print-speaker-badge">
                                <strong>{line.speakerName}</strong>
                                {line.type === "thought" && <span className="story-print-type-tag">(thought)</span>}
                                {line.type === "shout" && <span className="story-print-type-tag">(shouted!)</span>}
                              </div>
                              <div className="story-print-bubble-box">
                                <p className="story-print-bubble-text">{line.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Branching Choices or Ending Notice */}
                    {scene.choices.length > 0 && (
                      <div className="story-print-choices-box">
                        <div className="story-print-choices-title">
                          <GitFork size={14} aria-hidden="true" />
                          <span>Branching Decision Point:</span>
                        </div>
                        <ul className="story-print-choices-list">
                          {scene.choices.map((ch) => (
                            <li key={ch.id}>
                              <strong>Option:</strong> "{ch.text}" &rarr;{" "}
                              <em>Leads to {ch.targetSceneName}</em>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scene.isEnding && (
                      <div className="story-print-ending-box">
                        <Sparkles size={14} aria-hidden="true" />
                        <span>Story Ending: <strong>{scene.name}</strong></span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Book End Page Footer */}
            <footer className="story-print-book-footer">
              <div className="story-print-end-badge">The End</div>
              <p className="story-print-footer-tagline">
                Created with SkillVerse Creative Studio • Story Studio
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
