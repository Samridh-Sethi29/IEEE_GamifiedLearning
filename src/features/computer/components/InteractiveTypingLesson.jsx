import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { buttonVariants } from '@/components/core/button';
import { CheckCircle2, XCircle, Sparkles, MessageCircle } from 'lucide-react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import VirtualKeyboard from './VirtualKeyboard';

const LESSON_STEPS = [
  { type: 'intro', text: "This is your keyboard! Every key helps you tell the computer what to do." },
  { type: 'key', target: 'A', text: "First, let's find the A key." },
  { type: 'key', target: 'S', text: "Awesome! Now try S." },
  { type: 'key', target: 'D', text: "Great! How about D?" },
  { type: 'key', target: 'F', text: "You got it! Now find F." },
  { type: 'key', target: 'J', text: "Let's move to the right hand. Find J." },
  { type: 'key', target: 'K', text: "Nice! Now K." },
  { type: 'key', target: 'L', text: "And finally L." },
  { type: 'sequence', target: 'AS', text: "Great job! Let's combine them. Type AS." },
  { type: 'sequence', target: 'FD', text: "Now type FD." },
  { type: 'sequence', target: 'JK', text: "How about JK?" },
  { type: 'word', target: 'CAT', text: "Let's try a simple word! Type CAT." },
  { type: 'word', target: 'DOG', text: "You're a natural! Now type DOG." },
  { type: 'word', target: 'SUN', text: "One more word! Type SUN." }
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'BACKSPACE'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['SPACE']
];

export default function InteractiveTypingLesson({ onComplete, onBack }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [typedSequence, setTypedSequence] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [activeKey, setActiveKey] = useState(null);
  
  const { updatePlayer, player } = usePlayer();

  const step = LESSON_STEPS[currentStepIndex];
  const isCompleted = currentStepIndex >= LESSON_STEPS.length;
  const progressPercent = Math.round((currentStepIndex / LESSON_STEPS.length) * 100);

  const expectedChar = step && step.target ? step.target[typedSequence.length] : null;

  const handleKeyPress = useCallback((key) => {
    if (isCompleted || step.type === 'intro' || feedback?.type === 'success') return;
    
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === expectedChar) {
      setFeedback({ type: 'success', message: getSuccessMessage() });
      const newSequence = typedSequence + key;
      setTypedSequence(newSequence);

      if (newSequence.length === step.target.length) {
        // Step complete!
        setTimeout(() => {
          setFeedback(null);
          setTypedSequence('');
          setCurrentStepIndex(i => i + 1);
        }, 1000);
      } else {
        // Just character complete, clear feedback quickly
        setTimeout(() => setFeedback(null), 500);
      }
    } else {
      setFeedback({ type: 'error', message: getErrorMessage() });
      setTimeout(() => setFeedback(null), 1500);
    }
  }, [isCompleted, step, expectedChar, typedSequence, feedback]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      let key = e.key.toUpperCase();
      if (key === ' ') key = 'SPACE';
      if (e.code === 'Enter') key = 'ENTER';
      if (e.code === 'Backspace') key = 'BACKSPACE';
      
      // Only process keys we care about
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
      // Mark as completed in state
      const currentProgress = player.computerProgress || {
        typing: { unlocked: true, currentLevel: 1, lesson1Completed: false, completedLevels: [] },
        blockCoding: { unlocked: false },
        pythonDebugging: { unlocked: false },
        finalChallenge: { unlocked: false }
      };
      
      if (!currentProgress.typing.lesson1Completed) {
        updatePlayer({
          computerProgress: {
            ...currentProgress,
            typing: {
              ...currentProgress.typing,
              lesson1Completed: true
            }
          }
        });
      }
    }
  }, [isCompleted, player, updatePlayer]);

  const getSuccessMessage = () => {
    const msgs = ["Great!", "Nice typing!", "You found it!", "Excellent!"];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const getErrorMessage = () => {
    const msgs = ["Try again!", "Look at the highlighted key.", "You're close!"];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const handleNextIntro = () => {
    setCurrentStepIndex(1);
  };

  if (isCompleted) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-5">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-3xl border-4 border-white/90 bg-white/95 p-8 text-center shadow-2xl shadow-slate-900/25"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-slate-800">Typing Basics Complete!</h2>
          <p className="mt-4 text-slate-600">You've learned the keyboard basics. Now you're ready for a typing challenge!</p>
          
          <div className="mt-6 flex flex-col gap-2 text-left text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Keys</div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Short sequences</div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Simple words</div>
          </div>

          <button onClick={onBack} className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full' })}>
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
          {step.type !== 'intro' ? (
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
          ) : (
            <div className="flex flex-col items-center">
              <button 
                onClick={handleNextIntro} 
                className={buttonVariants({ variant: 'default', size: 'lg', className: 'rounded-2xl h-16 px-12 text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
              >
                Let's Start
              </button>
            </div>
          )}
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
