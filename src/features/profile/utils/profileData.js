/**
 * Profile data utilities — derives profile-relevant statistics
 * from the existing player state without creating duplicate sources of truth.
 */

import { LOCATIONS } from "@/config/locations";

// ─── Level Calculation ───────────────────────────────────────────
// Matches the formula in usePlayer.earnXP: level = floor(xp / 100) + 1
export function calculateLevel(xp) {
  return Math.floor((xp || 0) / 100) + 1;
}

export function xpForLevel(level) {
  return (level - 1) * 100;
}

export function xpToNextLevel(xp) {
  const level = calculateLevel(xp);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  return {
    current: (xp || 0) - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
    total: xp || 0,
    level,
  };
}

// ─── Skill Definitions ───────────────────────────────────────────
// The five pillars from DEFAULT_PLAYER.skills
export const SKILL_DEFINITIONS = {
  life: {
    label: "Life Skills",
    icon: "🏠",
    color: "#f59e0b",
    colorSoft: "rgba(245,158,11,0.15)",
    description: "Everyday household and personal care abilities.",
  },
  human: {
    label: "Human Skills",
    icon: "🤝",
    color: "#ec4899",
    colorSoft: "rgba(236,72,153,0.15)",
    description: "Communication, empathy, and teamwork.",
  },
  digital: {
    label: "Digital Skills",
    icon: "💻",
    color: "#3b82f6",
    colorSoft: "rgba(59,130,246,0.15)",
    description: "Technology, coding, and digital literacy.",
  },
  vocational: {
    label: "Vocational Skills",
    icon: "🌾",
    color: "#10b981",
    colorSoft: "rgba(16,185,129,0.15)",
    description: "Practical trades, farming, and craftsmanship.",
  },
  entrepreneurial: {
    label: "Entrepreneurial Skills",
    icon: "💡",
    color: "#8b5cf6",
    colorSoft: "rgba(139,92,246,0.15)",
    description: "Business thinking, creativity, and problem-solving.",
  },
};

// Maximum per skill for the progress bar display (soft cap for UI)
export const SKILL_DISPLAY_MAX = 100;

// ─── World Progress Derivation ────────────────────────────────────
// Derives world completion state from player data.

/**
 * Returns a list of world objects augmented with progress information.
 * All data comes from existing player state — no invented percentages.
 */
export function deriveWorldProgress(player) {
  const completedToday = player.completedToday || [];

  return LOCATIONS.map((loc) => {
    const isCompleted = completedToday.includes(loc.id);

    // Per-world specific progress derivation
    let activities = null;
    let completedActivities = 0;
    let totalActivities = 0;
    let progressPercent = null;
    let status = "not-started";

    switch (loc.id) {
      case "school": {
        // School tracks computerProgress, english progress
        const cp = player.computerProgress || {};
        const eng = player.english || {};

        // Count computer sub-activities completed
        let computerDone = 0;
        const computerTotal = 4; // typing, blockCoding, pythonDebugging, finalChallenge
        if (cp.typing?.completedLevels?.length > 0 || cp.typing?.lesson1Completed || cp.typing?.lesson2Completed) computerDone++;
        if (cp.blockCoding?.completedLevels?.length > 0) computerDone++;
        if (cp.pythonDebugging?.completedLevels?.length > 0) computerDone++;
        if (cp.finalChallenge?.completed) computerDone++;

        // Count English levels completed
        const englishDone = Object.keys(eng.levels || {}).length;
        const englishTotal = eng.maxUnlocked || 1;

        totalActivities = computerTotal + englishTotal;
        completedActivities = computerDone + englishDone;

        if (isCompleted) {
          status = "completed";
          progressPercent = 100;
        } else if (completedActivities > 0) {
          status = "in-progress";
          progressPercent = Math.round((completedActivities / Math.max(totalActivities, 1)) * 100);
        }

        activities = {
          completed: completedActivities,
          total: totalActivities,
        };
        break;
      }

      case "home": {
        // Home world has 12 stations defined in homeData.js
        // completedToday includes "home" when all are done
        // We can't easily track individual home mini-games from player state alone,
        // but if "home" is in completedToday, all 12 are done.
        totalActivities = 12;
        if (isCompleted) {
          status = "completed";
          completedActivities = 12;
          progressPercent = 100;
        } else {
          // We don't have granular tracking outside of the home session,
          // so we show not-started or completed only
          status = "not-started";
          completedActivities = 0;
          progressPercent = 0;
        }
        activities = { completed: completedActivities, total: totalActivities };
        break;
      }

      case "farm": {
        if (isCompleted) {
          status = "completed";
          progressPercent = 100;
        }
        // Farm progress isn't granularly tracked in player state
        break;
      }

      case "market": {
        if (isCompleted) {
          status = "completed";
          progressPercent = 100;
        }
        break;
      }

      case "marketing": {
        if (isCompleted) {
          status = "completed";
          progressPercent = 100;
        }
        break;
      }

      default: {
        if (isCompleted) {
          status = "completed";
          progressPercent = 100;
        }
      }
    }

    return {
      ...loc,
      status,
      isCompleted,
      progressPercent,
      activities,
    };
  });
}

