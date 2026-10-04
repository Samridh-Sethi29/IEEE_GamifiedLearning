import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TYPES = [
  { id: "producers", name: "Producers", icon: "🌱", desc: "Organisms such as plants that make their own food using sunlight.", color: "bg-green-100 text-green-900 border-green-300" },
  { id: "consumers", name: "Consumers", icon: "🐰", desc: "Organisms that obtain energy by eating other organisms.", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "decomposers", name: "Decomposers", icon: "🍄", desc: "Organisms such as fungi and bacteria that break down dead material.", color: "bg-purple-100 text-purple-900 border-purple-300" },
];

const CHAIN = [
  { id: "sun", name: "Sun", icon: "☀️", role: "Energy Source" },
  { id: "grass", name: "Grass", icon: "🌱", role: "Producer" },
  { id: "insect", name: "Insect", icon: "🐛", role: "Primary Consumer" },
  { id: "frog", name: "Frog", icon: "🐸", role: "Secondary Consumer" },
  { id: "snake", name: "Snake", icon: "🐍", role: "Tertiary Consumer" },
  { id: "eagle", name: "Eagle", icon: "🦅", role: "Apex Predator" },
];

export default function EcosystemLesson() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); 
  const [activeType, setActiveType] = useState(null);
  const [activeChain, setActiveChain] = useState(null);
  
  // For the ordering interaction
  const [order, setOrder] = useState([]);
  const [available, setAvailable] = useState(["snake", "grass", "eagle", "frog"]);
  
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markProgress = () => {
    const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
    saved["ecosystem"] = true;
    localStorage.setItem("biology_progress", JSON.stringify(saved));
  };

  const handleOrderAdd = (id) => {
    setOrder([...order, id]);
    setAvailable(available.filter(a => a !== id));
  };

  const advanceQuestion = () => {
    if (qIndex < 4) {
      setQIndex(q => q + 1);
    } else {
      markProgress();
      setStep(4);
    }
  };

  const handleAnswer = (ans) => {
    let isCorrect = false;
    if (qIndex === 0 && ans === 'producer') isCorrect = true;
    if (qIndex === 2 && ans === 'producer') isCorrect = true;
    if (qIndex === 3 && ans === 'decomposer') isCorrect = true;
    if (qIndex === 4 && ans === 'lose_food') isCorrect = true;

    if (isCorrect) {
      setQError(false);
      advanceQuestion();
    } else {
      setQError(true);
      setTimeout(() => setQError(false), 2000);
    }
  };

  const checkOrder = () => {
    const correct = ["grass", "frog", "snake", "eagle"];
    const isCorrect = order.length === 4 && order.every((val, index) => val === correct[index]);
    
    if (isCorrect) {
      setQError(false);
      advanceQuestion();
    } else {
      setQError(true);
      setTimeout(() => {
        setQError(false);
        setOrder([]);
        setAvailable(["snake", "grass", "eagle", "frog"]);
      }, 1500);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/biology")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Exit Lesson
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl"
            >
              <div className="text-6xl mb-6">🌍</div>
              <h1 className="text-3xl font-black text-slate-800 mb-4">ECOSYSTEM & FOOD CHAIN</h1>
              <p className="text-lg text-slate-600 font-medium mb-8">
                An ecosystem is a community of living organisms interacting with one another and with their environment.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Living</h3>
                  <div className="text-2xl">🌱 🐰 🍄 🦠</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Non-Living</h3>
                  <div className="text-2xl">☀️ 💧 🌬️ 🪨</div>
                </div>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="bg-blue-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#2563eb] hover:bg-blue-400 active:translate-y-1 active:shadow-none transition-all"
              >
                Start Exploring
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="types"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl flex flex-col items-center justify-center"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-8">Producers, Consumers, Decomposers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                {TYPES.map(type => (
                  <div 
                    key={type.id}
                    className={`flex flex-col items-center text-center p-8 rounded-3xl border-2 cursor-pointer transition-all ${activeType === type.id ? type.color + ' scale-105 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setActiveType(type.id)}
                  >
                    <div className="text-6xl mb-4">{type.icon}</div>
                    <h3 className="text-xl font-black mb-2">{type.name}</h3>
                    <AnimatePresence>
                      {activeType === type.id && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="font-medium mt-2">
                          {type.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {activeType && (
                <button 
                  onClick={() => setStep(2)}
                  className="bg-slate-800 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                >
                  Next: Food Chains <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="chain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl flex flex-col items-center justify-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-2">The Food Chain</h2>
              <p className="text-slate-600 font-medium mb-8">Energy flows from the sun to producers, then to consumers.</p>

              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-12">
                {CHAIN.map((item, i) => (
                  <div key={item.id} className="flex items-center">
                    <div 
                      className={`flex flex-col items-center p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all ${activeChain === item.id ? 'bg-amber-50 border-amber-300 scale-110 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      onClick={() => setActiveChain(item.id)}
                    >
                      <div className="text-3xl md:text-4xl">{item.icon}</div>
                    </div>
                    {i < CHAIN.length - 1 && (
                      <div className="mx-1 md:mx-2 text-slate-300 font-bold">→</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="h-24 mb-8 w-full max-w-md">
                <AnimatePresence mode="wait">
                  {activeChain && (
                    <motion.div 
                      key={activeChain}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-amber-100 border border-amber-300 text-amber-900 p-4 rounded-xl text-center"
                    >
                      <div className="font-black text-lg">{CHAIN.find(c => c.id === activeChain).name}</div>
                      <div className="font-medium text-sm uppercase opacity-80">{CHAIN.find(c => c.id === activeChain).role}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="bg-emerald-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none transition-all"
              >
                Food Chain Challenge <ChevronRight className="w-5 h-5 inline" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
            >
              {qIndex === 0 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5 • Classify</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Classify the following: <span className="bg-slate-100 px-3 py-1 rounded-xl shadow-inner">Grass 🌱</span></h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("producer")} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 hover:border-green-400 hover:bg-green-50 transition-all text-lg">A. Producer</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-lg">B. Consumer</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-lg">C. Decomposer</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-lg">D. Non-living</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about how grass gets its food.</p>}
                </div>
              )}

              {qIndex === 1 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5 • Order</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">Arrange into a correct food chain</h2>
                  <p className="text-slate-500 font-medium mb-8">Click the organisms in the correct order of energy flow.</p>
                  
                  <div className="flex justify-center items-center gap-4 mb-8 min-h-[100px] p-4 bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl">
                    {order.length === 0 && <span className="text-slate-400 font-bold">Empty</span>}
                    {order.map((id, i) => {
                      const item = CHAIN.find(c => c.id === id);
                      return (
                        <div key={i} className="flex items-center">
                          <div className="text-4xl bg-white p-3 rounded-xl border border-slate-200 shadow-sm">{item.icon}</div>
                          {i < order.length - 1 && <div className="mx-2 text-slate-400 font-bold">→</div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-4 mb-8">
                    {available.map(id => {
                      const item = CHAIN.find(c => c.id === id);
                      return (
                        <button 
                          key={id}
                          onClick={() => handleOrderAdd(id)}
                          className="text-4xl bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                        >
                          {item.icon}
                        </button>
                      );
                    })}
                  </div>

                  {qError && <div className="text-red-500 font-bold mb-4 animate-bounce">That order is incorrect! Try again (e.g. Grass → Frog → ...)</div>}

                  {order.length === 4 && (
                    <button 
                      onClick={checkOrder}
                      className="bg-blue-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#2563eb] hover:bg-blue-400 active:translate-y-1 active:shadow-none transition-all"
                    >
                      Check Order
                    </button>
                  )}
                </div>
              )}

              {qIndex === 2 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5 • Identify</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Which type of organism makes its own food?</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleAnswer("producer")} className="p-6 rounded-2xl border-4 border-green-200 bg-green-50 font-bold text-xl text-green-800 hover:bg-green-100 shadow-sm transition-all">🌱 Producer</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-xl text-slate-700 hover:bg-slate-100 transition-all">🐰 Consumer</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-xl text-slate-700 hover:bg-slate-100 transition-all">🍄 Decomposer</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Which one "produces"?</p>}
                </div>
              )}

              {qIndex === 3 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5 • Roles</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">What is the main role of decomposers?</h2>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">A. To eat primary consumers.</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">B. To make food using sunlight.</button>
                    <button onClick={() => handleAnswer("decomposer")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left px-8 text-lg">C. To break down dead material.</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">D. To provide water to plants.</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about fungi and bacteria.</p>}
                </div>
              )}

              {qIndex === 4 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5 • Scenario</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">"Imagine that most plants disappear from an ecosystem."<br/><span className="text-lg font-medium text-slate-600 mt-2 block">What is likely to happen to animals that depend directly on those plants?</span></h2>
                  
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">They will start eating other consumers immediately.</button>
                    <button onClick={() => handleAnswer("lose_food")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100">They will lose an important food/energy source.</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">They will become producers.</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about what they eat.</p>}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-blue-500' : 'w-4 bg-slate-200'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-500"></div>
              
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Knowledge Check Complete!</h2>
              <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
                Score: 5/5 → Excellent understanding!
              </p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 flex flex-col gap-3 text-left shadow-inner">
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Ecosystem Roles</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Food Chains</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Interdependence</div>
              </div>

              <button 
                onClick={() => navigate("/world/school/science/biology")}
                className="w-full bg-slate-800 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#334155] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all"
              >
                Continue to Hub
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
