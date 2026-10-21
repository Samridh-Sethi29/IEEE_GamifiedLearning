/**
 * Authoritative Story Studio schema, constants, and document factories (S1.1).
 * Pure JavaScript: zero React, zero DOM, zero external dependencies.
 *
 * Story documents are multi-scene, narrative-driven comic/storybook projects,
 * completely decoupled from the 2D CAD canvas / single-object placement model.
 */

export const STORY_SCHEMA_VERSION = 1;
export const SUPPORTED_STORY_SCHEMA_VERSIONS = Object.freeze([1]);
export const STORY_PROJECT_TYPE = "story-studio";
export const SUPPORTED_STORY_PROJECT_TYPES = Object.freeze(["story-studio", "story"]);
export const STORY_STORAGE_KEY = "skillverse_story_studio_doc_v1";
export const STORY_BACKUP_STORAGE_KEY = "skillverse_story_studio_doc_v1__backup";
export const LEGACY_STORY_STORAGE_KEY = "sb_story_v1";

export const STORY_LIMITS = Object.freeze({
  MIN_SCENES: 1,
  MAX_SCENES: 12,
  MAX_CHARACTERS_PER_SCENE: 3,
  MAX_PROPS_PER_SCENE: 6,
  MAX_DIALOGUE_LINES_PER_SCENE: 20,
  MAX_CHOICES_PER_SCENE: 4,
  MAX_TITLE_LENGTH: 80,
  MAX_AUTHOR_LENGTH: 50,
  MAX_SCENE_NAME_LENGTH: 50,
  MAX_NARRATION_LENGTH: 400,
  MAX_DIALOGUE_TEXT_LENGTH: 200,
  MAX_CHOICE_TEXT_LENGTH: 100,
});

export const CHARACTER_SLOTS = Object.freeze(["left", "center", "right"]);
export const CHARACTER_FACING = Object.freeze(["left", "right"]);
export const CHARACTER_EXPRESSIONS = Object.freeze([
  "happy",
  "thoughtful",
  "surprised",
  "worried",
  "determined",
]);

export const DIALOGUE_TYPES = Object.freeze(["speech", "thought", "shout"]);

export const STORY_BACKGROUNDS = Object.freeze({
  "village-square": {
    id: "village-square",
    label: "Village Square",
    description: "The lively open square with cobblestones, houses, and the village fountain.",
    theme: "outdoors",
  },
  "school-classroom": {
    id: "school-classroom",
    label: "School Classroom",
    description: "A bright classroom with chalkboards, desks, and books.",
    theme: "indoors",
  },
  "farm-field": {
    id: "farm-field",
    label: "Farm Field",
    description: "Sunlit crop fields, windmill, and irrigation channels.",
    theme: "outdoors",
  },
  "water-well": {
    id: "water-well",
    label: "Water Well",
    description: "The historic stone well where villagers meet to draw fresh water.",
    theme: "outdoors",
  },
  "cozy-cottage": {
    id: "cozy-cottage",
    label: "Cozy Cottage",
    description: "A warm village home interior with hearth, wooden table, and shelves.",
    theme: "indoors",
  },
  "starry-night": {
    id: "starry-night",
    label: "Starry Night",
    description: "A quiet moonlit evening with glowing stars over the village rooftops.",
    theme: "night",
  },
});

export const STORY_BACKGROUND_IDS = Object.freeze(Object.keys(STORY_BACKGROUNDS));

export const STORY_CHARACTERS = Object.freeze({
  maya: {
    id: "maya",
    name: "Maya",
    role: "Curious Explorer",
    defaultFacing: "right",
  },
  tariq: {
    id: "tariq",
    name: "Tariq",
    role: "Young Farmer",
    defaultFacing: "left",
  },
  "elder-samira": {
    id: "elder-samira",
    name: "Elder Samira",
    role: "Village Elder & Historian",
    defaultFacing: "right",
  },
  "dr-leo": {
    id: "dr-leo",
    name: "Dr. Leo",
    role: "Tinkerer & Water Inventor",
    defaultFacing: "left",
  },
  pip: {
    id: "pip",
    name: "Pip",
    role: "Friendly Village Cat",
    defaultFacing: "right",
  },
});

export const STORY_CHARACTER_IDS = Object.freeze(Object.keys(STORY_CHARACTERS));

export const STORY_PROPS = Object.freeze({
  "water-bucket": {
    id: "water-bucket",
    label: "Water Bucket",
  },
  "ancient-book": {
    id: "ancient-book",
    label: "Storybook",
  },
  "harvest-basket": {
    id: "harvest-basket",
    label: "Harvest Basket",
  },
  lantern: {
    id: "lantern",
    label: "Glowing Lantern",
  },
  "seed-packet": {
    id: "seed-packet",
    label: "Seed Packet",
  },
  "magnifying-glass": {
    id: "magnifying-glass",
    label: "Magnifying Glass",
  },
});

export const STORY_PROP_IDS = Object.freeze(Object.keys(STORY_PROPS));

let idCounter = 0;

