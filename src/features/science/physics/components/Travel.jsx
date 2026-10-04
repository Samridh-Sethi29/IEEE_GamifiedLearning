import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * Moves its child forward (left -> right) across its parent lane.
 * The distance is measured in pixels from the parent's inner width, because a percentage
 * `x` in motion is relative to the element itself (a 60px emoji would barely move).
 *
 * props: active, fraction (0-1 of the lane, default 1), keyframes + times (for acceleration),
 *        loop (repeat forever, e.g. a pedalling bicycle), duration, ease, className
 */
export default function Travel({ active, fraction = 1, keyframes, times, loop = false, duration = 2, ease = "linear", className, children }) {
  const ref = useRef(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const parent = el && el.parentElement;
    if (!parent) return undefined;
    const measure = () => {
      const cs = getComputedStyle(parent);
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      setDist(Math.max(0, parent.clientWidth - pad - el.offsetWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  let target = 0;
  let transition = { duration: 0.5, ease: "easeOut" }; // quick slide back on reset
  if (active) {
    if (loop) {
      target = [0, dist];
      transition = { duration, ease, repeat: Infinity, repeatType: "loop" };
    } else if (keyframes) {
      target = keyframes.map((k) => k * dist);
      transition = { duration, ease, times };
    } else {
      target = dist * fraction;
      transition = { duration, ease };
    }
  }

  // The mirror (scale-x-[-1]) must NOT sit on the element that is translated: the CSS `scale`
  // property is applied before `transform`, so it would flip the direction of travel (objects
  // would slide backwards). Mirror an inner wrapper instead so the object faces forward.
  const flip = /scale-x-\[-1\]/.test(className || "");
  const outer = (className || "").replace(/scale-x-\[-1\]/g, "").trim();

  return (
    <motion.div ref={ref} animate={{ x: target }} transition={transition} className={outer}>
      <span style={{ display: "inline-block", transform: flip ? "scaleX(-1)" : undefined }}>{children}</span>
    </motion.div>
  );
}
