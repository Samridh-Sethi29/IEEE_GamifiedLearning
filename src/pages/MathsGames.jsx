import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const GAMES = [
  { 
    id: "river", 
    icon: "🐸", 
    name: "River Crossing", 
    desc: "Type the correct answers to jump across the river stones!", 
    color: "#10B981",
    bg: "linear-gradient(135deg, #0f766e 0%, #064e3b 100%)"
  },
  // Future games can be added here
];

export default function MathsGames() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "linear-gradient(135deg, #134e4a 0%, #064e3b 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/school/maths"
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", paddingTop: 80, paddingBottom: 20 }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>🎮</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>
          Math Games
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 8, fontSize: "1.1rem" }}>
          Play, learn, and have fun!
        </p>
      </motion.div>

      {/* Games grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 24px 60px",
        }}
      >
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to={`/world/school/maths/games/${game.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: game.bg,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 18,
                  padding: "28px 24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                }}
              >
                {/* Color bar */}
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 4,
                    background: game.color, borderRadius: "18px 18px 0 0",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: `rgba(255,255,255,0.15)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2.2rem",
                      }}
                    >
                      {game.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: "0 0 4px 0" }}>
                        {game.name}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.4 }}>
                        {game.desc}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    padding: "10px 18px", borderRadius: 12,
                    background: game.color, color: "#fff",
                    fontWeight: 700, fontSize: "0.95rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  Play Game →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
