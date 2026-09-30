import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── FEMALE TEACHER SVG ─── */
function TeacherCharacter({ speaking }) {
  return (
    <motion.svg
      viewBox="0 0 200 340"
      width="200"
      height="340"
      style={{ overflow: "visible" }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Hair back */}
      <ellipse cx="100" cy="72" rx="56" ry="60" fill="#3D2314" />
      {/* Neck */}
      <rect x="88" y="115" width="24" height="22" rx="6" fill="#F5C5A3" />
      {/* Body / Dress */}
      <path d="M55 137 Q100 125 145 137 L155 250 Q100 260 45 250 Z" fill="#5B6ABF" />
      {/* Collar */}
      <path d="M78 137 Q100 152 122 137" stroke="#fff" strokeWidth="3" fill="none" />
      {/* Arms */}
      <path d="M55 150 Q30 185 40 220" stroke="#5B6ABF" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M145 150 Q170 185 160 220" stroke="#5B6ABF" strokeWidth="18" strokeLinecap="round" fill="none" />
      {/* Hands */}
      <circle cx="40" cy="224" r="10" fill="#F5C5A3" />
      <circle cx="160" cy="224" r="10" fill="#F5C5A3" />
      {/* Book in left hand */}
      <rect x="22" y="212" width="28" height="20" rx="3" fill="#EF4444" transform="rotate(-10 36 222)" />
      <rect x="24" y="214" width="24" height="16" rx="2" fill="#FCA5A5" transform="rotate(-10 36 222)" />
      {/* Head */}
      <ellipse cx="100" cy="80" rx="42" ry="46" fill="#F5C5A3" />
      {/* Hair front */}
      <path d="M58 72 Q60 35 100 30 Q140 35 142 72 Q140 55 120 50 Q100 48 80 50 Q60 55 58 72Z" fill="#3D2314" />
      {/* Hair sides */}
      <path d="M58 72 Q50 90 54 115 Q56 95 62 80Z" fill="#3D2314" />
      <path d="M142 72 Q150 90 146 115 Q144 95 138 80Z" fill="#3D2314" />
      {/* Hair bun */}
      <circle cx="100" cy="28" r="18" fill="#3D2314" />
      <circle cx="100" cy="26" r="14" fill="#4A2E1C" />
      {/* Glasses */}
      <circle cx="84" cy="78" r="14" fill="none" stroke="#8B7355" strokeWidth="2.5" />
      <circle cx="116" cy="78" r="14" fill="none" stroke="#8B7355" strokeWidth="2.5" />
      <line x1="98" y1="78" x2="102" y2="78" stroke="#8B7355" strokeWidth="2.5" />
      <line x1="70" y1="76" x2="60" y2="72" stroke="#8B7355" strokeWidth="2" />
      <line x1="130" y1="76" x2="140" y2="72" stroke="#8B7355" strokeWidth="2" />
      {/* Eyes */}
      <ellipse cx="84" cy="78" rx="5" ry="6" fill="#2D1B0E" />
      <ellipse cx="116" cy="78" rx="5" ry="6" fill="#2D1B0E" />
      <circle cx="82" cy="76" r="2" fill="#fff" />
      <circle cx="114" cy="76" r="2" fill="#fff" />
      {/* Eyebrows */}
      <path d="M74 66 Q84 62 94 66" stroke="#3D2314" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M106 66 Q116 62 126 66" stroke="#3D2314" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M98 85 Q100 90 102 85" stroke="#E0A882" strokeWidth="1.5" fill="none" />
      {/* Mouth */}
      <motion.path
        d={speaking ? "M88 98 Q100 110 112 98" : "M90 98 Q100 105 110 98"}
        stroke="#D4636A"
        strokeWidth="2.5"
        fill={speaking ? "#E88B93" : "none"}
        strokeLinecap="round"
        animate={speaking ? { d: ["M88 98 Q100 110 112 98", "M90 98 Q100 106 110 98", "M88 98 Q100 110 112 98"] } : {}}
        transition={speaking ? { duration: 0.4, repeat: Infinity } : {}}
      />
      {/* Blush */}
      <circle cx="72" cy="92" r="8" fill="#FFB5B5" opacity="0.3" />
      <circle cx="128" cy="92" r="8" fill="#FFB5B5" opacity="0.3" />
      {/* Skirt */}
      <path d="M45 248 Q100 265 155 248 L165 310 Q100 325 35 310 Z" fill="#4A5699" />
      {/* Legs */}
      <rect x="75" y="305" width="14" height="30" rx="5" fill="#F5C5A3" />
      <rect x="111" y="305" width="14" height="30" rx="5" fill="#F5C5A3" />
      {/* Shoes */}
      <ellipse cx="82" cy="338" rx="14" ry="6" fill="#2D1B0E" />
      <ellipse cx="118" cy="338" rx="14" ry="6" fill="#2D1B0E" />
    </motion.svg>
  );
}

