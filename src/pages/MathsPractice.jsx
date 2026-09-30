import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, RotateCcw } from "lucide-react";

/* ─── PROBLEM BANK ─── */
const PROBLEM_BANK = {
  addition: {
    name: "Addition", icon: "➕", color: "#10B981",
    problems: [
      { question: "What is 23 + 45?", options: ["58", "68", "78", "67"], correct: 1, explanation: "23 + 45 = 68. Add the ones (3+5=8) then the tens (2+4=6)." },
      { question: "What is 156 + 234?", options: ["380", "390", "400", "370"], correct: 1, explanation: "156 + 234 = 390. Add column by column from right to left." },
      { question: "What is 47 + 38?", options: ["75", "85", "95", "65"], correct: 1, explanation: "47 + 38 = 85. 7+8=15, carry 1. 4+3+1=8." },
      { question: "What is 99 + 1?", options: ["99", "101", "100", "110"], correct: 2, explanation: "99 + 1 = 100. When we add 1 to 99, we get a new hundred!" },
      { question: "What is 250 + 750?", options: ["900", "950", "1000", "1050"], correct: 2, explanation: "250 + 750 = 1000. 250 + 750 = 1000, a perfect thousand!" },
    ],
  },
  subtraction: {
    name: "Subtraction", icon: "➖", color: "#3B82F6",
    problems: [
      { question: "What is 87 − 34?", options: ["43", "53", "63", "47"], correct: 1, explanation: "87 − 34 = 53. Subtract ones (7-4=3) then tens (8-3=5)." },
      { question: "What is 100 − 45?", options: ["55", "65", "45", "50"], correct: 0, explanation: "100 − 45 = 55. Borrow from the hundreds place." },
      { question: "What is 200 − 88?", options: ["102", "122", "112", "108"], correct: 2, explanation: "200 − 88 = 112. Borrow and subtract carefully." },
      { question: "What is 500 − 123?", options: ["377", "387", "367", "397"], correct: 0, explanation: "500 − 123 = 377. Subtract each column with borrowing." },
      { question: "What is 1000 − 1?", options: ["998", "999", "990", "909"], correct: 1, explanation: "1000 − 1 = 999. Just one less than a thousand!" },
    ],
  },
  multiplication: {
    name: "Multiplication", icon: "✕", color: "#F59E0B",
    problems: [
      { question: "What is 6 × 7?", options: ["36", "42", "48", "35"], correct: 1, explanation: "6 × 7 = 42. Think of it as 6 groups of 7." },
      { question: "What is 8 × 9?", options: ["63", "72", "81", "64"], correct: 1, explanation: "8 × 9 = 72. A classic times table fact!" },
      { question: "What is 12 × 5?", options: ["50", "55", "60", "65"], correct: 2, explanation: "12 × 5 = 60. 10×5=50, plus 2×5=10, equals 60." },
      { question: "What is 7 × 7?", options: ["42", "47", "49", "56"], correct: 2, explanation: "7 × 7 = 49. A perfect square!" },
      { question: "What is 11 × 11?", options: ["111", "121", "110", "122"], correct: 1, explanation: "11 × 11 = 121. Another perfect square!" },
    ],
  },
  division: {
    name: "Division", icon: "➗", color: "#EF4444",
    problems: [
      { question: "What is 48 ÷ 8?", options: ["5", "6", "7", "8"], correct: 1, explanation: "48 ÷ 8 = 6. Because 8 × 6 = 48." },
      { question: "What is 63 ÷ 9?", options: ["6", "7", "8", "9"], correct: 1, explanation: "63 ÷ 9 = 7. Because 9 × 7 = 63." },
      { question: "What is 100 ÷ 4?", options: ["20", "25", "30", "50"], correct: 1, explanation: "100 ÷ 4 = 25. Four quarters make a hundred." },
      { question: "What is 72 ÷ 8?", options: ["7", "8", "9", "10"], correct: 2, explanation: "72 ÷ 8 = 9. Because 8 × 9 = 72." },
      { question: "What is 56 ÷ 7?", options: ["6", "7", "8", "9"], correct: 2, explanation: "56 ÷ 7 = 8. Because 7 × 8 = 56." },
    ],
  },
  fractions: {
    name: "Fractions", icon: "🍕", color: "#8B5CF6",
    problems: [
      { question: "What is 1/2 + 1/4?", options: ["2/6", "3/4", "1/3", "2/4"], correct: 1, explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4. Convert to same denominator first!" },
      { question: "What is 3/4 − 1/4?", options: ["1/2", "2/4", "1/4", "3/8"], correct: 0, explanation: "3/4 − 1/4 = 2/4 = 1/2. Same denominators make it easy!" },
      { question: "Which is bigger: 2/3 or 3/5?", options: ["2/3", "3/5", "They are equal", "Can't tell"], correct: 0, explanation: "2/3 ≈ 0.667 and 3/5 = 0.6, so 2/3 is bigger." },
      { question: "What is 1/3 of 12?", options: ["3", "4", "6", "2"], correct: 1, explanation: "1/3 of 12 = 12 ÷ 3 = 4." },
      { question: "Simplify 4/8", options: ["1/4", "2/4", "1/2", "2/8"], correct: 2, explanation: "4/8 = 1/2. Divide both by 4!" },
    ],
  },
  geometry: {
    name: "Geometry", icon: "📐", color: "#EC4899",
    problems: [
      { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1, explanation: "A hexagon has 6 sides. 'Hex' means six!" },
      { question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correct: 1, explanation: "The angles in any triangle always add up to 180°." },
      { question: "How many right angles in a rectangle?", options: ["2", "3", "4", "1"], correct: 2, explanation: "A rectangle has 4 right angles (90° each)." },
      { question: "What shape has no corners?", options: ["Triangle", "Square", "Circle", "Pentagon"], correct: 2, explanation: "A circle has no corners or vertices — it's perfectly round!" },
      { question: "How many faces does a cube have?", options: ["4", "6", "8", "12"], correct: 1, explanation: "A cube has 6 square faces." },
    ],
  },
  area: {
    name: "Area & Perimeter", icon: "📏", color: "#14B8A6",
    problems: [
      { question: "Area of a rectangle: length 5, width 3?", options: ["8", "15", "16", "12"], correct: 1, explanation: "Area = length × width = 5 × 3 = 15 square units." },
      { question: "Perimeter of a square with side 4?", options: ["8", "12", "16", "20"], correct: 2, explanation: "Perimeter = 4 × side = 4 × 4 = 16 units." },
      { question: "Area of a square with side 7?", options: ["28", "49", "14", "21"], correct: 1, explanation: "Area = side × side = 7 × 7 = 49 square units." },
      { question: "Perimeter of rectangle: length 8, width 5?", options: ["26", "40", "13", "30"], correct: 0, explanation: "Perimeter = 2 × (length + width) = 2 × 13 = 26 units." },
      { question: "A garden is 10m by 6m. What's its area?", options: ["32 m²", "60 m²", "16 m²", "80 m²"], correct: 1, explanation: "Area = 10 × 6 = 60 square metres." },
    ],
  },
  decimals: {
    name: "Decimals", icon: "🔢", color: "#6366F1",
    problems: [
      { question: "What is 0.5 + 0.3?", options: ["0.2", "0.8", "0.53", "1.0"], correct: 1, explanation: "0.5 + 0.3 = 0.8. Add the tenths: 5 + 3 = 8 tenths." },
      { question: "What is 1.5 × 2?", options: ["2.5", "3.0", "2.0", "3.5"], correct: 1, explanation: "1.5 × 2 = 3.0. Double 1.5!" },
      { question: "Which is smaller: 0.45 or 0.5?", options: ["0.45", "0.5", "They are equal", "Can't tell"], correct: 0, explanation: "0.45 < 0.5. Compare: 0.45 = 45 hundredths, 0.5 = 50 hundredths." },
      { question: "Convert 3/4 to a decimal", options: ["0.25", "0.5", "0.75", "0.34"], correct: 2, explanation: "3/4 = 0.75. Divide 3 by 4!" },
      { question: "What is 2.7 − 1.3?", options: ["1.4", "1.3", "1.5", "1.0"], correct: 0, explanation: "2.7 − 1.3 = 1.4. Subtract tenths then ones." },
    ],
  },
  algebra: {
    name: "Basic Algebra", icon: "🔤", color: "#DC2626",
    problems: [
      { question: "If x + 5 = 12, what is x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "x + 5 = 12, so x = 12 − 5 = 7." },
      { question: "If 3x = 21, what is x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "3x = 21, so x = 21 ÷ 3 = 7." },
      { question: "If x − 8 = 15, what is x?", options: ["7", "23", "20", "13"], correct: 1, explanation: "x − 8 = 15, so x = 15 + 8 = 23." },
      { question: "If x/4 = 5, what is x?", options: ["1", "9", "20", "25"], correct: 2, explanation: "x/4 = 5, so x = 5 × 4 = 20." },
      { question: "If 2x + 3 = 11, what is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "2x + 3 = 11 → 2x = 8 → x = 4." },
    ],
  },
};

/* ─── RESULTS SCREEN ─── */
function ResultsScreen({ score, total, topicColor, onRetry }) {
  const pct = (score / total) * 100;
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;

  const messages = {
    3: "🎉 Excellent! You're a math champion!",
    2: "👍 Good job! Keep practicing!",
    1: "💪 Nice try! You can do better!",
    0: "🤔 Don't give up! Try again!",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: "48px 36px",
        maxWidth: 420,
        margin: "0 auto",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>
        {stars === 3 ? "🏆" : stars === 2 ? "🎯" : "📚"}
      </div>

      <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 16px" }}>
        Quiz Complete!
      </h2>

      {/* Stars */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: s * 0.2, type: "spring" }}
          >
            <Star
              style={{
                width: 44,
                height: 44,
                color: s <= stars ? "#FFD700" : "rgba(255,255,255,0.15)",
                fill: s <= stars ? "#FFD700" : "none",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Score */}
      <div style={{ fontSize: "2.5rem", fontWeight: 800, color: topicColor, marginBottom: 8 }}>
        {score}/{total}
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", marginBottom: 28 }}>
        {messages[stars]}
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 14,
            background: topicColor, color: "#fff",
            fontWeight: 700, fontSize: "0.95rem",
            border: "none", cursor: "pointer",
          }}
        >
          <RotateCcw style={{ width: 16, height: 16 }} /> Try Again
        </motion.button>
        <Link
          to="/world/school/maths/problems"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 14,
            background: "rgba(255,255,255,0.15)", color: "#fff",
            fontWeight: 700, fontSize: "0.95rem",
            textDecoration: "none",
          }}
        >
          Back to Topics
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function MathsPractice() {
  const { topicId } = useParams();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  const topic = PROBLEM_BANK[topicId];

  // Timer
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  if (!topic) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🤔</div>
          <h2>Topic not found</h2>
          <Link to="/world/school/maths/problems" style={{ color: "#3B82F6", marginTop: 12, display: "block" }}>← Back to Topics</Link>
        </div>
      </div>
    );
  }

  const problems = topic.problems;
  const totalQ = problems.length;
  const problem = problems[currentQ];
  const progress = ((currentQ + 1) / totalQ) * 100;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === problem.correct) {
      setScore((s) => s + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
    setTimer(0);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/school/maths/problems"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Back
        </Link>
      </div>

      {/* Header with score & timer */}
      <div style={{ paddingTop: 24, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "1.5rem" }}>{topic.icon}</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem" }}>{topic.name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          <span>Score: <span style={{ color: topic.color, fontWeight: 700 }}>{score}/{totalQ}</span></span>
          <span>⏱ {minutes}:{seconds.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* Progress bar */}
      {!finished && (
        <div style={{ maxWidth: 600, margin: "16px auto 0", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 6 }}>
            <span>Question {currentQ + 1} of {totalQ}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", background: topic.color, borderRadius: 10 }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "30px 24px 60px" }}>
        {finished ? (
          <ResultsScreen score={score} total={totalQ} topicColor={topic.color} onRetry={handleRetry} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "32px 28px",
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: topic.color, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Question {currentQ + 1}
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.4 }}>
                  {problem.question}
                </h2>
              </div>

              {/* Options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {problem.options.map((option, idx) => {
                  let bg = "rgba(255,255,255,0.07)";
                  let border = "1px solid rgba(255,255,255,0.1)";
                  let extraStyle = {};

                  if (showResult) {
                    if (idx === problem.correct) {
                      bg = "rgba(16, 185, 129, 0.25)";
                      border = "2px solid #10B981";
                    } else if (idx === selected && idx !== problem.correct) {
                      bg = "rgba(239, 68, 68, 0.25)";
                      border = "2px solid #EF4444";
                    }
                  } else if (selected === idx) {
                    bg = `${topic.color}33`;
                    border = `2px solid ${topic.color}`;
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!showResult ? { scale: 1.03 } : {}}
                      whileTap={!showResult ? { scale: 0.97 } : {}}
                      onClick={() => handleSelect(idx)}
                      style={{
                        background: bg,
                        border,
                        borderRadius: 14,
                        padding: "18px 16px",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: showResult ? "default" : "pointer",
                        textAlign: "center",
                        ...extraStyle,
                      }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginRight: 8 }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: 20,
                      padding: "20px 24px",
                      borderRadius: 16,
                      background: selected === problem.correct
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                      border: `1px solid ${selected === problem.correct ? "#10B981" : "#EF4444"}`,
                    }}
                  >
                    <div style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: selected === problem.correct ? "#10B981" : "#EF4444",
                      marginBottom: 8,
                    }}>
                      {selected === problem.correct ? "✅ Correct! 🎉" : "❌ Not quite!"}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {problem.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: "center", marginTop: 24 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    style={{
                      padding: "14px 36px",
                      borderRadius: 14,
                      background: topic.color,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: `0 6px 20px ${topic.color}66`,
                    }}
                  >
                    {currentQ < totalQ - 1 ? "Next Question →" : "See Results →"}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
