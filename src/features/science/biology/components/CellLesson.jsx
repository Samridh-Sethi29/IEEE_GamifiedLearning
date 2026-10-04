import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ORGANELLES = [
  { id: "nucleus", name: "Nucleus", icon: "🟣", desc: "Controls many activities of the cell and contains genetic material.", plant: true, animal: true, color: "bg-purple-100 border-purple-300 text-purple-900" },
  { id: "membrane", name: "Cell Membrane", icon: "🔵", desc: "Controls what enters and leaves the cell.", plant: true, animal: true, color: "bg-blue-100 border-blue-300 text-blue-900" },
  { id: "cytoplasm", name: "Cytoplasm", icon: "🟡", desc: "Jelly-like material where many cell activities take place.", plant: true, animal: true, color: "bg-yellow-100 border-yellow-300 text-yellow-900" },
  { id: "mitochondria", name: "Mitochondria", icon: "🟠", desc: "Helps release usable energy from food for the cell.", plant: true, animal: true, color: "bg-orange-100 border-orange-300 text-orange-900" },
  { id: "ribosomes", name: "Ribosomes", icon: "🟢", desc: "Make proteins needed by the cell.", plant: true, animal: true, color: "bg-emerald-100 border-emerald-300 text-emerald-900" },
  { id: "vacuole_small", name: "Small Vacuoles", icon: "💧", desc: "Stores water and other substances.", plant: false, animal: true, color: "bg-cyan-100 border-cyan-300 text-cyan-900" },
  { id: "vacuole_large", name: "Large Central Vacuole", icon: "💧", desc: "Stores water and helps maintain plant structure.", plant: true, animal: false, color: "bg-cyan-100 border-cyan-300 text-cyan-900" },
  { id: "chloroplast", name: "Chloroplast", icon: "🍃", desc: "Carries out photosynthesis in plant cells.", plant: true, animal: false, color: "bg-green-100 border-green-300 text-green-900" },
  { id: "wall", name: "Cell Wall", icon: "🧱", desc: "Provides support and protection in plant cells.", plant: true, animal: false, color: "bg-amber-100 border-amber-300 text-amber-900" },
];

const QUESTIONS = [
  { q: "Which organelle helps release usable energy?", a: "mitochondria" },
  { q: "Which structure controls what enters and leaves the cell?", a: "membrane" },
  { q: "Which structure is found in plant cells and is involved in photosynthesis?", a: "chloroplast" },
];

