import React, { useState, useMemo } from "react";
import {
  Trophy,
  Award,
  ShoppingBag,
  Briefcase,
  TrendingUp,
  Heart,
  PackageCheck,
  Coins,
  LineChart,
  Megaphone,
  Tag,
  Store,
  Crown,
  Home,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Terminal,
  GraduationCap,
  Sprout,
  Wheat,
  Feather,
  BookMarked,
  Droplet,
  Lock,
  CheckCircle2,
  Clock,
  Flame,
} from "lucide-react";
import {
  BADGE_DEFINITIONS,
  RARITY_CONFIG,
  getBadgesByWorld,
} from "@/features/achievements/data/badgeDefinitions";
import {
  normalizeAchievements,
  getBadgeProgress,
} from "@/features/achievements/engine/achievementEngine";

const ICON_MAP = {
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  heart: Heart,
  "package-check": PackageCheck,
  award: Award,
  coins: Coins,
  "line-chart": LineChart,
  megaphone: Megaphone,
  tag: Tag,
  store: Store,
  crown: Crown,
  home: Home,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  "book-open": BookOpen,
  terminal: Terminal,
  "graduation-cap": GraduationCap,
  sprout: Sprout,
  wheat: Wheat,
  feather: Feather,
  "book-marked": BookMarked,
  droplet: Droplet,
};

const WORLD_TABS = [
  { id: "all", label: "All Worlds", icon: "🌐" },
  { id: "market", label: "Market", icon: "🏪" },
  { id: "home", label: "Home Haven", icon: "🏡" },
  { id: "farm", label: "Farm Fields", icon: "🌾" },
  { id: "school", label: "Academy", icon: "🎓" },
  { id: "studio", label: "Creator Studio", icon: "🎨" },
];

