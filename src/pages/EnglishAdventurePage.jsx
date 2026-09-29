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
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-indigo-100 relative"
            >
              <button onClick={returnToMap} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 fill-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">LEVEL {selectedLevel}</h2>
                <p className="text-indigo-600 font-bold mb-4">English Challenge</p>
                
                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Questions:</span>
                    <span className="font-bold text-slate-700">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Best Score:</span>
                    <span className="font-bold text-slate-700">{player.english?.levels[selectedLevel]?.bestScore || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Stars:</span>
                    <span className="font-bold text-yellow-500 flex gap-1">
                      {[1,2,3].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= (player.english?.levels[selectedLevel]?.stars || 0) ? 'fill-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={beginQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-white" /> START LEVEL
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
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-emerald-100"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-slate-800 mb-2">LEVEL COMPLETE!</h2>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3].map(s => (
                  <motion.div 
                    key={s}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: s * 0.2, type: "spring" }}
                  >
                    <Star className={`w-12 h-12 ${s <= quizStars ? 'fill-yellow-400 text-yellow-500 drop-shadow-md' : 'fill-slate-100 text-slate-200'}`} />
                  </motion.div>
                ))}
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Score</p>
                    <p className="text-2xl font-black text-slate-800">{quizScore}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Correct</p>
                    <p className="text-2xl font-black text-emerald-600">{quizCorrect}/10</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Points</p>
                    <p className="text-2xl font-black text-indigo-600">+{quizPoints}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Best Streak</p>
                    <p className="text-2xl font-black text-orange-500 flex items-center justify-center gap-1">🔥 {quizStreak}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={returnToMap}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                >
                  CONTINUE JOURNEY
                </button>
                <button 
                  onClick={beginQuiz}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all"
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