// ─── Mini-Game Catalogue ──────────────────────────────────────────
// Lists known mini-games mapped from existing route/component analysis.
// Scores/attempts are not currently persisted, so we only show existence
// and completion status where determinable.

export const KNOWN_MINIGAMES = [
  // Home world mini-games (12 stations)
  { id: "waste", name: "Sort the Waste", world: "home", worldName: "Explorer Haven", icon: "🗑️", coins: 20, xp: 15 },
  { id: "electricity", name: "Save Electricity", world: "home", worldName: "Explorer Haven", icon: "💡", coins: 15, xp: 10 },
  { id: "clean", name: "Clean & Organise", world: "home", worldName: "Explorer Haven", icon: "🧹", coins: 20, xp: 15 },
  { id: "food", name: "Healthy Food Sort", world: "home", worldName: "Explorer Haven", icon: "🥗", coins: 20, xp: 15 },
  { id: "spice", name: "Spice Discovery", world: "home", worldName: "Explorer Haven", icon: "🫙", coins: 15, xp: 10 },
  { id: "water", name: "Save Water", world: "home", worldName: "Explorer Haven", icon: "💧", coins: 15, xp: 10 },
  { id: "shopping", name: "Smart Shopping", world: "home", worldName: "Explorer Haven", icon: "🛒", coins: 25, xp: 20 },
  { id: "weather", name: "Dress for Weather", world: "home", worldName: "Explorer Haven", icon: "👔", coins: 20, xp: 15 },
  { id: "routine", name: "Daily Routine", world: "home", worldName: "Explorer Haven", icon: "⏰", coins: 15, xp: 10 },
  { id: "laundry", name: "Laundry Sorting", world: "home", worldName: "Explorer Haven", icon: "👕", coins: 15, xp: 10 },
  { id: "plant", name: "Plant Care", world: "home", worldName: "Explorer Haven", icon: "🌱", coins: 20, xp: 15 },
  { id: "safety_game", name: "Safety Detective", world: "home", worldName: "Explorer Haven", icon: "🛡️", coins: 25, xp: 20 },
  // School > Computer
  { id: "typing", name: "Typing Practice", world: "school", worldName: "Academy of Skills", icon: "⌨️", coins: 0, xp: 0 },
  { id: "blockCoding", name: "Block Coding", world: "school", worldName: "Academy of Skills", icon: "🧩", coins: 0, xp: 0 },
  { id: "pythonDebugging", name: "Python Debugging", world: "school", worldName: "Academy of Skills", icon: "🐍", coins: 0, xp: 0 },
  { id: "finalChallenge", name: "Computer Final Challenge", world: "school", worldName: "Academy of Skills", icon: "🏆", coins: 0, xp: 0 },
  // School > Maths
  { id: "mathsRiver", name: "Maths River Game", world: "school", worldName: "Academy of Skills", icon: "🌊", coins: 0, xp: 0 },
  // Farm
  { id: "farmAgriculture", name: "Farm Agriculture", world: "farm", worldName: "Verdant Fields", icon: "🌾", coins: 0, xp: 0 },
  { id: "farmEarnXP", name: "Farm XP Challenges", world: "farm", worldName: "Verdant Fields", icon: "🏆", coins: 0, xp: 0 },
];

/**
 * Derives mini-game completion status from player state.
 * Only shows completion data that is actually tracked — no invented scores.
 */
