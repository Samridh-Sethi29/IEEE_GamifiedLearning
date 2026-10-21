/**
 * Pure JavaScript Story Studio Graph and Branching Engine (S1.9).
 * Zero React, zero DOM, zero mutations.
 *
 * Implements safe graph analysis, unreachable scene detection, ending identification,
 * choice destination validation, and cycle protection without altering valid content.
 */

import { STORY_LIMITS } from "./storySchema.js";
import { validateChoiceItem } from "./storyValidation.js";

/**
 * Checks if a scene is an ending scene.
 * A scene is considered an ending if it has no choices defined,
 * or if it is explicitly designated as an ending.
 */
export function isEndingScene(scene) {
  if (!scene || typeof scene !== "object") return true;
  if (scene.isEnding === true) return true;
  const choices = Array.isArray(scene.choices) ? scene.choices : [];
  return choices.length === 0;
}

/**
 * Returns safe valid choices for a scene.
 */
export function getSceneChoices(scene) {
  if (!scene || !Array.isArray(scene.choices)) return [];
  return scene.choices.filter(
    (ch) => ch && typeof ch === "object" && typeof ch.text === "string" && typeof ch.targetSceneId === "string"
  );
}

/**
 * Analyzes the story graph starting from the root scene (first scene).
 * Identifies:
 * - Unreachable scenes (not reachable from the starting scene via any path)
 * - Ending scenes (scenes that terminate a branch with no outgoing choices)
 * - Broken targets (choices that point to non-existent scene IDs)
 * - Self-referencing choices (choices targeting their own scene)
 *
 * Never throws on malformed inputs.
 */
export function analyzeStoryGraph(story) {
  const scenes = Array.isArray(story?.scenes) ? story.scenes : [];
  const sceneMap = new Map();
  const sceneIds = new Set();

  scenes.forEach((s) => {
    if (s && typeof s.id === "string") {
      sceneMap.set(s.id, s);
      sceneIds.add(s.id);
    }
  });

  const errors = [];
  const warnings = [];
  const brokenChoices = [];
  const selfChoices = [];
  const endingSceneIds = [];

  // If there are no scenes
  if (scenes.length === 0) {
    return {
      ok: false,
      errors: ["Story has no scenes."],
      warnings: [],
      reachableSceneIds: [],
      unreachableSceneIds: [],
      endingSceneIds: [],
      brokenChoices: [],
    };
  }

  // Check choices and identify endings
  scenes.forEach((scene, sIdx) => {
    const choices = Array.isArray(scene?.choices) ? scene.choices : [];
    if (choices.length === 0 || scene?.isEnding === true) {
      endingSceneIds.push(scene.id);
    }

    choices.forEach((ch, cIdx) => {
      if (!ch || typeof ch !== "object") {
        errors.push(`Scene "${scene.name || sIdx + 1}" has a malformed choice at index ${cIdx}.`);
        return;
      }

      if (ch.targetSceneId === scene.id) {
        selfChoices.push({ sceneId: scene.id, choiceId: ch.id });
        warnings.push(
          `Scene "${scene.name || sIdx + 1}" has a choice "${ch.text || "Choice"}" that loops back to itself.`
        );
      } else if (!sceneIds.has(ch.targetSceneId)) {
        brokenChoices.push({
          sceneId: scene.id,
          choiceId: ch.id,
          targetSceneId: ch.targetSceneId,
        });
        errors.push(
          `Scene "${scene.name || sIdx + 1}" choice "${ch.text || "Choice"}" targets missing scene "${ch.targetSceneId}".`
        );
      }
    });
  });

  // Graph traversal (BFS) starting from the first scene (root)
  const rootId = scenes[0].id;
  const reachableSceneIds = new Set([rootId]);
  const queue = [rootId];
  const visitedForCycle = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentScene = sceneMap.get(currentId);
    if (!currentScene) continue;

    const choices = Array.isArray(currentScene.choices) ? currentScene.choices : [];

    if (choices.length > 0) {
      // Branching: follow choices
      for (const ch of choices) {
        const targetId = ch.targetSceneId;
        if (targetId && sceneIds.has(targetId) && !reachableSceneIds.has(targetId)) {
          reachableSceneIds.add(targetId);
          queue.push(targetId);
        }
      }
    } else {
      // In a story with NO choices on this scene, check if story has ANY choices anywhere
      // If the entire story is linear (no choices anywhere), all scenes in array are sequential!
      const storyHasAnyChoices = scenes.some(
        (s) => Array.isArray(s.choices) && s.choices.length > 0
      );
      if (!storyHasAnyChoices) {
        // Pure linear story: next scene in array is reachable
        const currIdx = scenes.findIndex((s) => s.id === currentId);
        if (currIdx >= 0 && currIdx < scenes.length - 1) {
          const nextScene = scenes[currIdx + 1];
          if (nextScene && !reachableSceneIds.has(nextScene.id)) {
            reachableSceneIds.add(nextScene.id);
            queue.push(nextScene.id);
          }
        }
      }
    }
  }

  // Unreachable scenes are scenes not in reachableSceneIds
  const unreachableSceneIds = scenes
    .map((s) => s.id)
    .filter((id) => !reachableSceneIds.has(id));

  if (unreachableSceneIds.length > 0) {
    warnings.push(
      `${unreachableSceneIds.length} scene(s) cannot be reached from the opening scene.`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    reachableSceneIds: Array.from(reachableSceneIds),
    unreachableSceneIds,
    endingSceneIds,
    brokenChoices,
    selfChoices,
  };
}

/**
 * Validates choices for adding or updating.
 */
export function validateNewChoice({ text, targetSceneId, existingChoices = [], sceneId, allSceneIds = [] }) {
  const errors = [];
  const trimmedText = String(text || "").trim();

  if (!trimmedText) {
    errors.push("Choice text cannot be empty.");
  } else if (trimmedText.length > STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH) {
    errors.push(
      `Choice text cannot exceed ${STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH} characters.`
    );
  }

  if (!targetSceneId || typeof targetSceneId !== "string" || !allSceneIds.includes(targetSceneId)) {
    errors.push("Choice must target a valid destination scene.");
  }

  if (existingChoices.length >= STORY_LIMITS.MAX_CHOICES_PER_SCENE) {
    errors.push(
      `A scene can have at most ${STORY_LIMITS.MAX_CHOICES_PER_SCENE} choices.`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    cleanedText: trimmedText,
  };
}
