import React, { useRef, useEffect } from "react";
import { Lock, Star, CheckCircle2 } from "lucide-react";
import PlayerAvatar from "@/features/player/components/PlayerAvatar";
import { motion } from "motion/react";

export default function EnglishMap({ maxUnlocked, levelsData, onSelectLevel, playerName, playerLevel }) {
  const containerRef = useRef(null);

  // Generate 50 nodes along a winding path
  const nodes = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    const isUnlocked = level <= maxUnlocked;
    const isCurrent = level === maxUnlocked;
    const data = levelsData[level] || { stars: 0, bestScore: 0 };
    const isCompleted = data.bestScore > 0;
    
    // Winding path math for visuals
    const row = Math.floor(i / 5);
    const col = i % 5;
    const xBase = (row % 2 === 0) ? (col * 180 + 100) : (820 - col * 180);
    const yBase = row * 180 + 150;
    
    // Add a bit of natural jitter
    const x = xBase + (Math.sin(level) * 20);
    const y = yBase + (Math.cos(level) * 20);

    return {
      level, isUnlocked, isCurrent, isCompleted, stars: data.stars, score: data.bestScore, x, y
    };
  });

  // Calculate SVG path string
  const pathD = nodes.map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`)).join(" ");

  // Auto-scroll to current unlocked level
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

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-auto scroll-smooth cursor-grab active:cursor-grabbing"
      style={{ backgroundColor: "#bbf7d0" }} // light green background
    >
      <div style={{ width: '1000px', height: `${Math.ceil(50/5) * 180 + 300}px`, position: 'relative', margin: '0 auto' }}>
        
        {/* Background decorations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* The winding path */}
          <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          <path d={pathD} fill="none" stroke="#d1d5db" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="15, 15" opacity="0.4" />
        </svg>

        {/* Level Nodes */}
        {nodes.map((node) => {
          let bgClass = "bg-slate-300";
          let borderClass = "border-slate-400";
          
          if (node.isCurrent) {
            bgClass = "bg-white";
            borderClass = "border-indigo-500 border-4 shadow-lg shadow-indigo-500/50";
          } else if (node.isCompleted) {
            bgClass = "bg-emerald-100";
            borderClass = "border-emerald-400 border-4 shadow-md";
          } else if (node.isUnlocked) {
            bgClass = "bg-white";
            borderClass = "border-indigo-300 border-2";
          }

          return (
            <div 
              key={node.level}
              style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
              className="absolute"
            >
              {/* Checkpoint marker */}
              {node.level % 10 === 0 && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Checkpoint {node.level}
                </div>
              )}

              {/* Node Button */}
              <button
                disabled={!node.isUnlocked}
                onClick={() => onSelectLevel(node.level)}
                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 ${bgClass} ${borderClass}`}
              >
                {!node.isUnlocked && <Lock className="w-6 h-6 text-slate-500 mb-1" />}
                
                {node.isUnlocked && (
                  <span className={`text-xl font-black ${node.isCurrent ? 'text-indigo-600' : (node.isCompleted ? 'text-emerald-700' : 'text-slate-700')}`}>
                    {node.level}
                  </span>
                )}
                
                {/* Stars container */}
                {node.isCompleted && (
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= node.stars ? 'fill-yellow-400 text-yellow-500' : 'fill-slate-200 text-slate-300'}`} />
                    ))}
                  </div>
                )}
              </button>

              {/* Player Avatar positioned on current node */}
              {node.isCurrent && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute pointer-events-none z-10"
                  style={{ left: '50%', bottom: '80px', transform: 'translateX(-50%)' }}
                >
                  <div className="relative">
                    {/* Tiny bouncing indicator */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-indigo-600 animate-bounce">
                      ▼
                    </div>
                    {/* SVG ViewBox for existing avatar component */}
                    <svg viewBox="-50 -150 100 200" width="80" height="160" className="overflow-visible">
                      <PlayerAvatar name={playerName} level={playerLevel} x={0} y={0} />
                    </svg>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