export default function CellLesson() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: intro, 1: explore, 2: comparison, 3: quiz, 4: complete
  const [activeOrg, setActiveOrg] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [cellType, setCellType] = useState("animal");
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markProgress = () => {
    const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
    saved.cell = true;
    localStorage.setItem("biology_progress", JSON.stringify(saved));
  };

  const handleOrgClick = (id) => {
    setActiveOrg(id);
    setDiscovered(prev => new Set([...prev, id]));
  };

  const handleAnswer = (ansId) => {
    let isCorrect = false;
    if (qIndex === 0 && ansId === "nucleus") isCorrect = true;
    if (qIndex === 1 && ansId === "mitochondria") isCorrect = true;
    if (qIndex === 2 && ansId === "chloroplast") isCorrect = true;
    if (qIndex === 3 && ansId === "cell_wall") isCorrect = true;
    if (qIndex === 4 && ansId === "mitochondria") isCorrect = true;

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
      {/* Top Bar */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/biology")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Exit Lesson
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 pt-20 md:pt-4 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl"
            >
              <div className="text-6xl mb-6">🧫</div>
              <h1 className="text-3xl font-black text-slate-800 mb-4">THE CELL</h1>
              <p className="text-lg text-slate-600 font-medium mb-8">
                A cell is the basic unit of life. All living organisms are made of one or more cells. Let's explore what's inside!
              </p>
              <button 
                onClick={() => setStep(1)}
                className="bg-purple-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#7e22ce] hover:bg-purple-400 active:translate-y-1 active:shadow-none transition-all"
              >
                Start Exploring
              </button>
            </motion.div>
          )}

          {/* STEP 1: EXPLORE */}
          {step === 1 && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center justify-center"
            >
              <div className="flex-[2] w-full bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col items-center relative min-h-[500px]">
                <h2 className="text-3xl font-black text-slate-800 mb-8">Interactive Animal Cell</h2>
                
                {/* Live Animated SVG Cell Diagram */}
                <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] flex items-center justify-center">
                  <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl overflow-visible">
                    <defs>
                      <radialGradient id="cellGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="90%" stopColor="#bae6fd" />
                        <stop offset="100%" stopColor="#7dd3fc" />
                      </radialGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Cytoplasm & Membrane */}
                    <motion.circle 
                      cx="200" cy="200" r="180" 
                      fill="url(#cellGrad)" 
                      stroke="#38bdf8" strokeWidth="8"
                      animate={{ r: [180, 185, 180] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Organelles */}
                    {ORGANELLES.filter(o => o.animal).map(org => {
                      let x, y, el;
                      const isActive = activeOrg === org.id;
                      
                      switch (org.id) {
                        case 'nucleus':
                          x = 200; y = 200;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <circle cx={x} cy={y} r="50" fill="#d8b4fe" stroke="#a855f7" strokeWidth="4" filter={isActive ? "url(#glow)" : ""} />
                              <circle cx={x} cy={y} r="20" fill="#a855f7" />
                            </motion.g>
                          );
                          break;
                        case 'membrane':
                          x = 200; y = 20;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <rect x={x-30} y={y-10} width="60" height="20" rx="10" fill="#60a5fa" stroke="#2563eb" strokeWidth="3" filter={isActive ? "url(#glow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'cytoplasm':
                          x = 100; y = 280;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <circle cx={x} cy={y} r="30" fill="#fef08a" stroke="#eab308" strokeWidth="3" opacity="0.8" filter={isActive ? "url(#glow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'mitochondria':
                          x = 120; y = 130;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <path d={`M ${x-20} ${y} Q ${x-10} ${y-20} ${x+20} ${y-10} Q ${x+30} ${y+10} ${x+10} ${y+20} Q ${x-10} ${y+20} ${x-20} ${y} Z`} fill="#fdba74" stroke="#f97316" strokeWidth="3" filter={isActive ? "url(#glow)" : ""} />
                              <path d={`M ${x-15} ${y} Q ${x-5} ${y-5} ${x+5} ${y} T ${x+15} ${y}`} fill="none" stroke="#f97316" strokeWidth="2" />
                            </motion.g>
                          );
                          break;
                        case 'ribosomes':
                          x = 280; y = 260;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <circle cx={x-10} cy={y-10} r="6" fill="#10b981" filter={isActive ? "url(#glow)" : ""} />
                              <circle cx={x+10} cy={y-5} r="6" fill="#10b981" filter={isActive ? "url(#glow)" : ""} />
                              <circle cx={x} cy={y+10} r="6" fill="#10b981" filter={isActive ? "url(#glow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'vacuole_small':
                          x = 290; y = 140;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOrgClick(org.id)}
                            >
                              <circle cx={x} cy={y} r="25" fill="#a5f3fc" stroke="#06b6d4" strokeWidth="3" opacity="0.9" filter={isActive ? "url(#glow)" : ""} />
                            </motion.g>
                          );
                          break;
                        default: return null;
                      }
                      
                      return <g key={org.id}>{el}</g>;
                    })}
                  </svg>
                </div>
                
                <p className="text-slate-500 text-lg font-bold mt-10">Click on the parts of the cell to learn about them.</p>
              </div>

              <div className="flex-1 w-full lg:w-96 flex flex-col gap-6">
                {activeOrg ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={activeOrg}
                    className={`p-8 rounded-3xl border-2 shadow-xl ${ORGANELLES.find(o => o.id === activeOrg).color}`}
                  >
                    <div className="text-6xl mb-4">{ORGANELLES.find(o => o.id === activeOrg).icon}</div>
                    <h3 className="text-3xl font-black mb-3">{ORGANELLES.find(o => o.id === activeOrg).name}</h3>
                    <p className="font-bold text-lg">{ORGANELLES.find(o => o.id === activeOrg).desc}</p>
                  </motion.div>
                ) : (
                  <div className="bg-slate-100 border-4 border-dashed border-slate-300 p-8 rounded-3xl text-center text-slate-500 font-bold text-lg flex items-center justify-center min-h-[250px]">
                    Select an organelle to see its function.
                  </div>
                )}
                
                {discovered.size >= 6 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { setStep(2); setActiveOrg(null); }}
                    className="w-full bg-slate-800 text-white font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Next: Plant Cells <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: COMPARISON */}
          {step === 2 && (
            <motion.div 
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-slate-800">Plant Cell vs Animal Cell</h2>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setCellType("animal")}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${cellType === "animal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Animal Cell
                  </button>
                  <button 
                    onClick={() => setCellType("plant")}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${cellType === "plant" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Plant Cell
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={`w-64 h-64 md:w-80 md:h-80 mx-auto border-8 flex items-center justify-center shadow-inner relative transition-colors duration-500 ${cellType === "plant" ? "rounded-xl border-green-300 bg-green-50" : "rounded-full border-blue-200 bg-blue-50"}`}>
                   <div className="text-6xl">{cellType === "plant" ? "🌿" : "🐾"}</div>
                </div>
                
                <div className="flex-1 w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 uppercase text-sm tracking-wider">Present in {cellType} cell:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ORGANELLES.filter(o => o[cellType]).map(org => (
                      <div key={org.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-2xl">{org.icon}</div>
                        <span className="font-bold text-slate-700 text-sm">{org.name}</span>
                        {(!org.animal || !org.plant) && (
                          <span className="ml-auto text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-full">UNIQUE</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setStep(3)}
                  className="bg-emerald-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  Quick Check <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: QUIZ */}
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
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Which organelle controls many activities of the cell?</h2>
                  <p className="text-slate-500 font-medium mb-4">Click the correct part on the cell below.</p>
                  
                  <div className="relative w-64 h-64 border-4 border-slate-100 rounded-[40px] shadow-inner bg-slate-50 flex items-center justify-center p-4">
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md overflow-visible">
                      <circle cx="200" cy="200" r="180" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="4" />
                      
                      {/* Mitochondria - Wrong */}
                      <g onClick={() => handleAnswer("mitochondria")} style={{ cursor: "pointer" }} className="hover:opacity-70 transition-opacity">
                        <path d="M 100 130 Q 110 110 140 120 Q 150 140 130 150 Q 110 150 100 130 Z" fill="#fdba74" stroke="#f97316" strokeWidth="3" />
                      </g>
                      
                      {/* Cytoplasm - Wrong */}
                      <circle cx="100" cy="280" r="30" fill="#fef08a" stroke="#eab308" strokeWidth="3" opacity="0.8" onClick={() => handleAnswer("cytoplasm")} style={{ cursor: "pointer" }} className="hover:opacity-70" />
                      
                      {/* Nucleus - Correct */}
                      <g onClick={() => handleAnswer("nucleus")} style={{ cursor: "pointer" }} className="hover:scale-105 transition-transform origin-center">
                        <circle cx="200" cy="200" r="50" fill="#d8b4fe" stroke="#a855f7" strokeWidth="4" />
                        <circle cx="200" cy="200" r="20" fill="#a855f7" />
                      </g>
                    </svg>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite. Think about which structure acts as the control center.</p>}
                </div>
              )}

              {qIndex === 1 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5 • Identify</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Match the organelle to its function</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Vacuole : Photosynthesis</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Nucleus : Storage</button>
                    <button onClick={() => handleAnswer("mitochondria")} className="p-4 rounded-xl border-4 border-orange-200 bg-orange-50 font-bold text-orange-800 hover:bg-orange-100 shadow-sm">Mitochondria : Releases usable energy</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Chloroplast : Controls cell</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite. Try finding the correct pair!</p>}
                </div>
              )}

              {qIndex === 2 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5 • Multiple Choice</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Which structure is characteristic of plant cells?</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("chloroplast")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 transition-all">A. Chloroplast</button>
                    <button onClick={() => handleAnswer("mitochondria")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-slate-400 transition-all">B. Mitochondria</button>
                    <button onClick={() => handleAnswer("ribosome")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-slate-400 transition-all">C. Ribosome</button>
                    <button onClick={() => handleAnswer("cytoplasm")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-slate-400 transition-all">D. Cytoplasm</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Which organelle helps plants make food?</p>}
                </div>
              )}

              {qIndex === 3 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5 • Select</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Select ALL structures that are unique to plant cells:</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => handleAnswer("cell_wall")} className="p-4 rounded-xl border-4 border-amber-200 bg-amber-50 font-bold text-amber-800 hover:bg-amber-100 shadow-sm">Cell Wall</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Nucleus</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Cell Membrane</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Mitochondria</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Which one provides rigid support for plants?</p>}
                </div>
              )}

              {qIndex === 4 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5 • Scenario</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">"A cell needs to release usable energy from food."<br/><span className="text-lg font-medium text-slate-600 mt-2 block">Which organelle is most directly involved?</span></h2>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">A. Vacuole</button>
                    <button onClick={() => handleAnswer("mitochondria")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">B. Mitochondria</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">C. Cell Wall</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left px-8 text-lg">D. Nucleus</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about the "powerhouse" of the cell.</p>}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-purple-500' : 'w-4 bg-slate-200'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: COMPLETE */}
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
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Cell structure</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Organelles</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Plant vs animal cells</div>
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
