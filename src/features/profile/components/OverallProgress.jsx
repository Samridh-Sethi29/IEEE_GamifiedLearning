import { useMemo } from "react";
import { deriveOverallStats } from "@/features/profile/utils/profileData";

/**
 * Overall Progress — compact tiles summarizing the player's adventure.
 */
export default function OverallProgress({ player }) {
  const stats = useMemo(() => deriveOverallStats(player), [player]);

  const tiles = [
    { icon: "⭐", value: stats.level, label: "Level" },
    { icon: "✨", value: stats.xp.toLocaleString(), label: "Total XP" },
    { icon: "🪙", value: stats.coins.toLocaleString(), label: "Coins" },
    { icon: "🌍", value: `${stats.completedWorlds}/${stats.totalWorlds}`, label: "Worlds" },
    { icon: "🎮", value: `${stats.completedMiniGames}/${stats.totalMiniGames}`, label: "Mini-Games" },
    { icon: "📅", value: stats.day, label: "Day" },
  ];

  return (
    <div className="overall-progress profile-fade-in profile-stagger-2">
      {tiles.map((tile) => (
        <div key={tile.label} className="progress-tile">
          <span className="tile-icon">{tile.icon}</span>
          <div className="tile-value">{tile.value}</div>
          <div className="tile-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