export function deriveMiniGameStatus(player) {
  const cp = player.computerProgress || {};
  const eng = player.english || {};
  const completedToday = player.completedToday || [];
  const homeCompleted = completedToday.includes("home");

  return KNOWN_MINIGAMES.map((game) => {
    let isCompleted = false;
    let bestScore = null;
    let attempts = null;

    switch (game.id) {
      // Home mini-games — only known if entire world is completed
      case "waste":
      case "electricity":
      case "clean":
      case "food":
      case "spice":
      case "water":
      case "shopping":
      case "weather":
      case "routine":
      case "laundry":
      case "plant":
      case "safety_game":
        isCompleted = homeCompleted;
        break;

      // Computer progress
      case "typing":
        isCompleted = (cp.typing?.completedLevels?.length > 0) ||
                      cp.typing?.lesson1Completed || cp.typing?.lesson2Completed;
        break;
      case "blockCoding":
        isCompleted = cp.blockCoding?.completedLevels?.length > 0;
        break;
      case "pythonDebugging":
        isCompleted = cp.pythonDebugging?.completedLevels?.length > 0;
        break;
      case "finalChallenge":
        isCompleted = cp.finalChallenge?.completed === true;
        break;

      // English
      case "englishAdventure":
        isCompleted = Object.keys(eng.levels || {}).length > 0;
        if (eng.totalPoints > 0) bestScore = eng.totalPoints;
        if (eng.totalAnswered > 0) attempts = eng.totalAnswered;
        break;

      // Farm and maths — no detailed tracking currently
      default:
        isCompleted = false;
    }

    return {
      ...game,
      isCompleted,
      bestScore,
      attempts,
      status: isCompleted ? "completed" : "not-started",
    };
  });
}

/**
 * Returns overall adventure summary stats.
 */
export function deriveOverallStats(player) {
  const worldProgress = deriveWorldProgress(player);
  const miniGames = deriveMiniGameStatus(player);
  const completedWorlds = worldProgress.filter((w) => w.isCompleted).length;
  const completedMiniGames = miniGames.filter((g) => g.isCompleted).length;
  const totalSkills = Object.values(player.skills || {}).reduce((a, b) => a + b, 0);

  return {
    completedWorlds,
    totalWorlds: LOCATIONS.length,
    completedMiniGames,
    totalMiniGames: KNOWN_MINIGAMES.length,
    totalSkillPoints: totalSkills,
    xp: player.xp || 0,
    level: player.level || calculateLevel(player.xp),
    coins: player.coins || 0,
    day: player.day || 1,
  };
}

// ─── Badges Catalogue ─────────────────────────────────────────────
export const BADGE_CATALOG = [
  {
    id: "Star Collector",
    name: "Star Collector",
    icon: "⭐",
    description: "Gathered 3 or more glowing star fragments during dream flight.",
    world: "Dream",
  },
  {
    id: "Village Hydrologist",
    name: "Village Hydrologist",
    icon: "💧",
    description: "Designed clean water distribution systems in World Builder.",
    world: "Creative Studio",
  },
  {
    id: "story_master",
    name: "Story Master",
    icon: "📖",
    description: "Constructed deep, branching narrative quests in Story Studio.",
    world: "Creative Studio",
  },
  {
    id: "apprentice_author",
    name: "Apprentice Author",
    icon: "✍️",
    description: "Penned your very first interactive story chapter.",
    world: "Creative Studio",
  },
  {
    id: "world_traveler",
    name: "World Traveler",
    icon: "🧭",
    description: "Completed journeys across all five core SkillVerse worlds.",
    world: "Global",
  },
  {
    id: "scholar",
    name: "Academy Scholar",
    icon: "🎓",
    description: "Passed academic tests and computer challenges at the School.",
    world: "Academy of Skills",
  },
  {
    id: "wealth_builder",
    name: "Wealth Builder",
    icon: "🪙",
    description: "Amassed over 100 shining gold coins in your coin purse.",
    world: "Global",
  },
  {
    id: "green_thumb",
    name: "Green Thumb",
    icon: "🌱",
    description: "Cultivated and harvested bountiful crops at the Farm.",
    world: "Verdant Fields",
  },
];

/**
 * Derives badges status from player data.
 * Checks player.badges array and also dynamic milestones.
 */
export function deriveBadges(player) {
  const earnedBadges = Array.isArray(player?.badges) ? player.badges : [];
  const completedWorlds = player?.completedToday || [];
  const coins = player?.coins || 0;

  return BADGE_CATALOG.map((badge) => {
    // Check if directly in player.badges (by ID or name)
    let isEarned = earnedBadges.includes(badge.id) || earnedBadges.includes(badge.name);

    // Milestone badges
    if (!isEarned) {
      if (badge.id === "world_traveler" && completedWorlds.length >= 5) {
        isEarned = true;
      } else if (badge.id === "wealth_builder" && coins >= 100) {
        isEarned = true;
      }
    }

    return {
      ...badge,
      isEarned,
    };
  });
}

