import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const TOPICS = [
  { id: "addition", icon: "➕", name: "Addition", problems: 5, color: "#10B981" },
  { id: "subtraction", icon: "➖", name: "Subtraction", problems: 5, color: "#3B82F6" },
  { id: "multiplication", icon: "✕", name: "Multiplication", problems: 5, color: "#F59E0B" },
  { id: "division", icon: "➗", name: "Division", problems: 5, color: "#EF4444" },
  { id: "fractions", icon: "🍕", name: "Fractions", problems: 5, color: "#8B5CF6" },
  { id: "geometry", icon: "📐", name: "Geometry", problems: 5, color: "#EC4899" },
  { id: "area", icon: "📏", name: "Area & Perimeter", problems: 5, color: "#14B8A6" },
  { id: "decimals", icon: "🔢", name: "Decimals", problems: 5, color: "#6366F1" },
  { id: "algebra", icon: "🔤", name: "Basic Algebra", problems: 5, color: "#DC2626" },
];

export default function MathsProblems() {
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
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>🧩</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>
          Problem Solving
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 8, fontSize: "1.1rem" }}>
          Choose a topic and test your skills!
        </p>
      </motion.div>

      {/* Topics grid */}
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
              to={`/world/school/maths/problems/${topic.id}`}
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
                {/* Color bar */}
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 4,
                    background: topic.color, borderRadius: "18px 18px 0 0",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: `${topic.color}22`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.6rem",
                      }}
                    >
                      {topic.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                        {topic.name}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                        {topic.problems} problems
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "8px 18px", borderRadius: 10,
                      background: topic.color, color: "#fff",
                      fontWeight: 700, fontSize: "0.85rem",
                    }}
                  >
                    Practice →
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
