import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const COMPONENTS = [
  { id: "nucleus", name: "Nucleus", icon: "🧠", hint: "I'm the control center of the cell.", color: "bg-purple-100 border-purple-400 text-purple-900" },
  { id: "mitochondria", name: "Mitochondria", icon: "⚡", hint: "I help release usable energy.", color: "bg-orange-100 border-orange-400 text-orange-900" },
  { id: "ribosome", name: "Ribosome", icon: "🧬", hint: "I make proteins.", color: "bg-emerald-100 border-emerald-400 text-emerald-900" },
  { id: "vacuole", name: "Vacuole", icon: "💧", hint: "I store water and other substances.", color: "bg-cyan-100 border-cyan-400 text-cyan-900" },
  { id: "chloroplast", name: "Chloroplast", icon: "🌿", hint: "I help plants make food using sunlight.", color: "bg-green-100 border-green-400 text-green-900" },
  { id: "wall", name: "Cell Wall", icon: "🧱", hint: "I provide support and protection.", color: "bg-amber-100 border-amber-400 text-amber-900" },
  { id: "membrane", name: "Cell Membrane", icon: "🔵", hint: "I control what enters and leaves the cell.", color: "bg-blue-100 border-blue-400 text-blue-900" },
];

export default function BuildCellGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 = Intro, 1 = Game
  const [placed, setPlaced] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  
  const [activeItem, setActiveItem] = useState(null); // For tap-to-place and hints
  const [hintActive, setHintActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const score = Object.keys(placed).length;
  const isComplete = score === COMPONENTS.length;
  const progressPercent = Math.round((score / COMPONENTS.length) * 100);

  const checkCompletion = (newPlaced) => {
    if (Object.keys(newPlaced).length === COMPONENTS.length) {
      const saved = JSON.parse(localStorage.getItem("biology_progress") || "{}");
      if (!saved["cell-game"]) {
        saved["cell-game"] = true;
        localStorage.setItem("biology_progress", JSON.stringify(saved));
        earnXP(100);
      }
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedItem(id);
    setActiveItem(id);
    e.dataTransfer.setData("text/plain", id);
    setHintActive(false);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedItem;
    processPlacement(id, slotId);
  };

  const processPlacement = (itemId, slotId) => {
    if (itemId === slotId) {
      const newPlaced = { ...placed, [itemId]: true };
      setPlaced(newPlaced);
      setFeedback(`✓ ${COMPONENTS.find(c => c.id === itemId).name} placed correctly!`);
      setActiveItem(null);
      setHintActive(false);
      setTimeout(() => setFeedback(""), 2000);
      checkCompletion(newPlaced);
    } else {
      setFeedback("Think about where this structure is normally found inside the cell.");
      setTimeout(() => setFeedback(""), 3000);
    }
    setDraggedItem(null);
  };

  // For touch accessibility
  const handleItemTap = (id) => {
    if (placed[id]) return;
    setActiveItem(id);
    setHintActive(false);
  };

  const handleSlotTap = (slotId) => {
    if (activeItem && !placed[slotId]) {
      processPlacement(activeItem, slotId);
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
          <div className="text-6xl mb-6">🧬</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">BUILD THE CELL</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Your cell is incomplete!</p>
          <p className="text-slate-500 font-medium mb-8">Build the cell by placing each structure in the correct location.</p>
          <button 
            onClick={() => setStep(1)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-none transition-all"
          >
            START BUILDING
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Top Mobile Bar / Desktop Back */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/biology")}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-[14px] font-bold text-slate-200 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Biology
        </button>
      </div>

      {/* Sidebar: Component Tray */}
      <div className="w-full md:w-[350px] bg-slate-800 border-r border-slate-700 p-6 flex flex-col z-20 pt-20 md:pt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-white">COMPONENTS</h2>
          <button 
            onClick={() => activeItem && setHintActive(!hintActive)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${activeItem && !placed[activeItem] ? 'bg-amber-400 text-amber-900 hover:bg-amber-300' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            <Lightbulb className="w-4 h-4" /> Hint
          </button>
        </div>
        
        {hintActive && activeItem && !placed[activeItem] && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-amber-900/30 border border-amber-500/50 p-3 rounded-xl mb-4 text-amber-200 font-medium text-sm">
            💡 {COMPONENTS.find(c => c.id === activeItem).hint}
          </motion.div>
        )}

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
          {COMPONENTS.map((comp) => {
            const isPlaced = placed[comp.id];
            const isActive = activeItem === comp.id && !isPlaced;
            return (
              <div
                key={comp.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, comp.id)}
                onClick={() => handleItemTap(comp.id)}
                className={`
                  flex items-center gap-4 p-3 rounded-xl border-2 font-bold transition-all select-none
                  ${isPlaced 
                    ? "bg-slate-700 border-slate-600 text-slate-500 cursor-default" 
                    : isActive 
                      ? "bg-indigo-100 border-indigo-400 text-indigo-900 scale-[1.02] shadow-md"
                      : "bg-slate-100 hover:bg-white cursor-pointer border-slate-300 text-slate-800"
                  }
                `}
              >
                <div className="text-2xl w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm relative">
                  {comp.icon}
                  {isPlaced && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span>{comp.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-indigo-950">
        
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center w-full px-4 max-w-md">
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-700 shadow-xl">
            <h2 className="text-white font-black text-lg mb-2 flex items-center justify-center gap-2">
              🌱 Build a Plant Cell
            </h2>
            <div className="flex items-center justify-between text-sm font-bold text-slate-300 mb-2">
              <span>CELL COMPLETION</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="text-right text-xs font-bold text-emerald-400">{score} / 7 Structures</div>
          </div>
        </div>

        {/* Central Graphic */}
        <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] mt-12 flex items-center justify-center">
          
          <div className="absolute inset-0 border-8 border-dashed border-emerald-900/50 rounded-full bg-emerald-900/10" />

          {/* Slots */}
          {COMPONENTS.map((comp, index) => {
            const angle = (index * (360 / COMPONENTS.length)) * (Math.PI / 180);
            const radius = 150; 
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const isPlaced = placed[comp.id];
            const isHighlighted = activeItem && !isPlaced; // If tapping

            return (
              <motion.div
                key={`slot-${comp.id}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, comp.id)}
                onClick={() => handleSlotTap(comp.id)}
                className={`
                  absolute flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-4 transition-all
                  ${isPlaced ? comp.color : isHighlighted ? 'border-dashed border-indigo-400 bg-indigo-500/20 cursor-pointer animate-pulse' : 'border-dashed border-slate-600 bg-slate-800/50'}
                `}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {isPlaced ? (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="text-4xl drop-shadow-md relative"
                  >
                    {comp.icon}
                  </motion.div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-bold text-center px-1 leading-tight uppercase">
                    {isHighlighted ? "Place Here?" : "Empty"}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feedback Message */}
        <div className="absolute bottom-6 w-full text-center pointer-events-none">
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`inline-block font-bold px-6 py-3 rounded-2xl border shadow-xl ${feedback.includes('✓') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-800 text-white border-slate-600'}`}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Completion Panel */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            >
              <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border-4 border-emerald-400 flex flex-col items-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide">
                  CELL COMPLETE!
                </h2>
                <p className="text-slate-600 font-bold mb-8">Your cell is fully assembled.</p>
                
                <div className="flex flex-col items-center gap-3 mb-8 w-full">
                  <div className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold w-full">
                    <span>🧬</span> 7 / 7 Structures
                  </div>
                  <div className="text-2xl font-black text-amber-500 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200 w-full text-center flex items-center justify-center gap-2">
                    ⭐ +100 XP
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-200 font-bold w-full">
                    <span className="text-2xl">🏅</span> CELL BUILDER
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/world/school/science/biology")}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-xl font-black rounded-xl shadow-[0_6px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
