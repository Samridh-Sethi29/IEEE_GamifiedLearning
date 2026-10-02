import re

with open('src/features/science/chemistry/components/StatesLesson.jsx', 'r', encoding='utf-8') as f:
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
    q: "Which state of matter has a fixed shape?",
    opts: ["Solid", "Liquid", "Gas", "Plasma"],
    ans: 0,
    explanation: "Solids have tightly packed particles that lock into place, giving them a fixed shape."
  },
  {
    q: "Which state has particles that are generally far apart and move freely?",
    visual: (
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden">
           <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-2 left-6 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-6 left-2 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute top-6 left-6 w-3 h-3 bg-blue-400 rounded-full"/>
        </div>
        <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden">
           <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full"/>
           <div className="absolute bottom-2 right-4 w-3 h-3 bg-blue-400 rounded-full"/>
        </div>
      </div>
    ),
    opts: ["Solid", "Liquid", "Gas", "Ice"],
    ans: 2,
    explanation: "Gas particles have lots of energy and spread far apart to fill their container."
  },
  {
    q: "What is melting?",
    opts: ["Solid ? Liquid", "Liquid ? Solid", "Gas ? Liquid", "Liquid ? Gas"],
    ans: 0,
    explanation: "Melting occurs when a solid (like ice) gets warm enough to turn into a liquid."
  },
  {
    q: "What is evaporation?",
    opts: ["Solid ? Liquid", "Liquid ? Gas", "Gas ? Liquid", "Gas ? Solid"],
    ans: 1,
    explanation: "Evaporation happens when a liquid absorbs enough heat to become a gas (like water turning to steam)."
  },
  {
    q: "What happens during condensation?",
    opts: ["Gas ? Liquid", "Liquid ? Gas", "Solid ? Gas", "Solid ? Liquid"],
    ans: 0,
    explanation: "Condensation is when a gas cools down and turns back into a liquid (like water drops on a cold glass)."
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
    if (!saved["states"]) {
      saved["states"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(75); // 50 learning + 25 quiz
    }
    setStep(TOTAL_STEPS);
  };

  const handleAnswer = (ans) => {
    const correctAnswers = ["solid", "gas", "melting", "evaporation", "condensation"];
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
    if (!saved["states"]) {
      saved["states"] = true;
      localStorage.setItem("chemistry_progress", JSON.stringify(saved));
      earnXP(25); // 25 quiz (learning logic might have given 50 earlier, but let's just combine to 75 total, so we grant 75 or 25 depending. The prompt says +25 XP per topic. Let's just grant 25)
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
                <div className="text-cyan-500 font-bold mb-4 uppercase tracking-widest">Question 1 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which state of matter has a fixed shape?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("solid")} className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 font-bold text-cyan-800 hover:bg-cyan-100">A. Solid</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Liquid</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">C. Gas</button>
                </div>
              </div>
            )}
            {qIndex === 1 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-cyan-500 font-bold mb-4 uppercase tracking-widest">Question 2 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">Which state has particles that are far apart and move freely?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Solid</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Liquid</button>
                  <button onClick={() => handleAnswer("gas")} className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 font-bold text-cyan-800 hover:bg-cyan-100">C. Gas</button>
                </div>
              </div>
            )}
            {qIndex === 2 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-cyan-500 font-bold mb-4 uppercase tracking-widest">Question 3 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What is it called when a solid turns into a liquid?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("melting")} className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 font-bold text-cyan-800 hover:bg-cyan-100">A. Melting</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Freezing</button>
                </div>
              </div>
            )}
            {qIndex === 3 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-cyan-500 font-bold mb-4 uppercase tracking-widest">Question 4 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What happens during evaporation?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("evaporation")} className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 font-bold text-cyan-800 hover:bg-cyan-100">A. Liquid turns into gas</button>
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">B. Gas turns into solid</button>
                </div>
              </div>
            )}
            {qIndex === 4 && (
              <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="text-cyan-500 font-bold mb-4 uppercase tracking-widest">Question 5 of 5</div>
                <h2 className="text-2xl font-black text-slate-800 mb-8">What is condensation?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleAnswer("wrong")} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100">A. Solid to liquid</button>
                  <button onClick={() => handleAnswer("condensation")} className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 font-bold text-cyan-800 hover:bg-cyan-100">B. Gas to liquid</button>
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
        return <KnowledgeCheck questions={QUESTIONS} topicName="States of Matter" onComplete={handleQuizComplete} />;'''

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
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">States Complete!</h2>
            <p className="text-emerald-600 font-bold text-lg mb-8 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
              ? +75 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-cyan-500 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-[0_6px_0_#06b6d4] hover:bg-cyan-400 active:translate-y-1 active:shadow-none transition-all"
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
            <div className="text-xl font-bold text-cyan-600 mb-6">States of Matter</div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6 w-full text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Knowledge Check</span>
                <span className="text-cyan-600 font-black">{quizScore} / 5</span>
              </div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">You learned:</div>
              <ul className="text-slate-700 font-bold space-y-1 ml-4 list-disc marker:text-cyan-300">
                <li>Solids, Liquids, Gases</li>
                <li>Particle Arrangement</li>
                <li>Melting & Freezing</li>
                <li>Evaporation & Condensation</li>
              </ul>
            </div>

            <p className="text-emerald-600 font-black text-xl mb-8 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
              ? +25 XP
            </p>
            <button 
              onClick={() => navigate("/world/school/science/chemistry")}
              className="w-full bg-cyan-500 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_4px_0_#06b6d4] hover:bg-cyan-400 active:translate-y-1 active:shadow-none transition-all"
            >
              CONTINUE
            </button>
          </motion.div>
        );'''

content = content.replace(step_6_old, step_6_new)

with open('src/features/science/chemistry/components/StatesLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated StatesLesson")
