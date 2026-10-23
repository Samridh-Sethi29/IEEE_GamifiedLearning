import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Star,
  Play,
  X,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Book,
} from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";

// Activity Components
import DialogueBuilder from "@/features/english/components/DialogueBuilder";
import FillInTheStory from "@/features/english/components/FillInTheStory";
import WordMatch from "@/features/english/components/WordMatch";
import WordVaultModal from "@/features/english/components/WordVaultModal";

// Utilities & Data
import {
  playCardClick,
  playVictoryFanfare,
  isSoundEnabled,
  setSoundEnabled,
} from "@/features/english/utils/soundEffects";
import { triggerConfetti } from "@/features/english/utils/confetti";
import { MASTER_WORD_VAULT } from "@/features/english/data/wordVaultData";
import {
  ENGLISH_ACTIVITIES,
  LEVEL_ACTIVITY_TYPES,
} from "@/data/englishActivities";

// ─── Communication Coach Data ──────────────────────────────────────────────────
const COACH_TIPS = [
  {
    topic: "Polite Disagreement",
    tip: "Saying 'I see your point, but...' is a great way to disagree without hurting someone's feelings!",
    example:
      "Try saying: 'I see your point, but what if we looked at it from another angle?'",
    tag: "Social Skills",
  },
  {
    topic: "Active Listening",
    tip: "Nodding and acknowledging with 'I understand' or 'Tell me more' makes the speaker feel truly valued.",
    example:
      "Try replying: 'That sounds really interesting, how did you handle that?'",
    tag: "Empathy",
  },
  {
    topic: "Asking for Guidance",
    tip: "Using 'Could you please explain that once more?' shows curiosity and respect.",
    example:
      "Instead of saying 'What?', try: 'Could you please clarify that last part?'",
    tag: "Manners",
  },
  {
    topic: "Collaborative Teamwork",
    tip: "Say 'Could we look into this together?' instead of pointing fingers when a problem occurs.",
    example: "Shift from 'You did this wrong' to 'Let's fix this together!'",
    tag: "Leadership",
  },
  {
    topic: "Thoughtful Pacing",
    tip: "Taking a deep breath and pausing for 2 seconds before answering makes your speech sound confident and calm.",
    example: "A short pause shows wisdom and care before you respond.",
    tag: "Confidence",
  },
  {
    topic: "Specific Gratitude",
    tip: "Be specific when thanking someone! Mentioning what they did makes your appreciation unforgettable.",
    example:
      "Instead of just 'Thanks', say: 'Thank you for explaining that so clearly!'",
    tag: "Gratitude",
  },
];

// ─── Game Mode Config ───────────────────────────────────────────────────────────
const GAME_MODES = [
  {
    id: "dialogue",
    label: "Dialogue Builder",
    emoji: "💬",
    tagline: "Practice real conversations!",
    description:
      "Pick the smartest reply in real-life situations — from making friends to asking for help.",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    shadow: "0 20px 60px rgba(59,130,246,0.45)",
    hoverShadow: "0 28px 80px rgba(59,130,246,0.65)",
    lightBg: "rgba(59,130,246,0.12)",
    accent: "#3b82f6",
    levels: [1, 4, 7, 10, 13, 16, 19],
  },
  {
    id: "fill",
    label: "Fill the Story",
    emoji: "✍️",
    tagline: "Complete fun stories!",
    description:
      "Pick words from a word bank to fill in the blanks and bring a short story to life.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    shadow: "0 20px 60px rgba(245,158,11,0.45)",
    hoverShadow: "0 28px 80px rgba(245,158,11,0.65)",
    lightBg: "rgba(245,158,11,0.12)",
    accent: "#f59e0b",
    levels: [3, 6, 9, 12, 15, 18],
  },
  {
    id: "wordmatch",
    label: "Word Match",
    emoji: "🧩",
    tagline: "Match words to meanings!",
    description:
      "Tap a word then tap its meaning — match all pairs to win. How fast can you go?",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    shadow: "0 20px 60px rgba(139,92,246,0.45)",
    hoverShadow: "0 28px 80px rgba(139,92,246,0.65)",
    lightBg: "rgba(139,92,246,0.12)",
    accent: "#8b5cf6",
    levels: [2, 5, 8, 11, 14, 17, 20],
  },
];

