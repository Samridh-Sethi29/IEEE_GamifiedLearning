/**
 * Story Studio Challenge Evaluation & Validation Engine (C1, C4).
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 *
 * Implements authoritative, deterministic objective validation for all five Story Studio challenges:
 * Level 1 — A Story Begins (scenes >= 2, narration >= 20 non-ws chars, dialogue >= 1, placed character >= 1)
 * Level 2 — Bring Characters to Life (distinct characters >= 2, each speaking >= 1 line, distinct expressions >= 2)
 * Level 3 — Build the World (scenes >= 3, distinct backgrounds >= 2, valid placed props >= 2)
 * Level 4 — The Big Decision (branching scene >= 2 choices, distinct targets >= 2, reachable endings >= 2)
 * Level 5 — The Story Master (scenes >= 4, narration in >= 3 scenes, speaking characters >= 2, branching to >= 2 reachable endings)
 *
 * Correctly handles dangling references, duplicate IDs, unreachable scenes, and invalid edges.
 * Never throws on malformed, incomplete, or corrupted story documents.
 */

import { getChallengeById } from "../data/storyChallenges.js";
import { analyzeStoryGraph } from "./storyGraph.js";
import {
  CHARACTER_EXPRESSIONS,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTER_IDS,
  STORY_PROP_IDS,
} from "./storySchema.js";

/**
 * Safely extracts scenes array from document.
 */
function getSafeScenes(doc) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.scenes)) {
    return [];
  }
  return doc.scenes.filter((s) => s && typeof s === "object");
}

/**
 * Resolves a speaker identifier to a canonical character ID if known.
 */
function resolveCanonicalSpeakerId(speakerId, scenes) {
  if (typeof speakerId !== "string" || !speakerId.trim() || speakerId === "narrator") {
    return null;
  }
  const clean = speakerId.trim();
  const lower = clean.toLowerCase();

  // 1. Matches a known character ID directly
  if (STORY_CHARACTER_IDS.includes(clean)) {
    return clean;
  }
  if (STORY_CHARACTER_IDS.includes(lower)) {
    return lower;
  }

  // 2. Look for placed character in scenes matching id, characterId, or name
  for (const scene of scenes) {
    if (Array.isArray(scene.characters)) {
      for (const char of scene.characters) {
        if (!char || typeof char !== "object") continue;
        if (
          char.id === clean ||
          char.characterId === clean ||
          char.characterId === lower
        ) {
          if (STORY_CHARACTER_IDS.includes(char.characterId)) {
            return char.characterId;
          }
        }
      }
    }
  }

  return clean;
}

/**
 * Evaluates scene count against a target.
 */
export function evaluateScenesCount(doc, target = 2) {
  const scenes = getSafeScenes(doc);
  const current = scenes.length;
  const met = current >= target;
  return {
    met,
    passed: met,
    current,
    target,
    details: `${current} of ${target} scene${target === 1 ? "" : "s"} created`,
    explanation: met
      ? `Found ${current} scene(s) in story (target: at least ${target}).`
      : `Story has ${current} of ${target} required scene${target === 1 ? "" : "s"}.`,
    unmetRequirement: met
      ? null
      : `Add at least ${target} scene${target === 1 ? "" : "s"} to your story (currently ${current}).`,
  };
}

/**
 * Evaluates narration length and presence.
 * Counts non-whitespace characters to ensure substantive story text.
 *
 * @param {object} doc
 * @param {object} options
 * @param {number} [options.minChars=20] - Minimum non-whitespace characters for narration to count as meaningful
 * @param {number} [options.minScenes=1] - Minimum number of scenes with meaningful narration
 */
