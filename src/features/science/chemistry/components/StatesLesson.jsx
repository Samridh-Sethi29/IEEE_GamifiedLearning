import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import KnowledgeCheck from "../../components/KnowledgeCheck";

const TOTAL_STEPS = 6;
const QUESTIONS = [
  {
    q: "Which state of matter has a fixed shape?",
    opts: ["Solid", "Liquid", "Gas", "Plasma"],
    ans: 0,
    explanation: "Solids have tightly packed particles that lock into place, giving them a fixed shape."
  },
  {
    q: "Which state has particles that are generally far apart and move freely?",
    visual: (
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden">
           <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-2 left-6 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-6 left-2 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-6 left-6 w-3 h-3 bg-blue-400 rounded-full"/>
        </div>
        <div className="text-xl font-bold text-slate-400 flex items-center justify-center">vs</div>
        <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden">
           <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute bottom-2 right-4 w-3 h-3 bg-blue-400 rounded-full"/>
        </div>
      </div>
    ),
    opts: ["Solid", "Liquid", "Gas", "Ice"],
    ans: 2,
    explanation: "Gas particles have lots of energy and spread far apart to fill their container."
  },
  {
    q: "What is melting?",
    opts: ["Solid → Liquid", "Liquid → Solid", "Gas → Liquid", "Liquid → Gas"],
    ans: 0,
    explanation: "Melting occurs when a solid (like ice) gets warm enough to turn into a liquid."
  },
  {
    q: "What is evaporation?",
    opts: ["Solid → Liquid", "Liquid → Gas", "Gas → Liquid", "Gas → Solid"],
    ans: 1,
    explanation: "Evaporation happens when a liquid absorbs enough heat to become a gas (like water turning to steam)."
  },
  {
    q: "What happens during condensation?",
    opts: ["Gas → Liquid", "Liquid → Gas", "Solid → Gas", "Solid → Liquid"],
    ans: 0,
    explanation: "Condensation is when a gas cools down and turns back into a liquid (like water drops on a cold glass)."
  }
];