/* ─── SPEECH BUBBLE ─── */
function SpeechBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: 20,
        padding: "18px 22px",
        maxWidth: 280,
        fontSize: "0.95rem",
        lineHeight: 1.6,
        color: "#1e293b",
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      }}
    >
      {text}
      {/* Triangle pointer */}
      <div
        style={{
          position: "absolute",
          bottom: -12,
          left: 30,
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "14px solid #fff",
        }}
      />
    </motion.div>
  );
}

/* ─── VISUAL COMPONENTS ─── */
function BlocksVisual({ a, b, op }) {
  const renderBlocks = (count, color) =>
    Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.08 }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.8rem",
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        }}
      >
        {i + 1}
      </motion.div>
    ));

  const result = op === "add" ? a + b : Math.max(a - b, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {renderBlocks(a, "#3B82F6")}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFD700" }}>
        {op === "add" ? "+" : "−"}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {renderBlocks(b, op === "add" ? "#10B981" : "#EF4444")}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFD700" }}>=</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {renderBlocks(result, "#F59E0B")}
      </div>
    </div>
  );
}

function GridVisual({ rows, cols }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 32px)`, gap: 4 }}>
        {Array.from({ length: rows * cols }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#8B5CF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          >
            •
          </motion.div>
        ))}
      </div>
      <div style={{ color: "#FFD700", fontWeight: 700, fontSize: "1.1rem" }}>
        {rows} × {cols} = {rows * cols}
      </div>
    </div>
  );
}

function DivisionVisual({ total, groups }) {
  const perGroup = Math.floor(total / groups);
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      {Array.from({ length: groups }, (_, g) => (
        <motion.div
          key={g}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: g * 0.15 }}
          style={{
            border: "2px dashed rgba(255,255,255,0.4)",
            borderRadius: 14,
            padding: 12,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            width: 80,
            justifyContent: "center",
          }}
        >
          {Array.from({ length: perGroup }, (_, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#F59E0B",
              }}
            />
          ))}
          <div style={{ width: "100%", textAlign: "center", color: "#fff", fontSize: "0.75rem", marginTop: 4 }}>
            Group {g + 1}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FractionVisual({ numerator, denominator }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {Array.from({ length: denominator }, (_, i) => {
          const angle = (360 / denominator) * i - 90;
          const nextAngle = (360 / denominator) * (i + 1) - 90;
          const rad = (a) => (a * Math.PI) / 180;
          const x1 = 80 + 70 * Math.cos(rad(angle));
          const y1 = 80 + 70 * Math.sin(rad(angle));
          const x2 = 80 + 70 * Math.cos(rad(nextAngle));
          const y2 = 80 + 70 * Math.sin(rad(nextAngle));
          const large = 360 / denominator > 180 ? 1 : 0;
          return (
            <motion.path
              key={i}
              d={`M80 80 L${x1} ${y1} A70 70 0 ${large} 1 ${x2} ${y2} Z`}
              fill={i < numerator ? "#F59E0B" : "rgba(255,255,255,0.15)"}
              stroke="#1e293b"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ transformOrigin: "80px 80px" }}
            />
          );
        })}
      </svg>
      <div style={{ color: "#FFD700", fontWeight: 700, fontSize: "1.3rem" }}>
        {numerator}/{denominator}
      </div>
    </div>
  );
}

function AreaVisual({ width, height }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          width: width * 40,
          height: height * 40,
          border: "3px solid #FFD700",
          background: "rgba(245, 158, 11, 0.2)",
          borderRadius: 8,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#FFD700", fontWeight: 700 }}>{width * height} sq units</span>
        {/* Width label */}
        <div style={{ position: "absolute", bottom: -28, color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
          Width = {width}
        </div>
        {/* Height label */}
        <div style={{ position: "absolute", right: -70, top: "50%", transform: "translateY(-50%)", color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
          Height = {height}
        </div>
      </motion.div>
    </div>
  );
}

function ShapeVisual({ shape }) {
  const shapes = {
    triangle: <polygon points="80,10 10,150 150,150" fill="rgba(139,92,246,0.3)" stroke="#8B5CF6" strokeWidth="3" />,
    square: <rect x="20" y="20" width="120" height="120" fill="rgba(59,130,246,0.3)" stroke="#3B82F6" strokeWidth="3" rx="4" />,
    circle: <circle cx="80" cy="80" r="65" fill="rgba(236,72,153,0.3)" stroke="#EC4899" strokeWidth="3" />,
    pentagon: <polygon points="80,10 150,58 125,145 35,145 10,58" fill="rgba(245,158,11,0.3)" stroke="#F59E0B" strokeWidth="3" />,
  };
  return (
    <motion.svg width="160" height="160" viewBox="0 0 160 160" initial={{ rotate: -10, scale: 0 }} animate={{ rotate: 0, scale: 1 }}>
      {shapes[shape] || shapes.triangle}
    </motion.svg>
  );
}

function NumberLineVisual({ value }) {
  return (
    <div style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}>
      <svg width="300" height="60" viewBox="0 0 300 60">
        <line x1="20" y1="35" x2="280" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        {[0, 0.25, 0.5, 0.75, 1.0].map((v, i) => (
          <g key={i}>
            <line x1={20 + i * 65} y1="28" x2={20 + i * 65} y2="42" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <text x={20 + i * 65} y="55" fill="#fff" fontSize="11" textAnchor="middle">{v}</text>
          </g>
        ))}
        <motion.circle
          cx={20 + (value / 1.0) * 260}
          cy="35"
          r="8"
          fill="#F59E0B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
        <text x={20 + (value / 1.0) * 260} y="18" fill="#FFD700" fontSize="13" fontWeight="700" textAnchor="middle">{value}</text>
      </svg>
    </div>
  );
}

function AlgebraVisual({ equation, variable, answer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFD700" }}>{equation}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: "1.3rem", fontWeight: 700, color: "#10B981" }}
      >
        {variable} = {answer}
      </motion.div>
    </div>
  );
}

/* ─── LESSON DATA ─── */
const LESSONS = {
  addition: {
    name: "Addition",
    icon: "➕",
    color: "#10B981",
    steps: [
      {
        title: "What is Addition?",
        teacherSays: "Hello! 😊 Addition means putting numbers together to find a total. When you combine groups, you add!",
        visual: () => <div style={{ fontSize: "4rem", textAlign: "center" }}>🍎 + 🍎 = 🍎🍎</div>,
      },
      {
        title: "Let's Add Blocks!",
        teacherSays: "Let's try 3 + 2. We take 3 blue blocks and 2 green blocks. Count them all together!",
        visual: () => <BlocksVisual a={3} b={2} op="add" />,
      },
      {
        title: "Bigger Numbers",
        teacherSays: "Now let's try 5 + 4. The more blocks we combine, the bigger our answer gets!",
        visual: () => <BlocksVisual a={5} b={4} op="add" />,
      },
      {
        title: "The Rule",
        teacherSays: "Remember: Addition always makes numbers BIGGER! The answer is always more than what you started with. 💡",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontSize: "1.3rem", fontWeight: 700 }}>
            <div style={{ marginBottom: 16 }}>a + b = Total</div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              {["2+3=5", "4+6=10", "7+8=15"].map((eq) => (
                <motion.div key={eq} whileHover={{ scale: 1.1 }} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px" }}>{eq}</motion.div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  subtraction: {
    name: "Subtraction",
    icon: "➖",
    color: "#3B82F6",
    steps: [
      {
        title: "What is Subtraction?",
        teacherSays: "Subtraction means taking away! When you remove items from a group, you subtract. 🎈",
        visual: () => <div style={{ fontSize: "3rem", textAlign: "center" }}>🎈🎈🎈🎈🎈 − 🎈🎈 = 🎈🎈🎈</div>,
      },
      {
        title: "Let's Subtract Blocks",
        teacherSays: "We have 5 blocks. Let's take away 2. How many are left?",
        visual: () => <BlocksVisual a={5} b={2} op="sub" />,
      },
      {
        title: "Practice More",
        teacherSays: "Now try 7 minus 3. We remove 3 red blocks from our 7 blue blocks!",
        visual: () => <BlocksVisual a={7} b={3} op="sub" />,
      },
      {
        title: "The Rule",
        teacherSays: "Subtraction always makes the number SMALLER! The answer is less than what you started with. 📝",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontSize: "1.3rem", fontWeight: 700 }}>
            <div style={{ marginBottom: 16 }}>a − b = Difference</div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              {["8−3=5", "10−4=6", "15−7=8"].map((eq) => (
                <motion.div key={eq} whileHover={{ scale: 1.1 }} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px" }}>{eq}</motion.div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  multiplication: {
    name: "Multiplication",
    icon: "✕",
    color: "#F59E0B",
    steps: [
      {
        title: "What is Multiplication?",
        teacherSays: "Multiplication is repeated addition! Instead of adding 3+3+3, we say 3 × 3. It's a shortcut! ⚡",
        visual: () => <div style={{ fontSize: "2rem", textAlign: "center", color: "#FFD700", fontWeight: 700 }}>3 + 3 + 3 = 3 × 3 = 9</div>,
      },
      {
        title: "Dots in a Grid",
        teacherSays: "Look at this grid! 3 rows and 4 columns. Count all the dots — that's 3 × 4!",
        visual: () => <GridVisual rows={3} cols={4} />,
      },
      {
        title: "Another Example",
        teacherSays: "Now let's try 5 × 3. That's 5 rows with 3 dots each!",
        visual: () => <GridVisual rows={5} cols={3} />,
      },
      {
        title: "Times Tables Tip",
        teacherSays: "Multiplication makes numbers grow fast! Practice your times tables — they're super useful! 🌟",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontSize: "1.1rem", fontWeight: 700 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[..."2×3=6", "4×5=20", "6×7=42", "3×8=24", "9×2=18", "5×5=25"].map((eq, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: "0.95rem" }}>{eq}</motion.div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  division: {
    name: "Division",
    icon: "➗",
    color: "#EF4444",
    steps: [
      {
        title: "What is Division?",
        teacherSays: "Division means sharing equally! If you have 12 cookies and 3 friends, how many does each get? 🍪",
        visual: () => <div style={{ fontSize: "2.5rem", textAlign: "center" }}>🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪 ÷ 3 = ?</div>,
      },
      {
        title: "Sharing into Groups",
        teacherSays: "Let's divide 12 items into 3 equal groups. Each group gets 4!",
        visual: () => <DivisionVisual total={12} groups={3} />,
      },
      {
        title: "Another Example",
        teacherSays: "Now 8 divided by 4. We split 8 items into 4 groups. Each group gets 2!",
        visual: () => <DivisionVisual total={8} groups={4} />,
      },
      {
        title: "Division is Reverse Multiplication",
        teacherSays: "If 3 × 4 = 12, then 12 ÷ 3 = 4! Division undoes multiplication. They're best friends! 🤝",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontSize: "1.2rem", fontWeight: 700 }}>
            <div>3 × 4 = 12 ↔ 12 ÷ 3 = 4</div>
            <div style={{ marginTop: 10 }}>5 × 6 = 30 ↔ 30 ÷ 5 = 6</div>
          </div>
        ),
      },
    ],
  },
  fractions: {
    name: "Fractions",
    icon: "🍕",
    color: "#8B5CF6",
    steps: [
      {
        title: "What are Fractions?",
        teacherSays: "A fraction is a part of a whole! When you cut a pizza into 4 slices and eat 1, you ate 1/4! 🍕",
        visual: () => <FractionVisual numerator={1} denominator={4} />,
      },
      {
        title: "Numerator & Denominator",
        teacherSays: "The top number (numerator) tells how many parts we have. The bottom (denominator) tells total parts!",
        visual: () => <FractionVisual numerator={3} denominator={8} />,
      },
      {
        title: "Half and Quarter",
        teacherSays: "1/2 means one out of two equal parts — that's half! 1/4 is one quarter. See the difference?",
        visual: () => (
          <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}><FractionVisual numerator={1} denominator={2} /><div style={{ color: "#fff", marginTop: 8 }}>Half</div></div>
            <div style={{ textAlign: "center" }}><FractionVisual numerator={1} denominator={4} /><div style={{ color: "#fff", marginTop: 8 }}>Quarter</div></div>
          </div>
        ),
      },
      {
        title: "Fractions in Real Life",
        teacherSays: "We use fractions everywhere! Half a glass of water, a quarter hour, three-fourths of a cake! 🎂",
        visual: () => <FractionVisual numerator={3} denominator={4} />,
      },
    ],
  },
  geometry: {
    name: "Geometry",
    icon: "📐",
    color: "#EC4899",
    steps: [
      {
        title: "What is Geometry?",
        teacherSays: "Geometry is the study of shapes and spaces! Let's explore different shapes together! 📐",
        visual: () => (
          <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            <ShapeVisual shape="triangle" />
            <ShapeVisual shape="square" />
            <ShapeVisual shape="circle" />
          </div>
        ),
      },
      {
        title: "Triangles",
        teacherSays: "A triangle has 3 sides and 3 corners (vertices). The angles inside always add up to 180°! 🔺",
        visual: () => <ShapeVisual shape="triangle" />,
      },
      {
        title: "Squares & Rectangles",
        teacherSays: "Squares have 4 equal sides and 4 right angles (90°). Rectangles have opposite sides equal!",
        visual: () => <ShapeVisual shape="square" />,
      },
      {
        title: "Circles",
        teacherSays: "A circle has no corners and no straight sides. Every point on a circle is the same distance from the center! ⭕",
        visual: () => <ShapeVisual shape="circle" />,
      },
    ],
  },
  area: {
    name: "Area & Perimeter",
    icon: "📏",
    color: "#14B8A6",
    steps: [
      {
        title: "What is Area?",
        teacherSays: "Area is the space inside a shape! Think of it as how much paint you'd need to fill it. 🎨",
        visual: () => <AreaVisual width={4} height={3} />,
      },
      {
        title: "Area of a Rectangle",
        teacherSays: "For a rectangle: Area = Length × Width. A 5×3 rectangle has an area of 15 square units!",
        visual: () => <AreaVisual width={5} height={3} />,
      },
      {
        title: "What is Perimeter?",
        teacherSays: "Perimeter is the distance around a shape — like putting a fence around your garden! 🌻",
        visual: () => (
          <div style={{ textAlign: "center" }}>
            <AreaVisual width={4} height={3} />
            <div style={{ color: "#10B981", fontWeight: 700, marginTop: 30, fontSize: "1.1rem" }}>
              Perimeter = 2 × (4 + 3) = 14 units
            </div>
          </div>
        ),
      },
      {
        title: "Area vs Perimeter",
        teacherSays: "Area measures the inside space. Perimeter measures the outside boundary. Both are important! ✨",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontWeight: 700, fontSize: "1.1rem" }}>
            <div>Rectangle: L=6, W=4</div>
            <div style={{ marginTop: 8 }}>Area = 6 × 4 = 24 sq units</div>
            <div>Perimeter = 2(6+4) = 20 units</div>
          </div>
        ),
      },
    ],
  },
  decimals: {
    name: "Decimals",
    icon: "🔢",
    color: "#6366F1",
    steps: [
      {
        title: "What are Decimals?",
        teacherSays: "Decimals are numbers between whole numbers! Like 0.5 is between 0 and 1. They use a dot (.) 🔢",
        visual: () => <NumberLineVisual value={0.5} />,
      },
      {
        title: "Understanding Place Value",
        teacherSays: "After the decimal point: first digit = tenths, second = hundredths. So 0.75 = 7 tenths + 5 hundredths!",
        visual: () => <NumberLineVisual value={0.75} />,
      },
      {
        title: "Adding Decimals",
        teacherSays: "Adding decimals is like adding whole numbers — just line up the dots! 0.3 + 0.4 = 0.7",
        visual: () => (
          <div style={{ textAlign: "center", color: "#FFD700", fontWeight: 700, fontSize: "1.5rem" }}>
            <div>0.3 + 0.4 = 0.7</div>
            <div style={{ marginTop: 16 }}><NumberLineVisual value={0.7} /></div>
          </div>
        ),
      },
      {
        title: "Decimals & Fractions",
        teacherSays: "Decimals and fractions are related! 0.5 = 1/2, 0.25 = 1/4, 0.75 = 3/4. Cool, right? 😎",
        visual: () => (
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ d: 0.5, f: "1/2" }, { d: 0.25, f: "1/4" }, { d: 0.75, f: "3/4" }].map((item) => (
              <div key={item.f} style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 20px" }}>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: "1.2rem" }}>{item.d}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>= {item.f}</div>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  algebra: {
    name: "Basic Algebra",
    icon: "🔤",
    color: "#DC2626",
    steps: [
      {
        title: "What is Algebra?",
        teacherSays: "Algebra uses letters to represent unknown numbers! Instead of '? + 3 = 7', we write 'x + 3 = 7'. 🔍",
        visual: () => <AlgebraVisual equation="x + 3 = 7" variable="x" answer={4} />,
      },
      {
        title: "Finding the Unknown",
        teacherSays: "To find x, we do the opposite operation! If x + 5 = 12, subtract 5 from both sides: x = 7!",
        visual: () => <AlgebraVisual equation="x + 5 = 12" variable="x" answer={7} />,
      },
      {
        title: "Subtraction Equations",
        teacherSays: "If x − 4 = 6, add 4 to both sides: x = 10! We always balance both sides. ⚖️",
        visual: () => <AlgebraVisual equation="x − 4 = 6" variable="x" answer={10} />,
      },
      {
        title: "Multiplication Equations",
        teacherSays: "If 3 × x = 15, divide both sides by 3: x = 5! Algebra is like being a detective! 🕵️",
        visual: () => <AlgebraVisual equation="3 × x = 15" variable="x" answer={5} />,
      },
    ],
  },
};

/* ─── MAIN COMPONENT ─── */
export default function MathsLesson() {
  const { topicId } = useParams();
  const [step, setStep] = useState(0);

  const lesson = LESSONS[topicId];

  if (!lesson) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🤔</div>
          <h2>Topic not found</h2>
          <Link to="/world/school/maths/teaching" style={{ color: "#3B82F6", marginTop: 12, display: "block" }}>← Back to Topics</Link>
        </div>
      </div>
    );
  }

  const currentStep = lesson.steps[step];
  const totalSteps = lesson.steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

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
          to="/world/school/maths/teaching"
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

      {/* Topic title */}
      <div style={{ textAlign: "center", paddingTop: 24 }}>
        <span style={{ fontSize: "1.5rem" }}>{lesson.icon}</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", marginLeft: 8 }}>{lesson.name}</span>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 600, margin: "16px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 6 }}>
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: lesson.color, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Main lesson area */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 32,
          padding: "30px 24px 40px",
          flexWrap: "wrap",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* Teacher section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minWidth: 240 }}>
          <AnimatePresence mode="wait">
            <SpeechBubble key={step} text={currentStep.teacherSays} />
          </AnimatePresence>
          <TeacherCharacter speaking={true} />
        </div>

        {/* Chalkboard */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          style={{
            flex: "1 1 420px",
            maxWidth: 560,
            minHeight: 340,
            background: "linear-gradient(145deg, #1B5E20 0%, #2E7D32 30%, #1B5E20 100%)",
            borderRadius: 20,
            border: "8px solid #5D4037",
            boxShadow: "0 15px 50px rgba(0,0,0,0.4), inset 0 2px 10px rgba(0,0,0,0.3)",
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <h3 style={{ color: "#FFD700", fontSize: "1.3rem", fontWeight: 700, margin: 0, textAlign: "center" }}>
            {currentStep.title}
          </h3>
          <div style={{ marginTop: 8, width: "100%" }}>
            {currentStep.visual()}
          </div>
        </motion.div>
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingBottom: 40 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "12px 24px", borderRadius: 14,
            background: step === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
            color: step === 0 ? "rgba(255,255,255,0.3)" : "#fff",
            fontWeight: 700, fontSize: "0.95rem",
            border: "none", cursor: step === 0 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} /> Previous
        </motion.button>

        {step < totalSteps - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 24px", borderRadius: 14,
              background: lesson.color,
              color: "#fff", fontWeight: 700, fontSize: "0.95rem",
              border: "none", cursor: "pointer",
              boxShadow: `0 6px 20px ${lesson.color}66`,
            }}
          >
            Next <ChevronRight style={{ width: 18, height: 18 }} />
          </motion.button>
        ) : (
          <Link
            to="/world/school/maths/teaching"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 24px", borderRadius: 14,
              background: "#10B981",
              color: "#fff", fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(16,185,129,0.4)",
            }}
          >
            ✅ Complete!
          </Link>
        )}
      </div>
    </div>
  );
}
