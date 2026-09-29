import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { FARM_LOCATIONS, MAP_VIEW, PLAZA } from "@/config/locations";
import MapLocation from "@/features/world/components/MapLocation";
import PlayerAvatar from "@/features/player/components/PlayerAvatar";
import { Sign, Tree, Villager } from "@/features/world/components/locationArt";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const ENTER_ZOOM = 2.35;
const ENTER_MS = 1050;

const ISLAND_PATH =
  "M 430 130 C 620 60, 1050 55, 1240 120 C 1420 180, 1500 330, 1490 490 C 1480 660, 1420 820, 1240 900 C 1050 975, 520 975, 340 890 C 160 805, 95 640, 105 470 C 115 300, 240 200, 430 130 Z";

const scaleAbout = (cx, cy, s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

const PATHS = [
  "M 800 470 Q 650 360 500 260",  // To Agriculture
  "M 800 470 Q 1000 435 1200 400", // To Animal Farming
  "M 800 470 Q 925 635 1050 800",  // To Earn EXP
];

const TREES = [
  { x: 300, y: 330, s: 0.95, delay: 0 },
  { x: 700, y: 250, s: 0.8, delay: -1.4 },
  { x: 1080, y: 220, s: 0.9, delay: -2.8 },
  { x: 1350, y: 670, s: 0.8, delay: -0.7 },
  { x: 560, y: 780, s: 0.85, delay: -2.1 },
  { x: 900, y: 800, s: 0.9, delay: -3.4 },
];

function viewBoxToElement(point, w, h) {
  const fit = Math.min(w / MAP_VIEW.width, h / MAP_VIEW.height);
  return {
    x: (w - MAP_VIEW.width * fit) / 2 + point.x * fit,
    y: (h - MAP_VIEW.height * fit) / 2 + point.y * fit,
  };
}

export default function FarmWorldMap() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const enteringRef = useRef(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [enteringId, setEnteringId] = useState(null);
  const [cam, setCam] = useState({ scale: 1.1, x: 0, y: 0 });
  const { player } = usePlayer();

  const handleEnter = useCallback(
    (location) => {
      if (enteringRef.current) return;
      
      // If it doesn't have a direct route, use the coming soon page route.
      // Wait, we defined the coming soon scene in FARM_LOCATIONS! So we route to /world/farm/location-id 
      // where a scene layout will render it.
      // Since it's nested, we'll navigate to `/world/farm/${location.id}`.
      const targetRoute = location.route || `/world/farm/${location.id}`;
      
      enteringRef.current = true;
      setHoveredId(null);
      setEnteringId(location.id);
      
      const el = wrapRef.current;
      if (el) {
        const { clientWidth: w, clientHeight: h } = el;
        const p = viewBoxToElement(location.position, w, h);
        setCam({
          scale: ENTER_ZOOM,
          x: w / 2 - ENTER_ZOOM * p.x,
          y: h / 2 - ENTER_ZOOM * p.y,
        });
      }
      window.setTimeout(() => navigate(targetRoute), ENTER_MS);
    },
    [navigate],
  );

  return (
    <div ref={wrapRef} className="absolute inset-0" data-testid="farm-world-map">
      <motion.div
        className="h-full w-full will-change-transform"
        initial={{ scale: 1.14, x: 0, y: 26 }}
        animate={cam}
        transition={
          enteringId
            ? { type: "spring", stiffness: 200, damping: 24 }
            : { type: "spring", stiffness: 110, damping: 26 }
        }
      >
        <svg
          viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="The Farm Map"
        >
          <defs>
            <radialGradient id="grassGradFarm" cx="50%" cy="42%" r="75%">
              <stop offset="0%" stopColor="#a8e08f" />
              <stop offset="70%" stopColor="#7cc868" />
              <stop offset="100%" stopColor="#5fb352" />
            </radialGradient>
            <radialGradient id="oceanGradFarm" cx="50%" cy="46%" r="72%">
              <stop offset="0%" stopColor="#56c4ef" />
              <stop offset="60%" stopColor="#1e9ad6" />
              <stop offset="100%" stopColor="#0c699d" />
            </radialGradient>
          </defs>

          {/* ocean */}
          <rect x="0" y="0" width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#oceanGradFarm)" />

          {/* island */}
          <g>
            <path d={ISLAND_PATH} transform="translate(0 32)" fill="#816147" />
            <path d={ISLAND_PATH} transform={scaleAbout(800, 500, 1.05)} fill="#edd3a1" />
            <path d={ISLAND_PATH} fill="url(#grassGradFarm)" />
          </g>

          {/* roads */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {PATHS.map((d, i) => (
              <g key={i}>
                <path d={d} stroke="#d4b47a" strokeWidth="48" />
                <path d={d} stroke="#edd3a1" strokeWidth="42" />
              </g>
            ))}
          </g>

          {/* starting plaza */}
          <g transform={`translate(${PLAZA.x} ${PLAZA.y})`}>
            <ellipse cx="0" cy="0" rx="85" ry="46" fill="#d4b47a" />
            <ellipse cx="0" cy="0" rx="80" ry="42" fill="#edd3a1" />
            <ellipse cx="0" cy="0" rx="55" ry="32" fill="rgba(15, 23, 42, 0.05)" />
            <Sign x="-60" y="-10" label="Farm Hub" />
            <PlayerAvatar
              avatar={player.avatar}
              size={54}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl"
            />
          </g>

          {/* trees */}
          {TREES.map((t, i) => (
            <Tree key={`t-${i}`} x={t.x} y={t.y} s={t.s} delay={t.delay} fruit={i % 3 === 0 ? 3 : 0} />
          ))}

          {/* farm locations */}
          {FARM_LOCATIONS.map((loc) => (
            <MapLocation
              key={loc.id}
              location={loc}
              active={hoveredId === loc.id}
              onHover={setHoveredId}
              onEnter={handleEnter}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
