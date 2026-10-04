import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { motion, AnimatePresence } from "motion/react";
import { Star, ArrowRight } from "lucide-react";

// Planet Component
function Planet({ position, size, color, name, fact, onClick }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      onClick={() => onClick(name, fact)}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}

const PLANETS = [
  { name: "Sun", size: 3, color: "#fbbf24", pos: [0, 0, 0], fact: "The Sun is a yellow dwarf star at the center of our solar system." },
  { name: "Mercury", size: 0.4, color: "#9ca3af", pos: [5, 0, 0], fact: "Mercury is the smallest planet in our solar system and closest to the Sun." },
  { name: "Venus", size: 0.9, color: "#fcd34d", pos: [8, 0, 2], fact: "Venus spins in the opposite direction to most planets." },
  { name: "Earth", size: 1, color: "#3b82f6", pos: [12, 0, -2], fact: "Earth is the only planet known to harbor life." },
  { name: "Mars", size: 0.6, color: "#ef4444", pos: [16, 0, 4], fact: "Mars is home to the highest mountain in the solar system, Olympus Mons." },
  { name: "Jupiter", size: 2.2, color: "#fdba74", pos: [22, 0, -5], fact: "Jupiter is the largest planet and has a Great Red Spot." },
];

export default function DreamPage() {
  const navigate = useNavigate();
  const { player, updatePlayer, startNewDay, addBadge } = usePlayer();
  const [selectedFact, setSelectedFact] = useState(null);
  
  const handlePlanetClick = (name, fact) => {
    setSelectedFact({ name, fact });
    
    // Check if we haven't seen this yet
    const starLog = player.starLog || [];
    if (!starLog.includes(name)) {
      const newLog = [...starLog, name];
      const fragments = (player.starFragments || 0) + 1;
      
      let newBadges = player.badges;
      if (fragments >= 3 && !player.badges.includes("Star Collector")) {
        addBadge("Star Collector");
      }
      
      updatePlayer({ 
        starLog: newLog,
        starFragments: fragments
      });
    }
  };

  const wakeUp = () => {
    startNewDay();
    navigate("/world");
  };

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#fbbf24" distance={50} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {PLANETS.map((p, i) => (
          <Planet key={i} position={p.pos} size={p.size} color={p.color} name={p.name} fact={p.fact} onClick={handlePlanetClick} />
        ))}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-2">
          <Star className="text-amber-400 h-5 w-5" />
          <span className="font-bold">Star Fragments: {player.starFragments || 0}</span>
        </div>
        
        <button 
          onClick={wakeUp}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg pointer-events-auto transition-transform active:scale-95 flex items-center gap-2"
        >
          Wake Up <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {selectedFact && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 p-6 rounded-2xl text-white max-w-md w-full pointer-events-auto text-center"
          >
            <h3 className="text-2xl font-black text-amber-400 mb-2">{selectedFact.name}</h3>
            <p className="text-slate-300 mb-4">{selectedFact.fact}</p>
            <button 
              onClick={() => setSelectedFact(null)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm transition-colors"
            >
              Continue Exploring
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute bottom-4 left-4 text-slate-500 text-sm pointer-events-none">
        Drag to rotate • Scroll to zoom • Click planets
      </div>
    </div>
  );
}
