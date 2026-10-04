import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import KnowledgeCheck from "../../components/KnowledgeCheck";

const TOTAL_STEPS = 6;
const QUESTIONS = [
  {
    q: "What is an atom?",
    opts: [
      "The smallest unit of an element that retains its chemical identity",
      "A type of energy",
      "A liquid",
      "A force"
    ],
    ans: 0,
    explanation: "Atoms are the tiny building blocks of all matter. Each element has its own unique type of atom."
  },
  {
    q: "Which particle has a negative charge?",
    visual: (
      <div className="w-32 h-32 relative bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs text-white">Nucleus</div>
        <div className="absolute top-2 right-4 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">e⁻</div>
      </div>
    ),
    opts: ["Proton", "Neutron", "Electron", "Nucleus"],
    ans: 2,
    explanation: "Electrons (e⁻) have a negative charge and orbit the nucleus."
  },
  {
    q: "Where are protons and neutrons found?",
    opts: ["Electron cloud", "Nucleus", "Outside the atom", "Periodic table"],
    ans: 1,
    explanation: "Protons and neutrons are tightly packed together in the center of the atom, called the nucleus."
  },
  {
    q: "What does the atomic number represent?",
    opts: ["Number of neutrons", "Number of protons", "Number of electrons only", "Atomic size"],
    ans: 1,
    explanation: "The atomic number tells you exactly how many protons are in the nucleus. It defines the element!"
  },
  {
    q: "Which symbol represents oxygen?",
    opts: ["O", "Ox", "Og", "C"],
    ans: 0,
    explanation: "The chemical symbol for Oxygen is the letter O."
  }
];

const ELEMENTS = {
  H: { name: "Hydrogen", symbol: "H", num: 1, desc: "The lightest element. Powers stars like our sun!" },
  O: { name: "Oxygen", symbol: "O", num: 8, desc: "A gas we need to breathe." },
  C: { name: "Carbon", symbol: "C", num: 6, desc: "The building block of all life on Earth." },
  Fe: { name: "Iron", symbol: "Fe", num: 26, desc: "A strong metal used to build bridges." },
  Na: { name: "Sodium", symbol: "Na", num: 11, desc: "A soft metal. Mixed with Chlorine, it makes table salt!" },
  Cl: { name: "Chlorine", symbol: "Cl", num: 17, desc: "A greenish gas often used to clean swimming pools." }
};

