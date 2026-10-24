import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Sparkles,
  ShieldAlert,
  Zap,
} from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import InteractivePythonDebugging from "./InteractivePythonDebugging";
import { triggerConfetti } from "@/features/english/utils/confetti";

const CYBER_MISSIONS = [
  {
    id: 1,
    title: "Mission 1 — The Missing String Quote",
    description:
      "A rogue anomaly erased the closing quotation mark in this broadcast! Patch the syntax error so the system can greet SkillVerse.",
    initialCode: 'print("Welcome to SkillVerse)',
    expectedOutput: "Welcome to SkillVerse",
    bugLine: 1,
    scannerHint:
      'Line 1 is missing its closing quotation mark `"` right before the closing parenthesis `)`!',
  },
  {
    id: 2,
    title: "Mission 2 — Rogue Variable Typo",
    description:
      "The mainframe is trying to identify the security agent, but a variable name typo is causing a crash. Align the identifier spelling.",
    initialCode: 'agent_name = "CyberNova"\nclearance_lvl = 5\nprint(agent_nam)',
    expectedOutput: "CyberNova",
    bugLine: 3,
    scannerHint:
      'Notice Line 1 defines `agent_name`, but Line 3 tries to print `agent_nam`. Add the missing "e"!',
  },
  {
    id: 3,
    title: "Mission 3 — Energy Grid Calculation",
    description:
      "Mainframe energy shields need exactly 100 power units. The math calculation is subtracting the booster instead of adding it! Fix the logic operator.",
    initialCode:
      "base_shield = 80\nbooster = 20\ntotal_shield = base_shield - booster\nprint(total_shield)",
    expectedOutput: "100",
    bugLine: 3,
    scannerHint:
      "On Line 3, `80 - 20` gives 60. Change `-` to `+` so `80 + 20` totals 100!",
  },
  {
    id: 4,
    title: "Mission 4 — Broken Terminal Print",
    description:
      "A legacy print statement without parentheses is blocking the firewall unlock. Format it with Python 3 parentheses.",
    initialCode: 'status = "SECURITY OVERRIDE"\nprint status',
    expectedOutput: "SECURITY OVERRIDE",
    bugLine: 2,
    scannerHint:
      "Line 2: In Python 3, print statements require parentheses! Change `print status` to `print(status)`.",
  },
];

