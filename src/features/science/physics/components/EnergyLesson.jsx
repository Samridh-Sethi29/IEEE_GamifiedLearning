import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Travel from "./Travel";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const TOTAL_STEPS = 7;

export default function EnergyLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  // Interactive states
  const [bicycleMoving, setBicycleMoving] = useState(false);
  const [ballDropped, setBallDropped] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [transStep, setTransStep] = useState(0); // For energy transformation
  
  // Quiz
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["energy"]) {
      saved["energy"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(75); // 50 learning + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["kinetic", "potential", "light", "transformation", "speaker"];
    if (ans === correctAnswers[qIndex]) {
      setQError(false);
      if (qIndex < 4) {
        setQIndex(q => q + 1);
      } else {
        markComplete();
      }
    } else {
      setQError(true);
      setTimeout(() => setQError(false), 2000);
    }
  };

  const FORMS = [
    { id: "electrical", icon: "⚡", name: "Electrical", desc: "Energy of moving electrons." },
    { id: "heat", icon: "🔥", name: "Heat", desc: "Thermal energy from moving particles." },
    { id: "light", icon: "💡", name: "Light", desc: "Visible energy we can see." },
    { id: "chemical", icon: "🧪", name: "Chemical", desc: "Energy stored in bonds (like food or batteries)." },
    { id: "sound", icon: "🔊", name: "Sound", desc: "Energy from vibrations." },
  ];

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">What is Energy?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Energy is the ability to cause change or do work. It makes things happen!
            </p>
            <div className="text-8xl animate-pulse">⚡</div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Kinetic Energy</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Kinetic energy is the energy associated with motion. Anything moving has kinetic energy!
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-lg border-2 border-slate-200">
              <button 
                onClick={() => setBicycleMoving(!bicycleMoving)}
                className="bg-blue-500 text-white font-bold px-8 py-3 rounded-xl mb-8 shadow-md hover:bg-blue-400"
              >
                {bicycleMoving ? "Stop Bicycle" : "Pedal Bicycle"}
              </button>
              <div className="text-2xl font-black mb-4 text-slate-500">
                {bicycleMoving ? <span className="text-emerald-500">High Kinetic Energy</span> : "Zero Kinetic Energy"}
              </div>
              <div className="text-7xl overflow-hidden w-full flex items-end h-24 px-2 border-b-4 border-slate-300">
                <Travel active={bicycleMoving} loop duration={1.6} ease="linear" className="inline-block scale-x-[-1]">
                  🚲
                </Travel>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Potential Energy</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Potential energy is stored energy due to position or condition.
            </p>
            <div className="bg-sky-100 p-8 rounded-3xl w-full max-w-sm border-2 border-sky-200 h-96 relative flex flex-col items-center">
              <button 
                onClick={() => setBallDropped(!ballDropped)}
                className="z-20 bg-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-400 shadow-md mb-4"
              >
                {ballDropped ? "Reset Ball" : "Drop Ball"}
              </button>
              
              <div className="text-sm font-black uppercase text-sky-800 bg-sky-200 px-4 py-1 rounded-full mb-4">
                {ballDropped ? "Converting to Kinetic..." : "High Potential Energy"}
              </div>
              
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: ballDropped ? 180 : 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
                className="text-5xl z-10"
              >
                ⚽
              </motion.div>
              <div className="absolute bottom-0 w-full h-16 bg-emerald-500 rounded-b-2xl border-t-8 border-emerald-600" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Other Forms of Energy</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">Click to reveal different forms of energy.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
              {FORMS.map(form => (
                <button 
                  key={form.id}
                  onClick={() => setActiveForm(form.id)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${activeForm === form.id ? 'bg-blue-50 border-blue-400 shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="text-4xl">{form.icon}</div>
                  <div className="font-black text-slate-700">{form.name}</div>
                </button>
              ))}
            </div>
            {activeForm && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-blue-500 text-white p-6 rounded-2xl max-w-lg font-bold shadow-lg">
                {FORMS.find(f => f.id === activeForm).desc}
              </motion.div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Energy Transformations</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Energy cannot be created or destroyed, but it can change from one form to another.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-3xl border-2 border-slate-200">
              <button 
                onClick={() => setTransStep(t => (t + 1) % 4)}
                className="bg-amber-500 text-white font-bold px-8 py-3 rounded-xl mb-12 shadow-md hover:bg-amber-400"
              >
                Next Step
              </button>
              
              <div className="flex items-center justify-center gap-4 text-4xl md:text-5xl">
                <div className={`transition-opacity ${transStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                  ☀️<div className="text-xs font-bold text-slate-500 mt-2">Light</div>
                </div>
                {transStep >= 1 && <motion.div initial={{ width: 0 }} animate={{ width: 'auto' }} className="text-slate-300">→</motion.div>}
                <div className={`transition-opacity ${transStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                  ⬛<div className="text-xs font-bold text-slate-500 mt-2">Solar Panel</div>
                </div>
                {transStep >= 2 && <motion.div initial={{ width: 0 }} animate={{ width: 'auto' }} className="text-slate-300">→</motion.div>}
                <div className={`transition-opacity ${transStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                  ⚡<div className="text-xs font-bold text-slate-500 mt-2">Electrical</div>
                </div>
                {transStep >= 3 && <motion.div initial={{ width: 0 }} animate={{ width: 'auto' }} className="text-slate-300">→</motion.div>}
                <div className={`transition-opacity ${transStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                  💡<div className="text-xs font-bold text-slate-500 mt-2">Light + Heat</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 6: // Quiz
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which energy is associated with motion?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Potential Energy</button>
                  <button onClick={() => handleAnswer("kinetic")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. Kinetic Energy</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Chemical Energy</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Think about the moving bicycle!</p>}
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which type of energy is stored in a raised object?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("potential")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. Potential Energy</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Heat Energy</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Kinetic Energy</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Think about the ball before it was dropped.</p>}
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What type of energy does a lightbulb primarily produce?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("light")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. Light Energy</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Chemical Energy</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Sound Energy</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">What helps us see in the dark?</p>}
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Changing from solar energy to electrical energy is called an energy...</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Destruction</button>
                  <button onClick={() => handleAnswer("transformation")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. Transformation</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Creation</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Energy cannot be created or destroyed!</p>}
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which device converts electrical energy into sound?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Solar Panel</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Lightbulb</button>
                  <button onClick={() => handleAnswer("speaker")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">C. Speaker</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Which one makes noise?</p>}
              </div>
            )}
            <div className="mt-8 flex items-center justify-center gap-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-blue-500' : 'w-4 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Energy Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ⭐ +75 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/physics")}
              className="w-full bg-slate-800 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#334155] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all"
            >
              Continue to Physics Hub
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
          onClick={() => navigate("/world/school/science/physics")}
          className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Hub
        </button>
        <div className="flex gap-2 items-center">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full ${i + 1 <= step ? 'bg-amber-500' : 'bg-slate-200'}`} />
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

        {step < 6 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="mt-12 bg-slate-800 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#334155] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 5 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
