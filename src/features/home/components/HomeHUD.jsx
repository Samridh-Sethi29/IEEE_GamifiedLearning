import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROOMS, STATIONS } from "../data/homeData";

export default function HomeHUD({
  currentRoomId = "living",
  completedGames = [],
  player,
  onOpenHelp,
  onTeleport,
}) {
  const navigate = useNavigate();
  const [showQuestList, setShowQuestList] = useState(false);

  const currentRoom = ROOMS[currentRoomId] || ROOMS.living;
  const completedCount = completedGames.length;
  const totalCount = STATIONS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="home-hud">
      {/* Top Left: Back Button & Current Room Pill */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          gap: 10,
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <button
          type="button"
          className="home-back-btn"
          onClick={() => {
            setShowQuestList(false);
            navigate("/world");
          }}
          style={{ position: "static" }}
          title="Return to World Map"
        >
          <span style={{ fontSize: "16px" }}>⬅️</span>
          <span>World Map</span>
        </button>

        <div
          style={{
            padding: "8px 16px",
            background: "rgba(255, 255, 255, 0.92)",
            border: "2px solid rgba(139, 94, 60, 0.3)",
            borderRadius: "16px",
            fontSize: "13px",
            fontWeight: 800,
            color: "#5b3a29",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>📍</span>
          <span>{currentRoom.name}</span>
        </div>
      </div>

      {/* Top Right: Player Stats & Quest Checklist Toggle */}
      <div className="home-stats">
        {/* Quests Completed Button */}
        <button
          type="button"
          onClick={() => setShowQuestList(true)}
          className="home-progress-pill"
          style={{ cursor: "pointer", border: "2px solid #F59E0B" }}
          title="View Home Quest Progress"
        >
          <span>📋</span>
          <span>
            {completedCount}/{totalCount} Done
          </span>
          <span
            style={{
              background: "#22c55e",
              color: "white",
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "8px",
              fontWeight: 800,
            }}
          >
            {progressPercent}%
          </span>
        </button>

        {/* Coins Pill */}
        <div
          className="home-stat-pill"
          style={{ color: "#B45309", background: "#FFFBEB" }}
        >
          <span>🪙</span>
          <span>{player.coins ?? 0}</span>
        </div>

        {/* XP Pill */}
        <div
          className="home-stat-pill"
          style={{ color: "#15803D", background: "#F0FDF4" }}
        >
          <span>⚡</span>
          <span>{player.xp ?? 0} XP</span>
        </div>

        {/* Help / Guide Button */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="home-stat-pill"
          style={{ cursor: "pointer", padding: "8px 12px" }}
          title="How to Play"
        >
          <span>❓</span>
        </button>
      </div>

      {/* Quest Checklist Modal */}
      {showQuestList && (
        <div className="game-overlay" style={{ zIndex: 120 }}>
          <div
            className="game-overlay-backdrop"
            onClick={() => setShowQuestList(false)}
          />
          <div className="game-panel" style={{ maxWidth: "620px" }}>
            <div className="game-header">
              <div className="game-title">
                <div
                  className="game-title-icon"
                  style={{ background: "#FEF3C7", color: "#B45309" }}
                >
                  📋
                </div>
                <div>
                  <h2>Home Learning Activities</h2>
                  <p>
                    {completedCount} of {totalCount} activities completed today
                  </p>
                </div>
              </div>
              <button
                className="game-close"
                onClick={() => setShowQuestList(false)}
                aria-label="Close activity list"
              >
                ✕
              </button>
            </div>

            <div className="game-body">
              {/* Progress bar */}
              <div style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  <span>Overall Mastery</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="game-progress-bar" style={{ height: "10px" }}>
                  <div
                    className="game-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Station List grouped by Room */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "8px",
                  maxHeight: "55vh",
                  overflowY: "auto",
                }}
              >
                {STATIONS.map((station) => {
                  const isDone = completedGames.includes(station.game);
                  const roomObj = ROOMS[station.room];

                  return (
                    <div
                      key={station.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: isDone ? "#F0FDF4" : "#FFFFFF",
                        border: isDone
                          ? "2px solid #BBF7D0"
                          : "2px solid #E2E8F0",
                        borderRadius: "14px",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>{station.icon}</span>
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              color: "#1E293B",
                              fontSize: "14px",
                            }}
                          >
                            {station.label}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Room: {roomObj?.name || station.room} • +
                            {station.coins}🪙 +{station.xp}XP
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {isDone ? (
                          <span
                            style={{
                              background: "#22c55e",
                              color: "white",
                              fontSize: "11px",
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: "12px",
                            }}
                          >
                            ✓ Completed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowQuestList(false);
                              if (onTeleport)
                                onTeleport(station.x, station.y + 40);
                            }}
                            className="game-btn game-btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                          >
                            Go To 📍
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
