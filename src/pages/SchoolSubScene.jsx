import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Users, MessageCircle, Code, Terminal, CheckCircle2 } from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import EnglishAdventurePage from "@/pages/EnglishAdventurePage";

export default function SchoolSubScene({ subId }) {
  const { player, updatePlayer, updateSkill, earnXP, markWorldCompleted } = usePlayer();
  const navigate = useNavigate();

  // Communication & Teamwork Scenario
  const [commStep, setCommStep] = useState(0);
  
  // Digital Lab Scenario
  const [codeStep, setCodeStep] = useState(0);
  
  const finishSchool = () => {
    markWorldCompleted("school");
    navigate("/world/school");
  };

  if (subId === "english") {
    return <EnglishAdventurePage />;
  }

  if (subId === "computer") {
    return (
      <div className="fixed inset-0 bg-slate-900 text-slate-300 p-6 overflow-y-auto">
        <GameHUD objective="Debug the system." />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center pt-16">
          <AnimatePresence mode="wait">
            {codeStep === 0 && (
              <motion.div key="code0" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
                <div className="w-16 h-16 bg-blue-900/50 text-blue-400 rounded-2xl flex items-center justify-center mb-6"><Terminal className="w-8 h-8" /></div>
                <h1 className="text-3xl font-black text-white mb-2">Python Debugging</h1>
                <p className="text-slate-400 mb-6">The farm's automatic sprinkler code has a bug. It never waters the plants! Can you spot the issue?</p>
                
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-sm mb-8 text-emerald-400 overflow-x-auto border border-slate-800">
                  <pre>{`def water_plants(soil_moisture):
    if soil_moisture > 50:
        print("Watering plants!")
    else:
        print("Soil is fine.")`}</pre>
                </div>

                <div className="space-y-4">
                  <button onClick={() => { updateSkill("digital", 5); earnXP(15); setCodeStep(1); }} className="w-full text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 p-4 rounded-xl font-medium text-white transition-colors">
                    The condition is wrong. It should be `if soil_moisture &lt; 50:`
                  </button>
                  <button onClick={() => { setCodeStep(2); }} className="w-full text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 p-4 rounded-xl font-medium text-white transition-colors">
                    It's missing a semicolon at the end of the lines.
                  </button>
                  <button onClick={() => { setCodeStep(2); }} className="w-full text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 p-4 rounded-xl font-medium text-white transition-colors">
                    The function needs to return a string.
                  </button>
                </div>
              </motion.div>
            )}

            {codeStep === 1 && (
              <motion.div key="code1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-emerald-900/50 rounded-3xl p-8 shadow-2xl border border-emerald-500 text-center">
                <Code className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Bug Fixed!</h2>
                <p className="text-emerald-200 mb-8">You corrected the logic. Plants need water when moisture is LOW, not high. You gained Digital XP.</p>
                <button onClick={finishSchool} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full">Exit Terminal</button>
              </motion.div>
            )}

            {codeStep === 2 && (
              <motion.div key="code2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-rose-900/50 rounded-3xl p-8 shadow-2xl border border-rose-500 text-center">
                <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Syntax Error</h2>
                <p className="text-rose-200 mb-8">That wasn't the bug. Try to think about the logic of when a plant needs water.</p>
                <button onClick={() => setCodeStep(0)} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full">Try Again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback for other rooms
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Class in Session</h2>
      <p className="mb-6 text-slate-600">The teacher is currently busy. Try English or Computer class.</p>
      <Link to="/world/school" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Go Back</Link>
    </div>
  );
}
