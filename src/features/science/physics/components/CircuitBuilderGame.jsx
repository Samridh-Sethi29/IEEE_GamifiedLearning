import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const LEVELS = [
  {
    id: 1,
    title: "Basic Circuit",
    desc: "Drag components into the slots to create a complete loop.",
    inventory: ["battery", "bulb", "wire", "wire"],
    prePlaced: [null, null, null, null], // Top, Right, Bottom, Left
    target: (slots) => {
      const counts = countComponents(slots);
      return counts.battery === 1 && counts.bulb === 1 && counts.wire === 2;
    }
  },
  {
    id: 2,
    title: "Add a Switch",
    desc: "Create a circuit with a switch. Make sure the switch is CLOSED to turn on the bulb!",
    inventory: ["battery", "bulb", "wire", "switch_open"],
    prePlaced: [null, null, null, null],
    target: (slots) => {
      const counts = countComponents(slots);
      return counts.battery === 1 && counts.bulb === 1 && counts.wire === 1 && counts.switch_closed === 1;
    }
  },
  {
    id: 3,
    title: "Fix the Circuit",
    desc: "This circuit is broken. Use the right component to fix the gap!",
    inventory: ["wire", "eraser"],
    prePlaced: ["battery", "bulb", "switch_closed", null],
    target: (slots) => {
      const counts = countComponents(slots);
      return counts.battery === 1 && counts.bulb === 1 && counts.switch_closed === 1 && counts.wire === 1;
    }
  }
];

const COMP_MAP = {
  "battery": { icon: "🔋", name: "Battery", conducts: true },
  "bulb": { icon: "💡", name: "Bulb", conducts: true },
  "wire": { icon: "🔌", name: "Wire", conducts: true },
  "switch_open": { icon: "🕹️", name: "Switch (Open)", conducts: false },
  "switch_closed": { icon: "🔘", name: "Switch (Closed)", conducts: true },
  "eraser": { icon: "🧽", name: "Eraser", conducts: false },
};

function countComponents(slots) {
  const counts = {};
  slots.forEach(s => {
    if (s) {
      counts[s] = (counts[s] || 0) + 1;
    }
  });
  return counts;
}

