import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const QUESTIONS = [
  {
    q: "A cell needs more usable energy. Which organelle is involved?",
    options: [
      { id: "a", text: "Nucleus", correct: false, expl: "The nucleus controls the cell, it doesn't provide energy." },
      { id: "b", text: "Mitochondria", correct: true, expl: "Correct! Mitochondria release usable energy for the cell." },
      { id: "c", text: "Cell Membrane", correct: false, expl: "The membrane controls what enters/leaves." },
    ]
  },
  {
    q: "Which organ pumps blood around the body?",
    options: [
      { id: "a", text: "Lungs", correct: false, expl: "Lungs handle oxygen and carbon dioxide exchange." },
      { id: "b", text: "Brain", correct: false, expl: "The brain controls the body's activities." },
      { id: "c", text: "Heart", correct: true, expl: "Correct! The heart pumps blood through the circulatory system." },
    ]
  },
  {
    q: "A plant needs sunlight, water and carbon dioxide to make food. What process is occurring?",
    options: [
      { id: "a", text: "Photosynthesis", correct: true, expl: "Correct! Plants use these to make food through photosynthesis." },
      { id: "b", text: "Digestion", correct: false, expl: "Digestion breaks down food, it doesn't make it from sunlight." },
      { id: "c", text: "Respiration", correct: false, expl: "Respiration releases energy from food." },
    ]
  },
  {
    q: "If plants disappear from a food chain, what happens to organisms that depend on them?",
    options: [
      { id: "a", text: "They find a new sun.", correct: false, expl: "Animals cannot get energy directly from the sun." },
      { id: "b", text: "They will lose their energy source.", correct: true, expl: "Correct! Producers are the base of the food chain." },
      { id: "c", text: "Nothing happens.", correct: false, expl: "Without producers, the rest of the chain collapses." },
    ]
  }
];

export default function BiologyMission() {
  const navigate = useNavigate();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExpl, setShowExpl] = useState(false);

  const currentQ = QUESTIONS[qIndex];

  const handleSelect = (opt) => {
    if (showExpl) return;
    setSelected(opt);
    setShowExpl(true);
  };

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(q => q + 1);
      setSelected(null);
      setShowExpl(false);
    } else {
      navigate("/world/school/science/biology/completion");
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#eaf3ff] via-[#d6e8ff] to-[#bbd8f9] flex flex-col items-center justify-center font-sans overflow-hidden px-4">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/biology")}
          className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-lg shadow-emerald-950/15 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Abort Mission
        </button>
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center z-10">
        
        <div className="bg-amber-100 text-amber-800 border border-amber-300 px-6 py-2 rounded-full font-bold uppercase tracking-wider mb-8 shadow-sm">
          Biology Mission: Question {qIndex + 1} / {QUESTIONS.length}
        </div>

        <motion.div 
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur border border-white/70 p-8 md:p-12 rounded-[40px] shadow-lg shadow-emerald-950/10 w-full"
        >
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-8 leading-tight">
            {currentQ.q}
          </h2>

          <div className="flex flex-col gap-4">
            {currentQ.options.map(opt => {
              const isSelected = selected?.id === opt.id;
              const isCorrect = opt.correct;
              const showResult = showExpl && isSelected;
              
              let btnClass = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";
              
              if (showExpl) {
                if (isSelected && isCorrect) btnClass = "bg-emerald-100 border-emerald-400 text-emerald-900";
                else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-400 text-red-900";
                else if (!isSelected && isCorrect) btnClass = "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-70";
                else btnClass = "bg-slate-50 border-slate-200 opacity-50";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  disabled={showExpl}
                  className={`p-5 rounded-2xl border-2 font-bold text-left transition-all text-lg flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt.text}</span>
                  {showResult && isCorrect && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExpl && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                className="overflow-hidden"
              >
                <div className={`p-5 rounded-2xl border-l-4 ${selected.correct ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                  <p className="font-medium">{selected.expl}</p>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-black text-lg px-8 py-3 rounded-xl shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all"
                  >
                    {qIndex < QUESTIONS.length - 1 ? "Next Question →" : "Complete Mission →"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
