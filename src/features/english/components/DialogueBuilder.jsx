import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ChevronRight, ArrowLeft, Sparkles, Flame, Heart } from "lucide-react";
import { playCorrectChime, playWrongBoop, playCardClick } from "@/features/english/utils/soundEffects";
import { triggerConfetti } from "@/features/english/utils/confetti";

export default function DialogueBuilder({ activity, onComplete, onExit }) {
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState([]); // { role, text, correct }
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const currentStep = activity.steps[step];

  const handleSelect = (optIdx) => {
    if (feedback !== null) return;
    playCardClick();
    const opt = currentStep.options[optIdx];
    setSelectedOption(optIdx);
    const isCorrect = optIdx === currentStep.correctOption;
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      playCorrectChime();
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      playWrongBoop();
      setStreak(0);
    }
  };

  const handleNext = () => {
    playCardClick();
    const opt = currentStep.options[selectedOption];
    setHistory(prev => [
      ...prev,
      { role: "npc", text: currentStep.npcSays },
      { role: "player", text: opt.text, correct: selectedOption === currentStep.correctOption }
    ]);
    setSelectedOption(null);
    setFeedback(null);
    setHoveredIdx(null);

    if (step + 1 >= activity.steps.length) {
      const finalScore = score + (selectedOption === currentStep.correctOption ? 1 : 0);
      const pct = Math.round((finalScore / activity.steps.length) * 100);
      let stars = 1;
      if (pct >= 80) {
        stars = 3;
        triggerConfetti();
      } else if (pct >= 50) {
        stars = 2;
      }
      onComplete({
        correct: finalScore,
        score: pct,
        points: pct * 2,
        stars,
        bestStreak: Math.max(bestStreak, streak),
      });
    } else {
      setStep(s => s + 1);
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  // Dynamic Avatar Reaction based on game state
  const npcEmoji =
    feedback === "correct"
      ? "🤩"
      : feedback === "incorrect"
      ? "😮"
      : hoveredIdx !== null
      ? "🤔"
      : "🧑‍🏫";

  const npcMoodText =
    feedback === "correct"
      ? "Delighted!"
      : feedback === "incorrect"
      ? "Surprised"
      : hoveredIdx !== null
      ? "Listening..."
      : "Speaking";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "linear-gradient(145deg, #0b092b 0%, #17124a 50%, #0d1538 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Top Navigation Bar with Interactive HUD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(11, 9, 43, 0.75)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
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
            <span style={{ fontSize: "1.2rem" }}>💬</span>
            <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.01em" }}>
              {activity.title}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#67e8f9", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Dialogue Builder
          </p>
        </div>

        {/* Live Streaks & Step Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streak >= 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.12, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              style={{
                background: "linear-gradient(135deg, #ff4500 0%, #ff8c00 50%, #ffd700 100%)",
                padding: "6px 14px",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 900,
                fontSize: 12,
                color: "#000",
                border: "1.5px solid #fff",
                boxShadow: "0 0 20px rgba(255, 69, 0, 0.75), 0 0 10px rgba(255, 215, 0, 0.5)",
              }}
            >
              <Flame style={{ width: 15, height: 15, fill: "#ff4500", color: "#ff4500" }} />
              <span>{streak >= 2 ? `${streak}x COMBO!` : "Streak 1x"}</span>
            </motion.div>
          )}

          <div
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              padding: "6px 14px",
              borderRadius: 20,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.05em",
              boxShadow: "0 4px 14px rgba(6,182,212,0.3)",
            }}
          >
            {step + 1} / {activity.steps.length}
          </div>
        </div>
      </div>

      {/* Progress Bar with Energy Glow */}
      <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <motion.div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #38bdf8 0%, #06b6d4 50%, #4ade80 100%)",
            boxShadow: "0 0 14px rgba(56,189,248,0.8)",
          }}
          animate={{ width: `${((step + (feedback !== null ? 1 : 0)) / activity.steps.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      {/* Scenario Pill Container */}
      <div style={{ padding: "12px 24px 0", maxWidth: 760, width: "100%", margin: "0 auto", flexShrink: 0 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 16,
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>📍</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
            {activity.scenario}
          </p>
        </div>
      </div>

      {/* Central Chat & Interaction Canvas */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 24px 20px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 760,
          width: "100%",
          margin: "0 auto",
          gap: 16,
          position: "relative",
        }}
      >
        {/* Past Chat Log */}
        {history.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: msg.role === "player" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            {msg.role === "npc" && (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                }}
              >
                🧑‍🏫
              </div>
            )}

            <div
              style={{
                maxWidth: "75%",
                padding: "14px 18px",
                borderRadius: 20,
                borderBottomLeftRadius: msg.role === "npc" ? 4 : 20,
                borderBottomRightRadius: msg.role === "player" ? 4 : 20,
                background:
                  msg.role === "npc"
                    ? "rgba(255,255,255,0.12)"
                    : msg.correct
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: 1.5,
                border: `1px solid ${
                  msg.role === "npc"
                    ? "rgba(255,255,255,0.15)"
                    : msg.correct
                    ? "#34d399"
                    : "#f87171"
                }`,
              }}
            >
              {msg.text}
            </div>

            {msg.role === "player" && (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                👤
              </div>
            )}
          </motion.div>
        ))}

        {/* Current Active Speaker Bubble with Animated Emotion Avatar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`npc-${step}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginTop: 6,
            }}
          >
            {/* Animated Avatar Reaction */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <motion.div
                animate={{ scale: feedback === "correct" ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    feedback === "correct"
                      ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
                      : feedback === "incorrect"
                      ? "linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
                      : "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                  boxShadow:
                    feedback === "correct"
                      ? "0 0 20px rgba(16,185,129,0.7)"
                      : "0 6px 18px rgba(249,115,22,0.4)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  transition: "all 0.3s",
                }}
              >
                {npcEmoji}
              </motion.div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                {npcMoodText}
              </span>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                color: "#0f172a",
                padding: "18px 22px",
                borderRadius: 24,
                borderTopLeftRadius: 6,
                boxShadow: "0 14px 35px rgba(0,0,0,0.35)",
                maxWidth: "80%",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Speaker says:
              </div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.5 }}>
                "{currentStep.npcSays}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Selected Player Choice Preview with Floating Reaction */}
        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: 10,
              marginTop: 4,
              position: "relative",
            }}
          >
            {/* Floating XP Pill Reaction */}
            {feedback === "correct" && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -45, scale: [0.5, 1.2, 1, 0.9] }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: -10,
                  right: 50,
                  background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: 20,
                  boxShadow: "0 4px 15px rgba(16,185,129,0.5)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                ✨ +10 Points!
              </motion.div>
            )}

            <div
              style={{
                maxWidth: "75%",
                padding: "16px 20px",
                borderRadius: 22,
                borderBottomRightRadius: 4,
                background:
                  feedback === "correct"
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow:
                  feedback === "correct"
                    ? "0 10px 30px rgba(16,185,129,0.35)"
                    : "0 10px 30px rgba(239,68,68,0.35)",
                border: `2px solid ${feedback === "correct" ? "#6ee7b7" : "#fca5a5"}`,
              }}
            >
              {currentStep.options[selectedOption].text}
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              👤
            </div>
          </motion.div>
        )}
      </div>

      {/* Answer Options & Feedback Deck with 3D Button Push Effect */}
      <div
        style={{
          background: "rgba(10, 8, 38, 0.94)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "18px 24px 22px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
          {feedback === null ? (
            <div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Choose how you would respond:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentStep.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.015, x: 4, y: -2 }}
                    whileTap={{ scale: 0.985, y: 3 }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => handleSelect(i)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(255,255,255,0.14)",
                      borderBottom: "4px solid rgba(255,255,255,0.22)",
                      borderRadius: 18,
                      padding: "14px 18px",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: hoveredIdx === i ? "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)" : "rgba(255,255,255,0.15)",
                        color: hoveredIdx === i ? "#fff" : "#38bdf8",
                        fontWeight: 900,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      {optionLetters[i]}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: "0.96rem", lineHeight: 1.4 }}>
                      {opt.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background:
                    feedback === "correct"
                      ? "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(5,150,105,0.32) 100%)"
                      : "linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(185,28,28,0.32) 100%)",
                  border: `2px solid ${feedback === "correct" ? "#10b981" : "#ef4444"}`,
                  borderRadius: 22,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                  boxShadow:
                    feedback === "correct"
                      ? "0 12px 30px rgba(16,185,129,0.25)"
                      : "0 12px 30px rgba(239,68,68,0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {feedback === "correct" ? (
                    <CheckCircle2 style={{ width: 36, height: 36, color: "#34d399", flexShrink: 0 }} />
                  ) : (
                    <XCircle style={{ width: 36, height: 36, color: "#f87171", flexShrink: 0 }} />
                  )}
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontWeight: 900,
                        fontSize: "1.15rem",
                        color: feedback === "correct" ? "#6ee7b7" : "#fca5a5",
                      }}
                    >
                      {feedback === "correct" ? "Excellent Response! 🎉" : "Good Try, But Not Best!"}
                    </h4>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.88rem",
                        color: "rgba(255,255,255,0.9)",
                        fontWeight: 600,
                        lineHeight: 1.45,
                      }}
                    >
                      {currentStep.explanation}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 2 }}
                  onClick={handleNext}
                  style={{
                    background:
                      feedback === "correct"
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#fff",
                    border: "none",
                    borderBottom: "3px solid rgba(0,0,0,0.3)",
                    borderRadius: 16,
                    padding: "14px 24px",
                    fontWeight: 900,
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    fontFamily: "inherit",
                  }}
                >
                  Continue
                  <ChevronRight style={{ width: 18, height: 18 }} />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
