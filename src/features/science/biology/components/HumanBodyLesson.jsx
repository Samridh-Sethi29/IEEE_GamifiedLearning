import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ORGANS = [
  { id: "brain", name: "Brain", icon: "🧠", desc: "Controls many functions and activities of the body.", top: "10%" },
  { id: "lungs", name: "Lungs", icon: "🫁", desc: "Bring oxygen into the body and remove carbon dioxide.", top: "30%" },
  { id: "heart", name: "Heart", icon: "❤️", desc: "Pumps blood throughout the body.", top: "40%" },
  { id: "liver", name: "Liver", icon: "🧬", desc: "Filters blood and produces bile.", top: "50%" },
  { id: "stomach", name: "Stomach", icon: "🍽️", desc: "Helps break down food during digestion.", top: "55%" },
  { id: "kidneys", name: "Kidneys", icon: "🫘", desc: "Filter waste and extra water from the blood.", top: "65%" },
  { id: "intestines", name: "Intestines", icon: "🐍", desc: "Absorb nutrients and water from food.", top: "75%" },
];

const QUESTIONS = [
  { q: "Which organ pumps blood?", a: "heart" },
  { q: "Where does gas exchange happen?", a: "lungs" },
  { q: "Which organ controls many activities of the body?", a: "brain" },
];

