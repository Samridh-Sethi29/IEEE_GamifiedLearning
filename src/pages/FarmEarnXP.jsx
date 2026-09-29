import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, RotateCcw, Coins, Zap, ChevronRight } from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

/* ─────────────────────── QUESTION BANK ─────────────────────── */
const CATEGORIES = [
  {
    id: "crops",
    name: "Crops & Seasons",
    icon: "🌾",
    color: "#10B981",
    questions: [
      { q: "Which season is best for growing wheat in India?", opts: ["Summer (Zaid)", "Winter (Rabi)", "Monsoon (Kharif)", "Autumn"], correct: 1, xp: 10, hint: "Wheat is a cold-season crop sown around November." },
      { q: "Rice is primarily a _____ crop.", opts: ["Rabi", "Zaid", "Kharif", "Cash"], correct: 2, xp: 10, hint: "Rice needs lots of water, which the monsoon provides." },
      { q: "What is the process of loosening soil before planting called?", opts: ["Harvesting", "Tilling", "Sowing", "Irrigation"], correct: 1, xp: 10, hint: "Think about breaking up the ground with a plow." },
      { q: "Which crop is known as 'White Gold'?", opts: ["Rice", "Wheat", "Cotton", "Sugarcane"], correct: 2, xp: 15, hint: "It's fluffy and white and used for clothes." },
      { q: "Crop rotation helps to:", opts: ["Kill all insects", "Maintain soil fertility", "Increase water use", "Reduce sunlight"], correct: 1, xp: 15, hint: "Different crops take different nutrients from the soil." },
      { q: "Which of these is a leguminous crop that fixes nitrogen?", opts: ["Wheat", "Rice", "Peas", "Cotton"], correct: 2, xp: 15, hint: "Legumes have root nodules with nitrogen-fixing bacteria." },
      { q: "What is the ideal pH level for most crops?", opts: ["2-3 (very acidic)", "6-7 (slightly acidic to neutral)", "9-10 (alkaline)", "12-14 (very alkaline)"], correct: 1, xp: 20, hint: "Most plants like conditions close to neutral." },
    ],
  },
  {
    id: "pesticides",
    name: "Pesticides & Protection",
    icon: "🧪",
    color: "#EF4444",
    questions: [
      { q: "What are pesticides used for?", opts: ["Watering crops", "Killing pests", "Painting fences", "Plowing fields"], correct: 1, xp: 10, hint: "The word 'pest' is right in the name!" },
      { q: "Which of these is an organic method of pest control?", opts: ["Spraying DDT", "Using neem oil", "Using bleach", "Burning crops"], correct: 1, xp: 10, hint: "Think natural, plant-based solutions." },
      { q: "Excessive use of chemical pesticides can cause:", opts: ["Better crop quality", "Soil pollution", "More rainfall", "Bigger seeds"], correct: 1, xp: 15, hint: "Chemicals don't just disappear — they stay in the ground." },
      { q: "Biological pest control uses _____ to fight pests.", opts: ["Fire", "Natural predators", "More chemicals", "Salt water"], correct: 1, xp: 15, hint: "Ladybugs eat aphids — that's a hint!" },
      { q: "IPM stands for:", opts: ["Internal Pest Method", "Integrated Pest Management", "Industrial Pest Machine", "International Plant Monitor"], correct: 1, xp: 20, hint: "It's a strategy that combines multiple methods." },
      { q: "Which insect is a friend to farmers?", opts: ["Locust", "Aphid", "Ladybug", "Bollworm"], correct: 2, xp: 10, hint: "This red-and-black beetle eats harmful aphids." },
      { q: "What is 'companion planting'?", opts: ["Planting two farmers together", "Growing plants that help each other nearby", "Planting crops in a circle", "Using only one type of seed"], correct: 1, xp: 15, hint: "Marigolds near tomatoes repel certain pests!" },
    ],
  },
  {
    id: "equipment",
    name: "Farm Equipment",
    icon: "🚜",
    color: "#F59E0B",
    questions: [
      { q: "What is a plough used for?", opts: ["Cutting crops", "Turning & loosening soil", "Spraying water", "Storing grain"], correct: 1, xp: 10, hint: "Think about preparing the field before planting." },
      { q: "A combine harvester is used for:", opts: ["Planting seeds", "Irrigating fields", "Cutting, threshing & cleaning grain", "Spraying pesticides"], correct: 2, xp: 15, hint: "It 'combines' multiple harvest steps into one machine." },
      { q: "Drip irrigation saves water by:", opts: ["Flooding the field", "Delivering water directly to roots", "Spraying water in the air", "Using sea water"], correct: 1, xp: 15, hint: "Water drips slowly right where the plant needs it." },
      { q: "Which tool is used for cutting mature crops?", opts: ["Axe", "Sickle", "Hammer", "Saw"], correct: 1, xp: 10, hint: "It's a curved blade used at harvest time." },
      { q: "What does a seed drill do?", opts: ["Drills holes in rocks", "Plants seeds at equal distance & depth", "Removes weeds", "Waters the field"], correct: 1, xp: 15, hint: "It ensures seeds are evenly spaced in the soil." },
      { q: "Greenhouses help farmers by:", opts: ["Blocking all sunlight", "Controlling temperature & humidity", "Making crops taste green", "Removing all insects forever"], correct: 1, xp: 20, hint: "Think of a protected, controlled environment." },
      { q: "What is a winnowing fan used for?", opts: ["Cooling farmers", "Separating grain from chaff", "Drying clothes", "Generating electricity"], correct: 1, xp: 10, hint: "Wind blows away the light chaff, heavier grain stays." },
    ],
  },
  {
    id: "soil",
    name: "Soil & Fertilizers",
    icon: "🪱",
    color: "#8B5CF6",
    questions: [
      { q: "Humus is formed by:", opts: ["Mixing chemicals", "Decomposition of organic matter", "Burning plastic", "Watering sand"], correct: 1, xp: 10, hint: "Dead leaves, organisms decompose to form it." },
      { q: "Which type of soil holds the most water?", opts: ["Sandy", "Clayey", "Loamy", "Rocky"], correct: 1, xp: 15, hint: "Its tiny particles pack tightly together." },
      { q: "NPK fertilizer provides which three nutrients?", opts: ["Neon, Potassium, Krypton", "Nitrogen, Phosphorus, Potassium", "Nickel, Platinum, Kryptonite", "Sodium, Protein, Calcium"], correct: 1, xp: 15, hint: "N, P, and K are the chemical symbols on the periodic table." },
      { q: "Vermicomposting uses _____ to make fertilizer.", opts: ["Chemicals", "Fire", "Earthworms", "Plastic"], correct: 2, xp: 10, hint: "'Vermi' comes from the Latin word for worm." },
      { q: "What is mulching?", opts: ["Painting the soil", "Covering soil to retain moisture", "Removing all plants", "Freezing the ground"], correct: 1, xp: 15, hint: "Straw or leaves on top of soil help keep water in." },
      { q: "Sandy soil is good for growing:", opts: ["Rice", "Carrots & potatoes", "Water lilies", "Mushrooms"], correct: 1, xp: 10, hint: "Root vegetables grow easily in loose, well-drained soil." },
      { q: "Over-use of chemical fertilizers leads to:", opts: ["Healthier soil forever", "Soil degradation", "More earthworms", "Better rainfall"], correct: 1, xp: 20, hint: "Too much of anything is bad." },
    ],
  },
];

