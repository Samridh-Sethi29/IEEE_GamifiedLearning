import re

with open('src/features/science/chemistry/components/ReactionsLesson.jsx', 'r', encoding='utf-8') as f:
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
    q: "What are the starting substances in a chemical reaction called?",
    visual: (
      <div className="flex gap-4 items-center text-4xl mb-4 font-black text-slate-400">
        <div className="flex flex-col items-center"><div className="border-4 border-rose-500 rounded-xl p-2 bg-rose-50 text-rose-500">?? + ??</div><div className="text-sm mt-2 text-rose-500">?</div></div>
        <span>?</span>
        <div className="text-emerald-500">??</div>
      </div>
    ),
    opts: ["Products", "Reactants", "Indicators", "Elements"],
    ans: 1,
    explanation: "The substances you start with are called Reactants."
  },
  {
    q: "What are the substances formed during a chemical reaction called?",
    opts: ["Reactants", "Products", "Particles", "Solvents"],
    ans: 1,
    explanation: "The new substances produced by the reaction are called Products."
  },
  {
    q: "Which is an example of a physical change?",
    opts: ["Melting ice", "Burning paper", "Rusting iron", "Cooking an egg"],
    ans: 0,
    explanation: "Melting ice just changes its state to liquid water. It's still H2O!"
  },
  {
    q: "Which can be a sign of a chemical reaction?",
    opts: ["Formation of gas", "Object changing location", "Object becoming larger because of zoom", "Moving a box"],
    ans: 0,
    explanation: "Forming gas (bubbles), changing color unexpectedly, or giving off light/heat are all signs of a possible chemical reaction."
  },
  {
    q: "In 'A + B ? C', what are A and B?",
    opts: ["Products", "Reactants", "Indicators", "Acids"],
    ans: 1,
    explanation: "A and B are the reactants that combine to form the product, C."
  }
];
'''

content = content.replace('const TOTAL_STEPS = 6;', f'const TOTAL_STEPS = 6;{questions_array}')

# Add state
state_replace = '''  const [qIndex, setQIndex] = useState(0);
  const [qError, setQError] = useState(false);'''

state_new = '''  const [quizScore, setQuizScore] = useState(0);'''

content = content.replace(state_replace, state_new)

# handleComplete
mark_complete_old = '''  const markComplete = () => {
    const saved = JSON.parse(localStorage.getItem("chemistry_progress") || "{}");
    if (!saved["reactions"]) {
      saved["reactions"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(75);
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["reactants", "products", "no", "yes", "rearrange"];
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
    if (!saved["reactions"]) {
      saved["reactions"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25);
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
                <div className="text-rose-500 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What are the starting substances in a chemical reaction called?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("reactants")} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">A. Reactants</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Products</button>
                </div>
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-rose-500 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What are the new substances formed called?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Reactants</button>
                  <button onClick={() => handleAnswer("products")} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">B. Products</button>
                </div>
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-rose-500 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Is melting ice a chemical change?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Yes, it creates water</button>
                  <button onClick={() => handleAnswer("no")} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">B. No, it is a physical change</button>
                </div>
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-rose-500 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which of these can be evidence of a chemical reaction?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("yes")} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">A. Color change and gas bubbles</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Breaking a stick in half</button>
                </div>
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-rose-500 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What happens to atoms during a chemical reaction?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. They disappear forever</button>
                  <button onClick={() => handleAnswer("rearrange")} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">B. They rearrange to form new products</button>
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
        return <KnowledgeCheck questions={QUESTIONS} topicName="Chemical Reactions" onComplete={handleQuizComplete} />;'''

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
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Reactions Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ? +75 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-rose-500 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#be123c] hover:bg-rose-400 active:translate-y-1 active:shadow-none transition-all"
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
            <div className="text-xl font-bold text-rose-600 mb-6">Chemical Reactions</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-rose-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-rose-300">
                <li>Physical vs Chemical Change</li>
                <li>Reactants</li>
                <li>Products</li>
                <li>Signs of Chemical Reactions</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ? +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-rose-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#be123c] hover:bg-rose-400 active:translate-y-1 active:shadow-none transition-all"
            >
              CONTINUE
            </button>
          </motion.div>
        );'''

content = content.replace(step_6_old, step_6_new)

with open('src/features/science/chemistry/components/ReactionsLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ReactionsLesson")
