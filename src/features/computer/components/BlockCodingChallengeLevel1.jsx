import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Blocks, Trophy, Sparkles } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { buttonVariants } from '@/components/core/button';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import InteractiveBlockCoding from './InteractiveBlockCoding';

const MISSIONS = [
  {
    id: 1,
    title: 'Mission 1 — Sequence',
    description: 'Help the robot reach the flag. No hints this time!',
    availableBlocks: ['START', 'MOVE_FORWARD', 'MOVE_BACKWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    gridSize: 4,
    startPos: { x: 0, y: 3, dir: 0 },
    flagPos: { x: 3, y: 0 }
  },
  {
    id: 2,
    title: 'Mission 2 — Path Logic',
    description: 'Guide the robot around the obstacle and reach the star. You can do this!',
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    gridSize: 5,
    startPos: { x: 1, y: 4, dir: 0 },
    flagPos: { x: 4, y: 1 }
  },
  {
    id: 3,
    title: 'Mission 3 — Repeat',
    description: 'Use REPEAT to help the robot reach the goal!',
    requireRepeat: true,
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT', 'REPEAT_3'],
    gridSize: 5,
    startPos: { x: 0, y: 4, dir: 1 },
    flagPos: { x: 4, y: 4 }
  }
];

export default function BlockCodingChallengeLevel1() {
  const { player, updatePlayer, earnXP } = usePlayer();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    
    if (!player.computerProgress?.blockCoding?.challengePassed) {
      earnXP(40);
      updatePlayer({
        computerProgress: {
          ...player.computerProgress,
          blockCoding: {
            ...player.computerProgress?.blockCoding,
            challengePassed: true
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <GameHUD objective="Block Coding Challenge" />

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
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-xl shadow-amber-500/30">
              <Trophy className="h-12 w-12" />
            </div>
            
            <p className="font-extrabold uppercase tracking-widest text-slate-400 text-[12px] mb-2">Block Coding Challenge</p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800">Level 1 — Basics</h2>
            
            <p className="mt-4 font-bold text-lg text-amber-600">
              Let's see what you can build!
            </p>
            
            <p className="mt-4 font-medium text-slate-600">
              Complete 3 missions. Build the solution yourself!
            </p>

            <button 
              onClick={() => setHasStarted(true)}
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Start Challenge
            </button>
          </motion.div>
        </div>
      ) : !isCompleted ? (
        <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col pb-10 pt-28 px-4">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm flex items-center gap-3">
              <Trophy className="text-amber-500 h-8 w-8" />
              CHALLENGE MODE
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-500 uppercase tracking-wider">Level 1 — Programming Basics</p>
          </div>

          <InteractiveBlockCoding tasks={MISSIONS} mode="challenge" onComplete={handleComplete} />
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 pb-6 pt-28">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-[32px] border-4 border-amber-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-xl shadow-amber-500/30">
              <Trophy className="h-12 w-12" />
            </div>
            
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800">🎉 GREAT JOB!</h2>
            <p className="mt-2 font-extrabold text-slate-500 uppercase tracking-widest text-sm">
              Block Coding Level 1 Complete!
            </p>
            
            <div className="mt-6 flex flex-col gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Sequence</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Actions</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Program execution</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Repeat</div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-6 py-2.5 font-bold text-amber-700 shadow-sm border border-amber-200">
              <Sparkles className="h-5 w-5" /> +40 XP
            </div>

            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
              <div className="text-[15px] font-extrabold tracking-wide text-emerald-600 mb-2">LEVEL 2 UNLOCKED 🔓</div>
              <p className="text-[13px] font-bold text-slate-500">You are ready for the next challenge!</p>
            </div>

            <Link 
              to="/world/school/computer/hub" 
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-6 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              Continue
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
