import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, BookOpen, Sparkles, RotateCcw } from "lucide-react";
import { playCorrectChime, playWrongBoop, playCardClick } from "@/features/english/utils/soundEffects";
import { triggerConfetti } from "@/features/english/utils/confetti";

export default function FillInTheStory({ activity, onComplete, onExit }) {
  const [filled, setFilled] = useState(Array(activity.blanks.length).fill(null));
  const [usedWords, setUsedWords] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [activeBlank, setActiveBlank] = useState(0);

  const allFilled = filled.every(f => f !== null);

  const handleWordClick = (word) => {
    if (submitted) return;
    if (usedWords.includes(word)) return;
    playCardClick();

    const targetIdx = filled[activeBlank] === null
      ? activeBlank
      : filled.findIndex(f => f === null);

    if (targetIdx === -1) return;

    const newFilled = [...filled];
    newFilled[targetIdx] = word;
    setFilled(newFilled);
    setUsedWords(prev => [...prev, word]);

    const nextEmpty = newFilled.findIndex((f, i) => i > targetIdx && f === null);
    if (nextEmpty !== -1) setActiveBlank(nextEmpty);
    else {
      const anyEmpty = newFilled.findIndex(f => f === null);
      if (anyEmpty !== -1) setActiveBlank(anyEmpty);
    }
  };

  const handleBlankClick = (idx) => {
    if (submitted) return;
    playCardClick();
    if (filled[idx] !== null) {
      const word = filled[idx];
      const newFilled = [...filled];
      newFilled[idx] = null;
      setFilled(newFilled);
      setUsedWords(prev => prev.filter(w => w !== word));
      setActiveBlank(idx);
    } else {
      setActiveBlank(idx);
    }
  };

  const handleReset = () => {
    if (submitted) return;
    playCardClick();
    setFilled(Array(activity.blanks.length).fill(null));
    setUsedWords([]);
    setActiveBlank(0);
  };

  const handleSubmit = () => {
    if (!allFilled) return;
    setSubmitted(true);
    const correctCount = filled.filter((word, i) => word === activity.blanks[i].correctWord).length;
    if (correctCount === activity.blanks.length) {
      playCorrectChime();
      triggerConfetti();
    } else {
      playWrongBoop();
    }
  };

  const handleFinish = () => {
    const correct = filled.filter((word, i) => word === activity.blanks[i].correctWord).length;
    const pct = Math.round((correct / activity.blanks.length) * 100);
    let stars = 1;
    if (pct >= 80) stars = 3;
    else if (pct >= 50) stars = 2;
    onComplete({
      correct,
      score: pct,
      points: pct * 2,
      stars,
      bestStreak: 0,
    });
  };

  const filledCount = filled.filter(f => f !== null).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "linear-gradient(145deg, #180d04 0%, #291505 50%, #150b03 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(24, 13, 4, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Exit
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>✍️</span>
            <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.01em" }}>
              {activity.title}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Fill in the Story
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
            padding: "6px 14px",
            borderRadius: 20,
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.05em",
            boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
          }}
        >
          {filledCount} / {activity.blanks.length} Filled
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 24px 32px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 820,
          width: "100%",
          margin: "0 auto",
          gap: 20,
        }}
      >
        {/* Story Book Card */}
        <div
          style={{
            background: "linear-gradient(160deg, #2a1608 0%, #1c0e04 100%)",
            border: "1.5px solid rgba(245,158,11,0.35)",
            borderRadius: 28,
            padding: "32px 36px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen style={{ width: 20, height: 20, color: "#f59e0b" }} />
              <span style={{ color: "#fcd34d", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Interactive Story
              </span>
            </div>
            {!submitted && filledCount > 0 && (
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RotateCcw style={{ width: 14, height: 14 }} />
                Reset Blanks
              </button>
            )}
          </div>

          {/* Story Narrative Text with Interactive Blanks */}
          <div
            style={{
              fontSize: "1.2rem",
              lineHeight: 2.2,
              fontWeight: 600,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {activity.story.map((part, i) => {
              if (part.type === "text") {
                return <span key={i}>{part.text}</span>;
              } else {
                const blankIdx = part.blankIndex;
                const word = filled[blankIdx];
                const isActive = !submitted && activeBlank === blankIdx;
                const isCorrect = submitted && word === activity.blanks[blankIdx].correctWord;
                const isWrong = submitted && word !== activity.blanks[blankIdx].correctWord;

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleBlankClick(blankIdx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      minWidth: 100,
                      height: 40,
                      padding: "0 16px",
                      margin: "0 6px",
                      verticalAlign: "middle",
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: submitted ? "default" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      boxShadow: isCorrect
                        ? "0 4px 16px rgba(16,185,129,0.4)"
                        : isWrong
                        ? "0 4px 16px rgba(239,68,68,0.4)"
                        : word
                        ? "0 4px 14px rgba(245,158,11,0.3)"
                        : isActive
                        ? "0 0 16px rgba(245,158,11,0.5)"
                        : "none",
                      background: isCorrect
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : isWrong
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : word
                        ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                        : isActive
                        ? "rgba(245,158,11,0.18)"
                        : "rgba(255,255,255,0.08)",
                      border: isCorrect
                        ? "2px solid #34d399"
                        : isWrong
                        ? "2px solid #f87171"
                        : word
                        ? "2px solid #fcd34d"
                        : isActive
                        ? "2px dashed #f59e0b"
                        : "2px dashed rgba(255,255,255,0.25)",
                      color: isCorrect || isWrong || word ? "#fff" : isActive ? "#fcd34d" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <span>{word || `( Blank ${blankIdx + 1} )`}</span>
                    {isCorrect && <CheckCircle2 style={{ width: 16, height: 16 }} />}
                    {isWrong && <XCircle style={{ width: 16, height: 16 }} />}
                  </motion.button>
                );
              }
            })}
          </div>
        </div>

        {/* Post-Submit Detailed Breakdown */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 22,
              padding: "20px 24px",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ color: "#fcd34d", fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
              Answers Review:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {activity.blanks.map((b, i) => {
                const isRight = filled[i] === b.correctWord;
                return (
                  <div
                    key={i}
                    style={{
                      background: isRight ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      border: `1px solid ${isRight ? "#10b981" : "#ef4444"}`,
                      borderRadius: 14,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {isRight ? (
                      <CheckCircle2 style={{ width: 20, height: 20, color: "#34d399", flexShrink: 0 }} />
                    ) : (
                      <XCircle style={{ width: 20, height: 20, color: "#f87171", flexShrink: 0 }} />
                    )}
                    <div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                        Blank {i + 1}:
                      </span>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isRight ? "#6ee7b7" : "#fca5a5" }}>
                        {b.correctWord}
                        {!isRight && <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 12, marginLeft: 6 }}>(You: {filled[i]})</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Word Bank Area */}
        {!submitted && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 24,
              padding: "20px 24px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles style={{ width: 18, height: 18, color: "#f59e0b" }} />
                <span style={{ color: "#fcd34d", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Word Bank — Tap to Insert into Blank {activeBlank + 1}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {activity.wordBank.map((word, i) => {
                const isUsed = usedWords.includes(word);
                return (
                  <motion.button
                    key={i}
                    whileHover={!isUsed ? { scale: 1.08, y: -3 } : {}}
                    whileTap={!isUsed ? { scale: 0.94, y: 3 } : {}}
                    onClick={() => handleWordClick(word)}
                    disabled={isUsed}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      cursor: isUsed ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      background: isUsed
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
                      color: isUsed ? "rgba(255,255,255,0.25)" : "#78350f",
                      border: isUsed ? "1px dashed rgba(255,255,255,0.1)" : "2px solid #fde68a",
                      borderBottom: isUsed ? "1px dashed rgba(255,255,255,0.1)" : "4px solid #d97706",
                      textDecoration: isUsed ? "line-through" : "none",
                      boxShadow: isUsed ? "none" : "0 8px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        style={{
          background: "rgba(18, 10, 3, 0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(245,158,11,0.2)",
          padding: "18px 24px 22px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
          {!submitted ? (
            <motion.button
              whileHover={allFilled ? { scale: 1.02 } : {}}
              whileTap={allFilled ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={!allFilled}
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: 20,
                border: "none",
                fontWeight: 900,
                fontSize: "1.15rem",
                fontFamily: "inherit",
                cursor: allFilled ? "pointer" : "not-allowed",
                background: allFilled
                  ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
                  : "rgba(255,255,255,0.1)",
                color: allFilled ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow: allFilled ? "0 10px 30px rgba(245,158,11,0.4)" : "none",
                transition: "all 0.2s",
              }}
            >
              {allFilled
                ? "✨ Check My Story Answers!"
                : `Fill in ${activity.blanks.length - filledCount} more blank${activity.blanks.length - filledCount !== 1 ? "s" : ""} to check`}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinish}
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: 20,
                border: "none",
                fontWeight: 900,
                fontSize: "1.15rem",
                fontFamily: "inherit",
                cursor: "pointer",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(16,185,129,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Continue to Results
              <ChevronRight style={{ width: 20, height: 20 }} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
