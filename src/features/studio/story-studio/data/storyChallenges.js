/**
 * Story Studio Challenge Catalogue (C1).
 * Pure JavaScript: zero React, zero DOM, zero external dependencies.
 *
 * Centralized, authoritative catalogue of the five progressive Story Studio challenges.
 * Contains stable IDs, titles, descriptions, difficulty tiers, prerequisites,
 * ordered objectives with evaluation targets, rewards, and starter story generators.
 */

import {
  createCharacterPlacement,
  createDefaultScene,
  createDialogueLine,
  createSceneId,
  createStoryDocument,
  createStoryId,
} from "../engine/storySchema.js";

export const CHALLENGE_IDS = Object.freeze({
  STORY_BEGINS: "story-begins",
  CHARACTERS_LIFE: "characters-life",
  BUILD_WORLD: "build-world",
  BIG_DECISION: "big-decision",
  STORY_MASTER: "story-master",
});

export const CHALLENGE_ORDER = Object.freeze([
  CHALLENGE_IDS.STORY_BEGINS,
  CHALLENGE_IDS.CHARACTERS_LIFE,
  CHALLENGE_IDS.BUILD_WORLD,
  CHALLENGE_IDS.BIG_DECISION,
  CHALLENGE_IDS.STORY_MASTER,
]);

