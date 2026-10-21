import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Clapperboard,
  MessageCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import {
  STORY_BACKGROUNDS,
  STORY_CHARACTERS,
  STORY_PROPS,
} from "../engine/storySchema.js";
import {
  StoryBackdrop,
  StoryCharacter,
  StoryProp,
} from "../art/StoryArtComponents.jsx";
import { createStoryVoicePlayer } from "../engine/storyVoiceEngine.js";

/**
 * Illustrated 16:9 Picture-Book Stage for Story Studio (S1.4 & S1.12).
 *
 * Renders:
 * - Visibly distinct vector background preset (Village Square, Classroom, Farm Field, Water Well, Cozy Cottage, Starry Night)
 * - Up to three characters placed in Left, Center, and Right slots
 * - Visible expressions (happy, thoughtful, surprised, worried, determined) and facing directions (left, right)
 * - Speech, thought, and shout dialogue bubbles associated with placed speakers
 * - Spoken dialogue playback via Web Speech API with character voice modulation
 * - Scene narration bar
 * - Props preset dressing
 */
export default function StoryStage({
  scene,
  sceneIndex = 0,
  totalScenes = 1,
  onSelectSlot,
  characterVoices = {},
}) {
  const [activeDialogueId, setActiveDialogueId] = useState(null);
  const [speakingLineId, setSpeakingLineId] = useState(null);

  const voicePlayerRef = useRef(null);
  if (!voicePlayerRef.current) {
    voicePlayerRef.current = createStoryVoicePlayer({
      onStateChange: ({ isSpeaking, currentSpeakingInfo }) => {
        setSpeakingLineId(isSpeaking ? currentSpeakingInfo?.lineId : null);
      },
    });
  }

  // Cleanup on unmount or scene change
  useEffect(() => {
    return () => {
      voicePlayerRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
  }, [scene?.id]);

  const bgMeta = STORY_BACKGROUNDS[scene?.background];
  const bgLabel = bgMeta?.label || scene?.background || "Village Square";

  const characters = scene?.characters || [];
  const dialogue = scene?.dialogue || [];
  const props = scene?.props || [];
  const narration = scene?.narration || "";

  // Map slots to character placements
  const slotMap = useMemo(() => {
    const map = { left: null, center: null, right: null };
    characters.forEach((c) => {
      if (c.slot && map[c.slot] !== undefined) {
        map[c.slot] = c;
      }
    });
    return map;
  }, [characters]);

  // Determine which dialogue line to highlight / show on stage
  const currentLine = useMemo(() => {
    if (!dialogue || dialogue.length === 0) return null;
    if (activeDialogueId) {
      const found = dialogue.find((d) => d.id === activeDialogueId);
      if (found) return found;
    }
    // Default to the most recent or first dialogue line
    return dialogue[dialogue.length - 1];
  }, [dialogue, activeDialogueId]);

  // Find speaker character and their slot for bubble positioning
  const speakerPlacement = useMemo(() => {
    if (!currentLine || currentLine.speakerId === "narrator") return null;
    return characters.find((c) => c.characterId === currentLine.speakerId) || null;
  }, [currentLine, characters]);

  // Speak or stop speaking a dialogue line
  const handleToggleVoiceLine = useCallback(
    (line) => {
      if (!line) return;
      setActiveDialogueId(line.id);
      const player = voicePlayerRef.current;
      if (speakingLineId === line.id) {
        player?.stop();
        setSpeakingLineId(null);
        return;
      }
      setSpeakingLineId(line.id);
      player?.speak({
        line,
        speakerId: line.speakerId,
        characterVoices,
        onEnd: () => {
          setSpeakingLineId((curr) => (curr === line.id ? null : curr));
        },
        onError: () => {
          setSpeakingLineId((curr) => (curr === line.id ? null : curr));
        },
      });
    },
    [speakingLineId, characterVoices]
  );

  return (
    <section
      className="story-stage-section"
      aria-label="Storybook Stage"
      data-testid="story-stage"
    >
      {/* Stage Header Info Bar */}
      <header className="story-stage-header">
        <div className="story-stage-info">
          <span className="story-stage-kicker">
            Scene {sceneIndex + 1} of {totalScenes}
          </span>
          <h1 className="story-stage-title" data-testid="story-stage-scene-title">
            {scene?.name || `Scene ${sceneIndex + 1}`}
          </h1>
        </div>

        <div className="story-stage-meta">
          <span
            className="story-stage-setting-chip"
            data-testid="story-stage-setting"
          >
            Setting: <strong>{bgLabel}</strong>
          </span>
        </div>
      </header>

      {/* 16:9 Picture-Book Stage Viewport */}
      <div
        className="story-stage-viewport"
        data-testid="story-stage-viewport"
        data-theme={bgMeta?.theme || "outdoors"}
        data-background={scene?.background || "village-square"}
      >
        {/* Render Background Vector Illustration */}
        <div className="story-stage-backdrop-layer" aria-hidden="true">
          <StoryBackdrop background={scene?.background} />
        </div>

        {/* Props Dressing Layer */}
        {props.length > 0 && (
          <div className="story-stage-props-layer" data-testid="story-stage-props">
            {props.map((propId) => (
              <div
                key={propId}
                className={`story-placed-prop story-placed-prop--${propId}`}
                title={STORY_PROPS[propId]?.label || propId}
                data-testid={`story-stage-prop-${propId}`}
              >
                <StoryProp propId={propId} />
              </div>
            ))}
          </div>
        )}

        {/* Active Dialogue Bubble Overlay (Speech, Thought, Shout, Narrator) */}
        {currentLine && (
          <div
            className={`story-bubble-anchor story-bubble-anchor--${
              speakerPlacement?.slot || "center"
            }`}
            data-testid="story-active-bubble-container"
          >
            <div
              className={`story-dialogue-bubble story-dialogue-bubble--${
                currentLine.type || "speech"
              } ${
                currentLine.speakerId === "narrator"
                  ? "story-dialogue-bubble--narrator"
                  : ""
              } ${
                speakingLineId === currentLine.id
                  ? "story-dialogue-bubble--voice-playing"
                  : ""
              }`}
              data-testid={`story-bubble-${currentLine.id}`}
              data-bubble-type={currentLine.type}
              data-speaker={currentLine.speakerId}
              data-voice-playing={speakingLineId === currentLine.id ? "true" : undefined}
            >
              <div className="story-bubble-speaker-tag">
                {currentLine.speakerId === "narrator" ? (
                  <span>Narrator</span>
                ) : (
                  <span>
                    {STORY_CHARACTERS[currentLine.speakerId]?.name ||
                      currentLine.speakerId}
                  </span>
                )}
                {currentLine.type === "thought" && (
                  <MessageCircle size={12} aria-hidden="true" />
                )}
                {currentLine.type === "shout" && (
                  <Zap size={12} aria-hidden="true" />
                )}
                {currentLine.type === "speech" && (
                  <Volume2 size={12} aria-hidden="true" />
                )}
                <button
                  type="button"
                  className={`story-bubble-voice-trigger ${
                    speakingLineId === currentLine.id ? "story-bubble-voice-trigger--active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVoiceLine(currentLine);
                  }}
                  aria-label={speakingLineId === currentLine.id ? "Stop voice" : "Read line aloud"}
                  title={speakingLineId === currentLine.id ? "Stop voice" : "Read line aloud"}
                  data-testid={`story-bubble-voice-btn-${currentLine.id}`}
                >
                  {speakingLineId === currentLine.id ? (
                    <VolumeX size={12} aria-hidden="true" />
                  ) : (
                    <Volume2 size={12} aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="story-bubble-text">{currentLine.text}</p>
            </div>
          </div>
        )}

        {/* Character Actors on Stage (Left, Center, Right Slots) */}
        <div
          className="story-stage-actors-layer"
          data-testid="story-stage-actors"
        >
          {/* Left Slot */}
          <div
            className={`story-stage-slot story-stage-slot--left ${
              slotMap.left ? "story-stage-slot--occupied" : "story-stage-slot--empty"
            }`}
            onClick={() => onSelectSlot && onSelectSlot("left")}
            data-slot="left"
            data-testid="story-stage-slot-left"
          >
            {slotMap.left ? (
              <div
                className={`story-staged-actor ${
                  currentLine?.speakerId === slotMap.left.characterId
                    ? "story-staged-actor--speaking"
                    : ""
                } ${
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.left.characterId
                    ? "story-staged-actor--voice-speaking"
                    : ""
                }`}
                data-testid={`story-actor-${slotMap.left.characterId}`}
                data-voice-speaking={
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.left.characterId
                    ? "true"
                    : undefined
                }
              >
                <StoryCharacter
                  characterId={slotMap.left.characterId}
                  expression={slotMap.left.expression}
                  facing={slotMap.left.facing}
                />
                <span className="story-actor-label-tag">
                  {STORY_CHARACTERS[slotMap.left.characterId]?.name}
                </span>
              </div>
            ) : (
              <div className="story-slot-placeholder" aria-hidden="true">
                <span>Left Slot</span>
              </div>
            )}
          </div>

          {/* Center Slot */}
          <div
            className={`story-stage-slot story-stage-slot--center ${
              slotMap.center
                ? "story-stage-slot--occupied"
                : "story-stage-slot--empty"
            }`}
            onClick={() => onSelectSlot && onSelectSlot("center")}
            data-slot="center"
            data-testid="story-stage-slot-center"
          >
            {slotMap.center ? (
              <div
                className={`story-staged-actor ${
                  currentLine?.speakerId === slotMap.center.characterId
                    ? "story-staged-actor--speaking"
                    : ""
                } ${
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.center.characterId
                    ? "story-staged-actor--voice-speaking"
                    : ""
                }`}
                data-testid={`story-actor-${slotMap.center.characterId}`}
                data-voice-speaking={
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.center.characterId
                    ? "true"
                    : undefined
                }
              >
                <StoryCharacter
                  characterId={slotMap.center.characterId}
                  expression={slotMap.center.expression}
                  facing={slotMap.center.facing}
                />
                <span className="story-actor-label-tag">
                  {STORY_CHARACTERS[slotMap.center.characterId]?.name}
                </span>
              </div>
            ) : (
              <div className="story-slot-placeholder" aria-hidden="true">
                <span>Center Slot</span>
              </div>
            )}
          </div>

          {/* Right Slot */}
          <div
            className={`story-stage-slot story-stage-slot--right ${
              slotMap.right
                ? "story-stage-slot--occupied"
                : "story-stage-slot--empty"
            }`}
            onClick={() => onSelectSlot && onSelectSlot("right")}
            data-slot="right"
            data-testid="story-stage-slot-right"
          >
            {slotMap.right ? (
              <div
                className={`story-staged-actor ${
                  currentLine?.speakerId === slotMap.right.characterId
                    ? "story-staged-actor--speaking"
                    : ""
                } ${
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.right.characterId
                    ? "story-staged-actor--voice-speaking"
                    : ""
                }`}
                data-testid={`story-actor-${slotMap.right.characterId}`}
                data-voice-speaking={
                  speakingLineId === currentLine?.id &&
                  currentLine?.speakerId === slotMap.right.characterId
                    ? "true"
                    : undefined
                }
              >
                <StoryCharacter
                  characterId={slotMap.right.characterId}
                  expression={slotMap.right.expression}
                  facing={slotMap.right.facing}
                />
                <span className="story-actor-label-tag">
                  {STORY_CHARACTERS[slotMap.right.characterId]?.name}
                </span>
              </div>
            ) : (
              <div className="story-slot-placeholder" aria-hidden="true">
                <span>Right Slot</span>
              </div>
            )}
          </div>
        </div>

        {/* Scene Narration Bar at Bottom of Picture Book */}
        <div
          className="story-stage-narration-bar"
          data-testid="story-stage-narration"
        >
          <div className="story-narration-content">
            <BookOpen size={16} aria-hidden="true" className="story-narration-icon" />
            <p className="story-narration-text">
              {narration ? (
                narration
              ) : (
                <em className="story-narration-empty">
                  Add narration in the Scene Director to set the story scene.
                </em>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Dialogue Lines Preview & Step Ribbon */}
      <div
        className="story-stage-dialogue-ribbon"
        data-testid="story-stage-dialogue-ribbon"
      >
        <div className="story-ribbon-header">
          <Clapperboard size={15} aria-hidden="true" />
          <span>Dialogue Lines ({dialogue.length})</span>
          {dialogue.length > 0 && (
            <span className="story-ribbon-hint">
              (Click a line to highlight it on stage)
            </span>
          )}
        </div>

        {dialogue.length > 0 ? (
          <ol className="story-ribbon-dialogue-list">
            {dialogue.map((line) => {
              const isSpeaking = currentLine?.id === line.id;
              const speakerName =
                line.speakerId === "narrator"
                  ? "Narrator"
                  : STORY_CHARACTERS[line.speakerId]?.name || line.speakerId;

              return (
                <li
                  key={line.id}
                  className={`story-ribbon-dialogue-item ${
                    isSpeaking ? "story-ribbon-dialogue-item--active" : ""
                  } ${
                    speakingLineId === line.id ? "story-ribbon-dialogue-item--voice-active" : ""
                  }`}
                  onClick={() => setActiveDialogueId(line.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveDialogueId(line.id);
                    }
                  }}
                  aria-pressed={isSpeaking}
                  aria-label={`Highlight line: ${speakerName} says ${line.text}`}
                  data-testid={`story-ribbon-dialogue-${line.id}`}
                  data-active={isSpeaking ? "true" : undefined}
                  data-voice-speaking={speakingLineId === line.id ? "true" : undefined}
                >
                  <div className="story-ribbon-dialogue-body">
                    <span className={`story-ribbon-type-badge story-ribbon-type-badge--${line.type}`}>
                      {line.type === "speech" && "💬"}
                      {line.type === "thought" && "💭"}
                      {line.type === "shout" && "💥"}
                    </span>
                    <strong className="story-ribbon-speaker">{speakerName}:</strong>{" "}
                    <span className="story-ribbon-text">{line.text}</span>
                  </div>
                  <button
                    type="button"
                    className={`story-voice-line-btn ${
                      speakingLineId === line.id ? "story-voice-line-btn--active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVoiceLine(line);
                    }}
                    aria-label={
                      speakingLineId === line.id
                        ? `Stop speaking line: ${line.text}`
                        : `Read line aloud: ${speakerName} says ${line.text}`
                    }
                    title={
                      speakingLineId === line.id
                        ? "Stop speaking"
                        : `Read line aloud (${speakerName})`
                    }
                    data-testid={`story-stage-voice-btn-${line.id}`}
                  >
                    {speakingLineId === line.id ? (
                      <VolumeX size={14} aria-hidden="true" />
                    ) : (
                      <Volume2 size={14} aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="story-ribbon-empty">
            No dialogue written yet. Add lines in the Scene Director on the right!
          </p>
        )}
      </div>
    </section>
  );
}
