import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { buttonVariants } from '@/components/core/button';
import { CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import VirtualKeyboard from './VirtualKeyboard';

const CHALLENGE_ROUNDS = [
  {
    title: 'Round 1 — Key Finder',
    type: 'key',
    targets: ['A', 'S', 'D', 'F', 'J', 'K', 'L']
  },
  {
    title: 'Round 2 — Short Sequences',
    type: 'sequence',
    targets: ['AS', 'FD', 'JK', 'LA', 'SAF']
  },
  {
    title: 'Round 3 — Simple Words',
    type: 'word',
    targets: ['CAT', 'DOG', 'SUN', 'MAP', 'FAN']
  }
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'BACKSPACE'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['SPACE']
];

export default function TypingChallenge({ onBack, onCompleteLevel }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [typedSequence, setTypedSequence] = useState('');
  
  const [metrics, setMetrics] = useState({ totalAttempts: 0, correctAttempts: 0, mistakes: 0 });
  const [feedback, setFeedback] = useState(null); // 'success' | 'error' | null
  const [activeKey, setActiveKey] = useState(null);
  
  const { player, updatePlayer, earnXP } = usePlayer();

  const isCompleted = roundIndex >= CHALLENGE_ROUNDS.length;
  const currentRound = CHALLENGE_ROUNDS[roundIndex];
  
  // Progress calculations
  const totalRounds = CHALLENGE_ROUNDS.length;
  const roundProgress = isCompleted ? 100 : Math.round(((targetIndex) / currentRound.targets.length) * 100);
  
  const currentTarget = currentRound?.targets[targetIndex];
  const expectedChar = currentTarget ? currentTarget[typedSequence.length] : null;

  const handleKeyPress = useCallback((key) => {
    if (isCompleted || feedback) return; // Prevent double pressing while animating
    
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    setMetrics(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    if (key === expectedChar) {
      setMetrics(prev => ({ ...prev, correctAttempts: prev.correctAttempts + 1 }));
      setFeedback('success');
      
      const newSequence = typedSequence + key;
      setTypedSequence(newSequence);

      if (newSequence.length === currentTarget.length) {
        // Target complete
        setTimeout(() => {
          setFeedback(null);
          setTypedSequence('');
          
          if (targetIndex + 1 < currentRound.targets.length) {
            setTargetIndex(i => i + 1);
          } else {
            // Round complete
            setTargetIndex(0);
            setRoundIndex(i => i + 1);
          }
        }, 600);
      } else {
        setTimeout(() => setFeedback(null), 300);
      }
    } else {
      setMetrics(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  }, [isCompleted, feedback, expectedChar, typedSequence, currentTarget, targetIndex, currentRound]);

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
        typing: { unlocked: true, currentLevel: 1, lesson1Completed: true, completedLevels: [] },
        blockCoding: { unlocked: false },
        pythonDebugging: { unlocked: false },
        finalChallenge: { unlocked: false }
      };

      if (!progress.typing.completedLevels.includes(1)) {
        // Award XP ONLY ONCE
        earnXP(20);
        updatePlayer({
          computerProgress: {
            ...progress,
            typing: {
              ...progress.typing,
              currentLevel: 2,
              completedLevels: [...(progress.typing.completedLevels || []), 1]
            }
          }
        });
      }
    }
  }, [isCompleted, passed, player, updatePlayer, earnXP]);

  if (isCompleted) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-5">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-3xl border-4 border-white/90 bg-white/95 p-8 text-center shadow-2xl shadow-slate-900/25"
        >
          {passed ? (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-slate-800">Challenge Complete!</h2>
              <p className="mt-4 font-bold text-emerald-600">Great job! You've mastered the basics.</p>
              
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-700">
                <div className="text-xl font-bold">Accuracy: {accuracy}%</div>
                <div className="mt-2 text-sm text-slate-500">Characters: {metrics.totalAttempts} • Correct: {metrics.correctAttempts} • Mistakes: {metrics.mistakes}</div>
              </div>
              
              <div className="mt-6 flex flex-col gap-2 text-left text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Keyboard keys</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Short sequences</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Simple words</div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 font-bold text-amber-700">
                <Sparkles className="h-4 w-4" /> +20 XP
              </div>
              
              <div className="mt-2 text-sm font-bold text-blue-600">LEVEL 2 UNLOCKED!</div>

              <button onClick={onCompleteLevel} className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-6 w-full' })}>
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-slate-800">Good try!</h2>
              <p className="mt-4 text-slate-600">You've learned the basics. Practice once more and try again.</p>
              
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-700">
                <div className="text-xl font-bold text-rose-500">Accuracy: {accuracy}%</div>
                <div className="mt-2 text-sm text-slate-500">Characters: {metrics.totalAttempts} • Correct: {metrics.correctAttempts} • Mistakes: {metrics.mistakes}</div>
                <p className="mt-2 text-xs font-bold text-slate-400">(80% required to pass)</p>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={onBack} className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'flex-1' })}>
                  Back to Typing
                </button>
                <button onClick={() => {
                  setRoundIndex(0); setTargetIndex(0); setTypedSequence(''); setMetrics({ totalAttempts: 0, correctAttempts: 0, mistakes: 0 });
                }} className={buttonVariants({ variant: 'default', size: 'lg', className: 'flex-1' })}>
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
              Type the sequence
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
              <span className="text-[15px] font-black text-emerald-600">{metrics.totalAttempts > 0 ? accuracy : 100}%</span>
            </div>
            <div className="h-8 w-[2px] bg-slate-200/50" />
            <div className="flex flex-col">
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Mistakes</span>
              <span className="text-[15px] font-black text-rose-500">{metrics.mistakes}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">{currentRound.title}</span>
            <span className="text-[15px] font-black text-blue-600">{targetIndex} / {currentRound.targets.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
