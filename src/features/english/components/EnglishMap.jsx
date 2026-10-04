import React, { useRef, useEffect, useState } from "react";
import { Lock, Star, Cloud } from "lucide-react";
import PlayerAvatar from "@/features/player/components/PlayerAvatar";
import { motion } from "motion/react";
import { Tree } from "@/features/world/components/locationArt"; // reuse if possible or draw custom

// A custom tree component for the English map
const MapTree = ({ x, y, scale = 1, delay = 0 }) => (
  <motion.g 
    transform={`translate(${x}, ${y}) scale(${scale})`}
    animate={{ rotate: [-2, 2, -2] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <path d="M-10,0 L10,0 L0,-40 Z" fill="#14532d" />
    <circle cx="0" cy="-30" r="20" fill="#166534" />
    <circle cx="-15" cy="-15" r="15" fill="#15803d" />
    <circle cx="15" cy="-15" r="15" fill="#16a34a" />
  </motion.g>
);

export default function EnglishMap({ maxUnlocked, levelsData, onSelectLevel, playerName, playerLevel }) {
  const containerRef = useRef(null);
  
  // Calculate node positions to form a beautiful winding river
  const nodes = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    const isUnlocked = level <= maxUnlocked;
    const isCurrent = level === maxUnlocked;
    const data = levelsData[level] || { stars: 0, bestScore: 0 };
    const isCompleted = data.bestScore > 0;
    
    // Create a snake-like S-curve layout
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    // Width of the map is 1000, so we use 200 to 800 for the points
    const isEvenRow = row % 2 === 0;
    const x = isEvenRow ? 200 + (col * 200) : 800 - (col * 200);
    const y = 150 + (row * 180) + (isEvenRow ? Math.sin(col) * 40 : Math.cos(col) * 40);

    return {
      level, isUnlocked, isCurrent, isCompleted, stars: data.stars, score: data.bestScore, x, y
    };
  });

  // Smooth SVG path generation for the river
  const generatePath = () => {
    if (nodes.length === 0) return "";
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      
      if (i === 0) {
        d += ` Q ${curr.x} ${curr.y}, ${midX} ${midY}`;
      } else {
        d += ` T ${midX} ${midY}`;
      }
    }
    const last = nodes[nodes.length - 1];
    d += ` T ${last.x} ${last.y}`;
    return d;
  };

  const riverPath = generatePath();

  useEffect(() => {
    if (containerRef.current) {
      const current = nodes.find(n => n.isCurrent) || nodes[0];
      containerRef.current.scrollTo({
        top: Math.max(0, current.y - window.innerHeight / 2),
        left: Math.max(0, current.x - window.innerWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [maxUnlocked]);

  // Generate random scenery
  const [scenery] = useState(() => {
    const trees = [];
    const clouds = [];
    for (let i = 0; i < 40; i++) {
      trees.push({
        x: 50 + Math.random() * 900,
        y: 50 + Math.random() * (Math.ceil(50/4) * 180),
        scale: 0.8 + Math.random() * 0.7,
        delay: Math.random() * 2
      });
    }
    for (let i = 0; i < 15; i++) {
      clouds.push({
        y: 100 + Math.random() * (Math.ceil(50/4) * 180),
        duration: 20 + Math.random() * 30,
        delay: -Math.random() * 30,
        scale: 0.5 + Math.random() * 1.5
      });
    }
    return { trees, clouds };
  });

  const mapHeight = Math.ceil(50/4) * 180 + 300;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-auto scroll-smooth cursor-grab active:cursor-grabbing"
      style={{ backgroundColor: "#86efac" }} // Rich grass green
    >
      <div style={{ width: '1000px', height: `${mapHeight}px`, position: 'relative', margin: '0 auto' }}>
        
        {/* Background SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
            </filter>
          </defs>

          {/* Grass texture dots */}
          {Array.from({ length: 100 }).map((_, i) => (
             <circle key={i} cx={Math.random()*1000} cy={Math.random()*mapHeight} r={2+Math.random()*3} fill="#4ade80" opacity="0.5" />
          ))}

          {/* The River Background (Outline for shore) */}
          <path d={riverPath} fill="none" stroke="#fcd34d" strokeWidth="150" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          
          {/* The Water */}
          <path d={riverPath} fill="none" stroke="url(#riverGrad)" strokeWidth="120" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
          
          {/* Water ripples */}
          <path d={riverPath} fill="none" stroke="#60a5fa" strokeWidth="120" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20, 60" opacity="0.4">
            <animate attributeName="stroke-dashoffset" from="0" to="80" dur="4s" repeatCount="indefinite" />
          </path>

          {/* Trees */}
          {scenery.trees.map((t, i) => (
            <MapTree key={`tree-${i}`} x={t.x} y={t.y} scale={t.scale} delay={t.delay} />
          ))}
        </svg>

        {/* Clouds (HTML for easier motion framing) */}
        {scenery.clouds.map((c, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute z-10 pointer-events-none opacity-60 text-white"
            initial={{ x: -200 }}
            animate={{ x: 1200 }}
            transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }}
            style={{ top: c.y, transform: `scale(${c.scale})` }}
          >
            <Cloud size={64} fill="white" />
          </motion.div>
        ))}

        {/* Level Nodes (The Stones) */}
        {nodes.map((node) => {
          let stoneColor = "#94a3b8"; // locked (gray stone)
          let stoneBorder = "#475569";
          let textColor = "#ffffff";
          let scaleClass = "";

          if (node.isCurrent) {
            stoneColor = "#fcd34d"; // glowing yellow stone
            stoneBorder = "#b45309";
            textColor = "#78350f";
            scaleClass = "scale-110 hover:scale-125 animate-pulse-slow";
          } else if (node.isCompleted) {
            stoneColor = "#a7f3d0"; // completed emerald stone
            stoneBorder = "#059669";
            textColor = "#064e3b";
            scaleClass = "hover:scale-110";
          } else if (node.isUnlocked) {
            stoneColor = "#e2e8f0"; // unlocked light stone
            stoneBorder = "#64748b";
            textColor = "#334155";
            scaleClass = "hover:scale-110";
          }

          return (
            <div 
              key={node.level}
              style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
              className="absolute z-20 flex flex-col items-center justify-center"
            >
              {/* Checkpoint sign */}
              {node.level % 10 === 0 && (
                <div className="absolute -top-14 bg-amber-700 text-amber-100 text-xs font-black px-4 py-1.5 rounded-lg border-2 border-amber-900 shadow-xl shadow-amber-900/40 whitespace-nowrap z-30 transform -rotate-3">
                  Check Point {node.level}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-900" />
                </div>
              )}

              {/* Stone Button */}
              <button
                disabled={!node.isUnlocked}
                onClick={() => onSelectLevel(node.level)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${scaleClass}`}
                style={{ width: '85px', height: '85px' }}
              >
                {/* Stone SVG shape */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-xl">
                  <path 
                    d="M 50 5 C 80 10, 95 30, 90 60 C 85 90, 60 95, 30 85 C 5 75, 5 40, 20 15 C 30 5, 40 2, 50 5 Z" 
                    fill={stoneColor} 
                    stroke={stoneBorder} 
                    strokeWidth="6" 
                  />
                  {/* Subtle highlight */}
                  <path d="M 40 15 C 60 18, 75 35, 70 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeLinecap="round" />
                </svg>

                {/* Content over stone */}
                <div className="relative z-10 flex flex-col items-center justify-center mt-2">
                  {!node.isUnlocked ? (
                    <Lock className="w-8 h-8 opacity-60" color={textColor} />
                  ) : (
                    <span className="text-3xl font-black" style={{ color: textColor }}>
                      {node.level}
                    </span>
                  )}
                  
                  {/* Stars container */}
                  {node.isCompleted && (
                    <div className="flex gap-0.5 mt-1 bg-black/20 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
                      {[1,2,3].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= node.stars ? 'fill-yellow-400 text-yellow-400 drop-shadow' : 'fill-black/30 text-transparent'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </button>

              {/* Player Avatar standing ON the stone */}
              {node.isCurrent && (
                <motion.div 
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute pointer-events-none z-40"
                  style={{ left: '50%', bottom: '50px', transform: 'translateX(-50%)' }}
                >
                  <div className="relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white bg-indigo-600 px-3 py-1 rounded-full text-xs font-black shadow-lg animate-bounce border-2 border-indigo-400">
                      YOU
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-indigo-600" />
                    </div>
                    <svg viewBox="-50 -150 100 200" width="100" height="200" className="overflow-visible drop-shadow-2xl">
                      <PlayerAvatar name={playerName} level={playerLevel} x={0} y={0} />
                    </svg>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global styles for this component */}
      <style>{`
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.9; filter: brightness(1.2); }
        }
      `}</style>
    </div>
  );
}
