import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const TRACK_LENGTH = 100; // 100 meters

export default function SpeedRacerGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 = intro, 1 = game, 2 = complete
  const [acceleration, setAcceleration] = useState(5.5); // m/s^2
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const updatePhysics = (timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // in seconds
    lastTimeRef.current = timestamp;

    setTime(prev => {
      const newTime = prev + deltaTime;
      setSpeed(acceleration * newTime);
      
      setDistance(prevDist => {
        const newDist = 0.5 * acceleration * newTime * newTime;
        if (newDist >= TRACK_LENGTH) {
          setIsRunning(false);
          setStep(2);
          checkCompletion(newTime);
          return TRACK_LENGTH;
        }
        return newDist;
      });
      
      return newTime;
    });

    if (isRunning) {
      animationRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(updatePhysics);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning]);

  const startRace = () => {
    setSpeed(0);
    setDistance(0);
    setTime(0);
    setIsRunning(true);
  };

  const resetRace = () => {
    setSpeed(0);
    setDistance(0);
    setTime(0);
    setIsRunning(false);
    setStep(1);
  };

  const checkCompletion = (finalTime) => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["force-game"]) {
      saved["force-game"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(100);
    }
  };

  if (step === 0) {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl"
        >
          <div className="text-6xl mb-6">🚗</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">SPEED RACER</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Control acceleration and discover how it changes motion.</p>
          
          <div className="bg-slate-100 p-4 rounded-xl text-slate-700 font-bold text-sm mb-8 text-left">
            🎯 <span className="text-blue-600 uppercase">Challenge:</span> Reach the finish line in approximately <span className="text-xl text-slate-800">6 seconds</span>!
          </div>

          <button 
            onClick={() => setStep(1)}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all"
          >
            ENTER GARAGE
          </button>
        </motion.div>
      </div>
    );
  }

  // Calculate visual position (0 to 100%)
  const visualPosition = Math.min((distance / TRACK_LENGTH) * 100, 100);

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/physics")}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-[14px] font-bold text-slate-200 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Physics
        </button>
      </div>

      <div className="flex-1 flex flex-col pt-20 px-4 md:px-8 max-w-6xl w-full mx-auto pb-6 relative z-10">
        
        {/* Live Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Time</div>
            <div className="text-2xl font-mono text-white font-black">{time.toFixed(1)} s</div>
          </div>
          <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Distance</div>
            <div className="text-2xl font-mono text-emerald-400 font-black">{distance.toFixed(1)} m</div>
          </div>
          <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Speed</div>
            <div className="text-2xl font-mono text-blue-400 font-black">{speed.toFixed(1)} m/s</div>
          </div>
          <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Acceleration</div>
            <div className="text-2xl font-mono text-amber-400 font-black">{acceleration.toFixed(1)} m/s²</div>
          </div>
        </div>

        {/* The Track */}
        <div className="relative w-full h-48 bg-slate-800 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl mb-12">
          
          {/* Background Scenery */}
          <div className="absolute top-0 w-full h-24 bg-sky-900/30 flex items-end overflow-hidden">
            <div className="w-full border-b border-sky-800/50"></div>
          </div>

          {/* Road */}
          <div className="absolute bottom-0 w-full h-24 bg-stone-900 border-t border-stone-700 flex flex-col justify-center">
            {/* Dashed Line */}
            <div className="w-full border-t-4 border-dashed border-yellow-500 opacity-70" />
          </div>

          {/* Start / Finish Lines */}
          <div className="absolute top-0 left-0 w-8 h-full bg-slate-900/50 flex flex-col items-center justify-center font-bold text-slate-500 [writing-mode:vertical-lr] tracking-widest text-sm">START</div>
          <div className="absolute top-0 right-0 w-12 h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] opacity-90 border-l border-white/20"></div>

          {/* The Car */}
          <div 
            className="absolute bottom-4 z-20 text-6xl drop-shadow-2xl flex items-center"
            style={{ left: `calc(${visualPosition}% - ${visualPosition === 100 ? 60 : 0}px)`, transition: isRunning ? 'none' : 'left 0.5s ease-out' }}
          >
            {speed > 10 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-full w-16 h-2 bg-gradient-to-r from-transparent to-white/50 blur-sm rounded-full -mr-4" />}
            <div className="scale-x-[-1]">🚗</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-2xl mx-auto w-full text-center">
          <div className="mb-8">
            <h3 className="text-slate-500 font-black uppercase tracking-wider mb-4">Set Acceleration</h3>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="0.1" 
              value={acceleration}
              onChange={(e) => setAcceleration(Number(e.target.value))}
              disabled={isRunning || step === 2}
              className="w-full accent-blue-500 h-3 bg-slate-200 rounded-full appearance-none outline-none disabled:opacity-50"
            />
            <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
              <span>LOW (1 m/s²)</span>
              <span>HIGH (10 m/s²)</span>
            </div>
          </div>

          {!isRunning && step === 1 && (
            <button 
              onClick={startRace}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-400 text-white font-black text-xl px-12 py-5 rounded-2xl shadow-[0_6px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Play fill="currentColor" /> GO
            </button>
          )}

          {isRunning && (
            <div className="text-xl font-black text-blue-500 animate-pulse">
              RACING...
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border-4 border-slate-200"
            >
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase">Race Finished!</h2>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Your Time</div>
                <div className={`text-5xl font-mono font-black ${Math.abs(time - 6) <= 0.5 ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {time.toFixed(2)}s
                </div>
                
                <div className="mt-4 text-slate-600 font-bold text-sm">
                  {Math.abs(time - 6) <= 0.5 
                    ? "🎉 Perfect! You matched the target time!" 
                    : time < 5.5 
                      ? "Too fast! Try a lower acceleration to hit ~6s." 
                      : "Too slow! Try a higher acceleration to hit ~6s."}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={resetRace}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-5 h-5"/> Try Again
                </button>
                <button 
                  onClick={() => navigate("/world/school/science/physics")}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                >
                  Return to Physics
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
