// SVG drawings for each object type. Each renderer draws centred on (0,0) inside a
// width x height box, so the same art is used by the canvas and the palette previews.
// Rendering is the only place React appears; the document itself stays plain data.

const STROKE = "#1e1b4b";
const sw = { stroke: STROKE, strokeWidth: 2, strokeLinejoin: "round" };

function gearPath(teeth, outer, inner) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const f = [-0.28, -0.14, 0.14, 0.28];
    const radii = [inner, outer, outer, inner];
    f.forEach((o, j) => pts.push([Math.cos(a + o * step * 2) * radii[j], Math.sin(a + o * step * 2) * radii[j]]));
  }
  return `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ")} Z`;
}

const ART = {
  rectangle: ({ width: w, height: h, props }) => (
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={props.fill} {...sw} />
  ),
  circle: ({ width: w, height: h, props }) => <ellipse rx={w / 2} ry={h / 2} fill={props.fill} {...sw} />,
  triangle: ({ width: w, height: h, props }) => (
    <polygon points={`0,${-h / 2} ${w / 2},${h / 2} ${-w / 2},${h / 2}`} fill={props.fill} {...sw} />
  ),
  tree: ({ width: w, height: h, props }) => (
    <g>
      <rect x={-w * 0.09} y={h * 0.12} width={w * 0.18} height={h * 0.38} fill="#92400e" {...sw} />
      <ellipse cx={0} cy={-h * 0.14} rx={w / 2} ry={h * 0.38} fill={props.foliage} {...sw} />
    </g>
  ),
  house: ({ width: w, height: h, props }) => (
    <g>
      <rect x={-w * 0.4} y={-h * 0.05} width={w * 0.8} height={h * 0.55} fill={props.wall} {...sw} />
      <polygon points={`${-w / 2},${-h * 0.05} 0,${-h / 2} ${w / 2},${-h * 0.05}`} fill={props.roof} {...sw} />
      <rect x={-w * 0.09} y={h * 0.18} width={w * 0.18} height={h * 0.32} fill="#78350f" {...sw} />
    </g>
  ),
  gear: ({ width: w, height: h, props }) => {
    const r = Math.min(w, h) / 2;
    return (
      <g transform={`scale(${w / (r * 2)} ${h / (r * 2)})`}>
        <path d={gearPath(props.teeth, r, r * 0.76)} fill={props.fill} {...sw} />
        <circle r={r * 0.28} fill="#f8fafc" {...sw} />
      </g>
    );
  },
  farm: ({ width: w, height: h, props }) => {
    const isDrip = props?.irrigation === "drip";
    return (
      <g>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#78350f" {...sw} />
        {isDrip ? (
          <g>
            <line x1={-w * 0.42} y1={-h * 0.14} x2={w * 0.42} y2={-h * 0.14} stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 3" />
            <line x1={-w * 0.42} y1={h * 0.14} x2={w * 0.42} y2={h * 0.14} stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 3" />
          </g>
        ) : (
          <g>
            <rect x={-w * 0.44} y={-h * 0.18} width={w * 0.88} height={h * 0.08} rx={2} fill="#60a5fa" stroke="#2563eb" strokeWidth={1} />
            <rect x={-w * 0.44} y={h * 0.1} width={w * 0.88} height={h * 0.08} rx={2} fill="#60a5fa" stroke="#2563eb" strokeWidth={1} />
          </g>
        )}
        <ellipse cx={-w * 0.28} cy={-h * 0.3} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
        <ellipse cx={0} cy={-h * 0.3} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
        <ellipse cx={w * 0.28} cy={-h * 0.3} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
        <ellipse cx={-w * 0.28} cy={-h * 0.02} rx={w * 0.12} ry={h * 0.1} fill="#16a34a" {...sw} />
        <ellipse cx={0} cy={-h * 0.02} rx={w * 0.12} ry={h * 0.1} fill="#16a34a" {...sw} />
        <ellipse cx={w * 0.28} cy={-h * 0.02} rx={w * 0.12} ry={h * 0.1} fill="#16a34a" {...sw} />
        <ellipse cx={-w * 0.28} cy={h * 0.26} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
        <ellipse cx={0} cy={h * 0.26} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
        <ellipse cx={w * 0.28} cy={h * 0.26} rx={w * 0.12} ry={h * 0.1} fill="#22c55e" {...sw} />
      </g>
    );
  },
  well: ({ width: w, height: h, props }) => (
    <g>
      <rect x={-w * 0.38} y={h * 0.08} width={w * 0.76} height={h * 0.4} rx={4} fill="#cbd5e1" {...sw} />
      <ellipse cx={0} cy={h * 0.08} rx={w * 0.38} ry={h * 0.1} fill="#94a3b8" {...sw} />
      <ellipse cx={0} cy={h * 0.08} rx={w * 0.28} ry={h * 0.06} fill="#0f172a" />
      <rect x={-w * 0.32} y={-h * 0.25} width={w * 0.08} height={h * 0.35} fill="#92400e" {...sw} />
      <rect x={w * 0.24} y={-h * 0.25} width={w * 0.08} height={h * 0.35} fill="#92400e" {...sw} />
      <line x1={-w * 0.24} y1={-h * 0.12} x2={w * 0.24} y2={-h * 0.12} stroke="#78350f" strokeWidth={2.5} />
      <line x1={0} y1={-h * 0.12} x2={0} y2={h * 0.04} stroke="#475569" strokeWidth={1.5} />
      <polygon points={`${-w / 2},${-h * 0.18} 0,${-h / 2} ${w / 2},${-h * 0.18}`} fill={props?.roof ?? "#ef4444"} {...sw} />
    </g>
  ),
  tank: ({ width: w, height: h, props }) => (
    <g>
      <line x1={-w * 0.32} y1={h * 0.15} x2={-w * 0.4} y2={h / 2} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <line x1={w * 0.32} y1={h * 0.15} x2={w * 0.4} y2={h / 2} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <line x1={0} y1={h * 0.15} x2={0} y2={h / 2} stroke="#64748b" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={-w * 0.35} y1={h * 0.22} x2={w * 0.35} y2={h * 0.42} stroke="#64748b" strokeWidth={1.5} />
      <line x1={w * 0.35} y1={h * 0.22} x2={-w * 0.35} y2={h * 0.42} stroke="#64748b" strokeWidth={1.5} />
      <rect x={-w * 0.42} y={-h * 0.42} width={w * 0.84} height={h * 0.6} rx={8} fill={props?.fill ?? "#3b82f6"} {...sw} />
      <ellipse cx={0} cy={-h * 0.42} rx={w * 0.42} ry={h * 0.08} fill="#bfdbfe" {...sw} />
      <rect x={-w * 0.08} y={-h * 0.3} width={w * 0.16} height={h * 0.36} rx={3} fill="#ffffff" opacity={0.8} />
      <line x1={0} y1={-h * 0.25} x2={0} y2={0} stroke="#3b82f6" strokeWidth={2} />
    </g>
  ),
  pipe: ({ width: w, height: h, props }) => (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.15} fill={props?.fill ?? "#14b8a6"} {...sw} />
      <rect x={-w * 0.42} y={-h * 0.35} width={w * 0.84} height={h * 0.22} rx={h * 0.1} fill="#ffffff" opacity={0.35} />
      <rect x={-w / 2} y={-h * 0.55} width={Math.max(6, w * 0.1)} height={h * 1.1} rx={2} fill={props?.fill ?? "#14b8a6"} {...sw} />
      <rect x={w / 2 - Math.max(6, w * 0.1)} y={-h * 0.55} width={Math.max(6, w * 0.1)} height={h * 1.1} rx={2} fill={props?.fill ?? "#14b8a6"} {...sw} />
    </g>
  ),
  road: ({ width: w, height: h, props }) => (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={props?.fill ?? "#facc15"} {...sw} />
      <line x1={-w / 2} y1={-h / 2 + 2} x2={w / 2} y2={-h / 2 + 2} stroke="#d97706" strokeWidth={2} />
      <line x1={-w / 2} y1={h / 2 - 2} x2={w / 2} y2={h / 2 - 2} stroke="#d97706" strokeWidth={2} />
      <line
        x1={-w * 0.44}
        y1={0}
        x2={w * 0.44}
        y2={0}
        stroke="#ffffff"
        strokeWidth={Math.max(2, h * 0.08)}
        strokeDasharray={`${w * 0.16} ${w * 0.12}`}
        strokeLinecap="round"
      />
    </g>
  ),
};

export function ObjectArt({ type, width, height, props }) {
  const Draw = ART[type];
  return Draw ? <Draw width={width} height={height} props={props} /> : null;
}

/** Small preview used on palette buttons. */
export function ObjectPreview({ type, size = 44, props, width, height }) {
  return (
    <svg viewBox="-30 -30 60 60" width={size} height={size} aria-hidden="true" focusable="false">
      <ObjectArt type={type} width={width} height={height} props={props} />
    </svg>
  );
}