/* ─────────────── SVG FARMER CHARACTER ─────────────── */
const FarmerAvatar = ({ speaking }) => (
  <motion.svg
    viewBox="0 0 140 200"
    width="140"
    height="200"
    animate={speaking ? { y: [0, -5, 0] } : {}}
    transition={{ duration: 2, repeat: Infinity }}
  >
    {/* Hat */}
    <ellipse cx="70" cy="42" rx="52" ry="10" fill="#92400E" />
    <path d="M35 42 Q70 -5 105 42" fill="#B45309" stroke="#92400E" strokeWidth="2" />
    {/* Face */}
    <circle cx="70" cy="62" r="28" fill="#FBBF7A" />
    {/* Eyes */}
    <circle cx="58" cy="58" r="4" fill="#2D1B0E" />
    <circle cx="82" cy="58" r="4" fill="#2D1B0E" />
    {/* Smile */}
    <path d="M58 72 Q70 84 82 72" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Mustache */}
    <path d="M58 68 Q64 73 70 68 Q76 73 82 68" stroke="#5C3A1E" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Body (Checked Shirt) */}
    <rect x="42" y="90" width="56" height="60" rx="8" fill="#16A34A" />
    <line x1="55" y1="90" x2="55" y2="150" stroke="#15803D" strokeWidth="1.5" />
    <line x1="70" y1="90" x2="70" y2="150" stroke="#15803D" strokeWidth="1.5" />
    <line x1="85" y1="90" x2="85" y2="150" stroke="#15803D" strokeWidth="1.5" />
    <line x1="42" y1="105" x2="98" y2="105" stroke="#15803D" strokeWidth="1.5" />
    <line x1="42" y1="120" x2="98" y2="120" stroke="#15803D" strokeWidth="1.5" />
    <line x1="42" y1="135" x2="98" y2="135" stroke="#15803D" strokeWidth="1.5" />
    {/* Arms */}
    <rect x="22" y="92" width="20" height="12" rx="6" fill="#FBBF7A" />
    <rect x="98" y="92" width="20" height="12" rx="6" fill="#FBBF7A" />
    {/* Overalls straps */}
    <line x1="55" y1="90" x2="50" y2="80" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
    <line x1="85" y1="90" x2="90" y2="80" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
    {/* Legs */}
    <rect x="46" y="150" width="20" height="35" rx="6" fill="#1D4ED8" />
    <rect x="74" y="150" width="20" height="35" rx="6" fill="#1D4ED8" />
    {/* Boots */}
    <rect x="44" y="180" width="24" height="14" rx="7" fill="#78350F" />
    <rect x="72" y="180" width="24" height="14" rx="7" fill="#78350F" />
  </motion.svg>
);

