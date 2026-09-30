import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, RotateCw, Trash2, ArrowUp, ArrowDown, Blocks, Check, Repeat, Sparkles } from 'lucide-react';
import './BlockCoding.css';
import { usePlayer } from '@/features/player/hooks/usePlayer';

const BLOCKS = {
  START: { id: 'START', label: 'START', bg: '#10b981', category: 'EVENT', icon: Play },
  MOVE_FORWARD: { id: 'MOVE_FORWARD', label: 'MOVE FORWARD', bg: '#3b82f6', category: 'ACTION', icon: ArrowUp },
  MOVE_BACKWARD: { id: 'MOVE_BACKWARD', label: 'MOVE BACKWARD', bg: '#2563eb', category: 'ACTION', icon: ArrowDown },
  TURN_RIGHT: { id: 'TURN_RIGHT', label: 'TURN RIGHT', bg: '#8b5cf6', category: 'ACTION', icon: RotateCw },
  TURN_LEFT: { id: 'TURN_LEFT', label: 'TURN LEFT', bg: '#8b5cf6', category: 'ACTION', icon: RotateCcw },
  REPEAT_3: { id: 'REPEAT_3', label: 'REPEAT 3 TIMES', bg: '#f59e0b', category: 'CONTROL', isContainer: true, icon: Repeat }
};

const LEARNING_REWARD = { xp: 25, coins: 10 };

/**
 * fitViewport: when true (full-page Block Coding screens) the coding area is sized
 * from the viewport height so palette, workspace, robot board and Run/Reset are all
 * visible without scrolling on desktop. When false (embedded, e.g. final challenge)
 * it uses natural/min heights.
 */
