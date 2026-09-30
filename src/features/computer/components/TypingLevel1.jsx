import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Keyboard, Trophy, Lock } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { buttonVariants } from '@/components/core/button';
import InteractiveTypingLesson from './InteractiveTypingLesson';
import TypingChallenge from './TypingChallenge';
import TypingLevel2 from './TypingLevel2'; // We will create this next
import { usePlayer } from '@/features/player/hooks/usePlayer';

export default function TypingLevel1() {
  const [view, setView] = useState('menu'); // 'menu', 'lesson', 'challenge', 'level2'
  const { player } = usePlayer();
  
  const progress = player.computerProgress?.typing || { unlocked: true, currentLevel: 1, lesson1Completed: false, lesson2Completed: false, completedLevels: [] };
  const level1Completed = progress.completedLevels.includes(1);
  const lesson1Completed = progress.lesson1Completed;
  const level2Unlocked = level1Completed;
  const level2Completed = progress.completedLevels.includes(2);

  if (view === 'lesson') {
    return (
      <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
        <GameHUD  />
        <InteractiveTypingLesson onBack={() => setView('menu')} onComplete={() => setView('menu')} />
      </div>
    );
  }

  if (view === 'challenge') {
    return (
      <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
        <GameHUD  />
        <TypingChallenge onBack={() => setView('menu')} onCompleteLevel={() => setView('menu')} />
      </div>
    );
  }
  
  if (view === 'level2') {
    return (
      <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
        <GameHUD  />
        <TypingLevel2 onBack={() => setView('menu')} onCompleteLevel={() => setView('menu')} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      <GameHUD  />
      
      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <Link 
          to="/world/school/computer/hub" 
          className="flex items-center gap-2 rounded-xl border-2 border-white/90 bg-white/80 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-36">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500 text-white shadow-xl">
            <Keyboard className="h-10 w-10" />
          </div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-blue-600 drop-shadow-sm">
            COMPUTER LAB
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm md:text-5xl">
            Typing Path
          </h1>
        </div>
          
        <div className="flex flex-col gap-6">
          {/* Level 1 Card */}
          <div className={`relative overflow-hidden rounded-[32px] p-1.5 border-4 transition-all shadow-xl backdrop-blur-sm ${level1Completed ? 'border-emerald-100 bg-emerald-50/80' : 'border-blue-100 bg-white'}`}>
            <div className={`rounded-[24px] p-6 sm:p-8 ${level1Completed ? 'bg-emerald-50' : 'bg-white'}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-slate-800">Level 1 — Keyboard Basics</h2>
                  {level1Completed ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <span className="text-[15px] font-bold text-emerald-600 uppercase tracking-wide">Completed</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[15px] font-bold text-slate-500">Learn where the keys are</p>
                  )}
                </div>
                {level1Completed && <Trophy className="h-12 w-12 text-emerald-500 drop-shadow-sm" />}
              </div>
              
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button 
                  onClick={() => setView('lesson')}
                  className={buttonVariants({ variant: level1Completed ? 'secondary' : 'default', size: 'lg', className: 'flex-1 rounded-2xl h-12 text-[16px]' })}
                >
                  {lesson1Completed || level1Completed ? 'Review Lesson' : 'Begin Lesson'}
                </button>
                {(lesson1Completed || level1Completed) && (
                  <button 
                    onClick={() => setView('challenge')}
                    className={buttonVariants({ variant: level1Completed ? 'secondary' : 'default', size: 'lg', className: 'flex-1 rounded-2xl h-12 text-[16px] bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_0_0_rgb(217,119,6)]' })}
                  >
                    Take Challenge
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Level 2 Card */}
          <div className={`relative overflow-hidden rounded-[32px] p-1.5 border-4 transition-all shadow-xl backdrop-blur-sm ${level2Unlocked ? (level2Completed ? 'border-emerald-100 bg-emerald-50/80' : 'border-blue-100 bg-white') : 'border-slate-100 bg-slate-50/60 opacity-80'}`}>
            <div className={`rounded-[24px] p-6 sm:p-8 ${level2Unlocked ? (level2Completed ? 'bg-emerald-50' : 'bg-white') : 'bg-slate-50'}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-slate-800">Level 2 — Words & Accuracy</h2>
                  {level2Unlocked ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">🔓</span>
                      <span className="text-[15px] font-bold text-blue-600 uppercase tracking-wide">Unlocked</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[15px] font-bold text-slate-500">Complete Level 1 to unlock</p>
                  )}
                </div>
                {!level2Unlocked && <Lock className="h-10 w-10 text-slate-300" />}
                {level2Completed && <Trophy className="h-12 w-12 text-emerald-500 drop-shadow-sm" />}
              </div>
              
              {level2Unlocked && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button 
                    onClick={() => setView('level2')}
                    className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full rounded-2xl h-12 text-[16px] shadow-[0_4px_0_0_rgba(0,0,0,0.15)]' })}
                  >
                    Start Level 2
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Level 3 Card */}
          <div className={`relative overflow-hidden rounded-[32px] p-1.5 border-4 transition-all shadow-md backdrop-blur-sm border-slate-100 bg-slate-50/60 opacity-70`}>
            <div className="rounded-[24px] p-6 sm:p-8 bg-slate-50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-slate-800">Level 3 — Coming Soon</h2>
                  {level2Completed ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">🔓</span>
                      <span className="text-[15px] font-bold text-blue-600 uppercase tracking-wide">Unlocked</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[15px] font-bold text-slate-500">Complete Level 2 to unlock</p>
                  )}
                </div>
                {!level2Completed && <Lock className="h-10 w-10 text-slate-300" />}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
