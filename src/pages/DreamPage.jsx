import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { motion, AnimatePresence } from "motion/react";
import { Star, ArrowRight, Loader2 } from "lucide-react";
// Adjust this import to match your real save service (the one that calls PUT /api/save).
import { saveManager } from "@/services/saveManager";

// Planet Component
function Planet({ position, size, color, name, fact, glow, onClick }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh
      position={position}
      ref={meshRef}
      onClick={() => onClick(name, fact)}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <sphereGeometry args={[size, 32, 32]} />
      {glow ? (
        // The Sun contains the point light, so a lit material would render dark from outside.
        <meshBasicMaterial color={color} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      )}
    </mesh>
  );
}

const PLANETS = [
  {
    name: "Sun",
    size: 3,
    color: "#fbbf24",
    pos: [0, 0, 0],
    glow: true,
    fact: "The Sun is a yellow dwarf star at the center of our solar system.",
  },
  {
    name: "Mercury",
    size: 0.4,
    color: "#9ca3af",
    pos: [5, 0, 0],
    fact: "Mercury is the smallest planet in our solar system and closest to the Sun.",
  },
  {
    name: "Venus",
    size: 0.9,
    color: "#fcd34d",
    pos: [8, 0, 2],
    fact: "Venus spins in the opposite direction to most planets.",
  },
  {
    name: "Earth",
    size: 1,
    color: "#3b82f6",
    pos: [12, 0, -2],
    fact: "Earth is the only planet known to harbor life.",
  },
  {
    name: "Mars",
    size: 0.6,
    color: "#ef4444",
    pos: [16, 0, 4],
    fact: "Mars is home to the highest mountain in the solar system, Olympus Mons.",
  },
  {
    name: "Jupiter",
    size: 2.2,
    color: "#fdba74",
    pos: [22, 0, -5],
    fact: "Jupiter is the largest planet and has a Great Red Spot.",
  },
];

export default function DreamPage() {
  const navigate = useNavigate();
  const { player, updatePlayer, startNewDay } = usePlayer();
  const [selectedFact, setSelectedFact] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error

  // Don't leave the pointer cursor stuck when leaving the page.
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  const handlePlanetClick = (name, fact) => {
    setSelectedFact({ name, fact });

    const starLog = player.starLog ?? [];
    if (starLog.includes(name)) return;

    const starFragments = (player.starFragments ?? 0) + 1;
    const badges = player.badges ?? [];
    const earnsBadge = starFragments >= 3 && !badges.includes("Star Collector");

    // One single update, so the badge and the fragments can't overwrite each other.
    updatePlayer({
      starLog: [...starLog, name],
      starFragments,
      ...(earnsBadge ? { badges: [...badges, "Star Collector"] } : {}),
    });
  };

  const goToNextDay = () => {
    startNewDay();
    navigate("/world");
  };

  const wakeUp = async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");

    try {
      // Save BEFORE startNewDay/navigate. React state updates are async, so reading
      // `player` after startNewDay() would send stale data. We build the snapshot explicitly.
      const snapshot = { ...player, day: (player.day ?? 1) + 1 };
      await saveManager.saveDay(snapshot);

      setSaveStatus("idle");
      goToNextDay();
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
    }
  };

  const saving = saveStatus === "saving";

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight
          position={[0, 0, 0]}
          intensity={2}
          color="#fbbf24"
          distance={50}
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {PLANETS.map((p) => (
          <Planet
            key={p.name}
            position={p.pos}
            size={p.size}
            color={p.color}
            glow={p.glow}
            name={p.name}
            fact={p.fact}
            onClick={handlePlanetClick}
          />
        ))}

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>

      <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-2">
          <Star className="text-amber-400 h-5 w-5" />
          <span className="font-bold">
            Star Fragments: {player.starFragments || 0}
          </span>
        </div>

        <button
          onClick={wakeUp}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold shadow-lg pointer-events-auto transition-transform active:scale-95 flex items-center gap-2"
        >
          {saving ? (
            <>
              Saving... <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Wake Up <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {selectedFact && saveStatus !== "error" && (
          <motion.div
            key="fact"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 p-6 rounded-2xl text-white max-w-md w-full pointer-events-auto text-center"
          >
            <h3 className="text-2xl font-black text-amber-400 mb-2">
              {selectedFact.name}
            </h3>
            <p className="text-slate-300 mb-4">{selectedFact.fact}</p>
            <button
              onClick={() => setSelectedFact(null)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm transition-colors"
            >
              Continue Exploring
            </button>
          </motion.div>
        )}

        {saveStatus === "error" && (
          <motion.div
            key="save-error"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur border border-rose-500/60 p-6 rounded-2xl text-white max-w-md w-full pointer-events-auto text-center"
          >
            <h3 className="text-xl font-black text-rose-400 mb-2">
              Couldn't save your progress
            </h3>
            <p className="text-slate-300 mb-4 text-sm">
              Check your connection and try again. You can also keep playing,
              but today's progress won't be backed up online.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={wakeUp}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-sm transition-colors"
              >
                Try again
              </button>
              <button
                onClick={goToNextDay}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm transition-colors"
              >
                Continue without saving
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 text-slate-500 text-sm pointer-events-none">
        Drag to rotate • Scroll to zoom • Click planets
      </div>
    </div>
  );
}
