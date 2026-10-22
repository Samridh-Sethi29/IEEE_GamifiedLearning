/**
 * Pure JavaScript Story Studio Print & Export Engine (S1.10).
 * Zero React, zero DOM, zero mutations, zero external dependencies.
 *
 * Prepares structured, sanitized, print-friendly models from Story Studio documents
 * for printable storybooks and browser Print / Save as PDF workflows.
 */

import {
  STORY_BACKGROUNDS,
  STORY_CHARACTERS,
  STORY_PROPS,
} from "./storySchema.js";
import { validateStoryDocument } from "./storyValidation.js";

/**
 * Builds a sanitized, printable storybook model from a story document.
 * Does NOT mutate the input document.
 *
 * @param {object} story - Story document to prepare for print
 * @returns {object} Structured printable storybook model
 */
export function buildPrintableStoryModel(story) {
  if (!story || typeof story !== "object") {
    throw new Error("Cannot export invalid story: document is not an object.");
  }

  const check = validateStoryDocument(story);
  if (!check.ok) {
    throw new Error(`Cannot export invalid story: ${check.errors[0]}`);
  }

  const scenes = Array.isArray(story.scenes) ? story.scenes : [];
  const sceneMap = new Map();
  scenes.forEach((s) => {
    if (s && s.id) {
      sceneMap.set(s.id, s);
    }
  });

  const formattedDate = story.modifiedAt
    ? new Date(story.modifiedAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Updated";

  let totalDialogueCount = 0;

  const printableScenes = scenes.map((scene, idx) => {
    const bgMeta = STORY_BACKGROUNDS[scene.background] || {
      id: scene.background,
      label: scene.background || "Village Square",
      theme: "outdoors",
    };

    const sceneCharacters = (scene.characters || []).map((c) => {
      const charMeta = STORY_CHARACTERS[c.characterId] || {
        name: c.characterId,
        role: "Character",
      };
      return {
        id: c.id,
        characterId: c.characterId,
        name: charMeta.name,
        role: charMeta.role,
        slot: c.slot || "center",
        expression: c.expression || "happy",
        facing: c.facing || "right",
      };
    });

    const sceneProps = (scene.props || []).map((pId) => {
      const propMeta = STORY_PROPS[pId] || { label: pId };
      return {
        id: pId,
        label: propMeta.label,
      };
    });

    const sceneDialogue = (scene.dialogue || []).map((d) => {
      totalDialogueCount += 1;
      let speakerName = "Narrator";
      if (d.speakerId !== "narrator") {
        speakerName = STORY_CHARACTERS[d.speakerId]?.name || d.speakerId;
      }

      return {
        id: d.id,
        speakerId: d.speakerId,
        speakerName,
        text: String(d.text || ""),
        type: d.type || "speech",
      };
    });

    const sceneChoices = (scene.choices || []).map((ch) => {
      const targetScene = sceneMap.get(ch.targetSceneId);
      return {
        id: ch.id,
        text: String(ch.text || ""),
        targetSceneId: ch.targetSceneId,
        targetSceneName: targetScene?.name || `Scene: ${ch.targetSceneId}`,
      };
    });

    return {
      sceneIndex: idx,
      sceneNumber: idx + 1,
      id: scene.id,
      name: String(scene.name || `Scene ${idx + 1}`),
      background: bgMeta.id,
      backgroundLabel: bgMeta.label,
      backgroundTheme: bgMeta.theme,
      narration: String(scene.narration || ""),
      characters: sceneCharacters,
      props: sceneProps,
      dialogue: sceneDialogue,
      choices: sceneChoices,
      isEnding: Boolean(scene.isEnding || sceneChoices.length === 0),
    };
  });

  return {
    id: String(story.id),
    title: String(story.title || "Untitled Story"),
    author: String(story.author || "Explorer"),
    formattedDate,
    sceneCount: scenes.length,
    totalDialogueCount,
    scenes: printableScenes,
  };
}

/**
 * Triggers native browser print dialog safely.
 * Returns true if window.print was invoked, false if not in a browser environment.
 */
export function triggerBrowserPrint() {
  if (typeof globalThis.window?.print === "function") {
    try {
      globalThis.window.print();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
