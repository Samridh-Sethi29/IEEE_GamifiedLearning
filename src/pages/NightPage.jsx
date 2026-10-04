import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { Moon, Star } from "lucide-react";

export default function NightPage() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  const skills = player.skills || { life: 0, human: 0, digital: 0, vocational: 0, entrepreneurial: 0 };
  const maxSkill = Math.max(10, ...Object.values(skills));
  
  // Very simple SVG radar chart calculations
  const center = 150;
  const radius = 100;
  
  const points = [
    { name: "Life", angle: -Math.PI / 2, val: skills.life },
    { name: "Human", angle: -Math.PI / 2 + (2 * Math.PI) / 5, val: skills.human },
    { name: "Digital", angle: -Math.PI / 2 + (4 * Math.PI) / 5, val: skills.digital },
    { name: "Vocational", angle: -Math.PI / 2 + (6 * Math.PI) / 5, val: skills.vocational },
    { name: "Entrepreneurial", angle: -Math.PI / 2 + (8 * Math.PI) / 5, val: skills.entrepreneurial },
  ];

  const getPoint = (angle, value) => {
    const r = (value / maxSkill) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  };
  
  const polygonPoints = points.map(p => getPoint(p.angle, p.val)).join(" ");
  const basePolygonPoints = points.map(p => getPoint(p.angle, maxSkill)).join(" ");

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 border-b border-slate-700 pb-6"
        >
          <Moon className="h-10 w-10 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-black text-white">Day {player.day} Summary</h1>
            <p className="text-slate-400">Time to rest and reflect on your growth, {player.name}.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="text-amber-400 h-5 w-5" /> Skill Pillars
            </h2>
            <div className="relative w-full aspect-square flex items-center justify-center">
              <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
                {/* Background grid */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                  <polygon 
                    key={scale}
                    points={points.map(p => getPoint(p.angle, maxSkill * scale)).join(" ")}
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="1"
                  />
                ))}
                {/* Axes */}
                {points.map((p, i) => (
                  <line 
                    key={i}
                    x1={center} y1={center} 
                    x2={center + radius * Math.cos(p.angle)} 
                    y2={center + radius * Math.sin(p.angle)} 
                    stroke="rgba(255,255,255,0.2)" strokeWidth="1"
                  />
                ))}
                {/* Data polygon */}
                <polygon points={polygonPoints} fill="rgba(16, 185, 129, 0.4)" stroke="#34d399" strokeWidth="3" />
                
                {/* Labels */}
                {points.map((p, i) => {
                  const labelRadius = radius + 25;
                  const lx = center + labelRadius * Math.cos(p.angle);
                  const ly = center + labelRadius * Math.sin(p.angle);
                  return (
                    <text key={i} x={lx} y={ly} fill="#94a3b8" fontSize="12" textAnchor="middle" dominantBaseline="middle" className="font-bold">
                      {p.name}
                    </text>
                  );
                })}
              </svg>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Daily Resources</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900 rounded-xl p-3">
                  <span className="text-slate-400">Coins</span>
                  <span className="font-bold text-amber-400">{player.coins}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 rounded-xl p-3">
                  <span className="text-slate-400">Water Saved</span>
                  <span className="font-bold text-blue-400">{player.water} L</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 rounded-xl p-3">
                  <span className="text-slate-400">XP</span>
                  <span className="font-bold text-emerald-400">{player.xp}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Badges Earned</h2>
              {player.badges && player.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {player.badges.map(b => (
                    <span key={b} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium border border-indigo-500/30">
                      {b}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No badges earned yet. Keep exploring!</p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex justify-end pt-4"
        >
          <button 
            onClick={() => navigate("/dream")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 flex items-center gap-2"
          >
            Go to Sleep <Moon className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
