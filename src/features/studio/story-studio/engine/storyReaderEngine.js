/**
 * Interactive playback engine for Story Studio Reader & Theater Mode (S1.5 & S1.9).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements predictable stepping through scenes, dialogue lines, branching choices,
 * multiple endings, and breadcrumb path history for backward navigation.
 * Preserves 100% linear playback for stories with no choices.
 */

import { STORY_CHARACTERS } from "./storySchema.js";

/**
 * Creates the initial reader state from a story document.
 * Handles empty scenes or missing properties safely.
 */
export function createReaderState(story, { initialSceneIndex = 0 } = {}) {
  const safeScenes = Array.isArray(story?.scenes) ? story.scenes : [];
  const totalScenes = safeScenes.length;
  const clampedSceneIndex =
    totalScenes > 0
      ? Math.max(0, Math.min(initialSceneIndex, totalScenes - 1))
      : 0;

  return {
    story: story || null,
    scenes: safeScenes,
    sceneIndex: clampedSceneIndex,
    dialogueIndex: 0,
    isEnd: totalScenes === 0,
    pathHistory: [],
    endingSceneName: null,
  };
}

/**
 * Returns the current scene object or null.
 */
export function getCurrentScene(readerState) {
  if (!readerState || !readerState.scenes || readerState.scenes.length === 0) {
    return null;
  }
  return readerState.scenes[readerState.sceneIndex] ?? null;
}

/**
 * Returns the current dialogue line object or null.
 */
export function getCurrentDialogue(readerState) {
  const scene = getCurrentScene(readerState);
  if (!scene || !Array.isArray(scene.dialogue) || scene.dialogue.length === 0) {
    return null;
  }
  return scene.dialogue[readerState.dialogueIndex] ?? null;
}

/**
 * Checks if the reader is paused waiting for the reader to select a branching choice.
 * Occurs when:
 * 1. The scene has one or more choices.
 * 2. All dialogue lines of the current scene have finished playing (or scene has 0 dialogue lines).
 * 3. The story is not already at the End screen.
 */
export function isWaitingForChoice(readerState) {
  if (!readerState || readerState.isEnd) return false;
  const scene = getCurrentScene(readerState);
  if (!scene) return false;

  const choices = Array.isArray(scene.choices) ? scene.choices : [];
  if (choices.length === 0) return false;

  const dialogueCount = Array.isArray(scene.dialogue) ? scene.dialogue.length : 0;
  return dialogueCount === 0 || readerState.dialogueIndex >= dialogueCount - 1;
}

/**
 * Checks if the reader can step forward.
 * Returns false if waiting for player to click a choice!
 */
export function canAdvance(readerState) {
  if (!readerState || readerState.isEnd) return false;
  if (isWaitingForChoice(readerState)) return false;
  return readerState.scenes.length > 0;
}

/**
 * Checks if the reader can step backward.
 */
export function canStepBack(readerState) {
  if (!readerState) return false;
  if (readerState.isEnd) return readerState.scenes.length > 0;
  if (readerState.pathHistory.length > 0) return true;
  if (readerState.sceneIndex > 0) return true;
  return readerState.dialogueIndex > 0;
}

/**
 * Advances the reader to the next dialogue line or next scene.
 * If at the final line of a scene with choices, it does NOT auto-advance (requires explicit choice).
 * If at the final line of the final scene or ending scene, transitions to the End-of-Story screen.
 * Pure function: returns a new state object.
 */
export function advanceReader(readerState) {
  if (!canAdvance(readerState)) return readerState;

  const currentScene = getCurrentScene(readerState);
  const dialogueCount = Array.isArray(currentScene?.dialogue)
    ? currentScene.dialogue.length
    : 0;

  // If there are remaining dialogue lines in the current scene
  if (dialogueCount > 0 && readerState.dialogueIndex < dialogueCount - 1) {
    return {
      ...readerState,
      dialogueIndex: readerState.dialogueIndex + 1,
    };
  }

  // If the scene has choices, we must wait for player selection
  if (isWaitingForChoice(readerState)) {
    return readerState;
  }

  // If this scene is marked explicitly as an ending scene
  if (currentScene?.isEnding === true) {
    return {
      ...readerState,
      isEnd: true,
      endingSceneName: currentScene.name || `Scene ${readerState.sceneIndex + 1}`,
    };
  }

  // Linear progression: if there are more scenes to visit sequentially
  if (readerState.sceneIndex < readerState.scenes.length - 1) {
    const nextStep = {
      fromSceneIndex: readerState.sceneIndex,
      dialogueIndex: readerState.dialogueIndex,
    };
    return {
      ...readerState,
      sceneIndex: readerState.sceneIndex + 1,
      dialogueIndex: 0,
      pathHistory: [...readerState.pathHistory, nextStep],
    };
  }

  // Reached the end of the linear story!
  return {
    ...readerState,
    isEnd: true,
    endingSceneName: currentScene?.name || `Scene ${readerState.sceneIndex + 1}`,
  };
}

