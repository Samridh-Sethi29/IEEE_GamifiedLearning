import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

import {
  STORY_BACKGROUNDS,
  STORY_CHARACTERS,
  STORY_PROPS,
} from "../engine/storySchema.js";
import {
  advanceReader,
  canAdvance,
  canStepBack,
  chooseBranch,
  createReaderState,
  getCurrentDialogue,
  getCurrentScene,
  getReaderProgress,
  restartReader,
  stepBackReader,
} from "../engine/storyReaderEngine.js";
import {
  createStoryVoicePlayer,
  isSpeechSynthesisSupported,
  useSystemVoices,
} from "../engine/storyVoiceEngine.js";
import {
  StoryBackdrop,
  StoryCharacter,
  StoryProp,
} from "../art/StoryArtComponents.jsx";
import StoryPrintPreviewModal from "./StoryPrintPreviewModal.jsx";

/**
 * Story Reader & Theater Mode Component (S1.5, S1.9 & S1.12).
 *
 * Fullscreen / modal illustrated picture-book playback that:
 * - Begins at the first scene
 * - Reuses the vector stage backdrops and character art
 * - Displays active speech, thought, and shout dialogue bubbles
 * - Shows scene narration
 * - Predictably advances through dialogue lines and scenes
 * - Spoken dialogue with Web Speech API and character voice profiles
 * - Displays progress ("Scene 2 of 5")
 * - Features an illustrated "The End" screen with Restart and Return to Editor
 * - Handles Escape and keyboard arrows (Left/Right)
 * - Is strictly read-only: does not modify document or player progression
 */
