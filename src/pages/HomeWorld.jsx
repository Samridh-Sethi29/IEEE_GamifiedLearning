import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Droplet, Wrench, XCircle } from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";

export default function HomeWorld() {
  const { player, updatePlayer, updateSkill, earnXP, spendCoins, markWorldCompleted } = usePlayer();
  const navigate = useNavigate();
  const [step, setStep] = useState(player.completedToday?.includes("home") ? "completed" : "scenario");

  const handleRepair = () => {
    if (player.coins >= 10) {
      spendCoins(10);
      updatePlayer({ water: player.water + 20 });
      updateSkill("life", 5);
      earnXP(10);
      setStep("repaired");
    } else {
      alert("Not enough coins to repair! You must ignore it for now.");
    }
  };

  const handleIgnore = () => {
    updatePlayer({ water: Math.max(0, player.water - 20) });
    setStep("ignored");
  };

  const finish = () => {
    markWorldCompleted("home");
    navigate("/world");
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 p-6">
      <GameHUD objective="A situation has occurred at home." />
      
      <div className="flex h-full items-center justify-center pt-16">
        <AnimatePresence mode="wait">
          {step === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">You have already completed Home tasks today.</h2>
              <Link to="/world" className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold inline-block">Return to Map</Link>
            </motion.div>
          )}

          {step === "scenario" && (
            <motion.div key="scenario" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Droplet className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Water Leak!</h1>
              <p className="text-slate-600 mb-8 text-lg">You hear a dripping sound. A pipe in the kitchen is leaking water. What do you want to do?</p>
              
              <div className="space-y-4">
                <button onClick={handleRepair} className="w-full text-left bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 p-4 rounded-2xl transition-colors group flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-800 text-lg flex items-center gap-2"><Wrench className="w-5 h-5"/> Repair it now</div>
                    <div className="text-sm text-emerald-600 mt-1">Cost: 10 Coins</div>
                  </div>
                  <div className="text-right text-sm font-medium text-emerald-700">
                    +20L Water Saved<br/>+5 Life XP
                  </div>
                </button>
                
                <button onClick={handleIgnore} className="w-full text-left bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 p-4 rounded-2xl transition-colors group flex items-center justify-between">
                  <div>
                    <div className="font-bold text-rose-800 text-lg flex items-center gap-2"><XCircle className="w-5 h-5"/> Ignore it</div>
                    <div className="text-sm text-rose-600 mt-1">Cost: Free</div>
                  </div>
                  <div className="text-right text-sm font-medium text-rose-700">
                    -20L Water Lost<br/>No XP
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === "repaired" && (
            <motion.div key="repaired" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-emerald-50 rounded-3xl p-8 shadow-2xl border-4 border-emerald-200 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Great Job!</h2>
              <p className="text-emerald-700 mb-8">You called a plumber and fixed the leak. You spent 10 coins, but saved 20L of water for the farm tomorrow! Your Life skill improved.</p>
              <button onClick={finish} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold w-full transition-colors flex justify-center items-center gap-2">
                <ArrowLeft className="w-5 h-5"/> Return to Map
              </button>
            </motion.div>
          )}

          {step === "ignored" && (
            <motion.div key="ignored" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-rose-50 rounded-3xl p-8 shadow-2xl border-4 border-rose-200 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">💧</div>
              <h2 className="text-2xl font-bold text-rose-900 mb-4">Water Wasted</h2>
              <p className="text-rose-700 mb-8">You ignored the leak. It kept dripping all day. You lost 20L of water, which means the farm will have less water available tomorrow.</p>
              <button onClick={finish} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold w-full transition-colors flex justify-center items-center gap-2">
                <ArrowLeft className="w-5 h-5"/> Return to Map
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
