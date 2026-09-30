import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const RIVER_TOPICS = [
  { id: "addition", icon: "➕", name: "Addition River", desc: "Jump using addition skills", color: "#10B981" },
  { id: "subtraction", icon: "➖", name: "Subtraction River", desc: "Navigate using subtraction", color: "#3B82F6" },
  { id: "multiplication", icon: "✕", name: "Multiplication River", desc: "Cross with times tables", color: "#F59E0B" },
  { id: "division", icon: "➗", name: "Division River", desc: "Share your way across", color: "#EF4444" },
  { id: "mixed", icon: "🎲", name: "Mixed Challenge", desc: "A true test of all math skills", color: "#8B5CF6" },
];

export default function MathsRiverMenu() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Background decorations */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: ["-5%", "5%", "-5%"] }}
            transition={{ duration: 3 + i % 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: `${(i / 15) * 100}%`,
              left: "-10%", right: "-10%",
              height: "4px", background: "#fff",
              borderRadius: "50%", filter: "blur(2px)",
            }}
          />
        ))}
      </div>

      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/school/maths/games"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Back to Games
        </Link>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", paddingTop: 80, paddingBottom: 20, position: "relative", zIndex: 10 }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>🐸</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0, textShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
          River Crossing
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: "1.1rem" }}>
          Select a topic to start your timed challenge!
        </p>
      </motion.div>

      {/* Topics Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 20,
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px 24px 60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {RIVER_TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            style={{ flex: "1 1 280px", maxWidth: 340 }}
          >
            <Link
              to={`/world/school/maths/games/river/${topic.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: 24,
                  padding: "24px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 70, height: 70, borderRadius: "50%",
                    background: topic.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem", marginBottom: 16,
                    boxShadow: `0 8px 20px ${topic.color}66`
                  }}
                >
                  {topic.icon}
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                  {topic.name}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", margin: "0 0 20px", lineHeight: 1.4 }}>
                  {topic.desc}
                </p>
                <div
                  style={{
                    padding: "10px 24px", borderRadius: 12,
                    background: "#fff", color: topic.color,
                    fontWeight: 800, fontSize: "0.95rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    marginTop: "auto"
                  }}
                >
                  Play →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