export default function PythonDebuggingChallengeLevel1() {
  const { player, updatePlayer, earnXP } = usePlayer();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    triggerConfetti();

    if (!player.computerProgress?.pythonDebugging?.challengePassed) {
      earnXP(40);
      updatePlayer({
        computerProgress: {
          ...player.computerProgress,
          pythonDebugging: {
            ...player.computerProgress?.pythonDebugging,
            challengePassed: true,
            completedLevels: [
              ...(player.computerProgress?.pythonDebugging?.completedLevels || []),
              2,
            ],
          },
        },
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "linear-gradient(135deg, #050811 0%, #0b0f1d 50%, #050811 100%)",
        color: "#ffffff",
        fontFamily: "'Plus Jakarta Sans Variable', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Ambient Cyber Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.15)",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.15)",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <GameHUD />

      {/* Persistent Exit Button when not in middle of mission */}
      {(!hasStarted || isCompleted) && (
        <div
          style={{
            position: "fixed",
            left: 20,
            top: 100,
            zIndex: 40,
          }}
        >
          <Link
            to="/world/school/computer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 14,
              border: "1.5px solid rgba(255, 255, 255, 0.18)",
              background: "rgba(15, 23, 42, 0.85)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            Computer Lab
          </Link>
        </div>
      )}

      {/* 1. BRIEFING SCREEN */}
      {!hasStarted && !isCompleted ? (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 580,
            margin: "0 auto",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "110px 20px 40px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: "100%",
              borderRadius: 32,
              border: "2px solid rgba(168, 85, 247, 0.4)",
              background: "linear-gradient(155deg, #0e1526 0%, #151138 60%, #0e1526 100%)",
              padding: "40px 36px",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.2)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                margin: "0 auto 20px",
                borderRadius: 28,
                background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.45)",
              }}
            >
              <ShieldAlert style={{ width: 46, height: 46, color: "#67e8f9" }} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: 999,
                background: "rgba(168, 85, 247, 0.2)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                color: "#c084fc",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              <Zap style={{ width: 13, height: 13 }} /> Cyber Challenge Mode
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              BUG HUNTER PROTOCOL
            </h2>

            <p
              style={{
                margin: "0 0 16px",
                fontSize: "1rem",
                fontWeight: 800,
                color: "#38bdf8",
              }}
            >
              4 Corrupted Scripts • Live Terminal Execution
            </p>

            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "#94a3b8",
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              Cyber glitches have infected the school mainframe. Use your Python debugging skills
              and the new <strong style={{ color: "#38bdf8" }}>Bug Scanner</strong> to locate typos, syntax bugs, and faulty calculations!
            </p>

            {/* Rewards Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
                padding: "14px 20px",
                borderRadius: 18,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: 28,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 800, color: "#64748b", letterSpacing: "0.06em" }}>
                  XP Reward
                </span>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#fbbf24" }}>+40 XP</span>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255, 255, 255, 0.1)" }} />
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 800, color: "#64748b", letterSpacing: "0.06em" }}>
                  Title Awarded
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8" }}>Master Bug Hunter</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 3 }}
              onClick={() => setHasStarted(true)}
              style={{
                width: "100%",
                height: 56,
                borderRadius: 18,
                background: "linear-gradient(135deg, #9333ea 0%, #6366f1 100%)",
                border: "1.5px solid #c084fc",
                borderBottom: "5px solid #4c1d95",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.05em",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(147, 51, 234, 0.4)",
                fontFamily: "inherit",
              }}
            >
              INITIALIZE CHALLENGE ⚡
            </motion.button>
          </motion.div>
        </div>
      ) : !isCompleted ? (
        /* 2. ACTIVE MISSION WORKSPACE */
        <div className="bc-page" style={{ position: "relative", zIndex: 10, color: "#fff" }}>
          <div className="bc-header">
            <Link
              to="/world/school/computer"
              className="bc-back"
              style={{
                color: "#cbd5e1",
                borderColor: "rgba(255,255,255,0.2)",
                background: "rgba(15,23,42,0.8)",
              }}
            >
              <ArrowLeft size={16} strokeWidth={2.5} /> Exit Lab
            </Link>
            <div>
              <h1
                className="bc-title"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 14px rgba(168,85,247,0.6)",
                }}
              >
                CYBER BUG-HUNTER
              </h1>
              <p className="bc-sub" style={{ color: "#38bdf8", fontWeight: 800 }}>
                Mainframe Quarantine • Python Diagnostics
              </p>
            </div>
          </div>

          <InteractivePythonDebugging
            fitViewport
            tasks={CYBER_MISSIONS}
            mode="challenge"
            onComplete={handleComplete}
          />
        </div>
      ) : (
        /* 3. VICTORY / SYSTEM SECURED SCREEN (HIGH CONTRAST & ULTRA SLEEK) */
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 520,
            margin: "0 auto",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "110px 20px 40px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: "100%",
              borderRadius: 32,
              border: "2px solid #10b981",
              background: "linear-gradient(155deg, #09131f 0%, #0d1e2e 50%, #06111a 100%)",
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(16, 185, 129, 0.35)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Glowing Trophy Icon */}
            <div
              style={{
                width: 88,
                height: 88,
                margin: "0 auto 20px",
                borderRadius: 28,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.5)",
                border: "2px solid #34d399",
              }}
            >
              <Trophy style={{ width: 44, height: 44, color: "#ffffff" }} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>🎉</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.9rem",
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                  color: "#10b981",
                  textShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
                }}
              >
                SYSTEM SECURED!
              </h2>
            </div>

            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                fontWeight: 700,
                color: "#cbd5e1",
                lineHeight: 1.5,
              }}
            >
              All 4 cyber bugs eliminated! Mainframe restored to 100% integrity.
            </p>

            {/* Checklist of completed patches */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 20,
                padding: "16px 18px",
                textAlign: "left",
                marginBottom: 20,
              }}
            >
              {[
                "Patched String Literals (Missing Quote)",
                "Resolved Identifier Typo (agent_name)",
                "Corrected Arithmetic Logic (Shield Booster)",
                "Modernized Python 3 Print Syntax",
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  <CheckCircle2
                    style={{
                      width: 18,
                      height: 18,
                      color: "#34d399",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Rewards Callout */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 16,
                background: "rgba(245, 158, 11, 0.15)",
                border: "1.5px solid #f59e0b",
                color: "#fbbf24",
                fontWeight: 900,
                fontSize: 13,
                marginBottom: 24,
                boxShadow: "0 0 16px rgba(245, 158, 11, 0.2)",
              }}
            >
              <Sparkles style={{ width: 18, height: 18 }} />
              <span>+40 XP & Master Bug Hunter Badge Awarded</span>
            </div>

            {/* CTA Button with 3D tactile press */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 3 }}
            >
              <Link
                to="/world/school/computer"
                style={{
                  display: "block",
                  width: "100%",
                  height: 56,
                  lineHeight: "54px",
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "1.5px solid #34d399",
                  borderBottom: "5px solid #047857",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  textAlign: "center",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.45)",
                  transition: "all 0.15s ease",
                }}
              >
                RETURN TO COMPUTER LAB
              </Link>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
