import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { SciPage, Confetti } from "./SciUI";

const CELEBRATE = /[🎉🏆🏅✅]/u;

/**
 * Layout route that gives the existing lesson / mission screens the Science look:
 * themed ambient background (sv-page) plus the `.sv-skin` rules in science.css, which
 * restyle the screens' Tailwind markup (cards, CTA buttons, progress dots, error shakes).
 * It also fires a confetti burst whenever a celebration screen (🎉 / 🏆 / 🏅) appears.
 * No lesson logic is touched.
 */
export default function SciSkin({ theme = "science", particles = [] }) {
  const ref = useRef(null);
  const [burst, setBurst] = useState(0);
  const seen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => {
      const hit = [...el.querySelectorAll(".text-7xl, .text-6xl, .text-8xl")].some((n) => CELEBRATE.test(n.textContent || ""));
      if (hit && !seen.current) { seen.current = true; setBurst((b) => b + 1); }
      if (!hit) seen.current = false;
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);

  return (
    <SciPage theme={theme} particles={particles} className="sv-skin">
      <div className="sv-skin__inner" ref={ref}>
        <Outlet />
      </div>
      {burst > 0 && <Confetti key={burst} />}
    </SciPage>
  );
}
