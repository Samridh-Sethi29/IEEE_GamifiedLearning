// Small reusable SVG building blocks for the Creative Campus. Everything is drawn in plain
// SVG shapes (no images), in the local pixel space of whichever zone uses it.
// All colours come from ../palette.js (the village-derived Studio palette).

import { PAL } from "../palette.js";

export const INK = PAL.ink;
export const S = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" };
export const S1 = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round", strokeLinecap: "round" };

/** A raised slab with a visible front face, so zones read as different elevations. */
export function Platform({ x = 0, y = 0, w, h, depth = 22, top, side, r = 18 }) {
  return (
    <g>
      <rect x={x + 5} y={y + depth + 8} width={w} height={h} rx={r} fill={PAL.shadow} />
      <rect x={x} y={y + depth} width={w} height={h} rx={r} fill={side} {...S} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={top} {...S} />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx={Math.max(r - 5, 2)} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
    </g>
  );
}

export function Tree({ x, y, s = 1, c = PAL.leaf, c2 = PAL.groundDark }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="3" rx="17" ry="6" fill={PAL.shadow} />
      <rect x="-3.5" y="-14" width="7" height="16" fill={PAL.wood} {...S1} />
      <circle cy="-28" r="18" fill={c} {...S1} />
      <circle cx="-6" cy="-33" r="9" fill={c2} />
    </g>
  );
}

export function Pine({ x, y, s = 1, c = PAL.leaf }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="3" rx="15" ry="5" fill={PAL.shadow} />
      <rect x="-3" y="-10" width="6" height="12" fill={PAL.ink} />
      <polygon points="0,-58 -16,-28 16,-28" fill={c} {...S1} />
      <polygon points="0,-44 -20,-12 20,-12" fill={c} {...S1} />
      <polygon points="0,-48 -9,-32 9,-32" fill="rgba(255,255,255,.14)" />
    </g>
  );
}

export function Blossom({ x, y, s = 1 }) {
  return <Tree x={x} y={y} s={s} c={PAL.pinkSoft} c2={PAL.pinkPale} />;
}

export function Bush({ x, y, s = 1, c = PAL.leafMid }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="2" rx="16" ry="5" fill={PAL.shadow} />
      <circle cx="-8" cy="-6" r="9" fill={c} {...S1} />
      <circle cx="7" cy="-7" r="10" fill={c} {...S1} />
      <circle cx="-1" cy="-12" r="8" fill={PAL.leafLight} />
    </g>
  );
}

export function Lamp({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy="-52" r="26" fill={PAL.sun} opacity=".28" className="studio-glow" />
      <rect x="-2.5" y="-48" width="5" height="50" fill={PAL.ink} />
      <rect x="-7" y="-60" width="14" height="14" rx="3" fill={PAL.sun} {...S1} className="studio-glow" />
      <rect x="-9" y="-63" width="18" height="4" rx="1.5" fill={PAL.ink} />
    </g>
  );
}

export function Kid({ x, y, shirt = "#3b82f6", hair = PAL.signText, s = 1, bob = false, skin = PAL.skin }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="2" rx="9" ry="3.5" fill={PAL.shadow} />
      <g className={bob ? "studio-bob" : undefined}>
        <rect x="-5" y="-12" width="4" height="12" fill={PAL.slateDark} />
        <rect x="1" y="-12" width="4" height="12" fill={PAL.slateDark} />
        <rect x="-7" y="-27" width="14" height="17" rx="5" fill={shirt} {...S1} />
        <circle cy="-35" r="8" fill={skin} {...S1} />
        <path d="M -8 -37 Q 0 -48 8 -37 Q 4 -41 -8 -37 Z" fill={hair} />
      </g>
    </g>
  );
}

