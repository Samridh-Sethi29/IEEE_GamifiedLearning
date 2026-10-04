import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Square, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const TOTAL_STEPS = 5;

export default function SoundLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  // Interactive states
  const [vibrating, setVibrating] = useState(false);
  const [frequency, setFrequency] = useState(440); // 100 to 1000 Hz
  const [amplitude, setAmplitude] = useState(50); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);
  const [hearing, setHearing] = useState(false); // step 2 demo
  
  // Audio refs
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    return () => stopAudio(); // cleanup on unmount
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      stopAudio(); // Stop if step changes or user toggles
    }
  }, [step]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playAudio = () => {
    initAudio();
    stopAudio(); // ensure clean state
    
    oscRef.current = audioCtxRef.current.createOscillator();
    gainNodeRef.current = audioCtxRef.current.createGain();
    
    oscRef.current.type = "sine";
    oscRef.current.frequency.value = frequency;
    
    // Map amplitude 0-100 to gain 0-1
    gainNodeRef.current.gain.value = amplitude / 100;
    
    oscRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioCtxRef.current.destination);
    
    oscRef.current.start();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e) {}
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  // Live update audio when sliders change
  useEffect(() => {
    if (isPlaying && oscRef.current && gainNodeRef.current) {
      // Smoothly ramp to prevent clicking
      oscRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
      gainNodeRef.current.gain.setTargetAtTime(amplitude / 100, audioCtxRef.current.currentTime, 0.05);
    }
  }, [frequency, amplitude, isPlaying]);
  
  // Short decaying notes so the demos in steps 1 and 2 actually make sound
  const playNote = (freq, { type = "triangle", dur = 1.1, vol = 0.35 } = {}) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(ctx.destination);
      [[1, 1], [2, 0.35], [3, 0.15]].forEach(([mult, level]) => {
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.type = type;
        o.frequency.value = freq * mult;
        og.gain.value = level;
        o.connect(og);
        og.connect(g);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    } catch (e) { /* audio not available */ }
  };

  useEffect(() => {
    const pluck = step === 1 && vibrating;
    const hear = step === 2 && hearing;
    if (!pluck && !hear) return undefined;
    const notes = pluck ? [196, 247, 294, 247] : [330];
    let i = 0;
    const tick = () => {
      if (pluck) playNote(notes[i % notes.length]);
      else playNote(330, { type: "sine", dur: 0.9, vol: 0.28 });
      i += 1;
    };
    tick();
    const id = setInterval(tick, pluck ? 900 : 1500);
    return () => clearInterval(id);
  }, [step, vibrating, hearing]);

  // Quiz
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["sound"]) {
      saved["sound"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(75); // 50 learning + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["vibration", "shake", "no", "frequency", "loudness"];
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

  const renderWave = (freq, amp) => {
    const points = [];
    const width = 300;
    const height = 100;
    // Map freq 10-100 to wave cycles (1 to 5)
    const cycles = 1 + ((freq - 100) / 900) * 9;
    // Map amp 10-100 to pixel height (10 to 45)
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
          className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" 
        />
      </svg>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Sound Comes From Vibration</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              When an object vibrates (moves back and forth quickly), it creates sound!
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-lg border-2 border-slate-200">
              <button 
                onClick={() => setVibrating(!vibrating)}
                className="bg-purple-500 text-white font-bold px-8 py-3 rounded-xl mb-12 shadow-md hover:bg-purple-400"
              >
                {vibrating ? "Stop Plucking" : "Pluck String"}
              </button>
              
              <div className="relative w-full h-32 flex items-center justify-center">
                <div className="absolute left-4 text-4xl">🎸</div>
                
                {/* The String */}
                <div className="w-64 h-32 relative overflow-hidden flex items-center ml-8">
                  <motion.div 
                    animate={vibrating ? { y: [-9, 9] } : { y: 0 }}
                    transition={vibrating ? { repeat: Infinity, duration: 0.05, repeatType: "reverse" } : {}}
                    className="w-full h-1 bg-slate-800 rounded-full"
                  />
                  {vibrating && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, x: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2], x: [0, 50, 100] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute left-1/2 -translate-x-1/2 text-2xl"
                    >
                      🎵
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Sound Needs a Medium</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Sound travels by passing vibrations from one particle to the next. It needs a material (air, water, solid) to travel through.
            </p>
            <button
              onClick={() => setHearing(!hearing)}
              className="bg-purple-500 text-white font-bold px-8 py-3 rounded-xl mb-6 shadow-md hover:bg-purple-400"
            >
              {hearing ? "Stop Sound" : "🔊 Play Sound"}
            </button>
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-800 flex items-center justify-between h-48 relative overflow-hidden">
              <div className="text-6xl z-10 animate-pulse">🔊</div>
              
              <div className="flex-1 h-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex gap-2 p-4 flex-wrap content-center opacity-30">
                  {/* Air particles */}
                  {[...Array(60)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-300"></div>
                  ))}
                </div>
                
                {/* Sound wave rings moving */}
                <motion.div 
                  animate={{ x: [-20, 200], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 w-8 h-32 rounded-full border-r-4 border-white/50"
                />
                <motion.div 
                  animate={{ x: [-20, 200], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "linear" }}
                  className="absolute left-0 w-8 h-32 rounded-full border-r-4 border-white/50"
                />
              </div>
              
              <div className="text-6xl z-10">👂</div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">🔊 Sound Lab</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Listen and see how Frequency (Pitch) and Amplitude (Loudness) change the sound!
            </p>
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl border-4 border-slate-800 flex flex-col items-center shadow-xl">
              
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={isPlaying ? stopAudio : playAudio}
                  className={`flex items-center gap-2 font-black px-8 py-3 rounded-xl transition-all shadow-md ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-400 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  {isPlaying ? "STOP" : "PLAY SOUND"}
                </button>
              </div>

              <div className="w-full mb-6">
                <div className="flex justify-between text-purple-300 font-bold text-sm mb-2 uppercase tracking-wider">
                  <span>Low Frequency (Low Pitch)</span>
                  <span>High Frequency (High Pitch)</span>
                </div>
                <input type="range" min="100" max="1000" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>

              <div className="w-full mb-8">
                <div className="flex justify-between text-pink-300 font-bold text-sm mb-2 uppercase tracking-wider">
                  <span>Low Amplitude (Quiet)</span>
                  <span>High Amplitude (Loud)</span>
                </div>
                <input type="range" min="0" max="100" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full accent-pink-500" />
              </div>
              
              <div className="w-full h-40 bg-slate-950 rounded-2xl flex items-center justify-center border-2 border-slate-700 p-4">
                {renderWave(frequency, amplitude)}
              </div>
            </div>
          </div>
        );
      case 4: // Quiz
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What produces sound?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Light</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Gravity</button>
                  <button onClick={() => handleAnswer("vibration")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left">C. Vibration</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Think about the guitar string!</p>}
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does "vibrate" mean?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("shake")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left">A. Move back and forth quickly</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Fall to the ground</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Shine brightly</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">It's a rapid shaking motion.</p>}
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Can sound travel through an empty vacuum (like outer space)?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Yes, easily</button>
                  <button onClick={() => handleAnswer("no")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left">B. No, it needs a medium (like air or water)</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Sound needs particles to pass the vibrations!</p>}
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What determines the pitch (high/low) of a sound?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("frequency")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left">A. Frequency (how fast the waves are)</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Amplitude (how tall the waves are)</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Color</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Pitch comes from speed of vibration.</p>}
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What happens when amplitude increases?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Sound gets higher pitch</button>
                  <button onClick={() => handleAnswer("loudness")} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 font-bold text-purple-800 hover:bg-purple-100 text-left">B. Sound gets louder</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Sound stops</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Taller waves carry more energy!</p>}
              </div>
            )}
            <div className="mt-8 flex items-center justify-center gap-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-purple-500' : 'w-4 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Sound Complete!</h2>
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full ${i + 1 <= step ? 'bg-purple-500' : 'bg-slate-200'}`} />
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

        {step < 4 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="mt-12 bg-slate-800 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#334155] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 3 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
