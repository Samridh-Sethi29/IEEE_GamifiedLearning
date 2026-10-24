/**
 * MiniGameProgressCard — shows a single mini-game's status.
 * Displays completion, best score, and attempts when tracked.
 */
export default function MiniGameProgressCard({ game }) {
  const { name, icon, worldName, isCompleted, bestScore, attempts, coins, xp } = game;

  const bgColor = isCompleted ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)";
  const borderColor = isCompleted ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)";

  return (
    <div
      className="minigame-card"
      style={{ background: bgColor, borderColor }}
    >
      <div className="minigame-card-header">
        <div
          className="minigame-icon"
          style={{
            background: isCompleted ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${isCompleted ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="minigame-name">{name}</div>
          <div className="minigame-world-tag">{worldName}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {isCompleted ? (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(16,185,129,0.15)",
              color: "#34d399",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              border: "1px solid rgba(16,185,129,0.25)",
            }}>
              ✅ Done
            </span>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(100,116,139,0.15)",
              color: "#94a3b8",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              border: "1px solid rgba(100,116,139,0.25)",
            }}>
              Not Played
            </span>
          )}
        </div>
      </div>

      <div className="minigame-stats">
        {coins > 0 && (
          <div className="minigame-stat">🪙 <span>{coins}</span> coins</div>
        )}
        {xp > 0 && (
          <div className="minigame-stat">⭐ <span>{xp}</span> XP</div>
        )}
        {bestScore !== null && (
          <div className="minigame-stat">🏆 Best: <span>{bestScore}</span></div>
        )}
        {attempts !== null && (
          <div className="minigame-stat">🔄 <span>{attempts}</span> answers</div>
        )}
      </div>
    </div>
  );
}