/**
 * Executes a player's choice selection in a branching scene.
 * Traverses to the target scene and records the decision in pathHistory.
 */
export function chooseBranch(readerState, choiceId) {
  if (!readerState || readerState.isEnd) return readerState;

  const currentScene = getCurrentScene(readerState);
  if (!currentScene) return readerState;

  const choices = Array.isArray(currentScene.choices) ? currentScene.choices : [];
  const choice = choices.find((c) => c.id === choiceId);
  if (!choice || !choice.targetSceneId) return readerState;

  const targetIdx = readerState.scenes.findIndex((s) => s.id === choice.targetSceneId);
  if (targetIdx === -1) {
    // Broken target, cannot advance
    return readerState;
  }

  const nextStep = {
    fromSceneIndex: readerState.sceneIndex,
    dialogueIndex: readerState.dialogueIndex,
    choiceId: choice.id,
  };

  return {
    ...readerState,
    sceneIndex: targetIdx,
    dialogueIndex: 0,
    pathHistory: [...readerState.pathHistory, nextStep],
  };
}

/**
 * Steps the reader backward to the previous dialogue line or previous scene.
 * Correctly traces backward through player choice history.
 * Pure function: returns a new state object.
 */
export function stepBackReader(readerState) {
  if (!canStepBack(readerState)) return readerState;

  // Stepping back from the End-of-Story screen
  if (readerState.isEnd) {
    const returnSceneIdx = readerState.sceneIndex;
    const scene = readerState.scenes[returnSceneIdx];
    const dialogueCount = Array.isArray(scene?.dialogue) ? scene.dialogue.length : 0;

    return {
      ...readerState,
      isEnd: false,
      endingSceneName: null,
      dialogueIndex: Math.max(0, dialogueCount - 1),
    };
  }

  // Stepping back within current scene's dialogue lines
  if (readerState.dialogueIndex > 0) {
    return {
      ...readerState,
      dialogueIndex: readerState.dialogueIndex - 1,
    };
  }

  // Stepping back to the previous scene via pathHistory
  if (readerState.pathHistory.length > 0) {
    const lastStep = readerState.pathHistory[readerState.pathHistory.length - 1];
    const nextHistory = readerState.pathHistory.slice(0, -1);

    return {
      ...readerState,
      sceneIndex: lastStep.fromSceneIndex,
      dialogueIndex: lastStep.dialogueIndex,
      pathHistory: nextHistory,
    };
  }

  // Fallback linear step back
  if (readerState.sceneIndex > 0) {
    const prevSceneIdx = readerState.sceneIndex - 1;
    const prevScene = readerState.scenes[prevSceneIdx];
    const prevDialogueCount = Array.isArray(prevScene?.dialogue)
      ? prevScene.dialogue.length
      : 0;

    return {
      ...readerState,
      sceneIndex: prevSceneIdx,
      dialogueIndex: Math.max(0, prevDialogueCount - 1),
    };
  }

  return readerState;
}

/**
 * Restarts playback from the beginning (Scene 1, line 0).
 */
export function restartReader(readerState) {
  if (!readerState) return readerState;
  return {
    ...readerState,
    sceneIndex: 0,
    dialogueIndex: 0,
    isEnd: readerState.scenes.length === 0,
    pathHistory: [],
    endingSceneName: null,
  };
}

/**
 * Returns structured progress metadata for UI indicators.
 */
export function getReaderProgress(readerState) {
  const currentScene = getCurrentScene(readerState);
  const totalScenes = readerState.scenes.length;
  const currentDialogue = getCurrentDialogue(readerState);
  const dialogueCount = Array.isArray(currentScene?.dialogue)
    ? currentScene.dialogue.length
    : 0;

  const waitingChoice = isWaitingForChoice(readerState);
  const choices = Array.isArray(currentScene?.choices) ? currentScene.choices : [];

  return {
    sceneIndex: readerState.sceneIndex,
    sceneNumber: readerState.sceneIndex + 1,
    totalScenes,
    dialogueIndex: readerState.dialogueIndex,
    dialogueNumber: dialogueCount > 0 ? readerState.dialogueIndex + 1 : 0,
    totalDialogue: dialogueCount,
    isEnd: readerState.isEnd,
    endingSceneName: readerState.endingSceneName,
    sceneTitle: currentScene?.name || `Scene ${readerState.sceneIndex + 1}`,
    background: currentScene?.background || "village-square",
    narration: currentScene?.narration || "",
    characters: currentScene?.characters || [],
    currentLine: currentDialogue,
    isWaitingForChoice: waitingChoice,
    choices,
    hasChoices: choices.length > 0,
    isEnding: choices.length === 0 || currentScene?.isEnding === true,
    speakerName:
      currentDialogue?.speakerId === "narrator"
        ? "Narrator"
        : STORY_CHARACTERS[currentDialogue?.speakerId]?.name ||
          currentDialogue?.speakerId ||
          "",
  };
}
