import React, { useState } from 'react';
import { ArrowLeft, Keyboard, Trophy, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/core/button';
import InteractiveTypingLessonLevel2 from './InteractiveTypingLessonLevel2';
import TypingChallengeLevel2 from './TypingChallengeLevel2';
import { usePlayer } from '@/features/player/hooks/usePlayer';

export default function TypingLevel2({ onBack, onCompleteLevel }) {
  const { player } = usePlayer();
  const progress = player.computerProgress?.typing || { lesson2Completed: false, completedLevels: [] };
  const lesson2Completed = progress.lesson2Completed;
  const level2Completed = progress.completedLevels.includes(2);

  const [view, setView] = useState('intro'); // 'intro', 'lesson', 'challenge'

  if (view === 'lesson') {
    return <InteractiveTypingLessonLevel2 onBack={() => setView('intro')} onComplete={() => setView('intro')} />;
  }

  if (view === 'challenge') {
    return <TypingChallengeLevel2 onBack={() => setView('intro')} onCompleteLevel={() => { setView('intro'); onCompleteLevel(); }} />;
  }

  return (
    <>
      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border-2 border-white/90 bg-white/80 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </button>
      </div>

      <div className="relative mx-auto flex h-full max-w-3xl flex-col items-center justify-center p-5 pt-24">
        <div className="w-full overflow-hidden rounded-[32px] border-4 border-blue-100 bg-white/95 p-8 text-center shadow-2xl shadow-slate-900/20 backdrop-blur-sm sm:p-10">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-blue-400 to-blue-500 text-white shadow-xl shadow-blue-500/30">
            <Keyboard className="h-12 w-12" />
          </div>
          
          <p className="text-[13px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
            COMPUTER LAB
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
            Typing — Level 2
          </h1>
          
          <h2 className="mt-4 text-2xl font-bold text-slate-700">Words & Accuracy</h2>
          
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-blue-50 p-6 shadow-inner border border-blue-100/50">
            <p className="text-[16px] font-bold leading-relaxed text-slate-700">
              Great! Now let's type complete words.
            </p>
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-600">
              In Level 1, you learned where the keys are.<br/>
              Now you'll use them to type words accurately.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <button 
              onClick={() => setView('lesson')}
              className={buttonVariants({ variant: lesson2Completed ? 'secondary' : 'default', size: 'lg', className: 'rounded-2xl h-14 px-8 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
            >
              {lesson2Completed ? 'Review Lesson' : 'Start Lesson'}
            </button>
            {(lesson2Completed || level2Completed) && (
              <button 
                onClick={() => setView('challenge')}
                className={buttonVariants({ variant: level2Completed ? 'secondary' : 'default', size: 'lg', className: 'rounded-2xl h-14 px-8 text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_0_0_rgb(217,119,6)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgb(217,119,6)] active:translate-y-[4px] active:shadow-none transition-all' })}
              >
                Take Challenge
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
