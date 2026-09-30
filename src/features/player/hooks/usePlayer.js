import { useQuery, useQueryClient } from "@tanstack/react-query";

export const DEFAULT_PLAYER = {
  id: "local",
  name: "Explorer",
  level: 1,
  xp: 0,
  coins: 150,
  day: 1,
  water: 100, // Available water
  skills: {
    life: 0,
    human: 0,
    digital: 0,
    vocational: 0,
    entrepreneurial: 0,
  },
  flags: {}, // e.g. "home_leak_repaired": true
  badges: [],
  starLog: [],
  starFragments: 0,
  completedToday: [], // e.g. "home", "school"
  english: {
    maxUnlocked: 1,
    levels: {}, // { "1": { stars: 3, bestScore: 100 } }
    totalPoints: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    streak: 0,
    bestStreak: 0,
  }
};

export function usePlayer() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["player"],
    queryFn: () => {
      try {
        const stored = localStorage.getItem("skillverse_save");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load save", e);
      }
      return DEFAULT_PLAYER;
    },
    staleTime: Infinity,
    retry: false,
  });

  const player = data ?? DEFAULT_PLAYER;

  const updatePlayer = (updates) => {
    queryClient.setQueryData(["player"], (old) => {
      const current = old ?? DEFAULT_PLAYER;
      const next = { ...current, ...updates };
      // Deep merge for skills/flags if provided
      if (updates.skills) {
        next.skills = { ...current.skills, ...updates.skills };
      }
      if (updates.flags) {
        next.flags = { ...current.flags, ...updates.flags };
      }
      localStorage.setItem("skillverse_save", JSON.stringify(next));
      return next;
    });
  };

  const earnXP = (amount) => {
    const newXP = player.xp + amount;
<<<<<<< HEAD
    const newLevel = Math.floor(newXP / 100) + 1;
    updatePlayer({ xp: newXP, level: newLevel });
=======
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
    const leveledUp = newLevel > player.level;
    const coinBonus = leveledUp ? 100 : 0;
    updatePlayer({ xp: newXP, level: newLevel, coins: player.coins + coinBonus });
    return { leveledUp, newLevel, coinBonus };
>>>>>>> 63cef04486086d606a7340f47ef5cc4a84e5a06d
  };

  const addCoins = (amount) => {
    updatePlayer({ coins: player.coins + amount });
  };

  const spendCoins = (amount) => {
    if (player.coins >= amount) {
      updatePlayer({ coins: player.coins - amount });
      return true;
    }
    return false;
  };
  
  const updateSkill = (pillar, amount) => {
    const newSkills = { ...player.skills, [pillar]: (player.skills[pillar] || 0) + amount };
    updatePlayer({ skills: newSkills });
  };
  
  const addBadge = (badgeId) => {
    if (!player.badges.includes(badgeId)) {
      updatePlayer({ badges: [...player.badges, badgeId] });
    }
  };
  
  const markWorldCompleted = (worldId) => {
    if (!player.completedToday.includes(worldId)) {
      updatePlayer({ completedToday: [...player.completedToday, worldId] });
    }
  };
  
  const startNewDay = () => {
    updatePlayer({
      day: player.day + 1,
      completedToday: [],
      water: 100 // reset resources
    });
  };

  const saveEnglishProgress = (levelId, score, stars, points, correct, total, streak) => {
    const nextUnlocked = Math.max(player.english.maxUnlocked, levelId + 1);
    const existingLvl = player.english.levels[levelId] || { stars: 0, bestScore: 0 };
    
    const newLevels = {
      ...player.english.levels,
      [levelId]: {
        stars: Math.max(existingLvl.stars, stars),
        bestScore: Math.max(existingLvl.bestScore, score),
      }
    };

    updatePlayer({
      english: {
        ...player.english,
        maxUnlocked: nextUnlocked > 50 ? 50 : nextUnlocked,
        levels: newLevels,
        totalPoints: player.english.totalPoints + points,
        totalCorrect: player.english.totalCorrect + correct,
        totalAnswered: player.english.totalAnswered + total,
        bestStreak: Math.max(player.english.bestStreak, streak)
      }
    });
  };

  return { 
    player, 
    isLoading, 
    earnXP, 
    addCoins, 
    spendCoins, 
    updatePlayer, 
    updateSkill,
    addBadge,
    markWorldCompleted,
    startNewDay,
    saveEnglishProgress
  };
}
