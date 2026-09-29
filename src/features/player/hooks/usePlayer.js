import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export const DEFAULT_PLAYER = {
  id: "offline",
  name: "Explorer",
  level: 1,
  xp: 0,
  coins: 150, // Started with more coins so they can buy seeds
  day: 1,
};

export function usePlayer() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["player"],
    queryFn: async () => {
      try {
        return await apiGet("/player");
      } catch {
        return DEFAULT_PLAYER;
      }
    },
    staleTime: Infinity, // Keep local changes alive
    retry: false,
  });

  const player = data ?? DEFAULT_PLAYER;

  const updatePlayer = (updates) => {
    queryClient.setQueryData(["player"], (old) => {
      const current = old ?? DEFAULT_PLAYER;
      return { ...current, ...updates };
    });
  };

  const earnXP = (amount) => {
    const newXP = player.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
    const leveledUp = newLevel > player.level;
    const coinBonus = leveledUp ? 100 : 0;
    updatePlayer({ xp: newXP, level: newLevel, coins: player.coins + coinBonus });
    return { leveledUp, newLevel, coinBonus };
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

  return { player, isLoading, earnXP, addCoins, spendCoins, updatePlayer };
}