export default function HumanBodyLesson() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: intro, 1: explore, 2: systems, 3: quiz, 4: complete
  const [activeOrg, setActiveOrg] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [systemIndex, setSystemIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markProgress = () => {
    const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
    saved["human-body"] = true;
    localStorage.setItem("biology_progress", JSON.stringify(saved));
  };

  const handleOrgClick = (id) => {
    setActiveOrg(id);
    setDiscovered(prev => new Set([...prev, id]));
  };

  const handleAnswer = (ansId) => {
    let isCorrect = false;
    if (qIndex === 0 && ansId === "heart") isCorrect = true;
    if (qIndex === 1 && ansId === "lungs") isCorrect = true;
    if (qIndex === 2 && ansId === "circulatory") isCorrect = true;
    if (qIndex === 3 && ansId === "digestion") isCorrect = true;
    if (qIndex === 4 && ansId === "respiratory") isCorrect = true;

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
              <div className="text-6xl mb-6">🫀</div>
              <h1 className="text-3xl font-black text-slate-800 mb-4">HUMAN BODY</h1>
              <p className="text-lg text-slate-600 font-medium mb-8">
                Your body is made of many organs that work together to keep you alive. Let's explore them!
              </p>
              <button 
                onClick={() => setStep(1)}
                className="bg-red-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#b91c1c] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all"
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
                <h2 className="text-3xl font-black text-slate-800 mb-8">Interactive Human Body</h2>
                
                {/* Live Animated SVG Human Body Diagram */}
                <div className="relative w-72 h-[500px] md:w-80 md:h-[600px] flex items-center justify-center">
                  <svg viewBox="0 0 200 500" className="w-full h-full drop-shadow-xl overflow-visible">
                    <defs>
                      <filter id="organGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Body Outline */}
                    <motion.path 
                      d="M100 20 C120 20 130 35 130 55 C130 75 120 85 115 90 C145 95 160 110 165 140 C170 170 170 230 160 250 C155 260 150 250 145 230 C140 210 135 210 140 300 C145 390 140 450 135 480 C130 495 110 495 105 480 C100 450 100 400 100 350 C100 400 100 450 95 480 C90 495 70 495 65 480 C60 450 55 390 60 300 C65 210 60 210 55 230 C50 250 45 260 40 250 C30 230 30 170 35 140 C40 110 55 95 85 90 C80 85 70 75 70 55 C70 35 80 20 100 20 Z"
                      fill="#fdf2f8" 
                      stroke="#fbcfe8" strokeWidth="4"
                      animate={{ strokeWidth: [4, 5, 4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Organelles */}
                    {ORGANS.map(org => {
                      let x, y, el;
                      const isActive = activeOrg === org.id;
                      
                      switch (org.id) {
                        case 'brain':
                          x = 100; y = 50;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <path d="M 80 50 Q 80 30 100 30 Q 120 30 120 50 Q 120 70 100 70 Q 80 70 80 50 Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'lungs':
                          x = 100; y = 130;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <path d="M 95 110 Q 75 110 70 140 Q 70 160 95 150 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                              <path d="M 105 110 Q 125 110 130 140 Q 130 160 105 150 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'heart':
                          x = 100; y = 145;
                          el = (
                            <motion.g 
                              animate={isActive ? { scale: [1.2, 1.4, 1.2] } : { scale: [1, 1.1, 1] }} 
                              transition={{ duration: isActive ? 0.5 : 1.2, repeat: Infinity }}
                              style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}
                            >
                              <path d="M 100 155 L 95 150 C 90 145 90 135 100 140 C 110 135 110 145 105 150 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'liver':
                          x = 90; y = 175;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <path d="M 75 170 Q 100 160 120 175 Q 110 190 75 185 Z" fill="#a16207" stroke="#713f12" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'stomach':
                          x = 115; y = 190;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <path d="M 105 180 Q 130 180 125 200 Q 105 205 105 190 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'kidneys':
                          x = 100; y = 210;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <ellipse cx="85" cy="205" rx="8" ry="12" fill="#7c2d12" stroke="#451a03" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                              <ellipse cx="115" cy="205" rx="8" ry="12" fill="#7c2d12" stroke="#451a03" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                            </motion.g>
                          );
                          break;
                        case 'intestines':
                          x = 100; y = 240;
                          el = (
                            <motion.g animate={isActive ? { scale: 1.1 } : { scale: 1 }} style={{ cursor: "pointer" }} onClick={() => handleOrgClick(org.id)}>
                              <rect x="75" y="215" width="50" height="40" rx="10" fill="#f97316" stroke="#c2410c" strokeWidth="2" filter={isActive ? "url(#organGlow)" : ""} />
                              <path d="M 80 225 Q 100 215 120 225 M 80 235 Q 100 245 120 235" fill="none" stroke="#fdba74" strokeWidth="2" />
                            </motion.g>
                          );
                          break;
                        default: return null;
                      }
                      
                      return <g key={org.id}>{el}</g>;
                    })}
                  </svg>
                </div>
              </div>

              <div className="flex-1 w-full lg:w-96 flex flex-col gap-6">
                {activeOrg ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={activeOrg}
                    className="p-8 rounded-3xl border-2 shadow-xl bg-red-50 border-red-200 text-red-900"
                  >
                    <div className="text-6xl mb-4">{ORGANS.find(o => o.id === activeOrg).icon}</div>
                    <h3 className="text-3xl font-black mb-3">{ORGANS.find(o => o.id === activeOrg).name}</h3>
                    <p className="font-bold text-lg">{ORGANS.find(o => o.id === activeOrg).desc}</p>
                  </motion.div>
                ) : (
                  <div className="bg-slate-100 border-4 border-dashed border-slate-300 p-8 rounded-3xl text-center text-slate-500 font-bold text-lg flex items-center justify-center min-h-[250px]">
                    Select an organ to learn more.
                  </div>
                )}
                
                {discovered.size >= 5 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { setStep(2); setActiveOrg(null); }}
                    className="w-full bg-slate-800 text-white font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Next: Body Systems <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="systems"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-8">Body Systems</h2>
              
              <div className="flex gap-2 justify-center mb-8">
                {["Circulatory", "Respiratory", "Digestive"].map((sys, idx) => (
                  <button
                    key={sys}
                    onClick={() => setSystemIndex(idx)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${systemIndex === idx ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {sys}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                {systemIndex === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-center gap-4 text-2xl mb-4 font-bold text-slate-700">
                      ❤️ <ChevronRight className="text-slate-400" /> 🩸 <ChevronRight className="text-slate-400" /> 🧍 <ChevronRight className="text-slate-400" /> ❤️
                    </div>
                    <p className="text-slate-600">Transports blood, oxygen, nutrients and waste throughout the body.</p>
                  </motion.div>
                )}
                {systemIndex === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-center gap-4 text-2xl mb-4 font-bold text-slate-700">
                      🌬️ <ChevronRight className="text-slate-400" /> 🫁 <ChevronRight className="text-slate-400" /> 🫧 <ChevronRight className="text-slate-400" /> 🩸
                    </div>
                    <p className="text-slate-600">Brings oxygen into the body and removes carbon dioxide.</p>
                  </motion.div>
                )}
                {systemIndex === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-center gap-4 text-2xl mb-4 font-bold text-slate-700">
                      🍎 <ChevronRight className="text-slate-400" /> 👄 <ChevronRight className="text-slate-400" /> 🍽️ <ChevronRight className="text-slate-400" /> 🐍
                    </div>
                    <p className="text-slate-600">Breaks down food to absorb nutrients and energy.</p>
                  </motion.div>
                )}
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
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Which organ pumps blood throughout the body?</h2>
                  <p className="text-slate-500 font-medium mb-4">Click the correct organ.</p>
                  
                  <div className="relative w-48 h-[400px] flex items-center justify-center bg-slate-50 rounded-[40px] border-4 border-slate-100 shadow-inner p-4 mb-4">
                    <svg viewBox="0 0 200 500" className="w-full h-full drop-shadow-md overflow-visible">
                      <path d="M100 20 C120 20 130 35 130 55 C130 75 120 85 115 90 C145 95 160 110 165 140 C170 170 170 230 160 250 C155 260 150 250 145 230 C140 210 135 210 140 300 C145 390 140 450 135 480 C130 495 110 495 105 480 C100 450 100 400 100 350 C100 400 100 450 95 480 C90 495 70 495 65 480 C60 450 55 390 60 300 C65 210 60 210 55 230 C50 250 45 260 40 250 C30 230 30 170 35 140 C40 110 55 95 85 90 C80 85 70 75 70 55 C70 35 80 20 100 20 Z" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="4" />
                      
                      {/* Brain - Wrong */}
                      <g onClick={() => handleAnswer("brain")} className="cursor-pointer hover:opacity-70 transition-opacity">
                        <path d="M 80 50 Q 80 30 100 30 Q 120 30 120 50 Q 120 70 100 70 Q 80 70 80 50 Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
                      </g>
                      
                      {/* Lungs - Wrong */}
                      <g onClick={() => handleAnswer("lungs")} className="cursor-pointer hover:opacity-70 transition-opacity">
                        <path d="M 95 110 Q 75 110 70 140 Q 70 160 95 150 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                        <path d="M 105 110 Q 125 110 130 140 Q 130 160 105 150 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                      </g>
                      
                      {/* Heart - Correct */}
                      <g onClick={() => handleAnswer("heart")} className="cursor-pointer hover:scale-110 transition-transform origin-center">
                        <path d="M 100 155 L 95 150 C 90 145 90 135 100 140 C 110 135 110 145 105 150 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                      </g>
                      
                      {/* Stomach - Wrong */}
                      <g onClick={() => handleAnswer("stomach")} className="cursor-pointer hover:opacity-70 transition-opacity">
                        <path d="M 105 180 Q 130 180 125 200 Q 105 205 105 190 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>
                  {qError && <p className="text-red-500 font-bold animate-bounce">Not quite. Look for the red muscle in the chest.</p>}
                </div>
              )}

              {qIndex === 1 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5 • Match</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Match the organ to its primary function</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Brain : Filters blood</button>
                    <button onClick={() => handleAnswer("lungs")} className="p-4 rounded-xl border-4 border-sky-200 bg-sky-50 font-bold text-sky-800 hover:bg-sky-100 shadow-sm">Lungs : Gas exchange</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Stomach : Pumps blood</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Kidneys : Digests food</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite. Try finding the correct pair!</p>}
                </div>
              )}

              {qIndex === 2 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5 • Identify</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">Which body system is represented below?</h2>
                  
                  <div className="flex items-center justify-center gap-4 text-3xl mb-8 font-bold text-slate-700 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100">
                    ❤️ <ChevronRight className="text-slate-400" /> 🩸 <ChevronRight className="text-slate-400" /> 🧍
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Digestive System</button>
                    <button onClick={() => handleAnswer("circulatory")} className="p-4 rounded-xl border-2 border-red-200 bg-red-50 font-bold text-red-800 hover:bg-red-100 shadow-sm transition-all">Circulatory System</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Respiratory System</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Think about what pumps blood.</p>}
                </div>
              )}

              {qIndex === 3 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5 • Sequence</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">Select the correct order for the stages of digestion:</h2>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Stomach → Mouth → Small Intestine</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Mouth → Large Intestine → Stomach</button>
                    <button onClick={() => handleAnswer("digestion")} className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 font-bold text-amber-800 hover:bg-amber-100">Mouth → Stomach → Small Intestine → Large Intestine</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">Small Intestine → Stomach → Mouth</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Where does food enter the body first?</p>}
                </div>
              )}

              {qIndex === 4 && (
                <div className="w-full">
                  <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5 • Scenario</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8">"A person needs oxygen to reach their body's cells."<br/><span className="text-lg font-medium text-slate-600 mt-2 block">Which system brings oxygen into the body?</span></h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">A. Digestive System</button>
                    <button onClick={() => handleAnswer("respiratory")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:border-sky-400 hover:bg-sky-50">B. Respiratory System</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">C. Nervous System</button>
                    <button onClick={() => handleAnswer("wrong")} className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-700 hover:bg-slate-100">D. Circulatory System</button>
                  </div>
                  {qError && <p className="text-red-500 font-bold mt-6">Not quite! Which system uses the lungs?</p>}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-red-500' : 'w-4 bg-slate-200'}`} />
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
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-500"></div>
              
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Knowledge Check Complete!</h2>
              <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
                Score: 5/5 → Excellent understanding!
              </p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 flex flex-col gap-3 text-left shadow-inner">
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Human Organs</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Body Systems</div>
                <div className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Digestion Process</div>
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
