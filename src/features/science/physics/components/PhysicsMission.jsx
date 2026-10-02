import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Volume2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const CHALLENGES = [
  {
    type: "force",
    q: "Two equal forces act in opposite directions. What happens to the net force?",
    opts: ["It moves left", "It moves right", "Net force is zero", "It disappears"],
    ans: 2,
    explanation: "Equal forces in opposite directions balance each other, giving a net force of zero."
  },
  {
    type: "acceleration",
    q: "The car's velocity is increasing. Which concept describes this change?",
    opts: ["Reflection", "Acceleration", "Transparency", "Pitch"],
    ans: 1,
    explanation: "Acceleration describes how quickly velocity changes."
  },
  {
    type: "energy_fall",
    q: "As the ball falls, which energy transformation is taking place?",
    opts: ["Potential → Kinetic", "Sound → Light", "Electrical → Chemical", "Light → Sound"],
    ans: 0,
    explanation: "Stored potential energy turns into the energy of motion (kinetic)."
  },
  {
    type: "energy_transform",
    q: "What is the main transformation shown?",
    opts: ["Light → Electrical → Light", "Heat → Sound → Kinetic", "Electrical → Potential → Sound", "Kinetic → Light → Heat"],
    ans: 0,
    explanation: "The sun's radiant light is converted to electricity, which powers the bulb to make light!"
  },
  {
    type: "light_mirror",
    q: "When light hits a mirror, what happens?",
    opts: ["Reflection", "Vibration", "Friction", "Acceleration"],
    ans: 0,
    explanation: "The light bounces off the shiny surface!"
  },
  {
    type: "light_materials",
    q: "Which material allows most light to pass through?",
    opts: ["Transparent", "Translucent", "Opaque", "None"],
    ans: 0,
    explanation: "Transparent materials like clear glass let almost all light pass through."
  },
  {
    type: "circuit",
    q: "The circuit has a broken connection. What happens?",
    opts: ["Bulb turns on", "Bulb stays off", "Battery becomes brighter", "Current increases automatically"],
    ans: 1,
    explanation: "Electricity needs a complete, unbroken loop to flow!"
  },
  {
    type: "sound_freq",
    q: "Which wave represents the higher frequency?",
    opts: ["Wave A (fewer cycles)", "Wave B (more cycles)", "Neither", "Both"],
    ans: 1,
    explanation: "Higher frequency means more vibrations per second, creating a higher pitch."
  },
  {
    type: "sound_amp",
    q: "Which wave has greater amplitude? What does greater amplitude mean?",
    opts: ["Large wave; greater loudness", "Small wave; greater loudness", "Large wave; higher pitch", "Small wave; lower pitch"],
    ans: 0,
    explanation: "Amplitude is the height of the wave. Taller waves carry more energy and sound louder."
  },
  {
    type: "mixed",
    q: "A student pushes a box across a rough surface. Which combination of concepts is involved?",
    opts: ["Force + friction + motion", "Reflection + pitch", "Light + transparency", "Potential energy + shadow"],
    ans: 0,
    explanation: "Pushing is a force, the box moving is motion, and the rough surface creates friction!"
  }
];

