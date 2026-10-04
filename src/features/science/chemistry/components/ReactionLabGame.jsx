import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const LEVELS = [
  {
    type: "identify",
    instruction: "Identify the Reactants and Product.",
    r1: "Hydrogen", r2: "Oxygen", p: "Water (H₂O)",
    options: ["Reactants", "Product"],
    targets: { r1: "Reactants", r2: "Reactants", p: "Product" }
  },
  {
    type: "choose",
    instruction: "We need to make Carbon Dioxide (CO₂). Choose the missing reactant!",
    r1: "Carbon", p: "Carbon Dioxide",
    missing: "r2",
    options: ["Helium", "Oxygen", "Iron"],
    ans: "Oxygen"
  },
  {
    type: "mix",
    instruction: "Mix Baking Soda and Vinegar to see a chemical reaction!",
    r1: "Baking Soda", r2: "Vinegar", p: "CO₂ Gas Bubbles + Liquid"
  }
];

export default function ReactionLabGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); 
  const [levelIdx, setLevelIdx] = useState(0);
  
  // Interactions
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [mixed, setMixed] = useState(false);
  const [l1Answers, setL1Answers] = useState({});

  const level = LEVELS[levelIdx];

  const resetLevel = () => {
    setSelectedOpt(null);
    setMixed(false);
    setL1Answers({});
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(i => i + 1);
      resetLevel();
      setStep(1);
    } else {
      const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
      if (!saved["reactions-game"]) {
        saved["reactions-game"] = true;
        localStorage.setItem("chemistry_progress", JSON.stringify(saved));
        earnXP(100);
      }
      setStep(3);
    }
  };

  const handleL1Drop = (item, type) => {
    const newAns = { ...l1Answers, [item]: type };
    setL1Answers(newAns);
    if (Object.keys(newAns).length === 3) {
      if (newAns.r1 === level.targets.r1 && newAns.r2 === level.targets.r2 && newAns.p === level.targets.p) {
        setTimeout(() => setStep(2), 1000);
      } else {
        // Reset if wrong
        setTimeout(() => setL1Answers({}), 1000);
      }
    }
  };

  if (step === 0) {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl"
        >
          <div className="text-6xl mb-6 drop-shadow-md">🧪</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">REACTION LAB</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Combine the right reactants and discover what happens.</p>
          
          <button 
            onClick={() => setStep(1)}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none transition-all"
          >
            ENTER LAB
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
          <div className="text-center mb-8 w-full max-w-2xl bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-xl">
            <h2 className="text-rose-400 font-bold uppercase tracking-widest text-sm mb-2">Level {levelIdx + 1}</h2>
            <p className="text-2xl font-black text-white">{level.instruction}</p>
          </div>
        )}

        {/* Level 1: Identify */}
        {level?.type === "identify" && (
          <div className="flex flex-col items-center w-full max-w-2xl">
            <div className="flex justify-around w-full mb-12">
              <button onClick={() => setSelectedOpt("Reactants")} className={`px-6 py-3 rounded-xl font-black transition-all ${selectedOpt === "Reactants" ? 'bg-rose-500 text-white scale-110' : 'bg-slate-700 text-slate-300 border border-slate-600'}`}>Reactants</button>
              <button onClick={() => setSelectedOpt("Product")} className={`px-6 py-3 rounded-xl font-black transition-all ${selectedOpt === "Product" ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-700 text-slate-300 border border-slate-600'}`}>Product</button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-xl font-bold">
              <div onClick={() => selectedOpt && handleL1Drop('r1', selectedOpt)} className={`p-6 rounded-2xl border-4 cursor-pointer transition-colors ${l1Answers.r1 === 'Reactants' ? 'border-rose-500 bg-rose-500/20 text-rose-300' : l1Answers.r1 ? 'border-red-500 bg-red-500/20' : 'border-slate-600 bg-slate-800 text-white'}`}>
                {level.r1}
              </div>
              <span className="text-4xl text-slate-500">+</span>
              <div onClick={() => selectedOpt && handleL1Drop('r2', selectedOpt)} className={`p-6 rounded-2xl border-4 cursor-pointer transition-colors ${l1Answers.r2 === 'Reactants' ? 'border-rose-500 bg-rose-500/20 text-rose-300' : l1Answers.r2 ? 'border-red-500 bg-red-500/20' : 'border-slate-600 bg-slate-800 text-white'}`}>
                {level.r2}
              </div>
              <span className="text-4xl text-slate-500">➔</span>
              <div onClick={() => selectedOpt && handleL1Drop('p', selectedOpt)} className={`p-6 rounded-2xl border-4 cursor-pointer transition-colors ${l1Answers.p === 'Product' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : l1Answers.p ? 'border-red-500 bg-red-500/20' : 'border-slate-600 bg-slate-800 text-white'}`}>
                {level.p}
              </div>
            </div>
            <p className="text-slate-400 mt-8 font-bold text-sm">Select a category above, then tap the matching items.</p>
          </div>
        )}

        {/* Level 2: Choose */}
        {level?.type === "choose" && (
          <div className="flex flex-col items-center w-full max-w-2xl">
            <div className="flex items-center gap-6 text-2xl font-bold bg-slate-800 p-8 rounded-3xl border-2 border-slate-700 mb-12">
              <div className="p-4 bg-slate-700 rounded-xl text-white">{level.r1}</div>
              <span className="text-3xl text-slate-500">+</span>
              <div className={`p-4 rounded-xl border-4 border-dashed ${selectedOpt ? 'border-rose-500 text-rose-400' : 'border-slate-500 text-slate-500'}`}>
                {selectedOpt || "???"}
              </div>
              <span className="text-3xl text-slate-500">➔</span>
              <div className="p-4 bg-emerald-900/50 border-2 border-emerald-500 rounded-xl text-emerald-400">{level.p}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              {level.options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => {
                    setSelectedOpt(opt);
                    if (opt === level.ans) {
                      setTimeout(() => setStep(2), 1000);
                    } else {
                      setTimeout(() => setSelectedOpt(null), 1000);
                    }
                  }}
                  className={`p-4 rounded-xl font-black text-lg transition-all ${selectedOpt === opt ? (opt === level.ans ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-white text-slate-800 hover:bg-slate-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level 3: Mix */}
        {level?.type === "mix" && (
          <div className="flex flex-col items-center w-full max-w-2xl">
            {!mixed ? (
              <>
                <div className="flex items-center gap-6 text-2xl font-bold mb-12">
                  <div className="flex flex-col items-center"><div className="text-6xl mb-4">🧂</div><div className="text-white">{level.r1}</div></div>
                  <span className="text-4xl text-slate-500 font-black">+</span>
                  <div className="flex flex-col items-center"><div className="text-6xl mb-4">🍾</div><div className="text-white">{level.r2}</div></div>
                </div>
                <button 
                  onClick={() => {
                    setMixed(true);
                    setTimeout(() => setStep(2), 3000);
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-black text-2xl px-12 py-5 rounded-2xl shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none transition-all"
                >
                  MIX THEM
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center mt-12">
                <div className="relative w-40 h-40 flex flex-col items-center justify-end mb-8">
                  <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-8xl z-10">🌋</motion.div>
                  {[...Array(20)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ y: 0, opacity: 1, scale: 0.5 }} 
                        animate={{ y: -150 - Math.random()*50, x: (Math.random()-0.5)*100, opacity: 0, scale: 1.5 }} 
                        transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: Math.random() }} 
                        className="absolute bottom-10 w-4 h-4 bg-white/80 rounded-full border border-slate-300 z-20" 
                      />
                  ))}
                </div>
                <h2 className="text-3xl font-black text-emerald-400 uppercase tracking-widest">{level.p}</h2>
              </div>
            )}
          </div>
        )}
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
              className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-4 border-rose-400"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Success!</h2>
              <p className="text-slate-600 font-bold mb-8">Reaction complete.</p>
              <button 
                onClick={nextLevel}
                className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#be123c] active:translate-y-1 active:shadow-none transition-all"
              >
                Next Level
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
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide">Reaction Explorer!</h2>
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