export default function CircuitBuilderGame() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  
  const [step, setStep] = useState(0); // 0 = intro, 1 = game, 2 = level complete, 3 = all complete
  const [levelIndex, setLevelIndex] = useState(0);
  const [slots, setSlots] = useState([...LEVELS[0].prePlaced]);
  const [inventory, setInventory] = useState([...LEVELS[0].inventory]);
  const [draggedItem, setDraggedItem] = useState(null);
  
  const currentLevel = LEVELS[levelIndex];
  const isCircuitClosed = currentLevel.target(slots);

  useEffect(() => {
    if (step === 1 && isCircuitClosed) {
      setTimeout(() => setStep(2), 1500);
    }
  }, [slots, isCircuitClosed, step]);

  const loadLevel = (idx) => {
    setLevelIndex(idx);
    setSlots([...LEVELS[idx].prePlaced]);
    setInventory([...LEVELS[idx].inventory]);
    setStep(1);
  };

  const handleDragStart = (e, index, source) => {
    setDraggedItem({ index, source }); // source: "inventory" or "slots"
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (e, targetIndex, targetSource) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { index: srcIndex, source: srcSource } = draggedItem;
    
    // Simple logic: we only support dragging from inventory to empty slot, or clicking to remove
    if (srcSource === "inventory" && targetSource === "slots" && !slots[targetIndex]) {
      const item = inventory[srcIndex];
      const newInv = [...inventory];
      newInv.splice(srcIndex, 1);
      
      const newSlots = [...slots];
      newSlots[targetIndex] = item;
      
      setInventory(newInv);
      setSlots(newSlots);
    }
    setDraggedItem(null);
  };

  const handleRemove = (slotIndex) => {
    if (currentLevel.prePlaced[slotIndex]) return; // can't remove pre-placed
    const item = slots[slotIndex];
    if (item) {
      const newSlots = [...slots];
      newSlots[slotIndex] = null;
      setSlots(newSlots);
      setInventory([...inventory, item]);
    }
  };

  const toggleSwitch = (slotIndex) => {
    const item = slots[slotIndex];
    if (item === "switch_open") {
      const newSlots = [...slots];
      newSlots[slotIndex] = "switch_closed";
      setSlots(newSlots);
    } else if (item === "switch_closed") {
      const newSlots = [...slots];
      newSlots[slotIndex] = "switch_open";
      setSlots(newSlots);
    }
  };

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      loadLevel(levelIndex + 1);
    } else {
      const saved = JSON.parse(localStorage.getItem("physics_progress") || "{}");
      if (!saved["light-game"]) {
        saved["light-game"] = true;
        localStorage.setItem("physics_progress", JSON.stringify(saved));
        earnXP(100);
      }
      setStep(3); // All complete
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
          <div className="text-6xl mb-6 text-yellow-400 drop-shadow-md animate-pulse">💡</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">BUILD THE CIRCUIT</h1>
          <p className="text-slate-600 font-bold mb-8 text-lg">Connect the components and make the bulb light up.</p>
          
          <button 
            onClick={() => loadLevel(0)}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-black text-xl px-8 py-4 rounded-xl shadow-[0_6px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all"
          >
            START BUILDING
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col font-sans overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/world/school/science/physics")}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-[14px] font-bold text-slate-200 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-20 px-4 w-full max-w-4xl mx-auto z-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-wider mb-2">
            Level {levelIndex + 1}: {currentLevel.title}
          </h2>
          <p className="text-slate-300 font-medium">{currentLevel.desc}</p>
        </div>

        {/* The Circuit Board */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12">
          {/* Wire Background Box */}
          <div className={`absolute inset-10 border-8 rounded-3xl transition-colors duration-500 ${isCircuitClosed ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-slate-700'}`} />
          
          {/* Slots */}
          {[
            { pos: "top-0 left-1/2 -translate-x-1/2", id: 0 },
            { pos: "top-1/2 right-0 -translate-y-1/2", id: 1 },
            { pos: "bottom-0 left-1/2 -translate-x-1/2", id: 2 },
            { pos: "top-1/2 left-0 -translate-y-1/2", id: 3 }
          ].map((slot) => {
            const itemKey = slots[slot.id];
            const item = itemKey ? COMP_MAP[itemKey] : null;
            const isPrePlaced = currentLevel.prePlaced[slot.id] !== null;

            return (
              <div 
                key={slot.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, slot.id, "slots")}
                onClick={() => {
                  if (itemKey && itemKey.startsWith("switch")) toggleSwitch(slot.id);
                  else handleRemove(slot.id);
                }}
                className={`absolute ${slot.pos} w-24 h-24 bg-slate-800 border-4 ${isPrePlaced ? 'border-slate-600' : 'border-dashed border-slate-500'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${item ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
              >
                {item ? (
                  <>
                    <div className={`text-5xl drop-shadow-md ${itemKey === 'bulb' && isCircuitClosed ? 'drop-shadow-[0_0_20px_rgba(250,204,21,1)] scale-110 transition-transform' : ''}`}>
                      {itemKey === 'bulb' && isCircuitClosed ? '💡' : itemKey === 'bulb' ? '🔌' : item.icon}
                    </div>
                    {itemKey.startsWith("switch") && <div className="text-[9px] text-slate-300 font-bold uppercase mt-1">Tap to flip</div>}
                  </>
                ) : (
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Empty</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inventory Tray */}
        <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 w-full">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Inventory (Drag to empty slots)</div>
          <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
            {inventory.map((itemKey, idx) => {
              const item = COMP_MAP[itemKey];
              return (
                <div 
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx, "inventory")}
                  className="w-20 h-20 bg-slate-100 rounded-xl border-2 border-slate-300 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shrink-0"
                >
                  <div className="text-3xl">{item.icon}</div>
                </div>
              );
            })}
            {inventory.length === 0 && <div className="text-slate-500 font-bold">Inventory Empty</div>}
          </div>
        </div>

      </div>

      {/* Level Complete Modal */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400"
            >
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Circuit Closed!</h2>
              <p className="text-slate-600 font-bold mb-8">The electricity is flowing.</p>
              <button 
                onClick={nextLevel}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all"
              >
                {levelIndex < LEVELS.length - 1 ? "Next Level" : "Finish Game"}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* All Complete Modal */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border-4 border-emerald-400"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide">Circuit Complete!</h2>
              <div className="flex flex-col items-center gap-3 mb-8 w-full">
                <div className="text-2xl font-black text-amber-500 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200 w-full text-center mt-4">
                  ⭐ +100 XP
                </div>
                <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-200 font-bold w-full uppercase">
                  <span className="text-2xl">🏅</span> Circuit Builder
                </div>
              </div>
              <button 
                onClick={() => navigate("/world/school/science/physics")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black px-6 py-4 rounded-xl shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
              >
                Return to Physics
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
