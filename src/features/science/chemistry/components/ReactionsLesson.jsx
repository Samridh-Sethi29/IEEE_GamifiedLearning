import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import KnowledgeCheck from "../../components/KnowledgeCheck";

const TOTAL_STEPS = 6;
const QUESTIONS = [
  {
    q: "What are the starting substances in a chemical reaction called?",
    visual: (
      <div className="flex gap-4 items-center text-4xl mb-4 font-black text-slate-400">
        <div className="flex flex-col items-center"><div className="border-4 border-rose-500 rounded-xl p-2 bg-rose-50 text-rose-500">🧪 + 🧪</div><div className="text-sm mt-2 text-rose-500">?</div></div>
        <span>➔</span>
        <div className="text-emerald-500">🧪</div>
      </div>
    ),
    opts: ["Products", "Reactants", "Indicators", "Elements"],
    ans: 1,
    explanation: "The substances you start with are called Reactants."
  },
  {
    q: "What are the substances formed during a chemical reaction called?",
    opts: ["Reactants", "Products", "Particles", "Solvents"],
    ans: 1,
    explanation: "The new substances produced by the reaction are called Products."
  },
  {
    q: "Which is an example of a physical change?",
    opts: ["Melting ice", "Burning paper", "Rusting iron", "Cooking an egg"],
    ans: 0,
    explanation: "Melting ice just changes its state to liquid water. It's still H₂O!"
  },
  {
    q: "Which can be a sign of a chemical reaction?",
    opts: ["Formation of gas", "Object changing location", "Object becoming larger because of zoom", "Moving a box"],
    ans: 0,
    explanation: "Forming gas (bubbles), changing color unexpectedly, or giving off light/heat are all signs of a possible chemical reaction."
  },
  {
    q: "In 'A + B → C', what are A and B?",
    opts: ["Products", "Reactants", "Indicators", "Acids"],
    ans: 1,
    explanation: "A and B are the reactants that combine to form the product, C."
  }
];

export default function ReactionsLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  const [mixed, setMixed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizComplete = (score) => {
    setQuizScore(score);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["reactions"]) {
      saved["reactions"] = true;
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
            <h2 className="text-3xl font-black text-slate-800 mb-6">Physical vs Chemical Change</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Not all changes are the same. Some just change the shape or state, while others create entirely new substances.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
                <div className="text-4xl mb-4">🧊 ➔ 💧</div>
                <h3 className="font-black text-slate-700 text-xl mb-2">Physical Change</h3>
                <p className="text-slate-500 font-bold">Ice melting into water. It's still H₂O!</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
                <div className="text-4xl mb-4">📄 ➔ 🔥</div>
                <h3 className="font-black text-rose-500 text-xl mb-2">Chemical Change</h3>
                <p className="text-slate-500 font-bold">Burning paper into ash. New substances are formed!</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Reactants & Products</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              In a chemical reaction, the starting ingredients are called <strong className="text-rose-500">Reactants</strong>, and the new substances formed are called <strong className="text-emerald-500">Products</strong>.
            </p>
            <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-700 text-white flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-4 text-3xl font-black mb-8">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🔴 + 🔵</div>
                  <div className="text-sm text-rose-400">REACTANTS</div>
                </div>
                <div>➔</div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🟣</div>
                  <div className="text-sm text-emerald-400">PRODUCT</div>
                </div>
              </div>
              <p className="text-slate-400 font-bold">The atoms rearrange to form something new!</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Interactive Reaction</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              Mix the reactants and observe the chemical change!
            </p>
            
            <div className="bg-slate-100 p-8 rounded-3xl border-2 border-slate-200 w-full max-w-md">
              {!mixed ? (
                <div className="flex flex-col items-center">
                  <div className="flex gap-8 mb-8 text-6xl">
                    <div className="flex flex-col items-center"><span className="mb-2">🧪</span><span className="text-sm font-bold text-rose-500 uppercase tracking-widest">Reactant A</span></div>
                    <div className="mt-4 font-black text-slate-400">+</div>
                    <div className="flex flex-col items-center"><span className="mb-2 grayscale">🧪</span><span className="text-sm font-bold text-blue-500 uppercase tracking-widest">Reactant B</span></div>
                  </div>
                  <button onClick={() => setMixed(true)} className="bg-rose-500 text-white px-8 py-3 rounded-xl font-black shadow-[0_4px_0_#be123c] active:translate-y-1 active:shadow-none transition-all">MIX THEM</button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} className="absolute text-6xl z-10 hue-rotate-180">🧪</motion.div>
                    {[...Array(8)].map((_, i) => (
                       <motion.div key={i} initial={{ y: 0, opacity: 1 }} animate={{ y: -60, opacity: 0 }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} className="absolute w-3 h-3 bg-white rounded-full border border-slate-300 z-20" />
                    ))}
                  </div>
                  <div className="text-emerald-500 font-black text-2xl uppercase tracking-widest mb-2">Reaction Complete!</div>
                  <div className="text-slate-500 font-bold">New Product Formed!</div>
                  <button onClick={() => setMixed(false)} className="mt-6 text-sm text-slate-400 font-bold hover:text-slate-600">Reset</button>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Signs of a Reaction</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              How do we know a chemical reaction might have happened? Look for these signs!
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
                <div className="text-4xl mb-3">🫧</div>
                <div className="font-black text-slate-700">Gas Produced</div>
                <div className="text-sm text-slate-500 font-bold mt-1">Bubbles form!</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
                <div className="text-4xl mb-3">🎨</div>
                <div className="font-black text-slate-700">Color Change</div>
                <div className="text-sm text-slate-500 font-bold mt-1">Unexpected new color.</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
                <div className="text-4xl mb-3">🌡️</div>
                <div className="font-black text-slate-700">Temp Change</div>
                <div className="text-sm text-slate-500 font-bold mt-1">Gets hot or cold.</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
                <div className="text-4xl mb-3">✨</div>
                <div className="font-black text-slate-700">Light Produced</div>
                <div className="text-sm text-slate-500 font-bold mt-1">Like a glow stick!</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-bold mt-6 max-w-lg">
              Note: Sometimes these can happen in physical changes too (like water boiling into gas bubbles), so you have to look at the whole picture!
            </p>
          </div>
        );
      case 5:
        return <KnowledgeCheck questions={QUESTIONS} topicName="Chemical Reactions" onComplete={handleQuizComplete} />;
      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-rose-600 mb-6">Chemical Reactions</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-rose-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-rose-300">
                <li>Physical vs Chemical Change</li>
                <li>Reactants</li>
                <li>Products</li>
                <li>Signs of Chemical Reactions</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ⭐ +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-rose-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#be123c] hover:bg-rose-400 active:translate-y-1 active:shadow-none transition-all"
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-rose-500' : 'bg-slate-200'}`} />
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
            className="mt-12 bg-rose-500 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#be123c] hover:bg-rose-400 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 4 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
