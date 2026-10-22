import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Bug,
  Terminal,
  CheckCircle2,
  Bot,
  Search,
  Sparkles,
  Zap,
  AlertTriangle,
} from "lucide-react";
import "./BlockCoding.css";
import "./PythonDebugging.css";
import {
  playKeyClick,
  playLaserScan,
  playTerminalRun,
  playBugSquashed,
  playErrorBuzz,
} from "@/features/computer/utils/computerSounds";
import { triggerConfetti } from "@/features/english/utils/confetti";

export function evaluateSimplePython(code) {
  const lines = code.split("\n");
  const vars = {};
  const output = [];

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Variable assignment: name = value
      if (trimmed.includes("=") && !trimmed.startsWith("print(") && !trimmed.startsWith("print ")) {
        let [name, val] = trimmed.split("=").map((s) => s.trim());
        if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
          throw {
            type: "SyntaxError",
            line: lineNum,
            message: `SyntaxError: Invalid variable name "${name}" on line ${lineNum}`,
          };
        }

        if (val.startsWith('"') || val.startsWith("'")) {
          const quote = val[0];
          if (!val.endsWith(quote) || val.length < 2) {
            throw {
              type: "SyntaxError",
              line: lineNum,
              message: `SyntaxError: EOL while scanning string literal (missing closing quote ${quote}) on line ${lineNum}`,
            };
          }
          vars[name] = val.slice(1, -1);
        } else if (val.includes("+")) {
          const parts = val.split("+").map((s) => s.trim());
          let sum = 0;
          for (let p of parts) {
            let num = isNaN(p) ? vars[p] : parseFloat(p);
            if (num === undefined) {
              throw {
                type: "NameError",
                line: lineNum,
                varName: p,
                message: `NameError: name '${p}' is not defined on line ${lineNum}`,
              };
            }
            sum += num;
          }
          vars[name] = sum;
        } else if (val.includes("-")) {
          const [left, right] = val.split("-").map((s) => s.trim());
          const lVal = isNaN(left) ? vars[left] : parseFloat(left);
          const rVal = isNaN(right) ? vars[right] : parseFloat(right);
          if (lVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: left,
              message: `NameError: name '${left}' is not defined on line ${lineNum}`,
            };
          }
          if (rVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: right,
              message: `NameError: name '${right}' is not defined on line ${lineNum}`,
            };
          }
          vars[name] = lVal - rVal;
        } else if (val.includes("*")) {
          const [left, right] = val.split("*").map((s) => s.trim());
          const lVal = isNaN(left) ? vars[left] : parseFloat(left);
          const rVal = isNaN(right) ? vars[right] : parseFloat(right);
          if (lVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: left,
              message: `NameError: name '${left}' is not defined on line ${lineNum}`,
            };
          }
          if (rVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: right,
              message: `NameError: name '${right}' is not defined on line ${lineNum}`,
            };
          }
          vars[name] = lVal * rVal;
        } else {
          if (isNaN(val)) {
            if (vars[val] !== undefined) {
              vars[name] = vars[val];
            } else {
              throw {
                type: "NameError",
                line: lineNum,
                varName: val,
                message: `NameError: name '${val}' is not defined on line ${lineNum}`,
              };
            }
          } else {
            vars[name] = parseFloat(val);
          }
        }
      } else if (trimmed.startsWith("print(") || trimmed.startsWith("print ")) {
        if (trimmed.startsWith("print ") && !trimmed.startsWith("print(")) {
          throw {
            type: "SyntaxError",
            line: lineNum,
            message: `SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...) on line ${lineNum}?`,
          };
        }

        if (!trimmed.endsWith(")")) {
          throw {
            type: "SyntaxError",
            line: lineNum,
            message: `SyntaxError: unexpected EOF while parsing (missing closing parenthesis ')') on line ${lineNum}`,
          };
        }

        const content = trimmed.substring(6, trimmed.length - 1).trim();

        if (
          (content.startsWith('"') && !content.endsWith('"')) ||
          (content.startsWith("'") && !content.endsWith("'"))
        ) {
          throw {
            type: "SyntaxError",
            line: lineNum,
            message: `SyntaxError: EOL while scanning string literal (missing quote) on line ${lineNum}`,
          };
        }

        if (
          (content.startsWith('"') && content.endsWith('"')) ||
          (content.startsWith("'") && content.endsWith("'"))
        ) {
          output.push(content.slice(1, -1));
        } else if (content.includes("+")) {
          const parts = content.split("+").map((s) => s.trim());
          let combined = "";
          let isNumeric = false;

          for (let p of parts) {
            let val;
            if (p.startsWith('"') || p.startsWith("'")) {
              val = p.slice(1, -1);
            } else if (vars[p] !== undefined) {
              val = vars[p];
            } else if (!isNaN(p)) {
              val = parseFloat(p);
              isNumeric = true;
            } else {
              throw {
                type: "NameError",
                line: lineNum,
                varName: p,
                message: `NameError: name '${p}' is not defined on line ${lineNum}`,
              };
            }
            combined = combined === "" ? val : combined + val;
          }
          output.push(combined.toString());
        } else if (content.includes("-")) {
          const [left, right] = content.split("-").map((s) => s.trim());
          const lVal = isNaN(left) ? vars[left] : parseFloat(left);
          const rVal = isNaN(right) ? vars[right] : parseFloat(right);
          if (lVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: left,
              message: `NameError: name '${left}' is not defined on line ${lineNum}`,
            };
          }
          if (rVal === undefined) {
            throw {
              type: "NameError",
              line: lineNum,
              varName: right,
              message: `NameError: name '${right}' is not defined on line ${lineNum}`,
            };
          }
          output.push((lVal - rVal).toString());
        } else {
          if (vars[content] !== undefined) {
            output.push(vars[content].toString());
          } else {
            throw {
              type: "NameError",
              line: lineNum,
              varName: content,
              message: `NameError: name '${content}' is not defined on line ${lineNum}`,
            };
          }
        }
      } else {
        throw {
          type: "SyntaxError",
          line: lineNum,
          message: `SyntaxError: invalid syntax on line ${lineNum}: "${trimmed}"`,
        };
      }
    }
    return { success: true, output: output.join("\n") };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Execution error",
      line: err.line || 1,
      varName: err.varName || null,
    };
  }
}

