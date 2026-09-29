import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trash2, ArrowUp, ArrowDown, Bot } from 'lucide-react';
import { buttonVariants } from '@/components/core/button';

const BLOCKS = {
  START: { id: 'START', label: 'START', color: 'bg-emerald-500', category: 'EVENT' },
  MOVE_FORWARD: { id: 'MOVE_FORWARD', label: 'MOVE FORWARD', color: 'bg-blue-500', category: 'ACTION' },
  MOVE_BACKWARD: { id: 'MOVE_BACKWARD', label: 'MOVE BACKWARD', color: 'bg-blue-600', category: 'ACTION' },
  TURN_RIGHT: { id: 'TURN_RIGHT', label: 'TURN RIGHT', color: 'bg-purple-500', category: 'ACTION' },
  TURN_LEFT: { id: 'TURN_LEFT', label: 'TURN LEFT', color: 'bg-purple-500', category: 'ACTION' },
  REPEAT_3: { id: 'REPEAT_3', label: 'REPEAT 3 TIMES', color: 'bg-amber-500', category: 'CONTROL', isContainer: true }
};

export default function InteractiveBlockCoding({ tasks, mode = 'learning', onComplete }) {
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const lesson = tasks[currentLessonIdx];

  const [workspace, setWorkspace] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotState, setRobotState] = useState(lesson.startPos);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setWorkspace([]);
    setRobotState(lesson.startPos);
    setFeedback(null);
    setIsRunning(false);
  }, [lesson]);

  const addBlock = (blockId) => {
    if (isRunning) return;
    if (blockId === 'START' && workspace.some(b => b.id === 'START')) return;
    setWorkspace([...workspace, { ...BLOCKS[blockId], uniqueId: Date.now() + Math.random() }]);
  };

  const removeBlock = (index) => {
    if (isRunning) return;
    setWorkspace(workspace.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    if (isRunning) return;
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === workspace.length - 1) return;
    
    const newWorkspace = [...workspace];
    const temp = newWorkspace[index];
    newWorkspace[index] = newWorkspace[index + direction];
    newWorkspace[index + direction] = temp;
    setWorkspace(newWorkspace);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setWorkspace([]);
    setRobotState(lesson.startPos);
    setFeedback(null);
  };

  const runProgram = async () => {
    if (isRunning || workspace.length === 0) return;
    
    if (workspace[0].id !== 'START') {
      setFeedback({ type: 'error', message: 'Program must begin with START block.' });
      return;
    }

    setIsRunning(true);
    setFeedback(null);
    let currentRobot = { ...lesson.startPos };
    setRobotState(currentRobot);
    
    const executionList = [];
    for (let i = 0; i < workspace.length; i++) {
      if (workspace[i].id === 'REPEAT_3' && i + 1 < workspace.length) {
        executionList.push(workspace[i + 1].id);
        executionList.push(workspace[i + 1].id);
        executionList.push(workspace[i + 1].id);
        i++; // Skip the next block since it's inside the repeat
      } else {
        executionList.push(workspace[i].id);
      }
    }

    for (const cmd of executionList) {
      if (cmd === 'START') continue;
      
      await new Promise(r => setTimeout(r, 600));
      
      if (cmd === 'MOVE_FORWARD') {
        if (currentRobot.dir === 0) currentRobot.y -= 1;
        if (currentRobot.dir === 1) currentRobot.x += 1;
        if (currentRobot.dir === 2) currentRobot.y += 1;
        if (currentRobot.dir === 3) currentRobot.x -= 1;
      } else if (cmd === 'MOVE_BACKWARD') {
        if (currentRobot.dir === 0) currentRobot.y += 1;
        if (currentRobot.dir === 1) currentRobot.x -= 1;
        if (currentRobot.dir === 2) currentRobot.y -= 1;
        if (currentRobot.dir === 3) currentRobot.x += 1;
      } else if (cmd === 'TURN_RIGHT') {
        currentRobot.dir = (currentRobot.dir + 1) % 4;
      } else if (cmd === 'TURN_LEFT') {
        currentRobot.dir = (currentRobot.dir + 3) % 4;
      }
      
      currentRobot.x = Math.max(0, Math.min(lesson.gridSize - 1, currentRobot.x));
      currentRobot.y = Math.max(0, Math.min(lesson.gridSize - 1, currentRobot.y));
      
      setRobotState({ ...currentRobot });
    }

    await new Promise(r => setTimeout(r, 600));
    
    if (currentRobot.x === lesson.flagPos.x && currentRobot.y === lesson.flagPos.y) {
      if (lesson.requireRepeat && !workspace.some(b => b.id === 'REPEAT_3')) {
        setFeedback({ type: 'error', message: 'You must use a REPEAT block for this mission!' });
        setIsRunning(false);
        return;
      }

      setFeedback({ type: 'success', message: mode === 'challenge' ? 'Great! Mission complete!' : 'Great! You built your program!' });
      setTimeout(() => {
        if (currentLessonIdx < tasks.length - 1) {
          setCurrentLessonIdx(prev => prev + 1);
        } else {
          onComplete();
        }
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: 'Almost! Try changing the order.' });
      setIsRunning(false);
    }
  };

  const getRotationStyle = (dir) => {
    if (dir === 0) return 'rotate-0';
    if (dir === 1) return 'rotate-90';
    if (dir === 2) return 'rotate-180';
    if (dir === 3) return '-rotate-90';
    return '';
  };

  return (
    <div className="flex w-full flex-col gap-6">
      
      {/* Progress Bar */}
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm border border-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-extrabold uppercase tracking-wide text-slate-500">{mode === 'challenge' ? 'Mission Progress' : 'Lesson Progress'}</span>
          <span className="text-xl font-black text-blue-600">{mode === 'challenge' ? 'Mission' : 'Step'} {currentLessonIdx + 1} of {tasks.length}</span>
        </div>
        <div className="h-4 w-48 overflow-hidden rounded-full bg-blue-100/50 shadow-inner sm:w-72">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500" style={{ width: `${((currentLessonIdx) / tasks.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex w-full flex-col lg:flex-row gap-6">
        <div className="flex w-full lg:w-64 flex-col gap-4 rounded-[32px] bg-white/90 p-6 shadow-xl border-4 border-white">
        <h3 className="font-heading text-lg font-bold text-slate-700">Blocks</h3>
        <div className="flex flex-col gap-3">
          {lesson.availableBlocks.map(blockId => (
            <button
              key={blockId}
              onClick={() => addBlock(blockId)}
              disabled={isRunning || (blockId === 'START' && workspace.some(b => b.id === 'START'))}
              className={`flex items-center justify-center rounded-xl p-4 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:shadow-sm disabled:opacity-50 disabled:pointer-events-none ${BLOCKS[blockId].color}`}
            >
              {BLOCKS[blockId].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 rounded-[32px] bg-white/90 p-6 shadow-xl border-4 border-white">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-slate-700">Workspace</h3>
          <button 
            onClick={() => setWorkspace([])}
            disabled={isRunning || workspace.length === 0}
            className="text-sm font-bold text-rose-500 hover:text-rose-600 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
        
        <div className="flex-1 min-h-[300px] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-4 flex flex-col gap-2">
          {workspace.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 font-bold">
              Click blocks to add them here
            </div>
          ) : (
            <AnimatePresence>
              {workspace.map((block, idx) => {
                const isRepeatNext = idx > 0 && workspace[idx-1].id === 'REPEAT_3';
                return (
                  <motion.div
                    key={block.uniqueId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group flex items-center justify-between rounded-xl p-4 font-bold text-white shadow-sm ${block.color} ${isRepeatNext ? 'ml-8 relative' : ''}`}
                  >
                    {isRepeatNext && (
                      <div className="absolute -left-6 top-1/2 h-10 w-4 -translate-y-1/2 border-b-[3px] border-l-[3px] border-amber-500/50 rounded-bl-xl" />
                    )}
                    <span>{block.label}</span>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(idx, -1)} disabled={isRunning || idx === 0} className="p-1 hover:bg-white/20 rounded disabled:opacity-30"><ArrowUp size={18} /></button>
                      <button onClick={() => moveBlock(idx, 1)} disabled={isRunning || idx === workspace.length - 1} className="p-1 hover:bg-white/20 rounded disabled:opacity-30"><ArrowDown size={18} /></button>
                      <button onClick={() => removeBlock(idx)} disabled={isRunning} className="p-1 hover:bg-white/20 rounded ml-2"><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-4 flex gap-4">
          <button 
            onClick={runProgram} 
            disabled={isRunning || workspace.length === 0}
            className={buttonVariants({ variant: 'default', size: 'lg', className: 'flex-1 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.15)] bg-emerald-500 hover:bg-emerald-600' })}
          >
            <Play className="mr-2 h-5 w-5" /> Run Program
          </button>
          <button 
            onClick={resetSimulation} 
            disabled={isRunning}
            className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'flex-1 rounded-xl' })}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </button>
        </div>
      </div>

      <div className="flex w-full lg:w-72 flex-col gap-4 rounded-[32px] bg-[#f4f9f9]/90 p-6 shadow-xl border-4 border-white justify-between">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-b from-blue-400 to-blue-500 text-white shadow-md">
            <Bot className="h-6 w-6" />
          </div>
          <p className="font-bold text-slate-700 leading-snug">{lesson.description}</p>
        </div>

        <div className="relative mx-auto mt-4 aspect-square w-full max-w-[240px] rounded-2xl bg-white border-2 border-slate-100 shadow-inner overflow-hidden">
          <div 
            className="absolute inset-0 grid"
            style={{ 
              gridTemplateColumns: `repeat(${lesson.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${lesson.gridSize}, 1fr)` 
            }}
          >
            {Array.from({ length: lesson.gridSize * lesson.gridSize }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-100" />
            ))}
          </div>

          <div 
            className="absolute flex items-center justify-center transition-all duration-300"
            style={{ 
              width: `${100 / lesson.gridSize}%`, 
              height: `${100 / lesson.gridSize}%`,
              left: `${(lesson.flagPos.x / lesson.gridSize) * 100}%`,
              top: `${(lesson.flagPos.y / lesson.gridSize) * 100}%`
            }}
          >
            <div className="text-3xl animate-bounce">⭐</div>
          </div>

          <div 
            className="absolute flex items-center justify-center transition-all duration-500 ease-in-out"
            style={{ 
              width: `${100 / lesson.gridSize}%`, 
              height: `${100 / lesson.gridSize}%`,
              left: `${(robotState.x / lesson.gridSize) * 100}%`,
              top: `${(robotState.y / lesson.gridSize) * 100}%`
            }}
          >
            <div className={`h-[70%] w-[70%] rounded-[10px] bg-blue-500 shadow-[0_4px_10px_rgba(59,130,246,0.5)] flex items-center justify-center text-white transition-transform duration-300 ${getRotationStyle(robotState.dir)}`}>
              <Bot size={28} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="h-16 flex items-center justify-center mt-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-center font-bold px-4 py-2 rounded-xl text-sm ${
                  feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
  );
}
