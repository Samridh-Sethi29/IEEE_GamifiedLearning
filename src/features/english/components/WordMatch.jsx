import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, ChevronRight, Sparkles, Zap, Flame } from "lucide-react";
import { playMatchSparkle, playWrongBoop, playCardClick, playVictoryFanfare } from "@/features/english/utils/soundEffects";
import { triggerConfetti } from "@/features/english/utils/confetti";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WordMatch({ activity, onComplete, onExit }) {
  const [leftCards] = useState(() => shuffle(activity.pairs.map(p => p.word)));
  const [rightCards] = useState(() => shuffle(activity.pairs.map(p => p.match)));

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState([]); // array of { word, match }
  const [wrongPair, setWrongPair] = useState(null);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      const pair = activity.pairs.find(p => p.word === selectedLeft && p.match === selectedRight);
      if (pair) {
        playMatchSparkle();
        setCombo(c => c + 1);
        const newMatched = [...matched, pair];
        setMatched(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
        if (newMatched.length === activity.pairs.length) {
          setTimeout(() => {
            playVictoryFanfare();
            triggerConfetti();
            setDone(true);
          }, 600);
        }
      } else {
        playWrongBoop();
        setCombo(0);
        setWrongPair({ left: selectedLeft, right: selectedRight });
        setErrors(e => e + 1);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPair(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight]);

  const isMatchedWord = (word) => matched.some(m => m.word === word);
  const isMatchedMatch = (match) => matched.some(m => m.match === match);

  const getLeftState = (word) => {
    if (isMatchedWord(word)) return "matched";
    if (wrongPair?.left === word) return "wrong";
    if (selectedLeft === word) return "selected";
    return "idle";
  };

  const getRightState = (match) => {
    if (isMatchedMatch(match)) return "matched";
    if (wrongPair?.right === match) return "wrong";
    if (selectedRight === match) return "selected";
    return "idle";
  };

  const handleFinish = () => {
    const totalPairs = activity.pairs.length;
    const pct = Math.max(0, Math.round(((totalPairs - errors) / totalPairs) * 100));
    let stars = 1;
    if (errors === 0) stars = 3;
    else if (errors <= 2) stars = 2;
    onComplete({
      correct: totalPairs,
      score: pct,
      points: pct * 2,
      stars,
      bestStreak: 0,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "linear-gradient(145deg, #13092b 0%, #200f45 50%, #15062e 100%)",
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
          background: "rgba(19, 9, 43, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(139,92,246,0.18)",
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
            <span style={{ fontSize: "1.2rem" }}>🧩</span>
            <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.01em" }}>
              {activity.title}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#c084fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Word Match Arcade
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {combo >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                padding: "6px 12px",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 900,
                fontSize: 12,
                boxShadow: "0 0 16px rgba(249,115,22,0.6)",
              }}
            >
              <Flame style={{ width: 14, height: 14, fill: "#fef08a", color: "#fef08a" }} />
              <span>{combo}x Combo!</span>
            </motion.div>
          )}

          {errors > 0 && (
            <div
              style={{
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                padding: "6px 12px",
                borderRadius: 20,
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {errors} {errors === 1 ? "miss" : "misses"}
            </div>
          )}

          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
              padding: "6px 14px",
              borderRadius: 20,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.05em",
              boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
            }}
          >
            {matched.length} / {activity.pairs.length} Matched
          </div>
        </div>
      </div>

      {/* Progress Dots Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "12px 24px",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        {activity.pairs.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < matched.length ? [1, 1.3, 1.1] : 1,
              backgroundColor: i < matched.length ? "#10b981" : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.3 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              boxShadow: i < matched.length ? "0 0 10px #10b981" : "none",
            }}
          />
        ))}
      </div>

      {/* Main Two-Column Matching Arena */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px 30px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 960,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          {selectedLeft && !selectedRight
            ? "Now tap the matching meaning on the right!"
            : selectedRight && !selectedLeft
            ? "Now tap the matching word on the left!"
            : "Tap a word on the left, then its meaning on the right to link them."}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* Words Column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                color: "#c084fc",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Zap style={{ width: 14, height: 14 }} />
              Vocabulary Words
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leftCards.map(word => {
                const state = getLeftState(word);
                const isMatched = state === "matched";
                const isSelected = state === "selected";
                const isWrong = state === "wrong";

                return (
                  <motion.button
                    key={word}
                    whileHover={!isMatched ? { scale: 1.025, x: 4, y: -2 } : {}}
                    whileTap={!isMatched ? { scale: 0.98, y: 3 } : {}}
                    disabled={isMatched}
                    onClick={() => !isMatched && setSelectedLeft(selectedLeft === word ? null : word)}
                    className={isWrong ? "animate-shake" : ""}
                    style={{
                      padding: "18px 20px",
                      borderRadius: 20,
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: isMatched ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isMatched
                        ? "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)"
                        : isSelected
                        ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                        : isWrong
                        ? "linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(185,28,28,0.25) 100%)"
                        : "rgba(255,255,255,0.06)",
                      border: isMatched
                        ? "2px solid #10b981"
                        : isSelected
                        ? "2px solid #e9d5ff"
                        : isWrong
                        ? "2px solid #ef4444"
                        : "1.5px solid rgba(255,255,255,0.12)",
                      borderBottom: isMatched
                        ? "4px solid #059669"
                        : isSelected
                        ? "4px solid #c084fc"
                        : isWrong
                        ? "4px solid #dc2626"
                        : "4px solid rgba(255,255,255,0.22)",
                      color: isMatched ? "#6ee7b7" : isWrong ? "#fca5a5" : "#fff",
                      boxShadow: isSelected
                        ? "0 10px 30px rgba(139,92,246,0.5)"
                        : isMatched
                        ? "0 4px 16px rgba(16,185,129,0.2)"
                        : "0 6px 14px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span>{word}</span>
                    {isMatched && <CheckCircle2 style={{ width: 18, height: 18, color: "#34d399" }} />}
                    {isSelected && <span style={{ fontSize: 13, color: "#e9d5ff" }}>● Selected</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Meanings Column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                color: "#f472b6",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              Definitions & Meanings
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rightCards.map(match => {
                const state = getRightState(match);
                const isMatched = state === "matched";
                const isSelected = state === "selected";
                const isWrong = state === "wrong";

                return (
                  <motion.button
                    key={match}
                    whileHover={!isMatched ? { scale: 1.025, x: -4, y: -2 } : {}}
                    whileTap={!isMatched ? { scale: 0.98, y: 3 } : {}}
                    disabled={isMatched}
                    onClick={() => !isMatched && setSelectedRight(selectedRight === match ? null : match)}
                    className={isWrong ? "animate-shake" : ""}
                    style={{
                      padding: "18px 20px",
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      lineHeight: 1.45,
                      cursor: isMatched ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isMatched
                        ? "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)"
                        : isSelected
                        ? "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)"
                        : isWrong
                        ? "linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(185,28,28,0.25) 100%)"
                        : "rgba(255,255,255,0.06)",
                      border: isMatched
                        ? "2px solid #10b981"
                        : isSelected
                        ? "2px solid #fbcfe8"
                        : isWrong
                        ? "2px solid #ef4444"
                        : "1.5px solid rgba(255,255,255,0.12)",
                      borderBottom: isMatched
                        ? "4px solid #059669"
                        : isSelected
                        ? "4px solid #f43f5e"
                        : isWrong
                        ? "4px solid #dc2626"
                        : "4px solid rgba(255,255,255,0.22)",
                      color: isMatched ? "#6ee7b7" : isWrong ? "#fca5a5" : "#fff",
                      boxShadow: isSelected
                        ? "0 10px 30px rgba(219,39,119,0.5)"
                        : isMatched
                        ? "0 4px 16px rgba(16,185,129,0.2)"
                        : "0 6px 14px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span>{match}</span>
                    {isMatched && <CheckCircle2 style={{ width: 18, height: 18, color: "#34d399", flexShrink: 0, marginLeft: 8 }} />}
                    {isSelected && <span style={{ fontSize: 13, color: "#fbcfe8", flexShrink: 0, marginLeft: 8 }}>● Selected</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "rgba(9, 4, 25, 0.85)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{
                background: "linear-gradient(165deg, #27144e 0%, #15092f 100%)",
                borderRadius: 32,
                padding: "36px 32px",
                textAlign: "center",
                maxWidth: 420,
                width: "100%",
                boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            >
              <div style={{ fontSize: "4.5rem", marginBottom: 12 }}>🏆</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
                All Pairs Matched!
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", margin: "0 0 24px", fontWeight: 600 }}>
                {errors === 0
                  ? "Flawless victory! Not a single mistake."
                  : `Well done! Completed with only ${errors} miss${errors !== 1 ? "es" : ""}.`}
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "16px 0",
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(139,92,246,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "inherit",
                }}
              >
                Continue to Results
                <ChevronRight style={{ width: 20, height: 20 }} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