export default function InteractiveBlockCoding({ tasks, mode = 'learning', onComplete, fitViewport = false }) {
  const { player, updatePlayer } = usePlayer();
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const lesson = tasks[currentLessonIdx];

  const [workspace, setWorkspace] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotState, setRobotState] = useState(lesson.startPos);
  const [feedback, setFeedback] = useState(null);
  const [executingBlockIndex, setExecutingBlockIndex] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    setWorkspace([]);
    setRobotState(lesson.startPos);
    setFeedback(null);
    setIsRunning(false);
    setShowSuccess(false);
    setExecutingBlockIndex(null);
    setAttempts(0);
  }, [lesson]);

  const addBlock = (blockId) => {
    if (isRunning) return;
    if (blockId === 'START' && workspace.some(b => b.id === 'START')) return;
    setFeedback(null);
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

  const clearAll = () => {
    if (isRunning) return;
    setWorkspace([]);
    setFeedback(null);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setWorkspace([]);
    setRobotState(lesson.startPos);
    setFeedback(null);
    setShowSuccess(false);
    setExecutingBlockIndex(null);
  };

  const runProgram = async () => {
    if (isRunning || workspace.length === 0) return;

    if (workspace[0].id !== 'START') {
      setFeedback({ type: 'error', message: 'Every program must begin with a START block. Try moving START to the top.' });
      return;
    }

    setIsRunning(true);
    setFeedback(null);
    setExecutingBlockIndex(0);
    let currentRobot = { ...lesson.startPos };
    setRobotState(currentRobot);

    const executionList = [];
    for (let i = 0; i < workspace.length; i++) {
      if (workspace[i].id === 'REPEAT_3' && i + 1 < workspace.length) {
        executionList.push({ id: workspace[i + 1].id, wsIndex: i + 1 });
        executionList.push({ id: workspace[i + 1].id, wsIndex: i + 1 });
        executionList.push({ id: workspace[i + 1].id, wsIndex: i + 1 });
        i++;
      } else {
        executionList.push({ id: workspace[i].id, wsIndex: i });
      }
    }

    for (const step of executionList) {
      setExecutingBlockIndex(step.wsIndex);
      const cmd = step.id;
      await new Promise(r => setTimeout(r, 600));
      if (cmd === 'START') continue;

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

    await new Promise(r => setTimeout(r, 500));
    setExecutingBlockIndex(null);

    const reached = currentRobot.x === lesson.flagPos.x && currentRobot.y === lesson.flagPos.y;

    if (reached) {
      if (lesson.requireRepeat && !workspace.some(b => b.id === 'REPEAT_3')) {
        setFeedback({ type: 'error', message: 'You must use a REPEAT block for this mission!' });
        setIsRunning(false);
        return;
      }
      if (mode === 'learning') {
        // single update so XP, level and coins never overwrite each other
        const p = playerRef.current;
        const newXP = p.xp + LEARNING_REWARD.xp;
        updatePlayer({ xp: newXP, level: Math.floor(newXP / 100) + 1, coins: p.coins + LEARNING_REWARD.coins });
      }
      setShowSuccess(true);
    } else {
      const n = attempts + 1;
      setAttempts(n);
      setFeedback({
        type: 'error',
        message: n % 2 === 1
          ? 'Almost! Your robot stopped before reaching the star.'
          : 'Try changing the order of your blocks.'
      });
      setIsRunning(false);
    }
  };

  const handleContinue = () => {
    setShowSuccess(false);
    if (currentLessonIdx < tasks.length - 1) {
      setCurrentLessonIdx(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const isLast = currentLessonIdx === tasks.length - 1;
  const canRun = workspace.length > 0 && !isRunning;
  const n = lesson.gridSize;

  return (
    <div className="bc-root">

      {/* Lesson progress */}
      <div className="bc-progress">
        <div>
          <span className="bc-progress-label">{mode === 'challenge' ? 'Mission Progress' : 'Lesson Progress'}</span>
          <span className="bc-progress-stage">{mode === 'challenge' ? 'Mission' : 'Stage'} {currentLessonIdx + 1} of {tasks.length}</span>
        </div>
        <div className="bc-progress-bar">
          <div className="bc-progress-fill" style={{ width: `${(currentLessonIdx / tasks.length) * 100}%` }} />
        </div>
      </div>

      {/* MAIN CODING AREA: left = palette + workspace, right = robot game */}
      <div className={`bc-grid ${fitViewport ? 'bc-fit' : ''}`}>

        {/* LEFT */}
        <div className="bc-col">
          <div className="bc-card">
            <div className="bc-card-head">
              <h3 className="bc-h3">Blocks Palette</h3>
              <p className="bc-hint">Click a block to add it</p>
            </div>
            <div className="bc-palette">
              {lesson.availableBlocks.map(blockId => {
                const cfg = BLOCKS[blockId];
                const Icon = cfg.icon;
                return (
                  <button
                    key={blockId}
                    className="bc-pal-btn"
                    onClick={() => addBlock(blockId)}
                    disabled={isRunning || (blockId === 'START' && workspace.some(b => b.id === 'START'))}
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <span className="bc-ico"><Icon size={12} strokeWidth={3} /></span>
                    <span className="bc-lbl">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bc-card bc-ws-card">
            <div className="bc-card-head">
              <h3 className="bc-h3">Workspace</h3>
              <button className="bc-clear" onClick={clearAll} disabled={isRunning || workspace.length === 0}>Clear All</button>
            </div>

            <div className="bc-ws">
              {workspace.length === 0 ? (
                <div className="bc-empty">
                  <Blocks size={32} color="#cbd5e1" />
                  <b>🧩 Your program is empty</b>
                  <small>Click a block above to start building.</small>
                </div>
              ) : (
                <div className="bc-stack">
                  <AnimatePresence initial={false}>
                    {workspace.map((block, idx) => {
                      const isRepeatNext = idx > 0 && workspace[idx - 1].id === 'REPEAT_3';
                      const Icon = block.icon;
                      const active = idx === executingBlockIndex;
                      return (
                        <React.Fragment key={block.uniqueId}>
                          {idx > 0 && <div className="bc-arrow"><ArrowDown size={14} strokeWidth={3} /></div>}
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bc-block ${isRepeatNext ? 'bc-indent' : ''} ${active ? 'bc-active' : ''}`}
                            style={{ backgroundColor: block.bg }}
                          >
                            {isRepeatNext && <div className="bc-branch" />}
                            <div className="bc-block-l">
                              <span className="bc-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,.25)', fontSize: 10 }}>
                                {active ? '🟢' : <Icon size={12} strokeWidth={3} />}
                              </span>
                              <span>{block.label}</span>
                            </div>
                            <div className="bc-block-r">
                              <button className="bc-mini" aria-label="Move up" onClick={() => moveBlock(idx, -1)} disabled={isRunning || idx === 0}><ArrowUp size={13} strokeWidth={3} /></button>
                              <button className="bc-mini" aria-label="Move down" onClick={() => moveBlock(idx, 1)} disabled={isRunning || idx === workspace.length - 1}><ArrowDown size={13} strokeWidth={3} /></button>
                              <button className="bc-mini bc-del" aria-label="Delete block" onClick={() => removeBlock(idx)} disabled={isRunning}><Trash2 size={13} strokeWidth={2.5} /></button>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: robot game */}
        <div className="bc-card bc-game">
          <h3 className="bc-game-title">🤖 Help the robot reach the star!</h3>
          <p className="bc-game-sub">Programs run from top to bottom.</p>

          <div className="bc-board-area">
            <div className="bc-board" data-testid="robot-board">
              <div className="bc-cells" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
                {Array.from({ length: n * n }).map((_, i) => (
                  <div key={i} className={`bc-cell ${((i % n) + Math.floor(i / n)) % 2 ? 'bc-alt' : ''}`} />
                ))}
              </div>

              {/* Star */}
              <div
                className="bc-sprite"
                style={{ width: `${100 / n}%`, height: `${100 / n}%`, left: `${(lesson.flagPos.x / n) * 100}%`, top: `${(lesson.flagPos.y / n) * 100}%` }}
              >
                <motion.span
                  className="bc-emoji"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  style={{ fontSize: `${52 / n}cqw` }}
                >⭐</motion.span>
              </div>

              {/* Robot */}
              <div
                className="bc-sprite bc-robot"
                style={{ width: `${100 / n}%`, height: `${100 / n}%`, left: `${(robotState.x / n) * 100}%`, top: `${(robotState.y / n) * 100}%` }}
              >
                <div className="bc-robot-body">
                  <div className="bc-face" style={{ transform: `rotate(${robotState.dir * 90}deg)` }}><i /></div>
                  <span className="bc-emoji" style={{ fontSize: `${46 / n}cqw` }}>🤖</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div className="bc-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="bc-win" initial={{ scale: 0.85, y: 10 }} animate={{ scale: 1, y: 0 }}>
                    <div style={{ fontSize: 30 }}>🎉</div>
                    <h4>PROGRAM COMPLETE!</h4>
                    <p>{mode === 'challenge' ? 'Great! Mission complete!' : 'The robot reached the star!'}</p>
                    {mode === 'learning' && (
                      <div className="bc-rewards">
                        <span className="bc-chip"><Sparkles size={12} style={{ verticalAlign: '-2px' }} /> +{LEARNING_REWARD.xp} XP</span>
                        <span className="bc-chip bc-coin">🪙 +{LEARNING_REWARD.coins} Coins</span>
                      </div>
                    )}
                    <button className="bc-continue" onClick={handleContinue}>{isLast ? 'Finish' : 'Continue'}</button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bc-status">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div key={feedback.message} className="bc-msg bc-err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span>💡</span>{feedback.message}
                </motion.div>
              )}
              {!feedback && isRunning && !showSuccess && (
                <motion.div key="running" className="bc-msg bc-run" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ▶ Running your program…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RUN / RESET */}
      <div className="bc-controls">
        <button className="bc-btn bc-run" onClick={runProgram} disabled={!canRun}>
          <Play size={20} fill="#fff" /> RUN PROGRAM
        </button>
        <button className="bc-btn bc-reset" onClick={resetSimulation} disabled={isRunning && !showSuccess}>
          <RotateCcw size={20} strokeWidth={2.5} /> RESET
        </button>
      </div>
    </div>
  );
}
