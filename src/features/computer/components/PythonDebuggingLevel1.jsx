import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Bug } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { buttonVariants } from '@/components/core/button';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import InteractivePythonDebugging from './InteractivePythonDebugging';

const STAGES = [
  {
    id: 1,
    title: 'Output',
    description: 'Python uses print() to show something on the screen. Change "Hello!" to "SkillVerse!" and run the code.',
    initialCode: 'print("Hello!")',
    expectedOutput: 'SkillVerse!',
    hint: 'Make sure to type exactly "SkillVerse!" inside the quotes.'
  },
  {
    id: 2,
    title: 'Variables',
    description: 'Something in this code does not match. Look carefully at the variable name in the print statement.',
    initialCode: 'name = "Riya"\nprint(namee)',
    expectedOutput: 'Riya',
    hint: 'Check if the variable name in the print statement matches the one you created.'
  },
  {
    id: 3,
    title: 'Logic',
    description: 'Debugging is not only finding typing mistakes. Sometimes the instruction itself is wrong. Fix the math so the score prints as 15.',
    initialCode: 'score = 10\nbonus = 5\nprint(score - bonus)',
    expectedOutput: '15',
    hint: 'Should you add or subtract the bonus to get 15?'
  }
];

export default function PythonDebuggingLevel1() {
  const { player, updatePlayer } = usePlayer();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // Add completed level for pythonDebugging
    updatePlayer({
      computerProgress: {
        ...player.computerProgress,
        pythonDebugging: {
          ...player.computerProgress?.pythonDebugging,
          completedLevels: [...(player.computerProgress?.pythonDebugging?.completedLevels || []), 1]
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <GameHUD objective="Learn python debugging basics." />

      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <Link 
          to="/world/school/computer/hub" 
          className="flex items-center gap-2 rounded-xl border-2 border-white/90 bg-white/80 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>
      </div>

      {!hasStarted && !isCompleted ? (
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 pb-6 pt-28">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-[32px] border-4 border-white/90 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-purple-400 to-purple-500 text-white shadow-xl shadow-purple-500/30">
              <Bug className="h-12 w-12" />
            </div>
            
            <p className="font-extrabold uppercase tracking-widest text-slate-400 text-[12px] mb-2">Python Debugging — Level 1</p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800">Debugging Basics</h2>
            
            <p className="mt-4 font-bold text-lg text-purple-600">
              Find the mistake and fix it!
            </p>
            
            <p className="mt-4 font-medium text-slate-600">
              Sometimes a program doesn't work the way we expect. Debugging means finding the problem and fixing it.
            </p>

            <button 
              onClick={() => setHasStarted(true)}
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] bg-purple-500 hover:bg-purple-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Let's Start
            </button>
          </motion.div>
        </div>
      ) : !isCompleted ? (
        <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col pb-10 pt-28 px-4">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">
              PYTHON DEBUGGING
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-500 uppercase tracking-wider">Level 1 — Basics</p>
          </div>

          <InteractivePythonDebugging tasks={STAGES} mode="learning" onComplete={handleComplete} />
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 pb-6 pt-28">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-[32px] border-4 border-purple-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-purple-400 to-purple-500 text-white shadow-xl shadow-purple-500/30">
              <Bug className="h-12 w-12" />
            </div>
            
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800 uppercase">🎉 Debugging Basics Complete!</h2>
            <p className="mt-4 font-medium text-slate-600">
              You learned how to find and fix simple code problems.
            </p>
            
            <div className="mt-6 flex flex-col gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Output</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Variable mistakes</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Logic mistakes</div>
            </div>

            <Link 
              to="/world/school/computer/hub" 
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] bg-purple-500 hover:bg-purple-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Take Challenge
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
