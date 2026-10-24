import { Fragment, useEffect, useRef, useState } from "react";
import { ASSET_DIR, LAYERS, ORBIT } from "./skillverse-logo-config";
import "./skillverse-logo-loader.css";

/**
 * Skillverse loader built from layers cut out of the ORIGINAL artwork (nothing redrawn).
 * Props: ready, onExited, onImageError (falls back to the old SVG loader if assets fail).
 * Entrance (~1.8s) always plays on mount; the loader exits once entrance AND `ready` are both done.
 */
const ENTRANCE_MS = 1850;
const EXIT_MS = 420;
const debug = typeof window !== "undefined" && /[?&]loaderDebug\b/.test(window.location.search);
const files = [...new Set(LAYERS.map((l) => ASSET_DIR + l.id + ".webp"))];

function preload() {
  return Promise.all(
    files.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
          img.decode?.().then(resolve, () => {}); // decode early when supported
        })
    )
  );
}

export default function SkillverseLogoLoader({ ready, onExited, onImageError }) {
  const [loaded, setLoaded] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cb = useRef({ onExited, onImageError });
  cb.current = { onExited, onImageError };

  useEffect(() => {
    let alive = true;
    let timer;
    preload().then(
      () => {
        if (!alive) return;
        setLoaded(true); // entrance clock starts only when pixels are ready
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        timer = setTimeout(() => alive && setEntranceDone(true), reduced ? 350 : ENTRANCE_MS);
      },
      () => alive && cb.current.onImageError?.()
    );
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!(entranceDone && ready)) return;
    setExiting(true);
    const t = setTimeout(() => cb.current.onExited?.(), EXIT_MS);
    return () => clearTimeout(t);
  }, [entranceDone, ready]);

  return (
    <div className={`svlg ${exiting ? "svlg-exit" : ""} ${debug ? "svlg-debug" : ""}`}
         role="status" aria-live="polite" aria-label="Loading Skillverse">
      {loaded && (
        <div className="svlg-stage">
          <div className="svlg-glow" />
          <div className="svlg-float">
            {LAYERS.map((L, i) => (
              <Fragment key={L.id}>
                <div className={`svlg-layer svlg-${L.kind}`}
                     style={{
                       left: `${L.box[0]}%`, top: `${L.box[1]}%`, width: `${L.box[2]}%`, height: `${L.box[3]}%`,
                       "--at": `${L.at}s`, "--fx": `${L.from?.[0] ?? 0}%`, "--fy": `${L.from?.[1] ?? 0}%`,
                       "--i": i, "--ci": i,
                     }}>
                  <div className="svlg-inner">
                    <img src={ASSET_DIR + L.id + ".webp"} alt="" draggable="false" />
                  </div>
                </div>
                {i === 0 && (
                  <i className="svlg-orbit" style={{
                    left: `${ORBIT.cx}%`, top: `${ORBIT.cy}%`,
                    "--rx": `${ORBIT.rx}cqw`, "--ry": `${ORBIT.ry}cqw`, "--rot": `${ORBIT.rot}deg`,
                  }}><b /></i>
                )}
              </Fragment>
            ))}
            <i className="svlg-final" />
          </div>
          <div className="svlg-spark" />
        </div>
      )}
      <span className="svlg-sr">Loading Skillverse…</span>
    </div>
  );
}