export function evaluateNarration(doc, { minChars = 20, minScenes = 1 } = {}) {
  const scenes = getSafeScenes(doc);
  let maxNonWs = 0;

  const narratedScenes = scenes.filter((s) => {
    if (!s || typeof s.narration !== "string") return false;
    const nonWs = s.narration.replace(/\s+/g, "").length;
    if (nonWs > maxNonWs) maxNonWs = nonWs;
    return nonWs >= minChars;
  });

  const current = narratedScenes.length;
  const met = current >= minScenes;
  return {
    met,
    passed: met,
    current,
    target: minScenes,
    minChars,
    details: `${current} of ${minScenes} scene${minScenes === 1 ? "" : "s"} with ≥${minChars} non-whitespace characters of narration`,
    explanation: met
      ? `Found ${current} scene(s) with at least ${minChars} non-whitespace characters of narration.`
      : `Found ${current} of ${minScenes} scene(s) with at least ${minChars} non-whitespace characters of narration (longest has ${maxNonWs}).`,
    unmetRequirement: met
      ? null
      : `Write at least ${minChars} non-whitespace characters of narration in ${
          minScenes > 1 ? `at least ${minScenes} scenes (currently ${current})` : "at least one scene"
        }.`,
  };
}

/**
 * Evaluates total dialogue lines with non-empty, non-whitespace text.
 */
export function evaluateDialogue(doc, { minLines = 1 } = {}) {
  const scenes = getSafeScenes(doc);
  let lineCount = 0;

  for (const scene of scenes) {
    if (Array.isArray(scene.dialogue)) {
      for (const line of scene.dialogue) {
        if (line && typeof line.text === "string" && line.text.trim().length > 0) {
          lineCount += 1;
        }
      }
    }
  }

  const met = lineCount >= minLines;
  return {
    met,
    passed: met,
    current: lineCount,
    target: minLines,
    details: `${lineCount} of ${minLines} dialogue line${minLines === 1 ? "" : "s"} written`,
    explanation: met
      ? `Found ${lineCount} non-empty dialogue line(s) in story (target: at least ${minLines}).`
      : `Found ${lineCount} of ${minLines} required non-empty dialogue line${minLines === 1 ? "" : "s"}.`,
    unmetRequirement: met
      ? null
      : `Add at least ${minLines} non-empty line${minLines === 1 ? "" : "s"} of dialogue to your story.`,
  };
}

/**
 * Evaluates placed characters count.
 */
export function evaluatePlacedCharacters(doc, { minCharacters = 1 } = {}) {
  const scenes = getSafeScenes(doc);
  let placedCount = 0;

  for (const scene of scenes) {
    if (Array.isArray(scene.characters)) {
      for (const char of scene.characters) {
        if (
          char &&
          typeof char.characterId === "string" &&
          char.characterId.trim() &&
          STORY_CHARACTER_IDS.includes(char.characterId.trim())
        ) {
          placedCount += 1;
        }
      }
    }
  }

  const met = placedCount >= minCharacters;
  return {
    met,
    passed: met,
    current: placedCount,
    target: minCharacters,
    details: `${placedCount} of ${minCharacters} character placement${minCharacters === 1 ? "" : "s"} on stage`,
    explanation: met
      ? `Found ${placedCount} character placement(s) on stage (target: at least ${minCharacters}).`
      : `Found ${placedCount} of ${minCharacters} required character placement${minCharacters === 1 ? "" : "s"} on stage.`,
    unmetRequirement: met
      ? null
      : `Place at least ${minCharacters} character${minCharacters === 1 ? "" : "s"} on the stage.`,
  };
}

/**
 * Evaluates distinct characters placed across all scenes.
 * Duplicate placements of the same character ID in the same or multiple scenes count as 1 character.
 */
