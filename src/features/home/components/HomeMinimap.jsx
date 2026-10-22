import React from 'react';
import { ROOMS, STATIONS, HOME_MAP } from '../data/homeData';

export default function HomeMinimap({ pos, cam, viewportSize = { w: 1200, h: 800 }, completedGames = [], onTeleport }) {
  const mapWidth = 200;
  const mapHeight = 100;
  const scaleX = mapWidth / HOME_MAP.width;
  const scaleY = mapHeight / HOME_MAP.height;

  // Viewport box in minimap coordinates
  const vpX = Math.max(0, -cam.x * scaleX);
  const vpY = Math.max(0, -cam.y * scaleY);
  const vpW = Math.min(mapWidth - vpX, (viewportSize.w || 1200) * scaleX);
  const vpH = Math.min(mapHeight - vpY, (viewportSize.h || 800) * scaleY);

  // Player position in minimap
  const playerX = pos.x * scaleX;
  const playerY = pos.y * scaleY;

  return (
    <div className="home-minimap" title="Home Minimap - Click a room to fast-travel">
      {/* Background with rooms */}
      <svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        {Object.values(ROOMS).map((room) => {
          const rx = room.x * scaleX;
          const ry = room.y * scaleY;
          const rw = room.w * scaleX;
          const rh = room.h * scaleY;

          return (
            <g
              key={room.id}
              onClick={() => onTeleport && onTeleport(room.x + room.w / 2, room.y + room.h / 2)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill={room.bg}
                stroke="#8b5e3c"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
              <text
                x={rx + rw / 2}
                y={ry + rh / 2}
                fontSize="6"
                fontWeight="700"
                fill="#5b3a29"
                textAnchor="middle"
                dominantBaseline="middle"
                opacity="0.75"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {room.name}
              </text>
            </g>
          );
        })}

        {/* Stations as tiny dots */}
        {STATIONS.map((station) => {
          const sx = station.x * scaleX;
          const sy = station.y * scaleY;
          const isDone = completedGames.includes(station.game);

          return (
            <circle
              key={station.id}
              cx={sx}
              cy={sy}
              r={isDone ? 2.5 : 2}
              fill={isDone ? '#8B5CF6' : '#F59E0B'}
              stroke="#FFFFFF"
              strokeWidth="0.6"
            />
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={vpX}
          y={vpY}
          width={vpW}
          height={vpH}
          fill="rgba(245, 158, 11, 0.12)"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeDasharray="2 1"
          rx="2"
        />

        {/* Player marker */}
        <circle
          cx={playerX}
          cy={playerY}
          r="4"
          fill="#22C55E"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        <circle
          cx={playerX}
          cy={playerY}
          r="6"
          fill="none"
          stroke="#22C55E"
          strokeWidth="0.8"
          opacity="0.6"
        >
          <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
