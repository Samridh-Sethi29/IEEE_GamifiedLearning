import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import api from "@/services/api";
import { migrateState, SCHEMA_VERSION } from "@/services/saveManager";

// Local storage key used as offline/guest cache
const STORAGE_KEY = "skillverse_save";

export const DEFAULT_PLAYER = {
  id: "local",
  name: "Explorer",
  level: 1,
  xp: 0,
  coins: 150,
  day: 1,
  computerProgress: {
    typing: {
      unlocked: true,
      currentLevel: 1,
      lesson1Completed: false,
      lesson2Completed: false,
      completedLevels: [],
    },
    blockCoding: { unlocked: false, currentLevel: 0, completedLevels: [] },
    pythonDebugging: { unlocked: false, currentLevel: 0, completedLevels: [] },
    finalChallenge: { unlocked: false, completed: false },
  },
  water: 100,
  skills: {
    life: 0,
    human: 0,
    digital: 0,
    vocational: 0,
    entrepreneurial: 0,
  },
  flags: {},
  badges: [],
  starLog: [],
  starFragments: 0,
  completedToday: [],
  english: {
    maxUnlocked: 1,
    levels: {},
    totalPoints: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    streak: 0,
    bestStreak: 0,
  },
};

/**
 * Cloud-first player loader:
 *   1. Authenticated → fetch from MongoDB via GET /api/save
 *   2. No cloud save yet → fall back to localStorage cache
 *   3. Guest / offline → localStorage only
 *   4. Nothing found → DEFAULT_PLAYER
 */
async function fetchPlayer() {
  const token = api.getToken();

  if (token) {
    try {
      const res = await api.getSave();
      const cloudSave = res?.save;

      if (cloudSave?.state) {
        const state = migrateState(cloudSave.state, cloudSave.schemaVersion);
        // Warm local cache for offline resilience
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {}
        return state;
      }
    } catch (err) {
      console.warn(
        "[usePlayer] Could not reach cloud save, using local cache:",
        err?.message
      );
    }
  }

  // Guest or offline: read localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return migrateState(JSON.parse(stored)) ?? DEFAULT_PLAYER;
  } catch (e) {
    console.error("[usePlayer] Failed to load local save:", e);
  }

  return DEFAULT_PLAYER;
}

export function usePlayer() {
  const queryClient = useQueryClient();
  // Debounce ref so rapid updates are batched into one cloud write
  const saveTimerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["player"],
    queryFn: fetchPlayer,
    staleTime: Infinity,
    retry: false,
  });

  const player = data ?? DEFAULT_PLAYER;

  /**
   * Persists a player snapshot:
   *  - Immediately to localStorage (fast cache / offline resilience)
   *  - After 1.5 s debounce to MongoDB via PUT /api/save
   */
  const persistToCloud = useCallback((snapshot) => {
    // Immediate local write
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}

    // Debounced cloud write
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const token = api.getToken();
      if (!token) return; // guests: localStorage only

      try {
        await api.putSave({
          schemaVersion: SCHEMA_VERSION,
          day: snapshot.day || 1,
          state: snapshot,
          worldProgress: {},
          clientUpdatedAt: new Date().toISOString(),
          force: true, // In-session updates always win
        });
      } catch (err) {
        // Non-blocking: local cache still intact; saveManager will retry on reconnect
        console.warn("[usePlayer] Background cloud save failed:", err?.message);
      }
    }, 1500);
  }, []);

  const updatePlayer = useCallback(
    (updates) => {
      queryClient.setQueryData(["player"], (old) => {
        const current = old ?? DEFAULT_PLAYER;
        const next = { ...current, ...updates };
        // Deep merge nested objects
        if (updates.skills) {
          next.skills = { ...current.skills, ...updates.skills };
        }
        if (updates.flags) {
          next.flags = { ...current.flags, ...updates.flags };
        }
        if (updates.english && current.english) {
          next.english = { ...current.english, ...updates.english };
        }
        if (updates.computerProgress && current.computerProgress) {
          next.computerProgress = {
            ...current.computerProgress,
            ...updates.computerProgress,
          };
        }

        persistToCloud(next);
        return next;
      });
    },
    [queryClient, persistToCloud]
  );

  const earnXP = useCallback(
    (amount) => {
      const newXP = player.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > player.level;
      const coinBonus = leveledUp ? 100 : 0;
      updatePlayer({ xp: newXP, level: newLevel, coins: player.coins + coinBonus });
      return { leveledUp, newLevel, coinBonus };
    },
    [player, updatePlayer]
  );

  const addCoins = useCallback(
    (amount) => {
      updatePlayer({ coins: player.coins + amount });
    },
    [player, updatePlayer]
  );

  const spendCoins = useCallback(
    (amount) => {
      if (player.coins >= amount) {
        updatePlayer({ coins: player.coins - amount });
        return true;
      }
      return false;
    },
    [player, updatePlayer]
  );

  const updateSkill = useCallback(
    (pillar, amount) => {
      const newSkills = {
        ...player.skills,
        [pillar]: (player.skills[pillar] || 0) + amount,
      };
      updatePlayer({ skills: newSkills });
    },
    [player, updatePlayer]
  );

  const addBadge = useCallback(
    (badgeId) => {
      if (!player.badges.includes(badgeId)) {
        updatePlayer({ badges: [...player.badges, badgeId] });
      }
    },
    [player, updatePlayer]
  );

  const markWorldCompleted = useCallback(
    (worldId) => {
      if (!player.completedToday.includes(worldId)) {
        updatePlayer({ completedToday: [...player.completedToday, worldId] });
      }
    },
    [player, updatePlayer]
  );

  const startNewDay = useCallback(() => {
    updatePlayer({
      day: player.day + 1,
      completedToday: [],
      water: 100,
    });
  }, [player, updatePlayer]);

  const saveEnglishProgress = useCallback(
    (levelId, score, stars, points, correct, total, streak) => {
      const nextUnlocked = Math.max(player.english.maxUnlocked, levelId + 1);
      const existingLvl = player.english.levels[levelId] || {
        stars: 0,
        bestScore: 0,
      };

      const newLevels = {
        ...player.english.levels,
        [levelId]: {
          stars: Math.max(existingLvl.stars, stars),
          bestScore: Math.max(existingLvl.bestScore, score),
        },
      };

      updatePlayer({
        english: {
          ...player.english,
          maxUnlocked: nextUnlocked > 50 ? 50 : nextUnlocked,
          levels: newLevels,
          totalPoints: player.english.totalPoints + points,
          totalCorrect: player.english.totalCorrect + correct,
          totalAnswered: player.english.totalAnswered + total,
          bestStreak: Math.max(player.english.bestStreak, streak),
        },
      });
    },
    [player, updatePlayer]
  );

  /**
   * Triggers a fresh fetch from MongoDB (e.g. after login so cloud data
   * immediately replaces any stale local data).
   */
  const reloadFromCloud = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["player"] });
  }, [queryClient]);

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
    saveEnglishProgress,
    reloadFromCloud,
  };
}
