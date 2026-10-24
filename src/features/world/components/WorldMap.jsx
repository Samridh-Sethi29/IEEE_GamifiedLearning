import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LOCATIONS, MAP_VIEW, PLAZA } from "@/config/locations";
import MapLocation from "@/features/world/components/MapLocation";
import PlayerAvatar from "@/features/player/components/PlayerAvatar";
import { Sign, Tree, Villager } from "@/features/world/components/locationArt";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const ENTER_ZOOM = 2.35;
const ENTER_MS = 1050;

const ISLAND_PATH =
  "M 430 130 C 620 60, 1050 55, 1240 120 C 1420 180, 1500 330, 1490 490 C 1480 660, 1420 820, 1240 900 C 1050 975, 520 975, 340 890 C 160 805, 95 640, 105 470 C 115 300, 240 200, 430 130 Z";

// Scale a shape about a point (for the sand rim + shore ripples).
const scaleAbout = (cx, cy, s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

const PATHS = [
  "M 760 440 Q 590 380 448 300",  // To School
  "M 850 440 Q 1020 370 1216 260", // To Farm
  "M 745 500 Q 520 600 288 700",  // To Home
  "M 860 500 Q 1080 610 1312 750", // To Market
  "M 800 540 Q 795 680 800 845",  // To Creative Studio
];

const WAVE_ARCS = [
  { x: 100, y: 920, d: 0 }, { x: 320, y: 950, d: -1.2 }, { x: 1300, y: 945, d: -2.1 },
  { x: 1520, y: 690, d: -0.6 }, { x: 1560, y: 430, d: -1.7 }, { x: 70, y: 620, d: -2.6 },
  { x: 70, y: 330, d: -0.9 }, { x: 920, y: 35, d: -1.4 }, { x: 420, y: 42, d: -2.9 },
  { x: 1540, y: 140, d: -0.3 }, { x: 1500, y: 905, d: -2.4 }, { x: 240, y: 90, d: -1.9 },
  { x: 80, y: 180, d: -1.1 }, { x: 1480, y: 820, d: -0.8 },
];

const TREES = [
  { x: 170, y: 430, s: 0.95, delay: 0, fruit: 3 },
  { x: 700, y: 150, s: 0.8, delay: -1.4 },
  { x: 980, y: 120, s: 0.9, delay: -2.8, fruit: 2 },
  { x: 1450, y: 470, s: 0.85, delay: -0.7 },
  { x: 560, y: 880, s: 0.85, delay: -2.1 },
  { x: 1080, y: 900, s: 0.9, delay: -3.4, fruit: 3 },
  { x: 250, y: 220, s: 0.8, delay: -1.8 },
  { x: 1380, y: 210, s: 0.85, delay: -0.5 },
  { x: 420, y: 520, s: 0.75, delay: -2.2 },
  { x: 1180, y: 530, s: 0.8, delay: -1.1 },
];

const VILLAGERS = [
  { x: 620, y: 540, dur: 10, delay: -2, dx: 30, tunic: "#e0705a" },
  { x: 1050, y: 430, dur: 12, delay: -5, dx: 34, tunic: "#7c5cc4" },
  { x: 480, y: 660, dur: 11, delay: -7, dx: 30, tunic: "#4e9f44", hat: true },
  { x: 1060, y: 680, dur: 9, delay: -3, dx: 26, tunic: "#3b82f6" },
  { x: 800, y: 720, dur: 10, delay: -4, dx: 24, tunic: "#ec4899" },
];

const LANTERN_POSTS = [
  { x: 730, y: 420 },
  { x: 870, y: 420 },
  { x: 710, y: 520 },
  { x: 890, y: 520 },
  { x: 770, y: 640 },
];

const WILDFLOWER_PATCHES = [
  { x: 560, y: 260, c: "#f472b6" },
  { x: 600, y: 280, c: "#fbbf24" },
  { x: 580, y: 310, c: "#c084fc" },
  { x: 990, y: 510, c: "#38bdf8" },
  { x: 1040, y: 530, c: "#f472b6" },
  { x: 1020, y: 560, c: "#fbbf24" },
  { x: 520, y: 650, c: "#fbbf24" },
  { x: 550, y: 680, c: "#f43f5e" },
  { x: 940, y: 860, c: "#a855f7" },
  { x: 970, y: 880, c: "#38bdf8" },
];

const CLOUD_SHADOWS = [
  [600, 320, 130, 52, 34],
  [1120, 640, 110, 44, 44],
  [380, 500, 95, 38, 38],
];

const CLOUDS = [
  [230, 70, 30],
  [1380, 55, 38],
  [820, 35, 42],
];

const BIRDS = [
  [22, 0],
  [28, -9],
  [19, -4],
  [25, -14],
];

// viewBox units → element pixels for current "fit" letterboxed rendering.
function viewBoxToElement(point, w, h) {
  const fit = Math.min(w / MAP_VIEW.width, h / MAP_VIEW.height);
  return {
    x: (w - MAP_VIEW.width * fit) / 2 + point.x * fit,
    y: (h - MAP_VIEW.height * fit) / 2 + point.y * fit,
  };
}

export default function WorldMap() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const enteringRef = useRef(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [enteringId, setEnteringId] = useState(null);
  const [cam, setCam] = useState({ scale: 1, x: 0, y: 0 });
  const { player } = usePlayer();

  const handleEnter = useCallback(
    (location) => {
      if (enteringRef.current) return;
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
      window.setTimeout(() => navigate(location.route), ENTER_MS);
    },
    [navigate],
  );

  return (
    <div ref={wrapRef} className="absolute inset-0" data-testid="world-map">
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
          aria-label="The village of Skillverse — choose a building to enter a world"
        >
          <defs>
            {/* Rich multi-tone terrain gradients */}
            <radialGradient id="grassGrad" cx="50%" cy="40%" r="76%">
              <stop offset="0%" stopColor="#9ce770" />
              <stop offset="50%" stopColor="#6dc645" />
              <stop offset="82%" stopColor="#4aa22c" />
              <stop offset="100%" stopColor="#377c1f" />
            </radialGradient>

            <linearGradient id="islandCliffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5c442c" />
              <stop offset="45%" stopColor="#43301d" />
              <stop offset="100%" stopColor="#251a0e" />
            </linearGradient>

            <radialGradient id="beachSandGrad" cx="50%" cy="45%" r="75%">
              <stop offset="0%" stopColor="#fdf5dc" />
              <stop offset="60%" stopColor="#f3dd9e" />
              <stop offset="100%" stopColor="#deb972" />
            </radialGradient>

            <linearGradient id="cobbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#edd8bd" />
              <stop offset="50%" stopColor="#dfc5a4" />
              <stop offset="100%" stopColor="#c9ab85" />
            </linearGradient>

            <radialGradient id="plazaGrad" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#f7ebda" />
              <stop offset="70%" stopColor="#e7d4bc" />
              <stop offset="100%" stopColor="#ccaF8e" />
            </radialGradient>

            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(254, 240, 138, 0.45)" />
              <stop offset="60%" stopColor="rgba(254, 240, 138, 0.15)" />
              <stop offset="100%" stopColor="rgba(254, 240, 138, 0)" />
            </radialGradient>

            <radialGradient id="fountainWater" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          {/* Shallow lagoon reef border around island */}
          <path
            d={ISLAND_PATH}
            transform={scaleAbout(800, 515, 1.075)}
            fill="#38bdf8"
            opacity="0.22"
          />

          {/* Ambient wave crests on open sea */}
          {WAVE_ARCS.map((w, i) => (
            <g key={i} transform={`translate(${w.x} ${w.y})`} className="anim-wave" style={{ animationDelay: `${w.d}s` }}>
              <path
                d="M -22 0 Q -11 -6 0 0 Q 11 -6 22 0"
                fill="none"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Concentric Shoreline Ripples */}
          {[1.045, 1.09, 1.145].map((s, i) => (
            <g key={s} transform={scaleAbout(800, 515, s)}>
              <path
                className="anim-ripple"
                style={{ animationDelay: `${-i * 1.6}s` }}
                d={ISLAND_PATH}
                fill="none"
                stroke="rgba(255, 255, 255, 0.32)"
                strokeWidth="3.5"
              />
            </g>
          ))}

          {/* 3D Elevated Cliff Drop (gives tangible landmass height) */}
          <path
            d={ISLAND_PATH}
            transform="translate(0 20) scale(1.025)"
            style={{ transformOrigin: "800px 515px" }}
            fill="url(#islandCliffGrad)"
            stroke="#251a0e"
            strokeWidth="3"
          />

          {/* Sandy Beach Shelf */}
          <path
            d={ISLAND_PATH}
            transform={scaleAbout(800, 515, 1.045)}
            fill="url(#beachSandGrad)"
            stroke="#cbb070"
            strokeWidth="3.5"
          />

          {/* Inner Lush Grass Island Plateau */}
          <path d={ISLAND_PATH} fill="url(#grassGrad)" stroke="#377c1f" strokeWidth="2.5" />

          {/* Topographic Rolling Hill Shading */}
          <ellipse cx="560" cy="300" rx="140" ry="55" fill="#e2f7c3" opacity="0.25" />
          <ellipse cx="1060" cy="540" rx="160" ry="60" fill="#e2f7c3" opacity="0.22" />
          <ellipse cx="480" cy="650" rx="130" ry="50" fill="#e2f7c3" opacity="0.25" />
          <ellipse cx="800" cy="360" rx="120" ry="40" fill="#2d6e24" opacity="0.08" />
          <ellipse cx="800" cy="620" rx="140" ry="46" fill="#2d6e24" opacity="0.08" />

          {/* Wildflower patches & meadow florets */}
          {WILDFLOWER_PATCHES.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y})`}>
              <circle cx="0" cy="0" r="3.5" fill={f.c} />
              <circle cx="6" cy="-4" r="3" fill="#ffffff" opacity="0.9" />
              <circle cx="-5" cy="-3" r="2.8" fill={f.c} />
              <circle cx="2" cy="-7" r="2.5" fill="#facc15" />
            </g>
          ))}

          {/* Drifting Cloud Shadows */}
          {CLOUD_SHADOWS.map(([cx, cy, rx, ry, dur]) => (
            <g key={`${cx}-${cy}`} className="anim-drift" style={{ animationDuration: `${dur}s` }}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0f172a" opacity="0.07" />
            </g>
          ))}

          {/* Cobblestone Pathways connecting Plaza to all 5 Landmarks */}
          {PATHS.map((d) => (
            <g key={d} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Earth Shoulder */}
              <path d={d} stroke="#78512b" strokeWidth="30" opacity="0.9" />
              {/* Main Cobblestone Bed */}
              <path d={d} stroke="url(#cobbleGrad)" strokeWidth="22" />
              {/* Worn Center Paver Track */}
              <path d={d} stroke="#fdf4e6" strokeWidth="10" strokeDasharray="16 8" opacity="0.85" />
              {/* Subtle edge stones */}
              <path d={d} stroke="#9e7547" strokeWidth="24" strokeDasharray="3 14" opacity="0.5" />
            </g>
          ))}

          {/* Roadside Cast-Iron Lantern Posts at crossroads */}
          {LANTERN_POSTS.map((lp, i) => (
            <g key={i} transform={`translate(${lp.x} ${lp.y})`}>
              <ellipse cx="0" cy="4" rx="32" ry="16" fill="url(#lanternGlow)" />
              <ellipse cx="0" cy="2" rx="9" ry="3.5" fill="rgba(15, 23, 42, 0.25)" />
              <line x1="0" y1="2" x2="0" y2="-44" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <line x1="-8" y1="-40" x2="8" y2="-40" stroke="#334155" strokeWidth="3" />
              <rect x="-5" y="-38" width="10" height="13" rx="2" fill="#fef08a" stroke="#1e293b" strokeWidth="1.5" />
              <polygon points="-6,-38 6,-38 0,-44" fill="#1e293b" />
              <circle cx="0" cy="-32" r="3" fill="#ffffff" />
              <circle cx="0" cy="-32" r="14" fill="rgba(254, 240, 138, 0.25)" className="anim-twinkle" />
            </g>
          ))}

          {/* THE VILLAGE PLAZA */}
          <g>
            {/* Plaza Foundation & Retaining Stone Rim */}
            <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="122" ry="76" fill="#baa384" stroke="#8c7356" strokeWidth="3" />
            {/* Flagstone Plaza Bed */}
            <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="116" ry="70" fill="url(#plazaGrad)" stroke="#c2aa8a" strokeWidth="2" />

            {/* Inlaid Concentric Stone Circle & 8-Point Compass Star */}
            <g opacity="0.65">
              <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="72" ry="44" fill="none" stroke="#fdf6e6" strokeWidth="2.5" strokeDasharray="9 7" />
              <polygon
                points={`${PLAZA.x},${PLAZA.y - 30} ${PLAZA.x + 9},${PLAZA.y - 7} ${PLAZA.x + 38},${PLAZA.y} ${PLAZA.x + 9},${PLAZA.y + 7} ${PLAZA.x},${PLAZA.y + 30} ${PLAZA.x - 9},${PLAZA.y + 7} ${PLAZA.x - 38},${PLAZA.y} ${PLAZA.x - 9},${PLAZA.y - 7}`}
                fill="#fdf9f0"
                stroke="#d5c0a3"
                strokeWidth="1.5"
              />
            </g>

            {/* Perimeter Wooden Benches */}
            {[
              [PLAZA.x - 90, PLAZA.y - 20],
              [PLAZA.x + 90, PLAZA.y - 20],
              [PLAZA.x - 65, PLAZA.y + 42],
              [PLAZA.x + 65, PLAZA.y + 42],
            ].map(([bx, by], bi) => (
              <g key={bi} transform={`translate(${bx} ${by})`}>
                <ellipse cx="0" cy="2" rx="14" ry="4" fill="rgba(15, 23, 42, 0.2)" />
                <rect x="-12" y="-6" width="24" height="6" rx="2" fill="#8c582f" stroke="#5a3418" strokeWidth="1" />
                <line x1="-10" y1="0" x2="-10" y2="4" stroke="#334155" strokeWidth="2" />
                <line x1="10" y1="0" x2="10" y2="4" stroke="#334155" strokeWidth="2" />
              </g>
            ))}

            {/* Stone Flower Planters with colorful blooms */}
            {[
              [PLAZA.x - 75, PLAZA.y - 45],
              [PLAZA.x + 75, PLAZA.y - 45],
              [PLAZA.x - 95, PLAZA.y + 15],
              [PLAZA.x + 95, PLAZA.y + 15],
            ].map(([px, py], pi) => (
              <g key={pi} transform={`translate(${px} ${py})`}>
                <rect x="-8" y="-6" width="16" height="8" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                <circle cx="-4" cy="-8" r="4.5" fill="#f472b6" />
                <circle cx="4" cy="-8" r="4.5" fill="#fbbf24" />
                <circle cx="0" cy="-11" r="4" fill="#a78bfa" />
              </g>
            ))}

            {/* The Ornate Village Fountain */}
            <g>
              <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="42" ry="24" fill="rgba(15, 23, 42, 0.28)" />
              <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="36" ry="20" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" />
              <rect x={PLAZA.x - 36} y={PLAZA.y - 12} width="72" height="12" fill="#64748b" />
              <ellipse cx={PLAZA.x} cy={PLAZA.y - 12} rx="36" ry="20" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* Clear Sparkling Turquoise Water Pool */}
              <ellipse cx={PLAZA.x} cy={PLAZA.y - 12} rx="28" ry="15" fill="url(#fountainWater)" />
              <ellipse cx={PLAZA.x} cy={PLAZA.y - 12} rx="16" ry="8" fill="rgba(255, 255, 255, 0.35)" className="anim-ripple" />
              {/* Center Tier Pedestal */}
              <ellipse cx={PLAZA.x} cy={PLAZA.y - 20} rx="12" ry="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <rect x={PLAZA.x - 4} y={PLAZA.y - 28} width="8" height="10" fill="#64748b" />
              {/* Water Jet Spray */}
              <path d={`M ${PLAZA.x - 6} ${PLAZA.y - 24} Q ${PLAZA.x} ${PLAZA.y - 44} ${PLAZA.x + 6} ${PLAZA.y - 24}`} stroke="#e0f2fe" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx={PLAZA.x} cy={PLAZA.y - 38} r="3.5" fill="#bae6fd" />
              <circle cx={PLAZA.x - 3} cy={PLAZA.y - 34} r="2" fill="#ffffff" />
              <circle cx={PLAZA.x + 4} cy={PLAZA.y - 33} r="2" fill="#ffffff" />
            </g>

            {/* Skillverse Plaza Signpost */}
            <Sign x={PLAZA.x - 90} y={PLAZA.y - 50} label="SKILLVERSE" w={126} />
          </g>

          {/* Ambient Trees & Villagers */}
          {TREES.map((t, idx) => (
            <Tree key={idx} {...t} />
          ))}
          {VILLAGERS.map((v, idx) => (
            <Villager key={idx} {...v} />
          ))}

          {/* The Five Interactive World Landmarks */}
          {LOCATIONS.map((location) => (
            <MapLocation
              key={location.id}
              location={location}
              active={hoveredId === location.id || enteringId === location.id}
              onHover={setHoveredId}
              onEnter={handleEnter}
            />
          ))}

          {/* The Hero Player */}
          <PlayerAvatar name={player.name} level={player.level} x={PLAZA.x} y={PLAZA.y + 28} />

          {/* Drifting Clouds */}
          {CLOUDS.map(([cx, cy, dur]) => (
            <g key={cx} transform={`translate(${cx} ${cy})`}>
              <g className="anim-drift" style={{ animationDuration: `${dur}s` }}>
                <ellipse rx="52" ry="18" fill="rgba(255, 255, 255, 0.92)" />
                <ellipse cx="-30" cy="7" rx="28" ry="13" fill="rgba(255, 255, 255, 0.88)" />
                <ellipse cx="32" cy="8" rx="26" ry="12" fill="rgba(255, 255, 255, 0.88)" />
              </g>
            </g>
          ))}

          {/* Birds crossing the sky in V-formation */}
          {BIRDS.map(([dur, delay], i) => (
            <g key={i} transform={`translate(0 ${100 + i * 65})`}>
              <g className="anim-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
                <g className="anim-idle">
                  <g className="anim-flap">
                    <path
                      d="M 0 0 Q 8 -8 16 0 Q 24 -8 32 0"
                      stroke="#1e293b"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </g>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Soft dim while the camera dives into a world */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: enteringId ? 0.22 : 0 }}
        transition={{ duration: 0.7 }}
      />
    </div>
  );
}
