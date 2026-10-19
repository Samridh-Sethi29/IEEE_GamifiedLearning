// Small reusable SVG building blocks for the Creative Campus. Everything is drawn in plain
// SVG shapes (no images), in the local pixel space of whichever zone uses it.

export const INK = "#2a1a0e";
export const S = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" };
export const S1 = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round", strokeLinecap: "round" };

/** A raised slab with a visible front face, so zones read as different elevations. */
export function Platform({ x = 0, y = 0, w, h, depth = 22, top, side, r = 18 }) {
  return (
    <g>
      <rect x={x + 5} y={y + depth + 8} width={w} height={h} rx={r} fill="rgba(0,0,0,.3)" />
      <rect x={x} y={y + depth} width={w} height={h} rx={r} fill={side} {...S} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={top} {...S} />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx={Math.max(r - 5, 2)} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
    </g>
  );
}

export function Tree({ x, y, s = 1, c = "#2f9e44", c2 = "#51cf66" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="3" rx="17" ry="6" fill="rgba(0,0,0,.28)" />
      <rect x="-3.5" y="-14" width="7" height="16" fill="#7c4a21" {...S1} />
      <circle cy="-28" r="18" fill={c} {...S1} />
      <circle cx="-6" cy="-33" r="9" fill={c2} />
    </g>
  );
}

export function Pine({ x, y, s = 1, c = "#1f7a3d" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="3" rx="15" ry="5" fill="rgba(0,0,0,.28)" />
      <rect x="-3" y="-10" width="6" height="12" fill="#6b3f1d" />
      <polygon points="0,-58 -16,-28 16,-28" fill={c} {...S1} />
      <polygon points="0,-44 -20,-12 20,-12" fill={c} {...S1} />
      <polygon points="0,-48 -9,-32 9,-32" fill="rgba(255,255,255,.14)" />
    </g>
  );
}

export function Blossom({ x, y, s = 1 }) {
  return <Tree x={x} y={y} s={s} c="#f48fb1" c2="#f8bbd0" />;
}

export function Bush({ x, y, s = 1, c = "#3aa655" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="2" rx="16" ry="5" fill="rgba(0,0,0,.25)" />
      <circle cx="-8" cy="-6" r="9" fill={c} {...S1} />
      <circle cx="7" cy="-7" r="10" fill={c} {...S1} />
      <circle cx="-1" cy="-12" r="8" fill="#66c97c" />
    </g>
  );
}

export function Lamp({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy="-52" r="26" fill="#ffd66b" opacity=".28" className="studio-glow" />
      <rect x="-2.5" y="-48" width="5" height="50" fill="#3b2a1a" />
      <rect x="-7" y="-60" width="14" height="14" rx="3" fill="#ffd66b" {...S1} className="studio-glow" />
      <rect x="-9" y="-63" width="18" height="4" rx="1.5" fill="#3b2a1a" />
    </g>
  );
}

export function Kid({ x, y, shirt = "#3b82f6", hair = "#4a2f17", s = 1, bob = false, skin = "#f5c9a0" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="2" rx="9" ry="3.5" fill="rgba(0,0,0,.3)" />
      <g className={bob ? "studio-bob" : undefined}>
        <rect x="-5" y="-12" width="4" height="12" fill="#2b3a67" />
        <rect x="1" y="-12" width="4" height="12" fill="#2b3a67" />
        <rect x="-7" y="-27" width="14" height="17" rx="5" fill={shirt} {...S1} />
        <circle cy="-35" r="8" fill={skin} {...S1} />
        <path d="M -8 -37 Q 0 -48 8 -37 Q 4 -41 -8 -37 Z" fill={hair} />
      </g>
    </g>
  );
}

export function Banner({ x, y, c = "#7c3aed", mark = "bulb", s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.5" y="-70" width="3" height="72" fill="#4a3320" />
      <circle cy="-72" r="4" fill="#e8b94a" />
      <g className="studio-sway">
        <path d="M -16 -66 H 16 V -22 L 0 -12 L -16 -22 Z" fill={c} {...S1} />
        {mark === "bulb" && <circle cy="-48" r="6" fill="#ffe27a" />}
        {mark === "gear" && <circle cy="-48" r="6" fill="none" stroke="#ffe27a" strokeWidth="3" strokeDasharray="3 2" />}
        {mark === "book" && <path d="M -7 -52 H 0 V -42 H -7 Z M 0 -52 H 7 V -42 H 0 Z" fill="#ffe27a" />}
      </g>
    </g>
  );
}

export function Crate({ x, y, w = 28, h = 24, c = "#c98b4a" }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={c} {...S1} />
      <path d={`M ${x} ${y} L ${x + w} ${y + h} M ${x + w} ${y} L ${x} ${y + h}`} stroke="rgba(60,30,10,.45)" strokeWidth="2" />
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

export function Gear({ x, y, r = 24, teeth = 10, c = "#c98a2b", spin = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={spin ? "studio-spin" : undefined}>
        <path d={gearPath(teeth, r, r * 0.78)} fill={c} {...S1} />
        <circle r={r * 0.3} fill="#f8fafc" {...S1} />
      </g>
    </g>
  );
}

export function Steps({ x, y, w, n = 5, h = 9, c = "#b9b2a0" }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 6} y={y + i * h} width={w - i * 12} height={h} fill={i % 2 ? c : "#cfc8b5"} {...S1} />
      ))}
    </g>
  );
}

/** Zone name plate: wooden sign with an icon and a legible title. */
export function Plate({ x, y, w = 300, h = 58, label, icon, accent }) {
  return (
    <g transform={`translate(${x} ${y})`} className="studio-plate">
      <rect x="4" y="6" width={w} height={h} rx="8" fill="rgba(0,0,0,.35)" />
      <rect width={w} height={h} rx="8" fill="#4a3320" {...S} />
      <rect x="5" y="5" width={w - 10} height={h - 10} rx="5" fill="#2c1f14" stroke={accent} strokeWidth="2.5" />
      <circle cx="18" cy="14" r="2.5" fill="#e8b94a" />
      <circle cx={w - 18} cy="14" r="2.5" fill="#e8b94a" />
      <g transform={`translate(34 ${h / 2})`}>{icon}</g>
      <text className="studio-plate-text" x={60} y={h / 2 + 10} fill="#fff8e7">{label}</text>
    </g>
  );
}

export const Icons = {
  hammer: <g fill="#f2e6c9"><rect x="-3" y="-4" width="6" height="22" transform="rotate(35 0 0) translate(0 -6)" /><rect x="-12" y="-14" width="22" height="9" rx="2" transform="rotate(35 0 0)" /></g>,
  gear: <path d={gearPath(8, 14, 10.5)} fill="#f2e6c9" />,
  book: <path d="M -16 -11 Q -7 -15 0 -9 Q 7 -15 16 -11 V 11 Q 7 7 0 13 Q -7 7 -16 11 Z" fill="#f2e6c9" />,
  palette: <g fill="#f2e6c9"><path d="M 0 -14 C 15 -14 17 0 11 6 C 7 10 14 15 5 15 C -15 15 -17 -14 0 -14 Z" /><circle cx="-5" cy="-5" r="2.6" fill="#ef4444" /><circle cx="4" cy="-7" r="2.6" fill="#3b82f6" /><circle cx="-8" cy="4" r="2.6" fill="#22c55e" /></g>,
};
