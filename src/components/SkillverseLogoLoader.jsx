import { useEffect, useRef, useState } from "react";
import {
  ALL_URLS, ICON_FROM, LAYERS, PLANET_CENTER, WORD_SLICES, layerUrl,
} from "./skillverse-logo-config";
import "./skillverse-logo-loader.css";

/**
 * Skillverse assembling loader (real artwork, layered).
 *
 * The original logo is cut into aligned transparent layers (see skillverse-logo-config.js);
 * nothing is redrawn. The entrance (~1.9 s) plays from t=0 every time this component mounts,
 * i.e. on every full page load. The overlay leaves once the entrance finished AND `ready`.
 *
 * Props: ready, onExited, onImageError (fall back to the SVG loader if the artwork is missing).
 */
const ENTRANCE_MS = 1900;
const REDUCED_MS = 450;
// Minimum time the finished logo stays on screen before the overlay may leave (after the entrance).
const HOLD_MS = 1500;
const EXIT_MS = 450;
const PRELOAD_TIMEOUT_MS = 4000;
const CRITICAL = ["planet", "word", "boy", "girl"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const boxStyle = (L) => ({ left: `${L.x}%`, top: `${L.y}%`, width: `${L.w}%`, height: `${L.h}%` });
// planet centre expressed inside a layer's own box (for transform-origin / masks)
const pivot = (L) => ({
  "--px": `${((PLANET_CENTER.x - L.x) / L.w) * 100}%`,
  "--py": `${((PLANET_CENTER.y - L.y) / L.h) * 100}%`,
});

function Layer({ id, className = "", style, children }) {
  const L = LAYERS[id];
  return (
    <div className={`svlg-layer ${className}`} style={{ ...boxStyle(L), ...style }} data-layer={id}>
      <div className="svlg-in">
        <img src={layerUrl(L)} alt="" draggable="false" decoding="async" />
      </div>
      {children}
    </div>
  );
}

export default function SkillverseLogoLoader({ ready, onExited, onImageError }) {
  const [reduced] = useState(prefersReducedMotion);
  const [armed, setArmed] = useState(false);          // artwork decoded -> entrance starts
  const [settled, setSettled] = useState(false);      // entrance finished -> idle animations
  const [held, setHeld] = useState(false);            // minimum display time reached
  const [exiting, setExiting] = useState(false);
  const cb = useRef({ onExited, onImageError });
  cb.current = { onExited, onImageError };

  // Preload + decode every layer first, so the entrance never stutters or shifts.
  useEffect(() => {
    let alive = true;
    let timer, holdTimer;
    const start = () => {
      if (!alive) return;
      setArmed(true);
      timer = setTimeout(() => alive && setSettled(true), reduced ? REDUCED_MS : ENTRANCE_MS);
      holdTimer = setTimeout(() => alive && setHeld(true), (reduced ? REDUCED_MS : ENTRANCE_MS) + HOLD_MS);
    };
    const loadOne = (url) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve(true)) : resolve(true));
      img.onerror = () => resolve(false);
      img.src = url;
    });
    const results = Promise.all(ALL_URLS.map(loadOne)).then((oks) => ({ oks }));
    const timeout = new Promise((r) => setTimeout(() => r({ timedOut: true }), PRELOAD_TIMEOUT_MS));
    Promise.race([results, timeout]).then((res) => {
      if (!alive) return;
      if (res.oks) {
        const bad = CRITICAL.some((id) => !res.oks[ALL_URLS.indexOf(layerUrl(LAYERS[id]))]);
        if (bad) return cb.current.onImageError?.();
      }
      start(); // timed out -> still play, images stream in
    });
    return () => { alive = false; clearTimeout(timer); clearTimeout(holdTimer); };
  }, [reduced]);

  useEffect(() => {
    if (!(held && ready)) return;
    setExiting(true);
    const t = setTimeout(() => cb.current.onExited?.(), EXIT_MS);
    return () => clearTimeout(t);
  }, [held, ready]);

  const cls = ["svlg", armed && "svlg-armed", settled && "svlg-settled", exiting && "svlg-exit", reduced && "svlg-rm"]
    .filter(Boolean).join(" ");
  const word = LAYERS.word;

  return (
    <div className={cls} role="status" aria-live="polite" aria-label="Loading Skillverse">
      <div className="svlg-stage">
        <div className="svlg-float">
          {/* 1 · golden spark in the centre of the planet */}
          <i className="svlg-glow" style={{ left: `${PLANET_CENTER.x}%`, top: `${PLANET_CENTER.y}%` }} />
          <i className="svlg-spark" style={{ left: `${PLANET_CENTER.x}%`, top: `${PLANET_CENTER.y}%` }} />

          {/* 2 · planet scales in */}
          <Layer id="planet" className="svlg-planet"
                 style={{ "--px": `${((PLANET_CENTER.x - LAYERS.planet.x) / LAYERS.planet.w) * 100}%`,
                          "--py": `${((PLANET_CENTER.y - LAYERS.planet.y) / LAYERS.planet.h) * 100}%` }} />

          {/* 3 · golden rings sweep round it (+ idle travelling highlight) */}
          <Layer id="rings" className="svlg-rings" style={pivot(LAYERS.rings)} />
          <Layer id="rings" className="svlg-shine" style={pivot(LAYERS.rings)} />

          {/* 4 · skill icons fly in on curved paths */}
          {["iconChef", "iconPalette", "iconTools", "iconCode"].map((id, i) => (
            <Layer key={id} id={id} className="svlg-icon"
                   style={{ "--fx": `${ICON_FROM[id][0]}cqw`, "--fy": `${ICON_FROM[id][1]}cqw`,
                            "--rot": `${i % 2 ? 14 : -14}deg`,
                            "--d": `${0.5 + i * 0.07}s`, "--bd": `${i * -0.9}s` }} />
          ))}

          {/* 5 · characters rise and settle, then breathe */}
          <Layer id="boy"  className="svlg-char" style={{ "--d": "0.78s", "--bd": "0s" }} />
          <Layer id="girl" className="svlg-char" style={{ "--d": "0.88s", "--bd": "-1.1s" }} />

          {/* 6 · stars pop with tiny sparkles */}
          {["star0", "star1", "star2", "star3", "star4"].map((id, i) => (
            <Layer key={id} id={id} className="svlg-star"
                   style={{ "--d": `${1.02 + i * 0.07}s`, "--bd": `${i * -0.95}s` }}>
              <b className="svlg-tiny" />
            </Layer>
          ))}

          {/* 7 · wordmark: ten letter slices, quick staggered entrance */}
          {WORD_SLICES.map(([a, b], i) => (
            <Layer key={i} id="word" className="svlg-wslice"
                   style={{ clipPath: `inset(0 ${(100 - b - 0.18).toFixed(2)}% 0 ${Math.max(0, a - 0.18).toFixed(2)}%)`,
                            "--ox": `${((a + b) / 2).toFixed(1)}%`, "--d": `${0.94 + i * 0.03}s` }} />
          ))}

          {/* 8 · controller: one soft bounce */}
          <Layer id="pad" className="svlg-pad" />

          {/* 9 · final golden sparkle */}
          <i className="svlg-final" style={{ left: `${word.x + word.w * 0.93}%`, top: `${word.y + word.h * 0.1}%` }} />
        </div>
      </div>
      <span className="svlg-sr">Loading Skillverse…</span>
    </div>
  );
}
