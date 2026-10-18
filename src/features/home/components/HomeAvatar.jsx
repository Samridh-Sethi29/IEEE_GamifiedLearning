import React from 'react';

export default function HomeAvatar({ pos, direction = 'down', isWalking = false, nearbyStation = null }) {
  // Eye offsets based on direction
  const eyeOffset = {
    down: { x: 0, y: 0 },
    up: { x: 0, y: -3 },
    left: { x: -3, y: 0 },
    right: { x: 3, y: 0 },
  }[direction] || { x: 0, y: 0 };

  return (
    <div
      className="home-avatar"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      {/* Floating prompt / thought bubble when near interactive station */}
      {nearbyStation && (
        <div
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #F59E0B',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#b45309',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            animation: 'prompt-bounce 0.8s ease-in-out infinite',
            zIndex: 15,
          }}
        >
          <span>{nearbyStation.icon}</span>
          <span>Press <strong>E</strong></span>
        </div>
      )}

      {/* Ground drop shadow */}
      <div className="avatar-shadow" />

      {/* Main Avatar Sprite */}
      <div className={`avatar-sprite ${isWalking ? 'avatar-walking' : ''}`}>
        <svg
          viewBox="0 0 48 72"
          width="48"
          height="72"
          className="avatar-body"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Backpack (visible from sides and back) */}
          {direction === 'up' && (
            <rect x="14" y="28" width="20" height="22" rx="6" fill="#8B5E3C" stroke="#5B3A29" strokeWidth="2" />
          )}
          {direction === 'left' && (
            <rect x="28" y="30" width="10" height="18" rx="4" fill="#8B5E3C" stroke="#5B3A29" strokeWidth="1.5" />
          )}
          {direction === 'right' && (
            <rect x="10" y="30" width="10" height="18" rx="4" fill="#8B5E3C" stroke="#5B3A29" strokeWidth="1.5" />
          )}

          {/* Legs & Shoes */}
          <g>
            {/* Left Leg */}
            <rect
              x="16"
              y="50"
              width="6"
              height="14"
              rx="3"
              fill="#1E293B"
              transform={isWalking ? 'rotate(-6 19 50)' : ''}
            />
            {/* Right Leg */}
            <rect
              x="26"
              y="50"
              width="6"
              height="14"
              rx="3"
              fill="#1E293B"
              transform={isWalking ? 'rotate(6 29 50)' : ''}
            />
            {/* Left Shoe */}
            <ellipse cx="18" cy="65" rx="5" ry="3.5" fill="#DC2626" />
            {/* Right Shoe */}
            <ellipse cx="29" cy="65" rx="5" ry="3.5" fill="#DC2626" />
          </g>

          {/* Torso / Shirt */}
          <rect
            x="13"
            y="26"
            width="22"
            height="26"
            rx="6"
            fill="url(#bodyGrad)"
            stroke="#1E40AF"
            strokeWidth="1.5"
          />

          {/* Yellow explorer star emblem on chest */}
          {direction !== 'up' && (
            <g transform="translate(24, 37) scale(0.65)">
              <polygon
                points="0,-6 1.8,-1.8 6.3,-1.8 2.7,0.9 4,5.4 0,2.7 -4,5.4 -2.7,0.9 -6.3,-1.8 -1.8,-1.8"
                fill="#FDE047"
              />
            </g>
          )}

          {/* Arms */}
          <g>
            <rect
              x="8"
              y="28"
              width="5"
              height="16"
              rx="2.5"
              fill="#3B82F6"
              transform={isWalking ? 'rotate(12 10 28)' : ''}
            />
            <circle cx="10.5" cy="45" r="3" fill="#FBD38D" />
            <rect
              x="35"
              y="28"
              width="5"
              height="16"
              rx="2.5"
              fill="#3B82F6"
              transform={isWalking ? 'rotate(-12 37 28)' : ''}
            />
            <circle cx="37.5" cy="45" r="3" fill="#FBD38D" />
          </g>

          {/* Head */}
          <circle
            cx="24"
            cy="18"
            r="13"
            fill="#FBD38D"
            stroke="#E2B16B"
            strokeWidth="1"
          />

          {/* Face Details */}
          {direction !== 'up' && (
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              {/* Cheeks */}
              <circle cx="16" cy="22" r="2.5" fill="#F87171" opacity="0.5" />
              <circle cx="32" cy="22" r="2.5" fill="#F87171" opacity="0.5" />

              {/* Eyes */}
              <circle cx="19" cy="18" r="2.5" fill="#1E293B" />
              <circle cx="29" cy="18" r="2.5" fill="#1E293B" />
              {/* Eye sparkle */}
              <circle cx="18" cy="17" r="1" fill="#FFFFFF" />
              <circle cx="28" cy="17" r="1" fill="#FFFFFF" />

              {/* Happy Smile */}
              <path
                d="M 21 22 Q 24 25 27 22"
                stroke="#B45309"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Explorer Cap / Beret */}
          <g>
            <ellipse cx="24" cy="9" rx="14" ry="5.5" fill="url(#hatGrad)" />
            <path
              d="M 11 9 C 11 2, 37 2, 37 9 Z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1"
            />
            {/* Cap button on top */}
            <circle cx="24" cy="3" r="2" fill="#FEF08A" />
            {/* Cap visor */}
            {direction === 'down' && (
              <path d="M 15 10 C 20 14, 28 14, 33 10 Z" fill="#D97706" />
            )}
            {direction === 'left' && (
              <path d="M 11 10 C 13 13, 22 12, 24 10 Z" fill="#D97706" />
            )}
            {direction === 'right' && (
              <path d="M 24 10 C 26 12, 35 13, 37 10 Z" fill="#D97706" />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
