import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

export default function SplashPage() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (player.id === "local" && player.day === 1 && player.xp === 0 && !player.flags.onboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/world");
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, player]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 overflow-hidden text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-2xl rounded-full bg-emerald-500/40"></div>
          <svg viewBox="0 0 100 100" className="w-32 h-32 relative z-10 drop-shadow-xl" aria-hidden="true">
            <circle cx="50" cy="50" r="40" fill="#10b981" />
            <path d="M 30 50 L 45 65 L 75 35" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <motion.h1 
          className="text-5xl font-black tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-emerald-400">Skill</span>Verse
        </motion.h1>
        
        <motion.p 
          className="mt-3 text-slate-400 font-medium"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Learn. Live. Grow.
        </motion.p>
      </motion.div>
    </div>
  );
}
