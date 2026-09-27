// Hand-drawn SVG sprites and building clusters for the village map.
// Every art component renders in LOCAL coordinates: (0,0) is the ground anchor,
// art grows upward (negative y). CSS-animated groups (anim-*) never carry their
// own SVG transform attribute — a CSS transform would override it — so animation
// always lives on a nested <g>.

const HEADING_FONT = { fontFamily: "var(--font-heading)" };

export function Tree({ x, y, s = 1, delay = 0, fruit = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="anim-sway" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx="0" cy="4" rx="27" ry="8" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="-6" y="-40" width="12" height="44" rx="5" fill="#8b5e3c" />
        <circle cx="-19" cy="-46" r="22" fill="#4e9f44" />
        <circle cx="19" cy="-48" r="22" fill="#469238" />
        <circle cx="0" cy="-72" r="24" fill="#63bd55" />
        <circle cx="0" cy="-52" r="19" fill="#55a948" />
        {fruit > 0 && (
          <g>
            <circle cx="-14" cy="-42" r="4.5" fill="#e25c4a" />
            <circle cx="12" cy="-58" r="4.5" fill="#e25c4a" />
            <circle cx="2" cy="-38" r="4.5" fill="#e25c4a" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Bush({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="anim-sway" style={{ animationDuration: "5.4s" }}>
        <circle cx="-9" cy="-8" r="11" fill="#4e9f44" />
        <circle cx="8" cy="-10" r="13" fill="#5fb352" />
        <circle cx="-1" cy="-14" r="10" fill="#63bd55" />
      </g>
    </g>
  );
}

export function Flower({ x, y, c }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="12" stroke="#4e9f44" strokeWidth="2.5" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={Math.cos((a * Math.PI) / 180) * 4.5}
          cy={12 + Math.sin((a * Math.PI) / 180) * 4.5}
          r="3.2"
          fill={c}
        />
      ))}
      <circle cx="0" cy="12" r="2.6" fill="#fde68a" />
    </g>
  );
}

export function Smoke({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="anim-smoke"
          style={{ animationDelay: `${-i * 1.06}s` }}
          cx={i * 7 - 6}
          cy="0"
          r={9 - i * 1.5}
          fill="#ffffff"
        />
      ))}
    </g>
  );
}

