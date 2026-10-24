import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, RotateCcw, Lightbulb, Trophy } from "lucide-react";

const MONEY_QUESTIONS = [
  {
    id: "q1",
    target: 30,
    options: [
      { text: "₹10 + ₹20", value: 30, correct: true, notes: ["₹10", "₹20"] },
      { text: "₹10 + ₹10 + ₹10", value: 30, correct: true, notes: ["₹10", "₹10", "₹10"] },
      { text: "₹20 + ₹5 + ₹5", value: 30, correct: true, notes: ["₹20", "₹5", "₹5"] },
      { text: "₹50 note", value: 50, correct: false, notes: ["₹50"] }
    ]
  },
  {
    id: "q2",
    target: 45,
    options: [
      { text: "₹20 + ₹20 + ₹5", value: 45, correct: true, notes: ["₹20", "₹20", "₹5"] },
      { text: "₹10 + ₹10 + ₹10 + ₹10 + ₹5", value: 45, correct: true, notes: ["₹10", "₹10", "₹10", "₹10", "₹5"] },
      { text: "₹50 - ₹5 change", value: 45, correct: true, notes: ["₹50"] },
      { text: "₹20 + ₹10", value: 30, correct: false, notes: ["₹20", "₹10"] }
    ]
  },
  {
    id: "q3",
    target: 70,
    options: [
      { text: "₹50 + ₹20", value: 70, correct: true, notes: ["₹50", "₹20"] },
      { text: "₹20 + ₹20 + ₹20 + ₹10", value: 70, correct: true, notes: ["₹20", "₹20", "₹20", "₹10"] },
      { text: "₹100 (needs ₹30 change)", value: 70, correct: true, notes: ["₹100"] },
      { text: "₹50 + ₹10", value: 60, correct: false, notes: ["₹50", "₹10"] }
    ]
  }
];

export default function LearnMoneyModal({ isOpen, onClose, onReward }) {
  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const currentQ = MONEY_QUESTIONS[qIndex];

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    const opt = currentQ.options[idx];
    if (opt.correct) {
      setFeedback({
        type: "success",
        msg: `Correct! ${opt.text} equals exact ₹${currentQ.target}!`
      });
      if (onReward) onReward(20);
    } else {
      setFeedback({
        type: "error",
        msg: `Oops! That equals ₹${opt.value}, but we need ₹${currentQ.target}. Try another combination!`
      });
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setFeedback(null);
    setQIndex((prev) => (prev + 1) % MONEY_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm select-none animate-fade-in">
      <div
        style={{ maxWidth: 560 }}
        className="relative w-full rounded-[2rem] border-4 border-white bg-gradient-to-b from-amber-50 to-sky-50 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border-2 border-sky-200 hover:bg-rose-50 flex items-center justify-center text-slate-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pr-10">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-black text-xl text-sky-900">Learn About Money</h3>
        </div>

        <div className="text-center my-4">
          <span className="text-xs font-extrabold text-slate-500">
            Challenge {qIndex + 1} of {MONEY_QUESTIONS.length}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            Make{" "}
            <span className="text-green-700 bg-green-100 px-3 py-0.5 rounded-xl border-2 border-green-300">
              ₹{currentQ.target}
            </span>
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Pick the notes and coins that add up to the amount.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-3 rounded-2xl border-2 font-black text-sm transition-all shadow-sm flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? opt.correct
                      ? "bg-green-50 border-green-400 text-green-900 scale-105"
                      : "bg-rose-50 border-rose-300 text-rose-900"
                    : "bg-white border-sky-100 hover:border-sky-300 text-slate-800 hover:scale-[1.02]"
                }`}
              >
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {opt.notes.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-xs border border-amber-300">
                      {n}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-500">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`mt-3 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border-2 ${
              feedback.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        <div className="mt-3 bg-white rounded-2xl p-3 border-2 border-amber-100 flex items-center gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[11px] font-bold text-slate-600 leading-snug">
            Tip: the same amount can be made with many different notes and coins!
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-b from-green-400 to-green-600 border-b-4 border-green-800 text-white font-black text-sm shadow active:translate-y-0.5 active:border-b-2"
          >
            Next Challenge →
          </button>
        </div>
      </div>
    </div>
  );
}
