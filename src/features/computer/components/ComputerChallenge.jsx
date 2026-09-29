import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Trophy, Keyboard, Blocks, Bug, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import GameHUD from '@/features/hud/components/GameHUD';
import { buttonVariants } from '@/components/core/button';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import VirtualKeyboard from './VirtualKeyboard';
import InteractiveBlockCoding from './InteractiveBlockCoding';
import InteractivePythonDebugging from './InteractivePythonDebugging';

const TYPING_TARGET = "START GAME";

const BLOCK_MISSION = [
  {
    id: 1,
    title: 'Block Coding',
    description: 'Guide the robot to the computer. Build your own sequence!',
    availableBlocks: ['START', 'MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT', 'REPEAT_3'],
    gridSize: 5,
    startPos: { x: 0, y: 2, dir: 1 },
    flagPos: { x: 4, y: 2 }
  }
];

const PYTHON_MISSION = [
  {
    id: 1,
    title: 'Python Debugging',
    description: 'Fix the logic bug so the total prints as 10.',
    initialCode: 'points = 8\nbonus = 2\ntotal = points - bonus\nprint(total)',
    expectedOutput: '10'
  }
];

const LOGIC_QUESTIONS = [
  {
    question: "If a robot is facing RIGHT and turns LEFT, which way is it facing?",
    options: ["UP", "DOWN", "RIGHT", "LEFT"],
    answer: "UP"
  },
  {
    question: "What does debugging mean?",
    options: ["Making the computer faster", "Finding and fixing mistakes in code", "Writing a brand new program", "Deleting all files"],
    answer: "Finding and fixing mistakes in code"
  },
  {
    question: "Which block would you use to do the exact same thing 3 times?",
    options: ["START", "MOVE_FORWARD", "REPEAT_3", "TURN_LEFT"],
    answer: "REPEAT_3"
  }
];

