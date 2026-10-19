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
