import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Sparkles, LogOut, Check, CloudOff, Loader2 } from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/AuthContext";
import saveManager from "@/services/saveManager";
import "@/features/profile/styles/profile.css";

import ProfileHeader from "./components/ProfileHeader";
import OverallProgress from "./components/OverallProgress";
import WorldProgressCard from "./components/WorldProgressCard";
import MiniGameProgressCard from "./components/MiniGameProgressCard";
import SkillsBreakdown from "./components/SkillsBreakdown";
import BadgesShowcase from "./components/BadgesShowcase";
import { deriveWorldProgress, deriveMiniGameStatus } from "./utils/profileData";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { player, isLoading } = usePlayer();
  const { user, isGuest, isAuthenticated, logout } = useAuth();

  const [activeFilter, setActiveFilter] = useState("all");
  const [saveStatus, setSaveStatus] = useState(saveManager.getStatus());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derive world progress & mini-games status
  const worldProgress = useMemo(() => deriveWorldProgress(player), [player]);
  const miniGames = useMemo(() => deriveMiniGameStatus(player), [player]);

  const filteredMiniGames = useMemo(() => {
    if (activeFilter === "all") return miniGames;
    return miniGames.filter((g) => g.world === activeFilter);
  }, [miniGames, activeFilter]);

  const completedMiniGamesCount = useMemo(() => {
    return miniGames.filter((g) => g.isCompleted).length;
  }, [miniGames]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(async () => {
        await saveManager.saveOnLogout();
      });
    } finally {
      setIsLoggingOut(false);
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          <div style={{ color: "#94a3b8", fontWeight: 700 }}>Loading Explorer Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/world")}
            className="profile-back-btn"
            style={{ marginBottom: 0 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to World Map</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="profile-back-btn"
                style={{
                  marginBottom: 0,
                  borderColor: "rgba(244,63,94,0.3)",
                  color: "#fda4af",
                }}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="profile-back-btn"
                style={{
                  marginBottom: 0,
                  borderColor: "rgba(16,185,129,0.3)",
                  color: "#6ee7b7",
                }}
              >
                <span>Save Online (Sign In)</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Profile Header */}
        <div style={{ marginBottom: 24 }}>
          <ProfileHeader player={player} />
        </div>

        {/* 2. Overall Summary Stats */}
        <OverallProgress player={player} />

        {/* 3. Core Skill Pillars Breakdown */}
        <SkillsBreakdown skills={player.skills} />

        {/* 4. Badges & Milestones */}
        <BadgesShowcase player={player} />

        {/* 5. Worlds Exploration Progress */}
        <div className="pixel-card profile-fade-in profile-stagger-5" style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div className="section-title" style={{ margin: 0 }}>
              <span className="section-icon">🗺️</span>
              <span>Worlds of SkillVerse</span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#94a3b8",
              }}
            >
              {(player.completedToday || []).length} / {worldProgress.length} Explored Today
            </span>
          </div>

          <div className="worlds-grid">
            {worldProgress.map((world) => (
              <WorldProgressCard key={world.id} world={world} />
            ))}
          </div>
        </div>

        {/* 6. Mini-Games Directory & Status */}
        <div className="pixel-card profile-fade-in profile-stagger-6">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="section-title" style={{ margin: 0 }}>
              <span className="section-icon">🎮</span>
              <span>Mini-Games & Activities</span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#34d399",
                background: "rgba(16,185,129,0.12)",
                padding: "4px 12px",
                borderRadius: 20,
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              {completedMiniGamesCount} / {miniGames.length} Completed
            </span>
          </div>

          {/* Filter Pills */}
          <div className="minigame-filters">
            {[
              { id: "all", label: "All Activities" },
              { id: "home", label: "Explorer Haven (12)" },
              { id: "school", label: "Academy (5)" },
              { id: "farm", label: "Farm (2)" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`minigame-filter-btn ${activeFilter === f.id ? "active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="minigames-grid">
            {filteredMiniGames.map((game) => (
              <MiniGameProgressCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
