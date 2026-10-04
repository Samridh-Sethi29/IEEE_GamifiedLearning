import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const ITEMS = {
  sun: { id: "sun", name: "Sun", icon: "☀️", role: "ENERGY SOURCE", desc: "Provides energy for all living things.", color: "bg-amber-100 border-amber-400 text-amber-900", pos: "top-10 left-10" },
  grass: { id: "grass", name: "Grass", icon: "🌱", role: "PRODUCER", desc: "Plants make their own food using sunlight.", color: "bg-green-100 border-green-400 text-green-900", pos: "bottom-32 left-20" },
  rabbit: { id: "rabbit", name: "Rabbit", icon: "🐰", role: "PRIMARY CONSUMER", desc: "Obtains energy by eating plants.", color: "bg-slate-100 border-slate-400 text-slate-900", pos: "bottom-24 left-64" },
  insect: { id: "insect", name: "Insect", icon: "🐛", role: "PRIMARY CONSUMER", desc: "Obtains energy by eating plants.", color: "bg-emerald-100 border-emerald-400 text-emerald-900", pos: "bottom-40 left-48" },
  frog: { id: "frog", name: "Frog", icon: "🐸", role: "SECONDARY CONSUMER", desc: "Eats insects and small creatures.", color: "bg-lime-100 border-lime-400 text-lime-900", pos: "bottom-20 right-48" },
  snake: { id: "snake", name: "Snake", icon: "🐍", role: "PREDATOR", desc: "Hunts and eats other consumers.", color: "bg-emerald-100 border-emerald-500 text-emerald-900", pos: "bottom-48 right-32" },
  eagle: { id: "eagle", name: "Eagle", icon: "🦅", role: "APEX PREDATOR", desc: "Hunts at the top of the food chain.", color: "bg-orange-100 border-orange-400 text-orange-900", pos: "top-16 right-20" },
  dead_leaves: { id: "dead_leaves", name: "Dead Leaves", icon: "🍂", role: "DEAD MATERIAL", desc: "Organic matter from dead plants.", color: "bg-yellow-100 border-yellow-400 text-yellow-900", pos: "bottom-12 left-1/2" },
  fungi: { id: "fungi", name: "Fungi", icon: "🍄", role: "DECOMPOSER", desc: "Decomposers break down dead material.", color: "bg-purple-100 border-purple-400 text-purple-900", pos: "bottom-8 left-1/3" },
};

const VALID_CONNECTIONS = [
  { from: "sun", to: "grass" },
  { from: "grass", to: "rabbit" },
  { from: "grass", to: "insect" },
  { from: "insect", to: "frog" },
  { from: "rabbit", to: "snake" },
  { from: "rabbit", to: "eagle" },
  { from: "frog", to: "snake" },
  { from: "snake", to: "eagle" },
  { from: "dead_leaves", to: "fungi" },
  { from: "fungi", to: "grass" } // nutrient cycling
];

