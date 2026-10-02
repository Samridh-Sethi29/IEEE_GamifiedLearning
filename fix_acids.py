import re

with open('src/features/science/chemistry/components/AcidsBasesLesson.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    'import { usePlayer } from "@/features/player/hooks/usePlayer";',
    'import { usePlayer } from "@/features/player/hooks/usePlayer";\nimport KnowledgeCheck from "../../components/KnowledgeCheck";'
)

# Add QUESTIONS
questions_array = '''
const QUESTIONS = [
  {
    q: "What pH is considered neutral on the standard introductory pH scale?",
    visual: (
      <div className="w-full max-w-sm h-6 rounded-full flex overflow-hidden border border-slate-300">
        <div className="h-full flex-1 bg-gradient-to-r from-red-500 to-yellow-400" />
        <div className="h-full w-4 bg-green-500 relative flex justify-center overflow-visible"><div className="absolute -top-6 text-xl">?</div></div>
        <div className="h-full flex-1 bg-gradient-to-r from-teal-500 to-purple-600" />
      </div>
    ),
    opts: ["0", "5", "7", "14"],
    ans: 2,
    explanation: "Pure water has a neutral pH of exactly 7."
  },
  {
    q: "A substance with pH 3 is generally:",
    opts: ["Acidic", "Neutral", "Basic", "Metallic"],
    ans: 0,
    explanation: "Any pH lower than 7 is considered acidic."
  },
  {
    q: "A substance with pH 11 is generally:",
    opts: ["Acidic", "Neutral", "Basic", "A gas"],
    ans: 2,
    explanation: "Any pH higher than 7 is considered basic (or alkaline)."
  },
  {
    q: "What is an indicator?",
    opts: [
      "A substance that can help show whether a solution is acidic or basic",
      "A type of atom",
      "A form of energy",
      "A type of force"
    ],
    ans: 0,
    explanation: "Indicators change color depending on how acidic or basic the solution is."
  },
  {
    q: "Which is generally acidic?",
    opts: ["Lemon juice", "Pure water", "Soap solution"],
    ans: 0,
    explanation: "Lemon juice contains citric acid, which gives it a sour taste and makes it acidic."
  }
];
'''

content = content.replace('const TOTAL_STEPS = 5;', f'const TOTAL_STEPS = 5;{questions_array}')

# Add state
state_replace = '''  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);'''

state_new = '''  const [quizScore, setQuizScore] = useState(0);'''

content = content.replace(state_replace, state_new)

# handleComplete
mark_complete_old = '''  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["acids"]) {
      saved["acids"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(75); // 50 learning + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["7", "acidic", "basic", "color", "acidic"];
    if (ans === correctAnswers[qIndex]) {
      setQError(false);
      if (qIndex < 4) {
        setQIndex(q => q + 1);
      } else {
        markComplete();
      }
    } else {
      setQError(true);
      setTimeout(() => setQError(false), 2000);
    }
  };'''

mark_complete_new = '''  const handleQuizComplete = (score) => {
    setQuizScore(score);
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["acids"]) {
      saved["acids"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25);
    }
    setStep(5);
  };'''

content = content.replace(mark_complete_old, mark_complete_new)

# Step 4
step_4_old = '''      case 4: // Quiz
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-lime-500 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What pH number is neutral?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. 0</button>
                  <button onClick={() => handleAnswer("7")} className="p-4 rounded-xl border-2 border-lime-300 bg-lime-50 font-bold text-lime-900 hover:bg-lime-100">B. 7</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. 14</button>
                </div>
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-lime-500 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Is lemon juice acidic or basic?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("acidic")} className="p-4 rounded-xl border-2 border-lime-300 bg-lime-50 font-bold text-lime-900 hover:bg-lime-100">A. Acidic</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Basic</button>
                </div>
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-lime-500 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Is a soap solution generally acidic or basic?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Acidic</button>
                  <button onClick={() => handleAnswer("basic")} className="p-4 rounded-xl border-2 border-lime-300 bg-lime-50 font-bold text-lime-900 hover:bg-lime-100">B. Basic</button>
                </div>
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-lime-500 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does an indicator do?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Makes liquids heavier</button>
                  <button onClick={() => handleAnswer("color")} className="p-4 rounded-xl border-2 border-lime-300 bg-lime-50 font-bold text-lime-900 hover:bg-lime-100">B. Changes color based on pH</button>
                </div>
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-lime-500 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does a pH below 7 indicate?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("acidic")} className="p-4 rounded-xl border-2 border-lime-300 bg-lime-50 font-bold text-lime-900 hover:bg-lime-100">A. Acidic</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Basic</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. Neutral</button>
                </div>
              </div>
            )}
            
            {qError && <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-red-500 font-bold mt-6">Not quite! Try again.</motion.p>}
            
            <div className="mt-8 flex items-center justify-center gap-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={h-2 rounded-full transition-all duration-500 } />
              ))}
            </div>
          </div>
        );'''

step_4_new = '''      case 4:
        return <KnowledgeCheck questions={QUESTIONS} topicName="Acids, Bases & Indicators" onComplete={handleQuizComplete} />;'''

content = content.replace(step_4_old, step_4_new)

# Step 5
step_5_old = '''      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-6">??</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Acids & Bases Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ? +75 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-lime-500 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#84cc16] hover:bg-lime-400 active:translate-y-1 active:shadow-none transition-all"
            >
              Back to Chemistry
            </button>
          </motion.div>
        );'''

step_5_new = '''      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">?</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-lime-600 mb-6">Acids, Bases & Indicators</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-lime-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-lime-300">
                <li>Acids & Bases</li>
                <li>The pH Scale</li>
                <li>Indicators</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ? +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-lime-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#84cc16] hover:bg-lime-400 active:translate-y-1 active:shadow-none transition-all"
            >
              CONTINUE
            </button>
          </motion.div>
        );'''

content = content.replace(step_5_old, step_5_new)

with open('src/features/science/chemistry/components/AcidsBasesLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AcidsBasesLesson")