export function Villager({ x, y, dur = 9, delay = 0, dx = 26, tunic = "#e0705a", hat = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="13" ry="4.5" fill="rgba(15, 23, 42, 0.18)" />
      <g
        className="anim-npc"
        style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s`, "--dx": `${dx}px` }}
      >
        <rect x="-7" y="-10" width="5" height="11" rx="2.5" fill="#4a5b8c" />
        <rect x="2" y="-10" width="5" height="11" rx="2.5" fill="#3e4e7e" />
        <path d="M -9 -34 Q 0 -39 9 -34 L 8 -8 L -8 -8 Z" fill={tunic} />
        <circle cx="0" cy="-43" r="10" fill="#f8c89b" />
        <path d="M -10 -43 a 10 10 0 0 1 20 0 Z" fill="#5b3a29" />
        {hat && (
          <g>
            <ellipse cx="0" cy="-50" rx="14" ry="4.5" fill="#e9b949" />
            <path d="M -7 -50 a 7 8 0 0 1 14 0 Z" fill="#f0c24c" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Sign({ x, y, label, w = 96 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-3" y="-26" width="6" height="28" rx="2" fill="#a9744f" />
      <rect x={-w / 2} y="-52" width={w} height="28" rx="8" fill="#f7e7c6" stroke="#b98a5a" strokeWidth="3" />
      <text x="0" y="-33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#7c4a1e" style={HEADING_FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Location clusters ─────────────────────────────────────────────────────── */

function HomeArt() {
  return (
    <g>
      <ellipse cx="0" cy="-6" rx="185" ry="95" fill="#8ed67b" />
      {/* stone walkway down to the plaza */}
      <ellipse cx="-30" cy="34" rx="13" ry="7" fill="#e7d6b4" />
      <ellipse cx="-38" cy="18" rx="13" ry="7" fill="#ded0ac" />
      <ellipse cx="-34" cy="2" rx="13" ry="7" fill="#e7d6b4" />
      {/* flower garden */}
      <rect x="-165" y="-64" width="90" height="46" rx="10" fill="#a9713c" />
      <Flower x="-145" y="-62" c="#f472b6" />
      <Flower x="-125" y="-66" c="#fbbf24" />
      <Flower x="-105" y="-61" c="#a78bfa" />
      <Flower x="-88" y="-65" c="#fb7185" />
      {/* picket fence */}
      <g fill="#fdfdf8" stroke="#d9d2c4" strokeWidth="1.5">
        {[-150, -128, -106, -84, 62, 84, 106, 128, 150].map((fx) => (
          <path key={fx} d={`M ${fx - 5} 20 L ${fx - 5} 2 L ${fx} -5 L ${fx + 5} 2 L ${fx + 5} 20 Z`} />
        ))}
        <rect x="-155" y="6" width="310" height="4" opacity="0.7" />
      </g>
      {/* the cottage */}
      <g>
        <rect x="-118" y="-158" width="150" height="120" rx="8" fill="#fff3d6" />
        <rect x="-118" y="-158" width="26" height="120" rx="8" fill="#f1dfb4" />
        <rect x="4" y="-208" width="22" height="56" fill="#b98a5a" />
        <rect x="1" y="-214" width="28" height="10" rx="3" fill="#a06a44" />
        <polygon points="-134,-148 -44,-220 48,-148" fill="#e2725b" />
        <path d="M -110 -156 L -46 -210" stroke="#d05842" strokeWidth="4" fill="none" />
        <rect x="-40" y="-92" width="36" height="54" rx="8" fill="#8b5e3c" />
        <circle cx="-12" cy="-64" r="3" fill="#f7e7c6" />
        <rect x="-96" y="-122" width="32" height="30" rx="5" fill="#bde3ff" stroke="#ffffff" strokeWidth="4" />
        <line x1="-80" y1="-122" x2="-80" y2="-92" stroke="#ffffff" strokeWidth="3" />
        <rect x="8" y="-122" width="28" height="28" rx="5" fill="#bde3ff" stroke="#ffffff" strokeWidth="4" />
        <rect x="-98" y="-94" width="36" height="8" rx="3" fill="#a9744f" />
        <circle cx="-90" cy="-97" r="4" fill="#f472b6" />
        <circle cx="-78" cy="-97" r="4" fill="#fbbf24" />
        <circle cx="-68" cy="-97" r="4" fill="#fb7185" />
      </g>
      <Tree x="112" y="8" s="0.95" delay="-1.2" fruit={3} />
      <Tree x="-178" y="26" s="0.7" delay="-2.6" />
      <Bush x="60" y="26" />
      <Smoke x="15" y="-216" />
      <Sign x="34" y="44" label="Home" />
    </g>
  );
}

function SchoolArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="215" ry="102" fill="#c4e5a4" />
      {/* hopscotch */}
      {[-188, -156, -124].map((hx, i) => (
        <rect key={hx} x={hx} y={-16 - (i % 2) * 22} width="24" height="18" rx="3" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
      ))}
      {/* swing set */}
      <g stroke="#8b9bb0" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M 130 -6 L 158 -74" />
        <path d="M 186 -6 L 158 -74" />
        <path d="M 136 -28 L 180 -28" />
        <line x1="152" y1="-62" x2="152" y2="-26" stroke="#b98a5a" strokeWidth="3" />
        <rect x="146" y="-28" width="12" height="5" fill="#b98a5a" stroke="none" />
      </g>
      {/* main building */}
      <rect x="-140" y="-172" width="250" height="128" rx="8" fill="#fffbea" />
      <rect x="-140" y="-172" width="30" height="128" rx="8" fill="#f3e7c4" />
      <polygon points="-156,-172 126,-172 96,-208 -126,-208" fill="#3b82f6" />
      {/* bell tower */}
      <rect x="-40" y="-266" width="76" height="98" fill="#fff7e0" />
      <polygon points="-52,-266 48,-266 -2,-308" fill="#2f6bd6" />
      <circle cx="-2" cy="-242" r="17" fill="#ffffff" stroke="#b98a5a" strokeWidth="3" />
      <line x1="-2" y1="-242" x2="-2" y2="-252" stroke="#334155" strokeWidth="2.5" />
      <line x1="-2" y1="-242" x2="5" y2="-238" stroke="#334155" strokeWidth="2.5" />
      <path d="M -14 -206 a 12 14 0 0 1 24 0 v 18 h -24 Z" fill="#f59e0b" />
      {/* windows + door */}
      {[-112, -58, 56].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-134" width="32" height="36" rx="5" fill="#bde3ff" stroke="#ffffff" strokeWidth="4" />
          <line x1={wx + 16} y1="-134" x2={wx + 16} y2="-98" stroke="#ffffff" strokeWidth="3" />
        </g>
      ))}
      <rect x="-24" y="-66" width="46" height="62" rx="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="4" />
      <circle cx="12" cy="-36" r="3" fill="#ffffff" />
      {/* flagpole */}
      <line x1="170" y1="0" x2="170" y2="-272" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <g className="anim-flag">
        <polygon points="172,-268 172,-234 234,-251" fill="#ef4444" />
      </g>
      {/* chalkboard sign */}
      <g>
        <line x1="-196" y1="-4" x2="-196" y2="-58" stroke="#8b5e3c" strokeWidth="6" />
        <line x1="-160" y1="-4" x2="-160" y2="-58" stroke="#8b5e3c" strokeWidth="6" />
        <rect x="-206" y="-96" width="82" height="42" rx="6" fill="#31424e" stroke="#8b5e3c" strokeWidth="4" />
        <text x="-165" y="-69" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fdf6e3" style={HEADING_FONT}>
          A+ ✎
        </text>
      </g>
      <Villager x="96" y="30" dur="12" delay="-2" dx="34" tunic="#38bdf8" />
      <Tree x="216" y="6" s="0.8" delay="-0.8" />
      <Bush x="-210" y="16" />
      <Sign x="-80" y="52" label="School" />
    </g>
  );
}

function FarmArt() {
  const rows = [-96, -64, -32, 0];
  return (
    <g>
      <ellipse cx="0" cy="-2" rx="212" ry="98" fill="#9ccb6b" />
      {/* crop field with swaying rows */}
      <rect x="-196" y="-116" width="216" height="136" rx="12" fill="#a9713c" />
      {rows.map((ry, ri) => (
        <g key={ry}>
          <rect x="-186" y={ry} width="196" height="14" rx="7" fill="#8f5d2f" />
          <g className="anim-crop" style={{ animationDelay: `${ri * -0.42}s` }}>
            {[-178, -158, -138, -118, -98, -78, -58, -38, -18, 2].map((cx) => (
              <g key={cx}>
                <line x1={cx} y1={ry + 2} x2={cx} y2={ry - 10} stroke="#4e9f44" strokeWidth="3" />
                <circle cx={cx} cy={ry - 13} r="5" fill="#e9b949" />
              </g>
            ))}
          </g>
        </g>
      ))}
      {/* barn */}
      <g>
        <rect x="42" y="-152" width="136" height="108" rx="6" fill="#c94f3d" />
        <polygon points="28,-152 192,-152 110,-202" fill="#8f3a2d" />
        <rect x="52" y="-152" width="8" height="108" fill="#f8f4e8" />
        <rect x="160" y="-152" width="8" height="108" fill="#f8f4e8" />
        <rect x="84" y="-106" width="52" height="62" rx="4" fill="#8f3a2d" stroke="#f8f4e8" strokeWidth="4" />
        <path d="M 84 -106 L 136 -44 M 136 -106 L 84 -44" stroke="#f8f4e8" strokeWidth="4" />
        <circle cx="110" cy="-132" r="10" fill="#f8f4e8" />
      </g>
      {/* stone well */}
      <g>
        <ellipse cx="-160" cy="-14" rx="30" ry="12" fill="rgba(15, 23, 42, 0.15)" />
        <rect x="-186" y="-56" width="52" height="42" fill="#c7c1b4" />
        <ellipse cx="-160" cy="-56" rx="26" ry="10" fill="#d8d3c6" />
        <ellipse cx="-160" cy="-56" rx="16" ry="6" fill="#2c7da0" />
        <line x1="-186" y1="-56" x2="-186" y2="-96" stroke="#8b5e3c" strokeWidth="5" />
        <line x1="-134" y1="-56" x2="-134" y2="-96" stroke="#8b5e3c" strokeWidth="5" />
        <polygon points="-198,-94 -122,-94 -160,-118" fill="#c94f3d" />
        <line x1="-160" y1="-94" x2="-160" y2="-72" stroke="#7c4a1e" strokeWidth="2.5" />
        <rect x="-167" y="-72" width="14" height="10" rx="2" fill="#b98a5a" />
      </g>
      {/* scarecrow */}
      <g>
        <line x1="215" y1="-6" x2="215" y2="-64" stroke="#8b5e3c" strokeWidth="5" />
        <line x1="196" y1="-52" x2="234" y2="-52" stroke="#8b5e3c" strokeWidth="5" />
        <polygon points="203,-52 227,-52 223,-26 207,-26" fill="#e0705a" />
        <circle cx="215" cy="-70" r="10" fill="#f8c89b" />
        <path d="M 201 -74 a 14 6 0 0 1 28 0 Z" fill="#e9b949" />
      </g>
      {/* hay bales */}
      <g>
        <circle cx="16" cy="-18" r="17" fill="#e9c46a" />
        <path d="M 4 -22 q 12 8 24 0" stroke="#d4a94e" strokeWidth="2.5" fill="none" />
        <circle cx="46" cy="-10" r="14" fill="#efc97e" />
      </g>
      <Tree x="150" y="34" s="1.05" delay="-1.8" fruit={3} />
      <Tree x="-60" y="38" s="0.8" delay="-3" />
      <Villager x="-40" y="30" dur="11" delay="-4" dx="30" tunic="#4e9f44" hat />
      <Sign x="80" y="56" label="Farm" />
    </g>
  );
}

function MarketArt() {
  const pennants = [
    [-146, -127], [-120, -121], [-94, -117], [-68, -115], [-42, -117], [-16, -121],
  ];
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="205" ry="96" fill="#e3d2b4" />
      {[-160, -110, -60, -10, 40, 90, 140].map((cx, i) => (
        <ellipse key={cx} cx={cx} cy={i % 2 === 0 ? 24 : 40} rx="14" ry="6" fill="#d6c3a0" />
      ))}
      {/* bunting between the stalls */}
      <path d="M -166 -132 Q -85 -100 -6 -132" stroke="#b98a5a" strokeWidth="3" fill="none" />
      {pennants.map(([px, py], i) => (
        <polygon key={i} points={`${px},${py} ${px + 16},${py} ${px + 8},${py + 14}`} fill={["#ef4444", "#fbbf24", "#22c55e", "#3b82f6", "#ec4899", "#8b5cf6"][i]} />
      ))}
      {/* left stall — red stripes */}
      <g>
        <rect x="-166" y="-70" width="112" height="34" rx="4" fill="#c08a57" />
        <rect x="-162" y="-124" width="8" height="58" fill="#a9744f" />
        <rect x="-60" y="-124" width="8" height="58" fill="#a9744f" />
        <g className="anim-sway" style={{ animationDuration: "6s" }}>
          <rect x="-172" y="-122" width="124" height="24" fill="#f87171" />
          {[-152, -132, -112, -92, -72].map((sx) => (
            <rect key={sx} x={sx} y="-122" width="12" height="24" fill="#ffffff" />
          ))}
          {[-172, -150, -128, -106, -84, -62].map((sx) => (
            <circle key={sx} cx={sx + 6} cy="-98" r="6" fill="#f87171" />
          ))}
        </g>
        <circle cx="-146" cy="-76" r="9" fill="#fb923c" />
        <circle cx="-128" cy="-74" r="9" fill="#fb923c" />
        <circle cx="-110" cy="-76" r="9" fill="#ef4444" />
        <circle cx="-92" cy="-74" r="9" fill="#22c55e" />
        <circle cx="-74" cy="-76" r="9" fill="#fbbf24" />
      </g>
      {/* right stall — green stripes */}
      <g>
        <rect x="10" y="-70" width="112" height="34" rx="4" fill="#c08a57" />
        <rect x="14" y="-124" width="8" height="58" fill="#a9744f" />
        <rect x="116" y="-124" width="8" height="58" fill="#a9744f" />
        <g className="anim-sway" style={{ animationDuration: "6.8s", animationDelay: "-2s" }}>
          <rect x="4" y="-122" width="124" height="24" fill="#22c55e" />
          {[24, 44, 64, 84, 104].map((sx) => (
            <rect key={sx} x={sx} y="-122" width="12" height="24" fill="#ffffff" />
          ))}
          {[4, 26, 48, 70, 92, 114].map((sx) => (
            <circle key={sx} cx={sx + 6} cy="-98" r="6" fill="#22c55e" />
          ))}
        </g>
        <circle cx="30" cy="-76" r="9" fill="#fbbf24" />
        <circle cx="48" cy="-74" r="9" fill="#ef4444" />
        <circle cx="66" cy="-76" r="9" fill="#fb923c" />
        <circle cx="84" cy="-74" r="9" fill="#a78bfa" />
        <circle cx="102" cy="-76" r="9" fill="#22c55e" />
      </g>
      {/* crates of produce */}
      <g>
        <rect x="150" y="-52" width="52" height="30" rx="3" fill="#c08a57" stroke="#a9744f" strokeWidth="3" />
        <circle cx="162" cy="-52" r="7" fill="#fb923c" />
        <circle cx="176" cy="-54" r="7" fill="#ef4444" />
        <circle cx="190" cy="-52" r="7" fill="#fbbf24" />
        <rect x="156" y="-84" width="44" height="28" rx="3" fill="#b07b4c" stroke="#a9744f" strokeWidth="3" />
        <circle cx="166" cy="-84" r="6" fill="#22c55e" />
        <circle cx="180" cy="-86" r="6" fill="#ef4444" />
        <circle cx="192" cy="-84" r="6" fill="#fb923c" />
      </g>
      {/* hanging market sign */}
      <g>
        <line x1="182" y1="-4" x2="182" y2="-92" stroke="#8b5e3c" strokeWidth="6" />
        <rect x="146" y="-124" width="76" height="34" rx="8" fill="#f7e7c6" stroke="#b98a5a" strokeWidth="3" />
        <text x="184" y="-101" textAnchor="middle" fontSize="16" fontWeight="800" fill="#7c4a1e" style={HEADING_FONT}>
          MARKET
        </text>
      </g>
      <Villager x="-30" y="34" dur="8" delay="-1" dx="26" tunic="#7c5cc4" />
      <Villager x="60" y="42" dur="9" delay="-5" dx="22" tunic="#f59e0b" />
      <circle className="anim-twinkle" cx="200" cy="-96" r="5" fill="#fbbf24" />
      <circle className="anim-twinkle" cx="216" cy="-40" r="4" fill="#fbbf24" style={{ animationDelay: "-0.9s" }} />
    </g>
  );
}

function MarketingArt() {
  return (
    <g>
      <ellipse cx="0" cy="-2" rx="208" ry="98" fill="#dcd7ea" />
      <line x1="-190" y1="18" x2="190" y2="18" stroke="#cbc4e0" strokeWidth="4" />
      <line x1="-150" y1="-30" x2="150" y2="-30" stroke="#cbc4e0" strokeWidth="4" />
      {/* paint splashes */}
      <ellipse cx="-40" cy="26" rx="12" ry="5" fill="#f59e0b" opacity="0.5" />
      <ellipse cx="120" cy="34" rx="10" ry="4" fill="#22c55e" opacity="0.5" />
      <ellipse cx="190" cy="10" rx="9" ry="4" fill="#3b82f6" opacity="0.4" />
      {/* studio building */}
      <g>
        <rect x="-156" y="-162" width="184" height="116" rx="8" fill="#fdfdff" />
        <rect x="-166" y="-176" width="204" height="16" rx="7" fill="#ec4899" />
        <rect x="-142" y="-146" width="158" height="42" rx="5" fill="#a5c8f5" stroke="#ffffff" strokeWidth="4" />
        <line x1="-103" y1="-146" x2="-103" y2="-104" stroke="#ffffff" strokeWidth="3" />
        <line x1="-64" y1="-146" x2="-64" y2="-104" stroke="#ffffff" strokeWidth="3" />
        <line x1="-142" y1="-125" x2="16" y2="-125" stroke="#ffffff" strokeWidth="3" />
        <rect x="-96" y="-92" width="36" height="46" rx="6" fill="#7c5cc4" />
        <circle cx="-68" cy="-68" r="3" fill="#fde68a" />
        <rect x="-46" y="-92" width="56" height="40" rx="5" fill="#c7dfff" stroke="#ffffff" strokeWidth="4" />
      </g>
      {/* broadcast antenna */}
      <g>
        <line x1="-120" y1="-176" x2="-120" y2="-252" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        <line x1="-136" y1="-234" x2="-104" y2="-234" stroke="#64748b" strokeWidth="4" />
        <line x1="-130" y1="-246" x2="-110" y2="-246" stroke="#64748b" strokeWidth="4" />
        <circle className="anim-twinkle" cx="-120" cy="-258" r="6" fill="#ef4444" style={{ animationDuration: "1.3s" }} />
      </g>
      {/* billboard */}
      <g>
        <rect x="70" y="-88" width="9" height="90" fill="#94a3b8" />
        <rect x="146" y="-88" width="9" height="90" fill="#94a3b8" />
        <rect x="52" y="-238" width="152" height="92" rx="10" fill="#ffffff" stroke="#ec4899" strokeWidth="6" />
        <polygon points="84,-178 124,-198 124,-158" fill="#ec4899" />
        <rect x="74" y="-186" width="12" height="16" rx="4" fill="#be185d" />
        <path d="M 132 -196 q 10 18 0 36" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 144 -204 q 16 26 0 52" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle className="anim-twinkle" cx="188" cy="-222" r="5" fill="#fbbf24" />
        <circle className="anim-twinkle" cx="196" cy="-166" r="4" fill="#ec4899" style={{ animationDelay: "-0.8s" }} />
      </g>
      {/* poster boards */}
      <g transform="rotate(-6 -170 -32)">
        <rect x="-196" y="-64" width="52" height="64" rx="6" fill="#fce7f3" stroke="#ec4899" strokeWidth="4" />
        <circle cx="-182" cy="-46" r="10" fill="#3b82f6" />
        <rect x="-192" y="-30" width="34" height="7" rx="3" fill="#f59e0b" />
      </g>
      <g transform="rotate(5 -109 -29)">
        <rect x="-132" y="-58" width="46" height="58" rx="6" fill="#eff6ff" stroke="#3b82f6" strokeWidth="4" />
        <path d="M -122 -24 l 10 -16 8 10 7 -12 9 18 Z" fill="#22c55e" />
      </g>
      {/* easel */}
      <g>
        <line x1="-30" y1="-2" x2="-48" y2="-78" stroke="#8b5e3c" strokeWidth="4" />
        <line x1="-30" y1="-2" x2="-12" y2="-78" stroke="#8b5e3c" strokeWidth="4" />
        <rect x="-58" y="-118" width="56" height="44" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="-40" cy="-98" r="9" fill="#ec4899" />
        <path d="M -30 -108 l 14 22 h -28 Z" fill="#22c55e" />
      </g>
      <Villager x="30" y="36" dur="10" delay="-3" dx="30" tunic="#ec4899" />
      <Bush x="210" y="10" />
      <Sign x="-160" y="44" label="Studio" />
    </g>
  );
}

export const LOCATION_ART = {
  home: HomeArt,
  school: SchoolArt,
  farm: FarmArt,
  market: MarketArt,
  marketing: MarketingArt,
};
