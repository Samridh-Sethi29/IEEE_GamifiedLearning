import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Blocks } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { buttonVariants } from '@/components/core/button';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import InteractiveBlockCoding from './InteractiveBlockCoding';

const LESSONS = [
  {
    id: 1,
    title: 'Sequence',
    description: 'Help the robot reach the star. Programs follow instructions in order.',
    target: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'MOVE_FORWARD'],
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    gridSize: 3,
    startPos: { x: 0, y: 2, dir: 0 },
    flagPos: { x: 1, y: 1 }
  },
  {
    id: 2,
    title: 'More Actions',
    description: 'Guide the robot to the star. You can use multiple blocks!',
    target: ['START', 'MOVE_FORWARD', 'MOVE_FORWARD', 'TURN_LEFT', 'MOVE_FORWARD'],
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    gridSize: 4,
    startPos: { x: 3, y: 3, dir: 0 },
    flagPos: { x: 2, y: 1 }
  },
  {
    id: 3,
    title: 'Repeat',
    description: 'Use the repeat block to do the same thing many times!',
    target: ['START', 'REPEAT_3', 'MOVE_FORWARD'],
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT', 'REPEAT_3'],
    gridSize: 4,
    startPos: { x: 0, y: 3, dir: 1 },
    flagPos: { x: 3, y: 3 }
  }
];

export default function BlockCodingLevel1() {
  const { player, updatePlayer } = usePlayer();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // Add completed level
    updatePlayer({
      computerProgress: {
        ...player.computerProgress,
        blockCoding: {
          ...player.computerProgress?.blockCoding,
          completedLevels: [...(player.computerProgress?.blockCoding?.completedLevels || []), 1]
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <GameHUD objective="Learn block programming basics." />

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
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-blue-400 to-blue-500 text-white shadow-xl shadow-blue-500/30">
              <Blocks className="h-12 w-12" />
            </div>
            
            <p className="font-extrabold uppercase tracking-widest text-slate-400 text-[12px] mb-2">Block Coding — Level 1</p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800">Programming Basics</h2>
            
            <p className="mt-4 font-bold text-lg text-blue-600">
              Let's build your first program!
            </p>
            
            <p className="mt-4 font-medium text-slate-600">
              Programs are instructions that tell a computer what to do. We'll build them one step at a time.
            </p>

            <button 
              onClick={() => setHasStarted(true)}
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Let's Start
            </button>
          </motion.div>
        </div>
      ) : !isCompleted ? (
        <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col pb-10 pt-28 px-4">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">
              BLOCK CODING
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-500 uppercase tracking-wider">Level 1 — Basics</p>
          </div>

          <InteractiveBlockCoding tasks={LESSONS} mode="learning" onComplete={handleComplete} />
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 pb-6 pt-28">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-[32px] border-4 border-emerald-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-xl shadow-emerald-500/30">
              <Blocks className="h-12 w-12" />
            </div>
            
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800">BLOCK CODING COMPLETE!</h2>
            <p className="mt-4 font-medium text-slate-600">
              You learned how programs use instructions, actions, and repetition.
            </p>
            
            <div className="mt-6 flex flex-col gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sequence</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Actions</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Repeat</div>
            </div>

            <Link 
              to="/world/school/computer/block-coding/challenge" 
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Take Challenge
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
