import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { buttonVariants } from '@/components/core/button';
import { CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import VirtualKeyboard from './VirtualKeyboard';

const CHALLENGE_WORDS = [
  'CAT', 'DOG', 'BOOK', 'TREE', 'GAME', 'HOME', 'PLAY', 'FISH', 'BALL', 'SCHOOL'
];

export default function TypingChallengeLevel2({ onBack, onCompleteLevel }) {
  // Randomize words once on mount
  const [targets] = useState(() => [...CHALLENGE_WORDS].sort(() => 0.5 - Math.random()));
  
  const [targetIndex, setTargetIndex] = useState(0);
  const [typedSequence, setTypedSequence] = useState('');
  
  const [metrics, setMetrics] = useState({ totalAttempts: 0, correctAttempts: 0, mistakes: 0 });
  const [feedback, setFeedback] = useState(null); 
  const [activeKey, setActiveKey] = useState(null);
  
  const { player, updatePlayer, earnXP } = usePlayer();

  const isCompleted = targetIndex >= targets.length;
  const progressPercent = isCompleted ? 100 : Math.round((targetIndex / targets.length) * 100);
  
  const currentTarget = targets[targetIndex];
  const expectedChar = currentTarget ? currentTarget[typedSequence.length] : null;

  const handleKeyPress = useCallback((key) => {
    if (isCompleted || feedback) return; 
    
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    setMetrics(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    if (key === expectedChar) {
      setMetrics(prev => ({ ...prev, correctAttempts: prev.correctAttempts + 1 }));
      setFeedback('success');
      
      const newSequence = typedSequence + key;
      setTypedSequence(newSequence);

      if (newSequence.length === currentTarget.length) {
        setTimeout(() => {
          setFeedback(null);
          setTypedSequence('');
          setTargetIndex(i => i + 1);
        }, 500);
      } else {
        setTimeout(() => setFeedback(null), 250);
      }
    } else {
      setMetrics(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      setFeedback('error');
      setTimeout(() => setFeedback(null), 800);
    }
  }, [isCompleted, feedback, expectedChar, typedSequence, currentTarget]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      let key = e.key.toUpperCase();
      if (key === ' ') key = 'SPACE';
      if (e.code === 'Enter') key = 'ENTER';
      if (e.code === 'Backspace') key = 'BACKSPACE';
      
      if (/^[A-Z]$/.test(key) || ['SPACE', 'ENTER', 'BACKSPACE'].includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const accuracy = Math.round((metrics.correctAttempts / Math.max(1, metrics.totalAttempts)) * 100);
  const passed = accuracy >= 80;

  useEffect(() => {
    if (isCompleted && passed) {
      const progress = player.computerProgress || {
        typing: { unlocked: true, currentLevel: 1, lesson1Completed: true, lesson2Completed: true, completedLevels: [1] },
        blockCoding: { unlocked: false },
        pythonDebugging: { unlocked: false },
        finalChallenge: { unlocked: false }
      };

      if (!progress.typing.completedLevels.includes(2)) {
        earnXP(30);
        updatePlayer({
          computerProgress: {
            ...progress,
            typing: {
              ...progress.typing,
              completedLevels: [...(progress.typing.completedLevels || []), 2]
            }
          }
        });
      }
    }
  }, [isCompleted, passed, player, updatePlayer, earnXP]);

  if (isCompleted) {
    return (
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-5 pt-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-[32px] border-4 border-white/90 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
        >
          {passed ? (
            <>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-xl shadow-amber-500/30">
                <Trophy className="h-12 w-12" />
              </div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800">🎉 GREAT JOB!</h2>
              
              <div className="mt-8 overflow-hidden rounded-[24px] bg-slate-50 border border-slate-100 shadow-inner">
                <div className="bg-emerald-100/50 p-4">
                  <div className="text-3xl font-extrabold text-emerald-600">{accuracy}% Accuracy</div>
                </div>
                <div className="p-4 text-[15px] font-bold text-slate-500 flex justify-center gap-4">
                  <span>{targetIndex} / {targets.length} Words</span>
                  <span>{metrics.mistakes} Mistakes</span>
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-6 py-2.5 font-bold text-amber-700 shadow-sm border border-amber-200">
                <Sparkles className="h-5 w-5" /> +30 XP
              </div>
              
              <div className="mt-6 text-[15px] font-extrabold tracking-wide text-blue-600">LEVEL 3 UNLOCKED 🔓</div>

              <button onClick={onCompleteLevel} className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}>
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-100 text-slate-400">
                <XCircle className="h-12 w-12" />
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-slate-800">Good try!</h2>
              <p className="mt-3 font-medium text-slate-600">Practice a little more and try again.</p>
              
              <div className="mt-8 overflow-hidden rounded-[24px] bg-slate-50 border border-slate-100 shadow-inner">
                <div className="bg-rose-50 p-4">
                  <div className="text-3xl font-extrabold text-rose-500">{accuracy}% Accuracy</div>
                </div>
                <div className="p-4 text-[15px] font-bold text-slate-500 flex justify-center gap-4">
                  <span>{targetIndex} / {targets.length} Words</span>
                  <span>{metrics.mistakes} Mistakes</span>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={onBack} className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'flex-1 rounded-2xl h-14 text-[16px]' })}>
                  Back to Typing
                </button>
                <button onClick={() => {
                  setTargetIndex(0); setTypedSequence(''); setMetrics({ totalAttempts: 0, correctAttempts: 0, mistakes: 0 });
                }} className={buttonVariants({ variant: 'default', size: 'lg', className: 'flex-1 rounded-2xl h-14 text-[16px] shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}>
                  Try Again
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col pb-6 pt-24">
      {/* Main Lesson Area */}
      <div className="flex-1 rounded-[32px] border-4 border-white bg-[#f4f9f9]/90 p-4 shadow-xl backdrop-blur-md sm:p-8 flex flex-col items-center justify-between">
        
        {/* Top Section: Instruction & Feedback */}
        <div className="w-full flex flex-col items-center">
          <div className="mb-4 flex flex-col items-center text-center">
            <h2 className="text-xl font-black text-slate-700 sm:text-3xl flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-500" />
              Type the word
            </h2>
          </div>

          <div className="h-12 w-full flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              {feedback === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-lg font-black shadow-sm border-2 bg-rose-100 text-rose-700 border-rose-200"
                >
                  <XCircle className="h-6 w-6" />
                  Try again!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Center Section: Large Target Character */}
        <div className="flex w-full flex-col items-center justify-center mb-8">
          <div className="flex gap-4 sm:gap-6 rounded-[32px] bg-white p-6 sm:p-12 shadow-lg border-4 border-slate-100">
            {currentTarget.split('').map((char, idx) => {
              const isCompletedChar = idx < typedSequence.length;
              const isCurrent = idx === typedSequence.length;
              return (
                <div 
                  key={idx} 
                  className={`flex h-24 w-20 sm:h-32 sm:w-28 items-center justify-center rounded-[24px] border-[6px] text-5xl sm:text-7xl font-black transition-all ${
                    isCompletedChar ? 'border-emerald-100 bg-emerald-50 text-emerald-400 opacity-50' : 
                    isCurrent ? 'border-slate-300 bg-white text-slate-700 shadow-[0_10px_30px_rgba(148,163,184,0.3)] scale-110 z-10' : 'border-slate-100 bg-slate-50 text-slate-300'
                  }`}
                >
                  {isCompletedChar ? char : isCurrent ? char : '●'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Keyboard */}
        <div className="w-full">
          <VirtualKeyboard 
            expectedChar={expectedChar} 
            activeKey={activeKey} 
            feedback={feedback} 
            onKeyPress={handleKeyPress} 
            highlightExpected={false} 
          />
        </div>
      </div>

      {/* Stats/Progress Area (At the bottom) */}
      <div className="mt-6 px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm border border-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Accuracy</span>
              <span className="text-[15px] font-black text-emerald-600">{metrics.totalAttempts > 0 ? Math.round((metrics.correctAttempts / metrics.totalAttempts) * 100) : 100}%</span>
            </div>
            <div className="h-8 w-[2px] bg-slate-200/50" />
            <div className="flex flex-col">
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Mistakes</span>
              <span className="text-[15px] font-black text-rose-500">{metrics.mistakes}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Words Completed</span>
            <span className="text-[15px] font-black text-blue-600">{targetIndex} / {targets.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