export default function BuildEcosystemGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 = Intro, 1 = Game
  const [placed, setPlaced] = useState([]); // Array of IDs on board
  const [connections, setConnections] = useState([]); // Array of {from, to}
  const [selectedNode, setSelectedNode] = useState(null); // ID of selected node
  const [feedback, setFeedback] = useState("");
  const [health, setHealth] = useState(0);

  // Win requirements
  const hasSun = connections.some(c => c.from === "sun");
  const hasProducer = connections.some(c => c.to === "grass");
  const hasPrimary = connections.some(c => c.from === "grass" && (c.to === "rabbit" || c.to === "insect"));
  const hasSecondary = connections.some(c => c.from === "insect" && c.to === "frog") || connections.some(c => c.from === "rabbit" && c.to === "snake");
  const hasPredator = connections.some(c => c.to === "eagle" || c.to === "snake");
  const hasDecomposer = connections.some(c => c.from === "dead_leaves" && c.to === "fungi");
  
  const reqsMet = hasSun && hasProducer && hasPrimary && hasSecondary && hasPredator && hasDecomposer;
  const isComplete = reqsMet;

  useEffect(() => {
    if (isComplete) {
      const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
      if (!saved["ecosystem-game"]) {
        saved["ecosystem-game"] = true;
        localStorage.setItem("biology_progress", JSON.stringify(saved));
        earnXP(150);
      }
    }
  }, [isComplete, earnXP]);

  const handleTrayClick = (id) => {
    if (!placed.includes(id)) {
      setPlaced([...placed, id]);
      if (id === "dead_leaves") {
        setFeedback("Dead material appeared! We need something to break it down.");
      }
    }
  };

  const handleNodeClick = (id) => {
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null); // deselect
    } else {
      // Attempt connection: selectedNode -> id
      const isValid = VALID_CONNECTIONS.some(c => c.from === selectedNode && c.to === id);
      
      if (isValid) {
        // Check if connection already exists
        const exists = connections.some(c => c.from === selectedNode && c.to === id);
        if (!exists) {
          setConnections([...connections, { from: selectedNode, to: id }]);
          setHealth(h => Math.min(100, h + 15));
          
          if (id === "grass" && selectedNode === "sun") {
             setFeedback("✓ Correct! Plants make food using sunlight.");
          } else if (id === "fungi") {
             setFeedback("✓ Correct! Decomposers break down dead material and return nutrients.");
          } else if (id === "grass" && selectedNode === "fungi") {
             setFeedback("✓ Nutrients returned! Plants use these to grow.");
          } else {
             setFeedback(`✓ Correct! ${ITEMS[id].name} obtains energy from ${ITEMS[selectedNode].name}.`);
          }
        }
      } else {
        setFeedback(`That connection doesn't fit this food chain. Think about what ${ITEMS[id].name} eats.`);
      }
      
      setSelectedNode(null);
      setTimeout(() => setFeedback(""), 4000);
    }
  };

  if (step === 0) {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl"
        >
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">BUILD THE ECOSYSTEM</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Create a healthy ecosystem.</p>
          <p className="text-slate-500 font-medium mb-8">Place organisms and connect them to show the flow of energy.</p>
          <button 
            onClick={() => setStep(1)}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all"
          >
            START BUILDING
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/biology")}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-[14px] font-bold text-slate-200 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Biology
        </button>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-3 border border-slate-700 shadow-xl flex flex-col items-end w-48">
          <div className="flex items-center gap-2 text-white font-black text-sm mb-1 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-emerald-400" /> Ecosystem Health
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${health}%` }} />
          </div>
          <div className="text-xs font-bold text-emerald-400">{health}% Complete</div>
        </div>
      </div>

      {/* Main Area: The Board */}
      <div className="flex-1 relative bg-gradient-to-b from-sky-900 via-emerald-950 to-stone-900 overflow-hidden">
        
        {/* Environment Background Art */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-stone-900 to-transparent" />
        <div className="absolute bottom-10 right-20 w-64 h-32 bg-blue-900/40 rounded-full blur-xl" />
        
        {/* Draw connections using simplified logic or let feedback handle it */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
           {connections.map((c, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 0.5, scale: 1 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl drop-shadow-md"
             >
               {/* We just show the feedback text for connections since precise lines require complex refs on responsive layouts */}
             </motion.div>
           ))}
        </div>

        {/* Since precise SVG lines without refs is hard, let's just show floating arrows/particles for energy flow instead of rigid lines, or use a simplified approach: */}
        
        {/* The Nodes */}
        {placed.map(id => {
          const item = ITEMS[id];
          const isSelected = selectedNode === id;
          return (
            <motion.div
              key={id}
              id={`node-${id}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute ${item.pos} z-20`}
            >
              <button
                onClick={() => handleNodeClick(id)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all
                  ${item.color} shadow-xl
                  ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-900 scale-110 z-30' : 'hover:scale-105 hover:brightness-110'}
                `}
              >
                <div className="text-4xl drop-shadow-md mb-1">{item.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-wider">{item.name}</div>
              </button>
              
              {/* Show role if selected */}
              {isSelected && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white text-slate-800 p-3 rounded-xl shadow-2xl border-2 border-slate-200 w-48 z-40 pointer-events-none">
                  <div className="text-[10px] font-black text-slate-400 mb-1">ROLE: {item.role}</div>
                  <div className="text-xs font-bold">{item.desc}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info / Feedback Overlay */}
      <div className="absolute top-24 w-full flex justify-center pointer-events-none z-30">
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`inline-block font-bold px-6 py-3 rounded-2xl border shadow-2xl max-w-lg text-center ${feedback.includes('✓') ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : 'bg-slate-800 text-white border-slate-600'}`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!feedback && selectedNode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block font-bold px-6 py-3 rounded-2xl bg-blue-500 text-white shadow-2xl"
          >
            Select another organism to draw an energy connection!
          </motion.div>
        )}
      </div>

      {/* Bottom Tray */}
      <div className="h-32 bg-slate-800 border-t border-slate-700 flex flex-col z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <div className="flex-1 overflow-x-auto flex items-center gap-3 px-4 py-2">
          {Object.values(ITEMS).map((item) => {
            const isPlaced = placed.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleTrayClick(item.id)}
                className={`
                  flex flex-col items-center justify-center min-w-[80px] h-20 rounded-xl border-2 transition-all
                  ${isPlaced 
                    ? "bg-slate-700 border-slate-600 text-slate-500 opacity-50 cursor-default" 
                    : "bg-slate-100 border-slate-300 text-slate-800 hover:scale-105 active:scale-95 shadow-sm"}
                `}
              >
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="text-[10px] font-bold uppercase">{item.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Panel */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border-4 border-blue-400 flex flex-col items-center text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide">
                ECOSYSTEM COMPLETE!
              </h2>
              <p className="text-slate-600 font-bold mb-8">You built a functioning food web!</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-500 w-5 h-5"/> Producer placed</div>
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-500 w-5 h-5"/> Consumers placed</div>
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-500 w-5 h-5"/> Energy flow connected</div>
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-500 w-5 h-5"/> Decomposers cycling nutrients</div>
              </div>

              <div className="flex flex-col items-center gap-3 mb-8 w-full">
                <div className="text-2xl font-black text-amber-500 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200 w-full text-center flex items-center justify-center gap-2">
                  ⭐ +150 XP
                </div>
                <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-200 font-bold w-full uppercase">
                  <span className="text-2xl">🏅</span> Ecosystem Explorer
                </div>
              </div>

              <button 
                onClick={() => navigate("/world/school/science/biology")}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-xl font-black rounded-xl shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
              >
                Continue to Hub
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
