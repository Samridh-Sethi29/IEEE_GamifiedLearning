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
  "M 760 440 Q 590 380 480 300",
  "M 850 440 Q 1020 380 1180 310",
  "M 745 505 Q 540 590 360 670",
  "M 860 510 Q 1080 610 1265 720",
  "M 800 545 Q 795 660 800 800",
];

const WAVE_ARCS = [
  { x: 100, y: 920, d: 0 }, { x: 320, y: 950, d: -1.2 }, { x: 1300, y: 945, d: -2.1 },
  { x: 1520, y: 690, d: -0.6 }, { x: 1560, y: 430, d: -1.7 }, { x: 70, y: 620, d: -2.6 },
  { x: 70, y: 330, d: -0.9 }, { x: 920, y: 35, d: -1.4 }, { x: 420, y: 42, d: -2.9 },
  { x: 1540, y: 140, d: -0.3 }, { x: 1500, y: 905, d: -2.4 }, { x: 240, y: 90, d: -1.9 },
];

const TREES = [
  { x: 170, y: 430, s: 0.95, delay: 0 },
  { x: 700, y: 150, s: 0.8, delay: -1.4 },
  { x: 980, y: 120, s: 0.9, delay: -2.8 },
  { x: 1450, y: 470, s: 0.8, delay: -0.7 },
  { x: 560, y: 880, s: 0.85, delay: -2.1 },
  { x: 1080, y: 900, s: 0.9, delay: -3.4 },
];

const VILLAGERS = [
  { x: 620, y: 540, dur: 10, delay: -2, dx: 30, tunic: "#e0705a" },
  { x: 1050, y: 430, dur: 12, delay: -5, dx: 34, tunic: "#7c5cc4" },
  { x: 480, y: 660, dur: 11, delay: -7, dx: 30, tunic: "#4e9f44", hat: true },
  { x: 1060, y: 680, dur: 9, delay: -3, dx: 26, tunic: "#3b82f6" },
];

const GRASS_TEXTURE = [
  [560, 300, 90, 34],
  [1050, 540, 110, 40],
  [480, 640, 80, 30],
];

const CLOUD_SHADOWS = [
  [600, 320, 120, 46, 34],
  [1120, 640, 100, 40, 44],
];

const CLOUDS = [
  [230, 70, 30],
  [1380, 55, 38],
];

const BIRDS = [
  [22, 0],
  [28, -9],
  [19, -4],
];

// viewBox units → element pixels for the current "fit" letterboxed rendering.
function viewBoxToElement(point, w, h) {
  const fit = Math.min(w / MAP_VIEW.width, h / MAP_VIEW.height);
  return {
    x: (w - MAP_VIEW.width * fit) / 2 + point.x * fit,
    y: (h - MAP_VIEW.height * fit) / 2 + point.y * fit,
  };
}