export const CHALLENGES = Object.freeze([
  {
    id: CHALLENGE_IDS.STORY_BEGINS,
    level: 1,
    title: "A Story Begins",
    subtitle: "Create your opening scene and introduce your tale",
    description:
      "Every storyteller starts with a single moment. Set the scene with narration, bring a character to the stage, and write their opening words.",
    difficulty: "Introductory",
    prerequisiteId: null,
    unlockRules: {
      type: "initial",
      description: "Available immediately to all explorers.",
    },
    badge: {
      id: "story_starter",
      name: "Story Starter",
      icon: "BookOpen",
      description: "Awarded for creating your first multi-scene story with narration, character, and dialogue.",
    },
    reward: {
      xp: 25,
      coins: 10,
      badge: "Story Starter",
      badgeId: "story_starter",
      flagKey: "challenge_story_studio_lvl1_completed",
      completedAtKey: "challenge_story_studio_lvl1_completed_at",
    },
    orderedObjectives: Object.freeze([
      {
        id: "scenes-count",
        label: "Create at least 2 scenes",
        description: "Build a story with at least two scenes to establish the beginning of your journey.",
        target: 2,
        unit: "scenes",
        hint: "Use the + Add Scene button in the Scene Navigator to add a second scene.",
      },
      {
        id: "narration",
        label: "Write meaningful narration",
        description: "Set the mood by writing at least 20 non-whitespace characters of narration in any scene.",
        target: 20,
        unit: "characters",
        hint: "Open the Scene Director on the right and type in the Scene Narration box.",
      },
      {
        id: "dialogue",
        label: "Add a line of dialogue",
        description: "Give a voice to your story with at least one dialogue line.",
        target: 1,
        unit: "lines",
        hint: "Click + Add Line in the Dialogue Lines section of the Scene Director.",
      },
      {
        id: "character-placed",
        label: "Place a character on stage",
        description: "Place at least one character in any scene to bring the scene to life.",
        target: 1,
        unit: "characters",
        hint: "Add a character (Maya, Tariq, Elder Samira, Dr. Leo, or Pip) to an open slot.",
      },
    ]),
  },
  {
    id: CHALLENGE_IDS.CHARACTERS_LIFE,
    level: 2,
    title: "Bring Characters to Life",
    subtitle: "Give life and emotion to multiple characters",
    description:
      "Stories thrive on relationships and conversations. Place two distinct characters on the stage, express their feelings with different expressions, and have both characters speak.",
    difficulty: "Beginner",
    prerequisiteId: CHALLENGE_IDS.STORY_BEGINS,
    unlockRules: {
      type: "prerequisite",
      prerequisiteId: CHALLENGE_IDS.STORY_BEGINS,
      description: "Unlocked after completing Level 1: A Story Begins.",
    },
    badge: {
      id: "character_crafter",
      name: "Character Crafter",
      icon: "Users",
      description: "Awarded for bringing multiple characters to life with distinct expressions and dialogue.",
    },
    reward: {
      xp: 40,
      coins: 15,
      badge: "Character Crafter",
      badgeId: "character_crafter",
      flagKey: "challenge_story_studio_lvl2_completed",
      completedAtKey: "challenge_story_studio_lvl2_completed_at",
    },
    orderedObjectives: Object.freeze([
      {
        id: "distinct-characters",
        label: "Place 2 distinct characters",
        description: "Include at least two distinct characters across your story.",
        target: 2,
        unit: "characters",
        hint: "Place two different characters (e.g. Maya and Tariq) in your scenes.",
      },
      {
        id: "character-dialogue",
        label: "Dialogue for 2 characters",
        description: "Write dialogue lines spoken by at least two distinct characters.",
        target: 2,
        unit: "speakers",
        hint: "Ensure both characters have at least one dialogue line with their name as the speaker.",
      },
      {
        id: "distinct-expressions",
        label: "Use 2 distinct expressions",
        description: "Show character emotions by using at least two different expressions.",
        target: 2,
        unit: "expressions",
        hint: "Select different expressions (like Happy, Thoughtful, Surprised, Worried, or Determined).",
      },
    ]),
  },
  {
    id: CHALLENGE_IDS.BUILD_WORLD,
    level: 3,
    title: "Build the World",
    subtitle: "Expand settings, atmospheres, and interactive props",
    description:
      "A vivid story transports readers across different places and moments. Craft a three-scene tale that visits multiple backgrounds and features props to enrich the environment.",
    difficulty: "Intermediate",
    prerequisiteId: CHALLENGE_IDS.CHARACTERS_LIFE,
    unlockRules: {
      type: "prerequisite",
      prerequisiteId: CHALLENGE_IDS.CHARACTERS_LIFE,
      description: "Unlocked after completing Level 2: Bring Characters to Life.",
    },
    badge: {
      id: "world_weaver",
      name: "World Weaver",
      icon: "Compass",
      description: "Awarded for constructing a rich world across multiple scenes, backgrounds, and props.",
    },
    reward: {
      xp: 60,
      coins: 20,
      badge: "World Weaver",
      badgeId: "world_weaver",
      flagKey: "challenge_story_studio_lvl3_completed",
      completedAtKey: "challenge_story_studio_lvl3_completed_at",
    },
    orderedObjectives: Object.freeze([
      {
        id: "scenes-count",
        label: "Create at least 3 scenes",
        description: "Expand your story world across at least three distinct scenes.",
        target: 3,
        unit: "scenes",
        hint: "Add scenes to reach at least 3 total scenes in your story.",
      },
      {
        id: "distinct-backgrounds",
        label: "Use 2 distinct backgrounds",
        description: "Take your story to at least two different locations.",
        target: 2,
        unit: "backgrounds",
        hint: "Change the background in one scene (e.g. Village Square and Water Well or Starry Night).",
      },
      {
        id: "props-placed",
        label: "Include 2 distinct props",
        description: "Add at least two different props across your scenes.",
        target: 2,
        unit: "props",
        hint: "Toggle on at least two different props (e.g. Water Bucket, Lantern, or Storybook).",
      },
    ]),
  },
  {
    id: CHALLENGE_IDS.BIG_DECISION,
    level: 4,
    title: "The Big Decision",
    subtitle: "Branch your story with meaningful choices and endings",
    description:
      "Interactive stories allow readers to shape their own destiny. Add a branching decision with multiple choices that split the narrative into separate paths leading to different endings.",
    difficulty: "Advanced",
    prerequisiteId: CHALLENGE_IDS.BUILD_WORLD,
    unlockRules: {
      type: "prerequisite",
      prerequisiteId: CHALLENGE_IDS.BUILD_WORLD,
      description: "Unlocked after completing Level 3: Build the World.",
    },
    badge: {
      id: "pathfinder",
      name: "Pathfinder",
      icon: "GitBranch",
      description: "Awarded for mastering branching narrative choices and multiple reachable endings.",
    },
    reward: {
      xp: 80,
      coins: 25,
      badge: "Pathfinder",
      badgeId: "pathfinder",
      flagKey: "challenge_story_studio_lvl4_completed",
      completedAtKey: "challenge_story_studio_lvl4_completed_at",
    },
    orderedObjectives: Object.freeze([
      {
        id: "branching-choice",
        label: "Add at least 2 choices to a scene",
        description: "Present a decision point in your story with at least two choices.",
        target: 2,
        unit: "choices",
        hint: "In the Scene Director's Branching Choices section, add at least two choice options.",
      },
      {
        id: "distinct-targets",
        label: "Choices lead to distinct scenes",
        description: "Ensure your choices branch out to at least two different existing target scenes.",
        target: 2,
        unit: "targets",
        hint: "Set each choice's destination to a different scene in your story.",
      },
      {
        id: "reachable-endings",
        label: "Reach at least 2 distinct endings",
        description: "Create branching pathways that lead readers to at least two reachable ending scenes.",
        target: 2,
        unit: "endings",
        hint: "Mark target scenes as endings or leave them as final scenes without outgoing choices.",
      },
    ]),
  },
  {
    id: CHALLENGE_IDS.STORY_MASTER,
    level: 5,
    title: "The Story Master",
    subtitle: "Synthesize narration, dialogue, and branching mastery",
    description:
      "You have honed every aspect of visual storytelling. Now, create a complete branching masterpiece featuring rich narration across scenes, multiple speaking characters, and varied endings.",
    difficulty: "Master",
    prerequisiteId: CHALLENGE_IDS.BIG_DECISION,
    unlockRules: {
      type: "prerequisite",
      prerequisiteId: CHALLENGE_IDS.BIG_DECISION,
      description: "Unlocked after completing Level 4: The Big Decision.",
    },
    badge: {
      id: "story_master",
      name: "Story Master",
      icon: "Sparkles",
      description: "Awarded for completing all five Story Studio challenges and mastering interactive visual storytelling.",
    },
    reward: {
      xp: 120,
      coins: 40,
      badge: "Story Master",
      badgeId: "story_master",
      flagKey: "challenge_story_studio_lvl5_completed",
      completedAtKey: "challenge_story_studio_lvl5_completed_at",
    },
    orderedObjectives: Object.freeze([
      {
        id: "scenes-count",
        label: "Create at least 4 scenes",
        description: "Construct an epic story containing at least four scenes.",
        target: 4,
        unit: "scenes",
        hint: "Add scenes to reach at least 4 scenes in your branching narrative.",
      },
      {
        id: "narration-depth",
        label: "Meaningful narration in 3 scenes",
        description: "Provide at least 20 non-whitespace characters of narration across three or more scenes.",
        target: 3,
        unit: "scenes",
        hint: "Add rich narration text to at least 3 separate scenes.",
      },
      {
        id: "ensemble-dialogue",
        label: "Dialogue from 2 characters",
        description: "Include spoken dialogue from at least two distinct characters.",
        target: 2,
        unit: "speakers",
        hint: "Have at least two different characters speak dialogue lines.",
      },
      {
        id: "branching-endings",
        label: "Branching to 2 reachable endings",
        description: "Design a branching journey that allows readers to arrive at at least two reachable endings.",
        target: 2,
        unit: "endings",
        hint: "Include branching choices that lead readers to at least two distinct reachable ending scenes.",
      },
    ]),
  },
]);