export default function PhysicsMission() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 = intro, 1 = quiz, 2 = complete
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  
  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      // AudioContexts will be garbage collected, but we could explicitly close them if stored in a ref
    };
  }, []);

  const playTempSound = (freq, amp) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = amp / 100;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
      setTimeout(() => { 
        try { osc.stop(); ctx.close(); } catch(e) {}
      }, 1500);
    } catch(e) {
      console.warn("Audio play failed", e);
    }
  };

  const renderWave = (freq, amp) => {
    const points = [];
    const width = 300;
    const height = 100;
    const cycles = 1 + ((freq - 100) / 900) * 9;
    const waveAmp = (amp / 100) * 45;

    for (let x = 0; x <= width; x++) {
      const y = height / 2 + Math.sin((x / width) * Math.PI * 2 * cycles) * waveAmp;
      points.push(`${x},${y}`);
    }
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="overflow-visible">
        <polyline 
          points={points.join(" ")} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" 
        />
      </svg>
    );
  };

  const handleAnswer = (optIndex) => {
    if (answered) return;
    
    setSelectedOpt(optIndex);
    setAnswered(true);
    
    if (optIndex === CHALLENGES[qIndex].ans) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (qIndex < CHALLENGES.length - 1) {
      setQIndex(q => q + 1);
      setAnswered(false);
      setSelectedOpt(null);
    } else {
      finishMission();
    }
  };

  const finishMission = () => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["mission"]) {
      saved["mission"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(200);
    }
    setStep(2);
  };

  const renderVisual = (type) => {
    switch(type) {
      case "force":
        return (
          <div className="flex justify-center items-center gap-4 text-2xl md:text-3xl font-black mb-8">
            <span className="text-red-500">5 N ←</span>
            <div className="p-4 bg-amber-200 border-4 border-amber-400 rounded-xl shadow-inner text-5xl">📦</div>
            <span className="text-blue-500">→ 5 N</span>
          </div>
        );
      case "acceleration":
        return (
          <div className="flex flex-col items-center gap-4 text-5xl mb-8 w-full max-w-sm mx-auto">
            <div className="flex items-center gap-4 w-full h-24 bg-slate-800 rounded-2xl px-4 relative overflow-hidden border-b-4 border-slate-900">
               <div className="absolute bottom-0 w-full border-t-4 border-dashed border-yellow-500 opacity-50 left-0" />
               <motion.div animate={{ x: [0, 200] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeIn" }} className="scale-x-[-1] z-10 relative">🚗</motion.div> 
            </div>
          </div>
        );
      case "energy_fall":
        return (
          <div className="flex flex-col items-center gap-2 text-5xl mb-8 relative h-48 bg-sky-100 rounded-3xl w-full max-w-xs mx-auto border-4 border-sky-200 overflow-hidden">
            <motion.div animate={{ y: [0, 130, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute top-4 z-10">⚽</motion.div>
            <div className="absolute bottom-0 w-full h-8 bg-emerald-500 border-t-4 border-emerald-600" />
          </div>
        );
      case "energy_transform":
        return (
          <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl mb-8 bg-slate-100 p-6 rounded-3xl">
            <span>☀️</span> <span className="text-slate-300">→</span> <span>⬛</span> <span className="text-slate-300">→</span> <span>⚡</span> <span className="text-slate-300">→</span> <span>💡</span>
          </div>
        );
      case "light_mirror":
        return (
          <div className="flex flex-col items-center mb-8 relative h-48 w-48 mx-auto bg-slate-900 rounded-full border-4 border-slate-800 overflow-hidden">
            <div className="absolute top-4 left-4 text-4xl transform rotate-45">🔦</div>
            <div className="absolute top-12 left-10 w-20 h-2 bg-yellow-400 rotate-45 origin-left shadow-[0_0_15px_rgba(250,204,21,1)]" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-2 bg-sky-200 rounded-full shadow-[0_0_10px_rgba(186,230,253,0.8)]" />
            {answered && <motion.div initial={{ height: 0 }} animate={{ height: 70 }} className="absolute bottom-10 left-[110px] w-2 bg-yellow-400 origin-bottom shadow-[0_0_15px_rgba(250,204,21,1)] rotate-45" />}
          </div>
        );
      case "light_materials":
        return (
          <div className="flex justify-center gap-4 text-lg md:text-xl font-bold mb-8 flex-wrap">
            <div className="p-4 bg-sky-100/50 border-2 border-sky-300 rounded-xl text-slate-700">🪟 Glass</div>
            <div className="p-4 bg-white/70 backdrop-blur-md border-2 border-slate-300 rounded-xl text-slate-700">🧊 Frosted</div>
            <div className="p-4 bg-amber-800 border-2 border-amber-950 text-amber-100 rounded-xl shadow-inner">🪵 Wood</div>
          </div>
        );
      case "circuit":
        return (
          <div className="flex flex-col items-center text-3xl md:text-4xl mb-8 gap-4 w-full">
            {!answered ? (
              <div className="flex items-center justify-center w-full gap-2 bg-slate-800 p-6 rounded-3xl border-4 border-slate-700">
                🔋 <span className="w-8 h-2 bg-slate-600 rounded-full" /> 🔌 <span className="w-8 h-2 bg-slate-600 rounded-full" /> <span className="opacity-50 grayscale">💡</span> <span className="w-8 h-2 bg-transparent border-t-4 border-dashed border-red-500 rounded-full" /> ❌
              </div>
            ) : (
              <div className="flex items-center justify-center w-full gap-2 bg-slate-800 p-6 rounded-3xl border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                🔋 <span className="w-8 h-2 bg-yellow-400 rounded-full" /> 🔌 <span className="w-8 h-2 bg-yellow-400 rounded-full" /> <span className="drop-shadow-[0_0_15px_rgba(250,204,21,1)]">💡</span> <span className="w-8 h-2 bg-yellow-400 rounded-full" /> 🔌
              </div>
            )}
          </div>
        );
      case "sound_freq":
        return (
          <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 w-full bg-slate-900 p-3 rounded-2xl border-2 border-slate-700">
              <div className="font-bold w-16 text-slate-300 text-sm uppercase">Wave A</div>
              <div className="flex-1 h-16 rounded-xl">{renderWave(200, 50)}</div>
              <button onClick={() => playTempSound(200, 50)} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-500 transition-colors shadow-md flex items-center gap-2 font-bold"><Volume2 className="w-5 h-5"/> PLAY</button>
            </div>
            <div className="flex items-center gap-3 w-full bg-slate-900 p-3 rounded-2xl border-2 border-slate-700">
              <div className="font-bold w-16 text-slate-300 text-sm uppercase">Wave B</div>
              <div className="flex-1 h-16 rounded-xl">{renderWave(800, 50)}</div>
              <button onClick={() => playTempSound(800, 50)} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-500 transition-colors shadow-md flex items-center gap-2 font-bold"><Volume2 className="w-5 h-5"/> PLAY</button>
            </div>
          </div>
        );
      case "sound_amp":
        return (
          <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 w-full bg-slate-900 p-3 rounded-2xl border-2 border-slate-700">
              <div className="font-bold w-20 text-slate-300 text-sm uppercase">Small Wave</div>
              <div className="flex-1 h-20 rounded-xl">{renderWave(400, 20)}</div>
              <button onClick={() => playTempSound(400, 10)} className="bg-pink-600 text-white p-3 rounded-xl hover:bg-pink-500 transition-colors shadow-md flex items-center gap-2 font-bold"><Volume2 className="w-5 h-5"/> PLAY</button>
            </div>
            <div className="flex items-center gap-3 w-full bg-slate-900 p-3 rounded-2xl border-2 border-slate-700">
              <div className="font-bold w-20 text-slate-300 text-sm uppercase">Large Wave</div>
              <div className="flex-1 h-20 rounded-xl">{renderWave(400, 100)}</div>
              <button onClick={() => playTempSound(400, 100)} className="bg-pink-600 text-white p-3 rounded-xl hover:bg-pink-500 transition-colors shadow-md flex items-center gap-2 font-bold"><Volume2 className="w-5 h-5"/> PLAY</button>
            </div>
          </div>
        );
      case "mixed":
        return (
          <div className="flex flex-col items-center mb-8 bg-slate-100 p-8 rounded-3xl border-4 border-slate-200 shadow-inner max-w-md mx-auto w-full">
            <div className="text-5xl mb-6 flex items-center justify-center gap-2">
               <motion.div animate={{ x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="flex items-center gap-2 z-10">
                 <span>🧑‍🎓</span> <div className="scale-x-[-1] inline-block">🛷</div> <span>📦</span>
               </motion.div>
            </div>
            <div className="w-full h-8 bg-stone-500 rounded-full border-t-8 border-stone-600 border-dashed" />
          </div>
        );
      default:
        return null;
    }
  };

  if (step === 0) {
    return (
      <div className="w-full h-full bg-indigo-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 -left-20 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl bg-white p-10 md:p-14 rounded-[3rem] border border-slate-200 shadow-2xl relative z-10"
        >
          <div className="text-7xl mb-8 drop-shadow-lg">🔬</div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 uppercase tracking-widest">Final Physics Mission</h1>
          <p className="text-slate-500 font-black mb-8 text-lg md:text-xl uppercase tracking-wider">
            Everything you've learned is about to come together.
          </p>
          <p className="text-slate-600 font-bold mb-10 text-lg leading-relaxed">
            You've explored forces, energy, light, and sound. Now use your knowledge to solve the final set of Physics challenges.
          </p>
          
          <div className="flex justify-center gap-4 md:gap-8 text-4xl md:text-5xl mb-12">
            <span className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">🏃</span>
            <span className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">⚡</span>
            <span className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-100">💡</span>
            <span className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-100">🔊</span>
          </div>

          <button 
            onClick={() => setStep(1)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl px-8 py-5 rounded-2xl shadow-[0_8px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" /> BEGIN MISSION
          </button>
          
          <button 
            onClick={() => navigate("/world/school/science/physics")}
            className="w-full mt-6 text-slate-500 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="w-full h-full bg-indigo-950 flex flex-col items-center justify-center p-6 text-center font-sans overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-2xl my-8"
        >
          <div className="text-7xl mb-6">🏆</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 uppercase tracking-wide">Mission Complete!</h2>
          <p className="text-slate-500 font-black mb-8 text-lg uppercase tracking-wider">Physics Master</p>
          
          <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 mb-8">
            <div className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-2">Your Score</div>
            <div className="text-6xl font-black text-indigo-600 font-mono">{score} <span className="text-3xl text-indigo-300">/ 10</span></div>
          </div>

          <div className="flex flex-col gap-3 mb-8 w-full text-left">
            <div className="text-slate-400 font-black uppercase tracking-widest text-xs ml-2 mb-1">Topics Reviewed</div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between font-bold text-slate-700">
              <span>Force, Energy, Light, Sound</span>
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-5 h-5"/></span>
            </div>
            <div className="text-slate-400 font-black uppercase tracking-widest text-xs ml-2 mb-1 mt-3">Interactive Labs</div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between font-bold text-slate-700">
              <span>Speed Racer & Circuit Builder</span>
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-5 h-5"/></span>
            </div>
          </div>

          <div className="text-2xl font-black text-amber-500 bg-amber-50 px-6 py-4 rounded-2xl border-2 border-amber-200 w-full text-center mb-8 shadow-sm">
            ⭐ +200 XP
          </div>

          <button 
            onClick={() => navigate("/world/school/science/physics")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
          >
            Return to Physics Hub
          </button>
        </motion.div>
      </div>
    );
  }

  const challenge = CHALLENGES[qIndex];

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col overflow-y-auto font-sans">
      <div className="sticky top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 flex flex-col p-4 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-4">
          <button 
            onClick={() => navigate("/world/school/science/physics")}
            className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Exit Mission
          </button>
          <div className="text-indigo-500 font-black uppercase tracking-widest text-sm bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
            Challenge {qIndex + 1} / 10
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-1.5 w-full max-w-4xl mx-auto items-center justify-center">
          {CHALLENGES.map((_, i) => (
            <div key={i} className={`flex-1 h-3 md:h-4 rounded-full transition-all duration-500 ${
              i < qIndex ? 'bg-emerald-400' : i === qIndex ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-4 md:p-6 py-8 md:py-12 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-slate-200 shadow-xl w-full mb-8">
              {renderVisual(challenge.type)}
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-snug text-center">{challenge.q}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
              {challenge.opts.map((opt, i) => {
                const isSelected = selectedOpt === i;
                const isCorrect = i === challenge.ans;
                
                let btnClass = "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300";
                
                if (answered) {
                  if (isCorrect) {
                    btnClass = "bg-emerald-50 text-emerald-700 border-emerald-400 border-x-4 border-t-4 scale-[1.02] shadow-md z-10";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "bg-red-50 text-red-600 border-red-300 opacity-70";
                  } else {
                    btnClass = "bg-slate-50 text-slate-400 border-slate-200 opacity-50";
                  }
                }

                return (
                  <button 
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`p-5 md:p-6 rounded-2xl border-b-4 font-black text-lg transition-all flex items-center justify-center text-center border-x-2 border-t-2 ${btnClass} ${!answered ? 'active:border-b-2 active:translate-y-1' : ''}`}
                  >
                    {opt}
                    {answered && isCorrect && <CheckCircle2 className="w-6 h-6 ml-2 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-6 md:p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center gap-6 shadow-lg ${
                  selectedOpt === challenge.ans ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="text-5xl shrink-0">
                  {selectedOpt === challenge.ans ? '🎉' : '💡'}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className={`text-xl font-black uppercase tracking-wider mb-2 ${selectedOpt === challenge.ans ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedOpt === challenge.ans ? '✓ Correct!' : 'Not quite.'}
                  </h3>
                  <p className="text-slate-700 font-bold text-lg leading-relaxed">{challenge.explanation}</p>
                </div>
                
                <button 
                  onClick={nextQuestion}
                  className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white font-black px-10 py-4 rounded-xl shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap shrink-0 mt-4 md:mt-0"
                >
                  {qIndex < CHALLENGES.length - 1 ? "Next Challenge" : "Finish Mission"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
