import re

with open('src/features/science/chemistry/components/AtomsLesson.jsx', 'r', encoding='utf-8') as f:
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
    q: "What is an atom?",
    opts: [
      "The smallest unit of an element that retains its chemical identity",
      "A type of energy",
      "A liquid",
      "A force"
    ],
    ans: 0,
    explanation: "Atoms are the tiny building blocks of all matter. Each element has its own unique type of atom."
  },
  {
    q: "Which particle has a negative charge?",
    visual: (
      <div className="w-32 h-32 relative bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs text-white">Nucleus</div>
        <div className="absolute top-2 right-4 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">e?</div>
      </div>
    ),
    opts: ["Proton", "Neutron", "Electron", "Nucleus"],
    ans: 2,
    explanation: "Electrons (e?) have a negative charge and orbit the nucleus."
  },
  {
    q: "Where are protons and neutrons found?",
    opts: ["Electron cloud", "Nucleus", "Outside the atom", "Periodic table"],
    ans: 1,
    explanation: "Protons and neutrons are tightly packed together in the center of the atom, called the nucleus."
  },
  {
    q: "What does the atomic number represent?",
    opts: ["Number of neutrons", "Number of protons", "Number of electrons only", "Atomic size"],
    ans: 1,
    explanation: "The atomic number tells you exactly how many protons are in the nucleus. It defines the element!"
  },
  {
    q: "Which symbol represents oxygen?",
    opts: ["O", "Ox", "Og", "C"],
    ans: 0,
    explanation: "The chemical symbol for Oxygen is the letter O."
  }
];
'''

content = content.replace('const TOTAL_STEPS = 6;', f'const TOTAL_STEPS = 6;{questions_array}')

# Add state
state_replace = '''  const [step, setStep] = useState(1);
  const [activeElement, setActiveElement] = useState(null);
  
  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);'''

state_new = '''  const [step, setStep] = useState(1);
  const [activeElement, setActiveElement] = useState(null);
  const [quizScore, setQuizScore] = useState(0);'''

content = content.replace(state_replace, state_new)

# handleComplete
mark_complete_old = '''  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["atoms"]) {
      saved["atoms"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(50); // 25 lesson + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["pn", "e", "element", "protons", "O"];
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
    if (!saved["atoms"]) {
      saved["atoms"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(50); // 25 lesson + 25 quiz
    }
    setStep(6);
  };'''

content = content.replace(mark_complete_old, mark_complete_new)

# Step 5
step_5_old = '''      case 5: // Quiz
        return (
          <div className="flex flex-col items-center text-center w-full max-w-3xl">
            {qIndex === 0 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-indigo-400 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What is found in the nucleus of an atom?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Only electrons</button>
                  <button onClick={() => handleAnswer("pn")} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">B. Protons and neutrons</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. Nothing, it's empty</button>
                </div>
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-indigo-400 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which particle has a negative charge and orbits the nucleus?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Proton</button>
                  <button onClick={() => handleAnswer("e")} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">B. Electron</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. Neutron</button>
                </div>
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-indigo-400 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What is an element?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("element")} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">A. A substance made of one type of atom</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. A mix of random atoms</button>
                </div>
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-indigo-400 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What does the atomic number represent?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. The size of the atom</button>
                  <button onClick={() => handleAnswer("protons")} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">B. The number of protons</button>
                </div>
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-indigo-400 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which symbol represents Oxygen?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Ox</button>
                  <button onClick={() => handleAnswer("O")} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">B. O</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. C</button>
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

step_5_new = '''      case 5:
        return <KnowledgeCheck questions={QUESTIONS} topicName="Atoms & Elements" onComplete={handleQuizComplete} />;'''

content = content.replace(step_5_old, step_5_new)

# Step 6
step_6_old = '''      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-6">??</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Atoms Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ? +50 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-indigo-600 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#4f46e5] hover:bg-indigo-500 active:translate-y-1 active:shadow-none transition-all"
            >
              Back to Chemistry
            </button>
          </motion.div>
        );'''

step_6_new = '''      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center flex flex-col items-center"
          >
            <div className="text-7xl mb-4">?</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">TOPIC COMPLETE</h2>
            <div className="text-xl font-bold text-indigo-600 mb-6">Atoms & Elements</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-indigo-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-indigo-300">
                <li>Atoms</li>
                <li>Protons</li>
                <li>Neutrons</li>
                <li>Electrons</li>
                <li>Elements</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ? +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-indigo-600 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#4f46e5] hover:bg-indigo-500 active:translate-y-1 active:shadow-none transition-all"
            >
              CONTINUE
            </button>
          </motion.div>
        );'''

content = content.replace(step_6_old, step_6_new)

with open('src/features/science/chemistry/components/AtomsLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AtomsLesson")
