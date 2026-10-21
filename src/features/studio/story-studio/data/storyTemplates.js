/**
 * Story Studio Starter Templates (S1.8).
 * Pure JavaScript: zero React, zero DOM, zero external dependencies.
 *
 * Provides a collection of four distinct, age-appropriate, beautifully illustrated starter stories:
 * 1. "The Mystery of the Missing Water Bucket" (Mystery / Adventure)
 * 2. "A Friendship Mix-Up" (Social / Emotional Growth)
 * 3. "The Tiny Robot's Big Idea" (STEAM / Invention)
 * 4. "A Journey Under the Stars" (History / Discovery)
 *
 * All templates conform strictly to the Story Studio schema (S1.1).
 * Instantiating a template generates fresh unique IDs for the document, every scene,
 * every character placement, and every dialogue line.
 */

import {
  STORY_SCHEMA_VERSION,
  STORY_PROJECT_TYPE,
  createCharacterPlacement,
  createCharacterPlacementId,
  createChoiceId,
  createDefaultScene,
  createDialogueId,
  createDialogueLine,
  createSceneId,
  createStoryDocument,
  createStoryId,
} from "../engine/storySchema.js";
import { validateStoryDocument } from "../engine/storyValidation.js";

export const STARTER_TEMPLATES = Object.freeze([
  {
    id: "template-missing-bucket",
    title: "The Mystery of the Missing Water Bucket",
    premise:
      "When Tariq's wooden bucket vanishes right before morning chores, Maya and Pip follow a curious trail of wet footprints across the village square to solve the puzzle.",
    category: "Mystery",
    author: "SkillVerse Storyteller",
    sceneCount: 3,
    featuredCharacters: ["maya", "tariq", "pip"],
    firstSceneBackground: "village-square",
    scenes: [
      {
        name: "Morning at the Fountain",
        background: "village-square",
        narration:
          "The morning sun warms the cobblestones as Tariq rushes over to the village fountain with an empty puzzled look.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "thoughtful",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "center",
            expression: "worried",
            facing: "left",
          },
          {
            characterId: "pip",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["magnifying-glass"],
        dialogue: [
          {
            speakerId: "tariq",
            text: "Maya! My oak water bucket is gone. The crops need watering before noon!",
            type: "shout",
          },
          {
            speakerId: "maya",
            text: "Don't panic! Look closely at the cobblestones... do you see those wet splashes?",
            type: "speech",
          },
          {
            speakerId: "pip",
            text: "Meow! *swishes tail and trots towards the farm path*",
            type: "thought",
          },
        ],
      },
      {
        name: "Tracking Through the Fields",
        background: "farm-field",
        narration:
          "Following the damp trail past the windmill, the friends spot something bobbing gently near the irrigation gate.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "determined",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "right",
            expression: "surprised",
            facing: "left",
          },
        ],
        props: ["harvest-basket"],
        dialogue: [
          {
            speakerId: "maya",
            text: "Look over there near the tomato vines! The gate opened during the breeze.",
            type: "speech",
          },
          {
            speakerId: "tariq",
            text: "Aha! The bucket caught the overflow water and saved the seedlings from drying out!",
            type: "speech",
          },
        ],
      },
      {
        name: "Safe at the Stone Well",
        background: "water-well",
        narration:
          "With the bucket safely recovered and full of fresh spring water, Tariq and Maya celebrate a job well done.",
        characters: [
          {
            characterId: "tariq",
            slot: "left",
            expression: "happy",
            facing: "right",
          },
          {
            characterId: "maya",
            slot: "center",
            expression: "happy",
            facing: "left",
          },
          {
            characterId: "pip",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["water-bucket"],
        dialogue: [
          {
            speakerId: "tariq",
            text: "Thank you, detective Maya! Teamwork solved our morning mystery in record time.",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "Anytime, Tariq! Ready to help water the orchard together?",
            type: "speech",
          },
          {
            speakerId: "pip",
            text: "Purrr! *rubs gently against the wooden bucket*",
            type: "thought",
          },
        ],
      },
    ],
  },
  {
    id: "template-friendship-mixup",
    title: "A Friendship Mix-Up",
    premise:
      "A borrowed science chart gets accidentally swapped on project day, teaching Maya and Tariq how patient listening can turn a misunderstanding into a stronger bond.",
    category: "Friendship",
    author: "SkillVerse Storyteller",
    sceneCount: 3,
    featuredCharacters: ["maya", "tariq", "elder-samira"],
    firstSceneBackground: "school-classroom",
    scenes: [
      {
        name: "The Missing Notes",
        background: "school-classroom",
        narration:
          "The classroom chalkboard is filled with colorful diagrams, but Maya cannot find her finished garden presentation notes.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "worried",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "right",
            expression: "thoughtful",
            facing: "left",
          },
        ],
        props: ["ancient-book"],
        dialogue: [
          {
            speakerId: "maya",
            text: "Tariq, did you borrow my soil chart? I thought we agreed to leave it here on the desk.",
            type: "speech",
          },
          {
            speakerId: "tariq",
            text: "No, I brought my seed packet! But wait, our project folders look almost identical...",
            type: "speech",
          },
        ],
      },
      {
        name: "Wise Words from Elder Samira",
        background: "cozy-cottage",
        narration:
          "Seeking calm advice before presentation hour, the two friends visit Elder Samira at her study hearth.",
        characters: [
          {
            characterId: "elder-samira",
            slot: "left",
            expression: "thoughtful",
            facing: "right",
          },
          {
            characterId: "maya",
            slot: "center",
            expression: "thoughtful",
            facing: "left",
          },
          {
            characterId: "tariq",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["lantern", "ancient-book"],
        dialogue: [
          {
            speakerId: "elder-samira",
            text: "When words feel tangled, step back and look with kind eyes. Look underneath the book stack.",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "Oh! There both charts are, resting neatly together inside the study basket!",
            type: "speech",
          },
          {
            speakerId: "tariq",
            text: "I'm sorry I assumed, Maya. Let's combine our ideas into one super project!",
            type: "speech",
          },
        ],
      },
      {
        name: "Proud Presentation",
        background: "village-square",
        narration:
          "Under the bright village sunshine, the friends share their joint farming guide with cheering villagers.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "happy",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "center",
            expression: "happy",
            facing: "left",
          },
          {
            characterId: "elder-samira",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["seed-packet", "harvest-basket"],
        dialogue: [
          {
            speakerId: "maya",
            text: "Together we grew more than plants—we grew our friendship!",
            type: "shout",
          },
          {
            speakerId: "elder-samira",
            text: "Well spoken, young leaders. True cooperation always shines through.",
            type: "speech",
          },
        ],
      },
    ],
  },
  {
    id: "template-tiny-robot",
    title: "The Tiny Robot's Big Idea",
    premise:
      "Dr. Leo constructs a clockwork water-saving helper, and Maya tests its creative whistle sensor to keep the community garden lush and happy.",
    category: "Invention",
    author: "SkillVerse Storyteller",
    sceneCount: 3,
    featuredCharacters: ["dr-leo", "maya", "pip"],
    firstSceneBackground: "cozy-cottage",
    scenes: [
      {
        name: "Workshop Spark",
        background: "cozy-cottage",
        narration:
          "In Dr. Leo's cluttered workshop, miniature cogs click and steam hisses softly from a brass mechanism.",
        characters: [
          {
            characterId: "dr-leo",
            slot: "left",
            expression: "determined",
            facing: "right",
          },
          {
            characterId: "maya",
            slot: "center",
            expression: "surprised",
            facing: "left",
          },
          {
            characterId: "pip",
            slot: "right",
            expression: "thoughtful",
            facing: "left",
          },
        ],
        props: ["lantern", "magnifying-glass"],
        dialogue: [
          {
            speakerId: "dr-leo",
            text: "Behold, Maya! My micro-irrigation bot, 'Little Siphon'! It chirps when soil moisture drops.",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "That is brilliant Dr. Leo! Can it navigate between the delicate carrot tops?",
            type: "speech",
          },
        ],
      },
      {
        name: "Field Trial",
        background: "farm-field",
        narration:
          "Maya places Little Siphon carefully on the dry furrow while Pip watches with keen whiskers.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "thoughtful",
            facing: "right",
          },
          {
            characterId: "dr-leo",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["water-bucket"],
        dialogue: [
          {
            speakerId: "dr-leo",
            text: "Listen closely... chirp-chirp! The sensor detects dry roots and gently opens the valve!",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "It worked! Just enough water without wasting a single drop!",
            type: "shout",
          },
        ],
      },
      {
        name: "Celebration at the Well",
        background: "water-well",
        narration:
          "The village well gauge stays completely full thanks to their smart water-conserving innovation.",
        characters: [
          {
            characterId: "dr-leo",
            slot: "left",
            expression: "happy",
            facing: "right",
          },
          {
            characterId: "maya",
            slot: "center",
            expression: "happy",
            facing: "left",
          },
          {
            characterId: "pip",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["magnifying-glass", "lantern"],
        dialogue: [
          {
            speakerId: "dr-leo",
            text: "Engineering plus young curiosity makes the finest inventions imaginable!",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "Here's to saving every drop for tomorrow's harvest!",
            type: "speech",
          },
        ],
      },
    ],
  },
  {
    id: "template-journey-stars",
    title: "A Journey Under the Stars",
    premise:
      "On a crisp moonlit evening, Elder Samira leads Maya and Tariq up the hill to read the constellation map and uncover the legendary founding of SkillVerse.",
    category: "Adventure",
    author: "SkillVerse Storyteller",
    sceneCount: 3,
    featuredCharacters: ["elder-samira", "maya", "tariq"],
    firstSceneBackground: "starry-night",
    scenes: [
      {
        name: "Gathering by Starlight",
        background: "starry-night",
        narration:
          "The night sky sparkles with a thousand twinkling stars over the quiet village rooftops.",
        characters: [
          {
            characterId: "elder-samira",
            slot: "left",
            expression: "happy",
            facing: "right",
          },
          {
            characterId: "maya",
            slot: "center",
            expression: "thoughtful",
            facing: "left",
          },
          {
            characterId: "tariq",
            slot: "right",
            expression: "surprised",
            facing: "left",
          },
        ],
        props: ["lantern", "ancient-book"],
        dialogue: [
          {
            speakerId: "elder-samira",
            text: "Look up, young travelers. The constellation of the River Archer appears only once each autumn.",
            type: "speech",
          },
          {
            speakerId: "maya",
            text: "It points directly across the ridge toward the ancient fountain!",
            type: "speech",
          },
        ],
      },
      {
        name: "The Constellation Scroll",
        background: "cozy-cottage",
        narration:
          "Inside the warm hearth, Elder Samira unrolls a parchment showing how early settlers tracked seasonal rainfall.",
        characters: [
          {
            characterId: "elder-samira",
            slot: "left",
            expression: "thoughtful",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "right",
            expression: "thoughtful",
            facing: "left",
          },
        ],
        props: ["ancient-book", "lantern"],
        dialogue: [
          {
            speakerId: "tariq",
            text: "So the stars were an ancient calendar for planting and harvesting?",
            type: "speech",
          },
          {
            speakerId: "elder-samira",
            text: "Precisely. Science and storytelling have always walked side by side.",
            type: "speech",
          },
        ],
      },
      {
        name: "Morning Inspiration",
        background: "village-square",
        narration:
          "Dawn breaks softly as the three friends return to the square, full of wonder and ready for a new day of exploration.",
        characters: [
          {
            characterId: "maya",
            slot: "left",
            expression: "determined",
            facing: "right",
          },
          {
            characterId: "tariq",
            slot: "center",
            expression: "happy",
            facing: "right",
          },
          {
            characterId: "elder-samira",
            slot: "right",
            expression: "happy",
            facing: "left",
          },
        ],
        props: ["ancient-book"],
        dialogue: [
          {
            speakerId: "maya",
            text: "Now every time I look at the night sky, I'll remember our village's rich story!",
            type: "speech",
          },
          {
            speakerId: "tariq",
            text: "And tomorrow night, we can teach the younger explorers too!",
            type: "speech",
          },
        ],
      },
    ],
  },
]);

/**
 * Returns all starter template definitions.
 */
export function getAllTemplates() {
  return STARTER_TEMPLATES;
}

/**
 * Finds a starter template by ID.
 */
export function getTemplateById(templateId) {
  return STARTER_TEMPLATES.find((t) => t.id === templateId) || null;
}

/**
 * Instantiates a template into a brand-new, completely independent Story Document
 * with unique IDs for the document, each scene, character placement, and dialogue line.
 *
 * @param {string} templateId - ID of template to instantiate
 * @param {object} [overrides] - Optional overrides for title, author, etc.
 * @returns {object} Validated Story Studio document
 */
export function createTemplateStory(templateId, overrides = {}) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Starter template "${templateId}" was not found.`);
  }

  const now = new Date().toISOString();
  const storyId = createStoryId();

  // Map each scene to a new Scene with fresh IDs
  const scenes = template.scenes.map((sceneData, sIdx) => {
    const sceneId = createSceneId();

    const characters = (sceneData.characters || []).map((c) =>
      createCharacterPlacement({
        id: createCharacterPlacementId(),
        characterId: c.characterId,
        slot: c.slot,
        expression: c.expression,
        facing: c.facing,
      })
    );

    const dialogue = (sceneData.dialogue || []).map((d) =>
      createDialogueLine({
        id: createDialogueId(),
        speakerId: d.speakerId,
        text: d.text,
        type: d.type || "speech",
      })
    );

    return createDefaultScene({
      id: sceneId,
      name: sceneData.name || `Scene ${sIdx + 1}`,
      background: sceneData.background || "village-square",
      narration: sceneData.narration || "",
      characters,
      props: [...(sceneData.props || [])],
      dialogue,
      choices: [],
    });
  });

  const storyDoc = createStoryDocument({
    id: storyId,
    title: overrides.title || template.title,
    author: overrides.author || template.author || "Explorer",
    scenes,
    metadata: {
      templateId: template.id,
      templateCategory: template.category,
      ...(overrides.metadata || {}),
    },
    now,
  });

  const validation = validateStoryDocument(storyDoc);
  if (!validation.ok) {
    throw new Error(
      `Failed to instantiate template "${templateId}": ${validation.errors.join("; ")}`
    );
  }

  return storyDoc;
}
