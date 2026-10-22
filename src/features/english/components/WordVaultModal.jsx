import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Volume2, Search, Sparkles, Lock, CheckCircle2, Bookmark, BookOpen } from "lucide-react";
import { MASTER_WORD_VAULT } from "@/features/english/data/wordVaultData";
import { playCardClick } from "@/features/english/utils/soundEffects";

export default function WordVaultModal({ isOpen, onClose, levelsData = {} }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [speakingWordId, setSpeakingWordId] = useState(null);

  if (!isOpen) return null;

  // A word is unlocked if:
  // 1. Level is completed (bestScore > 0 in levelsData)
  // 2. OR level <= 2 (starter words unlocked for immediate enjoyment!)
  const isWordUnlocked = (wordItem) => {
    if (wordItem.level <= 2) return true;
    const lvlScore = levelsData[wordItem.level]?.bestScore || 0;
    return lvlScore > 0;
  };

  const unlockedCount = MASTER_WORD_VAULT.filter(isWordUnlocked).length;
  const totalCount = MASTER_WORD_VAULT.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  // Categories list
  const categories = [
    { id: "ALL", label: `All Words (${totalCount})` },
    { id: "CH1", label: "👋 Greetings", chapter: 1 },
    { id: "CH2", label: "🌅 Daily Life", chapter: 2 },
    { id: "CH3", label: "📖 Stories", chapter: 3 },
    { id: "CH4", label: "💬 Expressing", chapter: 4 },
  ];

  const filteredWords = MASTER_WORD_VAULT.filter(item => {
    if (selectedCategory !== "ALL") {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat && cat.chapter && item.chapter !== cat.chapter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pronounceWord = (item) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingWordId(item.id);
    playCardClick();

    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingWordId(null);
    utterance.onerror = () => setSpeakingWordId(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5, 7, 25, 0.85)",
        backdropFilter: "blur(12px)",
        padding: "16px",
        fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        style={{
          background: "linear-gradient(165deg, #1b1338 0%, #0d0a21 100%)",
          borderRadius: 32,
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12), 0 0 50px rgba(139,92,246,0.25)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.15) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.12)",
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
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 20,
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
              }}
            >
              📖
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "1.6rem", margin: 0, letterSpacing: "-0.01em" }}>
                  Word Vault
                </h2>
                <span
                  style={{
                    background: "rgba(245,158,11,0.25)",
                    border: "1px solid rgba(245,158,11,0.5)",
                    color: "#fcd34d",
                    fontWeight: 900,
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                  }}
                >
                  Vocabulary Book
                </span>
              </div>
              <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontWeight: 600 }}>
                Master words unlocked across your communication adventures!
              </p>
            </div>
          </div>

          {/* Progress Strip */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: 16,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 800, fontSize: 12 }}>
                  Collection Progress: <strong style={{ color: "#4ade80" }}>{unlockedCount}</strong> / {totalCount} Words
                </span>
                <span style={{ color: "#38bdf8", fontWeight: 900, fontSize: 12 }}>
                  {progressPct}% Mastered
                </span>
              </div>
              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                <motion.div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #4ade80 100%)",
                    borderRadius: 10,
                  }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: "14px 28px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "8px 14px",
              minWidth: 240,
              flex: "1 1 240px",
            }}
          >
            <Search style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
            <input
              type="text"
              placeholder="Search words, meanings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {categories.map(c => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.id); playCardClick(); }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                    border: isSelected ? "1.5px solid #a855f7" : "1px solid rgba(255,255,255,0.1)",
                    background: isSelected ? "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)" : "rgba(255,255,255,0.06)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Word Grid Scrollable Canvas */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {filteredWords.map((item) => {
              const unlocked = isWordUnlocked(item);
              const isSpeaking = speakingWordId === item.id;

              if (!unlocked) {
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1.5px dashed rgba(255,255,255,0.12)",
                      borderRadius: 22,
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      minHeight: 160,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Lock style={{ width: 20, height: 20, color: "rgba(255,255,255,0.3)" }} />
                    </div>
                    <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)", fontWeight: 800, fontSize: 13 }}>
                      Mystery Word
                    </p>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 12,
                      }}
                    >
                      Clear Level {item.level} to unlock
                    </span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.025, y: -3 }}
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1.5px solid rgba(139,92,246,0.3)",
                    borderRadius: 22,
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div>
                    {/* Top row: Word & Listen Button */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                      <div>
                        <h3 style={{ color: "#fff", fontWeight: 900, fontSize: "1.25rem", margin: 0, letterSpacing: "-0.01em" }}>
                          {item.word}
                        </h3>
                        <span
                          style={{
                            background: "rgba(139,92,246,0.2)",
                            color: "#c084fc",
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            display: "inline-block",
                            marginTop: 4,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* Listen Button */}
                      <button
                        onClick={() => pronounceWord(item)}
                        title="Hear pronunciation"
                        style={{
                          background: isSpeaking ? "#a855f7" : "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 12,
                          width: 36,
                          height: 36,
                          cursor: "pointer",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (!isSpeaking) e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                        onMouseLeave={e => { if (!isSpeaking) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                      >
                        <Volume2 style={{ width: 16, height: 16, color: isSpeaking ? "#fff" : "#38bdf8" }} />
                      </button>
                    </div>

                    {/* Meaning */}
                    <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.45 }}>
                      {item.meaning}
                    </p>

                    {/* Example */}
                    <div
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        borderRadius: 12,
                        padding: "8px 12px",
                        marginBottom: 12,
                        borderLeft: "3px solid #f59e0b",
                      }}
                    >
                      <p style={{ margin: 0, color: "#fde68a", fontSize: "0.8rem", fontWeight: 600, fontStyle: "italic", lineHeight: 1.4 }}>
                        "{item.example}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700 }}>
                      Level {item.level} Reward
                    </span>
                    <span style={{ color: "#34d399", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 style={{ width: 13, height: 13 }} />
                      Collected
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.5)" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No words found matching "{search}"</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("ALL"); }}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  marginTop: 10,
                  fontWeight: 800,
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
