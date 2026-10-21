/**
 * Pure state-update module and reducer for Story Studio (S1.3 & S1.4).
 * Pure JavaScript: zero React, zero DOM, zero external dependencies.
 *
 * Implements immutable scene navigation, characters, dialogue, narration,
 * props, reordering, undo/redo history tracking, and active scene selection.
 */

import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  redo,
  undo,
} from "../../engine/history.js";

import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_FACING,
  CHARACTER_SLOTS,
  DIALOGUE_TYPES,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTER_IDS,
  STORY_CHARACTERS,
  STORY_LIMITS,
  STORY_PROP_IDS,
  createChoiceId,
  createCharacterPlacement,
  createCharacterPlacementId,
  createDefaultScene,
  createDialogueId,
  createDialogueLine,
  createSceneId,
  createStoryDocument,
} from "./storySchema.js";

import {
  normalizeStoryDocument,
  validateStoryDocument,
} from "./storyValidation.js";

// Action Types
export const STORY_ACTIONS = Object.freeze({
  ADD_SCENE: "ADD_SCENE",
  SELECT_SCENE: "SELECT_SCENE",
  RENAME_SCENE: "RENAME_SCENE",
  DUPLICATE_SCENE: "DUPLICATE_SCENE",
  DELETE_SCENE: "DELETE_SCENE",
  MOVE_SCENE: "MOVE_SCENE",
  MOVE_SCENE_UP: "MOVE_SCENE_UP",
  MOVE_SCENE_DOWN: "MOVE_SCENE_DOWN",
  SET_TITLE: "SET_TITLE",
  SET_SCENE_BACKGROUND: "SET_SCENE_BACKGROUND",
  SET_SCENE_NARRATION: "SET_SCENE_NARRATION",
  ADD_CHARACTER: "ADD_CHARACTER",
  UPDATE_CHARACTER: "UPDATE_CHARACTER",
  REMOVE_CHARACTER: "REMOVE_CHARACTER",
  ADD_DIALOGUE_LINE: "ADD_DIALOGUE_LINE",
  UPDATE_DIALOGUE_LINE: "UPDATE_DIALOGUE_LINE",
  REMOVE_DIALOGUE_LINE: "REMOVE_DIALOGUE_LINE",
  MOVE_DIALOGUE_LINE: "MOVE_DIALOGUE_LINE",
  TOGGLE_PROP: "TOGGLE_PROP",
  ADD_CHOICE: "ADD_CHOICE",
  UPDATE_CHOICE: "UPDATE_CHOICE",
  REMOVE_CHOICE: "REMOVE_CHOICE",
  MOVE_CHOICE: "MOVE_CHOICE",
  SET_SCENE_IS_ENDING: "SET_SCENE_IS_ENDING",
  SET_CHARACTER_VOICE: "SET_CHARACTER_VOICE",
  UNDO: "UNDO",
  REDO: "REDO",
  RESET: "RESET",
  DISMISS_NOTICE: "DISMISS_NOTICE",
});

/**
 * Creates the initial Story Studio editor state.
 */
export function createStoryState(initialStory) {
  let doc = initialStory;
  if (!doc) {
    doc = createStoryDocument();
  } else {
    const check = validateStoryDocument(doc);
    if (!check.ok) {
      throw new Error(`Cannot open invalid story: ${check.errors[0]}`);
    }
    doc = normalizeStoryDocument(doc);
  }

  const initialSelectedId = doc.scenes[0]?.id ?? null;

  return {
    history: createHistory(doc),
    initial: doc,
    selectedSceneId: initialSelectedId,
    notice: null,
    noticeSeq: 0,
  };
}

// ---- Notice Helper -----------------------------------------------------------
const note = (state, kind, message) => ({
  ...state,
  noticeSeq: state.noticeSeq + 1,
  notice: { id: state.noticeSeq + 1, kind, message },
});

// ---- Timestamp helper --------------------------------------------------------
const stamp = (doc, at) => ({
  ...doc,
  modifiedAt: new Date(typeof at === "number" ? at : Date.now()).toISOString(),
});

