import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const FLOATING_EMOJIS = ["➗", "✕", "➕", "➖", "📐", "🔢", "🧮", "📈", "🧠", "π"];

function FloatingEmoji({ emoji, index }) {
  const left = 5 + (index * 17) % 90;
  const duration = 6 + (index % 4) * 2;
  const delay = index * 0.7;
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-40px",
        fontSize: "2rem",
        opacity: 0.15,
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        y: ["0vh", "105vh"],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {emoji}
    </motion.div>
  );
}

const SECTIONS = [
  {
    id: "teaching",
    icon: "📚",
    title: "Learn Concepts",
    description: "Learn maths with your interactive teacher! She'll guide you through each topic step by step.",
    route: "/world/school/maths/teaching",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    shadow: "0 20px 60px rgba(102, 126, 234, 0.4)",
    hoverShadow: "0 25px 80px rgba(102, 126, 234, 0.6)",
  },
  {
    id: "problems",
    icon: "🧩",
    title: "Problem Solving",
    description: "Practice problems and test your skills! Solve quizzes, earn stars, and become a math champion.",
    route: "/world/school/maths/problems",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    shadow: "0 20px 60px rgba(245, 87, 108, 0.4)",
    hoverShadow: "0 25px 80px rgba(245, 87, 108, 0.6)",
  },
  {
    id: "games",
    icon: "🎮",
    title: "Math Games",
    description: "Play fun games like River Crossing to test your quick-thinking math skills!",
    route: "/world/school/maths/games",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    shadow: "0 20px 60px rgba(67, 233, 123, 0.4)",
    hoverShadow: "0 25px 80px rgba(67, 233, 123, 0.6)",
  },
];

export default function MathsHub() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Floating emojis background */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}

      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/school"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Back to School
        </Link>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "20px",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 50 }}
        >
          <div style={{ fontSize: "4rem", marginBottom: 8 }}>🧮</div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Mathematics
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "rgba(255,255,255,0.6)",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Choose your adventure — learn new concepts or solve problems!
          </p>
        </motion.div>

        {/* Two section cards */}
        <div
          style={{
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 1200,
          }}
        >
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: "1 1 340px", maxWidth: 420 }}
            >
              <Link to={section.route} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: section.gradient,
                    borderRadius: 24,
                    padding: "48px 36px",
                    boxShadow: section.shadow,
                    transition: "box-shadow 0.3s",
                    cursor: "pointer",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>{section.icon}</div>
                    <h2
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: "#fff",
                        margin: "0 0 12px 0",
                      }}
                    >
                      {section.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {section.description}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: 28,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      width: "fit-content",
                    }}
                  >
                    Start →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
