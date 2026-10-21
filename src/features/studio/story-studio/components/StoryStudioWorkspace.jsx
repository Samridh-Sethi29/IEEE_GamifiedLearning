import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Library,
  Play,
  Printer,
  Redo2,
  RefreshCw,
  Save,
  Trophy,
  Undo2,
  X,
} from "lucide-react";

import { STUDIO_CSS_VARS } from "../../art/palette.js";
import {
  STORY_LIMITS,
  createStoryDocument,
} from "../engine/storySchema.js";
import {
  addCharacter,
  addChoice,
  addDialogueLine,
  addScene,
  createStoryState,
  deleteScene,
  dismissNotice,
  duplicateScene,
  moveChoice,
  moveDialogueLine,
  moveSceneDown,
  moveSceneUp,
  redoStory,
  removeCharacter,
  removeChoice,
  removeDialogueLine,
  renameScene,
  selectCanAddScene,
  selectCanDeleteScene,
  selectCanRedo,
  selectCanUndo,
  selectCharacterVoices,
  selectNotice,
  selectScenes,
  selectSelectedScene,
  selectSelectedSceneId,
  selectSelectedSceneIndex,
  selectStory,
  selectScene,
  setSceneBackground,
  setCharacterVoice,
  setSceneIsEnding,
  setSceneNarration,
  setTitle,
  storyReducer,
  toggleProp,
  undoStory,
  updateCharacter,
  updateChoice,
  updateDialogueLine,
} from "../engine/storyReducer.js";
import {
  createStoryStorage,
  loadStory,
} from "../engine/storyStorage.js";
import { saveStoryToLibrary } from "../engine/storyLibrary.js";

import SceneNavigator from "./SceneNavigator.jsx";
import StoryStage from "./StoryStage.jsx";
import SceneDirector from "./SceneDirector.jsx";
import StoryReader from "./StoryReader.jsx";
import StoryLibraryModal from "./StoryLibraryModal.jsx";
import StoryPrintPreviewModal from "./StoryPrintPreviewModal.jsx";
import StoryChallengeModal from "./StoryChallengeModal.jsx";
import StoryChallengeHUD from "./StoryChallengeHUD.jsx";
import { getChallengeById } from "../data/storyChallenges.js";
import { evaluateChallenge } from "../engine/storyChallengeEngine.js";
import { recordChallengeEvaluation } from "../engine/storyChallengeProgress.js";
import { createStoryChallengeStorage } from "../engine/storyChallengeStorage.js";
import { executeChallengeCompletionSync } from "../engine/storyChallengeRewards.js";
import "../story-studio.css";

/**
 * Story Studio Editing Workspace (S1.2, S1.3, S1.4).
 * Responsive 3-column studio layout with:
 * - Left Scene Navigator (filmstrip with add/duplicate/reorder/delete/rename)
 * - Center Illustrated 16:9 Picture-Book Stage (backgrounds, characters, speech/thought/shout bubbles, narration, props)
 * - Right Scene Director (curated backgrounds, 3-slot characters with expressions/facing, narration, dialogue lines, props)
 */