export function evaluateDistinctCharacters(doc, { minDistinct = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const characterSet = new Set();

  for (const scene of scenes) {
    if (Array.isArray(scene.characters)) {
      for (const char of scene.characters) {
        if (
          char &&
          typeof char.characterId === "string" &&
          char.characterId.trim() &&
          STORY_CHARACTER_IDS.includes(char.characterId.trim())
        ) {
          characterSet.add(char.characterId.trim());
        }
      }
    }
  }

  const current = characterSet.size;
  const met = current >= minDistinct;
  return {
    met,
    passed: met,
    current,
    target: minDistinct,
    characterIds: Array.from(characterSet),
    details: `${current} of ${minDistinct} distinct character${minDistinct === 1 ? "" : "s"} placed`,
    explanation: met
      ? `Found ${current} distinct placed character(s): ${Array.from(characterSet).join(", ")}.`
      : `Found ${current} of ${minDistinct} distinct character${minDistinct === 1 ? "" : "s"} on stage.`,
    unmetRequirement: met
      ? null
      : `Place at least ${minDistinct} distinct characters across your story (currently ${current}).`,
  };
}

/**
 * Evaluates distinct placed characters that speak non-empty dialogue lines.
 * Excludes the narrator.
 */
export function evaluateCharacterDialogue(doc, { minSpeakers = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const placedCharSet = new Set();

  // Collect all valid placed character IDs
  for (const scene of scenes) {
    if (Array.isArray(scene.characters)) {
      for (const char of scene.characters) {
        if (
          char &&
          typeof char.characterId === "string" &&
          char.characterId.trim() &&
          STORY_CHARACTER_IDS.includes(char.characterId.trim())
        ) {
          placedCharSet.add(char.characterId.trim());
        }
      }
    }
  }

  const speakingPlacedCharSet = new Set();

  for (const scene of scenes) {
    if (Array.isArray(scene.dialogue)) {
      for (const line of scene.dialogue) {
        if (line && typeof line.text === "string" && line.text.trim().length > 0) {
          const canonical = resolveCanonicalSpeakerId(
            line.speakerId || line.speaker,
            scenes
          );
          if (canonical && placedCharSet.has(canonical)) {
            speakingPlacedCharSet.add(canonical);
          }
        }
      }
    }
  }

  const current = speakingPlacedCharSet.size;
  const met = current >= minSpeakers;
  return {
    met,
    passed: met,
    current,
    target: minSpeakers,
    speakerIds: Array.from(speakingPlacedCharSet),
    details: `${current} of ${minSpeakers} distinct placed character${minSpeakers === 1 ? "" : "s"} speaking dialogue`,
    explanation: met
      ? `Found ${current} distinct speaking placed character(s): ${Array.from(speakingPlacedCharSet).join(", ")}.`
      : `Found ${current} of ${minSpeakers} placed character(s) with written dialogue lines.`,
    unmetRequirement: met
      ? null
      : `Ensure at least ${minSpeakers} distinct placed characters have at least one non-empty dialogue line (currently ${current}).`,
  };
}

/**
 * Evaluates distinct expressions across placed characters.
 */
export function evaluateDistinctExpressions(doc, { minExpressions = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const expressionSet = new Set();

  for (const scene of scenes) {
    if (Array.isArray(scene.characters)) {
      for (const char of scene.characters) {
        if (
          char &&
          typeof char.expression === "string" &&
          char.expression.trim() &&
          CHARACTER_EXPRESSIONS.includes(char.expression.trim())
        ) {
          expressionSet.add(char.expression.trim());
        }
      }
    }
  }

  const current = expressionSet.size;
  const met = current >= minExpressions;
  return {
    met,
    passed: met,
    current,
    target: minExpressions,
    expressions: Array.from(expressionSet),
    details: `${current} of ${minExpressions} distinct expression${minExpressions === 1 ? "" : "s"} used`,
    explanation: met
      ? `Found ${current} distinct character expression(s): ${Array.from(expressionSet).join(", ")}.`
      : `Found ${current} of ${minExpressions} distinct expression${minExpressions === 1 ? "" : "s"} across placed characters.`,
    unmetRequirement: met
      ? null
      : `Use at least ${minExpressions} distinct expressions across placed characters (currently ${current}).`,
  };
}

/**
 * Evaluates distinct background environments across scenes.
 */
export function evaluateDistinctBackgrounds(doc, { minBackgrounds = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const bgSet = new Set();

  for (const scene of scenes) {
    if (
      scene &&
      typeof scene.background === "string" &&
      scene.background.trim() &&
      STORY_BACKGROUND_IDS.includes(scene.background.trim())
    ) {
      bgSet.add(scene.background.trim());
    }
  }

  const current = bgSet.size;
  const met = current >= minBackgrounds;
  return {
    met,
    passed: met,
    current,
    target: minBackgrounds,
    backgrounds: Array.from(bgSet),
    details: `${current} of ${minBackgrounds} distinct background${minBackgrounds === 1 ? "" : "s"} used`,
    explanation: met
      ? `Found ${current} distinct valid background(s): ${Array.from(bgSet).join(", ")}.`
      : `Found ${current} of ${minBackgrounds} distinct background${minBackgrounds === 1 ? "" : "s"} across scenes.`,
    unmetRequirement: met
      ? null
      : `Use at least ${minBackgrounds} distinct backgrounds across your scenes (currently ${current}).`,
  };
}

/**
 * Evaluates distinct valid props placed across scenes.
 */
export function evaluateProps(doc, { minProps = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const propSet = new Set();

  for (const scene of scenes) {
    if (Array.isArray(scene.props)) {
      for (const prop of scene.props) {
        if (typeof prop === "string" && prop.trim() && STORY_PROP_IDS.includes(prop.trim())) {
          propSet.add(prop.trim());
        }
      }
    }
  }

  const current = propSet.size;
  const met = current >= minProps;
  return {
    met,
    passed: met,
    current,
    target: minProps,
    props: Array.from(propSet),
    details: `${current} of ${minProps} distinct prop${minProps === 1 ? "" : "s"} used`,
    explanation: met
      ? `Found ${current} distinct valid prop(s): ${Array.from(propSet).join(", ")}.`
      : `Found ${current} of ${minProps} distinct valid prop${minProps === 1 ? "" : "s"} across scenes.`,
    unmetRequirement: met
      ? null
      : `Include at least ${minProps} distinct props across your scenes (currently ${current}).`,
  };
}

/**
 * Evaluates presence of a branching scene with at least `minChoices` valid choices.
 * A valid choice must have non-empty text and target an existing scene other than itself.
 */
export function evaluateBranchingChoices(doc, { minChoices = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const existingSceneIds = new Set(scenes.map((s) => s.id));
  let maxChoicesFound = 0;

  for (const scene of scenes) {
    if (Array.isArray(scene.choices)) {
      const validChoices = scene.choices.filter(
        (ch) =>
          ch &&
          typeof ch.text === "string" &&
          ch.text.trim().length > 0 &&
          typeof ch.targetSceneId === "string" &&
          ch.targetSceneId.trim() &&
          existingSceneIds.has(ch.targetSceneId.trim()) &&
          ch.targetSceneId.trim() !== scene.id
      );
      if (validChoices.length > maxChoicesFound) {
        maxChoicesFound = validChoices.length;
      }
    }
  }

  const met = maxChoicesFound >= minChoices;
  return {
    met,
    passed: met,
    current: maxChoicesFound,
    target: minChoices,
    details: `${maxChoicesFound} of ${minChoices} choice${minChoices === 1 ? "" : "s"} on a branching scene`,
    explanation: met
      ? `Found a scene with ${maxChoicesFound} valid branching choices.`
      : `Found at most ${maxChoicesFound} of ${minChoices} required valid choices on any branching scene.`,
    unmetRequirement: met
      ? null
      : `Add at least ${minChoices} valid choices to a scene leading to other scenes.`,
  };
}

/**
 * Evaluates whether a branching scene points to at least `minTargets` distinct, existing target scenes.
 */
export function evaluateDistinctChoiceTargets(doc, { minTargets = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  const existingSceneIds = new Set(scenes.map((s) => s.id));
  let maxDistinctTargets = 0;

  for (const scene of scenes) {
    if (Array.isArray(scene.choices)) {
      const targetSet = new Set();
      for (const ch of scene.choices) {
        if (
          ch &&
          typeof ch.text === "string" &&
          ch.text.trim().length > 0 &&
          typeof ch.targetSceneId === "string" &&
          ch.targetSceneId.trim() &&
          existingSceneIds.has(ch.targetSceneId.trim()) &&
          ch.targetSceneId.trim() !== scene.id
        ) {
          targetSet.add(ch.targetSceneId.trim());
        }
      }
      if (targetSet.size > maxDistinctTargets) {
        maxDistinctTargets = targetSet.size;
      }
    }
  }

  const met = maxDistinctTargets >= minTargets;
  return {
    met,
    passed: met,
    current: maxDistinctTargets,
    target: minTargets,
    details: `${maxDistinctTargets} of ${minTargets} distinct target scene${minTargets === 1 ? "" : "s"} reached from a choice`,
    explanation: met
      ? `Branching choices lead to ${maxDistinctTargets} distinct destination scene(s).`
      : `Branching choices lead to ${maxDistinctTargets} of ${minTargets} required distinct destination scenes.`,
    unmetRequirement: met
      ? null
      : `Ensure choices on a branching scene lead to at least ${minTargets} different destination scenes.`,
  };
}

/**
 * Evaluates whether the story contains at least `minEndings` reachable ending scenes.
 * Reuses the graph reachability engine in storyGraph.js.
 */
export function evaluateReachableEndings(doc, { minEndings = 2 } = {}) {
  const scenes = getSafeScenes(doc);
  if (scenes.length === 0) {
    return {
      met: false,
      passed: false,
      current: 0,
      target: minEndings,
      details: "0 reachable endings (story has no scenes)",
      explanation: "Story has no scenes.",
      unmetRequirement: `Create branching pathways that lead to at least ${minEndings} reachable ending scenes.`,
    };
  }

  // Branching requires at least one scene with choices
  const hasAnyChoices = scenes.some(
    (s) => Array.isArray(s.choices) && s.choices.some((c) => c && c.targetSceneId)
  );
  if (!hasAnyChoices) {
    return {
      met: false,
      passed: false,
      current: 0,
      target: minEndings,
      details: "0 branching endings (no branching choices present in story)",
      explanation: "No branching choices exist in the story.",
      unmetRequirement: `Add branching choices that branch the narrative into at least ${minEndings} reachable endings.`,
    };
  }

  const graph = analyzeStoryGraph(doc);
  const reachableSet = new Set(graph.reachableSceneIds || []);
  const reachableEndings = (graph.endingSceneIds || []).filter((id) =>
    reachableSet.has(id)
  );

  const current = reachableEndings.length;
  const met = current >= minEndings;
  return {
    met,
    passed: met,
    current,
    target: minEndings,
    endingSceneIds: reachableEndings,
    details: `${current} of ${minEndings} reachable ending${minEndings === 1 ? "" : "s"} in story graph`,
    explanation: met
      ? `Found ${current} reachable ending scene(s) in the story graph.`
      : `Found ${current} of ${minEndings} reachable ending scene(s) from the opening scene.`,
    unmetRequirement: met
      ? null
      : `Create branching pathways that reach at least ${minEndings} distinct ending scenes (currently ${current}).`,
  };
}

/**
 * Evaluates an individual objective configuration against a document.
 */
export function evaluateObjective(objective, doc) {
  if (!objective || typeof objective !== "object") {
    return {
      id: "unknown",
      label: "Unknown Objective",
      description: "",
      unit: "",
      met: false,
      passed: false,
      current: 0,
      target: 1,
      details: "Invalid objective definition",
      explanation: "Invalid objective definition.",
      unmetRequirement: "Invalid objective definition.",
    };
  }

  let result;

  switch (objective.id) {
    case "scenes-count":
      result = evaluateScenesCount(doc, objective.target || 2);
      break;

    case "narration":
      result = evaluateNarration(doc, { minChars: objective.target || 20, minScenes: 1 });
      break;

    case "narration-depth":
      result = evaluateNarration(doc, { minChars: 20, minScenes: objective.target || 3 });
      break;

    case "dialogue":
      result = evaluateDialogue(doc, { minLines: objective.target || 1 });
      break;

    case "character-placed":
      result = evaluatePlacedCharacters(doc, { minCharacters: objective.target || 1 });
      break;

    case "distinct-characters":
      result = evaluateDistinctCharacters(doc, { minDistinct: objective.target || 2 });
      break;

    case "character-dialogue":
    case "ensemble-dialogue":
      result = evaluateCharacterDialogue(doc, { minSpeakers: objective.target || 2 });
      break;

    case "distinct-expressions":
      result = evaluateDistinctExpressions(doc, { minExpressions: objective.target || 2 });
      break;

    case "distinct-backgrounds":
      result = evaluateDistinctBackgrounds(doc, { minBackgrounds: objective.target || 2 });
      break;

    case "props-placed":
      result = evaluateProps(doc, { minProps: objective.target || 2 });
      break;

    case "branching-choice":
      result = evaluateBranchingChoices(doc, { minChoices: objective.target || 2 });
      break;

    case "distinct-targets":
      result = evaluateDistinctChoiceTargets(doc, { minTargets: objective.target || 2 });
      break;

    case "reachable-endings":
    case "branching-endings":
      result = evaluateReachableEndings(doc, { minEndings: objective.target || 2 });
      break;

    default:
      result = {
        met: false,
        passed: false,
        current: 0,
        target: objective.target || 1,
        details: `Unknown objective evaluator: ${objective.id}`,
        explanation: `Unknown objective evaluator: ${objective.id}`,
        unmetRequirement: `Resolve requirement for ${objective.label || objective.id}.`,
      };
  }

  return {
    id: objective.id,
    label: objective.label,
    description: objective.description,
    unit: objective.unit,
    met: result.met,
    passed: result.met,
    current: result.current,
    target: result.target,
    details: result.details,
    explanation: result.explanation || result.details,
    unmetRequirement: result.met ? null : (result.unmetRequirement || result.details),
  };
}

/**
 * Pure validation function that evaluates an entire challenge against a Story Studio document.
 * Returns structured results for each objective with passed, clear explanation, and unmet requirement.
 * Never throws on malformed input.
 *
 * @param {string|object} challengeOrId - Challenge definition or ID
 * @param {object} doc - StoryDocument to grade
 * @param {string} [now] - Evaluation ISO timestamp
 * @returns {object} Structured validation report
 */
export function validateChallengeStory(challengeOrId, doc, now = new Date().toISOString()) {
  const challenge =
    typeof challengeOrId === "string"
      ? getChallengeById(challengeOrId)
      : challengeOrId;

  if (!challenge || typeof challenge !== "object") {
    return {
      challengeId: typeof challengeOrId === "string" ? challengeOrId : "unknown",
      level: 0,
      title: "Unknown Challenge",
      passed: false,
      eligibleForCompletion: false,
      objectives: [],
      summary: {
        metCount: 0,
        totalCount: 0,
        percentComplete: 0,
        remainingTasks: ["Challenge not found."],
      },
      evaluatedAt: now,
      error: `Challenge not found: "${String(challengeOrId)}"`,
    };
  }

  const objectives = Array.isArray(challenge.orderedObjectives)
    ? challenge.orderedObjectives.map((obj) => evaluateObjective(obj, doc))
    : [];

  const metCount = objectives.filter((o) => o.passed).length;
  const totalCount = objectives.length;
  const eligibleForCompletion = totalCount > 0 && metCount === totalCount;
  const percentComplete =
    totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  const remainingTasks = objectives
    .filter((o) => !o.passed)
    .map((o) => o.unmetRequirement || o.explanation);

  return {
    challengeId: challenge.id,
    level: challenge.level,
    title: challenge.title,
    passed: eligibleForCompletion,
    eligibleForCompletion,
    objectives,
    summary: {
      metCount,
      totalCount,
      percentComplete,
      remainingTasks,
    },
    evaluatedAt: now,
  };
}

/**
 * Backwards-compatible alias for evaluateChallenge.
 */
export const evaluateChallenge = validateChallengeStory;
