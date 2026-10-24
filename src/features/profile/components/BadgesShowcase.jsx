import { useMemo } from "react";
import { deriveBadges } from "@/features/profile/utils/profileData";

/**
 * BadgesShowcase — displays earned and discoverable badges and milestones.
 * Integrates with player.badges and world exploration achievements.
 */
export default function BadgesShowcase({ player }) {
  const badges = useMemo(() => deriveBadges(player), [player]);
  const earnedCount = badges.filter((b) => b.isEarned).length;

  return (
    <div className="pixel-card profile-fade-in profile-stagger-4" style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div className="section-title" style={{ margin: 0 }}>
          <span className="section-icon">🏅</span>
          <span>Badges & Milestones</span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#fbbf24",
            background: "rgba(250, 204, 21, 0.12)",
            padding: "4px 12px",
            borderRadius: 20,
            border: "1px solid rgba(250, 204, 21, 0.25)",
          }}
        >
          {earnedCount} / {badges.length} Unlocked
        </span>
      </div>

      <div className="badges-grid">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.isEarned ? "earned" : "locked"}`}
          >
            <div className="badge-icon-wrap">
              <span>{badge.isEarned ? badge.icon : "🔒"}</span>
            </div>
            <div className="badge-info">
              <div className="badge-world">{badge.world}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
              <span className="badge-status-tag">
                {badge.isEarned ? "Unlocked" : "Locked"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