export default function BadgesShowcase({ player }) {
  const [selectedWorld, setSelectedWorld] = useState("market");
  const [marketCategory, setMarketCategory] = useState("all"); // "all" | "market_management" | "business_growth"

  const achievements = useMemo(
    () => normalizeAchievements(player?.achievements),
    [player?.achievements]
  );

  // Derive all badge progression states
  const badgesWithProgress = useMemo(() => {
    return BADGE_DEFINITIONS.map((badge) => {
      const progress = getBadgeProgress(badge, achievements);
      return {
        ...badge,
        progress,
        isUnlocked: progress.state === "unlocked",
        isInProgress: progress.state === "in-progress",
        isLocked: progress.state === "locked",
      };
    });
  }, [achievements]);

  // Overall Statistics
  const totalBadges = BADGE_DEFINITIONS.length;
  const unlockedBadgesList = useMemo(
    () => badgesWithProgress.filter((b) => b.isUnlocked),
    [badgesWithProgress]
  );
  const unlockedCount = unlockedBadgesList.length;
  const completionPercentage = Math.round((unlockedCount / Math.max(1, totalBadges)) * 100);

  // Recently Unlocked (sorted newest first)
  const recentlyUnlocked = useMemo(() => {
    return [...unlockedBadgesList]
      .filter((b) => b.progress.unlockedAt)
      .sort((a, b) => new Date(b.progress.unlockedAt) - new Date(a.progress.unlockedAt))
      .slice(0, 3);
  }, [unlockedBadgesList]);

  // Upcoming in-progress achievements closest to completion
  const upcomingBadges = useMemo(() => {
    return badgesWithProgress
      .filter((b) => b.isInProgress)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 3);
  }, [badgesWithProgress]);

  // Filtered Badges for Display
  const filteredBadges = useMemo(() => {
    return badgesWithProgress.filter((b) => {
      if (selectedWorld !== "all" && b.world !== selectedWorld) return false;
      if (
        selectedWorld === "market" &&
        marketCategory !== "all" &&
        b.category !== marketCategory
      ) {
        return false;
      }
      return true;
    });
  }, [badgesWithProgress, selectedWorld, marketCategory]);

  return (
    <div className="pixel-card profile-fade-in profile-stagger-4" style={{ marginBottom: 28 }}>
      {/* ─── SECTION TITLE ────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div className="section-title" style={{ margin: 0 }}>
          <span className="section-icon">🏆</span>
          <span>Achievements & Badges Gallery</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#fbbf24",
              background: "rgba(250, 204, 21, 0.12)",
              padding: "4px 14px",
              borderRadius: 20,
              border: "1px solid rgba(250, 204, 21, 0.3)",
            }}
          >
            {unlockedCount} / {totalBadges} Badges ({completionPercentage}%)
          </span>
        </div>
      </div>

      {/* ─── OVERVIEW BANNER ──────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
          border: "2px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* Progress Gauge */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
                Collection Progress
              </span>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8" }}>
                {completionPercentage}% Complete
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 10,
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${completionPercentage}%`,
                  background: "linear-gradient(90deg, #38bdf8 0%, #34d399 50%, #facc15 100%)",
                  borderRadius: 10,
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>
          </div>

          {/* Recently Unlocked */}
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 6,
              }}
            >
              <Sparkles style={{ width: 13, height: 13, color: "#facc15" }} />
              Recently Unlocked
            </span>
            {recentlyUnlocked.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recentlyUnlocked.map((b) => (
                  <span
                    key={b.id}
                    title={`${b.name} (${new Date(b.progress.unlockedAt).toLocaleDateString()})`}
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#f8fafc",
                      background: "rgba(250, 204, 21, 0.15)",
                      border: "1px solid rgba(250, 204, 21, 0.3)",
                      padding: "3px 10px",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>🎖️</span> {b.name}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                Start playing in Market World to earn your first badges!
              </span>
            )}
          </div>

          {/* Upcoming Milestone */}
          {upcomingBadges.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 6,
                }}
              >
                <Flame style={{ width: 13, height: 13, color: "#fb923c" }} />
                Next Up
              </span>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fdba74" }}>
                {upcomingBadges[0].name} ({upcomingBadges[0].progress.current} / {upcomingBadges[0].progress.target})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── WORLD TABS ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        {WORLD_TABS.map((tab) => {
          const isActive = selectedWorld === tab.id;
          const count = badgesWithProgress.filter(
            (b) => (tab.id === "all" || b.world === tab.id) && b.isUnlocked
          ).length;
          const total = badgesWithProgress.filter(
            (b) => tab.id === "all" || b.world === tab.id
          ).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedWorld(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                border: "2px solid",
                borderColor: isActive ? "#38bdf8" : "rgba(255, 255, 255, 0.08)",
                background: isActive ? "rgba(56, 189, 248, 0.15)" : "rgba(30, 41, 59, 0.5)",
                color: isActive ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.8,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: isActive ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.06)",
                }}
              >
                {count}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── MARKET SUB-CATEGORIES ─────────────────────────────────── */}
      {selectedWorld === "market" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            paddingLeft: 4,
          }}
        >
          {[
            { id: "all", label: "All Market (12)" },
            { id: "market_management", label: "Market Management (6)" },
            { id: "business_growth", label: "Business Growth (6)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setMarketCategory(cat.id)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                border: "1px solid",
                borderColor: marketCategory === cat.id ? "#fbbf24" : "rgba(255, 255, 255, 0.08)",
                background: marketCategory === cat.id ? "rgba(250, 204, 21, 0.15)" : "transparent",
                color: marketCategory === cat.id ? "#fbbf24" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── BADGES GALLERY GRID ──────────────────────────────────── */}
      <div className="badges-grid">
        {filteredBadges.map((badge) => {
          const IconComp = ICON_MAP[badge.icon] || Trophy;
          const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
          const { isUnlocked, isInProgress, isLocked, progress } = badge;

          return (
            <div
              key={badge.id}
              className={`badge-card ${isUnlocked ? "earned" : isLocked ? "locked" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderColor: isUnlocked
                  ? "rgba(250, 204, 21, 0.4)"
                  : isInProgress
                  ? "rgba(56, 189, 248, 0.35)"
                  : "rgba(255, 255, 255, 0.06)",
                background: isUnlocked
                  ? "rgba(30, 41, 59, 0.95)"
                  : isInProgress
                  ? "rgba(15, 23, 42, 0.85)"
                  : "rgba(15, 23, 42, 0.5)",
                boxShadow: isUnlocked
                  ? "0 4px 20px rgba(250, 204, 21, 0.12)"
                  : isInProgress
                  ? "0 4px 16px rgba(56, 189, 248, 0.1)"
                  : "none",
              }}
            >
              <div>
                {/* Header: Icon, Rarity, XP */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    className="badge-icon-wrap"
                    style={{
                      background: isUnlocked
                        ? `radial-gradient(circle, ${rarity.bg} 0%, rgba(30, 41, 59, 0.9) 100%)`
                        : "rgba(255, 255, 255, 0.05)",
                      borderColor: isUnlocked ? rarity.border : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {isUnlocked ? (
                      <IconComp style={{ width: 22, height: 22, color: rarity.color }} />
                    ) : isInProgress ? (
                      <IconComp style={{ width: 22, height: 22, color: "#38bdf8", opacity: 0.85 }} />
                    ) : (
                      <Lock style={{ width: 20, height: 20, color: "#64748b" }} />
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: rarity.border,
                        background: `${rarity.color}20`,
                        border: `1px solid ${rarity.border}40`,
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}
                    >
                      {rarity.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: "#fbbf24",
                        background: "rgba(250, 204, 21, 0.1)",
                        padding: "1px 6px",
                        borderRadius: 8,
                      }}
                    >
                      +{badge.rewardXP} XP
                    </span>
                  </div>
                </div>

                {/* Badge Info */}
                <div className="badge-info">
                  <div className="badge-world">
                    {badge.world} • {badge.category?.replace("_", " ")}
                  </div>
                  <div className="badge-name" style={{ color: isUnlocked ? "#f8fafc" : isInProgress ? "#e2e8f0" : "#94a3b8" }}>
                    {badge.name}
                  </div>
                  <div className="badge-desc" style={{ marginBottom: 12 }}>
                    {badge.description}
                  </div>
                </div>
              </div>

              {/* Progress & Status Footer */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: 10, marginTop: 6 }}>
                {isUnlocked ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#34d399",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircle2 style={{ width: 14, height: 14 }} /> Unlocked
                    </span>
                    {progress.unlockedAt && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Clock style={{ width: 10, height: 10 }} />
                        {new Date(progress.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        fontWeight: 800,
                        color: isInProgress ? "#38bdf8" : "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      <span>{isInProgress ? "In Progress" : "Locked"}</span>
                      <span>
                        {progress.current} / {progress.target} ({progress.percentage}%)
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress.percentage}%`,
                          background: isInProgress
                            ? "linear-gradient(90deg, #38bdf8 0%, #34d399 100%)"
                            : "rgba(255, 255, 255, 0.15)",
                          borderRadius: 6,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
