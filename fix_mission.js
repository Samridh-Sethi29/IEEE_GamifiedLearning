const fs = require('fs');

const code = import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Play, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const CHALLENGES = [
  {
    q: "Which particle has a negative charge?",
    opts: ["Proton", "Neutron", "Electron", "Nucleus"],
    ans: 2,
    explanation: "Electrons (e?) have a negative charge and orbit the nucleus."
  },
  {
    q: "Which particles are found in the nucleus?",
    visual: (
      <div className="w-24 h-24 relative bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700 mx-auto my-4">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-[8px] text-white text-center leading-tight">Nucleus</div>
        <div className="absolute top-1 right-2 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">e?</div>
      </div>
    ),
    opts: ["Electrons only", "Protons and neutrons", "Neutrons and electrons", "Protons and electrons"],
    ans: 1,
    explanation: "Protons and neutrons are packed tightly in the center, called the nucleus."
  },
  {
    q: "Which diagram represents a gas?",
    visual: (
      <div className="flex gap-4 justify-center my-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 p-2">
               {[...Array(9)].map((_,i)=><div key={i} className="w-2 h-2 bg-blue-500 rounded-full"/>)}
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">A</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden flex flex-wrap content-end justify-center gap-0.5 p-1">
            {[...Array(9)].map((_,i)=><div key={i} className="w-2 h-2 bg-blue-500 rounded-full"/>)}
          </div>
          <span className="text-xs font-bold text-slate-400">B</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden">
            <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"/>
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-500 rounded-full"/>
            <div className="absolute top-8 left-10 w-2 h-2 bg-blue-500 rounded-full"/>
          </div>
          <span className="text-xs font-bold text-slate-400">C</span>
        </div>
      </div>
    ),
    opts: ["Diagram A", "Diagram B", "Diagram C"],
    ans: 2,
    explanation: "Gas particles have high energy and spread far apart to fill their container."
  },
  {
    q: "What happens when a liquid changes into a gas?",
    opts: ["Freezing", "Melting", "Evaporation", "Condensation"],
    ans: 2,
    explanation: "Evaporation is the change from a liquid to a gas (like boiling water into steam)."
  },
  {
    q: "What are A and B?",
    visual: (
      <div className="text-3xl font-black text-slate-300 tracking-widest my-6">
        <span className="text-rose-400">A</span> + <span className="text-blue-400">B</span> ? <span className="text-emerald-400">C</span>
      </div>
    ),
    opts: ["Products", "Reactants", "Indicators", "Elements"],
    ans: 1,
    explanation: "Reactants are the starting substances that combine to form products."
  },
  {
    q: "Which is an example of a chemical change?",
    opts: ["Melting ice", "Cutting paper", "Dissolving sugar", "Formation of a new substance during a reaction"],
    ans: 3,
    explanation: "A chemical change creates entirely new substances."
  },
  {
    q: "Which pH represents a neutral substance?",
    visual: (
      <div className="w-full max-w-sm h-6 rounded-full flex overflow-hidden border border-slate-700 mx-auto my-4 opacity-80">
        <div className="h-full flex-1 bg-gradient-to-r from-red-500 to-yellow-400" />
        <div className="h-full w-4 bg-green-500 relative flex justify-center overflow-visible" />
        <div className="h-full flex-1 bg-gradient-to-r from-teal-500 to-purple-600" />
      </div>
    ),
    opts: ["0", "7", "14"],
    ans: 1,
    explanation: "Pure water has a neutral pH of exactly 7."
  },
  {
    q: "A substance has a pH of 3. How would you classify it?",
    opts: ["Acidic", "Neutral", "Basic"],
    ans: 0,
    explanation: "Any pH lower than 7 is considered acidic."
  },
  {
    q: "Which substance is ACIDIC?",
    visual: (
      <div className="flex justify-center gap-6 my-6">
        <div className="flex flex-col items-center">
          <div className="text-4xl">??</div>
          <span className="text-xs font-bold text-slate-400 mt-2">Lemon Juice</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">??</div>
          <span className="text-xs font-bold text-slate-400 mt-2">Pure Water</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">??</div>
          <span className="text-xs font-bold text-slate-400 mt-2">Soap</span>
        </div>
      </div>
    ),
    opts: ["Lemon Juice", "Pure Water", "Soap"],
    ans: 0,
    explanation: "Lemon juice contains citric acid, making it acidic. Water is neutral, and soap is basic."
  },
  {
    q: "A student observes a substance with a pH of 11 and tests it with an indicator. What type of substance is it most likely to be?",
    opts: ["Acidic", "Neutral", "Basic", "Metallic"],
    ans: 2,
    explanation: "A pH of 11 is greater than 7, which means the substance is Basic (alkaline)."
  }
];

