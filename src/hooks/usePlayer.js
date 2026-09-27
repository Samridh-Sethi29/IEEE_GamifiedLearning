import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// Mirrors the Player Pydantic model in backend/models/player.py. The frontend is
// intentionally plain JavaScript (no TS interfaces) — keep this shape in sync by hand.
export const DEFAULT_PLAYER = {
  id: "offline",
  name: "Explorer",
  level: 1,
  xp: 0,
  coins: 50,
  day: 1,
};

// One save slot: GET /api/player creates it on first read, PATCH mutates it.
export function usePlayer() {
  const { data, isLoading } = useQuery({
    queryKey: ["player"],
    queryFn: async () => {
      try {
        return await apiGet("/player");
      } catch {
        // Backend paused / offline (e.g. static preview) — play on with defaults.
        return DEFAULT_PLAYER;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  return { player: data ?? DEFAULT_PLAYER, isLoading };
}
