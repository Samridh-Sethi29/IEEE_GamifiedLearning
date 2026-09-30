import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Clock, Star, Coins, Zap } from "lucide-react";

const TOTAL_STONES = 10;
const TIME_LIMIT = 60; // Increased slightly to accommodate dynamic difficulty

const STONE_POSITIONS = [
  { x: 92, y: 50 }, { x: 82, y: 35 }, { x: 72, y: 65 }, { x: 62, y: 35 },
  { x: 52, y: 65 }, { x: 42, y: 35 }, { x: 32, y: 65 }, { x: 22, y: 35 },
  { x: 12, y: 65 }, { x: 0, y: 50 }, // Finish
];

// Helper to generate a single problem based on difficulty level (1, 2, or 3)
function generateSingleProblem(topicId, level) {
  let op, a, b, answer;
  
  if (topicId === "addition") {
    op = "+";
    if (level === 1) { a = rand(1, 10); b = rand(1, 10); }
    else if (level === 2) { a = rand(10, 30); b = rand(10, 30); }
    else { a = rand(30, 100); b = rand(20, 100); }
    answer = a + b;
  } else if (topicId === "subtraction") {
    op = "-";
    if (level === 1) { a = rand(5, 20); b = rand(1, a - 1 || 1); }
    else if (level === 2) { a = rand(20, 50); b = rand(10, a - 1); }
    else { a = rand(50, 100); b = rand(20, a - 1); }
    answer = a - b;
  } else if (topicId === "multiplication") {
    op = "✕";
    if (level === 1) { a = rand(2, 5); b = rand(2, 5); }
    else if (level === 2) { a = rand(2, 9); b = rand(2, 9); }
    else { a = rand(5, 12); b = rand(5, 12); }
    answer = a * b;
  } else {
    // Division
    op = "➗";
    if (level === 1) { b = rand(2, 5); answer = rand(2, 5); }
    else if (level === 2) { b = rand(2, 9); answer = rand(2, 9); }
    else { b = rand(4, 12); answer = rand(4, 12); }
    a = b * answer;
  }
  
  return { question: `${a} ${op} ${b}`, answer: answer.toString(), a, b, op };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHintMsg(prob) {
  const { a, b, op } = prob;
  if (op === "+") return `Hint: Try adding the tens first, then the ones!`;
  if (op === "-") return `Hint: Think of it as ${b} + ? = ${a}`;
  if (op === "✕") return `Hint: What is ${a} times ${b}? Maybe count by ${a}s!`;
  if (op === "➗") return `Hint: What number times ${b} equals ${a}?`;
  return "You can do this! Take your time.";
}

const TeacherFace = () => (
  <svg viewBox="0 0 100 100" width="50" height="50" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}>
    <circle cx="50" cy="50" r="45" fill="#F5C5A3" />
    <path d="M20 30 Q50 10 80 30 Q90 60 80 80 Q50 95 20 80 Q10 60 20 30Z" fill="#3D2314" />
    <circle cx="35" cy="55" r="14" fill="none" stroke="#8B7355" strokeWidth="3" />
    <circle cx="65" cy="55" r="14" fill="none" stroke="#8B7355" strokeWidth="3" />
    <line x1="49" y1="55" x2="51" y2="55" stroke="#8B7355" strokeWidth="3" />
    <circle cx="35" cy="55" r="4" fill="#2D1B0E" />
    <circle cx="65" cy="55" r="4" fill="#2D1B0E" />
    <path d="M40 75 Q50 85 60 75" stroke="#D4636A" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

export default function MathsRiverGame() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  // Game state
  const [currentStone, setCurrentStone] = useState(0);
  const [problems, setProblems] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [splashes, setSplashes] = useState([]);
  const inputRef = useRef(null);

  // Adaptive Learning State
  const [difficulty, setDifficulty] = useState(1);
  const [fastStreak, setFastStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stoneStartTime, setStoneStartTime] = useState(Date.now());
  const [hint, setHint] = useState(null);
  
  const regenerateFrom = (startIndex, newLevel) => {
    setProblems((prev) => {
      const next = [...prev];
      for (let i = startIndex; i < TOTAL_STONES - 1; i++) {
        let actTopic = topicId;
        if (topicId === "mixed") {
          const t = ["addition", "subtraction", "multiplication", "division"];
          actTopic = t[i % 4];
        }
        next[i] = generateSingleProblem(actTopic, newLevel);
      }
      return next;
    });
  };

  // Initialize
  useEffect(() => {
    const initialProbs = [];
    for (let i = 0; i < TOTAL_STONES - 1; i++) {
      let actTopic = topicId;
      if (topicId === "mixed") actTopic = ["addition", "subtraction", "multiplication", "division"][i % 4];
      initialProbs.push(generateSingleProblem(actTopic, 1));
    }
    setProblems(initialProbs);
  }, [topicId]);

  // Main Timer
  useEffect(() => {
    if (gameOver || currentStone >= TOTAL_STONES - 1) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, currentStone]);

  // Lifeline Hint Timer (Stuck for 8 seconds)
  useEffect(() => {
    if (gameOver || currentStone >= TOTAL_STONES - 1) return;
    const lifeline = setTimeout(() => {
      const prob = problems[currentStone];
      if (prob) setHint(getHintMsg(prob));
    }, 8000);
    return () => clearTimeout(lifeline);
  }, [currentStone, problems, gameOver]);

  // Auto-focus
  useEffect(() => {
    if (inputRef.current && !gameOver && currentStone < TOTAL_STONES - 1) {
      inputRef.current.focus();
    }
  }, [currentStone, gameOver, hint]);

  const handleInputChange = (e) => {
    if (gameOver) return;
    const val = e.target.value;
    setInputVal(val);

    if (currentStone < TOTAL_STONES - 1) {
      const currentProb = problems[currentStone];
      
      if (val.trim() === currentProb.answer) {
        // CORRECT ANSWER
        const timeTaken = Date.now() - stoneStartTime;
        let newDiff = difficulty;

        // Dynamic Difficulty: Faster than 3 seconds?
        if (timeTaken <= 3000) {
          const newStreak = fastStreak + 1;
          if (newStreak >= 3 && difficulty < 3) {
            newDiff = difficulty + 1;
            setDifficulty(newDiff);
            setHint("You're fast! Increasing difficulty! 🚀");
            setFastStreak(0);
          } else {
            setFastStreak(newStreak);
          }
        } else {
          setFastStreak(0);
        }

        if (newDiff !== difficulty) {
          regenerateFrom(currentStone + 1, newDiff);
        }

        // Proceed to next stone
        setMistakes(0);
        setStoneStartTime(Date.now());
        if (newDiff === difficulty) setHint(null); // Keep the level up hint if it exists
        
        const splashPos = STONE_POSITIONS[currentStone];
        setSplashes((s) => [...s, { id: Date.now(), ...splashPos }]);
        setCurrentStone((prev) => prev + 1);
        setInputVal("");

      } else if (val.length >= currentProb.answer.length && val !== currentProb.answer) {
        // INCORRECT ANSWER
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setTimeout(() => setInputVal(""), 600);

        const newMistakes = mistakes + 1;
        if (newMistakes >= 3) {
          let newDiff = difficulty;
          if (difficulty > 1) {
            newDiff = difficulty - 1;
            setDifficulty(newDiff);
            setHint("Let's try easier numbers! 😊");
          } else {
            setHint(getHintMsg(currentProb)); // Stuck on easy, just give hint
          }
          setMistakes(0);

          if (newDiff !== difficulty) {
            regenerateFrom(currentStone, newDiff);
            setInputVal(""); // clear input for the new easier problem
            setStoneStartTime(Date.now());
          }
        } else {
          setMistakes(newMistakes);
        }
      }
    }
  };

  const handleRestart = () => {
    setDifficulty(1);
    regenerateFrom(0, 1);
    setCurrentStone(0);
    setInputVal("");
    setTimeLeft(TIME_LIMIT);
    setGameOver(false);
    setSplashes([]);
    setFastStreak(0);
    setMistakes(0);
    setHint(null);
    setStoneStartTime(Date.now());
  };

  const isFinished = currentStone >= TOTAL_STONES - 1;
  const currentPos = STONE_POSITIONS[currentStone];
  const timeProgress = (timeLeft / TIME_LIMIT) * 100;
  const isTimeLow = timeLeft <= 15 && !isFinished && !gameOver;

  const totalTimeTaken = TIME_LIMIT - timeLeft;
  let stars = 0, coins = 0;
  if (isFinished) {
    if (totalTimeTaken <= 20) { stars = 3; coins = 50; }
    else if (totalTimeTaken <= 35) { stars = 2; coins = 30; }
    else { stars = 1; coins = 10; }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Animated waves */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.2, pointerEvents: "none" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i} animate={{ y: ["-10px", "10px", "-10px"] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: `${5 + i * 8}%`, left: "-10%", right: "-10%",
              height: "4px", background: "#fff", borderRadius: "50%", filter: "blur(4px)",
            }}
          />
        ))}
      </div>

      {/* Left Bank */}
      <div
        style={{
          position: "absolute", top: 0, bottom: 0, left: -50, width: 120,
          background: "#166534", borderRight: "8px solid #3f6212",
          borderTopRightRadius: "50% 20px", borderBottomRightRadius: "50% 20px", zIndex: 1,
        }}
      />

      {/* Header UI */}
      <div style={{ position: "fixed", top: 16, left: 16, right: 16, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Link
          to="/world/school/maths/games/river"
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            borderRadius: 14, border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} /> Quit
        </Link>

        {/* Dynamic Difficulty Indicator */}
        {!isFinished && !gameOver && (
          <div style={{ 
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            padding: "8px 16px", borderRadius: 20, color: "#fde047", fontWeight: 800,
            border: "1px solid rgba(255,255,255,0.3)",
          }}>
            <Zap size={16} fill="#fde047" /> Level {difficulty}
          </div>
        )}

        <div style={{ 
          background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
          padding: "12px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.3)",
          width: 180, display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: isTimeLow ? "#f87171" : "#fff", fontWeight: 800, fontSize: "1.2rem", marginBottom: 6 }}>
            <Clock size={18} /> 
            <motion.span animate={isTimeLow ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
              {timeLeft}s
            </motion.span>
          </div>
          <div style={{ width: "100%", height: 8, background: "rgba(0,0,0,0.3)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${timeProgress}%` }}
              style={{ height: "100%", background: isTimeLow ? "#ef4444" : "#4ade80", borderRadius: 4 }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </div>
      </div>

      {/* Adaptive Lifeline Hint */}
      <AnimatePresence>
        {hint && !isFinished && !gameOver && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            style={{
              position: "fixed", bottom: 160, right: 24, zIndex: 45,
              display: "flex", alignItems: "flex-end", gap: 12
            }}
          >
            <div style={{
              background: "#fff", padding: "12px 18px", borderRadius: 20,
              borderBottomRightRadius: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              maxWidth: 240, color: "#1e293b", fontWeight: 600, fontSize: "0.95rem",
              lineHeight: 1.4
            }}>
              {hint}
            </div>
            <TeacherFace />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      <div style={{ position: "relative", width: "100%", maxWidth: 1000, height: "100%", margin: "0 auto" }}>
        
        {splashes.map((splash) => (
          <motion.div
            key={splash.id}
            initial={{ opacity: 1, scale: 0 }} animate={{ opacity: 0, scale: 2 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute", left: `${splash.x}%`, top: `${splash.y}%`,
              transform: "translate(-50%, -50%)", fontSize: "3rem", zIndex: 15, pointerEvents: "none"
            }}
          >💦</motion.div>
        ))}

        {STONE_POSITIONS.map((pos, idx) => {
          const isActive = idx === currentStone;
          const isPassed = idx < currentStone;
          const isFinish = idx === TOTAL_STONES - 1;
          if (isFinish) return null;

          return (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.1 }}
              style={{
                position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`,
                transform: "translate(-50%, -50%)", width: 90, height: 60,
                borderRadius: "50%", background: isActive ? "#cbd5e1" : isPassed ? "#64748b" : "#94a3b8",
                boxShadow: "inset -5px -10px 15px rgba(0,0,0,0.3), 0 10px 15px rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: isActive ? "4px solid #fde047" : "none", zIndex: 10,
              }}
            >
              {problems[idx] && !isPassed && (
                <div style={{ color: isActive ? "#0f172a" : "#334155", fontWeight: 800, fontSize: "1.2rem", textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}>
                  {problems[idx].question}
                </div>
              )}
              {isPassed && <div style={{ color: "#22c55e", fontSize: "1.8rem" }}>✓</div>}
            </motion.div>
          );
        })}

        {!gameOver && (
          <motion.div
            animate={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            style={{
              position: "absolute", transform: "translate(-50%, -80%)",
              fontSize: "4rem", zIndex: 20, filter: "drop-shadow(0 10px 5px rgba(0,0,0,0.3))",
            }}
          >
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ transform: "scaleX(-1)" }}>
              🐸
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <AnimatePresence>
        {!isFinished && !gameOver && (
          <motion.div
            initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, padding: "30px 20px",
              background: "linear-gradient(0deg, rgba(2,132,199,1) 0%, rgba(2,132,199,0) 100%)",
              display: "flex", flexDirection: "column", alignItems: "center", zIndex: 30,
            }}
          >
            <div style={{
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
              padding: "20px 32px", borderRadius: 24, border: "2px solid rgba(255,255,255,0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)", textAlign: "center",
            }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem", marginBottom: 12 }}>
                Solve to Jump: <span style={{ color: "#fde047", fontSize: "1.5rem" }}>{problems[currentStone]?.question}</span>
              </div>
              <motion.input
                ref={inputRef} type="number" value={inputVal} onChange={handleInputChange}
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}
                placeholder="Type answer..."
                style={{
                  width: "100%", maxWidth: 220, padding: "14px 20px", fontSize: "1.6rem",
                  fontWeight: 800, textAlign: "center", borderRadius: 16,
                  border: shake ? "4px solid #ef4444" : "4px solid #fff", outline: "none",
                  background: shake ? "#fee2e2" : "#fff", color: "#1e293b",
                  boxShadow: "inset 0 4px 6px rgba(0,0,0,0.1)"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/GameOver Modal */}
      <AnimatePresence>
        {(isFinished || gameOver) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", zIndex: 50,
            }}
          >
            <div style={{ background: "#fff", padding: "40px 50px", borderRadius: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", maxWidth: 420, width: "90%" }}>
              {isFinished ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
                    {[1, 2, 3].map((s) => (
                      <motion.div key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: s * 0.2, type: "spring" }}>
                        <Star size={52} style={{ color: s <= stars ? "#FFD700" : "#e2e8f0", fill: s <= stars ? "#FFD700" : "#e2e8f0", filter: s <= stars ? "drop-shadow(0 4px 6px rgba(250, 204, 21, 0.4))" : "none" }} />
                      </motion.div>
                    ))}
                  </div>
                  <h2 style={{ fontSize: "2.2rem", color: "#166534", margin: "0 0 8px 0", fontWeight: 800 }}>Victory!</h2>
                  <p style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 20px 0", fontWeight: 500 }}>
                    You crossed the river in <span style={{ color: "#0ea5e9", fontWeight: 700 }}>{totalTimeTaken} seconds</span>!
                  </p>
                  <div style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: 16, padding: "16px", marginBottom: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <Coins size={28} color="#eab308" />
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#334155" }}>Earned <span style={{ color: "#eab308" }}>{coins} Coins</span></span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "4rem", marginBottom: 10 }}>💦😢🕰️</div>
                  <h2 style={{ fontSize: "2rem", color: "#b91c1c", margin: "0 0 10px 0", fontWeight: 800 }}>Time's Up!</h2>
                  <p style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 30px 0" }}>The frog fell in the water. You need to be faster!</p>
                </>
              )}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRestart} style={{ padding: "14px 24px", borderRadius: 16, background: isFinished ? "#10b981" : "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 6px 20px ${isFinished ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}` }}>
                  <RotateCcw size={18} /> Play Again
                </motion.button>
                <Link to="/world/school/maths/games/river" style={{ padding: "14px 24px", borderRadius: 16, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: "1rem", textDecoration: "none", border: "2px solid #e2e8f0", display: "flex", alignItems: "center" }}>
                  Change Topic
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