// ---- Reducer -----------------------------------------------------------------
export function storyReducer(state, action) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case STORY_ACTIONS.ADD_SCENE: {
      const doc = state.history.present;
      if (doc.scenes.length >= STORY_LIMITS.MAX_SCENES) {
        return note(
          state,
          "warning",
          `Stories can have up to ${STORY_LIMITS.MAX_SCENES} scenes. Delete a scene to add another.`
        );
      }

      const freshId = createSceneId();
      const sceneIndex = doc.scenes.length + 1;
      const defaultName = `Scene ${sceneIndex}`;
      const name = (action.name ?? defaultName).trim() || defaultName;

      // Inherit previous scene's background or default to village-square
      const lastScene = doc.scenes[doc.scenes.length - 1];
      const background =
        action.background && STORY_BACKGROUND_IDS.includes(action.background)
          ? action.background
          : lastScene?.background ?? "village-square";

      const newScene = createDefaultScene({
        id: freshId,
        name: name.slice(0, STORY_LIMITS.MAX_SCENE_NAME_LENGTH),
        background,
        narration: action.narration ?? "",
        characters: action.characters ?? [],
        props: action.props ?? [],
        dialogue: action.dialogue ?? [],
        choices: action.choices ?? [],
      });

      let nextScenes;
      if (action.insertAfterId) {
        const targetIdx = doc.scenes.findIndex((s) => s.id === action.insertAfterId);
        if (targetIdx !== -1) {
          nextScenes = [
            ...doc.scenes.slice(0, targetIdx + 1),
            newScene,
            ...doc.scenes.slice(targetIdx + 1),
          ];
        } else {
          nextScenes = [...doc.scenes, newScene];
        }
      } else {
        nextScenes = [...doc.scenes, newScene];
      }

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        selectedSceneId: freshId,
        notice: null,
      };
    }

    case STORY_ACTIONS.SELECT_SCENE: {
      const { sceneId } = action;
      if (!sceneId) return state;
      const doc = state.history.present;
      const exists = doc.scenes.some((s) => s.id === sceneId);
      if (!exists) {
        return note(state, "warning", "Selected scene does not exist.");
      }
      if (state.selectedSceneId === sceneId) return state;
      return {
        ...state,
        selectedSceneId: sceneId,
        notice: null,
      };
    }

    case STORY_ACTIONS.RENAME_SCENE: {
      const { sceneId, name } = action;
      const trimmed = (name ?? "").trim();
      if (!trimmed) {
        return note(state, "warning", "Scene name cannot be empty.");
      }
      if (trimmed.length > STORY_LIMITS.MAX_SCENE_NAME_LENGTH) {
        return note(
          state,
          "warning",
          `Scene name cannot exceed ${STORY_LIMITS.MAX_SCENE_NAME_LENGTH} characters.`
        );
      }

      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) {
        return note(state, "warning", "Scene not found.");
      }
      if (target.name === trimmed) return state;

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, name: trimmed } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.DUPLICATE_SCENE: {
      const doc = state.history.present;
      if (doc.scenes.length >= STORY_LIMITS.MAX_SCENES) {
        return note(
          state,
          "warning",
          `Stories can have up to ${STORY_LIMITS.MAX_SCENES} scenes. Delete a scene first.`
        );
      }

      const { sceneId } = action;
      const sourceIdx = doc.scenes.findIndex((s) => s.id === sceneId);
      if (sourceIdx === -1) {
        return note(state, "warning", "Scene to duplicate not found.");
      }

      const source = doc.scenes[sourceIdx];
      const freshSceneId = createSceneId();
      const rawCopyName = `${source.name} (Copy)`;
      const copyName = rawCopyName.slice(0, STORY_LIMITS.MAX_SCENE_NAME_LENGTH);

      // Deep clone character placements with brand new unique IDs
      const freshCharacters = source.characters.map((char) => ({
        ...char,
        id: createCharacterPlacementId(),
      }));

      // Deep clone dialogue lines with brand new unique IDs
      const freshDialogue = source.dialogue.map((line) => ({
        ...line,
        id: createDialogueId(),
      }));

      // Deep clone choices with brand new unique IDs
      const freshChoices = (source.choices || []).map((ch) => ({
        ...ch,
        id: createChoiceId(),
      }));

      const clonedScene = {
        ...source,
        id: freshSceneId,
        name: copyName,
        props: [...(source.props || [])],
        characters: freshCharacters,
        dialogue: freshDialogue,
        choices: freshChoices,
      };

      const nextScenes = [
        ...doc.scenes.slice(0, sourceIdx + 1),
        clonedScene,
        ...doc.scenes.slice(sourceIdx + 1),
      ];

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        selectedSceneId: freshSceneId,
        notice: null,
      };
    }

    case STORY_ACTIONS.DELETE_SCENE: {
      const doc = state.history.present;
      if (doc.scenes.length <= STORY_LIMITS.MIN_SCENES) {
        return note(
          state,
          "warning",
          `A story must have at least ${STORY_LIMITS.MIN_SCENES} scene.`
        );
      }

      const { sceneId } = action;
      const targetIdx = doc.scenes.findIndex((s) => s.id === sceneId);
      if (targetIdx === -1) {
        return note(state, "warning", "Scene to delete not found.");
      }

      // Filter out deleted scene and strip any choice targeting this scene from remaining scenes
      const nextScenes = doc.scenes
        .filter((s) => s.id !== sceneId)
        .map((s) => ({
          ...s,
          choices: (s.choices || []).filter((ch) => ch.targetSceneId !== sceneId),
        }));

      // Adjust selected scene if the active one was deleted
      let nextSelectedId = state.selectedSceneId;
      if (state.selectedSceneId === sceneId) {
        const nextIdx = Math.min(targetIdx, nextScenes.length - 1);
        nextSelectedId = nextScenes[nextIdx].id;
      }

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        selectedSceneId: nextSelectedId,
        notice: null,
      };
    }

    case STORY_ACTIONS.MOVE_SCENE:
    case STORY_ACTIONS.MOVE_SCENE_UP:
    case STORY_ACTIONS.MOVE_SCENE_DOWN: {
      const { sceneId } = action;
      const doc = state.history.present;
      const currentIdx = doc.scenes.findIndex((s) => s.id === sceneId);
      if (currentIdx === -1) {
        return note(state, "warning", "Scene to reorder not found.");
      }

      let targetIdx;
      if (action.type === STORY_ACTIONS.MOVE_SCENE_UP || action.direction === "up") {
        targetIdx = currentIdx - 1;
      } else if (
        action.type === STORY_ACTIONS.MOVE_SCENE_DOWN ||
        action.direction === "down"
      ) {
        targetIdx = currentIdx + 1;
      } else if (typeof action.toIndex === "number") {
        targetIdx = action.toIndex;
      } else {
        return state;
      }

      // Boundary check: disabled at list ends
      if (targetIdx < 0 || targetIdx >= doc.scenes.length || targetIdx === currentIdx) {
        return state;
      }

      const nextScenes = [...doc.scenes];
      const [moved] = nextScenes.splice(currentIdx, 1);
      nextScenes.splice(targetIdx, 0, moved);

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        selectedSceneId: sceneId, // Preserve selection on the moved scene
        notice: null,
      };
    }

    case STORY_ACTIONS.SET_TITLE: {
      const rawTitle = (action.title ?? "").trim();
      if (!rawTitle) {
        return note(state, "warning", "Story title cannot be empty.");
      }
      if (rawTitle.length > STORY_LIMITS.MAX_TITLE_LENGTH) {
        return note(
          state,
          "warning",
          `Story title cannot exceed ${STORY_LIMITS.MAX_TITLE_LENGTH} characters.`
        );
      }

      const doc = state.history.present;
      if (doc.title === rawTitle) return state;

      const nextDoc = stamp({ ...doc, title: rawTitle }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.SET_SCENE_BACKGROUND: {
      const { sceneId, background } = action;
      if (!STORY_BACKGROUND_IDS.includes(background)) {
        return note(state, "warning", `Unknown background "${background}".`);
      }

      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      if (target.background === background) return state;

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, background } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.SET_SCENE_NARRATION: {
      const { sceneId, narration } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      const text = typeof narration === "string" ? narration : "";
      if (text.length > STORY_LIMITS.MAX_NARRATION_LENGTH) {
        return note(
          state,
          "warning",
          `Narration cannot exceed ${STORY_LIMITS.MAX_NARRATION_LENGTH} characters.`
        );
      }
      if (target.narration === text) return state;

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, narration: text } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.ADD_CHARACTER: {
      const {
        sceneId,
        characterId,
        slot,
        expression = "happy",
        facing,
      } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");

      if (target.characters.length >= STORY_LIMITS.MAX_CHARACTERS_PER_SCENE) {
        return note(
          state,
          "warning",
          `Scenes can have at most ${STORY_LIMITS.MAX_CHARACTERS_PER_SCENE} characters.`
        );
      }

      if (!STORY_CHARACTER_IDS.includes(characterId)) {
        return note(state, "warning", `Unknown character "${characterId}".`);
      }

      if (!CHARACTER_SLOTS.includes(slot)) {
        return note(
          state,
          "warning",
          `Slot must be one of: ${CHARACTER_SLOTS.join(", ")}.`
        );
      }

      if (target.characters.some((c) => c.slot === slot)) {
        return note(state, "warning", `Slot "${slot}" is already occupied.`);
      }

      const exp = CHARACTER_EXPRESSIONS.includes(expression) ? expression : "happy";
      const defFacing = STORY_CHARACTERS[characterId]?.defaultFacing ?? "right";
      const face = CHARACTER_FACING.includes(facing) ? facing : defFacing;

      const placement = createCharacterPlacement({
        id: createCharacterPlacementId(),
        characterId,
        slot,
        expression: exp,
        facing: face,
      });

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, characters: [...s.characters, placement] } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.UPDATE_CHARACTER: {
      const { sceneId, characterPlacementId, patch = {} } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      const current = target.characters.find((c) => c.id === characterPlacementId);
      if (!current) return note(state, "warning", "Character placement not found.");

      if (patch.slot && patch.slot !== current.slot) {
        if (!CHARACTER_SLOTS.includes(patch.slot)) {
          return note(state, "warning", `Invalid slot "${patch.slot}".`);
        }
        if (target.characters.some((c) => c.id !== characterPlacementId && c.slot === patch.slot)) {
          return note(state, "warning", `Slot "${patch.slot}" is already occupied.`);
        }
      }

      if (patch.expression && !CHARACTER_EXPRESSIONS.includes(patch.expression)) {
        return note(state, "warning", `Invalid expression "${patch.expression}".`);
      }

      if (patch.facing && !CHARACTER_FACING.includes(patch.facing)) {
        return note(state, "warning", `Invalid facing direction "${patch.facing}".`);
      }

      if (patch.characterId && !STORY_CHARACTER_IDS.includes(patch.characterId)) {
        return note(state, "warning", `Unknown character "${patch.characterId}".`);
      }

      const updatedChar = {
        ...current,
        ...(patch.characterId ? { characterId: patch.characterId } : {}),
        ...(patch.slot ? { slot: patch.slot } : {}),
        ...(patch.expression ? { expression: patch.expression } : {}),
        ...(patch.facing ? { facing: patch.facing } : {}),
      };

      let nextDialogue = target.dialogue;
      // Reassign dialogue if characterId changed
      if (patch.characterId && patch.characterId !== current.characterId) {
        nextDialogue = target.dialogue.map((d) =>
          d.speakerId === current.characterId ? { ...d, speakerId: patch.characterId } : d
        );
      }

      const nextCharacters = target.characters.map((c) =>
        c.id === characterPlacementId ? updatedChar : c
      );

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, characters: nextCharacters, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.REMOVE_CHARACTER: {
      const { sceneId, characterPlacementId } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      const removedChar = target.characters.find((c) => c.id === characterPlacementId);
      if (!removedChar) return note(state, "warning", "Character placement not found.");

      const nextCharacters = target.characters.filter((c) => c.id !== characterPlacementId);

      // Revert dialogue lines to "narrator" if character has no other placement
      const otherHasSameChar = nextCharacters.some((c) => c.characterId === removedChar.characterId);
      const nextDialogue = otherHasSameChar
        ? target.dialogue
        : target.dialogue.map((d) =>
            d.speakerId === removedChar.characterId ? { ...d, speakerId: "narrator" } : d
          );

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, characters: nextCharacters, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.ADD_DIALOGUE_LINE: {
      const {
        sceneId,
        speakerId = "narrator",
        text = "",
        type = "speech",
        dialogueType,
        bubbleType,
        insertAfterId,
      } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");

      if (target.dialogue.length >= STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE) {
        return note(
          state,
          "warning",
          `Scenes can have at most ${STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE} dialogue lines.`
        );
      }

      const validSpeakers = new Set(["narrator", ...target.characters.map((c) => c.characterId)]);
      const resolvedSpeaker = validSpeakers.has(speakerId) ? speakerId : "narrator";

      const rawText = (text ?? "").trim();
      const lineText =
        rawText || (resolvedSpeaker === "narrator" ? "A quiet moment in the village." : "Hello!");
      if (lineText.length > STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH) {
        return note(
          state,
          "warning",
          `Dialogue line cannot exceed ${STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH} characters.`
        );
      }

      const effectiveType = dialogueType || bubbleType || type;
      const lineType = DIALOGUE_TYPES.includes(effectiveType) ? effectiveType : "speech";

      const newLine = createDialogueLine({
        id: createDialogueId(),
        speakerId: resolvedSpeaker,
        text: lineText,
        type: lineType,
      });

      let nextDialogue;
      if (insertAfterId) {
        const idx = target.dialogue.findIndex((d) => d.id === insertAfterId);
        if (idx !== -1) {
          nextDialogue = [
            ...target.dialogue.slice(0, idx + 1),
            newLine,
            ...target.dialogue.slice(idx + 1),
          ];
        } else {
          nextDialogue = [...target.dialogue, newLine];
        }
      } else {
        nextDialogue = [...target.dialogue, newLine];
      }

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.UPDATE_DIALOGUE_LINE: {
      const { sceneId, dialogueId, patch = {} } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      const current = target.dialogue.find((d) => d.id === dialogueId);
      if (!current) return note(state, "warning", "Dialogue line not found.");

      if (patch.speakerId) {
        const validSpeakers = new Set(["narrator", ...target.characters.map((c) => c.characterId)]);
        if (!validSpeakers.has(patch.speakerId)) {
          return note(state, "warning", `Speaker "${patch.speakerId}" is not present in this scene.`);
        }
      }

      if (patch.text !== undefined) {
        if (typeof patch.text !== "string") {
          return note(state, "warning", "Dialogue text must be a string.");
        }
        if (patch.text.length > STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH) {
          return note(
            state,
            "warning",
            `Dialogue line cannot exceed ${STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH} characters.`
          );
        }
      }

      if (patch.type && !DIALOGUE_TYPES.includes(patch.type)) {
        return note(state, "warning", `Invalid dialogue bubble type "${patch.type}".`);
      }

      const updatedLine = {
        ...current,
        ...(patch.speakerId ? { speakerId: patch.speakerId } : {}),
        ...(patch.text !== undefined ? { text: patch.text } : {}),
        ...(patch.type ? { type: patch.type } : {}),
      };

      const nextDialogue = target.dialogue.map((d) =>
        d.id === dialogueId ? updatedLine : d
      );

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.REMOVE_DIALOGUE_LINE: {
      const { sceneId, dialogueId } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      if (!target.dialogue.some((d) => d.id === dialogueId)) return state;

      const nextDialogue = target.dialogue.filter((d) => d.id !== dialogueId);
      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.MOVE_DIALOGUE_LINE: {
      const { sceneId, dialogueId, direction } = action;
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");
      const idx = target.dialogue.findIndex((d) => d.id === dialogueId);
      if (idx === -1) return note(state, "warning", "Dialogue line not found.");

      const targetIdx = direction === "up" ? idx - 1 : direction === "down" ? idx + 1 : -1;
      if (targetIdx < 0 || targetIdx >= target.dialogue.length || targetIdx === idx) {
        return state;
      }

      const nextDialogue = [...target.dialogue];
      const [moved] = nextDialogue.splice(idx, 1);
      nextDialogue.splice(targetIdx, 0, moved);

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, dialogue: nextDialogue } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.TOGGLE_PROP: {
      const { sceneId, propId } = action;
      if (!STORY_PROP_IDS.includes(propId)) {
        return note(state, "warning", `Unknown prop "${propId}".`);
      }
      const doc = state.history.present;
      const target = doc.scenes.find((s) => s.id === sceneId);
      if (!target) return note(state, "warning", "Scene not found.");

      const currentProps = target.props || [];
      const exists = currentProps.includes(propId);
      let nextProps;
      if (exists) {
        nextProps = currentProps.filter((p) => p !== propId);
      } else {
        if (currentProps.length >= STORY_LIMITS.MAX_PROPS_PER_SCENE) {
          return note(
            state,
            "warning",
            `Scenes can have at most ${STORY_LIMITS.MAX_PROPS_PER_SCENE} props.`
          );
        }
        nextProps = [...currentProps, propId];
      }

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, props: nextProps } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.ADD_CHOICE: {
      const { sceneId, text = "Next step", targetSceneId } = action;
      const doc = state.history.present;
      const targetScene = doc.scenes.find((s) => s.id === sceneId);
      if (!targetScene) return note(state, "warning", "Scene not found.");

      const currentChoices = targetScene.choices || [];
      if (currentChoices.length >= STORY_LIMITS.MAX_CHOICES_PER_SCENE) {
        return note(
          state,
          "warning",
          `A scene can have at most ${STORY_LIMITS.MAX_CHOICES_PER_SCENE} choices.`
        );
      }

      // Default target to next scene if not specified
      let resolvedTargetId = targetSceneId;
      if (!resolvedTargetId) {
        const otherScenes = doc.scenes.filter((s) => s.id !== sceneId);
        resolvedTargetId = otherScenes[0]?.id || "";
      }

      if (!resolvedTargetId || !doc.scenes.some((s) => s.id === resolvedTargetId)) {
        return note(state, "warning", "Choice must target a valid destination scene.");
      }

      const trimmed = String(text).trim().slice(0, STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH);
      if (!trimmed) {
        return note(state, "warning", "Choice text cannot be empty.");
      }

      const newChoice = {
        id: createChoiceId(),
        text: trimmed,
        targetSceneId: resolvedTargetId,
      };

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, isEnding: false, choices: [...currentChoices, newChoice] }
          : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.UPDATE_CHOICE: {
      const { sceneId, choiceId, patch = {} } = action;
      const doc = state.history.present;
      const targetScene = doc.scenes.find((s) => s.id === sceneId);
      if (!targetScene) return note(state, "warning", "Scene not found.");

      const currentChoices = targetScene.choices || [];
      const choiceIdx = currentChoices.findIndex((c) => c.id === choiceId);
      if (choiceIdx === -1) return note(state, "warning", "Choice not found.");

      const oldChoice = currentChoices[choiceIdx];
      let updatedText = oldChoice.text;
      if (patch.text !== undefined) {
        if (typeof patch.text !== "string") {
          return note(state, "warning", "Choice text must be a string.");
        }
        if (patch.text.length > STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH) {
          return note(
            state,
            "warning",
            `Choice text cannot exceed ${STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH} characters.`
          );
        }
        updatedText = patch.text;
      }

      let updatedTargetId = oldChoice.targetSceneId;
      if (patch.targetSceneId !== undefined) {
        if (!doc.scenes.some((s) => s.id === patch.targetSceneId)) {
          return note(state, "warning", "Destination scene not found.");
        }
        updatedTargetId = patch.targetSceneId;
      }

      const updatedChoice = {
        ...oldChoice,
        text: updatedText,
        targetSceneId: updatedTargetId,
      };

      const nextChoices = currentChoices.map((c) =>
        c.id === choiceId ? updatedChoice : c
      );

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, choices: nextChoices } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.REMOVE_CHOICE: {
      const { sceneId, choiceId } = action;
      const doc = state.history.present;
      const targetScene = doc.scenes.find((s) => s.id === sceneId);
      if (!targetScene) return note(state, "warning", "Scene not found.");

      const currentChoices = targetScene.choices || [];
      if (!currentChoices.some((c) => c.id === choiceId)) return state;

      const nextChoices = currentChoices.filter((c) => c.id !== choiceId);
      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, choices: nextChoices } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.MOVE_CHOICE: {
      const { sceneId, choiceId, direction } = action;
      const doc = state.history.present;
      const targetScene = doc.scenes.find((s) => s.id === sceneId);
      if (!targetScene) return note(state, "warning", "Scene not found.");

      const currentChoices = targetScene.choices || [];
      const idx = currentChoices.findIndex((c) => c.id === choiceId);
      if (idx === -1) return note(state, "warning", "Choice not found.");

      const targetIdx = direction === "up" ? idx - 1 : direction === "down" ? idx + 1 : -1;
      if (targetIdx < 0 || targetIdx >= currentChoices.length || targetIdx === idx) {
        return state;
      }

      const nextChoices = [...currentChoices];
      const [moved] = nextChoices.splice(idx, 1);
      nextChoices.splice(targetIdx, 0, moved);

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, choices: nextChoices } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.SET_SCENE_IS_ENDING: {
      const { sceneId, isEnding } = action;
      const doc = state.history.present;
      const targetScene = doc.scenes.find((s) => s.id === sceneId);
      if (!targetScene) return note(state, "warning", "Scene not found.");

      const nextScenes = doc.scenes.map((s) =>
        s.id === sceneId ? { ...s, isEnding: Boolean(isEnding) } : s
      );

      const nextDoc = stamp({ ...doc, scenes: nextScenes }, action.at);
      return {
        ...state,
        history: commit(state.history, nextDoc),
      };
    }

    case STORY_ACTIONS.SET_CHARACTER_VOICE: {
      const { characterId, voice, at } = action;
      if (!characterId) return state;
      const doc = state.history.present;
      const currentSettings = doc.settings || {};
      const currentVoices = currentSettings.characterVoices || {};
      const voicePatch = typeof voice === "object" && voice !== null ? voice : { voiceURI: voice };
      const nextVoices = {
        ...currentVoices,
        [characterId]: {
          ...currentVoices[characterId],
          ...voicePatch,
        },
      };

      const nextDoc = stamp(
        {
          ...doc,
          settings: {
            ...currentSettings,
            characterVoices: nextVoices,
          },
        },
        at
      );

      return {
        ...state,
        history: commit(state.history, nextDoc),
        notice: null,
      };
    }

    case STORY_ACTIONS.UNDO: {
      if (!canUndo(state.history)) return state;
      const nextHistory = undo(state.history);
      const restoredDoc = nextHistory.present;

      // Ensure selectedSceneId exists in restored document
      let nextSelectedId = state.selectedSceneId;
      if (!restoredDoc.scenes.some((s) => s.id === nextSelectedId)) {
        nextSelectedId = restoredDoc.scenes[0]?.id ?? null;
      }

      return {
        ...state,
        history: nextHistory,
        selectedSceneId: nextSelectedId,
        notice: null,
      };
    }

    case STORY_ACTIONS.REDO: {
      if (!canRedo(state.history)) return state;
      const nextHistory = redo(state.history);
      const restoredDoc = nextHistory.present;

      let nextSelectedId = state.selectedSceneId;
      if (!restoredDoc.scenes.some((s) => s.id === nextSelectedId)) {
        nextSelectedId = restoredDoc.scenes[0]?.id ?? null;
      }

      return {
        ...state,
        history: nextHistory,
        selectedSceneId: nextSelectedId,
        notice: null,
      };
    }

    case STORY_ACTIONS.RESET: {
      let resetDoc = action.story || state.initial;
      if (action.story) {
        const check = validateStoryDocument(action.story);
        if (check.ok) {
          resetDoc = normalizeStoryDocument(action.story);
        } else {
          return note(state, "warning", `Cannot open invalid story: ${check.errors[0]}`);
        }
      }
      return {
        ...state,
        history: createHistory(resetDoc),
        initial: resetDoc,
        selectedSceneId: resetDoc.scenes[0]?.id ?? null,
        notice: null,
      };
    }

    case STORY_ACTIONS.DISMISS_NOTICE: {
      if (action.id !== undefined && state.notice?.id !== action.id) {
        return state;
      }
      return { ...state, notice: null };
    }

    default:
      return state;
  }
}

// ---- Action Creators ---------------------------------------------------------
export const addScene = (options = {}) => ({
  type: STORY_ACTIONS.ADD_SCENE,
  ...options,
});

export const selectScene = (sceneId) => ({
  type: STORY_ACTIONS.SELECT_SCENE,
  sceneId,
});

export const renameScene = (sceneId, name, at) => ({
  type: STORY_ACTIONS.RENAME_SCENE,
  sceneId,
  name,
  at,
});

export const duplicateScene = (sceneId, at) => ({
  type: STORY_ACTIONS.DUPLICATE_SCENE,
  sceneId,
  at,
});

export const deleteScene = (sceneId, at) => ({
  type: STORY_ACTIONS.DELETE_SCENE,
  sceneId,
  at,
});

export const moveScene = (sceneId, direction, at) => ({
  type: STORY_ACTIONS.MOVE_SCENE,
  sceneId,
  direction,
  at,
});

export const moveSceneUp = (sceneId, at) => ({
  type: STORY_ACTIONS.MOVE_SCENE_UP,
  sceneId,
  at,
});

export const moveSceneDown = (sceneId, at) => ({
  type: STORY_ACTIONS.MOVE_SCENE_DOWN,
  sceneId,
  at,
});

export const setTitle = (title, at) => ({
  type: STORY_ACTIONS.SET_TITLE,
  title,
  at,
});

export const setSceneBackground = (sceneId, background, at) => ({
  type: STORY_ACTIONS.SET_SCENE_BACKGROUND,
  sceneId,
  background,
  at,
});

export const setSceneNarration = (sceneId, narration, at) => ({
  type: STORY_ACTIONS.SET_SCENE_NARRATION,
  sceneId,
  narration,
  at,
});

export const addCharacter = ({ sceneId, characterId, slot, expression, facing, at }) => ({
  type: STORY_ACTIONS.ADD_CHARACTER,
  sceneId,
  characterId,
  slot,
  expression,
  facing,
  at,
});

export const updateCharacter = (sceneId, characterPlacementId, patch, at) => ({
  type: STORY_ACTIONS.UPDATE_CHARACTER,
  sceneId,
  characterPlacementId,
  patch,
  at,
});

export const removeCharacter = (sceneId, characterPlacementId, at) => ({
  type: STORY_ACTIONS.REMOVE_CHARACTER,
  sceneId,
  characterPlacementId,
  at,
});

export const addDialogueLine = ({ sceneId, speakerId, text, type = "speech", dialogueType, bubbleType, insertAfterId, at } = {}) => ({
  type: STORY_ACTIONS.ADD_DIALOGUE_LINE,
  sceneId,
  speakerId,
  text,
  dialogueType: dialogueType || bubbleType || type,
  insertAfterId,
  at,
});

export const updateDialogueLine = (sceneId, dialogueId, patch, at) => ({
  type: STORY_ACTIONS.UPDATE_DIALOGUE_LINE,
  sceneId,
  dialogueId,
  patch,
  at,
});

export const removeDialogueLine = (sceneId, dialogueId, at) => ({
  type: STORY_ACTIONS.REMOVE_DIALOGUE_LINE,
  sceneId,
  dialogueId,
  at,
});

export const moveDialogueLine = (sceneId, dialogueId, direction, at) => ({
  type: STORY_ACTIONS.MOVE_DIALOGUE_LINE,
  sceneId,
  dialogueId,
  direction,
  at,
});

export const toggleProp = (sceneId, propId, at) => ({
  type: STORY_ACTIONS.TOGGLE_PROP,
  sceneId,
  propId,
  at,
});

export const addChoice = ({ sceneId, text = "Next step", targetSceneId, at } = {}) => ({
  type: STORY_ACTIONS.ADD_CHOICE,
  sceneId,
  text,
  targetSceneId,
  at,
});

export const updateChoice = (sceneId, choiceId, patch, at) => ({
  type: STORY_ACTIONS.UPDATE_CHOICE,
  sceneId,
  choiceId,
  patch,
  at,
});

export const removeChoice = (sceneId, choiceId, at) => ({
  type: STORY_ACTIONS.REMOVE_CHOICE,
  sceneId,
  choiceId,
  at,
});

export const moveChoice = (sceneId, choiceId, direction, at) => ({
  type: STORY_ACTIONS.MOVE_CHOICE,
  sceneId,
  choiceId,
  direction,
  at,
});

export const setSceneIsEnding = (sceneId, isEnding, at) => ({
  type: STORY_ACTIONS.SET_SCENE_IS_ENDING,
  sceneId,
  isEnding,
  at,
});

export const setCharacterVoice = (characterId, voice, at) => ({
  type: STORY_ACTIONS.SET_CHARACTER_VOICE,
  characterId,
  voice,
  at,
});

export const undoStory = () => ({ type: STORY_ACTIONS.UNDO });
export const redoStory = () => ({ type: STORY_ACTIONS.REDO });
export const resetStory = (story) => ({ type: STORY_ACTIONS.RESET, story });
export const dismissNotice = (id) => ({ type: STORY_ACTIONS.DISMISS_NOTICE, id });

// ---- Selectors ---------------------------------------------------------------
export const selectStory = (state) => state.history.present;
export const selectSelectedSceneId = (state) => state.selectedSceneId;
export const selectScenes = (state) => state.history.present.scenes;
export const selectCanUndo = (state) => canUndo(state.history);
export const selectCanRedo = (state) => canRedo(state.history);
export const selectNotice = (state) => state.notice;
export const selectSceneCount = (state) => state.history.present.scenes.length;
export const selectCanAddScene = (state) =>
  state.history.present.scenes.length < STORY_LIMITS.MAX_SCENES;
export const selectCanDeleteScene = (state) =>
  state.history.present.scenes.length > STORY_LIMITS.MIN_SCENES;

export const selectSelectedScene = (state) => {
  const scenes = state.history.present.scenes;
  const found = scenes.find((s) => s.id === state.selectedSceneId);
  return found ?? scenes[0] ?? null;
};

export const selectSelectedSceneIndex = (state) => {
  const scenes = state.history.present.scenes;
  const idx = scenes.findIndex((s) => s.id === state.selectedSceneId);
  return idx !== -1 ? idx : 0;
};

export const selectCharacterVoices = (state) =>
  state?.history?.present?.settings?.characterVoices || {};

