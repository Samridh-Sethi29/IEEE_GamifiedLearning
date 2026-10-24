import { useCallback, useEffect, useState } from "react";
import SkillverseLogoLoader from "./SkillverseLogoLoader";
import SkillverseLoaderFallback from "./SkillverseLoaderFallback";

/**
 * Root-level gate. Mounted in main.jsx ABOVE <App/>, so it shows on every full page load
 * (any URL), and resets on every reload because its state lives only in React memory —
 * no localStorage / sessionStorage / cookies.
 *
 * The app renders underneath immediately (real startup work proceeds), hidden behind
 * an opaque full-viewport overlay. The overlay leaves once the entrance finished AND
 * startup is ready (fonts + window load + app mounted).
 */
const MAX_WAIT_MS = 6000; // safety valve only — never delays a healthy load

export default function LoaderGate({ children }) {
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Remove the static pre-React boot screen (index.html) once the real loader has mounted.
  useEffect(() => { document.getElementById("sv-boot")?.remove(); }, []);

  useEffect(() => {
    let alive = true;
    const done = () => alive && setReady(true);
    const waits = [
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true })),
    ];
    // Strict-Mode safe: effect cleanup cancels; second mount just redoes the same idempotent wait.
    Promise.all(waits).then(done, done);
    const safety = setTimeout(done, MAX_WAIT_MS);
    return () => { alive = false; clearTimeout(safety); };
  }, []);

  const handleExited = useCallback(() => setGone(true), []);
  const onImageError = useCallback(() => setUseFallback(true), []);

  return (
    <>
      {children}
      {!gone && (useFallback
        ? <SkillverseLoaderFallback ready={ready} onExited={handleExited} />
        : <SkillverseLogoLoader ready={ready} onExited={handleExited} onImageError={onImageError} />)}
    </>
  );
}
