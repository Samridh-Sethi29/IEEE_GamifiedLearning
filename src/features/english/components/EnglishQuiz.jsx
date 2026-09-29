import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, XCircle, ChevronRight, Flame } from "lucide-react";

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
      // Quiz finished
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

  // Prevent crashing if no questions
  if (!question) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-100 z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-xl font-bold mb-4">No Questions Available!</h2>
          <button onClick={onExit} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Exit</button>
        </div>
      </div>
    );
  }

  const progressPct = ((currentIdx) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-start overflow-y-auto">
      
      {/* Quiz Header */}
      <div className="w-full max-w-3xl bg-white shadow-sm p-4 sticky top-0 z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-800">LEVEL {level}</h2>
            <p className="text-sm font-bold text-indigo-500">{question.domain}</p>
          </div>
          
          <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-3 py-1.5 rounded-full">
            <Flame className={`w-5 h-5 ${currentStreak >= 3 ? 'animate-pulse' : ''}`} />
            {currentStreak}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right text-xs font-bold text-slate-400">
          Question {currentIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Main Question Area */}
      <div className="w-full max-w-3xl p-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full"
          >
            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 mb-8 text-center">
              <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                {question.type.replace(/_/g, ' ')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                {question.question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === question.correctAnswer;
                
                let btnClass = "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
                
                if (feedback) {
                  if (isCorrect) {
                    btnClass = "bg-emerald-50 border-2 border-emerald-500 text-emerald-800 shadow-lg shadow-emerald-500/20";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "bg-rose-50 border-2 border-rose-500 text-rose-800";
                  } else {
                    btnClass = "bg-white border-2 border-slate-100 text-slate-400 opacity-50"; // muted
                  }
                } else if (isSelected) {
                   btnClass = "bg-indigo-50 border-2 border-indigo-500 text-indigo-800";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={feedback !== null}
                    className={`p-6 rounded-2xl text-lg font-bold text-left transition-all ${btnClass} flex justify-between items-center`}
                  >
                    <span>{opt}</span>
                    {feedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {feedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
                  </button>
                );
              })}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Feedback Area */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className={`fixed bottom-0 left-0 right-0 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20
              ${feedback === 'correct' ? 'bg-emerald-100' : 'bg-rose-100'}
            `}
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${feedback === 'correct' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                  {feedback === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h4 className={`text-xl font-black ${feedback === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {feedback === 'correct' ? 'Excellent!' : 'Not Quite!'}
                  </h4>
                  <p className={`font-medium ${feedback === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {question.explanation}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className={`flex-shrink-0 px-8 py-4 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2
                  ${feedback === 'correct' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'}
                `}
              >
                CONTINUE <ChevronRight className="w-6 h-6" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
