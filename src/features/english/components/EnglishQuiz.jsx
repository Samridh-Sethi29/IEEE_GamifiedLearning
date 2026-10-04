import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, XCircle, ChevronRight, Flame, Trophy, Star, Sparkles } from "lucide-react";

export default function EnglishQuiz({ level, questions, onComplete, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const question = questions[currentIdx];

  const handleSelect = (idx) => {
    if (feedback !== null) return; // Prevent multiple clicks
    setSelectedAnswer(idx);
    
    const isCorrect = idx === question.correctAnswer;
    
    if (isCorrect) {
      setFeedback("correct");
      setCorrectCount(prev => prev + 1);
      setTotalPoints(prev => prev + question.points);
      
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setFeedback("incorrect");
      setCurrentStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    } else {
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      let stars = 1;
      if (scorePercentage >= 80) stars = 3;
      else if (scorePercentage >= 50) stars = 2;
      
      onComplete({
        correct: correctCount,
        score: scorePercentage,
        points: totalPoints,
        stars: stars,
        bestStreak: bestStreak
      });
    }
  };

  if (!question) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-indigo-900 z-50 text-white">
        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available!</h2>
          <button onClick={onExit} className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/50">Exit</button>
        </div>
      </div>
    );
  }

  const progressPct = ((currentIdx) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 z-50 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Background ambient decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[100px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-fuchsia-500/20 rounded-full blur-[120px]" />
        
        {/* Floating stars */}
        {Array.from({length: 10}).map((_, i) => (
          <motion.div
            key={`bg-star-${i}`}
            initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth, opacity: 0.1 + Math.random() * 0.3 }}
            animate={{ y: [null, Math.random() * window.innerHeight], opacity: [null, 0.1 + Math.random() * 0.5, null] }}
            transition={{ duration: 10 + Math.random() * 20, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute"
          >
            <Sparkles className="text-white/30" size={10 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl p-4 md:p-6 z-10 flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <button onClick={onExit} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center flex-1">
            <h2 className="text-2xl font-black text-white drop-shadow-md tracking-wide">LEVEL {level}</h2>
            <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest">{question.domain}</p>
          </div>
          
          <div className="flex items-center gap-2 text-white font-black bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 rounded-xl shadow-lg border border-orange-400">
            <Flame className={`w-6 h-6 ${currentStreak >= 3 ? 'animate-pulse text-yellow-200' : 'text-orange-100'}`} />
            <span className="text-xl">{currentStreak}</span>
          </div>
        </div>

        {/* Thick Playful Progress Bar */}
        <div className="w-full bg-white/10 backdrop-blur-sm h-6 rounded-full overflow-hidden border border-white/20 p-1 shadow-inner relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full relative overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          >
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDIwTDIwIDBIMTBMMCAxMFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPgo8L3N2Zz4=')] opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl px-4 flex-1 flex flex-col justify-center relative z-10 -mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full"
          >
            {/* Question Card */}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border-4 border-indigo-100 mb-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 text-sm font-black px-4 py-2 rounded-full mb-6 uppercase tracking-widest border-2 border-indigo-200 shadow-sm">
                {question.type.replace(/_/g, ' ')}
              </div>
              
              <h3 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
                {question.question}
              </h3>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {question.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === question.correctAnswer;
                
                let btnStateClass = "bg-white border-b-[8px] border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-1";
                let textStateClass = "text-slate-700";
                let icon = null;
                
                if (feedback) {
                  if (isCorrect) {
                    btnStateClass = "bg-emerald-400 border-b-[8px] border-emerald-600 text-white translate-y-1 border-b-[0px] shadow-[0_0_30px_rgba(52,211,153,0.6)]";
                    textStateClass = "text-white";
                    icon = <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />;
                  } else if (isSelected && !isCorrect) {
                    btnStateClass = "bg-rose-500 border-b-[8px] border-rose-700 text-white translate-y-1 border-b-[0px]";
                    textStateClass = "text-white";
                    icon = <XCircle className="w-8 h-8 text-white drop-shadow-md" />;
                  } else {
                    btnStateClass = "bg-slate-200 border-b-[8px] border-slate-300 text-slate-400 opacity-50";
                    textStateClass = "text-slate-400";
                  }
                } else if (isSelected) {
                   btnStateClass = "bg-indigo-500 border-b-[8px] border-indigo-700 text-white translate-y-1 border-b-[0px]";
                   textStateClass = "text-white";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={feedback !== null}
                    className={`p-6 md:p-8 rounded-3xl font-black text-xl md:text-2xl text-left transition-all duration-200 flex justify-between items-center ${btnStateClass}`}
                    style={feedback && (isCorrect || (isSelected && !isCorrect)) ? { transform: 'translateY(8px)', borderBottomWidth: '0px', marginTop: '8px' } : {}}
                  >
                    <span className={textStateClass}>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback Overlay / Bottom Sheet */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-0 left-0 right-0 p-6 md:p-10 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] z-50 rounded-t-[3rem] border-t-8
              ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'}
            `}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-inner">
                  {feedback === 'correct' ? <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} /> : <XCircle className="w-12 h-12 text-white" strokeWidth={3} />}
                </div>
                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-white drop-shadow-md mb-2">
                    {feedback === 'correct' ? 'Brilliant!' : 'Not Quite!'}
                  </h4>
                  <p className="text-lg md:text-xl font-bold text-white/90 drop-shadow-sm max-w-xl leading-snug">
                    {question.explanation}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className={`flex-shrink-0 px-10 py-5 rounded-2xl font-black text-2xl transition-transform active:scale-95 flex items-center gap-3 shadow-2xl
                  ${feedback === 'correct' ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-white text-rose-600 hover:bg-rose-50'}
                `}
              >
                CONTINUE <ChevronRight className="w-8 h-8" strokeWidth={3} />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
