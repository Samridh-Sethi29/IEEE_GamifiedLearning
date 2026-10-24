import { Link } from "react-router-dom";

/**
 * WorldProgressCard — displays a single world's progress with its color theme,
 * status badge, progress bar, and navigation action.
 */
export default function WorldProgressCard({ world }) {
  const { name, icon, color, colorDeep, description, route, status, isCompleted, progressPercent, activities } = world;

  const statusLabel = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "not-started": "Not Started",
  };

  const statusIcon = {
    "completed": "✅",
    "in-progress": "🔵",
    "not-started": "⚪",
  };

  const actionLabel = isCompleted ? "Visit World" : status === "in-progress" ? "Continue Adventure" : "Start Adventure";

  return (
    <div
      className="world-card"
      style={{
        borderColor: `${color}22`,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${colorDeep})`,
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* Header */}
      <div className="world-card-header">
        <div
          className="world-icon-wrap"
          style={{ background: `${color}15`, border: `2px solid ${color}25` }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="world-card-title">{name}</div>
          <div className="world-card-desc">{description}</div>
        </div>
        <span className={`world-status ${status}`}>
          {statusIcon[status]} {statusLabel[status]}
        </span>
      </div>

      {/* Progress Bar */}
      {progressPercent !== null && (
        <div className="world-progress-bar">
          <div className="world-progress-track">
            <div
              className="world-progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${color}, ${colorDeep})`,
              }}
            />
          </div>
          <div className="world-progress-text">
            {activities ? (
              <>
                <span>{activities.completed}/{activities.total} activities</span>
                <span>{progressPercent}%</span>
              </>
            ) : (
              <>
                <span>{isCompleted ? "Complete!" : "Explore to track"}</span>
                <span>{progressPercent}%</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* If no percentage is calculable, show a simple status message */}
      {progressPercent === null && (
        <div style={{ margin: "12px 0", fontSize: 12, color: "#64748b", fontWeight: 600 }}>
          {isCompleted ? "✅ World completed today!" : "Visit to begin your adventure"}
        </div>
      )}

      {/* Action */}
      {route && (
        <Link
          to={route}
          className="world-action-btn"
          style={{ background: `linear-gradient(135deg, ${color}, ${colorDeep})` }}
        >
          {isCompleted ? "🏠" : "🚀"} {actionLabel}
        </Link>
      )}
    </div>
  );
}
