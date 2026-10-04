import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const LEVELS = [
  { name: "Hydrogen", symbol: "H", p: 1, n: 0, e: 1 },
  { name: "Helium", symbol: "He", p: 2, n: 2, e: 2 },
  { name: "Carbon", symbol: "C", p: 6, n: 6, e: 6 },
  { name: "Oxygen", symbol: "O", p: 8, n: 8, e: 8 }
];

export default function BuildAtomGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 intro, 1 game, 2 level end, 3 complete
  const [levelIdx, setLevelIdx] = useState(0);
  
  const [protons, setProtons] = useState(0);
  const [neutrons, setNeutrons] = useState(0);
  const [electrons, setElectrons] = useState(0);

  const level = LEVELS[levelIdx];
  const isMatch = protons === level?.p && neutrons === level?.n && electrons === level?.e;

  useEffect(() => {
    if (step === 1 && isMatch) {
      setTimeout(() => setStep(2), 1000);
    }
  }, [protons, neutrons, electrons, step, isMatch]);

  const resetAtom = () => {
    setProtons(0);
    setNeutrons(0);
    setElectrons(0);
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(i => i + 1);
      resetAtom();
      setStep(1);
    } else {
      const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
      if (!saved["atoms-game"]) {
        saved["atoms-game"] = true;
        localStorage.setItem("chemistry_progress", JSON.stringify(saved));
        earnXP(100);
      }
      setStep(3);
    }
  };

  const particleOrbit = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i * 360) / count;
      return (
        <motion.div
          key={`e-${i}`}
          initial={{ rotate: angle }}
          animate={{ rotate: angle + 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 m-auto w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] border border-blue-500/20 rounded-full"
        >
          <div className="absolute top-0 left-1/2 -ml-2 -mt-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] flex items-center justify-center text-[8px] font-bold text-white">e⁻</div>
        </motion.div>
      );
    });
  };

  const particleNucleus = () => {
    const particles = [];
    for(let i=0; i<protons; i++) particles.push('p');
    for(let i=0; i<neutrons; i++) particles.push('n');
    
    // Sort randomly but deterministically based on count to keep it stable
    // Actually just displaying them in a small cluster
    return particles.map((p, i) => {
      const angle = (i * 360) / particles.length;
      const radius = Math.min(20 + Math.random() * 10, particles.length * 2);
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      
      return (
        <motion.div 
          key={`${p}-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1, x, y }}
          className={`absolute w-4 h-4 rounded-full ${p === 'p' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`}
        />
      );
    });
  };

  if (step === 0) {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl"
        >
          <div className="text-6xl mb-6 drop-shadow-md">⚛️</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">BUILD THE ATOM</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Place the particles correctly and build the atom.</p>
          
          <button 
            onClick={() => setStep(1)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all"
          >
            START BUILDING
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col font-sans overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/chemistry")}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-[14px] font-bold text-slate-200 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-20 px-4 w-full max-w-4xl mx-auto z-10">
        
        {level && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              Build: {level.name}
            </h2>
            <div className="flex gap-4 justify-center text-sm font-bold">
              <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full">Target p: {level.p}</div>
              <div className="bg-slate-500/20 text-slate-300 border border-slate-500/30 px-3 py-1 rounded-full">Target n: {level.n}</div>
              <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">Target e⁻: {level.e}</div>
            </div>
          </div>
        )}

        {/* Atom Workspace */}
        <div className="relative w-full max-w-[320px] h-[320px] bg-slate-950 rounded-full border-4 border-slate-800 flex items-center justify-center mb-8 shadow-inner overflow-hidden">
          
          {/* Orbits */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] border border-blue-500/10 rounded-full absolute" />
            <div className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] border border-blue-500/10 rounded-full absolute" />
          </div>

          {particleOrbit(electrons)}

          <div className="absolute flex items-center justify-center z-20">
            {particleNucleus()}
            {protons === 0 && neutrons === 0 && (
              <div className="text-slate-600 font-black text-xs uppercase tracking-widest">Nucleus</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 w-full max-w-lg shadow-xl grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-red-400 font-bold uppercase text-xs">Protons</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setProtons(Math.max(0, protons-1))} className="w-8 h-8 bg-slate-700 rounded-full text-white font-bold">-</button>
              <div className="text-2xl font-black text-white w-6 text-center">{protons}</div>
              <button onClick={() => setProtons(protons+1)} className="w-8 h-8 bg-red-500 hover:bg-red-400 rounded-full text-white font-bold">+</button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-slate-300 font-bold uppercase text-xs">Neutrons</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setNeutrons(Math.max(0, neutrons-1))} className="w-8 h-8 bg-slate-700 rounded-full text-white font-bold">-</button>
              <div className="text-2xl font-black text-white w-6 text-center">{neutrons}</div>
              <button onClick={() => setNeutrons(neutrons+1)} className="w-8 h-8 bg-slate-400 hover:bg-slate-300 rounded-full text-slate-900 font-bold">+</button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-blue-400 font-bold uppercase text-xs">Electrons</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setElectrons(Math.max(0, electrons-1))} className="w-8 h-8 bg-slate-700 rounded-full text-white font-bold">-</button>
              <div className="text-2xl font-black text-white w-6 text-center">{electrons}</div>
              <button onClick={() => setElectrons(electrons+1)} className="w-8 h-8 bg-blue-500 hover:bg-blue-400 rounded-full text-white font-bold">+</button>
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-4 border-indigo-400"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Atom Built!</h2>
              <p className="text-slate-600 font-bold mb-8">You successfully built an atom of {level.name}.</p>
              <button 
                onClick={nextLevel}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#4f46e5] active:translate-y-1 active:shadow-none transition-all"
              >
                Next Atom
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border-4 border-emerald-400"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide">Atom Builder!</h2>
              <div className="flex flex-col items-center gap-3 mb-8 w-full">
                <div className="text-2xl font-black text-amber-500 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200 w-full text-center mt-4">
                  ⭐ +100 XP
                </div>
              </div>
              <button 
                onClick={() => navigate("/world/school/science/chemistry")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
              >
                Return to Chemistry
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
