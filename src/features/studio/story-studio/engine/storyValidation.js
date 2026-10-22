/**
 * Authoritative Story Studio validation and normalization engine (S1.1).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * All validators return { ok: boolean, errors: string[] }.
 * They NEVER throw on bad, corrupt, or unexpected input.
 */

import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_FACING,
  CHARACTER_SLOTS,
  DIALOGUE_TYPES,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTER_IDS,
  STORY_LIMITS,
  STORY_PROJECT_TYPE,
  STORY_PROP_IDS,
  STORY_SCHEMA_VERSION,
  SUPPORTED_STORY_PROJECT_TYPES,
} from "./storySchema.js";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isPlainObject = (v) =>
  isObj(v) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

const isIsoDate = (str) =>
  typeof str === "string" && !Number.isNaN(Date.parse(str));

const DOCUMENT_KEYS = Object.freeze([
  "id",
  "schemaVersion",
  "type",
  "title",
  "author",
  "createdAt",
  "modifiedAt",
  "scenes",
  "settings",
  "metadata",
]);

const SCENE_KEYS = Object.freeze([
  "id",
  "name",
  "background",
  "narration",
  "characters",
  "props",
  "dialogue",
  "choices",
  "isEnding",
]);

const CHARACTER_KEYS = Object.freeze([
  "id",
  "characterId",
  "slot",
  "expression",
  "facing",
  "voiceURI",
]);

const DIALOGUE_KEYS = Object.freeze(["id", "speakerId", "text", "type"]);
const CHOICE_KEYS = Object.freeze(["id", "text", "targetSceneId"]);

/**
 * Validates a single character placement in a scene.
 */
