import { useMemo } from "react";
import { xpToNextLevel } from "@/features/profile/utils/profileData";
import { useAuth } from "@/features/auth/AuthContext";
import { CoinIcon } from "@/features/hud/components/GameHUD";

/**
 * Profile Header — displays avatar, name, level, XP bar, coins, and quick stats.
 * All values are sourced from the existing player state.
 */
export default function ProfileHeader({ player }) {
  const { user } = useAuth();

  const xpInfo = useMemo(() => xpToNextLevel(player.xp), [player.xp]);
  const xpPct = Math.min(100, Math.round((xpInfo.current / Math.max(xpInfo.needed, 1)) * 100));
  const completedWorlds = (player.completedToday || []).length;
  const displayName = user?.username || player.name || "Explorer";

  return (
    <div className="profile-header profile-fade-in profile-stagger-1">
      {/* Avatar */}
      <div className="profile-avatar-wrap">
        <div className="profile-avatar">
          <svg viewBox="0 0 80 80" aria-hidden="true">
            {/* Body */}
            <rect x="26" y="50" width="12" height="24" rx="6" fill="#3e5c9a" />
            <rect x="42" y="50" width="12" height="24" rx="6" fill="#344e88" />
            <path d="M 20 22 Q 40 14 60 22 L 57 52 Q 40 58 23 52 Z" fill="#22a45d" />
            <path d="M 22 38 Q 40 44 58 38 L 58 44 Q 40 50 22 44 Z" fill="#7a4a21" />
            {/* Arms */}
            <rect x="12" y="22" width="10" height="28" rx="5" fill="#1f8e51" />
            <rect x="58" y="22" width="10" height="28" rx="5" fill="#1f8e51" />
            {/* Head */}
            <circle cx="40" cy="12" r="18" fill="#f8c89b" />
            <path d="M 22 12 a 18 18 0 0 1 36 0 Z" fill="#5b3a29" />
            {/* Eyes */}
            <circle cx="34" cy="14" r="2.5" fill="#292524" />
            <circle cx="46" cy="14" r="2.5" fill="#292524" />
            {/* Smile */}
            <path d="M 34 22 q 6 4 12 0" stroke="#b4562f" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="profile-level-badge" data-testid="profile-level">
          Lv {xpInfo.level}
        </div>
      </div>

      {/* Info */}
      <div className="profile-info">
        <div className="profile-name" data-testid="profile-name">{displayName}</div>
        <div className="profile-tagline">Learning one adventure at a time!</div>

        {/* XP Bar */}
        <div className="profile-xp-bar">
          <div className="profile-xp-label">
            <span>⭐ XP</span>
            <span>{xpInfo.current} / {xpInfo.needed}</span>
          </div>
          <div className="xp-track">
            <div
              className="xp-fill"
              style={{ width: `${xpPct}%` }}
              data-testid="profile-xp-fill"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <CoinIcon className="h-4 w-4" />
            <span className="stat-value" data-testid="profile-coins">{player.coins || 0}</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">🌍</span>
            <span className="stat-value">{completedWorlds}/5</span>
            <span style={{ color: "#64748b" }}>Worlds</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">📅</span>
            <span className="stat-value">Day {player.day || 1}</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{player.xp || 0}</span>
            <span style={{ color: "#64748b" }}>Total XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
