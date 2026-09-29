import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const TOPICS = [
  { id: "addition", icon: "➕", name: "Addition", desc: "Learn how to add numbers together", difficulty: "Easy", color: "#10B981" },
  { id: "subtraction", icon: "➖", name: "Subtraction", desc: "Learn how to subtract numbers", difficulty: "Easy", color: "#3B82F6" },
  { id: "multiplication", icon: "✕", name: "Multiplication", desc: "Learn how to multiply numbers", difficulty: "Medium", color: "#F59E0B" },
  { id: "division", icon: "➗", name: "Division", desc: "Learn how to divide numbers", difficulty: "Medium", color: "#EF4444" },
  { id: "fractions", icon: "🍕", name: "Fractions", desc: "Understand parts of a whole", difficulty: "Medium", color: "#8B5CF6" },
  { id: "geometry", icon: "📐", name: "Geometry", desc: "Explore shapes and angles", difficulty: "Medium", color: "#EC4899" },
  { id: "area", icon: "📏", name: "Area & Perimeter", desc: "Calculate space and boundaries", difficulty: "Medium", color: "#14B8A6" },
  { id: "decimals", icon: "🔢", name: "Decimals", desc: "Work with decimal numbers", difficulty: "Medium", color: "#6366F1" },
  { id: "algebra", icon: "🔤", name: "Basic Algebra", desc: "Intro to variables and equations", difficulty: "Hard", color: "#DC2626" },
];

const diffColors = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };

export default function MathsTeaching() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/school/maths"
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
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>📚</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>
          Learn Mathematics
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 8, fontSize: "1.1rem" }}>
          Choose a topic to start learning with your teacher
        </p>
      </motion.div>

      {/* Topic grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 24px 60px",
        }}
      >
        {TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to={`/world/school/maths/teaching/${topic.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 18,
                  padding: "28px 24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Color accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: topic.color,
                    borderRadius: "18px 18px 0 0",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `${topic.color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                    }}
                  >
                    {topic.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                      {topic.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: diffColors[topic.difficulty],
                        background: `${diffColors[topic.difficulty]}22`,
                        padding: "2px 10px",
                        borderRadius: 20,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {topic.desc}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: "0.85rem",
                    color: topic.color,
                    fontWeight: 700,
                  }}
                >
                  Start Learning →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