export default function StatesLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  // Interactive Lab State
  const [stateType, setStateType] = useState("solid");
  const [temperature, setTemperature] = useState(20);
  
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizComplete = (score) => {
    setQuizScore(score);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["states"]) {
      saved["states"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25);
    }
    setStep(6);
  };

  const generateParticles = (type, temp) => {
    const particles = [];
    const count = 36;
    
    // Map temp 0-100 to animation speed
    const duration = Math.max(0.2, 2 - (temp / 100) * 1.8);
    
    for(let i=0; i<count; i++) {
      let x, y, dx, dy;
      
      if (type === "solid") {
        // Grid layout
        const row = Math.floor(i / 6);
        const col = i % 6;
        x = col * 20 + 80;
        y = row * 20 + 80;
        dx = (Math.random() - 0.5) * (temp / 20);
        dy = (Math.random() - 0.5) * (temp / 20);
      } else if (type === "liquid") {
        // Clustered but irregular
        x = 50 + (i % 8) * 22 + (Math.random() * 10);
        y = 120 + Math.floor(i / 8) * 18 + (Math.random() * 10);
        dx = (Math.random() - 0.5) * (10 + temp / 5);
        dy = (Math.random() - 0.5) * (10 + temp / 5);
      } else {
        // Gas: scattered
        x = Math.random() * 260 + 10;
        y = Math.random() * 260 + 10;
        dx = (Math.random() - 0.5) * (40 + temp);
        dy = (Math.random() - 0.5) * (40 + temp);
      }

      particles.push(
        <motion.div
          key={i}
          animate={{
            x: [x, x + dx, x - dx, x],
            y: [y, y + dy, y - dy, y],
          }}
          transition={{ repeat: Infinity, duration, ease: "linear" }}
          className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-sm"
        />
      );
    }
    return particles;
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Solid</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Particles in a solid are closely packed in a fixed pattern. They cannot move around, but they vibrate in place. This gives solids a fixed shape.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-md border-2 border-slate-200 h-64 relative flex items-center justify-center">
              <div className="grid grid-cols-6 gap-2">
                {[...Array(36)].map((_, i) => (
                  <motion.div key={i} animate={{ x: [0, 1, -1, 0], y: [0, -1, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: Math.random() }} className="w-4 h-4 bg-blue-600 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Liquid</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Particles in a liquid are close together but can move past one another. This allows liquids to flow and take the shape of their container.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-md border-2 border-slate-200 h-64 relative overflow-hidden flex flex-wrap content-end justify-center gap-1">
               {[...Array(36)].map((_, i) => (
                  <motion.div key={i} animate={{ x: [(Math.random()-0.5)*10, (Math.random()-0.5)*10], y: [(Math.random()-0.5)*10, (Math.random()-0.5)*10] }} transition={{ repeat: Infinity, duration: 2, repeatType: "mirror" }} className="w-4 h-4 bg-blue-500 rounded-full" />
                ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Gas</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Particles in a gas move freely and are far apart. They fill the entire space available to them.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-md border-2 border-slate-200 h-64 relative overflow-hidden">
               {[...Array(36)].map((_, i) => (
                  <motion.div key={i} animate={{ x: [Math.random()*300, Math.random()*300], y: [Math.random()*200, Math.random()*200] }} transition={{ repeat: Infinity, duration: 4, repeatType: "mirror" }} className="absolute w-4 h-4 bg-blue-400 rounded-full opacity-70" />
                ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Interactive States Lab</h2>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl">
              Change the state and temperature to see how particles behave!
            </p>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl w-full max-w-xl">
              
              <div className="flex justify-center gap-3 mb-6">
                <button onClick={() => setStateType("solid")} className={`px-6 py-2 rounded-xl font-bold transition-colors ${stateType === 'solid' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Solid</button>
                <button onClick={() => setStateType("liquid")} className={`px-6 py-2 rounded-xl font-bold transition-colors ${stateType === 'liquid' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Liquid</button>
                <button onClick={() => setStateType("gas")} className={`px-6 py-2 rounded-xl font-bold transition-colors ${stateType === 'gas' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Gas</button>
              </div>

              <div className="relative w-[300px] h-[300px] bg-slate-900 border-4 border-slate-800 rounded-3xl mx-auto mb-6 overflow-hidden">
                {generateParticles(stateType, temperature)}
              </div>

              <div className="w-full">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-blue-500">Cold (Slower)</span>
                  <span className="text-red-500">Hot (Faster)</span>
                </div>
                <input type="range" min="0" max="100" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-cyan-500" />
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4 w-full max-w-2xl text-sm font-bold bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="flex-1 text-center">🧊 Solid<br/><span className="text-slate-400">Melting</span><br/>💧 Liquid</div>
              <div className="flex-1 text-center border-l border-slate-300">💧 Liquid<br/><span className="text-slate-400">Evaporation</span><br/>💨 Gas</div>
              <div className="flex-1 text-center border-l border-slate-300">💨 Gas<br/><span className="text-slate-400">Condensation</span><br/>💧 Liquid</div>
            </div>
          </div>
        );
      case 5:
        return <KnowledgeCheck questions={QUESTIONS} topicName="States of Matter" onComplete={handleQuizComplete} />;
      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-cyan-600 mb-6">States of Matter</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-cyan-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-cyan-300">
                <li>Solids, Liquids, Gases</li>
                <li>Particle Arrangement</li>
                <li>Melting & Freezing</li>
                <li>Evaporation & Condensation</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ⭐ +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-cyan-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#06b6d4] hover:bg-cyan-400 active:translate-y-1 active:shadow-none transition-all"
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-cyan-500' : 'bg-slate-200'}`} />
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

        {step < 5 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="mt-12 bg-cyan-500 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#06b6d4] hover:bg-cyan-400 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 4 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