/**
 * Returns all challenges in catalogue order.
 * @returns {Array<object>}
 */
export function getAllChallenges() {
  return [...CHALLENGES];
}

/**
 * Retrieves a challenge by its unique ID.
 * @param {string} challengeId
 * @returns {object|null}
 */
export function getChallengeById(challengeId) {
  if (typeof challengeId !== "string") return null;
  return CHALLENGES.find((c) => c.id === challengeId) ?? null;
}

/**
 * Retrieves a challenge by its numeric level (1 to 5).
 * @param {number} level
 * @returns {object|null}
 */
export function getChallengeByLevel(level) {
  const lvl = Number(level);
  if (!Number.isInteger(lvl) || lvl < 1 || lvl > CHALLENGES.length) return null;
  return CHALLENGES.find((c) => c.level === lvl) ?? null;
}

/**
 * Retrieves the prerequisite challenge for a given challenge, or null if it has none.
 * @param {string} challengeId
 * @returns {object|null}
 */
export function getPrerequisiteChallenge(challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge || !challenge.prerequisiteId) return null;
  return getChallengeById(challenge.prerequisiteId);
}

/**
 * Retrieves the subsequent challenge in the sequence, or null if this is the final challenge.
 * @param {string} challengeId
 * @returns {object|null}
 */
export function getNextChallenge(challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return null;
  const idx = CHALLENGE_ORDER.indexOf(challenge.id);
  if (idx < 0 || idx >= CHALLENGE_ORDER.length - 1) return null;
  return getChallengeById(CHALLENGE_ORDER[idx + 1]);
}

/**
 * Creates a valid, tailored starter StoryDocument for a challenge attempt.
 * Preserves the schema strictly without introducing non-standard document keys.
 *
 * @param {string} challengeId - Target challenge ID
 * @param {object} [options]
 * @param {string} [options.attemptId] - Optional attempt ID to bind in metadata
 * @param {string} [options.author] - Optional author name
 * @returns {object} Valid StoryDocument
 */
