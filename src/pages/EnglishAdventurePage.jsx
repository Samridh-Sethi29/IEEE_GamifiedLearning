import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Lock, Star, Play, CheckCircle2, XCircle, Award, Trophy } from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { ENGLISH_QUESTIONS } from "@/data/englishQuestions";
import PlayerAvatar from "@/features/player/components/PlayerAvatar";

// Components
import EnglishQuiz from "@/features/english/components/EnglishQuiz";
import EnglishMap from "@/features/english/components/EnglishMap";

export default function EnglishAdventurePage() {
  const { player, saveEnglishProgress, updateSkill, earnXP, markWorldCompleted } = usePlayer();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState("MAP"); // MAP, PREVIEW, QUIZ, COMPLETE
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  const [quizScore, setQuizScore] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizStars, setQuizStars] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);

  const startLevel = (lvl) => {
    setSelectedLevel(lvl);
    setGameState("PREVIEW");
  };

  const beginQuiz = () => {
    setGameState("QUIZ");
  };

  const handleQuizComplete = (stats) => {
    setQuizScore(stats.score);
    setQuizCorrect(stats.correct);
    setQuizStars(stats.stars);
    setQuizPoints(stats.points);
    setQuizStreak(stats.bestStreak);
    
    // Save progress
    saveEnglishProgress(selectedLevel, stats.score, stats.stars, stats.points, stats.correct, 10, stats.bestStreak);
    
    // Award general skills
    updateSkill("human", 5);
    earnXP(15);
    
    setGameState("COMPLETE");
  };

  const returnToMap = () => {
    setGameState("MAP");
    setSelectedLevel(null);
  };

  const exitEnglish = () => {
    markWorldCompleted("english");
    navigate("/world/school");
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-sky-100 to-green-100">
      <GameHUD objective="Master the English Language Adventure!" />
      
      {/* Back button */}
      {gameState === "MAP" && (
        <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
          <button 
            onClick={exitEnglish}
            className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-lg shadow-emerald-950/15 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back to School
          </button>
        </div>
      )}

      {/* Map View */}
      {gameState === "MAP" && (
        <EnglishMap 
          maxUnlocked={player.english?.maxUnlocked || 1} 
          levelsData={player.english?.levels || {}}
          onSelectLevel={startLevel}
          playerName={player.name}
          playerLevel={player.level}
        />
      )}

      {/* Level Preview Modal */}
      <AnimatePresence>
        {gameState === "PREVIEW" && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-indigo-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <button onClick={returnToMap} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors bg-slate-50 p-2 rounded-full">
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-200">
                  <Star className="w-10 h-10 fill-indigo-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">LEVEL {selectedLevel}</h2>
                <p className="text-indigo-500 font-bold mb-6 tracking-widest text-sm uppercase">English Challenge</p>
                
                <div className="bg-slate-50 p-5 rounded-2xl text-left border-2 border-slate-100 space-y-3 mb-8 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Questions</span>
                    <span className="font-black text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Best Score</span>
                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{player.english?.levels[selectedLevel]?.bestScore || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Stars</span>
                    <span className="font-bold text-yellow-500 flex gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                      {[1,2,3].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= (player.english?.levels[selectedLevel]?.stars || 0) ? 'fill-yellow-400 drop-shadow-sm' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={beginQuiz}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-4 md:py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform active:scale-95"
                >
                  <Play className="w-6 h-6 fill-white" /> START LEVEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Quiz View */}
      {gameState === "QUIZ" && (
        <EnglishQuiz 
          level={selectedLevel} 
          questions={ENGLISH_QUESTIONS.filter(q => q.level === selectedLevel)}
          onComplete={handleQuizComplete}
          onExit={returnToMap}
        />
      )}

      {/* Completion View */}
      <AnimatePresence>
        {gameState === "COMPLETE" && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center border-4 border-emerald-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
              
              <div className="relative mt-2">
                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 relative z-10 drop-shadow-xl" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">LEVEL COMPLETE!</h2>
              
              <div className="flex justify-center gap-3 mb-8 mt-4">
                {[1,2,3].map(s => (
                  <motion.div 
                    key={s}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: s * 0.15, type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Star className={`w-14 h-14 ${s <= quizStars ? 'fill-yellow-400 text-yellow-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'fill-slate-100 text-slate-200'}`} />
                  </motion.div>
                ))}
              </div>

              <div className="bg-slate-50 p-6 rounded-[1.5rem] mb-8 border-2 border-slate-100 shadow-inner">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Score</p>
                    <p className="text-3xl font-black text-slate-800">{quizScore}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Correct</p>
                    <p className="text-3xl font-black text-emerald-500">{quizCorrect}/10</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Points</p>
                    <p className="text-3xl font-black text-indigo-500">+{quizPoints}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Best Streak</p>
                    <p className="text-3xl font-black text-orange-500 flex items-center justify-center gap-1">🔥 {quizStreak}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={returnToMap}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-5 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
                >
                  CONTINUE JOURNEY
                </button>
                <button 
                  onClick={beginQuiz}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 py-4 rounded-2xl font-bold transition-all"
                >
                  REPLAY LEVEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