export default function StoryStudioWorkspace({
  storage: customStorage,
  initialDoc,
}) {
  const storage = useMemo(
    () => customStorage || createStoryStorage(),
    [customStorage]
  );

  // Initial load handling
  const [loadResult] = useState(() => {
    if (initialDoc) return { ok: true, story: initialDoc };
    return loadStory(storage);
  });

  const [loadError, setLoadError] = useState(() =>
    loadResult.ok
      ? null
      : {
          code: loadResult.code,
          message: loadResult.message,
          errors: loadResult.errors,
          version: loadResult.version,
        }
  );

  const [state, dispatch] = useReducer(
    storyReducer,
    null,
    () => createStoryState(loadResult.story || createStoryDocument())
  );

  // Save status state
  const [saveStatus, setSaveStatus] = useState("saved");
  const [titleInput, setTitleInput] = useState(() => selectStory(state).title);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);

  const currentStory = selectStory(state);
  const activeChallengeId = currentStory?.metadata?.challengeId || null;
  const activeChallengeLevel = currentStory?.metadata?.challengeLevel || null;
  const selectedScene = selectSelectedScene(state);
  const selectedSceneIndex = selectSelectedSceneIndex(state);
  const selectedSceneId = selectSelectedSceneId(state);
  const scenes = selectScenes(state);
  const canUndo = selectCanUndo(state);
  const canRedo = selectCanRedo(state);
  const canAdd = selectCanAddScene(state);
  const canDelete = selectCanDeleteScene(state);
  const notice = selectNotice(state);
  const characterVoices = selectCharacterVoices(state);

  // Sync title input when story title changes via undo/redo
  useEffect(() => {
    setTitleInput(currentStory.title);
  }, [currentStory.title]);

  // Mark unsaved on document changes
  useEffect(() => {
    setSaveStatus("unsaved");
  }, [currentStory]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitleInput(val);
  };

  const handleTitleBlur = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== currentStory.title) {
      dispatch(setTitle(trimmed.slice(0, STORY_LIMITS.MAX_TITLE_LENGTH)));
    } else {
      setTitleInput(currentStory.title);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleSave = useCallback(() => {
    setSaveStatus("saving");

    let res;
    if (currentStory?.metadata?.challengeId) {
      // Challenge Mode active: ONLY save to isolated challenge document storage
      try {
        const challengeStorage = createStoryChallengeStorage({ storage });
        res = challengeStorage.saveChallengeStory(
          currentStory.metadata.challengeId,
          currentStory
        );
      } catch (err) {
        res = { ok: false, message: err?.message || err };
      }
    } else {
      // Ordinary personal story: save to canonical story storage and personal library
      res = storage.save(currentStory);
      saveStoryToLibrary(storage, currentStory, { setActive: true });
    }

    if (res?.ok) {
      setSaveStatus("saved");
    } else {
      setSaveStatus("unsaved");
    }
  }, [storage, currentStory]);

  // Safe exit back to personal stories from Challenge Mode
  const handleExitChallenge = useCallback(() => {
    // 1. Save active challenge story draft to dedicated challenge storage
    if (currentStory?.metadata?.challengeId) {
      try {
        const challengeStorage = createStoryChallengeStorage({ storage });
        challengeStorage.saveChallengeStory(
          currentStory.metadata.challengeId,
          currentStory
        );
      } catch {}
    }

    // 2. Restore user's personal canonical story
    const res = loadStory(storage);
    const restored = res.ok && res.story ? res.story : createStoryDocument();
    dispatch({ type: "RESET", story: restored });
    setTitleInput(restored.title);
    setSaveStatus("saved");
  }, [storage, currentStory]);

  // Live deterministic evaluation sync to challenge progress storage
  useEffect(() => {
    if (!activeChallengeId || !currentStory) return;
    try {
      const challenge = getChallengeById(activeChallengeId);
      if (challenge) {
        const challengeStorage = createStoryChallengeStorage({ storage });
        const { progressState } = challengeStorage.loadProgress();
        const evalResult = evaluateChallenge(challenge, currentStory);
        const updated = recordChallengeEvaluation(
          progressState,
          activeChallengeId,
          evalResult
        );
        challengeStorage.saveProgress(updated);
      }
    } catch {}
  }, [activeChallengeId, currentStory, storage]);

  // Challenge evaluation & completion verification handler (C4)
  const handleCheckChallenge = useCallback(
    (evaluation) => {
      if (!activeChallengeId || !currentStory) {
        return { success: false, message: "No active challenge to verify." };
      }

      const activeChallenge = getChallengeById(activeChallengeId);
      if (!activeChallenge) {
        return { success: false, message: "Unknown challenge." };
      }

      // If objectives are not fully met, return honest feedback with remaining tasks
      if (!evaluation?.eligibleForCompletion) {
        const remainingCount =
          (evaluation?.summary?.totalCount || 0) - (evaluation?.summary?.metCount || 0);
        return {
          success: false,
          message: `Challenge incomplete: ${remainingCount} objective(s) remaining.`,
          remainingTasks: evaluation?.summary?.remainingTasks || [],
        };
      }

      // Deterministically execute challenge completion and persist one-time rewards
      try {
        const res = executeChallengeCompletionSync(
          activeChallengeId,
          currentStory,
          null,
          null,
          { storage }
        );

        if (res.success) {
          if (res.rewarded) {
            return {
              success: true,
              message: `🎉 Challenge Complete: "${activeChallenge.title}"! Awarded +${res.grantSummary.xp} XP and +${res.grantSummary.coins} coins.`,
              remainingTasks: [],
            };
          } else {
            return {
              success: true,
              message: `Challenge replayed successfully! Objectives verified (rewards were previously claimed).`,
              remainingTasks: [],
            };
          }
        } else {
          return {
            success: false,
            message: res.error || "Unable to complete challenge.",
            remainingTasks: res.remainingTasks || [],
          };
        }
      } catch (err) {
        return {
          success: false,
          message: `Completion error: ${err?.message || "Storage error"}`,
          remainingTasks: [],
        };
      }
    },
    [activeChallengeId, currentStory, storage]
  );

  // Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            dispatch(redoStory());
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            dispatch(undoStory());
          }
        }
      } else if (isMeta && e.key.toLowerCase() === "y") {
        if (canRedo) {
          e.preventDefault();
          dispatch(redoStory());
        }
      } else if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, handleSave]);

  // Storage recovery handlers
  const handleRetryLoad = () => {
    const res = loadStory(storage);
    if (res.ok && res.story) {
      dispatch({ type: "RESET", story: res.story });
      setTitleInput(res.story.title);
      setSaveStatus("saved");
      setLoadError(null);
    } else {
      setLoadError({
        code: res.code,
        message: res.message,
        errors: res.errors,
      });
    }
  };

  const handleRestoreBackup = () => {
    if (storage && typeof storage.restoreBackup === "function") {
      const res = storage.restoreBackup();
      if (res.ok && res.story) {
        dispatch({ type: "RESET", story: res.story });
        saveStoryToLibrary(storage, res.story, { setActive: true });
        setTitleInput(res.story.title);
        setSaveStatus("saved");
        setLoadError(null);
      }
    }
  };

  const handleStartFresh = () => {
    const freshStory = createStoryDocument();
    storage.save(freshStory);
    saveStoryToLibrary(storage, freshStory, { setActive: true });
    dispatch({ type: "RESET", story: freshStory });
    setTitleInput(freshStory.title);
    setSaveStatus("saved");
    setLoadError(null);
  };

  return (
    <div
      className="story-scope"
      style={STUDIO_CSS_VARS}
      data-testid="story-studio-workspace"
    >
      {/* Workspace Top Navigation Bar */}
      <header className="story-topbar" data-testid="story-topbar">
        <div className="story-topbar-left">
          <Link
            to="/world/studio"
            className="story-back-btn"
            data-testid="story-back-link"
            onClick={() => {
              if (currentStory?.metadata?.challengeId) {
                try {
                  const challengeStorage = createStoryChallengeStorage({ storage });
                  challengeStorage.saveChallengeStory(
                    currentStory.metadata.challengeId,
                    currentStory
                  );
                } catch {}
              } else {
                storage.save(currentStory);
                saveStoryToLibrary(storage, currentStory, { setActive: true });
              }
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Creative Studio</span>
          </Link>

          <button
            type="button"
            className="story-btn story-btn--ghost story-btn--sm story-library-btn"
            onClick={() => setIsLibraryOpen(true)}
            aria-label="Story Library"
            title="Open Story Library (Manage drafts & templates)"
            data-testid="story-library-btn"
          >
            <Library size={16} aria-hidden="true" />
            <span>Stories</span>
          </button>

          <button
            type="button"
            className={`story-btn story-btn--ghost story-btn--sm story-challenges-btn ${
              activeChallengeId ? "story-challenges-btn--active" : ""
            }`}
            onClick={() => setIsChallengesOpen(true)}
            aria-label="Story Studio Challenges"
            title="Open Challenge Hub (Progressive storytelling levels)"
            data-testid="story-challenges-btn"
          >
            <Trophy size={16} aria-hidden="true" />
            <span>Challenges</span>
            {activeChallengeLevel && (
              <span
                className="story-challenge-pill-indicator"
                data-testid="story-challenge-level-indicator"
                title={`Currently editing Level ${activeChallengeLevel} challenge`}
              >
                Lvl {activeChallengeLevel}
              </span>
            )}
          </button>

          <div className="story-title-editor">
            <BookOpen size={20} aria-hidden="true" className="story-title-icon" />
            <input
              type="text"
              className="story-title-input"
              value={titleInput}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              maxLength={STORY_LIMITS.MAX_TITLE_LENGTH}
              aria-label="Story Title"
              title="Click to rename story"
              data-testid="story-title-input"
            />
          </div>
        </div>

        <div className="story-topbar-right">
          {/* Undo / Redo controls */}
          <div className="story-history-controls" role="toolbar" aria-label="History">
            <button
              type="button"
              className="story-btn story-btn--ghost story-btn--sm"
              onClick={() => dispatch(undoStory())}
              disabled={!canUndo}
              aria-label="Undo"
              title={canUndo ? "Undo (Ctrl+Z / Cmd+Z)" : "Nothing to undo"}
              data-testid="story-undo-btn"
            >
              <Undo2 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="story-btn story-btn--ghost story-btn--sm"
              onClick={() => dispatch(redoStory())}
              disabled={!canRedo}
              aria-label="Redo"
              title={canRedo ? "Redo (Ctrl+Shift+Z / Cmd+Shift+Z)" : "Nothing to redo"}
              data-testid="story-redo-btn"
            >
              <Redo2 size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Save Status & Action */}
          <div className="story-save-group">
            <span
              className={`story-save-status story-save-status--${saveStatus}`}
              data-testid="story-save-status"
            >
              {saveStatus === "saved" && (
                <>
                  <Check size={13} aria-hidden="true" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === "saving" && <span>Saving...</span>}
              {saveStatus === "unsaved" && <span>Unsaved changes</span>}
            </span>

            <button
              type="button"
              className="story-btn story-btn--outline story-btn--sm"
              onClick={handleSave}
              aria-label="Save Story"
              data-testid="story-save-btn"
              title="Save Story (Ctrl+S / Cmd+S)"
            >
              <Save size={15} aria-hidden="true" />
              <span>Save</span>
            </button>
          </div>

          {/* Print / Export Storybook */}
          <button
            type="button"
            className="story-btn story-btn--outline story-btn--sm"
            onClick={() => setIsPrintOpen(true)}
            aria-label="Print or Export Storybook"
            title="Print or Export Storybook (Save as PDF)"
            data-testid="story-print-btn"
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print</span>
          </button>

          {/* Play Story action (Theater Mode) */}
          <button
            type="button"
            className="story-btn story-btn--play story-btn--sm"
            onClick={() => setIsPlaying(true)}
            aria-label="Play Story in Theater Mode"
            title="Play Story in Theater Mode (Space / Arrow Keys to advance)"
            data-testid="story-play-btn"
          >
            <Play size={15} aria-hidden="true" />
            <span>Play Story</span>
          </button>
        </div>
      </header>

      {/* Storage Error Recovery Banner */}
      {loadError && (
        <div
          className="story-recovery-banner"
          role="alert"
          data-testid="story-recovery-banner"
        >
          <div className="story-recovery-content">
            <AlertTriangle size={24} aria-hidden="true" className="story-recovery-icon" />
            <div>
              <strong className="story-recovery-title">
                Unable to Load Story Draft
              </strong>
              <p className="story-recovery-message">{loadError.message}</p>
              <p className="story-recovery-sub">
                Your saved story data on this device has NOT been replaced or erased.
              </p>
            </div>
          </div>
          <div className="story-recovery-actions">
            <button
              type="button"
              className="story-btn story-btn--outline story-btn--sm"
              onClick={handleRetryLoad}
              data-testid="story-recovery-retry-btn"
            >
              <RefreshCw size={14} aria-hidden="true" /> Retry
            </button>
            {storage?.hasBackup?.() && (
              <button
                type="button"
                className="story-btn story-btn--outline story-btn--sm"
                onClick={handleRestoreBackup}
                data-testid="story-recovery-restore-btn"
              >
                Restore Backup
              </button>
            )}
            <button
              type="button"
              className="story-btn story-btn--secondary story-btn--sm"
              onClick={handleStartFresh}
              data-testid="story-recovery-start-fresh-btn"
            >
              Start Clean Story
            </button>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      {notice && (
        <div
          className={`story-notice-banner story-notice-banner--${notice.kind}`}
          role="status"
          data-testid="story-notice-banner"
        >
          <span>{notice.message}</span>
          <button
            type="button"
            className="story-notice-close"
            onClick={() => dispatch(dismissNotice(notice.id))}
            aria-label="Dismiss notice"
            data-testid="story-notice-close-btn"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Active Challenge HUD (C3) */}
      {activeChallengeId && (
        <StoryChallengeHUD
          challengeId={activeChallengeId}
          currentStory={currentStory}
          onOpenHub={() => setIsChallengesOpen(true)}
          onExitChallenge={handleExitChallenge}
          onCheckChallenge={handleCheckChallenge}
        />
      )}

      {/* Main 3-Column Studio Workspace Shell */}
      <main className="story-workspace-shell" data-testid="story-workspace-shell">
        {/* Left Column: Filmstrip Scene Navigator */}
        <SceneNavigator
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSelectScene={(id) => dispatch(selectScene(id))}
          onAddScene={() => dispatch(addScene())}
          onRenameScene={(id, name) => dispatch(renameScene(id, name))}
          onDuplicateScene={(id) => dispatch(duplicateScene(id))}
          onDeleteScene={(id) => dispatch(deleteScene(id))}
          onMoveSceneUp={(id) => dispatch(moveSceneUp(id))}
          onMoveSceneDown={(id) => dispatch(moveSceneDown(id))}
          canAdd={canAdd}
          canDelete={canDelete}
        />

        {/* Center Column: Illustrated 16:9 Picture-Book Stage */}
        <StoryStage
          scene={selectedScene}
          sceneIndex={selectedSceneIndex}
          totalScenes={scenes.length}
          characterVoices={characterVoices}
        />

        {/* Right Column: Scene Director (Properties & Staging) */}
        <SceneDirector
          scene={selectedScene}
          allScenes={scenes}
          characterVoices={characterVoices}
          onSetCharacterVoice={(charId, voice) =>
            dispatch(setCharacterVoice(charId, voice))
          }
          onSetBackground={(bg) =>
            selectedSceneId && dispatch(setSceneBackground(selectedSceneId, bg))
          }
          onSetNarration={(text) =>
            selectedSceneId && dispatch(setSceneNarration(selectedSceneId, text))
          }
          onAddCharacter={(opts) =>
            selectedSceneId &&
            dispatch(addCharacter({ sceneId: selectedSceneId, ...opts }))
          }
          onUpdateCharacter={(charId, patch) =>
            selectedSceneId &&
            dispatch(updateCharacter(selectedSceneId, charId, patch))
          }
          onRemoveCharacter={(charId) =>
            selectedSceneId && dispatch(removeCharacter(selectedSceneId, charId))
          }
          onAddDialogueLine={(opts) =>
            selectedSceneId &&
            dispatch(addDialogueLine({ sceneId: selectedSceneId, ...opts }))
          }
          onUpdateDialogueLine={(lineId, patch) =>
            selectedSceneId &&
            dispatch(updateDialogueLine(selectedSceneId, lineId, patch))
          }
          onRemoveDialogueLine={(lineId) =>
            selectedSceneId &&
            dispatch(removeDialogueLine(selectedSceneId, lineId))
          }
          onMoveDialogueLine={(lineId, dir) =>
            selectedSceneId &&
            dispatch(moveDialogueLine(selectedSceneId, lineId, dir))
          }
          onToggleProp={(propId) =>
            selectedSceneId && dispatch(toggleProp(selectedSceneId, propId))
          }
          onAddChoice={(opts) =>
            selectedSceneId &&
            dispatch(addChoice({ sceneId: selectedSceneId, ...opts }))
          }
          onUpdateChoice={(choiceId, patch) =>
            selectedSceneId &&
            dispatch(updateChoice(selectedSceneId, choiceId, patch))
          }
          onRemoveChoice={(choiceId) =>
            selectedSceneId &&
            dispatch(removeChoice(selectedSceneId, choiceId))
          }
          onMoveChoice={(choiceId, dir) =>
            selectedSceneId &&
            dispatch(moveChoice(selectedSceneId, choiceId, dir))
          }
          onSetSceneIsEnding={(isEnding) =>
            selectedSceneId &&
            dispatch(setSceneIsEnding(selectedSceneId, isEnding))
          }
        />
      </main>

      {/* Story Library Modal (S1.7 & S1.8) */}
      <StoryLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        storage={storage}
        currentStory={currentStory}
        onSelectStory={(newStory) => {
          // If switching away from a challenge story, save the challenge draft
          if (currentStory?.metadata?.challengeId) {
            try {
              const challengeStorage = createStoryChallengeStorage({ storage });
              challengeStorage.saveChallengeStory(
                currentStory.metadata.challengeId,
                currentStory
              );
            } catch {}
          } else {
            storage.save(currentStory);
            saveStoryToLibrary(storage, currentStory, { setActive: true });
          }
          dispatch({ type: "RESET", story: newStory });
          setTitleInput(newStory.title);
          setSaveStatus("saved");
        }}
        onOpenChallenges={() => setIsChallengesOpen(true)}
      />

      {/* Story Challenges Hub Modal (C2) */}
      <StoryChallengeModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        storage={storage}
        currentStory={currentStory}
        onStartChallenge={(challengeStory) => {
          // If switching away from a personal story, save to canonical storage
          if (!currentStory?.metadata?.challengeId) {
            storage.save(currentStory);
            saveStoryToLibrary(storage, currentStory, { setActive: true });
          } else {
            // If switching away from another challenge story, save to that challenge's storage
            try {
              const challengeStorage = createStoryChallengeStorage({ storage });
              challengeStorage.saveChallengeStory(
                currentStory.metadata.challengeId,
                currentStory
              );
            } catch {}
          }
          dispatch({ type: "RESET", story: challengeStory });
          setTitleInput(challengeStory.title);
          setSaveStatus("saved");
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Story Print & Export Modal (S1.10) */}
      <StoryPrintPreviewModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        story={currentStory}
      />

      {/* Story Theater Reader Mode (S1.5 & S1.9) */}
      {isPlaying && (
        <StoryReader
          story={currentStory}
          initialSceneIndex={selectedSceneIndex}
          onClose={() => setIsPlaying(false)}
          characterVoices={characterVoices}
        />
      )}
    </div>
  );
}
