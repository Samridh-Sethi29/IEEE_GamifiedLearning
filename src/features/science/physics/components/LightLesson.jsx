import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const TOTAL_STEPS = 7;

export default function LightLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  // Interactive states
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [angle, setAngle] = useState(45);
  const [objDistance, setObjDistance] = useState(50); // 0 to 100
  const [activeMaterial, setActiveMaterial] = useState("transparent");
  
  // Quiz
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["light"]) {
      saved["light"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(75); // 50 learning + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["sun", "reflection", "opaque", "block", "closed"];
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

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Sources of Light</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Light can come from natural sources (like the Sun) or artificial sources (like a bulb).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 flex flex-col items-center shadow-sm">
                <span className="text-6xl mb-4">☀️</span>
                <span className="font-bold text-amber-800">Sun (Natural)</span>
              </div>
              <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 flex flex-col items-center shadow-sm">
                <span className="text-6xl mb-4 text-yellow-500">💡</span>
                <span className="font-bold text-yellow-800">Bulb (Artificial)</span>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 flex flex-col items-center shadow-sm">
                <span className="text-6xl mb-4">🕯️</span>
                <span className="font-bold text-orange-800">Candle (Artificial)</span>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 flex flex-col items-center shadow-sm">
                <span className="text-6xl mb-4">📱</span>
                <span className="font-bold text-blue-800">Screen (Artificial)</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">How Light Travels</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Light travels in straight lines through a uniform medium.
            </p>
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-800 flex items-center h-64 relative overflow-hidden">
              <button 
                onClick={() => setFlashlightOn(!flashlightOn)}
                className="absolute top-4 right-4 bg-slate-700 text-white font-bold px-4 py-2 rounded-xl z-20 hover:bg-slate-600"
              >
                Turn {flashlightOn ? "Off" : "On"}
              </button>
              <div className="text-6xl z-10">🔦</div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: flashlightOn ? '100%' : 0 }}
                transition={{ duration: 0.3 }}
                className="h-16 bg-gradient-to-r from-yellow-300 via-yellow-200/80 to-transparent ml-2 shadow-[0_0_30px_rgba(253,224,71,0.6)]"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Reflection</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              When light hits a shiny surface like a mirror, it bounces off. Change the angle!
            </p>
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-800 flex flex-col items-center h-96 relative overflow-hidden">
              <input type="range" min="10" max="80" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="absolute top-4 w-64 z-20 accent-yellow-400" />
              
              {/* Mirror */}
              <div className="absolute bottom-10 w-64 h-4 bg-sky-200 rounded-full border border-sky-300 shadow-[0_0_15px_rgba(186,230,253,0.5)]"></div>
              
              {/* Incident Ray */}
              <div className="absolute bottom-[44px] origin-bottom-left w-1 h-64 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ transform: `rotate(-${angle}deg)` }} />
              
              {/* Reflected Ray */}
              <div className="absolute bottom-[44px] origin-bottom-right w-1 h-64 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ transform: `rotate(${angle}deg)` }} />
              
              <div className="absolute top-20 text-yellow-400 font-bold font-mono">Angle: {angle}°</div>
            </div>
          </div>
        );
      case 4:
        const shadowSize = 100 + (100 - objDistance) * 1.5;
        const shadowOpacity = objDistance / 100;
        
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Shadows</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Shadows form when an object blocks light. Move the object closer to the light!
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200 relative flex flex-col items-center h-80">
              <input type="range" min="10" max="90" value={objDistance} onChange={(e) => setObjDistance(Number(e.target.value))} className="w-64 mb-8 accent-blue-500 z-20" />
              
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-5xl z-10">🔦</div>
              
              {/* Light beam background */}
              <div className="absolute left-20 top-1/2 -translate-y-1/2 w-[calc(100%-80px)] h-32 bg-yellow-200/50 clip-path-beam"></div>
              
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 text-5xl z-20"
                style={{ left: `${20 + objDistance * 0.6}%` }}
              >
                📦
              </motion.div>
              
              {/* Screen / Shadow */}
              <div className="absolute right-0 top-0 w-8 h-full bg-slate-300 border-l border-slate-400 flex items-center justify-center">
                <motion.div 
                  className="bg-slate-800/80 rounded-sm"
                  style={{ width: 8, height: shadowSize, opacity: 0.2 + shadowOpacity }}
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Materials</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Different materials let different amounts of light pass through.
            </p>
            <div className="flex gap-4 mb-8">
              <button onClick={() => setActiveMaterial("transparent")} className={`px-6 py-2 rounded-xl font-bold border-2 ${activeMaterial === 'transparent' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>Glass (Transparent)</button>
              <button onClick={() => setActiveMaterial("translucent")} className={`px-6 py-2 rounded-xl font-bold border-2 ${activeMaterial === 'translucent' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>Frosted (Translucent)</button>
              <button onClick={() => setActiveMaterial("opaque")} className={`px-6 py-2 rounded-xl font-bold border-2 ${activeMaterial === 'opaque' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>Wood (Opaque)</button>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-800 flex items-center justify-between h-64 relative overflow-hidden">
              <div className="text-6xl z-10">🔦</div>
              
              <div className="absolute left-20 w-[40%] h-16 bg-yellow-300/80"></div>
              
              {/* Material block */}
              <div className={`z-20 w-8 h-32 absolute left-1/2 -translate-x-1/2 border ${
                activeMaterial === 'transparent' ? 'bg-sky-200/30 backdrop-blur-none border-sky-300' : 
                activeMaterial === 'translucent' ? 'bg-white/50 backdrop-blur-md border-white' : 
                'bg-amber-900 border-amber-950'
              }`}></div>
              
              {/* Passed light */}
              <div className={`absolute left-1/2 w-[50%] h-16 transition-all duration-500 ${
                activeMaterial === 'transparent' ? 'bg-yellow-300/80' : 
                activeMaterial === 'translucent' ? 'bg-yellow-300/30 blur-sm' : 
                'bg-transparent'
              }`}></div>
            </div>
          </div>
        );
      case 6: // Quiz
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which is a natural source of light?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Lightbulb</button>
                  <button onClick={() => handleAnswer("sun")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. The Sun</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Phone Screen</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Think about nature!</p>}
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What happens when light hits a mirror?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("reflection")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. Reflection (it bounces off)</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. It gets absorbed</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. It passes right through</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Mirrors reflect things!</p>}
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which material is completely opaque?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Clear Glass</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Frosted Glass</button>
                  <button onClick={() => handleAnswer("opaque")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">C. Solid Wood</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Opaque means no light can pass through.</p>}
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Why does a shadow form?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Because light bends around objects</button>
                  <button onClick={() => handleAnswer("block")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. Because an object blocks the path of light</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Because light turns into darkness</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Think about the box and flashlight experiment.</p>}
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What is needed for a bulb to light up in a circuit?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("closed")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. A closed (complete) continuous path</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. An open path</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Only a battery, no wires needed</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Electricity needs a full circle to flow.</p>}
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
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Light Complete!</h2>
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full ${i + 1 <= step ? 'bg-yellow-400' : 'bg-slate-200'}`} />
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
