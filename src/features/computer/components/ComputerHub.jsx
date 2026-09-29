import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Keyboard, Blocks, Bug, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import { buttonVariants } from '@/components/core/button';
import { toast } from 'sonner';

export default function ComputerHub() {
  const { player } = usePlayer();
  const progress = player.computerProgress || {
    typing: { unlocked: true, currentLevel: 1 },
    blockCoding: { unlocked: false },
    pythonDebugging: { unlocked: false },
    finalChallenge: { unlocked: false }
  };

  const modules = [
    {
      id: 'typing',
      title: 'TYPING',
      subtitle: 'Master the keyboard',
      icon: <Keyboard className="h-10 w-10" />,
      status: 'AVAILABLE',
      customBody: progress.typing?.completedLevels?.includes(1) ? (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-blue-100/50">
          <div className="flex items-center justify-between text-[13px] font-bold text-emerald-600">
            <span>Level 1 — Completed</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-blue-600">
            <span>Level {progress.typing?.completedLevels?.includes(2) ? '2 — Completed' : '2 — Unlocked'}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">{progress.typing?.completedLevels?.includes(2) ? '✓' : '🔓'}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-blue-100/50">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
            <span className="text-slate-700">Level 1 — Keyboard Basics</span>
            <span className="text-blue-600">0%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100/50 shadow-inner">
            <div className="h-full w-0 rounded-full bg-blue-500 transition-all duration-500" style={{ width: '0%' }} />
          </div>
        </div>
      ),
      link: '/world/school/computer/typing',
      buttonText: progress.typing?.completedLevels?.includes(1) ? 'Continue' : 'Start Learning',
      theme: { bg: 'bg-gradient-to-b from-blue-400 to-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-400' }
    },
    {
      id: 'blockCoding',
      title: 'BLOCK CODING',
      subtitle: 'Build programs with blocks',
      icon: <Blocks className="h-10 w-10" />,
      status: 'AVAILABLE',
      customBody: progress.blockCoding?.challengePassed ? (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-emerald-100/50">
          <div className="flex items-center justify-between text-[13px] font-bold text-emerald-600">
            <span>Level 1 — Completed</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
          </div>
          <div className="mt-2 text-[12px] font-bold text-amber-500 text-right">+40 XP Earned</div>
        </div>
      ) : progress.blockCoding?.completedLevels?.includes(1) ? (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-emerald-100/50">
          <div className="flex items-center justify-between text-[13px] font-bold text-emerald-600">
            <span>Level 1 — Learning Done</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-blue-600">
            <span>Challenge — Unlocked</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">🔓</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-emerald-100/50">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
            <span className="text-slate-700">Level 1 — Programming Basics</span>
            <span className="text-emerald-600">0%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/50 shadow-inner">
            <div className="h-full w-0 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '0%' }} />
          </div>
        </div>
      ),
      link: progress.blockCoding?.completedLevels?.includes(1) && !progress.blockCoding?.challengePassed ? '/world/school/computer/block-coding/challenge' : '/world/school/computer/block-coding',
      buttonText: progress.blockCoding?.challengePassed ? 'Review Level' : progress.blockCoding?.completedLevels?.includes(1) ? 'Take Challenge' : 'Start Learning',
      theme: { bg: 'bg-gradient-to-b from-emerald-400 to-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-400' }
    },
    {
      id: 'pythonDebugging',
      title: 'PYTHON DEBUGGING',
      subtitle: 'Find and fix code mistakes',
      icon: <Bug className="h-10 w-10" />,
      status: 'AVAILABLE',
      customBody: progress.pythonDebugging?.completedLevels?.includes(1) ? (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-purple-100/50">
          <div className="flex items-center justify-between text-[13px] font-bold text-emerald-600">
            <span>Level 1 — Learning Done</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-purple-600">
            <span>Challenge — Unlocked</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700">🔓</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-purple-100/50">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
            <span className="text-slate-700">Level 1 — Debugging Basics</span>
            <span className="text-purple-600">0%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-purple-100/50 shadow-inner">
            <div className="h-full w-0 rounded-full bg-purple-500 transition-all duration-500" style={{ width: '0%' }} />
          </div>
        </div>
      ),
      link: progress.pythonDebugging?.completedLevels?.includes(1) ? '#' : '/world/school/computer/python-debugging',
      buttonText: progress.pythonDebugging?.completedLevels?.includes(1) ? 'Take Challenge' : 'Start Learning',
      theme: { bg: 'bg-gradient-to-b from-purple-400 to-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-400' }
    },
    {
      id: 'computerChallenge',
      title: 'COMPUTER CHALLENGE',
      subtitle: 'Test your computer skills',
      icon: <Trophy className="h-10 w-10" />,
      status: 'AVAILABLE',
      customBody: progress.finalChallenge?.completed ? (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-amber-100/50 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[13px] font-black text-emerald-600 mb-1">
             <CheckCircle2 className="h-4 w-4" /> COMPLETED
          </div>
          <p className="text-[12px] font-bold text-amber-600">🏆 Computer Lab Master</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-white/60 p-3 shadow-inner border border-orange-100/50 text-center">
          <p className="text-[12px] font-bold text-slate-500 mb-1">Typing • Coding • Debugging • Logic</p>
          <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-orange-600">
             <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Ready to begin
          </div>
        </div>
      ),
      link: '/world/school/computer/final-challenge',
      buttonText: progress.finalChallenge?.completed ? 'Review Challenge' : 'Start Challenge',
      theme: { bg: 'bg-gradient-to-b from-orange-400 to-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400' }
    }
  ];

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <GameHUD  />
      
      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <Link 
          to="/world/school/computer" 
          className="flex items-center gap-2 rounded-xl border-2 border-white/90 bg-white/80 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-36">
        <div className="mb-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-heading text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl drop-shadow-sm"
          >
            COMPUTER LAB
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-slate-500/90"
          >
            Choose your learning path
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {modules.map((mod, index) => {
            const isLocked = mod.status === 'LOCKED';

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                onClick={() => {
                  if (isLocked) toast.info(mod.lockMessage);
                }}
                className={`relative flex flex-col justify-between overflow-hidden rounded-[32px] border-4 bg-white/90 p-1 shadow-xl backdrop-blur-sm transition-all ${
                  isLocked 
                    ? 'border-white/60 opacity-85 cursor-not-allowed grayscale-[0.2]' 
                    : 'border-white hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer'
                }`}
              >
                <div className={`rounded-[26px] p-6 h-full ${mod.theme.light}`}>
                  <div className="flex items-start gap-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${mod.theme.bg}`}>
                      {mod.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h2 className={`font-heading text-xl font-bold tracking-tight ${mod.theme.text}`}>{mod.title}</h2>
                        {isLocked && (
                          <div className="flex h-8 items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 shadow-inner">
                            <Lock className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Locked</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-[14px] font-bold text-slate-600/80 leading-snug">{mod.subtitle}</p>
                      
                      {!isLocked && mod.customBody}

                      {isLocked && (
                        <div className="mt-4 rounded-2xl bg-white/50 p-3.5 text-center shadow-inner border border-slate-200/50">
                          <p className="text-[13px] font-bold text-slate-500">
                            {mod.lockMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="mt-6">
                      <Link
                        to={mod.link}
                        onClick={(e) => e.stopPropagation()}
                        className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full rounded-2xl text-[16px] h-12 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
                      >
                        {mod.buttonText}
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
