import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Bug, Terminal, CheckCircle2, Bot } from 'lucide-react';
import './BlockCoding.css';
import './PythonDebugging.css';

function evaluateSimplePython(code) {
  const lines = code.split('\n');
  const vars = {};
  const output = [];
  
  try {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('=') && !trimmed.startsWith('print(')) {
        let [name, val] = trimmed.split('=').map(s => s.trim());
        if (val.startsWith('"') || val.startsWith("'")) {
          vars[name] = val.slice(1, -1);
        } else {
          vars[name] = parseFloat(val);
        }
      } else if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const content = trimmed.substring(6, trimmed.length - 1).trim();
        if (content.startsWith('"') || content.startsWith("'")) {
          output.push(content.slice(1, -1));
        } else if (content.includes('+')) {
          const [left, right] = content.split('+').map(s => s.trim());
          const lVal = isNaN(left) ? vars[left] : parseFloat(left);
          const rVal = isNaN(right) ? vars[right] : parseFloat(right);
          if (lVal === undefined) throw { type: 'NameError', varName: left };
          if (rVal === undefined) throw { type: 'NameError', varName: right };
          output.push((lVal + rVal).toString());
        } else if (content.includes('-')) {
          const [left, right] = content.split('-').map(s => s.trim());
          const lVal = isNaN(left) ? vars[left] : parseFloat(left);
          const rVal = isNaN(right) ? vars[right] : parseFloat(right);
          if (lVal === undefined) throw { type: 'NameError', varName: left };
          if (rVal === undefined) throw { type: 'NameError', varName: right };
          output.push((lVal - rVal).toString());
        } else {
          if (vars[content] !== undefined) {
            output.push(vars[content].toString());
          } else {
            throw { type: 'NameError', varName: content };
          }
        }
      } else {
        throw { type: 'SyntaxError', message: `Oops! We didn't understand this line: ${trimmed}` };
      }
    }
    return { success: true, output: output.join('\n') };
  } catch (err) {
    if (err.type === 'NameError') {
      return { success: false, error: `Oops! Python can't find that variable.`, varName: err.varName };
    }
    return { success: false, error: err.message || "Something went wrong!" };
  }
}

export default function InteractivePythonDebugging({ tasks, mode = 'learning', onComplete, fitViewport = false }) {
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const lesson = tasks[currentLessonIdx];

  const [code, setCode] = useState(lesson.initialCode);
  const [output, setOutput] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(lesson.initialCode);
    setOutput('');
    setErrorDetails(null);
    setFeedback(null);
  }, [currentLessonIdx, lesson]);

  const runCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setFeedback(null);
    setErrorDetails(null);
    setOutput('...');

    setTimeout(() => {
      const result = evaluateSimplePython(code);
      
      if (result.success) {
        setOutput(result.output);
        // Validation logic
        if (result.output === lesson.expectedOutput || (lesson.customValidation && lesson.customValidation(code, result.output))) {
          setFeedback({ type: 'success', message: mode === 'challenge' ? 'Great! Mission complete!' : 'Nice! You fixed the bug!' });
          setTimeout(() => {
            if (currentLessonIdx < tasks.length - 1) {
              setCurrentLessonIdx(prev => prev + 1);
            } else {
              onComplete();
            }
          }, 2000);
        } else {
          setFeedback({ type: 'error', message: lesson.hint || 'Not quite! Try running it again.' });
        }
      } else {
        setOutput('');
        setErrorDetails(result);
        setFeedback({ type: 'error', message: lesson.hint || 'There is a bug in the code!' });
      }
      setIsRunning(false);
    }, 600);
  };

  const resetCode = () => {
    setCode(lesson.initialCode);
    setOutput('');
    setErrorDetails(null);
    setFeedback(null);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="py-root">
      {/* Progress */}
      <div className="bc-progress">
        <div>
          <span className="bc-progress-label">{mode === 'challenge' ? 'Mission Progress' : 'Lesson Progress'}</span>
          <span className="bc-progress-stage py-stage">{mode === 'challenge' ? 'Mission' : 'Stage'} {currentLessonIdx + 1} of {tasks.length}</span>
        </div>
        <div>
          <div className="bc-progress-bar">
            <div className="bc-progress-fill py-fill" style={{ width: `${(currentLessonIdx / tasks.length) * 100}%` }} />
          </div>
          <div className="py-lesson-name">{lesson.title}</div>
        </div>
      </div>

      {/* Instruction */}
      <div className="py-guide">
        <div className="py-guide-ico"><Bot size={22} /></div>
        <p>{lesson.description}</p>
      </div>

      {/* Editor + Output */}
      <div className={`py-grid ${fitViewport ? 'py-fit' : ''}`}>
        <div className="py-editor">
          <div className="py-editor-bar">
            <div className="py-dots"><i /><i /><i /></div>
            <span className="py-file">main.py</span>
          </div>
          <div className="py-code">
            <div className="py-lines">
              {Array.from({ length: lineCount }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              className="py-area"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isRunning}
              spellCheck={false}
              wrap="off"
            />
          </div>
        </div>

        <div className="py-out">
          <div className="py-out-head">
            <Terminal size={18} color="#94a3b8" />
            <h3>Output</h3>
          </div>
          <div className="py-out-body">
            {output ? (
              <div className="py-result">{output}</div>
            ) : errorDetails ? (
              <div>
                <span className="py-err">{errorDetails.error}</span>
                {errorDetails.varName && (
                  <div className="py-var">
                    <small>Variable used</small>
                    <code>{errorDetails.varName}</code>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-placeholder">Run code to see output...</div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.message}
                className={`py-fb ${feedback.type === 'success' ? 'ok' : 'bad'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="bc-controls">
        <button className="bc-btn py-btn-run" onClick={runCode} disabled={isRunning || !code.trim()}>
          <Play size={20} fill="#fff" /> RUN CODE
        </button>
        <button className="bc-btn bc-reset" onClick={resetCode} disabled={isRunning}>
          <RotateCcw size={20} strokeWidth={2.5} /> RESET
        </button>
      </div>
    </div>
  );
}
