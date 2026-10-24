import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./skillverse-loader.css";

/**
 * SkillverseLoader — animated brand intro + living idle state.
 *
 * Integration:
 *   <SkillverseLoader ready={appIsReady} onExited={() => unmountOrNavigate()} />
 *
 *  - `ready`     flip to true when real loading has finished. The loader never
 *                waits on anything else except the (<= ~2s) entrance reveal.
 *  - `onExited`  called once, after the exit transition. Unmount the loader here.
 *  - If `ready` is already true on mount, the reveal plays ~2.2x faster.
 *  - `prefers-reduced-motion` shows the finished logo with a soft fade only.
 */

const REVEAL_MS = 2000;
const FAST_REVEAL_MS = 900;
const FAST_RATE = 2.2;

const LETTERS = "Skillverse".split("");
const LETTER_COLORS = [
  "#F26A1B", "#F57F1D", "#F8941C", "#FAA91B", "#FCBE1A", // Skill (orange → yellow)
  "#19C6E6", "#14B4E8", "#1AA0EA", "#2A8BEC", "#3A78EE", // verse (cyan → blue)
];

const PARTICLES = [
  ["#FF8A1F", 230], ["#19C6E6", 250], ["#FFC933", 210], ["#4CC36B", 240],
  ["#F0679A", 225], ["#7B4FD6", 255], ["#FFC933", 235], ["#19C6E6", 215],
  ["#FF8A1F", 245], ["#4CC36B", 220], ["#7B4FD6", 238], ["#F0679A", 228],
];

const RING_A = "M-150 0 A150 42 0 1 1 150 0 A150 42 0 1 1 -150 0";
const RING_B = "M-134 0 A134 36 0 1 1 134 0 A134 36 0 1 1 -134 0";
const SPARKLE = "M0 -9 Q1 -1 9 0 Q1 1 0 9 Q-1 1 -9 0 Q-1 -1 0 -9z";
const SPARK_BIG = "M0 -16 Q2 -2 16 0 Q2 2 0 16 Q-2 2 -16 0 Q-2 -2 0 -16z";
const STAR_POINTS = "50,6 62,36 94,38 69,58 78,90 50,72 22,90 31,58 6,38 38,36";

