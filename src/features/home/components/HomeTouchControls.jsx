import React from 'react';

export default function HomeTouchControls({ onTouchStart, onTouchEnd, nearbyStation, onInteract }) {
  const bindEvents = (dir) => ({
    onMouseDown: (e) => { e.preventDefault(); onTouchStart(dir); },
    onMouseUp: (e) => { e.preventDefault(); onTouchEnd(dir); },
    onMouseLeave: (e) => { e.preventDefault(); onTouchEnd(dir); },
    onTouchStart: (e) => { e.preventDefault(); onTouchStart(dir); },
    onTouchEnd: (e) => { e.preventDefault(); onTouchEnd(dir); },
  });

  return (
    <>
      {/* Virtual D-Pad */}
      <div className="touch-controls" aria-label="Movement Controls">
        <div className="touch-dpad">
          <button
            type="button"
            className="touch-btn touch-up"
            {...bindEvents('up')}
            aria-label="Move Up"
          >
            ▲
          </button>
          <button
            type="button"
            className="touch-btn touch-left"
            {...bindEvents('left')}
            aria-label="Move Left"
          >
            ◀
          </button>
          <button
            type="button"
            className="touch-btn touch-right"
            {...bindEvents('right')}
            aria-label="Move Right"
          >
            ▶
          </button>
          <button
            type="button"
            className="touch-btn touch-down"
            {...bindEvents('down')}
            aria-label="Move Down"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Action Button for Touch / Mobile */}
      {nearbyStation && (
        <button
          type="button"
          className="touch-action-btn visible"
          onClick={onInteract}
          title={`Interact with ${nearbyStation.label}`}
          aria-label={`Interact with ${nearbyStation.label}`}
        >
          {nearbyStation.icon}
        </button>
      )}
    </>
  );
}
