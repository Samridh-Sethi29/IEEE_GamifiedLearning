import React from 'react';

export default function HomeAvatar({
  pos,
  velocity = { vx: 0, vy: 0 },
  direction = 'down',
  isWalking = false,
  nearbyStation = null,
  name = 'lavi',
  level = 2,
}) {
  const speed = Math.hypot(velocity.vx || 0, velocity.vy || 0);

  // Dynamic tilt angle when gliding horizontally
  const tilt = direction === 'left' ? -4 : direction === 'right' ? 4 : 0;

  // Eye gaze tracking based on direction
  const eyeOffset = {
    down: { x: 0, y: 0 },
    up: { x: 0, y: -2 },
    left: { x: -2.5, y: 0 },
    right: { x: 2.5, y: 0 },
  }[direction] || { x: 0, y: 0 };

  return (
    <div
      className="home-avatar"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`,
      }}
    >
      {/* Floating Username & Level Badge (Exact match with user image) */}
      <div className="home-nameplate" data-testid="player-nameplate">
        <span className="home-nameplate-text">{name || 'lavi'}</span>
        <span className="home-nameplate-level" data-testid="player-level-chip">
          Lv {level || 1}
        </span>
      </div>

      {/* Interactive prompt emote when near a station */}
      {nearbyStation && (
        <div
          style={{
            position: 'absolute',
            top: '-58px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.96)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#15803d',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            animation: 'prompt-bounce 0.8s ease-in-out infinite',
            zIndex: 25,
          }}
        >
          <span>{nearbyStation.icon}</span>
          <span>Press <strong>E</strong></span>
        </div>
      )}

      {/* Shadow */}
      <div className="avatar-shadow" />

      {/* Character Sprite */}
      <div className={`avatar-sprite ${isWalking ? 'avatar-gliding' : ''}`}>
        <svg
          viewBox="0 0 50 82"
          width="50"
          height="82"
          className="avatar-body"
          style={{ overflow: 'visible' }}
        >
          {/* Back view hair (covers whole head when facing up) */}
          {direction === 'up' && (
            <circle cx="25" cy="24" r="16" fill="#5b3a29" />
          )}

          {/* Legs & Shoes */}
          <g>
            {/* Left Leg */}
            <rect
              className="avatar-leg-left"
              x="16"
              y="59"
              width="8"
              height="20"
              rx="4"
              fill="#3e5c9a"
            />
            {/* Right Leg */}
            <rect
              className="avatar-leg-right"
              x="26"
              y="59"
              width="8"
              height="20"
              rx="4"
              fill="#344e88"
            />
          </g>

          {/* Torso - Green Tunic */}
          <path
            d="M 13 38 Q 25 34 37 38 L 36 62 Q 25 64 14 62 Z"
            fill="#22a45d"
          />

          {/* Brown Belt */}
          <path
            d="M 13.5 50 Q 25 53 36.5 50 L 36.5 54 Q 25 57 13.5 54 Z"
            fill="#7a4a21"
          />

          {/* Arms - Green Pills */}
          <g>
            {/* Left Arm */}
            <rect
              className="avatar-arm-left"
              x="7"
              y="39"
              width="7.5"
              height="24"
              rx="3.75"
              fill="#1f8e51"
            />
            {/* Right Arm */}
            <rect
              className="avatar-arm-right"
              x="35.5"
              y="39"
              width="7.5"
              height="24"
              rx="3.75"
              fill="#1f8e51"
            />
          </g>

          {/* Head & Face (front and side views) */}
          {direction !== 'up' && (
            <g>
              {/* Peach Round Head */}
              <circle cx="25" cy="24" r="16" fill="#f8c89b" />

              {/* Dark Brown Bowl Hair Cut */}
              <path
                d="M 9 24 A 16 16 0 0 1 41 24 Z"
                fill="#5b3a29"
              />

              {/* Eyes & Expression with direction gaze */}
              <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
                {/* Left Beady Eye */}
                <circle cx="19" cy="24.5" r="2.2" fill="#292524" />
                {/* Right Beady Eye */}
                <circle cx="31" cy="24.5" r="2.2" fill="#292524" />

                {/* Curved Warm Smile */}
                <path
                  d="M 21 31 Q 25 34.5 29 31"
                  stroke="#b4562f"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}

          {/* Back of neck / collar when facing up */}
          {direction === 'up' && (
            <ellipse cx="25" cy="38" rx="7" ry="3" fill="#1f8e51" />
          )}
        </svg>
      </div>
    </div>
  );
}