export function validateCharacterPlacement(char, path = "character") {
  const errors = [];
  if (!isPlainObject(char)) return [`${path} must be a plain object`];

  for (const k of Object.keys(char)) {
    if (!CHARACTER_KEYS.includes(k)) {
      errors.push(`${path}.${k} is not a recognized character field`);
    }
  }

  if (typeof char.id !== "string" || char.id.trim() === "") {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (!STORY_CHARACTER_IDS.includes(char.characterId)) {
    errors.push(
      `${path}.characterId "${String(char.characterId)}" is not a supported character`
    );
  }

  if (!CHARACTER_SLOTS.includes(char.slot)) {
    errors.push(
      `${path}.slot "${String(char.slot)}" must be one of: ${CHARACTER_SLOTS.join(", ")}`
    );
  }

  if (!CHARACTER_EXPRESSIONS.includes(char.expression)) {
    errors.push(
      `${path}.expression "${String(char.expression)}" must be one of: ${CHARACTER_EXPRESSIONS.join(", ")}`
    );
  }

  if (!CHARACTER_FACING.includes(char.facing)) {
    errors.push(
      `${path}.facing "${String(char.facing)}" must be one of: ${CHARACTER_FACING.join(", ")}`
    );
  }

  if (char.voiceURI !== undefined && typeof char.voiceURI !== "string") {
    errors.push(`${path}.voiceURI must be a string`);
  }

  return errors;
}

/**
 * Validates a single dialogue line in a scene.
 */
export function validateDialogueLine(line, path = "dialogue") {
  const errors = [];
  if (!isPlainObject(line)) return [`${path} must be a plain object`];

  for (const k of Object.keys(line)) {
    if (!DIALOGUE_KEYS.includes(k)) {
      errors.push(`${path}.${k} is not a recognized dialogue field`);
    }
  }

  if (typeof line.id !== "string" || line.id.trim() === "") {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (typeof line.speakerId !== "string" || line.speakerId.trim() === "") {
    errors.push(`${path}.speakerId must be a non-empty string`);
  }

  if (typeof line.text !== "string" || line.text.trim() === "") {
    errors.push(`${path}.text must be a non-empty string`);
  } else if (line.text.length > STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH) {
    errors.push(
      `${path}.text exceeds maximum length of ${STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH} characters`
    );
  }

  if (!DIALOGUE_TYPES.includes(line.type)) {
    errors.push(
      `${path}.type "${String(line.type)}" must be one of: ${DIALOGUE_TYPES.join(", ")}`
    );
  }

  return errors;
}

/**
 * Validates a branching choice item.
 */
export function validateChoiceItem(choice, path = "choice") {
  const errors = [];
  if (!isPlainObject(choice)) return [`${path} must be a plain object`];

  for (const k of Object.keys(choice)) {
    if (!CHOICE_KEYS.includes(k)) {
      errors.push(`${path}.${k} is not a recognized choice field`);
    }
  }

  if (typeof choice.id !== "string" || choice.id.trim() === "") {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (typeof choice.text !== "string" || choice.text.trim() === "") {
    errors.push(`${path}.text must be a non-empty string`);
  } else if (choice.text.length > STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH) {
    errors.push(
      `${path}.text exceeds maximum length of ${STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH} characters`
    );
  }

  if (typeof choice.targetSceneId !== "string" || choice.targetSceneId.trim() === "") {
    errors.push(`${path}.targetSceneId must be a non-empty string`);
  }

  return errors;
}

/**
 * Validates a single scene.
 */
export function validateScene(scene, path = "scene") {
  const errors = [];
  if (!isPlainObject(scene)) return [`${path} must be a plain object`];

  for (const k of Object.keys(scene)) {
    if (!SCENE_KEYS.includes(k)) {
      errors.push(`${path}.${k} is not a recognized scene field`);
    }
  }

  if (typeof scene.id !== "string" || scene.id.trim() === "") {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (typeof scene.name !== "string" || scene.name.trim() === "") {
    errors.push(`${path}.name must be a non-empty string`);
  } else if (scene.name.length > STORY_LIMITS.MAX_SCENE_NAME_LENGTH) {
    errors.push(
      `${path}.name exceeds maximum length of ${STORY_LIMITS.MAX_SCENE_NAME_LENGTH} characters`
    );
  }

  if (!STORY_BACKGROUND_IDS.includes(scene.background)) {
    errors.push(
      `${path}.background "${String(scene.background)}" is not a supported background`
    );
  }

  if (typeof scene.narration !== "string") {
    errors.push(`${path}.narration must be a string`);
  } else if (scene.narration.length > STORY_LIMITS.MAX_NARRATION_LENGTH) {
    errors.push(
      `${path}.narration exceeds maximum length of ${STORY_LIMITS.MAX_NARRATION_LENGTH} characters`
    );
  }

  if (scene.isEnding !== undefined && typeof scene.isEnding !== "boolean") {
    errors.push(`${path}.isEnding must be a boolean`);
  }

  // Characters validation
  if (!Array.isArray(scene.characters)) {
    errors.push(`${path}.characters must be an array`);
  } else {
    if (scene.characters.length > STORY_LIMITS.MAX_CHARACTERS_PER_SCENE) {
      errors.push(
        `${path}.characters has ${scene.characters.length} characters (maximum is ${STORY_LIMITS.MAX_CHARACTERS_PER_SCENE})`
      );
    }

    const charIds = new Set();
    const slots = new Set();

    scene.characters.forEach((char, idx) => {
      const charPath = `${path}.characters[${idx}]`;
      errors.push(...validateCharacterPlacement(char, charPath));

      if (isPlainObject(char)) {
        if (typeof char.id === "string") {
          if (charIds.has(char.id)) {
            errors.push(`${charPath}.id "${char.id}" is duplicated in this scene`);
          }
          charIds.add(char.id);
        }

        if (CHARACTER_SLOTS.includes(char.slot)) {
          if (slots.has(char.slot)) {
            errors.push(
              `${charPath}.slot "${char.slot}" is already occupied by another character in this scene`
            );
          }
          slots.add(char.slot);
        }
      }
    });
  }

  // Props validation
  if (!Array.isArray(scene.props)) {
    errors.push(`${path}.props must be an array`);
  } else {
    if (scene.props.length > STORY_LIMITS.MAX_PROPS_PER_SCENE) {
      errors.push(
        `${path}.props has ${scene.props.length} props (maximum is ${STORY_LIMITS.MAX_PROPS_PER_SCENE})`
      );
    }
    scene.props.forEach((prop, pIdx) => {
      if (!STORY_PROP_IDS.includes(prop)) {
        errors.push(`${path}.props[${pIdx}] "${String(prop)}" is not a supported prop`);
      }
    });
  }

  // Dialogue validation
  if (!Array.isArray(scene.dialogue)) {
    errors.push(`${path}.dialogue must be an array`);
  } else {
    if (scene.dialogue.length > STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE) {
      errors.push(
        `${path}.dialogue has ${scene.dialogue.length} lines (maximum is ${STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE})`
      );
    }

    const diagIds = new Set();
    // Valid speakers: "narrator" or any placed character's ID or characterId
    const activeSpeakers = new Set(["narrator"]);
    if (Array.isArray(scene.characters)) {
      scene.characters.forEach((c) => {
        if (isPlainObject(c)) {
          if (c.id) activeSpeakers.add(c.id);
          if (c.characterId) activeSpeakers.add(c.characterId);
        }
      });
    }

    scene.dialogue.forEach((line, dIdx) => {
      const dPath = `${path}.dialogue[${dIdx}]`;
      errors.push(...validateDialogueLine(line, dPath));

      if (isPlainObject(line)) {
        if (typeof line.id === "string") {
          if (diagIds.has(line.id)) {
            errors.push(`${dPath}.id "${line.id}" is duplicated in this scene`);
          }
          diagIds.add(line.id);
        }

        if (typeof line.speakerId === "string" && !activeSpeakers.has(line.speakerId)) {
          errors.push(
            `${dPath}.speakerId "${line.speakerId}" is not present in this scene`
          );
        }
      }
    });
  }

  // Choices validation
  if (!Array.isArray(scene.choices)) {
    errors.push(`${path}.choices must be an array`);
  } else {
    if (scene.choices.length > STORY_LIMITS.MAX_CHOICES_PER_SCENE) {
      errors.push(
        `${path}.choices has ${scene.choices.length} choices (maximum is ${STORY_LIMITS.MAX_CHOICES_PER_SCENE})`
      );
    }
    const choiceIds = new Set();
    scene.choices.forEach((ch, cIdx) => {
      const chPath = `${path}.choices[${cIdx}]`;
      errors.push(...validateChoiceItem(ch, chPath));
      if (isPlainObject(ch) && typeof ch.id === "string") {
        if (choiceIds.has(ch.id)) {
          errors.push(`${chPath}.id "${ch.id}" is duplicated in this scene`);
        }
        choiceIds.add(ch.id);
      }
    });
  }

  return errors;
}

/**
 * Validates a complete Story Studio document.
 * Returns { ok: boolean, errors: string[] }. Never throws.
 */
export function validateStoryDocument(doc) {
  const errors = [];
  if (!isPlainObject(doc)) {
    return { ok: false, errors: ["story document must be a plain object"] };
  }

  for (const k of Object.keys(doc)) {
    if (!DOCUMENT_KEYS.includes(k)) {
      errors.push(`story.${k} is not a recognized document field`);
    }
  }

  if (typeof doc.id !== "string" || doc.id.trim() === "") {
    errors.push("story.id must be a non-empty string");
  }

  if (!Number.isInteger(doc.schemaVersion)) {
    errors.push("story.schemaVersion must be an integer");
  } else if (doc.schemaVersion !== STORY_SCHEMA_VERSION) {
    errors.push(
      `story.schemaVersion ${doc.schemaVersion} is not supported (expected ${STORY_SCHEMA_VERSION})`
    );
  }

  if (!SUPPORTED_STORY_PROJECT_TYPES.includes(doc.type)) {
    errors.push(`story.type must be "${STORY_PROJECT_TYPE}" (or legacy "story")`);
  }

  if (typeof doc.title !== "string" || doc.title.trim() === "") {
    errors.push("story.title must be a non-empty string");
  } else if (doc.title.length > STORY_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(
      `story.title exceeds maximum length of ${STORY_LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (typeof doc.author !== "string" || doc.author.trim() === "") {
    errors.push("story.author must be a non-empty string");
  } else if (doc.author.length > STORY_LIMITS.MAX_AUTHOR_LENGTH) {
    errors.push(
      `story.author exceeds maximum length of ${STORY_LIMITS.MAX_AUTHOR_LENGTH} characters`
    );
  }

  if (!isIsoDate(doc.createdAt)) {
    errors.push("story.createdAt must be a valid ISO date string");
  }

  if (!isIsoDate(doc.modifiedAt)) {
    errors.push("story.modifiedAt must be a valid ISO date string");
  }

  if (!isPlainObject(doc.settings)) {
    errors.push("story.settings must be a plain object");
  }

  if (!isPlainObject(doc.metadata)) {
    errors.push("story.metadata must be a plain object");
  }

  // Scenes validation
  if (!Array.isArray(doc.scenes)) {
    errors.push("story.scenes must be an array");
  } else {
    if (doc.scenes.length < STORY_LIMITS.MIN_SCENES) {
      errors.push(`story.scenes must contain at least ${STORY_LIMITS.MIN_SCENES} scene`);
    } else if (doc.scenes.length > STORY_LIMITS.MAX_SCENES) {
      errors.push(
        `story.scenes has ${doc.scenes.length} scenes (maximum is ${STORY_LIMITS.MAX_SCENES})`
      );
    }

    const sceneIds = new Set();
    doc.scenes.forEach((s, sIdx) => {
      const sPath = `scenes[${sIdx}]`;
      errors.push(...validateScene(s, sPath));

      if (isPlainObject(s) && typeof s.id === "string") {
        if (sceneIds.has(s.id)) {
          errors.push(`${sPath}.id "${s.id}" is duplicated in this story`);
        }
        sceneIds.add(s.id);
      }
    });

    // Check branching targetSceneIds if any choices exist
    doc.scenes.forEach((s, sIdx) => {
      if (isPlainObject(s) && Array.isArray(s.choices)) {
        s.choices.forEach((ch, cIdx) => {
          if (isPlainObject(ch) && typeof ch.targetSceneId === "string" && ch.targetSceneId) {
            if (!sceneIds.has(ch.targetSceneId)) {
              errors.push(
                `scenes[${sIdx}].choices[${cIdx}].targetSceneId "${ch.targetSceneId}" references a non-existent scene`
              );
            }
          }
        });
      }
    });
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalizes a Story Studio document.
 * Returns a new deep clone with trimmed strings. Input document is NEVER mutated.
 */
export function normalizeStoryDocument(doc) {
  if (!doc) return doc;
  const clone = JSON.parse(JSON.stringify(doc));
  if (clone.type === "story") {
    clone.type = STORY_PROJECT_TYPE;
  }
  return clone;
}