export default function StoryReader({
  story,
  onClose,
  initialSceneIndex = 0,
  characterVoices: propCharacterVoices,
}) {
  const [readerState, setReaderState] = useState(() =>
    createReaderState(story, { initialSceneIndex })
  );
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Character voice preferences from props or document settings
  const characterVoices = useMemo(
    () => propCharacterVoices || story?.settings?.characterVoices || {},
    [propCharacterVoices, story?.settings?.characterVoices]
  );

  const isSpeechSupported = isSpeechSynthesisSupported();
  const { voices: availableVoices = [], isSupported: isVoiceSupported } = useSystemVoices();
  const canUseVoice = isSpeechSupported || isVoiceSupported;

  // Voice playback state
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingLineId, setSpeakingLineId] = useState(null);
  const [isSpeakingNarration, setIsSpeakingNarration] = useState(false);

  const containerRef = useRef(null);
  const nextBtnRef = useRef(null);
  const voicePlayerRef = useRef(null);
  const timerRef = useRef(null);
  const isAutoPlayRef = useRef(isAutoPlay);
  const isVoicePausedRef = useRef(isVoicePaused);
  const readerStateRef = useRef(readerState);
  const availableVoicesRef = useRef(availableVoices);

  useEffect(() => {
    availableVoicesRef.current = availableVoices;
  }, [availableVoices]);

  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  useEffect(() => {
    isVoicePausedRef.current = isVoicePaused;
  }, [isVoicePaused]);

  useEffect(() => {
    readerStateRef.current = readerState;
  }, [readerState]);

  // Lazy initialize voice player
  if (!voicePlayerRef.current) {
    voicePlayerRef.current = createStoryVoicePlayer({
      getVoices: () =>
        Array.isArray(availableVoicesRef.current) && availableVoicesRef.current.length > 0
          ? availableVoicesRef.current
          : getAvailableVoices(),
    });
  }

  // Cleanup timers and voice audio on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (voicePlayerRef.current) voicePlayerRef.current.cleanup();
    };
  }, []);

  // Sync state if initialSceneIndex or story changes
  useEffect(() => {
    setReaderState(createReaderState(story, { initialSceneIndex }));
  }, [story, initialSceneIndex]);

  // Focus management on mount
  useEffect(() => {
    if (nextBtnRef.current) {
      nextBtnRef.current.focus();
    } else if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
    setIsSpeakingNarration(false);
    setReaderState((curr) => advanceReader(curr));
  }, []);

  const handlePrev = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
    setIsSpeakingNarration(false);
    setIsAutoPlay(false);
    setIsVoicePaused(false);
    setReaderState((curr) => stepBackReader(curr));
  }, []);

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
    setIsSpeakingNarration(false);
    setIsAutoPlay(false);
    setIsVoicePaused(false);
    setReaderState((curr) => restartReader(curr));
    if (nextBtnRef.current) {
      nextBtnRef.current.focus();
    }
  }, []);

  const handleChoose = useCallback((choiceId) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
    setIsSpeakingNarration(false);
    setReaderState((curr) => chooseBranch(curr, choiceId));
  }, []);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    onClose && onClose();
  }, [onClose]);

  // Voice playback control actions
  const handleToggleAutoPlay = useCallback(() => {
    if (isVoicePaused) {
      voicePlayerRef.current?.resume();
      setIsVoicePaused(false);
      return;
    }

    if (isAutoPlay) {
      voicePlayerRef.current?.pause();
      setIsVoicePaused(true);
      return;
    }

    // Start auto reading
    setIsAutoPlay(true);
    setIsVoicePaused(false);
  }, [isAutoPlay, isVoicePaused]);

  const handleStopVoice = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    voicePlayerRef.current?.stop();
    setIsAutoPlay(false);
    setIsVoicePaused(false);
    setSpeakingLineId(null);
    setIsSpeakingNarration(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voicePlayerRef.current?.setMuted(nextMuted);
  }, [isMuted]);

  const handleToggleVoiceLine = useCallback(
    (line) => {
      if (!line) return;
      if (speakingLineId === line.id) {
        voicePlayerRef.current?.stop();
        setSpeakingLineId(null);
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSpeakingNarration(false);

      voicePlayerRef.current?.speak({
        text: line.text,
        line,
        speakerId: line.speakerId,
        characterVoices,
        onStart: () => setSpeakingLineId(line.id),
        onEnd: () => setSpeakingLineId(null),
        onError: () => setSpeakingLineId(null),
      });
    },
    [speakingLineId, characterVoices]
  );

  const handleToggleNarrationVoice = useCallback(() => {
    if (isSpeakingNarration) {
      voicePlayerRef.current?.stop();
      setIsSpeakingNarration(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setSpeakingLineId(null);

    const progress = getReaderProgress(readerStateRef.current);
    const text = progress.narration || progress.sceneTitle;
    if (!text) return;

    voicePlayerRef.current?.speak({
      text,
      speakerId: "narrator",
      characterVoices,
      onStart: () => setIsSpeakingNarration(true),
      onEnd: () => setIsSpeakingNarration(false),
      onError: () => setIsSpeakingNarration(false),
    });
  }, [isSpeakingNarration, characterVoices]);

  // Keyboard controls: ArrowLeft, ArrowRight, Space, Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        if (canAdvance(readerState)) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (canStepBack(readerState)) {
          e.preventDefault();
          handlePrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readerState, handleNext, handlePrev, handleClose]);

  const progress = getReaderProgress(readerState);
  const currentScene = getCurrentScene(readerState);
  const currentDialogue = getCurrentDialogue(readerState);

  // Auto-play speech synchronization effect
  useEffect(() => {
    if (!isAutoPlay || isVoicePaused) return;

    if (progress.isEnd) {
      setIsAutoPlay(false);
      setIsVoicePaused(false);
      return;
    }

    // Branching choice pause: wait for user interaction
    if (progress.isWaitingForChoice) {
      voicePlayerRef.current?.stop();
      setSpeakingLineId(null);
      setIsSpeakingNarration(false);
      return;
    }

    if (currentDialogue) {
      if (currentDialogue.type === "thought") {
        // Thought lines remain silent by default during auto-advance
        setSpeakingLineId(null);
        setIsSpeakingNarration(false);
        timerRef.current = setTimeout(() => {
          if (isAutoPlayRef.current && !isVoicePausedRef.current) {
            setReaderState((curr) => advanceReader(curr));
          }
        }, 2200);
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }

      // Spoken or shout dialogue line
      voicePlayerRef.current?.speak({
        text: currentDialogue.text,
        line: currentDialogue,
        speakerId: currentDialogue.speakerId,
        characterVoices,
        onStart: () => {
          setSpeakingLineId(currentDialogue.id);
        },
        onEnd: () => {
          setSpeakingLineId(null);
          if (isAutoPlayRef.current && !isVoicePausedRef.current) {
            timerRef.current = setTimeout(() => {
              if (isAutoPlayRef.current && !isVoicePausedRef.current) {
                setReaderState((curr) => advanceReader(curr));
              }
            }, 400);
          }
        },
        onError: () => {
          setSpeakingLineId(null);
          if (isAutoPlayRef.current && !isVoicePausedRef.current) {
            timerRef.current = setTimeout(() => {
              if (isAutoPlayRef.current && !isVoicePausedRef.current) {
                setReaderState((curr) => advanceReader(curr));
              }
            }, 400);
          }
        },
      });

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      // Scene has no dialogue lines
      if (progress.narration) {
        voicePlayerRef.current?.speak({
          text: progress.narration,
          speakerId: "narrator",
          characterVoices,
          onStart: () => {
            setIsSpeakingNarration(true);
          },
          onEnd: () => {
            setIsSpeakingNarration(false);
            if (
              isAutoPlayRef.current &&
              !isVoicePausedRef.current &&
              canAdvance(readerStateRef.current)
            ) {
              timerRef.current = setTimeout(() => {
                if (isAutoPlayRef.current && !isVoicePausedRef.current) {
                  setReaderState((curr) => advanceReader(curr));
                }
              }, 500);
            }
          },
          onError: () => {
            setIsSpeakingNarration(false);
            if (
              isAutoPlayRef.current &&
              !isVoicePausedRef.current &&
              canAdvance(readerStateRef.current)
            ) {
              setReaderState((curr) => advanceReader(curr));
            }
          },
        });

        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      } else {
        // Empty scene without dialogue or narration
        timerRef.current = setTimeout(() => {
          if (
            isAutoPlayRef.current &&
            !isVoicePausedRef.current &&
            canAdvance(readerStateRef.current)
          ) {
            setReaderState((curr) => advanceReader(curr));
          }
        }, 1500);
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }
    }
  }, [
    isAutoPlay,
    isVoicePaused,
    readerState.sceneIndex,
    readerState.dialogueIndex,
    progress.isEnd,
    progress.isWaitingForChoice,
    currentDialogue,
    progress.narration,
    characterVoices,
  ]);

  const bgMeta = STORY_BACKGROUNDS[progress.background];
  const bgLabel = bgMeta?.label || progress.background;

  const characters = progress.characters || [];
  const props = currentScene?.props || [];

  // Slot mapping
  const slotMap = useMemo(() => {
    const map = { left: null, center: null, right: null };
    characters.forEach((c) => {
      if (c.slot && map[c.slot] !== undefined) {
        map[c.slot] = c;
      }
    });
    return map;
  }, [characters]);

  // Speaker placement for bubble anchoring
  const speakerPlacement = useMemo(() => {
    if (!currentDialogue || currentDialogue.speakerId === "narrator") return null;
    return characters.find((c) => c.characterId === currentDialogue.speakerId) || null;
  }, [currentDialogue, characters]);

  const hasNext = canAdvance(readerState);
  const hasPrev = canStepBack(readerState);
  const isFinalStep =
    progress.sceneIndex === progress.totalScenes - 1 &&
    (progress.totalDialogue === 0 || progress.dialogueIndex === progress.totalDialogue - 1);

  return (
    <div
      ref={containerRef}
      className="story-reader-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Story Theater Reader"
      tabIndex={-1}
      data-testid="story-reader-dialog"
    >
      <div className="story-reader-container" data-testid="story-reader-container">
        {/* Reader Top Bar */}
        <header className="story-reader-topbar" data-testid="story-reader-topbar">
          <div className="story-reader-topbar-left">
            <button
              type="button"
              className="story-reader-back-btn"
              onClick={handleClose}
              aria-label="Return to Story Editor"
              data-testid="story-reader-close-btn"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Editor</span>
            </button>
            <div className="story-reader-title-group">
              <h1 className="story-reader-title" data-testid="story-reader-story-title">
                {story?.title || "Untitled Story"}
              </h1>
              <span className="story-reader-author">
                by {story?.author || "Explorer"}
              </span>
            </div>
          </div>

          <div className="story-reader-topbar-right">
            {!progress.isEnd && (
              <span
                className="story-reader-scene-pill"
                data-testid="story-reader-scene-pill"
              >
                Scene {progress.sceneNumber} of {progress.totalScenes}
              </span>
            )}

            {/* Spoken voice playback controls */}
            <div
              className="story-reader-voice-controls"
              role="group"
              aria-label="Story audio playback controls"
              data-testid="story-reader-voice-controls"
            >
              <button
                type="button"
                className={`story-reader-topbar-btn story-reader-topbar-btn--voice ${
                  isAutoPlay && !isVoicePaused ? "story-reader-topbar-btn--active" : ""
                }`}
                onClick={handleToggleAutoPlay}
                aria-label={
                  !isAutoPlay
                    ? "Start reading aloud automatically"
                    : isVoicePaused
                    ? "Resume reading aloud"
                    : "Pause reading aloud"
                }
                title={
                  !isSpeechSupported
                    ? "Voice playback is not supported in this browser"
                    : !isAutoPlay
                    ? "Read Aloud (Auto-Play)"
                    : isVoicePaused
                    ? "Resume reading"
                    : "Pause reading"
                }
                disabled={!isSpeechSupported || progress.isEnd}
                data-testid="story-reader-autoplay-btn"
              >
                {isAutoPlay && !isVoicePaused ? (
                  <>
                    <Pause size={15} aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={15} aria-hidden="true" />
                    <span>{isVoicePaused ? "Resume" : "Read Aloud"}</span>
                  </>
                )}
              </button>

              {isAutoPlay && (
                <button
                  type="button"
                  className="story-reader-topbar-btn story-reader-topbar-btn--stop"
                  onClick={handleStopVoice}
                  aria-label="Stop reading aloud"
                  title="Stop reading aloud"
                  data-testid="story-reader-stop-voice-btn"
                >
                  <Square size={13} aria-hidden="true" />
                  <span>Stop</span>
                </button>
              )}

              <button
                type="button"
                className={`story-reader-topbar-btn story-reader-topbar-btn--mute ${
                  isMuted ? "story-reader-topbar-btn--muted" : ""
                }`}
                onClick={handleToggleMute}
                aria-label={isMuted ? "Unmute spoken voices" : "Mute spoken voices"}
                title={isMuted ? "Unmute voices" : "Mute voices"}
                disabled={!isSpeechSupported}
                data-testid="story-reader-mute-btn"
              >
                {isMuted ? (
                  <VolumeX size={15} aria-hidden="true" />
                ) : (
                  <Volume2 size={15} aria-hidden="true" />
                )}
              </button>
            </div>

            <button
              type="button"
              className="story-reader-topbar-btn"
              onClick={() => setIsPrintOpen(true)}
              aria-label="Print or Export Storybook"
              title="Print or Export Storybook (Save as PDF)"
              data-testid="story-reader-print-btn"
            >
              <Printer size={16} aria-hidden="true" />
              <span>Print</span>
            </button>
            <button
              type="button"
              className="story-reader-close-x"
              onClick={handleClose}
              aria-label="Close Story Theater"
              title="Close (Esc)"
              data-testid="story-reader-esc-btn"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Reader Center Stage or End-of-Story Screen */}
        <main className="story-reader-main" data-testid="story-reader-main">
          {progress.isEnd ? (
            /* ===============================================================
               THE END SCREEN
               =============================================================== */
            <div
              className="story-reader-end-screen"
              data-testid="story-reader-end-screen"
            >
              <div className="story-end-card">
                <div className="story-end-star-badge" aria-hidden="true">
                  <Sparkles size={40} />
                </div>
                <h2 className="story-end-heading" data-testid="story-end-heading">
                  The End!
                </h2>
                <p className="story-end-subheading">
                  You just finished reading <strong>{story?.title || "your story"}</strong>!
                </p>

                {progress.endingSceneName && (
                  <div className="story-end-chapter-pill" data-testid="story-reader-ending-name">
                    <span>Ending Reached: <strong>{progress.endingSceneName}</strong></span>
                  </div>
                )}

                <div className="story-end-stats">
                  <div className="story-end-stat-pill">
                    <span className="story-end-stat-num">{progress.totalScenes}</span>
                    <span className="story-end-stat-label">Scenes Read</span>
                  </div>
                  <div className="story-end-stat-pill">
                    <span className="story-end-stat-num">
                      {story?.scenes?.reduce((acc, s) => acc + (s.dialogue?.length || 0), 0) || 0}
                    </span>
                    <span className="story-end-stat-label">Lines Spoken</span>
                  </div>
                </div>

                <div className="story-end-actions">
                  <button
                    ref={nextBtnRef}
                    type="button"
                    className="story-btn story-btn--primary story-btn--md"
                    onClick={handleRestart}
                    data-testid="story-reader-restart-btn"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    <span>Read Again</span>
                  </button>
                  <button
                    type="button"
                    className="story-btn story-btn--outline story-btn--md"
                    onClick={() => setIsPrintOpen(true)}
                    data-testid="story-reader-end-print-btn"
                  >
                    <Printer size={16} aria-hidden="true" />
                    <span>Print Storybook</span>
                  </button>
                  <button
                    type="button"
                    className="story-btn story-btn--outline story-btn--md"
                    onClick={handleClose}
                    data-testid="story-reader-return-editor-btn"
                  >
                    <BookOpen size={16} aria-hidden="true" />
                    <span>Back to Editor</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ===============================================================
               PICTURE-BOOK 16:9 STAGE
               =============================================================== */
            <div
              className="story-reader-viewport"
              data-testid="story-reader-stage"
              data-theme={bgMeta?.theme || "outdoors"}
              data-background={progress.background}
            >
              {/* Background Vector Art */}
              <div className="story-stage-backdrop-layer" aria-hidden="true">
                <StoryBackdrop background={progress.background} />
              </div>

              {/* Props Layer */}
              {props.length > 0 && (
                <div className="story-stage-props-layer" data-testid="story-reader-props">
                  {props.map((propId) => (
                    <div
                      key={propId}
                      className={`story-placed-prop story-placed-prop--${propId}`}
                      title={STORY_PROPS[propId]?.label || propId}
                    >
                      <StoryProp propId={propId} />
                    </div>
                  ))}
                </div>
              )}

              {/* Active Dialogue Bubble Overlay */}
              {currentDialogue && (
                <div
                  className={`story-bubble-anchor story-bubble-anchor--${
                    speakerPlacement?.slot || "center"
                  }`}
                  data-testid="story-reader-bubble-anchor"
                >
                  <div
                    className={`story-dialogue-bubble story-dialogue-bubble--${
                      currentDialogue.type || "speech"
                    } ${
                      currentDialogue.speakerId === "narrator"
                        ? "story-dialogue-bubble--narrator"
                        : ""
                    } ${
                      speakingLineId === currentDialogue.id
                        ? "story-dialogue-bubble--voice-playing"
                        : ""
                    }`}
                    data-testid={`story-reader-bubble-${currentDialogue.id}`}
                    data-bubble-type={currentDialogue.type}
                    data-speaker={currentDialogue.speakerId}
                    data-voice-playing={speakingLineId === currentDialogue.id ? "true" : undefined}
                  >
                    <div className="story-bubble-speaker-tag">
                      <span>{progress.speakerName}</span>
                      {currentDialogue.type === "thought" && (
                        <MessageCircle size={12} aria-hidden="true" />
                      )}
                      {currentDialogue.type === "shout" && (
                        <Zap size={12} aria-hidden="true" />
                      )}
                      {currentDialogue.type === "speech" && (
                        <Volume2 size={12} aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        className={`story-bubble-voice-trigger ${
                          speakingLineId === currentDialogue.id
                            ? "story-bubble-voice-trigger--active"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVoiceLine(currentDialogue);
                        }}
                        aria-label={
                          speakingLineId === currentDialogue.id
                            ? `Stop voice for ${progress.speakerName}`
                            : `Read ${progress.speakerName}'s line aloud`
                        }
                        title={
                          speakingLineId === currentDialogue.id
                            ? "Stop voice"
                            : "Read line aloud"
                        }
                        data-testid={`story-reader-voice-trigger-${currentDialogue.id}`}
                      >
                        {speakingLineId === currentDialogue.id ? (
                          <VolumeX size={12} aria-hidden="true" />
                        ) : (
                          <Volume2 size={12} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <p className="story-bubble-text">{currentDialogue.text}</p>
                  </div>
                </div>
              )}

              {/* Character Actors on Stage */}
              <div
                className="story-stage-actors-layer"
                data-testid="story-reader-actors"
              >
                {/* Left Slot */}
                <div className="story-stage-slot story-stage-slot--left" data-slot="left">
                  {slotMap.left && (
                    <div
                      className={`story-staged-actor ${
                        currentDialogue?.speakerId === slotMap.left.characterId
                          ? "story-staged-actor--speaking"
                          : ""
                      } ${
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.left.characterId
                          ? "story-staged-actor--voice-speaking"
                          : ""
                      }`}
                      data-testid={`story-reader-actor-${slotMap.left.characterId}`}
                      data-voice-speaking={
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.left.characterId
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
                  )}
                </div>

                {/* Center Slot */}
                <div className="story-stage-slot story-stage-slot--center" data-slot="center">
                  {slotMap.center && (
                    <div
                      className={`story-staged-actor ${
                        currentDialogue?.speakerId === slotMap.center.characterId
                          ? "story-staged-actor--speaking"
                          : ""
                      } ${
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.center.characterId
                          ? "story-staged-actor--voice-speaking"
                          : ""
                      }`}
                      data-testid={`story-reader-actor-${slotMap.center.characterId}`}
                      data-voice-speaking={
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.center.characterId
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
                  )}
                </div>

                {/* Right Slot */}
                <div className="story-stage-slot story-stage-slot--right" data-slot="right">
                  {slotMap.right && (
                    <div
                      className={`story-staged-actor ${
                        currentDialogue?.speakerId === slotMap.right.characterId
                          ? "story-staged-actor--speaking"
                          : ""
                      } ${
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.right.characterId
                          ? "story-staged-actor--voice-speaking"
                          : ""
                      }`}
                      data-testid={`story-reader-actor-${slotMap.right.characterId}`}
                      data-voice-speaking={
                        speakingLineId === currentDialogue?.id &&
                        currentDialogue?.speakerId === slotMap.right.characterId
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
                  )}
                </div>
              </div>

              {/* Branching Choices Prompt Overlay (S1.9) */}
              {progress.isWaitingForChoice && progress.choices.length > 0 && (
                <div
                  className="story-reader-choices-panel"
                  data-testid="story-reader-choices"
                >
                  <div className="story-reader-choices-header">
                    <Sparkles size={16} aria-hidden="true" />
                    <span>Choose what happens next:</span>
                  </div>
                  <div className="story-reader-choices-list">
                    {progress.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        className="story-reader-choice-btn"
                        onClick={() => handleChoose(choice.id)}
                        data-testid={`story-reader-choice-${choice.id}`}
                      >
                        <span>{choice.text}</span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene Narration Bar at Bottom */}
              <div
                className="story-stage-narration-bar"
                data-testid="story-reader-narration"
              >
                <div className="story-narration-content">
                  <button
                    type="button"
                    className={`story-narrator-voice-trigger ${
                      isSpeakingNarration ? "story-narrator-voice-trigger--active" : ""
                    }`}
                    onClick={handleToggleNarrationVoice}
                    aria-label={
                      isSpeakingNarration
                        ? "Stop speaking narration"
                        : "Read narration aloud"
                    }
                    title={
                      isSpeakingNarration
                        ? "Stop narration voice"
                        : "Read narration aloud"
                    }
                    data-testid="story-reader-narration-voice-btn"
                  >
                    {isSpeakingNarration ? (
                      <VolumeX size={14} aria-hidden="true" />
                    ) : (
                      <Volume2 size={14} aria-hidden="true" />
                    )}
                  </button>
                  <BookOpen size={16} aria-hidden="true" className="story-narration-icon" />
                  <p className="story-narration-text">
                    {progress.narration ? (
                      progress.narration
                    ) : (
                      <em className="story-narration-empty">
                        {progress.sceneTitle} ({bgLabel})
                      </em>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Reader Navigation Footer Controls */}
        <footer className="story-reader-footer" data-testid="story-reader-footer">
          <div className="story-reader-footer-left">
            <button
              type="button"
              className="story-reader-nav-btn story-reader-nav-btn--prev"
              onClick={handlePrev}
              disabled={!hasPrev}
              aria-label="Previous line or scene"
              title="Previous (Left Arrow)"
              data-testid="story-reader-prev-btn"
            >
              <ChevronLeft size={20} aria-hidden="true" />
              <span>Previous</span>
            </button>
          </div>

          <div className="story-reader-footer-center">
            {!progress.isEnd && progress.totalDialogue > 0 && (
              <div
                className="story-reader-dialogue-progress"
                data-testid="story-reader-dialogue-progress"
              >
                <span className="story-reader-dialogue-counter">
                  Line {progress.dialogueNumber} of {progress.totalDialogue}
                </span>
                <div className="story-reader-progress-dots">
                  {Array.from({ length: progress.totalDialogue }).map((_, i) => (
                    <span
                      key={i}
                      className={`story-reader-dot ${
                        i === progress.dialogueIndex
                          ? "story-reader-dot--active"
                          : i < progress.dialogueIndex
                          ? "story-reader-dot--completed"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="story-reader-footer-right">
            {!progress.isEnd && (
              <button
                ref={nextBtnRef}
                type="button"
                className="story-reader-nav-btn story-reader-nav-btn--next"
                onClick={handleNext}
                disabled={!hasNext}
                aria-label={isFinalStep ? "Finish reading story" : "Next line or scene"}
                title="Next (Right Arrow or Space)"
                data-testid="story-reader-next-btn"
              >
                <span>{isFinalStep ? "Finish Story ★" : "Next"}</span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Storybook Print & Export Modal */}
      <StoryPrintPreviewModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        story={story}
      />
    </div>
  );
}
