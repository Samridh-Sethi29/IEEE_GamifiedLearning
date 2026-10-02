import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ArrowRight } from "lucide-react";
import { SciResults, SciProgress } from "../ui/SciUI";

// Multiple-choice knowledge check used by the Chemistry lessons.
// Logic is unchanged: onComplete(score) fires after the last question,
// onComplete(score, true) when the learner presses Continue on the result screen.
export default function KnowledgeCheck({ questions, topicName, onComplete }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    if (idx === questions[qIndex].ans) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((q) => q + 1);
      setAnswered(false);
      setSelectedOpt(null);
    } else {
      setIsFinished(true);
      onComplete(score);
    }
  };

  const retry = () => {
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedOpt(null);
    setIsFinished(false);
  };

  if (isFinished) {
    const pct = Math.round((score / questions.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct > 0 ? 1 : 0;
    return (
      <motion.div className="sv-quiz-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <SciResults
          emoji={pct >= 60 ? "🎯" : "📝"}
          title="Your Result"
          subtitle={topicName}
          stars={stars}
          score={`${score} / ${questions.length}`}
          scoreLabel={`${pct}%`}
          confetti={pct >= 60}
          actions={[
            { label: "Continue", onClick: () => onComplete(score, true), variant: "primary" },
            { label: "Try Again", onClick: retry, variant: "light" },
          ]}
        />
      </motion.div>
    );
  }

  const q = questions[qIndex];
  const wasRight = selectedOpt === q.ans;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="sv-quiz-wrap">
      <div className="sv-quiz">
        <div className="sv-quiz__top">
          <span className="sv-badge">{topicName ? `${topicName} · ` : ""}Question {qIndex + 1} / {questions.length}</span>
          <span className="sv-badge sv-badge--gold">Score {score}</span>
        </div>
        <SciProgress percent={((qIndex + (answered ? 1 : 0)) / questions.length) * 100} />

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.25 }}
          >
            <div className="sv-panel sv-quiz__card">
              {q.visual && <div className="sv-quiz__visual">{q.visual}</div>}
              <h2 className="sv-quiz__q">{q.q}</h2>
            </div>

            <div className="sv-quiz__opts">
              {q.opts.map((opt, i) => {
                const isSelected = selectedOpt === i;
                const isCorrect = i === q.ans;
                let state = "";
                if (answered) {
                  if (isCorrect) state = "is-correct";
                  else if (isSelected) state = "is-wrong";
                  else state = "is-dim";
                }
                return (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={answered ? undefined : { y: -3 }}
                    whileTap={answered ? undefined : { scale: 0.97 }}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`sv-opt ${state}`}
                  >
                    <span className="sv-opt__key">{LETTERS[i]}</span>
                    <span className="sv-opt__text">{opt}</span>
                    {answered && isCorrect && <Check className="sv-opt__mark" size={22} strokeWidth={3.5} />}
                    {answered && isSelected && !isCorrect && <X className="sv-opt__mark" size={22} strokeWidth={3.5} />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`sv-feedback ${wasRight ? "sv-feedback--ok" : "sv-feedback--bad"}`}
            >
              <div className="sv-feedback__emoji">{wasRight ? "🌟" : "💡"}</div>
              <div className="sv-feedback__body">
                <h3>{wasRight ? "Correct!" : "Not quite!"}</h3>
                {!wasRight && <p className="sv-feedback__ans">Correct answer: <b>{q.opts[q.ans]}</b></p>}
                <p>{q.explanation}</p>
              </div>
              <button type="button" onClick={nextQuestion} className="sv-btn sv-btn--primary">
                {qIndex < questions.length - 1 ? "Next" : "See Result"} <ArrowRight size={18} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
