import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updatePlayer } = usePlayer();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interest, setInterest] = useState("");

  const handleComplete = (e) => {
    e.preventDefault();
    updatePlayer({
      name: name || "Explorer",
      flags: { onboardingComplete: true, age: parseInt(age) || 12, interest }
    });
    navigate("/world");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 p-4">
      <motion.div 
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">Welcome to SkillVerse</h2>
        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">What's your name?</label>
            <input 
              type="text" 
              required
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium outline-none focus:border-emerald-500 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">How old are you?</label>
            <input 
              type="number" 
              required
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium outline-none focus:border-emerald-500 transition-colors"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">What interests you most?</label>
            <select 
              required
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium outline-none focus:border-emerald-500 transition-colors bg-white"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option value="" disabled>Select an interest...</option>
              <option value="technology">Technology & Coding</option>
              <option value="business">Business & Money</option>
              <option value="science">Science & Discovery</option>
              <option value="farming">Nature & Farming</option>
              <option value="art">Art & Creativity</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 mt-4"
          >
            Start My Journey
          </button>
        </form>
      </motion.div>
    </div>
  );
}
