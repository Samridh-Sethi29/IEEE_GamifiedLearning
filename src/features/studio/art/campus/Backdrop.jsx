import { PAL } from "../palette.js";
import { scatterForest } from "../../data/campusLayout.js";
import { Banner, Blossom, Bush, Lamp, Pine, S1, Steps, Tree } from "./parts.jsx";

const Plant = ({ k, ...p }) => (k === "pine" ? <Pine {...p} /> : k === "blossom" ? <Blossom {...p} /> : k === "bush" ? <Bush {...p} /> : <Tree {...p} />);

/** Everything behind the zones: ground, rivers, dirt routes, forest. */
export function Backdrop({ layout }) {
  const { w, h } = layout;
  const forest = scatterForest(layout, layout.key === "wide" ? 110 : 80);
  return (
    <g>
      <defs>
        <linearGradient id="cc-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.groundLight} /><stop offset="0.55" stopColor={PAL.ground} /><stop offset="1" stopColor={PAL.groundDark} />
        </linearGradient>
        <linearGradient id="cc-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.water} /><stop offset="1" stopColor={PAL.waterDeep} /></linearGradient>
        <pattern id="cc-grass" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 8 14 l 3 -7 l 3 7 M 40 40 l 3 -7 l 3 7 M 26 52 l 2 -5 l 2 5" stroke={PAL.groundDetail} strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#cc-ground)" />
      <rect width={w} height={h} fill="url(#cc-grass)" />
      {/* sandy clearings where the zones sit (the village's sand-rim treatment) */}
      {Object.values(layout.zones).map((z, i) => (
        <g key={i}>
          <rect x={z.x - 30} y={z.y + 2} width="540" height="372" rx="64" fill={PAL.sand} />
          <rect x={z.x - 24} y={z.y + 8} width="528" height="360" rx="58" fill={PAL.groundPale} />
        </g>
      ))}
      {/* rivers + waterfall */}
      {layout.waterfall && (
        <g>
          <rect x={layout.waterfall.x - 78} y="30" width="156" height="150" rx="14" fill={PAL.slateLight} {...S1} />
          <rect x={layout.waterfall.x - 30} y="30" width="60" height="170" fill="url(#cc-water)" />
          {[-18, 0, 18].map((o) => <path key={o} d={`M ${layout.waterfall.x + o} 36 V 196`} stroke={PAL.waterFoam} strokeWidth="3" strokeDasharray="14 22" opacity=".8" className="studio-flow" />)}
          <ellipse cx={layout.waterfall.x} cy="206" rx="96" ry="26" fill={PAL.water} stroke={PAL.waterDeep} strokeWidth="3" />
        </g>
      )}
      {layout.rivers.map((d) => (
        <g key={d}>
          <path d={d} stroke={PAL.sand} strokeWidth="56" fill="none" strokeLinecap="round" />
          <path d={d} stroke={PAL.waterDeep} strokeWidth="44" fill="none" strokeLinecap="round" />
          <path d={d} stroke={PAL.water} strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d={d} stroke={PAL.waterFoam} strokeOpacity=".8" strokeWidth="4" fill="none" strokeDasharray="10 26" className="studio-flow" />
        </g>
      ))}
      <ellipse cx={layout.pond.cx} cy={layout.pond.cy} rx={layout.pond.rx + 16} ry={layout.pond.ry + 12} fill={PAL.sand} />
      <ellipse cx={layout.pond.cx} cy={layout.pond.cy} rx={layout.pond.rx + 7} ry={layout.pond.ry + 5} fill={PAL.waterDeep} />
      <ellipse cx={layout.pond.cx} cy={layout.pond.cy} rx={layout.pond.rx} ry={layout.pond.ry} fill="url(#cc-water)" />
      {[[-110, -8], [90, 12], [-30, 26], [130, -16]].map(([dx, dy], i) => <ellipse key={i} cx={layout.pond.cx + dx * (layout.pond.rx / 190)} cy={layout.pond.cy + dy} rx="13" ry="5" fill={PAL.groundDark} {...S1} />)}
      {/* background forest */}
      {forest.map((t, i) => <Plant key={i} k={t.k} x={t.x} y={t.y} s={t.s} />)}
      {/* dirt routes between the zones (same two-tone path as the village map) */}
      {layout.paths.map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke={PAL.pathShadow} strokeOpacity=".35" strokeWidth="44" transform="translate(0 4)" />
          <path d={d} stroke={PAL.pathEdge} strokeWidth="40" />
          <path d={d} stroke={PAL.path} strokeWidth="26" />
          <path d={d} stroke={PAL.surface} strokeWidth="3" strokeDasharray="6 14" opacity=".8" />
        </g>
      ))}
      {layout.bridges.map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <rect x="-34" y="-30" width="68" height="60" rx="5" fill={PAL.woodLight} {...S1} />
          {[-24, -12, 0, 12, 24].map((o) => <path key={o} d={`M -34 ${o} H 34`} stroke={PAL.ink} strokeWidth="2" />)}
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

/** Light border drawn last (cream band + thin brown line); never intercepts the pointer. */
export function Frame({ w, h }) {
  return (
    <g pointerEvents="none">
      <rect x="5" y="5" width={w - 10} height={h - 10} rx="10" fill="none" stroke={PAL.surface} strokeWidth="10" />
      <rect x="10.5" y="10.5" width={w - 21} height={h - 21} rx="6" fill="none" stroke={PAL.line} strokeWidth="2.5" />
    </g>
  );
}
