import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import KnowledgeCheck from "../../components/KnowledgeCheck";

const TOTAL_STEPS = 5;
const QUESTIONS = [
  {
    q: "What pH is considered neutral on the standard introductory pH scale?",
    visual: (
      <div className="w-full max-w-sm h-6 rounded-full flex overflow-hidden border border-slate-300">
        <div className="h-full flex-1 bg-gradient-to-r from-red-500 to-yellow-400" />
        <div className="h-full w-4 bg-green-500 relative flex justify-center overflow-visible"><div className="absolute -top-6 text-xl">❓</div></div>
        <div className="h-full flex-1 bg-gradient-to-r from-teal-500 to-purple-600" />
      </div>
    ),
    opts: ["0", "5", "7", "14"],
    ans: 2,
    explanation: "Pure water has a neutral pH of exactly 7."
  },
  {
    q: "A substance with pH 3 is generally:",
    opts: ["Acidic", "Neutral", "Basic", "Metallic"],
    ans: 0,
    explanation: "Any pH lower than 7 is considered acidic."
  },
  {
    q: "A substance with pH 11 is generally:",
    opts: ["Acidic", "Neutral", "Basic", "A gas"],
    ans: 2,
    explanation: "Any pH higher than 7 is considered basic (or alkaline)."
  },
  {
    q: "What is an indicator?",
    opts: [
      "A substance that can help show whether a solution is acidic or basic",
      "A type of atom",
      "A form of energy",
      "A type of force"
    ],
    ans: 0,
    explanation: "Indicators change color depending on how acidic or basic the solution is."
  },
  {
    q: "Which is generally acidic?",
    opts: ["Lemon juice", "Pure water", "Soap solution"],
    ans: 0,
    explanation: "Lemon juice contains citric acid, which gives it a sour taste and makes it acidic."
  }
];

const SUBSTANCES = [
  { name: "Lemon Juice", type: "acidic", defaultColor: "bg-yellow-100", indicatorColor: "bg-red-500", ph: 2 },
  { name: "Pure Water", type: "neutral", defaultColor: "bg-blue-50", indicatorColor: "bg-green-500", ph: 7 },
  { name: "Soap Solution", type: "basic", defaultColor: "bg-slate-100", indicatorColor: "bg-purple-600", ph: 10 }
];

export default function AcidsBasesLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  const [activeSub, setActiveSub] = useState(0);
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizComplete = (score) => {
    setQuizScore(score);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["acids"]) {
      saved["acids"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25);
    }
    setStep(5);
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Acids & Bases</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Many liquids are either <strong className="text-red-500">Acidic</strong> or <strong className="text-purple-600">Basic</strong>. If they are neither, they are <strong className="text-green-500">Neutral</strong> (like pure water).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-200 shadow-sm flex flex-col items-center">
                <div className="text-5xl mb-4">🍋</div>
                <h3 className="font-black text-red-600 text-2xl mb-2">Acids</h3>
                <p className="text-red-800 font-bold">Taste sour. Found in citrus fruits, vinegar, and stomach acid.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-3xl border-2 border-purple-200 shadow-sm flex flex-col items-center">
                <div className="text-5xl mb-4">🧼</div>
                <h3 className="font-black text-purple-600 text-2xl mb-2">Bases</h3>
                <p className="text-purple-800 font-bold">Feel slippery and taste bitter. Found in soap, bleach, and baking soda.</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">The pH Scale</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Scientists use the pH scale to measure how acidic or basic a substance is. It goes from 0 to 14.
            </p>
            <div className="w-full max-w-4xl bg-slate-900 p-8 rounded-3xl shadow-xl border-4 border-slate-800 relative pt-16 pb-12">
              <div className="absolute top-4 w-full flex justify-between px-12 text-white font-black uppercase text-sm tracking-widest">
                <span className="text-red-400">Acidic</span>
                <span className="text-green-400 -ml-8">Neutral</span>
                <span className="text-purple-400 pr-8">Basic</span>
              </div>
              
              <div className="w-full h-8 rounded-full flex overflow-hidden border-2 border-slate-700 shadow-inner">
                {/* 0-6 */}
                <div className="h-full flex-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400" />
                {/* 7 */}
                <div className="h-full w-[7%] bg-green-500" />
                {/* 8-14 */}
                <div className="h-full flex-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-700" />
              </div>
              
              <div className="w-full flex justify-between mt-4 px-2 font-mono font-bold text-slate-400 text-lg">
                <span>0</span>
                <span className="text-green-400 font-black text-xl -ml-2">7</span>
                <span>14</span>
              </div>
            </div>
          </div>
        );
      case 3:
        const sub = SUBSTANCES[activeSub];
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Indicator Lab</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              An indicator is a special chemical that changes color depending on the pH. Let's test these substances!
            </p>
            
            <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-center">
              
              {/* Test Tube */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-48 border-4 border-slate-300 rounded-b-full border-t-0 relative flex items-end justify-center overflow-hidden bg-slate-50">
                  {/* Liquid */}
                  <motion.div 
                    animate={{ backgroundColor: indicatorAdded ? (sub.type === 'acidic' ? '#ef4444' : sub.type === 'basic' ? '#9333ea' : '#22c55e') : '#f8fafc' }}
                    className={`w-full h-32 rounded-b-full transition-colors duration-1000 ${!indicatorAdded && sub.defaultColor}`}
                  />
                  {/* Glare */}
                  <div className="absolute top-0 right-2 w-2 h-full bg-white/50 rounded-full blur-sm" />
                </div>
                <div className="mt-6 h-8 text-2xl font-black uppercase tracking-widest" style={{ color: indicatorAdded ? (sub.type === 'acidic' ? '#ef4444' : sub.type === 'basic' ? '#9333ea' : '#22c55e') : '#94a3b8' }}>
                  {indicatorAdded ? sub.type : '???'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-6 w-full max-w-xs">
                <div className="flex flex-col gap-2">
                  {SUBSTANCES.map((s, i) => (
                    <button 
                      key={s.name}
                      onClick={() => { setActiveSub(i); setIndicatorAdded(false); }}
                      className={`p-4 rounded-xl font-bold transition-all ${activeSub === i ? 'bg-slate-800 text-white scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setIndicatorAdded(true)}
                  disabled={indicatorAdded}
                  className={`py-4 rounded-xl font-black text-white shadow-lg transition-all ${indicatorAdded ? 'bg-slate-300 opacity-50' : 'bg-lime-500 hover:bg-lime-400 active:translate-y-1'}`}
                >
                  {indicatorAdded ? "TEST COMPLETE" : "ADD INDICATOR 💧"}
                </button>
              </div>

            </div>
          </div>
        );
      case 4:
        return <KnowledgeCheck questions={QUESTIONS} topicName="Acids, Bases & Indicators" onComplete={handleQuizComplete} />;
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-lime-600 mb-6">Acids, Bases & Indicators</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-lime-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-lime-300">
                <li>Acids & Bases</li>
                <li>The pH Scale</li>
                <li>Indicators</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ⭐ +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-lime-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#84cc16] hover:bg-lime-400 active:translate-y-1 active:shadow-none transition-all"
            >
              CONTINUE
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col overflow-y-auto font-sans">
      <div className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between p-4 px-6 shadow-sm">
        <button 
          onClick={() => navigate("/world/school/science/chemistry")}
          className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Hub
        </button>
        <div className="flex gap-2 items-center">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-lime-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex justify-center"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="mt-12 bg-lime-500 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#84cc16] hover:bg-lime-400 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 3 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
