import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PLANT_PARTS = [
  { id: "flower", name: "Flower", icon: "🌸", desc: "Helps many plants reproduce.", color: "bg-pink-100 text-pink-900 border-pink-300" },
  { id: "fruit", name: "Fruit", icon: "🍎", desc: "Protects and helps spread seeds.", color: "bg-red-100 text-red-900 border-red-300" },
  { id: "seed", name: "Seed", icon: "🌰", desc: "Contains the beginning of a new plant.", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "leaf", name: "Leaf", icon: "🍃", desc: "Captures sunlight and is the main site of photosynthesis.", color: "bg-green-100 text-green-900 border-green-300" },
  { id: "stem", name: "Stem", icon: "🌿", desc: "Supports the plant and transports water and nutrients.", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { id: "root", name: "Root", icon: "🌱", desc: "Absorbs water and minerals from the soil.", color: "bg-orange-100 text-orange-900 border-orange-300" },
];

const QUESTIONS = [
  { q: "What does the root absorb?", a: "root_ans" }, // simplified for UI
  { q: "Where does photosynthesis mainly occur?", a: "leaf" },
  { q: "What does a stem help transport?", a: "stem_ans" },
];

export default function PlantsLesson() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); 
  const [activePart, setActivePart] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [photoAnim, setPhotoAnim] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markProgress = () => {
    const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
    saved["plants"] = true;
    localStorage.setItem("biology_progress", JSON.stringify(saved));
  };

  const handlePartClick = (id) => {
    setActivePart(id);
    setDiscovered(prev => new Set([...prev, id]));
  };

  const handleAnswer = (ans) => {
    let isCorrect = false;
    if (qIndex === 0 && ans === 'root') isCorrect = true;
    if (qIndex === 1 && ans === 'leaf') isCorrect = true;
    if (qIndex === 2 && ans === 'photosynthesis') isCorrect = true;
    if (qIndex === 3 && ans === 'light_water_co2') isCorrect = true;
    if (qIndex === 4 && ans === 'photosynthesis_2') isCorrect = true;

    if (isCorrect) {
      setQError(false);
      if (qIndex < 4) {
        setQIndex(q => q + 1);
      } else {
        markProgress();
        setStep(4);
      }
    } else {
      setQError(true);
      setTimeout(() => setQError(false), 2000);
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

      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 pt-20 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl"
            >
              <div className="text-6xl mb-6">🌱</div>
              <h1 className="text-3xl font-black text-slate-800 mb-4">PLANTS</h1>
              <p className="text-lg text-slate-600 font-medium mb-8">
                Plants are living organisms that use sunlight, water, and carbon dioxide to make food. Let's explore how they work!
              </p>
              <button 
                onClick={() => setStep(1)}
                className="bg-emerald-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#047857] hover:bg-emerald-400 active:translate-y-1 active:shadow-none transition-all"
              >
                Start Exploring
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center justify-center"
            >
              <div className="flex-[2] w-full bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col items-center min-h-[500px]">
                <h2 className="text-3xl font-black text-slate-800 mb-8">Interactive Plant</h2>
                
                {/* Live Animated SVG Plant Diagram */}
                <div className="relative w-64 h-[500px] md:w-80 md:h-[600px] flex items-center justify-center mt-4">
                  <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl overflow-visible">
                    <defs>
                      <filter id="plantGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Dirt/Ground */}
                    <path d="M 50 350 Q 100 340 150 350 L 150 400 L 50 400 Z" fill="#78350f" />
                    
                    {/* Plant Parts mapped from state */}
                    {PLANT_PARTS.map(part => {
                      let el;
                      const isActive = activePart === part.id;
                      const scale = isActive ? 1.15 : 1;
                      const filter = isActive ? "url(#plantGlow)" : "";
                      
                      switch (part.id) {
                        case 'root':
                          el = (
                            <motion.g animate={{ scale }} style={{ cursor: "pointer", transformOrigin: "100px 350px" }} onClick={() => handlePartClick(part.id)}>
                              <path d="M 100 350 C 100 370 80 390 80 400 M 100 350 C 100 370 120 390 120 400 M 90 370 C 80 380 70 380 70 380 M 110 370 C 120 380 130 380 130 380" fill="none" stroke="#d97706" strokeWidth="4" filter={filter} />
                            </motion.g>
                          );
                          break;
                        case 'stem':
                          el = (
                            <motion.g animate={{ scale }} style={{ cursor: "pointer", transformOrigin: "100px 350px" }} onClick={() => handlePartClick(part.id)}>
                              <path d="M 100 350 Q 95 250 100 150" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" filter={filter} />
                            </motion.g>
                          );
                          break;
                        case 'leaf':
                          el = (
                            <motion.g animate={{ scale }} style={{ cursor: "pointer", transformOrigin: "100px 250px" }} onClick={() => handlePartClick(part.id)}>
                              {/* Left Leaf */}
                              <path d="M 98 250 C 60 250 40 220 40 200 C 60 190 95 220 98 250 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" filter={filter} />
                              {/* Right Leaf */}
                              <path d="M 102 200 C 140 200 160 170 160 150 C 140 140 105 170 102 200 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" filter={filter} />
                            </motion.g>
                          );
                          break;
                        case 'flower':
                          el = (
                            <motion.g 
                              animate={{ scale: isActive ? [1.1, 1.2, 1.1] : 1 }}
                              transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                              style={{ cursor: "pointer", transformOrigin: "100px 140px" }} 
                              onClick={() => handlePartClick(part.id)}
                            >
                              <circle cx="100" cy="140" r="15" fill="#facc15" filter={filter} />
                              <circle cx="80" cy="140" r="15" fill="#f472b6" filter={filter} />
                              <circle cx="120" cy="140" r="15" fill="#f472b6" filter={filter} />
                              <circle cx="100" cy="120" r="15" fill="#f472b6" filter={filter} />
                              <circle cx="100" cy="160" r="15" fill="#f472b6" filter={filter} />
                            </motion.g>
                          );
                          break;
                        case 'fruit':
                          el = (
                            <motion.g animate={{ scale }} style={{ cursor: "pointer", transformOrigin: "80px 180px" }} onClick={() => handlePartClick(part.id)}>
                              <circle cx="80" cy="180" r="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" filter={filter} />
                              <path d="M 80 168 Q 85 160 90 165" fill="none" stroke="#15803d" strokeWidth="2" />
                            </motion.g>
                          );
                          break;
                        case 'seed':
                          el = (
                            <motion.g animate={{ scale }} style={{ cursor: "pointer", transformOrigin: "120px 280px" }} onClick={() => handlePartClick(part.id)}>
                              <ellipse cx="120" cy="280" rx="5" ry="8" fill="#92400e" stroke="#78350f" strokeWidth="1" filter={filter} />
                              <ellipse cx="130" cy="285" rx="5" ry="8" fill="#92400e" stroke="#78350f" strokeWidth="1" filter={filter} />
                            </motion.g>
                          );
                          break;
                        default: return null;
                      }
                      
                      return <g key={part.id}>{el}</g>;
                    })}
                  </svg>
                </div>
              </div>

              <div className="flex-1 w-full lg:w-96 flex flex-col gap-6">
                {activePart ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={activePart}
                    className={`p-8 rounded-3xl border-2 shadow-xl ${PLANT_PARTS.find(p => p.id === activePart).color}`}
                  >
                    <div className="text-6xl mb-4">{PLANT_PARTS.find(p => p.id === activePart).icon}</div>
                    <h3 className="text-3xl font-black mb-3">{PLANT_PARTS.find(p => p.id === activePart).name}</h3>
                    <p className="font-bold text-lg">{PLANT_PARTS.find(p => p.id === activePart).desc}</p>
                  </motion.div>
                ) : (
                  <div className="bg-slate-100 border-4 border-dashed border-slate-300 p-8 rounded-3xl text-center text-slate-500 font-bold text-lg flex items-center justify-center min-h-[250px]">
                    Select a plant part to learn more.
                  </div>
                )}
                
                {discovered.size >= 6 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { setStep(2); setActivePart(null); }}
                    className="w-full bg-slate-800 text-white font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Next: Photosynthesis <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="photosynthesis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-4">Photosynthesis</h2>
              <p className="text-slate-600 font-medium mb-8">Plants use sunlight, water, and carbon dioxide to make food.</p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 font-bold text-amber-700"><span className="text-xl">☀️</span> Sunlight</div>
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 font-bold text-blue-700"><span className="text-xl">💧</span> Water</div>
                  <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 font-bold text-slate-700"><span className="text-xl">🌫️</span> CO2</div>
                </div>
                
                <div className="text-4xl text-slate-300">→</div>
                
                <motion.div 
                  className="w-32 h-32 bg-green-100 rounded-full border-4 border-green-400 flex items-center justify-center text-6xl shadow-inner cursor-pointer hover:bg-green-200"
                  onClick={() => setPhotoAnim(true)}
                  animate={photoAnim ? { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 1 }}
                >
                  🌿
                </motion.div>
                
                <div className="text-4xl text-slate-300">→</div>
                
                <div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {photoAnim && (
                      <>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full border border-orange-200 font-bold text-orange-700">
                          <span className="text-xl">🍬</span> Food (Sugar)
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 bg-cyan-50 px-4 py-2 rounded-full border border-cyan-200 font-bold text-cyan-700">
                          <span className="text-xl">🫧</span> Oxygen
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                  {!photoAnim && <div className="text-slate-400 font-medium italic">Click the leaf!</div>}
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="bg-emerald-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none transition-all"
              >
                Quick Check <ChevronRight className="w-5 h-5 inline" />
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
                <div className="w-full flex flex-col items-center">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5 • Identify</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Which part absorbs water and minerals from the soil?</h2>
                  <p className="text-slate-500 font-medium mb-4">Click the correct part of the plant.</p>
                  
                  <div className="relative w-64 h-[400px] flex items-center justify-center bg-slate-50 rounded-[40px] border-4 border-slate-100 shadow-inner p-4 mb-4">
                    <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-md overflow-visible">
                      <path d="M 50 350 Q 100 340 150 350 L 150 400 L 50 400 Z" fill="#78350f" />
                      
                      {/* Root - Correct */}
                      <g onClick={() => handleAnswer("root")} className="cursor-pointer hover:scale-110 transition-transform origin-center">
                        <path d="M 100 350 C 100 370 80 390 80 400 M 100 350 C 100 370 120 390 120 400 M 90 370 C 80 380 70 380 70 380 M 110 370 C 120 380 130 380 130 380" fill="none" stroke="#d97706" strokeWidth="6" />
                      </g>
                      
                      {/* Stem - Wrong */}
                      <g onClick={() => handleAnswer("stem")} className="cursor-pointer hover:opacity-70 transition-opacity">
                        <path d="M 100 350 Q 95 250 100 150" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                      </g>
                      
                      {/* Leaf - Wrong */}
                      <g onClick={() => handleAnswer("leaf")} className="cursor-pointer hover:opacity-70 transition-opacity">
                        <path d="M 98 250 C 60 250 40 220 40 200 C 60 190 95 220 98 250 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
                        <path d="M 102 200 C 140 200 160 170 160 150 C 140 140 105 170 102 200 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>
                  {qError && <p className="text-red-500 font-bold animate-bounce">Not quite. Where is the soil?</p>}
                </div>
              )}

              {qIndex === 1 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5 • Match</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Match the plant part to its primary function</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Root : Photosynthesis</button>
                    <button onClick={() => handleAnswer("leaf")} className="p-4 rounded-xl border-4 border-emerald-200 bg-emerald-50 font-bold text-emerald-800 hover:bg-emerald-100 shadow-sm">Leaf : Main site of photosynthesis</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Stem : Absorbs water</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Flower : Supports the plant</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite. Try finding the correct pair!</p>}
                </div>
              )}

              {qIndex === 2 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5 • Process</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">What process allows plants to make food using these inputs?</h2>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-2xl mb-8 font-bold text-slate-700 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100">
                    <span className="bg-white p-2 rounded-xl shadow-sm">☀️ Sunlight</span> <span className="text-slate-300 text-3xl">+</span> 
                    <span className="bg-white p-2 rounded-xl shadow-sm">💧 Water</span> <span className="text-slate-300 text-3xl">+</span> 
                    <span className="bg-white p-2 rounded-xl shadow-sm">🌫️ CO2</span>
                    <span className="text-emerald-400 text-4xl mx-2">→</span> 🌿
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Respiration</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Digestion</button>
                    <button onClick={() => handleAnswer("photosynthesis")} className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 font-bold text-emerald-800 hover:bg-emerald-100 shadow-sm transition-all">Photosynthesis</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Pollination</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about "photo" meaning light.</p>}
                </div>
              )}

              {qIndex === 3 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5 • Select</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">What does a plant mainly need for photosynthesis?</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Oxygen & Sugar</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Soil & Bugs</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Heat & Seeds</button>
                    <button onClick={() => handleAnswer("light_water_co2")} className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 font-bold text-amber-800 hover:bg-amber-100">Sunlight, Water, and Carbon Dioxide</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Check the equation in the previous question.</p>}
                </div>
              )}

              {qIndex === 4 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5 • Scenario</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">"A plant is placed somewhere with no sunlight."<br/><span className="text-lg font-medium text-slate-600 mt-2 block">What important process will be affected?</span></h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">A. Absorbing water</button>
                    <button onClick={() => handleAnswer("photosynthesis_2")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-emerald-400 hover:bg-emerald-50">B. Photosynthesis</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">C. Pollination</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">D. Releasing seeds</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Light is required for making food.</p>}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-emerald-500' : 'w-4 bg-slate-200'}`} />
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
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
              
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Knowledge Check Complete!</h2>
              <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
                Score: 5/5 → Excellent understanding!
              </p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 flex flex-col gap-3 text-left shadow-inner">
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Plant Parts</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Photosynthesis Inputs</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Importance of Light</div>
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
