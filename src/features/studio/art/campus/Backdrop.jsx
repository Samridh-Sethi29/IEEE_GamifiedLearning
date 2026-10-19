import { scatterForest } from "../../data/campusLayout.js";
import { Banner, Blossom, Bush, Lamp, Pine, S1, Steps, Tree } from "./parts.jsx";

const Plant = ({ k, ...p }) => (k === "pine" ? <Pine {...p} /> : k === "blossom" ? <Blossom {...p} /> : k === "bush" ? <Bush {...p} /> : <Tree {...p} />);

/** Everything behind the zones: ground, rivers, glowing routes, forest. */
export function Backdrop({ layout }) {
  const { w, h } = layout;
  const forest = scatterForest(layout, layout.key === "wide" ? 110 : 80);
  return (
    <g>
      <defs>
        <linearGradient id="cc-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e4d33" /><stop offset="0.5" stopColor="#2b6a3b" /><stop offset="1" stopColor="#1b4a30" />
        </linearGradient>
        <linearGradient id="cc-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fd6ff" /><stop offset="1" stopColor="#2f8fd6" /></linearGradient>
        <filter id="cc-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
        <pattern id="cc-grass" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 8 14 l 3 -7 l 3 7 M 40 40 l 3 -7 l 3 7 M 26 52 l 2 -5 l 2 5" stroke="rgba(160,230,140,.22)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#cc-ground)" />
      <rect width={w} height={h} fill="url(#cc-grass)" />
      {/* lighter clearings where the zones sit */}
      {Object.values(layout.zones).map((z, i) => <rect key={i} x={z.x - 24} y={z.y + 4} width="528" height="360" rx="60" fill="#3d8a48" opacity=".55" />)}
      {/* rivers + waterfall */}
      {layout.waterfall && (
        <g>
          <rect x={layout.waterfall.x - 78} y="30" width="156" height="150" rx="14" fill="#5d6470" {...S1} />
          <rect x={layout.waterfall.x - 30} y="30" width="60" height="170" fill="url(#cc-water)" />
          {[-18, 0, 18].map((o) => <path key={o} d={`M ${layout.waterfall.x + o} 36 V 196`} stroke="#fff" strokeWidth="3" strokeDasharray="14 22" opacity=".8" className="studio-flow" />)}
          <ellipse cx={layout.waterfall.x} cy="206" rx="96" ry="26" fill="#2f8fd6" {...S1} />
        </g>
      )}
      {layout.rivers.map((d) => (
        <g key={d}>
          <path d={d} stroke="#1d5f8f" strokeWidth="46" fill="none" strokeLinecap="round" />
          <path d={d} stroke="#3aa0e6" strokeWidth="36" fill="none" strokeLinecap="round" />
          <path d={d} stroke="#bfeaff" strokeWidth="4" fill="none" strokeDasharray="10 26" className="studio-flow" />
        </g>
      ))}
      <ellipse cx={layout.pond.cx} cy={layout.pond.cy} rx={layout.pond.rx + 10} ry={layout.pond.ry + 8} fill="#1d5f8f" />
      <ellipse cx={layout.pond.cx} cy={layout.pond.cy} rx={layout.pond.rx} ry={layout.pond.ry} fill="url(#cc-water)" {...S1} />
      {[[-110, -8], [90, 12], [-30, 26], [130, -16]].map(([dx, dy], i) => <ellipse key={i} cx={layout.pond.cx + dx * (layout.pond.rx / 190)} cy={layout.pond.cy + dy} rx="13" ry="5" fill="#59c26b" {...S1} />)}
      {/* background forest */}
      {forest.map((t, i) => <Plant key={i} k={t.k} x={t.x} y={t.y} s={t.s} />)}
      {/* glowing routes */}
      {layout.goldPaths.map((d) => <path key={`g${d}`} d={d} stroke="#ffd35a" strokeWidth="46" fill="none" strokeLinecap="round" opacity=".4" filter="url(#cc-blur)" className="studio-glow" />)}
      {layout.goldPaths.map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke="#6b4a1f" strokeWidth="36" />
          <path d={d} stroke="#f2b84b" strokeWidth="28" />
          <path d={d} stroke="#ffe08a" strokeWidth="18" />
          <path d={d} stroke="#fff3c4" strokeWidth="3" strokeDasharray="6 14" opacity=".9" />
        </g>
      ))}
      {layout.bridges.map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <rect x="-34" y="-30" width="68" height="60" rx="5" fill="#9a6a35" {...S1} />
          {[-24, -12, 0, 12, 24].map((o) => <path key={o} d={`M -34 ${o} H 34`} stroke="#6b4421" strokeWidth="2" />)}
        </g>
      ))}
      {/* entrance stairs + gate */}
      <Steps x={layout.stairs.x} y={layout.stairs.y} w={layout.stairs.w} n={7} h={16} />
      {layout.banners.map(([x, y, c]) => <Banner key={x} x={x} y={y} c={c} mark="bulb" s="1.1" />)}
      <Lamp x={layout.stairs.x - 20} y={layout.stairs.y + 40} s="1" /><Lamp x={layout.stairs.x + layout.stairs.w + 20} y={layout.stairs.y + 40} s="1" />
    </g>
  );
}

export function Foreground({ layout }) {
  return <g>{layout.foreground.map(([x, y, s], i) => (i % 2 ? <Pine key={i} x={x} y={y} s={s} /> : <Tree key={i} x={x} y={y} s={s} />))}</g>;
}

/** Ornate border drawn last; never intercepts the pointer. */
export function Frame({ w, h }) {
  const corner = (rot, x, y) => (
    <g key={rot} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M 0 0 H 70 Q 30 8 22 22 Q 8 30 0 70 Z" fill="#e0a82e" stroke="#4a2f0c" strokeWidth="3" />
      <path d="M 10 10 H 46 Q 24 16 16 30 Q 12 38 10 46 Z" fill="#ffd45e" />
      <circle cx="14" cy="14" r="7" fill="#ffeaa0" stroke="#4a2f0c" strokeWidth="2" />
    </g>
  );
  return (
    <g pointerEvents="none">
      <rect x="6" y="6" width={w - 12} height={h - 12} fill="none" stroke="#150d2e" strokeWidth="12" />
      <rect x="13" y="13" width={w - 26} height={h - 26} fill="none" stroke="#d99a2b" strokeWidth="5" />
      <rect x="20" y="20" width={w - 40} height={h - 40} fill="none" stroke="#7a4d12" strokeWidth="2.5" />
      {corner(0, 2, 2)}{corner(90, w - 2, 2)}{corner(180, w - 2, h - 2)}{corner(270, 2, h - 2)}
    </g>
  );
}
