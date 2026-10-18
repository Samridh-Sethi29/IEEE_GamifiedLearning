import React from 'react';

export default function HomeStationMarker({ station, isNearby = false, isCompleted = false, onInteract }) {
  return (
    <div
      className={`station-marker ${isNearby ? 'nearby' : ''} ${isCompleted ? 'completed' : ''}`}
      style={{
        left: `${station.x}px`,
        top: `${station.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onInteract}
      role="button"
      tabIndex={0}
      aria-label={`${station.label} Station`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInteract();
        }
      }}
    >
      {/* Floating Prompt on Proximity */}
      {isNearby && (
        <div className="station-prompt">
          <span>{isCompleted ? 'Play Again ↻' : 'Press E / Tap 👆'}</span>
        </div>
      )}

      {/* Main Station Icon Circle */}
      <div className="station-icon">
        <span>{station.icon}</span>

        {/* Completed Checkmark Badge */}
        {isCompleted && (
          <div className="station-checkmark" title="Completed!">
            ✓
          </div>
        )}
      </div>

      {/* Station Title Label */}
      <div className="station-label">
        <span>{station.label}</span>
      </div>

      {/* Mini Rewards Pill */}
      <div
        style={{
          marginTop: '3px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10px',
          fontWeight: 700,
          background: isCompleted ? '#ede9fe' : '#fef3c7',
          color: isCompleted ? '#6d28d9' : '#92400e',
          padding: '2px 8px',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: isCompleted ? '1px solid #ddd6fe' : '1px solid #fde68a',
        }}
      >
        <span>+{station.coins}🪙</span>
        <span>+{station.xp}XP</span>
      </div>
    </div>
  );
}
