import { useCallback, useEffect, useState } from "react";
import SkillverseLogoLoader from "./SkillverseLogoLoader";
import SkillverseLoaderFallback from "./SkillverseLoaderFallback";

/**
 * Root-level gate, mounted in main.jsx ABOVE <App/>.
 *
 * - Shows on EVERY full page load (any URL) and replays on every reload: its state lives only in
 *   React memory — no localStorage / sessionStorage / cookies / flags.
 * - The app renders underneath straight away (real startup work proceeds) behind an opaque,
 *   full-viewport overlay, so nothing flashes through.
 * - The overlay leaves once the entrance has finished AND startup is ready (fonts + window load).
 *   MAX_WAIT_MS is only a safety valve; a healthy load never waits for it.
 * - Strict-Mode safe: effects are idempotent and fully cleaned up, so no duplicate timers/animations.
 */
const MAX_WAIT_MS = 8000;

export default function LoaderGate({ children }) {
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [run, setRun] = useState(0); // bump to replay (bfcache restore)

  // The static boot cover from index.html hands over to the real overlay (same background).
  useEffect(() => { document.getElementById("svlg-boot")?.remove(); }, []);

  useEffect(() => {
    let alive = true;
    const done = () => alive && setReady(true);
    const waits = [
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true })),
    ];
    Promise.all(waits).then(done, done);
    const safety = setTimeout(done, MAX_WAIT_MS);
    return () => { alive = false; clearTimeout(safety); };
  }, []);

  // Back/forward cache restores skip a real reload – replay the intro there too.
  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return;
      setReady(true); // app is already running
      setGone(false);
      setRun((n) => n + 1);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const handleExited = useCallback(() => setGone(true), []);
  const onImageError = useCallback(() => setUseFallback(true), []);

  return (
    <>
      {children}
      {!gone && (useFallback
        ? <SkillverseLoaderFallback key={run} ready={ready} onExited={handleExited} />
        : <SkillverseLogoLoader key={run} ready={ready} onExited={handleExited} onImageError={onImageError} />)}
    </>
  );
}