export function createId(prefix = "id") {
  idCounter += 1;
  const rand =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${rand}`;
}

export const createStoryId = (prefix = "story") => createId(prefix);
export const createSceneId = (prefix = "scene") => createId(prefix);
export const createCharacterPlacementId = (prefix = "char") => createId(prefix);
export const createDialogueId = (prefix = "diag") => createId(prefix);
export const createChoiceId = (prefix = "choice") => createId(prefix);

/**
 * Creates a valid character placement on stage.
 */
export function createCharacterPlacement({
  id = createCharacterPlacementId(),
  characterId = "maya",
  slot = "left",
  expression = "happy",
  facing = "right",
  voiceURI,
} = {}) {
  const placement = {
    id: String(id),
    characterId: String(characterId),
    slot: String(slot),
    expression: String(expression),
    facing: String(facing),
  };
  if (typeof voiceURI === "string" && voiceURI.trim() !== "") {
    placement.voiceURI = voiceURI;
  }
  return placement;
}

/**
 * Creates a valid dialogue line for a scene.
 */
export function createDialogueLine({
  id = createDialogueId(),
  speakerId = "narrator",
  text = "",
  type = "speech",
} = {}) {
  return {
    id: String(id),
    speakerId: String(speakerId),
    text: String(text),
    type: String(type),
  };
}

/**
 * Creates a choice item for future branching support.
 */
export function createChoiceItem({
  id = createChoiceId(),
  text = "",
  targetSceneId = "",
} = {}) {
  return {
    id: String(id),
    text: String(text),
    targetSceneId: String(targetSceneId),
  };
}

/**
 * Creates a single default scene.
 */
export function createDefaultScene({
  id = createSceneId(),
  name = "Scene 1",
  background = "village-square",
  narration = "",
  characters = [],
  props = [],
  dialogue = [],
  choices = [],
  isEnding,
} = {}) {
  const scene = {
    id: String(id),
    name: String(name),
    background: String(background),
    narration: String(narration),
    characters: characters.map((c) => createCharacterPlacement(c)),
    props: [...props],
    dialogue: dialogue.map((d) => createDialogueLine(d)),
    choices: choices.map((ch) => createChoiceItem(ch)),
  };
  if (typeof isEnding === "boolean") {
    scene.isEnding = isEnding;
  }
  return scene;
}

/**
 * Creates a clean default Story Studio document.
 */
export function createStoryDocument({
  id = createStoryId(),
  title = "Untitled Story",
  author = "Explorer",
  scenes = null,
  settings = {},
  metadata = {},
  now = new Date().toISOString(),
} = {}) {
  const defaultScenes = [
    createDefaultScene({
      name: "Scene 1: The Beginning",
      background: "village-square",
      narration: "A brand new story begins in the village square.",
      characters: [
        createCharacterPlacement({
          characterId: "maya",
          slot: "left",
          expression: "happy",
          facing: "right",
        }),
      ],
      dialogue: [
        createDialogueLine({
          speakerId: "maya",
          text: "What a beautiful day to explore the village!",
          type: "speech",
        }),
      ],
    }),
  ];

  return {
    id: String(id),
    schemaVersion: STORY_SCHEMA_VERSION,
    type: STORY_PROJECT_TYPE,
    title: String(title),
    author: String(author),
    createdAt: now,
    modifiedAt: now,
    scenes: (scenes ?? defaultScenes).map((s) => createDefaultScene(s)),
    settings: {
      aspectRatio: "16:9",
      theme: "classic",
      ...settings,
    },
    metadata: { ...metadata },
  };
}

/**
 * Creates an illustrative 2-scene starter story showing dialogue, expressions, and settings.
 */
export function createSampleStoryDocument() {
  const scene1Id = createSceneId();
  const scene2Id = createSceneId();

  return createStoryDocument({
    title: "The Mystery of the Quiet Well",
    author: "Village Storyteller",
    scenes: [
      createDefaultScene({
        id: scene1Id,
        name: "Morning at the Fountain",
        background: "village-square",
        narration: "The morning sun was rising, and Maya noticed the fountain was unusually quiet.",
        characters: [
          createCharacterPlacement({
            characterId: "maya",
            slot: "left",
            expression: "thoughtful",
            facing: "right",
          }),
          createCharacterPlacement({
            characterId: "tariq",
            slot: "right",
            expression: "surprised",
            facing: "left",
          }),
        ],
        props: ["water-bucket"],
        dialogue: [
          createDialogueLine({
            speakerId: "maya",
            text: "Tariq, do you hear that? The water isn't flowing from the well!",
            type: "speech",
          }),
          createDialogueLine({
            speakerId: "tariq",
            text: "Oh no! We should go check the village well right away.",
            type: "speech",
          }),
        ],
      }),
      createDefaultScene({
        id: scene2Id,
        name: "Investigating the Well",
        background: "water-well",
        narration: "Together, Maya and Tariq hurried down the stone path to inspect the pump.",
        characters: [
          createCharacterPlacement({
            characterId: "maya",
            slot: "left",
            expression: "determined",
            facing: "right",
          }),
          createCharacterPlacement({
            characterId: "dr-leo",
            slot: "center",
            expression: "happy",
            facing: "left",
          }),
        ],
        props: ["lantern", "magnifying-glass"],
        dialogue: [
          createDialogueLine({
            speakerId: "dr-leo",
            text: "Aha! Just a loose valve on the main tank. It only needs a quick turn!",
            type: "speech",
          }),
          createDialogueLine({
            speakerId: "maya",
            text: "Hooray! The village water is saved!",
            type: "shout",
          }),
        ],
      }),
    ],
  });
}