export function createChallengeStarterStory(challengeId, options = {}) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    throw new Error(`Unknown challenge ID: "${challengeId}"`);
  }

  const attemptId = options.attemptId ? String(options.attemptId) : null;
  const author = options.author ? String(options.author) : "Challenge Explorer";

  // Base metadata safely stored inside doc.metadata (which is an open plain object in schema)
  const metadata = {
    challengeId: challenge.id,
    challengeLevel: challenge.level,
    challengeTitle: challenge.title,
    ...(attemptId ? { attemptId } : {}),
  };

  const scene1Id = createSceneId();

  let scenes;

  switch (challenge.id) {
    case CHALLENGE_IDS.STORY_BEGINS: {
      // 1-scene starter with Maya placed, but no dialogue yet and needs a 2nd scene and narration
      scenes = [
        createDefaultScene({
          id: scene1Id,
          name: "Scene 1: The First Step",
          background: "village-square",
          narration: "",
          characters: [
            createCharacterPlacement({
              characterId: "maya",
              slot: "left",
              expression: "happy",
              facing: "right",
            }),
          ],
          dialogue: [],
        }),
      ];
      break;
    }

    case CHALLENGE_IDS.CHARACTERS_LIFE: {
      // 2 scenes with Maya in scene 1; author needs to place a 2nd character, set expressions & write dialogue
      const scene2Id = createSceneId();
      scenes = [
        createDefaultScene({
          id: scene1Id,
          name: "Scene 1: Maya's Invitation",
          background: "village-square",
          narration: "Maya has arrived at the square, waiting for a friend.",
          characters: [
            createCharacterPlacement({
              characterId: "maya",
              slot: "left",
              expression: "thoughtful",
              facing: "right",
            }),
          ],
          dialogue: [],
        }),
        createDefaultScene({
          id: scene2Id,
          name: "Scene 2: The Meeting",
          background: "village-square",
          narration: "A second friend approaches with something important to say.",
          characters: [],
          dialogue: [],
        }),
      ];
      break;
    }

    case CHALLENGE_IDS.BUILD_WORLD: {
      // 2 scenes using the same background; author needs to add scene 3, a distinct background, and props
      const scene2Id = createSceneId();
      scenes = [
        createDefaultScene({
          id: scene1Id,
          name: "Scene 1: Departure",
          background: "village-square",
          narration: "The travelers pack their satchels in the village square.",
          characters: [
            createCharacterPlacement({
              characterId: "maya",
              slot: "left",
              expression: "determined",
              facing: "right",
            }),
          ],
          props: [],
        }),
        createDefaultScene({
          id: scene2Id,
          name: "Scene 2: On the Way",
          background: "village-square",
          narration: "The journey takes them toward unfamiliar territory.",
          characters: [
            createCharacterPlacement({
              characterId: "maya",
              slot: "center",
              expression: "thoughtful",
              facing: "right",
            }),
          ],
          props: [],
        }),
      ];
      break;
    }

    case CHALLENGE_IDS.BIG_DECISION: {
      // 2 scenes ready for branching; scene 1 is the fork
      const scene2Id = createSceneId();
      scenes = [
        createDefaultScene({
          id: scene1Id,
          name: "Scene 1: The Fork in the Path",
          background: "farm-field",
          narration: "Two distinct trails lead into the unknown. Which way should we go?",
          characters: [
            createCharacterPlacement({
              characterId: "tariq",
              slot: "center",
              expression: "thoughtful",
              facing: "right",
            }),
          ],
          choices: [],
        }),
        createDefaultScene({
          id: scene2Id,
          name: "Scene 2: First Path Ending",
          background: "water-well",
          narration: "Following the left path led to the old stone well.",
          isEnding: true,
          characters: [
            createCharacterPlacement({
              characterId: "tariq",
              slot: "center",
              expression: "happy",
              facing: "right",
            }),
          ],
        }),
      ];
      break;
    }

    case CHALLENGE_IDS.STORY_MASTER: {
      // Clean 2-scene starter ready for expansion into a 4-scene branching tale
      const scene2Id = createSceneId();
      scenes = [
        createDefaultScene({
          id: scene1Id,
          name: "Scene 1: The Legend Begins",
          background: "starry-night",
          narration: "Underneath the starry sky, an epic quest begins.",
          characters: [
            createCharacterPlacement({
              characterId: "elder-samira",
              slot: "left",
              expression: "thoughtful",
              facing: "right",
            }),
          ],
          dialogue: [],
        }),
        createDefaultScene({
          id: scene2Id,
          name: "Scene 2: Maya Listens",
          background: "starry-night",
          narration: "Maya listens intently to every word of the ancient wisdom.",
          characters: [
            createCharacterPlacement({
              characterId: "maya",
              slot: "center",
              expression: "determined",
              facing: "left",
            }),
          ],
          dialogue: [],
        }),
      ];
      break;
    }

    default:
      scenes = null;
  }

  return createStoryDocument({
    id: createStoryId(),
    title: `${challenge.title} - Attempt`,
    author,
    scenes,
    metadata,
  });
}