export default function ChemistryMission() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = () => setStarted(true);

  const handleAnswer = (idx) => {
    if (showExplanation) return;
    
    if (idx === CHALLENGES[qIndex].ans) {
      setQError(false);
      setScore(s => s + 1);
      setShowExplanation(true);
    } else {
      setQError(true);
      setShowExplanation(true); // Immediate reveal for wrong too, but wait, the prompt says: For incorrect: "Not quite, then show correct answer and short explanation."
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    setQError(false);
    if (qIndex < CHALLENGES.length - 1) {
      setQIndex(q => q + 1);
    } else {
      const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
      if (!saved["mission"]) {
        saved["mission"] = true;
        
        // Add achievements
        if (!saved.achievements) saved.achievements = [];
        if (!saved.achievements.includes("Chemistry Master")) {
          saved.achievements.push("Chemistry Master");
        }
        
        localStorage.setItem("chemistry_progress", JSON.stringify(saved));
        earnXP(200);
      }
      
      // Update best score
      const best = saved["mission_score"] || 0;
      if (score > best) {
        saved["mission_score"] = score;
        localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      }
      
      setCompleted(true);
    }
  };

  if (!started) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 font-sans text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
        
        <button onClick={() => navigate("/world/school/science/chemistry")} className="absolute top-6 left-6 z-20 flex items-center gap-2 font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Leave Mission
        </button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center max-w-2xl">
          <div className="text-7xl mb-6">??</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider text-white">
            Chemistry Final Mission
          </h1>
          <p className="text-xl text-slate-300 font-bold mb-10 leading-relaxed max-w-md mx-auto">
            "Everything you've learned comes together here."
          </p>
          
          <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 mb-10 max-w-sm mx-auto text-left flex flex-col gap-3">
            <div className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 10 Mixed Challenges</div>
            <div className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> All 4 Topics</div>
            <div className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> +200 XP Reward</div>
          </div>

          <button onClick={handleStart} className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-black text-2xl px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto">
            START MISSION ?
          </button>
        </motion.div>
      </div>
    );
  }

  if (completed) {
    const finalScore = qError ? score : score + (showExplanation && !qError ? 1 : 0); // Handle edge case if state didn't flush
    const percentage = Math.round((finalScore / CHALLENGES.length) * 100);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    const bestScore = saved["mission_score"] || finalScore;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 font-sans text-white overflow-y-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-3xl bg-slate-800/80 backdrop-blur p-8 md:p-12 rounded-[3rem] border-4 border-amber-500 shadow-[0_0_100px_rgba(245,158,11,0.2)] my-10">
          <div className="text-8xl mb-6">??</div>
          <h2 className="text-4xl md:text-5xl font-black mb-2 text-white uppercase tracking-widest">Chemistry Mastered!</h2>
          <p className="text-lg text-slate-300 font-bold mb-8 italic">"You've completed your Chemistry journey."</p>
          
          <div className="text-emerald-400 font-black text-2xl tracking-widest uppercase mb-8">100% COMPLETE</div>

          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
            <div className="flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-amber-400 mb-2">{finalScore} / {CHALLENGES.length} Correct</div>
              <div className="text-2xl font-bold text-slate-400 mb-4">{percentage}%</div>
              {percentage >= 80 ? (
                <div className="bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full font-bold">Great Job!</div>
              ) : (
                <div className="bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full font-bold">Good effort!</div>
              )}
            </div>
            <div className="flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 text-left flex flex-col justify-center">
              <div className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Statistics</div>
              <div className="font-bold text-white flex justify-between"><span>Topics</span> <span className="text-emerald-400">4 / 4</span></div>
              <div className="font-bold text-white flex justify-between"><span>Games</span> <span className="text-emerald-400">2 / 2</span></div>
              <div className="font-bold text-white flex justify-between"><span>Final Mission</span> <span className="text-emerald-400">?</span></div>
              <div className="font-bold text-white flex justify-between mt-2 pt-2 border-t border-slate-700"><span>Best Score</span> <span className="text-amber-400">{bestScore} / 10</span></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-amber-500 to-yellow-500 p-4 rounded-2xl text-slate-900 mb-8 border-2 border-amber-300">
            <Trophy className="w-8 h-8" />
            <div className="text-left">
              <div className="font-black text-xl leading-tight">Chemistry Master</div>
              <div className="font-bold text-sm opacity-80">Completed the complete Chemistry learning journey.</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => {
              setStarted(false);
              setCompleted(false);
              setQIndex(0);
              setScore(0);
              setShowExplanation(false);
              setQError(false);
            }} className="bg-slate-700 text-white font-black text-lg px-8 py-4 rounded-xl hover:bg-slate-600 active:scale-95 transition-all">
              REPLAY MISSION
            </button>
            <button onClick={() => navigate("/world/school/science")} className="bg-indigo-500 text-white font-black text-lg px-8 py-4 rounded-xl shadow-[0_4px_0_rgba(99,102,241,1)] hover:bg-indigo-400 active:translate-y-1 active:shadow-none transition-all">
              BACK TO SCIENCE
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = CHALLENGES[qIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center p-6 bg-slate-900 font-sans overflow-y-auto pt-20">
      <button onClick={() => navigate("/world/school/science/chemistry")} className="absolute top-6 left-6 z-20 flex items-center gap-2 font-bold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" /> Leave
      </button>

      <div className="w-full max-w-2xl mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-amber-500 font-black tracking-widest uppercase">Question {qIndex + 1} / {CHALLENGES.length}</div>
        </div>
        
        <div className="w-full bg-slate-800 rounded-full h-3 mb-10 overflow-hidden relative">
          {/* Progress blocks */}
          <div className="absolute inset-0 flex">
            {CHALLENGES.map((_, i) => (
              <div key={i} className={lex-1 h-full border-r border-slate-900 } />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={qIndex} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="w-full">
            <div className="bg-slate-800 p-8 rounded-3xl border-2 border-slate-700 mb-8 shadow-lg">
              {q.visual && q.visual}
              <h2 className="text-2xl md:text-3xl font-black text-white text-center leading-snug">
                {q.q}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {q.opts.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showExplanation}
                  className={p-5 rounded-2xl border-b-4 border-2 text-left text-lg font-bold transition-all }
                >
                  {opt}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className={mt-8 p-6 rounded-2xl border-2 text-center flex flex-col md:flex-row items-center gap-6 }>
                  <div className="text-5xl">{!qError ? '?' : '?'}</div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className={	ext-2xl font-black uppercase tracking-wider mb-2 }>
                      {!qError ? '? Correct!' : '? Not quite'}
                    </h3>
                    {qError && (
                      <div className="text-slate-300 font-bold mb-1">
                        Correct answer: <span className="text-emerald-400">{q.opts[q.ans]}</span>
                      </div>
                    )}
                    <p className="text-slate-300 font-medium">
                      {q.explanation}
                    </p>
                  </div>
                  <button onClick={handleNext} className="bg-white text-slate-900 font-black text-lg px-8 py-4 rounded-xl shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap w-full md:w-auto mt-4 md:mt-0">
                    NEXT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


fs.writeFileSync('src/features/science/chemistry/components/ChemistryMission.jsx', code, 'utf-8');