// Floating letter decorations for the background
const FLOAT_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "the",
  "is",
  "?",
  "!",
  "abc",
  "📚",
  "🎓",
  "✏️",
];

function FloatingLetter({ letter, index }) {
  const left = 4 + ((index * 13) % 92);
  const duration = 7 + (index % 5) * 2;
  const delay = index * 0.6;
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-50px",
        fontSize: index % 3 === 0 ? "2.5rem" : "1.5rem",
        fontWeight: 900,
        opacity: 0.07,
        pointerEvents: "none",
        zIndex: 0,
        color: "#fff",
        fontFamily: "monospace",
      }}
      animate={{ y: ["0vh", "110vh"], rotate: [0, 180] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      {letter}
    </motion.div>
  );
}

// ─── Communication Coach Card Component ────────────────────────────────────────
function CommunicationCoachCard() {
  const [tipIndex, setTipIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const current = COACH_TIPS[tipIndex];

  const handleNextTip = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setTipIndex((prev) => (prev + 1) % COACH_TIPS.length);
  };

  const handleSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const textToRead = `${current.tip} For example: ${current.example}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto 32px",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1.5px solid rgba(245,158,11,0.35)",
        borderRadius: 28,
        padding: "20px 24px",
        backdropFilter: "blur(14px)",
        boxShadow:
          "0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      {/* Mentor Avatar Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: "0 8px 25px rgba(245,158,11,0.4)",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            🧑‍🏫
          </div>
          {/* Online beacon */}
          <span
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#10b981",
              border: "2px solid #1e1b4b",
              boxShadow: "0 0 8px #10b981",
            }}
          />
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ fontWeight: 900, color: "#fff", fontSize: "1.05rem" }}
            >
              Coach Emma
            </span>
            <span
              style={{
                background: "rgba(245,158,11,0.2)",
                border: "1px solid rgba(245,158,11,0.4)",
                color: "#fcd34d",
                fontSize: 10,
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Mentor
            </span>
          </div>
          <p
            style={{
              margin: "2px 0 0",
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Communication & Speech
          </p>
        </div>
      </div>

      {/* Speech & Tip Bubble */}
      <div
        style={{
          flex: "1 1 340px",
          background: "rgba(11, 9, 43, 0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "16px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles style={{ width: 14, height: 14, color: "#f59e0b" }} />
            <span
              style={{
                color: "#fcd34d",
                fontWeight: 900,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Coach Tip of the Day · {current.topic}
            </span>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {tipIndex + 1} of {COACH_TIPS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.98rem",
                lineHeight: 1.45,
              }}
            >
              "{current.tip}"
            </p>
            <p
              style={{
                margin: 0,
                color: "#7dd3fc",
                fontSize: "0.85rem",
                fontWeight: 600,
                fontStyle: "italic",
              }}
            >
              💡 {current.example}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Listen Button */}
        <button
          onClick={handleSpeak}
          title="Listen to pronunciation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 16,
            border: isSpeaking
              ? "1.5px solid #38bdf8"
              : "1.5px solid rgba(255,255,255,0.15)",
            background: isSpeaking
              ? "rgba(56,189,248,0.25)"
              : "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: isSpeaking ? "0 0 16px rgba(56,189,248,0.4)" : "none",
          }}
          onMouseEnter={(e) => {
            if (!isSpeaking)
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            if (!isSpeaking)
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
        >
          <Volume2
            style={{
              width: 16,
              height: 16,
              color: isSpeaking ? "#38bdf8" : "#fff",
            }}
          />
          {isSpeaking ? "Speaking..." : "Listen"}
        </button>

        {/* Next Tip Button */}
        <button
          onClick={handleNextTip}
          title="Get another tip"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 16,
            border: "1.5px solid rgba(245,158,11,0.4)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(217,119,6,0.3) 100%)",
            color: "#fde68a",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <RefreshCw style={{ width: 14, height: 14 }} />
          Next Tip
        </button>
      </div>
    </motion.div>
  );
}

// ─── Home Screen ────────────────────────────────────────────────────────────────
function HomeScreen({
  onSelectMode,
  onBack,
  onOpenVault,
  unlockedWordsCount,
  soundOn,
  onToggleSound,
}) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
        padding: "148px 24px 48px",
      }}
    >
      {/* Floating letters */}
      {FLOAT_LETTERS.map((l, i) => (
        <FloatingLetter key={i} letter={l} index={i} />
      ))}

      {/* Top action controls: Back (left), Word Vault & Sound (right) */}
      <div style={{ position: "fixed", left: 16, top: 82, zIndex: 50 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Back to School
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          right: 16,
          top: 82,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Word Vault Button */}
        <button
          onClick={onOpenVault}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 14,
            border: "1.5px solid rgba(139,92,246,0.45)",
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.25) 100%)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 16 }}>📖</span>
          <span>Word Vault</span>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 11,
              color: "#fcd34d",
              fontWeight: 900,
            }}
          >
            {unlockedWordsCount}/{MASTER_WORD_VAULT.length}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? "Mute audio effects" : "Unmute audio effects"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: soundOn
              ? "rgba(56,189,248,0.2)"
              : "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            color: soundOn ? "#38bdf8" : "rgba(255,255,255,0.5)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.06)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {soundOn ? (
            <Volume2 style={{ width: 18, height: 18 }} />
          ) : (
            <VolumeX style={{ width: 18, height: 18 }} />
          )}
        </button>
      </div>

      {/* Main content container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <div style={{ fontSize: "3.2rem", marginBottom: 6 }}>📖</div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            English Zone
          </h1>
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              color: "rgba(255,255,255,0.6)",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Choose a game mode to master communication, vocabulary, and stories!
          </p>
        </motion.div>

        {/* Coach Tip of the Day */}
        <CommunicationCoachCard />

        {/* 3 cards — side by side */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 1100,
            width: "100%",
          }}
        >
          {GAME_MODES.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.14 }}
              whileHover={{ scale: 1.04, y: -8 }}
              whileTap={{ scale: 0.97 }}
              style={{ flex: "1 1 290px", maxWidth: 360, cursor: "pointer" }}
              onMouseEnter={() => setHovered(mode.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectMode(mode)}
            >
              <div
                style={{
                  background: mode.gradient,
                  borderRadius: 28,
                  padding: "36px 28px",
                  boxShadow:
                    hovered === mode.id ? mode.hoverShadow : mode.shadow,
                  transition: "box-shadow 0.3s",
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3rem",
                        lineHeight: 1,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: 16,
                        padding: "12px 14px",
                      }}
                    >
                      {mode.emoji}
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                        padding: "6px 14px",
                        borderRadius: 30,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {mode.levels.length} LEVELS
                    </div>
                  </div>

                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: "#fff",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {mode.label}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 600,
                      margin: "0 0 10px 0",
                    }}
                  >
                    {mode.tagline}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {mode.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 22px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.22)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    Play Now
                    <ChevronRight
                      style={{ width: 16, height: 16 }}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Level Select Screen ────────────────────────────────────────────────────────
function LevelSelectScreen({
  mode,
  levelsData,
  onSelectLevel,
  onBack,
  onOpenVault,
  unlockedWordsCount,
  soundOn,
  onToggleSound,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px 20px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          flexShrink: 0,
          marginTop: 76,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
            Game Modes
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onOpenVault}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 12,
                border: "1px solid rgba(139,92,246,0.4)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <span>📖</span>
              <span>Vault ({unlockedWordsCount})</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundOn ? "Mute audio" : "Unmute audio"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: soundOn
                  ? "rgba(56,189,248,0.2)"
                  : "rgba(255,255,255,0.1)",
                color: soundOn ? "#38bdf8" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              {soundOn ? (
                <Volume2 style={{ width: 16, height: 16 }} />
              ) : (
                <VolumeX style={{ width: 16, height: 16 }} />
              )}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: "2.5rem",
              background: mode.gradient,
              borderRadius: 16,
              padding: "10px 12px",
              lineHeight: 1,
              boxShadow: mode.shadow,
            }}
          >
            {mode.emoji}
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "#fff",
                margin: 0,
              }}
            >
              {mode.label}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                margin: "4px 0 0",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {mode.description}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {[
            { label: "Levels", value: mode.levels.length },
            {
              label: "Played",
              value: mode.levels.filter(
                (l) => (levelsData[l]?.bestScore || 0) > 0,
              ).length,
            },
            {
              label: "Stars",
              value:
                mode.levels.reduce(
                  (s, l) => s + (levelsData[l]?.stars || 0),
                  0,
                ) + " ⭐",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "10px 12px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "1.3rem",
                  fontWeight: 900,
                  marginTop: 2,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Grid — scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Choose a Level
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            maxWidth: 900,
          }}
        >
          {mode.levels.map((levelNum, i) => {
            const actData = ENGLISH_ACTIVITIES[levelNum];
            const stars = levelsData[levelNum]?.stars || 0;
            const bestScore = levelsData[levelNum]?.bestScore || 0;
            const isPlayed = bestScore > 0;

            return (
              <motion.button
                key={levelNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectLevel(levelNum)}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: `1.5px solid rgba(255,255,255,${isPlayed ? "0.18" : "0.08"})`,
                  borderRadius: 20,
                  padding: "20px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Coloured left bar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: mode.gradient,
                    borderRadius: "20px 0 0 20px",
                  }}
                />

                {/* Level badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      background: mode.gradient,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 20,
                      letterSpacing: "0.05em",
                    }}
                  >
                    LVL {levelNum}
                  </span>
                  {isPlayed && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3].map((s) => (
                        <span key={s} style={{ fontSize: 12 }}>
                          {s <= stars ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    margin: "0 0 10px",
                    lineHeight: 1.35,
                  }}
                >
                  {actData?.title || `Level ${levelNum}`}
                </p>

                {/* Score / CTA */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isPlayed
                      ? "rgba(255,255,255,0.1)"
                      : mode.lightBg,
                    borderRadius: 10,
                    padding: "8px 12px",
                  }}
                >
                  <span
                    style={{
                      color: isPlayed ? "rgba(255,255,255,0.7)" : "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {isPlayed ? `Best: ${bestScore}%` : "Not played yet"}
                  </span>
                  <div
                    style={{
                      background: mode.gradient,
                      borderRadius: 8,
                      padding: "5px 8px",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: `0 4px 12px ${mode.accent}55`,
                    }}
                  >
                    <Play
                      style={{
                        width: 12,
                        height: 12,
                        fill: "#fff",
                        color: "#fff",
                      }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EnglishAdventurePage() {
  const {
    player,
    saveEnglishProgress,
    updateSkill,
    earnXP,
    markWorldCompleted,
  } = usePlayer();
  const navigate = useNavigate();

  const [screen, setScreen] = useState("HOME");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [resultStats, setResultStats] = useState(null);

  // Sound & Vault state
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const levelsData = player.english?.levels || {};

  const unlockedWordsCount = MASTER_WORD_VAULT.filter(
    (w) => w.level <= 2 || (levelsData[w.level]?.bestScore || 0) > 0,
  ).length;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const openVault = () => {
    playCardClick();
    setIsVaultOpen(true);
  };

  const selectMode = (mode) => {
    playCardClick();
    setSelectedMode(mode);
    setScreen("LEVELS");
  };

  const selectLevel = (lvl) => {
    playCardClick();
    setSelectedLevel(lvl);
    setScreen("PREVIEW");
  };

  const beginActivity = () => {
    playCardClick();
    setScreen("ACTIVITY");
  };

  const handleActivityComplete = (stats) => {
    setResultStats(stats);
    playVictoryFanfare();
    if (stats.score >= 50) {
      triggerConfetti();
    }
    saveEnglishProgress(
      selectedLevel,
      stats.score,
      stats.stars,
      stats.points,
      stats.correct,
      1,
      stats.bestStreak || 0,
    );
    updateSkill("human", 5);
    earnXP(15);
    setScreen("COMPLETE");
  };

  const goHome = () => {
    playCardClick();
    setScreen("HOME");
    setSelectedMode(null);
    setSelectedLevel(null);
    setResultStats(null);
  };

  const goLevels = () => {
    playCardClick();
    setScreen("LEVELS");
    setSelectedLevel(null);
    setResultStats(null);
  };

  const exitEnglish = () => {
    playCardClick();
    markWorldCompleted("english");
    navigate("/world/school");
  };

  const activityData = selectedLevel ? ENGLISH_ACTIVITIES[selectedLevel] : null;
  const activityType = selectedLevel
    ? LEVEL_ACTIVITY_TYPES[selectedLevel]
    : null;

  const renderActivity = () => {
    if (!activityData) return null;
    const props = {
      activity: activityData,
      onComplete: handleActivityComplete,
      onExit: goLevels,
    };
    if (activityType === "dialogue") return <DialogueBuilder {...props} />;
    if (activityType === "fill") return <FillInTheStory {...props} />;
    if (activityType === "wordmatch") return <WordMatch {...props} />;
    return null;
  };

  return (
    <div style={{ position: "fixed", inset: 0, isolation: "isolate" }}>
      {(screen === "HOME" || screen === "LEVELS") && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
        >
          <GameHUD objective="Choose your English game and start learning!" />
        </div>
      )}

      {/* HOME */}
      <AnimatePresence mode="wait">
        {screen === "HOME" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            style={{ position: "fixed", inset: 0 }}
          >
            <HomeScreen
              onSelectMode={selectMode}
              onBack={exitEnglish}
              onOpenVault={openVault}
              unlockedWordsCount={unlockedWordsCount}
              soundOn={soundOn}
              onToggleSound={toggleSound}
            />
          </motion.div>
        )}

        {/* LEVELS */}
        {screen === "LEVELS" && selectedMode && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            style={{ position: "fixed", inset: 0 }}
          >
            <LevelSelectScreen
              mode={selectedMode}
              levelsData={levelsData}
              onSelectLevel={selectLevel}
              onBack={goHome}
              onOpenVault={openVault}
              unlockedWordsCount={unlockedWordsCount}
              soundOn={soundOn}
              onToggleSound={toggleSound}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL — CENTERED & HIGH POLISH */}
      <AnimatePresence>
        {screen === "PREVIEW" && activityData && selectedMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(5, 7, 20, 0.78)",
              backdropFilter: "blur(12px)",
              padding: "20px",
            }}
            onClick={goLevels}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                background: "linear-gradient(165deg, #1f1b4e 0%, #12102e 100%)",
                borderRadius: 32,
                width: "100%",
                maxWidth: 480,
                overflow: "hidden",
                boxShadow: `0 25px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12), 0 0 40px ${selectedMode.accent}33`,
                fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Banner */}
              <div
                style={{
                  background: selectedMode.gradient,
                  padding: "32px 28px 24px",
                  position: "relative",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={goLevels}
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                    e.currentTarget.style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.25)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>

                {/* Top Badges */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      background: "rgba(0,0,0,0.28)",
                      backdropFilter: "blur(6px)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    Level {selectedLevel}
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.22)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {selectedMode.label}
                  </span>
                </div>

                {/* Level Title & Icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      fontSize: "3.2rem",
                      lineHeight: 1,
                      filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))",
                    }}
                  >
                    {selectedMode.emoji}
                  </div>
                  <div>
                    <h2
                      style={{
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "1.75rem",
                        margin: 0,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {activityData.title}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        margin: "4px 0 0",
                      }}
                    >
                      {selectedMode.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div style={{ padding: "24px 28px 28px" }}>
                {/* Stats & Rewards Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {/* Previous Best Score & Stars */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 18,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Best Record
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: "1.25rem",
                        }}
                      >
                        {levelsData[selectedLevel]?.bestScore || 0}%
                      </span>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3].map((s) => (
                          <span key={s} style={{ fontSize: "1.1rem" }}>
                            {s <= (levelsData[selectedLevel]?.stars || 0)
                              ? "⭐"
                              : "☆"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 18,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Clear Reward
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          color: "#4ade80",
                          fontWeight: 900,
                          fontSize: "1rem",
                        }}
                      >
                        +15 XP
                      </span>
                      <span
                        style={{
                          color: "#fbbf24",
                          fontWeight: 900,
                          fontSize: "1rem",
                        }}
                      >
                        +3 ⭐
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instruction / Mission Objective Box */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1.5px dashed ${selectedMode.accent}88`,
                    borderRadius: 20,
                    padding: "16px 18px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>💡</span>
                  <div>
                    <h4
                      style={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        margin: "0 0 4px",
                      }}
                    >
                      How to Play
                    </h4>
                    {activityType === "dialogue" && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "0.85rem",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        Step into real conversations! Read the speaker's line
                        and pick the most respectful, articulate response.
                      </p>
                    )}
                    {activityType === "fill" && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "0.85rem",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        Complete the narrative by tapping vocabulary words from
                        the word bank to fill each story blank.
                      </p>
                    )}
                    {activityType === "wordmatch" && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "0.85rem",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        Match each word on the left with its accurate meaning on
                        the right. Avoid mistakes for full stars!
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Animated START Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={beginActivity}
                  style={{
                    width: "100%",
                    background: selectedMode.gradient,
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    padding: "18px 0",
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    boxShadow: `0 12px 35px ${selectedMode.accent}66`,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play
                      style={{
                        width: 18,
                        height: 18,
                        fill: "#fff",
                        marginLeft: 2,
                      }}
                    />
                  </div>
                  START LEVEL {selectedLevel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVITY */}
      {screen === "ACTIVITY" && renderActivity()}

      {/* COMPLETE MODAL */}
      <AnimatePresence>
        {screen === "COMPLETE" && resultStats && selectedMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              style={{
                background: "#1e1b4b",
                borderRadius: 28,
                width: "100%",
                maxWidth: 420,
                overflow: "hidden",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
                fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
              }}
            >
              {/* Top */}
              <div
                style={{
                  background: selectedMode.gradient,
                  padding: "32px 28px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 50% 120%, rgba(255,255,255,0.2), transparent)",
                  }}
                />
                <div style={{ fontSize: "3.5rem", position: "relative" }}>
                  🏆
                </div>
                <h2
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1.8rem",
                    margin: "8px 0 4px",
                    position: "relative",
                  }}
                >
                  Level Complete!
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    margin: 0,
                    position: "relative",
                  }}
                >
                  {activityData?.title}
                </p>
              </div>

              {/* Stars row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  padding: "20px 28px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: s * 0.15,
                      type: "spring",
                      stiffness: 250,
                      damping: 16,
                    }}
                    style={{
                      fontSize: s <= resultStats.stars ? "2.8rem" : "2.2rem",
                    }}
                  >
                    {s <= resultStats.stars ? "⭐" : "☆"}
                  </motion.div>
                ))}
              </div>

              {/* Score grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "20px 24px",
                }}
              >
                {[
                  {
                    label: "Score",
                    value: `${resultStats.score}%`,
                    emoji: "📊",
                  },
                  {
                    label: "Points Earned",
                    value: `+${resultStats.points}`,
                    emoji: "✨",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: "16px 14px",
                      textAlign: "center",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>
                      {stat.emoji}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "1.6rem",
                        fontWeight: 900,
                        marginTop: 4,
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div
                style={{
                  padding: "0 24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <button
                  onClick={goLevels}
                  style={{
                    width: "100%",
                    background: selectedMode.gradient,
                    color: "#fff",
                    border: "none",
                    borderRadius: 16,
                    padding: "15px 0",
                    fontWeight: 900,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: selectedMode.shadow,
                    fontFamily: "inherit",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  More Levels
                </button>
                <button
                  onClick={beginActivity}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    padding: "13px 0",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={goHome}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "rgba(255,255,255,0.4)",
                    border: "none",
                    padding: "8px 0",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ← Back to Game Modes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORD VAULT MODAL */}
      <WordVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        levelsData={levelsData}
      />
    </div>
  );
}