export default function ComputerChallenge() {
  const { player, updatePlayer, earnXP } = usePlayer();
  const [missionStage, setMissionStage] = useState(0); // 0: Brief, 1: Typing, 2: Blocks, 3: Python, 4: Logic, 5: Results

  // Typing State
  const [typingIndex, setTypingIndex] = useState(0);
  const [typedCorrectly, setTypedCorrectly] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [typingFeedback, setTypingFeedback] = useState(null);
  
  // Logic State
  const [logicIndex, setLogicIndex] = useState(0);
  const [logicFeedback, setLogicFeedback] = useState(null);
  
  // Typing Engine
  const handleKeyDown = useCallback((e) => {
    if (missionStage !== 1) return;
    if (typingIndex >= TYPING_TARGET.length) return;

    // Ignore modifiers
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    e.preventDefault();
    const pressedKey = e.key.toUpperCase();
    const expected = TYPING_TARGET[typingIndex];
    
    // For spacebar handling
    const isSpaceExpected = expected === ' ';
    const isSpacePressed = pressedKey === ' ' || pressedKey === 'SPACE';

    setActiveKey(isSpacePressed ? 'SPACE' : pressedKey);

    if ((isSpaceExpected && isSpacePressed) || pressedKey === expected) {
      setTypingFeedback('correct');
      setTypedCorrectly(prev => prev + 1);
      
      const nextIndex = typingIndex + 1;
      setTypingIndex(nextIndex);
      
      if (nextIndex >= TYPING_TARGET.length) {
        setTimeout(() => setMissionStage(2), 1500);
      }
    } else {
      setTypingFeedback('incorrect');
    }

    setTimeout(() => {
      setActiveKey(null);
      setTypingFeedback(null);
    }, 150);

  }, [missionStage, typingIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleVirtualKeyPress = (key) => {
    handleKeyDown({ key, preventDefault: () => {} });
  };

  const handleLogicAnswer = (answer) => {
    if (logicFeedback) return;

    if (answer === LOGIC_QUESTIONS[logicIndex].answer) {
      setLogicFeedback('correct');
      setTimeout(() => {
        setLogicFeedback(null);
        if (logicIndex + 1 < LOGIC_QUESTIONS.length) {
          setLogicIndex(logicIndex + 1);
        } else {
          handleChallengeComplete();
        }
      }, 1500);
    } else {
      setLogicFeedback('incorrect');
      setTimeout(() => setLogicFeedback(null), 1500);
    }
  };

  const handleChallengeComplete = () => {
    setMissionStage(5);
    
    if (!player.computerProgress?.finalChallenge?.rewardClaimed) {
      earnXP(100);
      updatePlayer({
        skills: {
          ...player.skills,
          digital: (player.skills?.digital || 0) + 1
        },
        computerProgress: {
          ...player.computerProgress,
          finalChallenge: {
            unlocked: true,
            completed: true,
            rewardClaimed: true
          }
        }
      });
    }
  };

  const renderProgress = () => {
    if (missionStage === 0 || missionStage === 5) return null;
    return (
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm border border-white/80 backdrop-blur-sm mb-6">
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-extrabold uppercase tracking-wide text-slate-500">Mission {missionStage} of 4</span>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className={missionStage >= 1 ? 'text-emerald-600' : 'text-slate-400'}>Typing</span>
            <span className="text-slate-300">•</span>
            <span className={missionStage >= 2 ? 'text-emerald-600' : 'text-slate-400'}>Blocks</span>
            <span className="text-slate-300">•</span>
            <span className={missionStage >= 3 ? 'text-emerald-600' : 'text-slate-400'}>Python</span>
            <span className="text-slate-300">•</span>
            <span className={missionStage >= 4 ? 'text-emerald-600' : 'text-slate-400'}>Logic</span>
          </div>
        </div>
        <div className="h-4 w-48 overflow-hidden rounded-full bg-slate-200/50 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${(missionStage / 4) * 100}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-[#eaf3ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <GameHUD objective="Complete the final Computer Mission." />

      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <Link 
          to="/world/school/computer/hub" 
          className="flex items-center gap-2 rounded-xl border-2 border-white/90 bg-white/80 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col pb-10 pt-28 px-4">
        {renderProgress()}

        {missionStage === 0 && (
          <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center pt-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-[32px] border-4 border-orange-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-xl shadow-orange-500/30">
                <Trophy className="h-12 w-12" />
              </div>
              
              <p className="font-extrabold uppercase tracking-widest text-slate-400 text-[12px] mb-2">Final Computer Mission</p>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-800 mb-6">Capstone Challenge</h2>
              
              <p className="font-bold text-lg text-slate-600 mb-6">
                You've entered the Computer Challenge! You'll solve four mini missions using your computer skills.
              </p>

              <div className="flex flex-col gap-3 text-left font-bold text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                <div className="flex items-center gap-3"><Keyboard className="text-blue-500 h-5 w-5" /> Typing</div>
                <div className="flex items-center gap-3"><Blocks className="text-emerald-500 h-5 w-5" /> Block Coding</div>
                <div className="flex items-center gap-3"><Bug className="text-purple-500 h-5 w-5" /> Python Debugging</div>
                <div className="flex items-center gap-3"><Lightbulb className="text-amber-500 h-5 w-5" /> Logic</div>
              </div>
              
              <button 
                onClick={() => setMissionStage(1)}
                className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] bg-orange-500 hover:bg-orange-600' })}
              >
                Start Mission
              </button>
            </motion.div>
          </div>
        )}

        {missionStage === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center">
            <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-2">Mission 1 — Typing</h2>
            <p className="font-bold text-slate-500 mb-10 text-lg">Type the computer command to begin.</p>
            
            <div className="mb-12 flex h-32 items-center justify-center rounded-[32px] bg-slate-800 px-12 shadow-2xl border-4 border-slate-700">
              <div className="flex items-center">
                {TYPING_TARGET.split('').map((char, idx) => {
                  let state = 'pending';
                  if (idx < typingIndex) state = 'correct';
                  if (idx === typingIndex && typingFeedback === 'incorrect') state = 'error';
                  if (idx === typingIndex && typingFeedback === 'correct') state = 'success';

                  return (
                    <span 
                      key={idx}
                      className={`text-6xl font-mono font-bold mx-[4px] min-w-[28px] text-center ${char === ' ' ? 'mx-4' : ''} ${
                        state === 'correct' || state === 'success' ? 'text-emerald-400' :
                        state === 'error' ? 'text-rose-500' :
                        idx === typingIndex ? 'text-white border-b-4 border-white animate-pulse' :
                        'text-slate-600'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <VirtualKeyboard 
              expectedChar={null} 
              activeKey={activeKey} 
              feedback={typingFeedback} 
              onKeyPress={handleVirtualKeyPress}
              highlightExpected={false}
            />
            
            <AnimatePresence>
              {typingIndex >= TYPING_TARGET.length && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-10 flex items-center gap-3 rounded-full bg-emerald-100 px-8 py-4 font-bold text-emerald-700 text-xl border-2 border-emerald-200"
                >
                  <CheckCircle2 className="h-8 w-8" /> Typing Mission Complete!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {missionStage === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <InteractiveBlockCoding 
               tasks={BLOCK_MISSION} 
               mode="challenge" 
               onComplete={() => setMissionStage(3)} 
             />
          </motion.div>
        )}

        {missionStage === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <InteractivePythonDebugging 
               tasks={PYTHON_MISSION} 
               mode="challenge" 
               onComplete={() => setMissionStage(4)} 
             />
          </motion.div>
        )}

        {missionStage === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center pt-10">
            <div className="w-full max-w-2xl rounded-[32px] border-4 border-white/90 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-xl shadow-amber-500/30">
                  <Lightbulb className="h-10 w-10" />
                </div>
                <h2 className="font-heading text-3xl font-extrabold text-slate-800">Mission 4 — Logic</h2>
                <p className="mt-2 font-bold text-slate-500 text-lg">Question {logicIndex + 1} of {LOGIC_QUESTIONS.length}</p>
              </div>

              <div className="mb-8 rounded-2xl bg-slate-50 p-8 border-2 border-slate-100 text-center">
                <h3 className="text-2xl font-bold text-slate-800">{LOGIC_QUESTIONS[logicIndex].question}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {LOGIC_QUESTIONS[logicIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLogicAnswer(option)}
                    disabled={logicFeedback !== null}
                    className="flex min-h-[80px] items-center justify-center rounded-2xl border-4 border-slate-100 bg-white p-4 font-bold text-slate-700 text-lg shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {logicFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className={`mt-6 rounded-xl p-4 text-center font-bold text-lg flex items-center justify-center gap-3 border-2 ${
                      logicFeedback === 'correct' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                    }`}
                  >
                    {logicFeedback === 'correct' ? <><CheckCircle2 className="h-6 w-6" /> Correct!</> : <><AlertCircle className="h-6 w-6" /> Good try! Let's try that one again.</>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {missionStage === 5 && (
          <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center pt-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-[32px] border-4 border-emerald-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-xl shadow-emerald-500/30">
                <Trophy className="h-12 w-12" />
              </div>
              
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800 uppercase">🎉 Computer Challenge Complete!</h2>
              <p className="mt-4 font-bold text-lg text-slate-600">
                You completed the final Computer Lab mission!
              </p>
              
              <div className="mt-8 flex flex-col gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left mb-8">
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Typing</div><span className="text-emerald-500">Passed</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Block Coding</div><span className="text-emerald-500">Passed</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Python Debugging</div><span className="text-emerald-500">Passed</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Computer Logic</div><span className="text-emerald-500">Passed</span></div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-6 py-3 font-black text-amber-700 shadow-sm border-2 border-amber-200 text-xl">
                  <Sparkles className="h-6 w-6" /> +100 XP
                </div>
                
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-100 px-6 py-3 font-black text-blue-700 shadow-sm border-2 border-blue-200 text-xl">
                  <Trophy className="h-6 w-6 text-amber-500" /> COMPUTER LAB MASTER
                </div>

                <div className="mt-2 font-black text-slate-400 uppercase tracking-widest text-sm animate-pulse">
                  Digital Skill ↑
                </div>
              </div>

              <Link 
                to="/world/school/computer/hub" 
                className={buttonVariants({ variant: 'default', size: 'lg', className: 'mt-8 w-full rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all' })}
              >
                Return to Computer Lab
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