export default function InteractivePythonDebugging({
  tasks,
  mode = "learning",
  onComplete,
  fitViewport = false,
}) {
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const lesson = tasks[currentLessonIdx];

  const [code, setCode] = useState(lesson.initialCode);
  const [output, setOutput] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [bugLine, setBugLine] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);

  useEffect(() => {
    setCode(lesson.initialCode);
    setOutput("");
    setErrorDetails(null);
    setFeedback(null);
    setBugLine(null);
    setDiagnostic(null);
    setIsScanning(false);
  }, [currentLessonIdx, lesson]);

  const handleTextChange = (e) => {
    playKeyClick();
    setCode(e.target.value);
    if (bugLine) setBugLine(null);
  };

  // Bug Scanner Feature
  const handleScanForBugs = () => {
    if (isScanning || isRunning) return;
    playLaserScan();
    setIsScanning(true);
    setDiagnostic(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = evaluateSimplePython(code);

      if (!res.success) {
        setBugLine(res.line);
        playErrorBuzz();
        setDiagnostic({
          line: res.line,
          title: `Bug Detected on Line ${res.line}`,
          message: res.error,
          hint: lesson.scannerHint || lesson.hint || "Check this line for missing quotes, parentheses, or misspellings!",
        });
      } else if (
        res.output !== lesson.expectedOutput &&
        (!lesson.customValidation || !lesson.customValidation(code, res.output))
      ) {
        // Output didn't match
        const targetLine = lesson.bugLine || 3;
        setBugLine(targetLine);
        playErrorBuzz();
        setDiagnostic({
          line: targetLine,
          title: `Logic Mismatch Detected`,
          message: `Code runs without crashing, but outputs "${res.output}" instead of "${lesson.expectedOutput}".`,
          hint: lesson.scannerHint || lesson.hint || "Check if your math operators or printed values match what is expected!",
        });
      } else {
        setBugLine(null);
        playBugSquashed();
        setDiagnostic({
          line: null,
          title: "Clean Codebase! 🚀",
          message: "All syntax and logic tests passed! Click 'RUN SCRIPT' to execute.",
          hint: "Hit the RUN CODE button to complete this stage!",
        });
      }
    }, 1100);
  };

  const runCode = () => {
    if (isRunning) return;
    playTerminalRun();
    setIsRunning(true);
    setFeedback(null);
    setErrorDetails(null);
    setOutput("...");

    setTimeout(() => {
      const result = evaluateSimplePython(code);

      if (result.success) {
        setOutput(result.output);
        // Validation logic
        if (
          result.output === lesson.expectedOutput ||
          (lesson.customValidation && lesson.customValidation(code, result.output))
        ) {
          playBugSquashed();
          setBugLine(null);
          setDiagnostic(null);
          setFeedback({
            type: "success",
            message:
              mode === "challenge"
                ? "MISSION COMPLETE! Bug eliminated! ⚡"
                : "NICE JOB! You fixed the bug! 🚀",
          });
          setTimeout(() => {
            if (currentLessonIdx < tasks.length - 1) {
              setCurrentLessonIdx((prev) => prev + 1);
            } else {
              triggerConfetti();
              onComplete();
            }
          }, 1800);
        } else {
          playErrorBuzz();
          setFeedback({
            type: "error",
            message: lesson.hint || "Output does not match expected result! Try scanning for bugs.",
          });
        }
      } else {
        playErrorBuzz();
        setOutput("");
        setErrorDetails(result);
        setBugLine(result.line);
        setFeedback({
          type: "error",
          message: lesson.hint || "Syntax or Name error detected in code!",
        });
      }
      setIsRunning(false);
    }, 600);
  };

  const resetCode = () => {
    playKeyClick();
    setCode(lesson.initialCode);
    setOutput("");
    setErrorDetails(null);
    setFeedback(null);
    setBugLine(null);
    setDiagnostic(null);
  };

  const lines = code.split("\n");

  return (
    <div className="py-root">
      {/* Progress */}
      <div className="bc-progress">
        <div>
          <span className="bc-progress-label">
            {mode === "challenge" ? "CYBER MISSION PROGRESS" : "LESSON PROGRESS"}
          </span>
          <span className="bc-progress-stage py-stage">
            {mode === "challenge" ? "Mission" : "Stage"} {currentLessonIdx + 1} of{" "}
            {tasks.length}
          </span>
        </div>
        <div>
          <div className="bc-progress-bar">
            <div
              className="bc-progress-fill py-fill"
              style={{ width: `${((currentLessonIdx + 1) / tasks.length) * 100}%` }}
            />
          </div>
          <div className="py-lesson-name">{lesson.title}</div>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="py-guide">
        <div className="py-guide-ico">
          <Bot size={24} />
        </div>
        <p>{lesson.description}</p>
      </div>

      {/* Editor + Terminal */}
      <div className={`py-grid ${fitViewport ? "py-fit" : ""}`}>
        {/* Editor Screen */}
        <div className="py-editor">
          <div className="py-editor-bar">
            <div className="py-dots">
              <i />
              <i />
              <i />
            </div>
            <div className="py-file">
              <Terminal size={14} color="#38bdf8" />
              main.py
            </div>
            {/* Bug Scanner Button */}
            <button
              onClick={handleScanForBugs}
              disabled={isScanning || isRunning}
              className="py-scan-btn"
              title="Scan code for syntax & logic bugs"
            >
              <Search size={14} />
              {isScanning ? "SCANNING..." : "BUG SCANNER"}
            </button>
          </div>

          <div className="py-code">
            {/* Animated Laser Scan Bar */}
            {isScanning && <div className="py-laser-line" />}

            {/* Line Numbers */}
            <div className="py-lines">
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isBug = bugLine === lineNum;
                return (
                  <div
                    key={i}
                    className={`py-line-num ${isBug ? "py-line-bug" : ""}`}
                    title={isBug ? `Bug detected on line ${lineNum}` : ""}
                  >
                    {isBug ? `🐛${lineNum}` : lineNum}
                  </div>
                );
              })}
            </div>

            {/* Code Textarea */}
            <textarea
              className="py-area"
              value={code}
              onChange={handleTextChange}
              disabled={isRunning || isScanning}
              spellCheck={false}
              wrap="off"
            />
          </div>
        </div>

        {/* CRT Output Terminal Screen */}
        <div className="py-out">
          <div className="py-out-head">
            <div className="py-out-title">
              <Terminal size={16} />
              BASH TERMINAL
            </div>
            <span className="py-out-badge">
              {isRunning ? "COMPILING..." : "SYSTEM READY"}
            </span>
          </div>

          <div className="py-out-body">
            {output ? (
              <div>
                <span style={{ color: "#38bdf8", fontSize: 12 }}>$ python3 main.py</span>
                <div className="py-result mt-1">{output}</div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <span>[Process exited 0]</span>
                  <span className="py-cursor" />
                </div>
              </div>
            ) : errorDetails ? (
              <div>
                <span style={{ color: "#38bdf8", fontSize: 12 }}>$ python3 main.py</span>
                <div className="mt-2 text-xs text-rose-400 font-mono">
                  Traceback (most recent call last):
                  <br />
                  &nbsp;&nbsp;File "main.py", line {errorDetails.line}
                </div>
                <div className="py-err mt-2">{errorDetails.error}</div>
                {errorDetails.varName && (
                  <div className="py-var">
                    <small>Undefined Identifier</small>
                    <code>{errorDetails.varName}</code>
                  </div>
                )}
                <span className="py-cursor mt-2" />
              </div>
            ) : (
              <div className="py-placeholder">
                <span>$ python3 main.py</span>
                <span className="py-cursor" />
              </div>
            )}
          </div>

          {/* Ada Cyber-Bot Diagnostic Panel */}
          <AnimatePresence>
            {diagnostic && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-diagnostic"
              >
                <div className="py-diagnostic-head">
                  <AlertTriangle size={15} />
                  <span>{diagnostic.title}</span>
                </div>
                <p className="py-diagnostic-hint">{diagnostic.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback pill */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.message}
                className={`py-fb ${feedback.type === "success" ? "ok" : "bad"}`}
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

      {/* Control Buttons */}
      <div className="py-controls">
        <button
          className="bc-btn py-btn-run"
          onClick={runCode}
          disabled={isRunning || isScanning || !code.trim()}
        >
          <Play size={18} fill="#fff" /> RUN SCRIPT
        </button>
        <button
          className="bc-btn bc-reset"
          onClick={resetCode}
          disabled={isRunning || isScanning}
        >
          <RotateCcw size={18} strokeWidth={2.5} /> RESET
        </button>
      </div>
    </div>
  );
}
