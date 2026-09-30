import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { buttonVariants } from '@/components/core/button';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import VirtualKeyboard from './VirtualKeyboard';

const LESSON2_STEPS = [
  { type: 'word', target: 'CAT', text: "Let's type CAT." },
  { type: 'word', target: 'DOG', text: "Now type DOG." },
  { type: 'word', target: 'SUN', text: "Type SUN." },
  { type: 'word', target: 'MAP', text: "Type MAP." },
  { type: 'word', target: 'FAN', text: "Type FAN." },
  { type: 'word', target: 'BOOK', text: "A bit longer now. Type BOOK." },
  { type: 'word', target: 'TREE', text: "Type TREE." },
  { type: 'word', target: 'HOME', text: "Type HOME." },
  { type: 'word', target: 'FISH', text: "Type FISH." },
  { type: 'word', target: 'GAME', text: "Type GAME." },
  { type: 'word', target: 'PLAY', text: "Almost done! Type PLAY." },
  { type: 'word', target: 'BALL', text: "Type BALL." },
  { type: 'word', target: 'SCHOOL', text: "Great! Type SCHOOL." },
  { type: 'word', target: 'COMPUTER', text: "Last one! Type COMPUTER." }
];

export default function InteractiveTypingLessonLevel2({ onComplete, onBack }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [typedSequence, setTypedSequence] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  
  const { updatePlayer, player } = usePlayer();

  const step = LESSON2_STEPS[currentStepIndex];
  const isCompleted = currentStepIndex >= LESSON2_STEPS.length;
  const progressPercent = Math.round((currentStepIndex / Math.max(1, LESSON2_STEPS.length)) * 100);

  const expectedChar = step && step.target ? step.target[typedSequence.length] : null;

  const handleKeyPress = useCallback((key) => {
    if (isCompleted || feedback?.type === 'success') return;
    
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === expectedChar) {
      setFeedback({ type: 'success', message: 'Good!' });
      const newSequence = typedSequence + key;
      setTypedSequence(newSequence);

      if (newSequence.length === step.target.length) {
        setTimeout(() => {
          setFeedback(null);
          setTypedSequence('');
          setCurrentStepIndex(i => i + 1);
        }, 800);
      } else {
        setTimeout(() => setFeedback(null), 400);
      }
    } else {
      setFeedback({ type: 'error', message: 'Try that letter again.' });
      setTimeout(() => setFeedback(null), 1200);
    }
  }, [isCompleted, step, expectedChar, typedSequence, feedback]);

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

  useEffect(() => {
    if (isCompleted) {
      const currentProgress = player.computerProgress || {
        typing: { unlocked: true, currentLevel: 1, lesson1Completed: false, lesson2Completed: false, completedLevels: [] },
        blockCoding: { unlocked: false },
        pythonDebugging: { unlocked: false },
        finalChallenge: { unlocked: false }
      };
      
      if (!currentProgress.typing.lesson2Completed) {
        updatePlayer({
          computerProgress: {
            ...currentProgress,
            typing: {
              ...currentProgress.typing,
              lesson2Completed: true
            }
          }
        });
      }
    }
  }, [isCompleted, player, updatePlayer]);

  if (isCompleted) {
    return (
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-5 pt-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-[32px] border-4 border-emerald-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800">Level 2 Lesson Complete!</h2>
          <p className="mt-4 font-medium text-slate-600">You typed all the practice words perfectly.<br/>Now you're ready for the accuracy challenge.</p>
          
          <button onClick={onComplete} className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-10 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}>
            Back to Typing
          </button>
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
          {/* Lesson Instruction */}
          <div className="mb-4 flex flex-col items-center text-center">
            <h2 className="text-xl font-black text-slate-700 sm:text-3xl flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-500" />
              {step.text}
            </h2>
          </div>

          {/* Dedicated Feedback Area (Fixed height to prevent jumping) */}
          <div className="h-12 w-full flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.message}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-lg font-black shadow-sm border-2 ${
                    feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Section: Large Target Character */}
        <div className="flex w-full flex-col items-center justify-center mb-8">
          <div className="flex gap-4 sm:gap-6 rounded-[32px] bg-white p-6 sm:p-12 shadow-lg border-4 border-slate-100">
            {step.target.split('').map((char, idx) => {
              const isCompletedChar = idx < typedSequence.length;
              const isCurrent = idx === typedSequence.length;
              return (
                <div 
                  key={idx} 
                  className={`flex h-24 w-20 sm:h-32 sm:w-28 items-center justify-center rounded-[24px] border-[6px] text-5xl sm:text-7xl font-black transition-all ${
                    isCompletedChar ? 'border-emerald-100 bg-emerald-50 text-emerald-400 opacity-50' : 
                    isCurrent ? 'border-blue-400 bg-blue-50 text-blue-600 shadow-[0_10px_30px_rgba(59,130,246,0.3)] scale-110 z-10' : 'border-slate-100 bg-slate-50 text-slate-300'
                  }`}
                >
                  {char}
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
            highlightExpected={true}
          />
        </div>
      </div>

      {/* Stats/Progress Area (At the bottom) */}
      <div className="mt-6 px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm border border-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-extrabold uppercase tracking-wide text-slate-500">Lesson Progress</span>
            <span className="text-xl font-black text-blue-600">{progressPercent}%</span>
          </div>
          <div className="h-4 w-48 overflow-hidden rounded-full bg-blue-100/50 shadow-inner sm:w-72">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
