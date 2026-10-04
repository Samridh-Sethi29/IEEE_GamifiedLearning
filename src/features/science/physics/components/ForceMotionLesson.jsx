import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Travel from "./Travel";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const TOTAL_STEPS = 9;

export default function ForceMotionLesson() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [step, setStep] = useState(1);
  
  // States for interactives
  const [boxPos, setBoxPos] = useState(0); // push/pull
  const [motionActive, setMotionActive] = useState(false); // motion
  const [raceActive, setRaceActive] = useState(false); // speed
  const [accelActive, setAccelActive] = useState(false); // acceleration
  const [accelSpeed, setAccelSpeed] = useState(0); 
  const [gravityActive, setGravityActive] = useState(false); // gravity
  const [frictionActive, setFrictionActive] = useState(0); // 0=none, 1=smooth, 2=rough
  const [forceLeft, setForceLeft] = useState(5);
  const [forceRight, setForceRight] = useState(5);
  
  // Quiz
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);

  useEffect(() => {
    if (step === 4 && accelActive) {
      // simulate acceleration
      setAccelSpeed(0);
      const times = [0, 1000, 2000, 3000];
      const speeds = [0, 2, 5, 8];
      times.forEach((t, i) => {
        setTimeout(() => setAccelSpeed(speeds[i]), t);
      });
      setTimeout(() => setAccelActive(false), 4000);
    }
  }, [step, accelActive]);

  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
    if (!saved["force"]) {
      saved["force"] = true;
      localStorage.setItem("physics_progress", JSON.stringify(saved));
      earnXP(50); // 25 for learning, 25 for quiz combined
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = [
      "push", // Q1: push
      "oppose", // Q2: friction
      "5-5", // Q3: balanced
      "pull", // Q4: gravity
      "velocity" // Q5: acceleration
    ];

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
            <h2 className="text-3xl font-black text-slate-800 mb-6">What is Force?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              A force is a push or pull that can change the motion or shape of an object.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-lg border-2 border-slate-200">
              <div className="flex justify-between items-center mb-8">
                <button 
                  onClick={() => setBoxPos(p => p - 40)}
                  className="bg-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-400 active:scale-95 transition-all shadow-md"
                >
                  ← PULL
                </button>
                <button 
                  onClick={() => setBoxPos(p => p + 40)}
                  className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-md"
                >
                  PUSH →
                </button>
              </div>
              <div className="relative w-full h-24 bg-slate-200 rounded-xl overflow-hidden border-b-4 border-slate-300">
                <motion.div 
                  animate={{ x: boxPos }}
                  className="absolute bottom-0 left-1/2 -ml-8 text-6xl"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  📦
                </motion.div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Motion</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              An object is in motion when its position changes over time.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200">
              <button 
                onClick={() => setMotionActive(!motionActive)}
                className="mb-8 bg-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-400 shadow-md"
              >
                {motionActive ? "Reset" : "Observe Motion"}
              </button>
              <div className="relative w-full h-24 bg-slate-200 rounded-xl overflow-hidden border-b-4 border-slate-300 flex items-end px-4">
                <Travel active={motionActive} duration={2} ease="linear" className="text-6xl z-10 inline-block scale-x-[-1]">
                  🚲
                </Travel>
                {motionActive && (
                  <motion.div 
                    initial={{ width: 0, opacity: 1 }}
                    animate={{ width: 'calc(100% - 60px)', opacity: 0 }}
                    transition={{ duration: 2.5 }}
                    className="absolute bottom-4 left-10 h-2 bg-blue-300 rounded-full z-0"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Speed</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Speed tells us how quickly an object moves over a distance.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200">
              <button 
                onClick={() => setRaceActive(!raceActive)}
                className="mb-8 bg-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-400 shadow-md"
              >
                {raceActive ? "Reset Race" : "Start Race"}
              </button>
              <div className="relative w-full h-40 bg-slate-200 rounded-xl overflow-hidden border-b-4 border-slate-300 flex flex-col justify-around px-4">
                <div className="w-full relative h-12">
                  <Travel active={raceActive} duration={5} ease="linear" className="absolute text-5xl scale-x-[-1]">
                    🐢
                  </Travel>
                </div>
                <div className="w-full border-t-2 border-dashed border-slate-300" />
                <div className="w-full relative h-12">
                  <Travel active={raceActive} duration={1.5} ease="linear" className="absolute text-5xl scale-x-[-1]">
                    🏎️
                  </Travel>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Acceleration</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Acceleration describes how quickly velocity (speed) changes.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200">
              <button 
                onClick={() => !accelActive && setAccelActive(true)}
                className={`mb-8 font-bold px-8 py-3 rounded-xl shadow-md ${accelActive ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
              >
                Accelerate Car
              </button>
              <div className="text-3xl font-black text-blue-600 mb-8 font-mono bg-white inline-block px-6 py-2 rounded-xl shadow-inner border border-slate-200">
                {accelSpeed} m/s
              </div>
              <div className="relative w-full h-24 bg-slate-700 rounded-xl overflow-hidden border-b-4 border-slate-900 flex items-center px-4">
                <div className="w-full border-t-4 border-dashed border-yellow-400 absolute left-0" />
                <Travel active={accelActive} keyframes={[0, 0.1, 0.3, 1]} times={[0, 0.33, 0.66, 1]} duration={3} ease="easeIn" className="text-6xl z-10 relative inline-block scale-x-[-1]">
                  🚗
                </Travel>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Gravity</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Gravity is a force that pulls objects toward Earth. It causes objects to accelerate downward.
            </p>
            <div className="bg-sky-100 p-8 rounded-3xl w-full max-w-sm border-2 border-sky-200 h-96 relative flex flex-col items-center">
              <button 
                onClick={() => setGravityActive(!gravityActive)}
                className="z-20 bg-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-400 shadow-md mb-4"
              >
                {gravityActive ? "Reset" : "Drop Apple"}
              </button>
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: gravityActive ? 220 : 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
                className="text-6xl z-10"
              >
                🍎
              </motion.div>
              <div className="absolute bottom-0 w-full h-16 bg-emerald-500 rounded-b-2xl flex items-center justify-center text-white font-black text-2xl tracking-widest border-t-8 border-emerald-600">
                EARTH
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Friction</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              Friction opposes motion between surfaces. Smooth surfaces have less friction than rough surfaces.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200">
              <div className="flex gap-4 justify-center mb-8">
                <button 
                  onClick={() => setFrictionActive(1)}
                  className="bg-sky-400 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-300 shadow-md"
                >
                  Push on ICE (Smooth)
                </button>
                <button 
                  onClick={() => setFrictionActive(2)}
                  className="bg-stone-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-400 shadow-md"
                >
                  Push on GRAVEL (Rough)
                </button>
              </div>
              <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-slate-300 flex flex-col">
                <div className="flex-1 bg-gradient-to-r from-sky-100 to-white flex items-end px-2 border-b-2 border-sky-300">
                  <Travel active={frictionActive === 1} duration={3} ease="easeOut" className="text-5xl inline-block scale-x-[-1]">
                    🛷
                  </Travel>
                </div>
                <div className="flex-1 bg-stone-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjOTk5Ii8+PC9zdmc+')] flex items-end px-2">
                  <Travel active={frictionActive === 2} fraction={0.3} duration={1} ease="easeOut" className="text-5xl inline-block scale-x-[-1]">
                    🛷
                  </Travel>
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        const netForce = forceRight - forceLeft;
        let direction = netForce === 0 ? "Balanced (No Change)" : netForce > 0 ? "Moving Right →" : "← Moving Left";
        
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Balanced & Unbalanced Forces</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl">
              When forces are equal (balanced), the object stays still. When they are unequal (unbalanced), the object moves.
            </p>
            <div className="bg-slate-100 p-8 rounded-3xl w-full max-w-2xl border-2 border-slate-200">
              <div className="flex justify-between items-center mb-12 relative">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-black text-2xl text-red-500">{forceLeft} N</span>
                  <input type="range" min="0" max="10" value={forceLeft} onChange={(e) => setForceLeft(Number(e.target.value))} className="w-24 accent-red-500" />
                </div>
                
                <div className="relative">
                  {forceLeft > 0 && (
                    <motion.div animate={{ width: forceLeft * 10 }} className="absolute right-full top-1/2 -translate-y-1/2 h-2 bg-red-500 origin-right rounded-l-full"></motion.div>
                  )}
                  <motion.div 
                    animate={{ x: netForce * 10 }}
                    className="text-6xl z-10 relative bg-white p-4 rounded-xl shadow-lg border border-slate-200"
                  >
                    📦
                  </motion.div>
                  {forceRight > 0 && (
                    <motion.div animate={{ width: forceRight * 10 }} className="absolute left-full top-1/2 -translate-y-1/2 h-2 bg-blue-500 origin-left rounded-r-full"></motion.div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="font-black text-2xl text-blue-500">{forceRight} N</span>
                  <input type="range" min="0" max="10" value={forceRight} onChange={(e) => setForceRight(Number(e.target.value))} className="w-24 accent-blue-500" />
                </div>
              </div>
              <div className={`font-black text-2xl ${netForce === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {direction}
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which of these is a push?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Pulling a drawer</button>
                  <button onClick={() => handleAnswer("push")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. Kicking a ball</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Picking up a bag</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite! Think about moving something away from you.</p>}
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does friction do?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">A. Helps objects float</button>
                  <button onClick={() => handleAnswer("oppose")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">B. Opposes motion between surfaces</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Creates light</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite! Friction makes things slow down or stop.</p>}
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which situation shows balanced forces?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("5-5")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. 5 N left and 5 N right</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. 2 N left and 7 N right</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. 0 N left and 5 N right</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite! Balanced forces are equal.</p>}
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does gravity do near Earth's surface?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("pull")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. Pulls objects toward Earth</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Pushes objects away</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Stops all motion</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite! Think about the falling apple.</p>}
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-slate-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does acceleration describe?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("velocity")} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 font-bold text-blue-800 hover:bg-blue-100 text-left">A. Change in velocity (speed)</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">B. Object color</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 text-left">C. Object size</button>
                </div>
                {qError && <p className="text-red-500 font-bold mt-4 animate-bounce">Not quite! Think about the car speeding up.</p>}
              </div>
            )}
            {/* Progress Indicator */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-12 bg-blue-500' : 'w-4 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        );
      case 9:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Force & Motion Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ⭐ +50 XP
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
            <div key={i} className={`w-2 h-2 md:w-8 md:h-2 rounded-full ${i + 1 <= step ? 'bg-blue-500' : 'bg-slate-200'}`} />
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

        {step < 8 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="mt-12 bg-slate-800 text-white font-black text-lg px-12 py-4 rounded-xl shadow-[0_4px_0_#334155] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all"
          >
            {step === 7 ? "Start Knowledge Check" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