// The village itself: ocean, island, ambient life, five interactive landmarks and
// the camera. Hovering a landmark highlights it and opens its tooltip; clicking
// zooms the camera in with a spring, then routes to that world's scene.
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
            <radialGradient id="grassGrad" cx="50%" cy="42%" r="75%">
              <stop offset="0%" stopColor="#a8e08f" />
              <stop offset="70%" stopColor="#7cc868" />
              <stop offset="100%" stopColor="#5fb352" />
            </radialGradient>
            <radialGradient id="oceanGrad" cx="50%" cy="46%" r="72%">
              <stop offset="0%" stopColor="#56c4ef" />
              <stop offset="60%" stopColor="#1e9ad6" />
              <stop offset="100%" stopColor="#0c699d" />
            </radialGradient>
          </defs>

          {/* ocean */}
          <rect x="0" y="0" width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#oceanGrad)" />

          {/* rolling waves */}
          {WAVE_ARCS.map((w, i) => (
            <path
              key={i}
              className="anim-wave"
              style={{ animationDelay: `${w.d}s` }}
              d={`M ${w.x} ${w.y} q 10 -9 20 0 q 10 9 20 0`}
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* shore ripples */}
          {[1.05, 1.11, 1.18].map((s, i) => (
            <g key={s} transform={scaleAbout(800, 515, s)}>
              <path
                className="anim-ripple"
                style={{ animationDelay: `${-i * 1.8}s` }}
                d={ISLAND_PATH}
                fill="none"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="5"
              />
            </g>
          ))}

          {/* island */}
          <path d={ISLAND_PATH} transform={scaleAbout(800, 515, 1.045)} fill="#fce1a0" stroke="#f0c968" strokeWidth="4" />
          <path d={ISLAND_PATH} fill="url(#grassGrad)" />
          {GRASS_TEXTURE.map(([gx, gy, rx, ry]) => (
            <ellipse key={`${gx}-${gy}`} cx={gx} cy={gy} rx={rx} ry={ry} fill="#dff7c8" opacity="0.18" />
          ))}
          {CLOUD_SHADOWS.map(([cx, cy, rx, ry, dur]) => (
            <g key={`${cx}-${cy}`} className="anim-drift" style={{ animationDuration: `${dur}s` }}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#1e293b" opacity="0.05" />
            </g>
          ))}

          {/* dirt paths from the plaza to every world */}
          {PATHS.map((d) => (
            <g key={d} fill="none" strokeLinecap="round">
              <path d={d} stroke="#dcb98c" strokeWidth="24" />
              <path d={d} stroke="#efdcae" strokeWidth="11" />
            </g>
          ))}

          {/* village plaza */}
          <ellipse cx={PLAZA.x} cy={PLAZA.y} rx="94" ry="58" fill="#e7d6b4" stroke="#d2bc92" strokeWidth="4" />
          {[[760, 452], [836, 448], [800, 486], [756, 494], [852, 488]].map(([cx, cy]) => (
            <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="12" ry="6" fill="#d9c69e" />
          ))}
          {[
            [716, 436, "#f472b6"],
            [886, 434, "#fbbf24"],
            [800, 418, "#a78bfa"],
          ].map(([fx, fy, fc]) => (
            <circle key={`${fx}-${fy}`} cx={fx} cy={fy} r="5" fill={fc} />
          ))}
          <Sign x={694} y={436} label="SKILLVERSE" w={122} />

          {/* ambient villagers + trees */}
          {TREES.map((t) => (
            <Tree key={t.x} {...t} />
          ))}
          {VILLAGERS.map((v) => (
            <Villager key={v.x} {...v} />
          ))}

          {/* the five interactive worlds */}
          {LOCATIONS.map((location) => (
            <MapLocation
              key={location.id}
              location={location}
              active={hoveredId === location.id || enteringId === location.id}
              onHover={setHoveredId}
              onEnter={handleEnter}
            />
          ))}

          {/* the hero */}
          <PlayerAvatar name={player.name} level={player.level} x={PLAZA.x} y={PLAZA.y + 28} />

          {/* clouds */}
          {CLOUDS.map(([cx, cy, dur]) => (
            <g key={cx} transform={`translate(${cx} ${cy})`}>
              <g className="anim-drift" style={{ animationDuration: `${dur}s` }}>
                <ellipse rx="46" ry="16" fill="rgba(255, 255, 255, 0.9)" />
                <ellipse cx="-26" cy="6" rx="24" ry="11" fill="rgba(255, 255, 255, 0.85)" />
                <ellipse cx="28" cy="7" rx="22" ry="10" fill="rgba(255, 255, 255, 0.85)" />
              </g>
            </g>
          ))}

          {/* birds crossing the sky */}
          {BIRDS.map(([dur, delay], i) => (
            <g key={i} transform={`translate(0 ${110 + i * 70})`}>
              <g className="anim-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
                <g className="anim-idle">
                  <g className="anim-flap">
                    <path d="M 0 0 Q 8 -8 16 0 Q 24 -8 32 0" stroke="#334155" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* soft dim while the camera dives into a world */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: enteringId ? 0.22 : 0 }}
        transition={{ duration: 0.7 }}
      />
    </div>
  );
}