export default function AtomsLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  const [activeElement, setActiveElement] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizComplete = (score) => {
    setQuizScore(score);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["atoms"]) {
      saved["atoms"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25);
    }
    setStep(6);
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">What is Matter?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Matter is anything that has mass and takes up space. Everything around you is made of matter!
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
              {['💧 Water', '🪨 Rock', '🌬️ Air', '📱 Phone'].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm text-2xl font-bold flex justify-center items-center hover:scale-105 hover:border-indigo-300 transition-all cursor-pointer">
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">What is an Atom?</h2>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl">
              Atoms are the tiny building blocks of all matter.
            </p>
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-xl border-4 border-slate-800 shadow-xl relative overflow-hidden h-80 flex items-center justify-center">
              
              <div className="absolute text-center z-20">
                <div className="bg-slate-800/80 backdrop-blur rounded-xl p-3 border border-slate-700">
                  <div className="flex gap-1 justify-center mb-1">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </div>
                  <div className="flex gap-1 justify-center">
                    <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-wider">Nucleus (Protons + Neutrons)</div>
                </div>
              </div>

              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute w-48 h-16 border border-slate-600 rounded-[50%]">
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] flex items-center justify-center text-[8px] text-white font-bold">e⁻</div>
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }} className="absolute w-48 h-16 border border-slate-600 rounded-[50%] rotate-60">
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] flex items-center justify-center text-[8px] text-white font-bold">e⁻</div>
              </motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute w-48 h-16 border border-slate-600 rounded-[50%] -rotate-60">
                <div className="absolute -top-2 left-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] flex items-center justify-center text-[8px] text-white font-bold">e⁻</div>
              </motion.div>
            </div>
            <div className="mt-6 flex justify-center gap-6 text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Protons</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded-full" /> Neutrons</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Electrons</div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Elements</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              An element is a pure substance made of only one type of atom.
            </p>
            <div className="flex gap-4 mb-8">
              {['H', 'O', 'C', 'Fe'].map(sym => (
                <button 
                  key={sym} 
                  onClick={() => setActiveElement(sym)}
                  className={`w-16 h-16 rounded-xl text-2xl font-black border-2 transition-all ${activeElement === sym ? 'bg-indigo-500 text-white border-indigo-600 scale-110' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}
                >
                  {sym}
                </button>
              ))}
            </div>
            
            {activeElement ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 max-w-md w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-black text-indigo-700">{ELEMENTS[activeElement].name}</div>
                  <div className="text-3xl font-black text-indigo-300">{ELEMENTS[activeElement].num}</div>
                </div>
                <div className="text-left text-indigo-900 font-medium">
                  {ELEMENTS[activeElement].desc}
                </div>
              </motion.div>
            ) : (
              <div className="h-32 text-slate-400 font-bold flex items-center">Click an element to explore!</div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Periodic Table</h2>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl">
              Scientists organize all known elements into the Periodic Table. Each has a unique Atomic Number.
            </p>
            
            <div className="bg-slate-100 p-8 rounded-3xl border-2 border-slate-200 w-full max-w-2xl relative">
              <div className="grid grid-cols-8 gap-2 mb-8">
                {/* Row 1 */}
                <button onClick={() => setActiveElement("H")} className={`col-span-1 h-14 rounded-lg font-black text-lg border-b-4 transition-all ${activeElement==="H" ? 'bg-emerald-400 text-white border-emerald-500 scale-105' : 'bg-white text-slate-700 border-slate-200'}`}>H</button>
                <div className="col-span-6"></div>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">He</button>
                
                {/* Row 2 */}
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">Li</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">Be</button>
                <div className="col-span-2"></div>
                <button onClick={() => setActiveElement("C")} className={`col-span-1 h-14 rounded-lg font-black text-lg border-b-4 transition-all ${activeElement==="C" ? 'bg-amber-400 text-white border-amber-500 scale-105' : 'bg-white text-slate-700 border-slate-200'}`}>C</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">N</button>
                <button onClick={() => setActiveElement("O")} className={`col-span-1 h-14 rounded-lg font-black text-lg border-b-4 transition-all ${activeElement==="O" ? 'bg-blue-400 text-white border-blue-500 scale-105' : 'bg-white text-slate-700 border-slate-200'}`}>O</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">F</button>
                
                {/* Row 3 */}
                <button onClick={() => setActiveElement("Na")} className={`col-span-1 h-14 rounded-lg font-black text-lg border-b-4 transition-all ${activeElement==="Na" ? 'bg-rose-400 text-white border-rose-500 scale-105' : 'bg-white text-slate-700 border-slate-200'}`}>Na</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">Mg</button>
                <div className="col-span-2"></div>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">Si</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">P</button>
                <button className="col-span-1 h-14 bg-white text-slate-400 border-slate-200 rounded-lg font-black text-lg border-b-4">S</button>
                <button onClick={() => setActiveElement("Cl")} className={`col-span-1 h-14 rounded-lg font-black text-lg border-b-4 transition-all ${activeElement==="Cl" ? 'bg-purple-400 text-white border-purple-500 scale-105' : 'bg-white text-slate-700 border-slate-200'}`}>Cl</button>
              </div>

              {activeElement && ELEMENTS[activeElement] ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-md text-left border-l-8 border-indigo-500">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-slate-400 font-black uppercase text-xs">Atomic No. {ELEMENTS[activeElement].num}</div>
                      <div className="text-3xl font-black text-slate-800">{ELEMENTS[activeElement].name}</div>
                    </div>
                    <div className="text-5xl font-black text-slate-200">{ELEMENTS[activeElement].symbol}</div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-24 flex items-center justify-center text-slate-400 font-bold">Tap colored elements to inspect</div>
              )}
            </div>
          </div>
        );
      case 5:
        return <KnowledgeCheck questions={QUESTIONS} topicName="Atoms & Elements" onComplete={handleQuizComplete} />;
      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-indigo-600 mb-6">Atoms & Elements</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-indigo-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-indigo-300">
                <li>Atoms</li>
                <li>Protons</li>
                <li>Neutrons</li>
                <li>Electrons</li>
                <li>Elements</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ⭐ +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-indigo-600 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#4f46e5] hover:bg-indigo-500 active:translate-y-1 active:shadow-none transition-all"
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-indigo-500' : 'bg-slate-200'}`} />
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
            className="mt-12 bg-indigo-600 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#4f46e5] hover:bg-indigo-500 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 4 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
