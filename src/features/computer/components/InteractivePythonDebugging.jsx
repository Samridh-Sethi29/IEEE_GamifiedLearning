import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Bug, Terminal, CheckCircle2, Bot } from 'lucide-react';
import { buttonVariants } from '@/components/core/button';

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

export default function InteractivePythonDebugging({ tasks, mode = 'learning', onComplete }) {
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

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Progress Bar */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm border border-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-extrabold uppercase tracking-wide text-slate-500">{mode === 'challenge' ? 'Mission Progress' : 'Lesson Progress'}</span>
          <span className="text-xl font-black text-purple-600">{mode === 'challenge' ? 'Mission' : 'Stage'} {currentLessonIdx + 1} of {tasks.length}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="h-4 w-48 overflow-hidden rounded-full bg-purple-100/50 shadow-inner sm:w-72">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500" style={{ width: `${((currentLessonIdx) / tasks.length) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lesson.title}</span>
        </div>
      </div>

      {/* Guide/Instruction */}
      <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white/90 p-5 shadow-sm border-2 border-white/80 flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-md">
          <Bot className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-700 leading-snug">{lesson.description}</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col lg:flex-row gap-6">
        
        {/* Editor Panel */}
        <div className="flex flex-1 flex-col rounded-[32px] bg-slate-900 p-6 shadow-2xl border-4 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="ml-3 font-mono text-sm font-bold text-slate-400">main.py</span>
            </div>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isRunning}
            spellCheck={false}
            className="flex-1 w-full min-h-[250px] resize-none bg-transparent font-mono text-lg text-purple-200 focus:outline-none selection:bg-purple-500/30"
          />
        </div>

        {/* Output Panel */}
        <div className="flex w-full lg:w-80 flex-col rounded-[32px] bg-white/90 p-6 shadow-xl border-4 border-white">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-slate-400" />
            <h3 className="font-heading text-lg font-bold text-slate-700">Output</h3>
          </div>
          
          <div className="flex-1 rounded-2xl bg-slate-50 border-2 border-slate-100 p-4 font-mono text-sm overflow-y-auto">
            {output ? (
              <div className="text-slate-800 whitespace-pre-wrap">{output}</div>
            ) : errorDetails ? (
              <div className="flex flex-col gap-2">
                <span className="text-rose-600 font-bold">{errorDetails.error}</span>
                {errorDetails.varName && (
                  <div className="mt-2 rounded-xl bg-rose-50 p-3 text-rose-800">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Variable used</div>
                    <code className="text-sm bg-white px-2 py-1 rounded border border-rose-200">{errorDetails.varName}</code>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 italic">Run code to see output...</div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 rounded-xl p-3 text-center text-sm font-bold ${
                  feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Controls */}
      <div className="mx-auto flex w-full max-w-4xl gap-4">
        <button 
          onClick={runCode} 
          disabled={isRunning || !code.trim()}
          className={buttonVariants({ variant: 'default', size: 'lg', className: 'flex-1 rounded-2xl h-14 text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] bg-purple-500 hover:bg-purple-600' })}
        >
          <Play className="mr-2 h-5 w-5" /> RUN CODE
        </button>
        <button 
          onClick={resetCode} 
          disabled={isRunning}
          className={buttonVariants({ variant: 'outline', size: 'lg', className: 'rounded-2xl h-14 px-8 text-lg bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50' })}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