/* ─────────────── TOPIC SELECTION SCREEN ─────────────── */
function TopicSelect({ onSelect, player }) {
  const xpInLevel = player.xp % 100;

  return (
    <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
      {/* Player Stats Bar */}
      <div style={{ maxWidth: 700, margin: "0 auto 30px", display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "10px 20px", borderRadius: 14, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={18} fill="#fde047" color="#fde047" /> Level {player.level}
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "10px 20px", borderRadius: 14, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={18} fill="#fde047" color="#fde047" /> {xpInLevel}/100 XP
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "10px 20px", borderRadius: 14, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <Coins size={18} color="#fbbf24" /> {player.coins} Coins
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
        <FarmerAvatar speaking />
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: "16px 0 0" }}>
          Farmer's Quiz Challenge
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, fontSize: "1.1rem" }}>
          Pick a topic and answer my questions to earn EXP!
        </p>
      </motion.div>

      {/* Category Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, maxWidth: 700, margin: "0 auto" }}>
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(cat.id)}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20, padding: "28px 24px", cursor: "pointer", backdropFilter: "blur(10px)",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: cat.color }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{cat.name}</h3>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{cat.questions.length} questions</span>
              </div>
              <ChevronRight size={22} color="rgba(255,255,255,0.4)" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── QUIZ SCREEN ────────────── */
function QuizScreen({ category, onFinish, earnXP: doEarnXP }) {
  const cat = CATEGORIES.find((c) => c.id === category);
  const questions = useMemo(() => [...cat.questions].sort(() => Math.random() - 0.5), [cat]);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [levelUps, setLevelUps] = useState([]);
  const [done, setDone] = useState(false);

  const q = questions[currentQ];
  const total = questions.length;
  const progress = ((currentQ + (showFeedback ? 1 : 0)) / total) * 100;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowFeedback(true);
    setShowHint(false);

    if (idx === q.correct) {
      setCorrect((c) => c + 1);
      setTotalXP((x) => x + q.xp);
      const result = doEarnXP(q.xp);
      if (result?.leveledUp) {
        setLevelUps((l) => [...l, result.newLevel]);
      }
    }
  };

  const handleNext = () => {
    if (currentQ < total - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const pct = (correct / total) * 100;
    const stars = pct >= 85 ? 3 : pct >= 55 ? 2 : pct > 0 ? 1 : 0;

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 28,
          padding: "48px 40px", maxWidth: 440, textAlign: "center", border: "1px solid rgba(255,255,255,0.2)",
        }}>
          <FarmerAvatar speaking />
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "16px 0 8px" }}>Quiz Complete!</h2>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "16px 0" }}>
            {[1, 2, 3].map((s) => (
              <motion.div key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: s * 0.2, type: "spring" }}>
                <Star size={48} style={{ color: s <= stars ? "#FFD700" : "rgba(255,255,255,0.15)", fill: s <= stars ? "#FFD700" : "none" }} />
              </motion.div>
            ))}
          </div>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", margin: "0 0 8px" }}>
            {correct}/{total} correct
          </p>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, margin: "16px 0 24px", display: "flex", justifyContent: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4ade80" }}>+{totalXP}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>XP Earned</div>
            </div>
            {levelUps.length > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fbbf24" }}>+{levelUps.length * 100}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Coins (Level Up!)</div>
              </div>
            )}
          </div>

          {levelUps.length > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)", borderRadius: 14, padding: "12px 20px", marginBottom: 20,
              color: "#78350F", fontWeight: 800, fontSize: "1rem"
            }}>
              🎉 You reached Level {levelUps[levelUps.length - 1]}!
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onFinish} style={{
              padding: "14px 24px", borderRadius: 14, background: cat.color, color: "#fff",
              fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>
              <RotateCcw size={16} /> Try Another Topic
            </motion.button>
            <Link to="/world/farm" style={{
              padding: "14px 24px", borderRadius: 14, background: "rgba(255,255,255,0.15)", color: "#fff",
              fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
            }}>
              Back to Farm
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
      {/* Progress */}
      <div style={{ maxWidth: 620, margin: "0 auto 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 6 }}>
          <span>{cat.icon} {cat.name} — Q{currentQ + 1}/{total}</span>
          <span>+{totalXP} XP earned</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} style={{ height: "100%", background: cat.color, borderRadius: 10 }} />
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            
            {/* Farmer + Speech Bubble */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 24 }}>
              <div style={{ flexShrink: 0 }}>
                <FarmerAvatar speaking={!showFeedback} />
              </div>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
                borderRadius: "20px 20px 20px 4px", padding: "24px 28px",
                border: "1px solid rgba(255,255,255,0.15)", position: "relative",
              }}>
                <div style={{ fontSize: "0.75rem", color: cat.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Question {currentQ + 1} • {q.xp} XP
                </div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.4 }}>{q.question}</h2>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {q.opts.map((opt, idx) => {
                let bg = "rgba(255,255,255,0.07)";
                let border = "1px solid rgba(255,255,255,0.1)";

                if (showFeedback) {
                  if (idx === q.correct) {
                    bg = "rgba(16, 185, 129, 0.25)";
                    border = "2px solid #10B981";
                  } else if (idx === selected && idx !== q.correct) {
                    bg = "rgba(239, 68, 68, 0.25)";
                    border = "2px solid #EF4444";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!showFeedback ? { scale: 1.03 } : {}}
                    whileTap={!showFeedback ? { scale: 0.97 } : {}}
                    onClick={() => handleSelect(idx)}
                    style={{
                      background: bg, border, borderRadius: 14, padding: "16px 14px",
                      color: "#fff", fontWeight: 600, fontSize: "1rem",
                      cursor: showFeedback ? "default" : "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginRight: 8 }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {/* Hint Button */}
            {!showFeedback && !showHint && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
                onClick={() => setShowHint(true)}
                style={{
                  marginTop: 16, padding: "10px 20px", borderRadius: 12,
                  background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.3)",
                  color: "#fbbf24", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                💡 Need a hint?
              </motion.button>
            )}

            {/* Hint Display */}
            <AnimatePresence>
              {showHint && !showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    marginTop: 16, padding: "14px 20px", borderRadius: 14,
                    background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)",
                    color: "#fde68a", fontSize: "0.9rem", lineHeight: 1.5,
                  }}
                >
                  💡 <strong>Farmer's Hint:</strong> {q.hint}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
                  marginTop: 20, padding: "20px 24px", borderRadius: 16,
                  background: selected === q.correct ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${selected === q.correct ? "#10B981" : "#EF4444"}`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: selected === q.correct ? "#10B981" : "#EF4444", marginBottom: 8 }}>
                    {selected === q.correct ? `✅ Correct! +${q.xp} XP` : "❌ Not quite!"}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {q.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            {showFeedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginTop: 24 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext}
                  style={{
                    padding: "14px 36px", borderRadius: 14, background: cat.color, color: "#fff",
                    fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer",
                    boxShadow: `0 6px 20px ${cat.color}66`,
                  }}
                >
                  {currentQ < total - 1 ? "Next Question →" : "See Results →"}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────────── MAIN PAGE ────────────────── */
export default function FarmEarnXP() {
  const { player, earnXP } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div
      style={{
        position: "fixed", inset: 0, overflow: "auto",
        background: "linear-gradient(135deg, #1a2e05 0%, #365314 50%, #14532d 100%)",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
    >
      {/* Back button */}
      <div style={{ position: "fixed", left: 16, top: 20, zIndex: 40 }}>
        <Link
          to="/world/farm"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Back to Farm
        </Link>
      </div>

      {selectedCategory ? (
        <QuizScreen
          category={selectedCategory}
          onFinish={() => setSelectedCategory(null)}
          earnXP={earnXP}
        />
      ) : (
        <TopicSelect onSelect={setSelectedCategory} player={player} />
      )}
    </div>
  );
}