function Star({ l, t, sz, sd, td, to }) {
  return (
    <span
      className="svl-star"
      style={{ "--l": l, "--t": t, "--sz": sz, "--sd": sd, "--td": td, "--to": to }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <polygon points={STAR_POINTS} fill="#FFD23F" stroke="#F59E0B" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IconBadge({ x, y, i, fx, fy, children }) {
  const d = `${(0.45 + i * 0.1).toFixed(2)}s`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="svl-ix" style={{ "--fx": `${fx}px`, "--d": d }}>
        <g className="svl-iy" style={{ "--fy": `${fy}px`, "--d": d }}>
          <g className="svl-float" style={{ "--fd": `${3 + i * 0.55}s`, "--fo": `${i * -0.8}s` }}>
            <circle r="31" fill="#fff4d9" stroke="#f5c24a" strokeWidth="3.5" />
            {children}
          </g>
        </g>
      </g>
    </g>
  );
}

function Face({ bo }) {
  return (
    <>
      <g className="svl-eye" style={{ "--bo": bo }}>
        <ellipse cx="-10" cy="-146" rx="3.2" ry="4.2" fill="#2b2233" />
        <ellipse cx="10" cy="-146" rx="3.2" ry="4.2" fill="#2b2233" />
      </g>
      <path d="M-8 -134 Q0 -126 8 -134" stroke="#8a3b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="-18" cy="-137" r="4" fill="#ff8fa3" opacity=".5" />
      <circle cx="18" cy="-137" r="4" fill="#ff8fa3" opacity=".5" />
    </>
  );
}

function Boy() {
  return (
    <g transform="translate(175 392)">
      <g className="svl-char" style={{ "--d": "0.5s" }}>
        <g className="svl-cfloat" style={{ "--fo": "0s" }}>
          <ellipse cx="0" cy="2" rx="40" ry="7" fill="#000" opacity=".12" />
          <rect x="-22" y="-52" width="18" height="48" rx="8" fill="#2F4A9E" />
          <rect x="4" y="-52" width="18" height="48" rx="8" fill="#2F4A9E" />
          <ellipse cx="-15" cy="-3" rx="15" ry="7" fill="#fff" stroke="#c7cbd6" strokeWidth="2" />
          <ellipse cx="15" cy="-3" rx="15" ry="7" fill="#fff" stroke="#c7cbd6" strokeWidth="2" />
          <g className="svl-body" style={{ "--fo": "0s" }}>
            <rect x="-30" y="-118" width="60" height="72" rx="20" fill="#3BB273" />
            <path d="M-10 -118 Q0 -108 10 -118" fill="none" stroke="#2a9a60" strokeWidth="3" />
            <path d="M-28 -104 C-40 -90 -40 -72 -34 -58" stroke="#3BB273" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="-34" cy="-54" r="7" fill="#F2B48C" />
            <path d="M26 -106 C44 -112 56 -124 66 -140" stroke="#3BB273" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="68" cy="-144" r="7.5" fill="#F2B48C" />
            <path d="M72 -148 L84 -162" stroke="#F2B48C" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="svl-bob" style={{ "--fo": "-0.4s" }}>
            <circle cx="-30" cy="-146" r="5" fill="#F2B48C" />
            <circle cx="30" cy="-146" r="5" fill="#F2B48C" />
            <circle cx="0" cy="-148" r="30" fill="#F2B48C" />
            <path d="M-31 -150 C-32 -184 -4 -190 12 -184 C28 -180 33 -164 31 -150 C24 -162 8 -166 -6 -162 C-18 -160 -26 -156 -31 -150z" fill="#5A3825" />
            <Face bo="-1.1s" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Girl() {
  return (
    <g transform="translate(425 392)">
      <g className="svl-char" style={{ "--d": "0.65s" }}>
        <g className="svl-cfloat" style={{ "--fo": "-1.3s" }}>
          <ellipse cx="0" cy="2" rx="42" ry="7" fill="#000" opacity=".12" />
          <rect x="-17" y="-50" width="10" height="46" rx="4" fill="#F2B48C" />
          <rect x="7" y="-50" width="10" height="46" rx="4" fill="#F2B48C" />
          <ellipse cx="-12" cy="-3" rx="13" ry="7" fill="#7B4FD6" />
          <ellipse cx="12" cy="-3" rx="13" ry="7" fill="#7B4FD6" />
          <g className="svl-bob" style={{ "--fo": "-1.2s" }}>
            <path d="M-34 -150 C-40 -192 40 -192 34 -150 C38 -120 30 -104 22 -100 L-22 -100 C-30 -104 -38 -120 -34 -150z" fill="#2B1B3A" />
          </g>
          <g className="svl-body" style={{ "--fo": "-1.5s" }}>
            <path d="M-26 -118 h52 l16 70 h-84 z" fill="#F0679A" />
            <path d="M-24 -108 C-36 -98 -36 -90 -28 -86" stroke="#F0679A" strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M24 -108 C36 -98 36 -90 28 -86" stroke="#F0679A" strokeWidth="13" strokeLinecap="round" fill="none" />
            <rect x="-24" y="-104" width="48" height="34" rx="6" fill="#7B4FD6" stroke="#4C2A9A" strokeWidth="3" />
            <rect x="-20" y="-100" width="40" height="26" rx="3" fill="#CDB8FF" />
            <polygon points="0,-96 3,-89 10,-88 5,-83 6,-77 0,-80 -6,-77 -5,-83 -10,-88 -3,-89" fill="#fff" opacity=".9" />
            <circle cx="-27" cy="-86" r="6.5" fill="#F2B48C" />
            <circle cx="27" cy="-86" r="6.5" fill="#F2B48C" />
          </g>
          <g className="svl-bob" style={{ "--fo": "-1.2s" }}>
            <circle cx="0" cy="-148" r="29" fill="#F6C09A" />
            <path d="M-30 -150 C-30 -178 30 -178 30 -150 C20 -164 0 -160 -6 -168 C-12 -158 -24 -158 -30 -150z" fill="#2B1B3A" />
            <circle cx="24" cy="-174" r="6" fill="#F0679A" />
            <Face bo="-2.6s" />
          </g>
        </g>
      </g>
    </g>
  );
}

export default function SkillverseLoader({ ready = false, onExited, className = "" }) {
  const rootRef = useRef(null);
  const readyAtMount = useRef(ready);
  const exitedCb = useRef(onExited);
  const calledRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    exitedCb.current = onExited;
  }, [onExited]);

  // App already ready → play the one-shot entrance faster (idle loops untouched).
  useLayoutEffect(() => {
    if (!readyAtMount.current || !rootRef.current?.getAnimations) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    rootRef.current.getAnimations({ subtree: true }).forEach((a) => {
      if (a.effect?.getComputedTiming?.().iterations !== Infinity) a.playbackRate = FAST_RATE;
    });
  }, []);

  // Minimum reveal time (0 with reduced motion).
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 350 : readyAtMount.current ? FAST_REVEAL_MS : REVEAL_MS;
    const t = setTimeout(() => setRevealed(true), ms);
    return () => clearTimeout(t);
  }, []);

  // Leave as soon as BOTH the reveal is done and the app is ready.
  useEffect(() => {
    if (!(revealed && ready)) return;
    setExiting(true);
    const t = setTimeout(() => {
      if (calledRef.current) return;
      calledRef.current = true;
      exitedCb.current?.();
    }, 380);
    return () => clearTimeout(t);
  }, [revealed, ready]);

  return (
    <div
      ref={rootRef}
      className={`svl-loader ${exiting ? "svl-exiting" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Skillverse"
    >
      <span className="svl-sr">Loading Skillverse…</span>
      <div className="svl-stage">
        <svg className="svl-art" viewBox="0 0 600 400" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="svl-sea" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#7BDAFF" />
              <stop offset="1" stopColor="#1C7FE0" />
            </radialGradient>
            <linearGradient id="svl-gold" x1="0" x2="1">
              <stop offset="0" stopColor="#FFD45A" />
              <stop offset=".5" stopColor="#F5A91C" />
              <stop offset="1" stopColor="#FFD45A" />
            </linearGradient>
            <clipPath id="svl-globe">
              <circle cx="300" cy="170" r="100" />
            </clipPath>
          </defs>

          {/* back halves of the golden orbits */}
          <g transform="translate(300 170) rotate(-18)">
            <ellipse className="svl-ring" style={{ "--rd": "0.35s" }} pathLength="100" rx="150" ry="42" fill="none" stroke="url(#svl-gold)" strokeWidth="5" strokeLinecap="round" opacity=".55" />
          </g>
          <g transform="translate(300 170) rotate(24)">
            <ellipse className="svl-ring" style={{ "--rd": "0.45s" }} pathLength="100" rx="134" ry="36" fill="none" stroke="url(#svl-gold)" strokeWidth="4.5" strokeLinecap="round" opacity=".55" />
          </g>

          {/* planet */}
          <g className="svl-planet">
            <g className="svl-breathe">
              <circle cx="300" cy="170" r="100" fill="url(#svl-sea)" />
              <g clipPath="url(#svl-globe)">
                <g className="svl-land" style={{ "--i": 0 }}>
                  <path d="M245 120 q20 -22 48 -12 q18 10 4 28 q-8 12 -26 10 q-14 18 -30 8 q-14 -12 4 -34z" fill="#4CC36B" />
                </g>
                <g className="svl-land" style={{ "--i": 1 }}>
                  <path d="M320 190 q22 -14 44 -2 q22 14 12 38 q-14 20 -36 12 q-12 -10 -22 -4 q-8 -22 2 -44z" fill="#43B862" />
                </g>
                <g className="svl-land" style={{ "--i": 2 }}>
                  <path d="M236 218 q16 -8 28 4 q8 14 -6 24 q-16 4 -26 -8 q-4 -12 4 -20z" fill="#4CC36B" />
                </g>
                <g className="svl-land" style={{ "--i": 3 }}>
                  <path d="M345 120 q14 -10 26 2 q6 12 -8 18 q-14 0 -18 -20z" fill="#5BD07A" />
                </g>
                <ellipse cx="268" cy="118" rx="34" ry="16" fill="#fff" opacity=".18" transform="rotate(-30 268 118)" />
              </g>
              <circle cx="300" cy="170" r="100" fill="none" stroke="#1668C0" strokeWidth="3" opacity=".5" />
            </g>
          </g>

          {/* front halves of the orbits + moving sparkles/highlights */}
          <g transform="translate(300 170) rotate(-18)">
            <path className="svl-ring" style={{ "--rd": "0.4s" }} pathLength="100" d="M-150 0 A150 42 0 0 0 150 0" fill="none" stroke="url(#svl-gold)" strokeWidth="5.5" strokeLinecap="round" />
            <g className="svl-sparkle" opacity="0">
              <path d={SPARKLE} fill="#FFE27A" />
              <animateMotion dur="1.1s" begin="0.6s" fill="freeze" path={RING_A} />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.7;1" dur="1.1s" begin="0.6s" fill="freeze" />
            </g>
            <g className="svl-sparkle">
              <circle r="3.2" fill="#fff6c9" opacity="0">
                <animateMotion dur="7s" begin="2.4s" repeatCount="indefinite" path={RING_A} />
                <animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.1;.9;1" dur="7s" begin="2.4s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
          <g transform="translate(300 170) rotate(24)">
            <path className="svl-ring" style={{ "--rd": "0.5s" }} pathLength="100" d="M-134 0 A134 36 0 0 0 134 0" fill="none" stroke="url(#svl-gold)" strokeWidth="5" strokeLinecap="round" />
            <g className="svl-sparkle">
              <path d={SPARKLE} fill="#FFE27A" opacity="0">
                <animateMotion dur="1s" begin="1.55s" fill="freeze" path={RING_B} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.7;1" dur="1s" begin="1.55s" fill="freeze" />
              </path>
            </g>
          </g>

          {/* flag */}
          <g className="svl-flag">
            <line x1="300" y1="70" x2="300" y2="24" stroke="#7a4a1c" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="300" cy="22" r="3.5" fill="#FFC933" />
            <path d="M300 28 C312 22 324 34 338 28 L338 46 C324 52 312 40 300 46 Z" fill="#FF8A1F" stroke="#d96a0a" strokeWidth="1.5" strokeLinejoin="round">
              <animate
                attributeName="d"
                dur="1.6s"
                repeatCount="indefinite"
                values="M300 28 C312 22 324 34 338 28 L338 46 C324 52 312 40 300 46 Z;M300 28 C312 34 324 22 338 28 L338 46 C324 40 312 52 300 46 Z;M300 28 C312 22 324 34 338 28 L338 46 C324 52 312 40 300 46 Z"
              />
            </path>
          </g>

          {/* skill icons */}
          <IconBadge x={110} y={95} i={0} fx={-170} fy={-80}>
            <path d="M-14 6 v-6 a9 9 0 0 1 4 -17 a9 9 0 0 1 20 0 a9 9 0 0 1 4 17 v6z" fill="#fff" stroke="#8a6a4a" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="-14" y="6" width="28" height="9" rx="2" fill="#F26A1B" />
          </IconBadge>
          <IconBadge x={490} y={95} i={1} fx={170} fy={-80}>
            <path d="M0 -17 C-18 -17 -22 0 -14 10 C-8 18 0 12 4 16 C10 20 22 14 21 0 C20 -10 12 -17 0 -17z" fill="#E9B26B" stroke="#8a5a2b" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="-9" cy="-6" r="3.6" fill="#EF4444" />
            <circle cx="0" cy="-10" r="3.6" fill="#3B82F6" />
            <circle cx="9" cy="-6" r="3.6" fill="#22C55E" />
            <circle cx="-11" cy="4" r="3.6" fill="#FACC15" />
            <circle cx="7" cy="7" r="3" fill="#fff4d9" />
          </IconBadge>
          <IconBadge x={58} y={232} i={2} fx={-150} fy={70}>
            <g strokeLinecap="round">
              <line x1="-13" y1="13" x2="9" y2="-9" stroke="#6B7280" strokeWidth="5" />
              <circle cx="11" cy="-11" r="6.5" fill="none" stroke="#6B7280" strokeWidth="4" />
              <line x1="13" y1="13" x2="-6" y2="-6" stroke="#B45309" strokeWidth="5" />
              <rect x="-16" y="-17" width="14" height="8" rx="2" fill="#4B5563" transform="rotate(45 -9 -13)" />
            </g>
          </IconBadge>
          <IconBadge x={542} y={232} i={3} fx={150} fy={70}>
            <rect x="-15" y="-13" width="30" height="20" rx="3" fill="#334155" />
            <rect x="-12" y="-10" width="24" height="14" rx="1.5" fill="#38BDF8" />
            <path d="M-6 -6 l-4 4 l4 4 M6 -6 l4 4 l-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M-20 10 h40 l-4 5 h-32z" fill="#94A3B8" />
          </IconBadge>

          <Boy />
          <Girl />

          {/* phase 1: spark, wave, particles (drawn last so they sit above the planet) */}
          <g transform="translate(300 170)">
            <g className="svl-ripple">
              <circle r="14" fill="none" stroke="#F5C24A" strokeWidth="2.5" />
            </g>
            <g className="svl-spark">
              <path d={SPARK_BIG} fill="#FFC933" />
            </g>
          </g>
          {PARTICLES.map(([color, dist], k) => (
            <g key={k} transform={`translate(300 170) rotate(${k * 30 + 12})`}>
              <g className="svl-part" style={{ "--dist": `${dist}px`, "--k": k % 6 }}>
                <rect x="0" y="-1.5" width="18" height="3" rx="1.5" fill={color} opacity=".55" />
                <circle cx="20" cy="0" r="3.4" fill={color} />
              </g>
            </g>
          ))}
        </svg>

        <div className="svl-word" aria-hidden="true">
          {LETTERS.map((ch, i) => (
            <span key={i} className="svl-letter" style={{ "--c": LETTER_COLORS[i], "--i": i }}>
              {ch}
            </span>
          ))}
          <Star l="3%" t="-9%" sz="5.2cqw" sd="1.55s" td="4.2s" to="0.2s" />
          <Star l="49%" t="-13%" sz="4cqw" sd="1.65s" td="5.1s" to="1.7s" />
          <Star l="91%" t="-5%" sz="4.6cqw" sd="1.75s" td="4.7s" to="3.1s" />
        </div>

        <svg className="svl-pad" viewBox="0 0 170 100" aria-hidden="true" focusable="false">
          <path
            d="M40 22 H130 C152 22 165 40 160 66 C157 84 146 90 136 84 C126 78 120 70 108 70 H62 C50 70 44 78 34 84 C24 90 13 84 10 66 C5 40 18 22 40 22z"
            fill="#7C4DFF"
            stroke="#3F1F8C"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <rect x="35" y="41" width="22" height="7" rx="2" fill="#fff" />
          <rect x="42.5" y="33.5" width="7" height="22" rx="2" fill="#fff" />
          <circle cx="70" cy="58" r="7.5" fill="#3F1F8C" />
          <circle cx="100" cy="58" r="7.5" fill="#3F1F8C" />
          <circle className="svl-btn" style={{ "--bi": 0 }} cx="128" cy="32" r="6.5" fill="#FFC933" stroke="#3F1F8C" strokeWidth="1.5" />
          <circle className="svl-btn" style={{ "--bi": 1 }} cx="141" cy="45" r="6.5" fill="#EF4444" stroke="#3F1F8C" strokeWidth="1.5" />
          <circle className="svl-btn" style={{ "--bi": 2 }} cx="128" cy="58" r="6.5" fill="#22C55E" stroke="#3F1F8C" strokeWidth="1.5" />
          <circle className="svl-btn" style={{ "--bi": 3 }} cx="115" cy="45" r="6.5" fill="#3B82F6" stroke="#3F1F8C" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