export function Banner({ x, y, c = PAL.violet, mark = "bulb", s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.5" y="-70" width="3" height="72" fill={PAL.ink} />
      <circle cy="-72" r="4" fill={PAL.gold} />
      <g className="studio-sway">
        <path d="M -16 -66 H 16 V -22 L 0 -12 L -16 -22 Z" fill={c} {...S1} />
        {mark === "bulb" && <circle cy="-48" r="6" fill={PAL.sunSoft} />}
        {mark === "gear" && <circle cy="-48" r="6" fill="none" stroke={PAL.sunSoft} strokeWidth="3" strokeDasharray="3 2" />}
        {mark === "book" && <path d="M -7 -52 H 0 V -42 H -7 Z M 0 -52 H 7 V -42 H 0 Z" fill={PAL.sunSoft} />}
      </g>
    </g>
  );
}

export function Crate({ x: x0, y: y0, w: w0 = 28, h: h0 = 24, c = PAL.woodLight }) {
  // props arrive as strings from the zone art; coerce so `x + w` adds instead of concatenating.
  const x = Number(x0);
  const y = Number(y0);
  const w = Number(w0);
  const h = Number(h0);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={c} {...S1} />
      <path d={`M ${x} ${y} L ${x + w} ${y + h} M ${x + w} ${y} L ${x} ${y + h}`} stroke={PAL.inkSoft} strokeWidth="2" />
    </g>
  );
}

export function gearPath(teeth, outer, inner) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    [-0.28, -0.14, 0.14, 0.28].forEach((o, j) => {
      const r = j === 1 || j === 2 ? outer : inner;
      const a = i * step + o * step * 2;
      pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`);
    });
  }
  return `M ${pts.join(" L ")} Z`;
}

export function Gear({ x, y, r = 24, teeth = 10, c = PAL.orange, spin = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={spin ? "studio-spin" : undefined}>
        <path d={gearPath(teeth, r, r * 0.78)} fill={c} {...S1} />
        <circle r={r * 0.3} fill={PAL.surface} {...S1} />
      </g>
    </g>
  );
}

export function Steps({ x, y, w, n = 5, h = 9, c = PAL.plaza }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 6} y={y + i * h} width={w - i * 12} height={h} fill={i % 2 ? c : PAL.cream} {...S1} />
      ))}
    </g>
  );
}

/** Zone name plate: a village signboard (cream board, brown outline) with a coloured icon badge. */
export function Plate({ x, y, w = 300, h = 58, label, icon, accent, deep }) {
  return (
    <g transform={`translate(${x} ${y})`} className="studio-plate">
      <rect x="3" y="5" width={w} height={h} rx="10" fill={PAL.shadow} />
      <rect width={w} height={h} rx="10" fill={PAL.surface2} {...S} />
      <rect x="6" y="6" width={w - 12} height={h - 12} rx="6" fill="none" stroke={PAL.line} strokeWidth="1.5" strokeDasharray="2 5" />
      <circle cx="33" cy={h / 2} r="21" fill={deep ?? accent} {...S1} />
      <g transform={`translate(33 ${h / 2})`}>{icon}</g>
      <text className="studio-plate-text" x={64} y={h / 2 + 9} fill={PAL.signText}>{label}</text>
    </g>
  );
}

export const Icons = {
  hammer: <g fill={PAL.surface}><rect x="-3" y="-4" width="6" height="22" transform="rotate(35 0 0) translate(0 -6)" /><rect x="-12" y="-14" width="22" height="9" rx="2" transform="rotate(35 0 0)" /></g>,
  gear: <path d={gearPath(8, 14, 10.5)} fill={PAL.surface} />,
  book: <path d="M -16 -11 Q -7 -15 0 -9 Q 7 -15 16 -11 V 11 Q 7 7 0 13 Q -7 7 -16 11 Z" fill={PAL.surface} />,
  palette: <g fill={PAL.surface}><path d="M 0 -14 C 15 -14 17 0 11 6 C 7 10 14 15 5 15 C -15 15 -17 -14 0 -14 Z" /><circle cx="-5" cy="-5" r="2.6" fill="#ef4444" /><circle cx="4" cy="-7" r="2.6" fill="#3b82f6" /><circle cx="-8" cy="4" r="2.6" fill="#22c55e" /></g>,
};
