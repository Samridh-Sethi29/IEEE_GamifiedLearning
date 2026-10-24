// Hand-drawn SVG sprites and building clusters for the village map.
// Every art component renders in LOCAL coordinates: (0,0) is the ground anchor,
// art grows upward (negative y). CSS-animated groups (anim-*) never carry their
// own SVG transform attribute — a CSS transform would override it — so animation
// always lives on a nested <g>.

const HEADING_FONT = { fontFamily: "var(--font-heading)" };

export function Tree({ x, y, s = 1, delay = 0, fruit = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="6" rx="28" ry="9" fill="rgba(15, 23, 42, 0.16)" />
      <g className="anim-sway" style={{ animationDelay: `${delay}s` }}>
        {/* Trunk & Roots */}
        <path d="M -7 4 Q -12 2 -18 6 L -9 -38 L 9 -38 L 18 6 Q 12 2 7 4 Z" fill="#6d472b" />
        <path d="M -2 2 L -4 -38 L 2 -38 L 3 2 Z" fill="#875b38" />
        {/* Deep Foliage Shadow */}
        <circle cx="0" cy="-56" r="32" fill="#2d6e24" />
        {/* Mid Foliage Clusters */}
        <circle cx="-20" cy="-52" r="23" fill="#3c8e2f" />
        <circle cx="20" cy="-54" r="23" fill="#357f2a" />
        <circle cx="-12" cy="-74" r="22" fill="#4ea839" />
        <circle cx="12" cy="-76" r="22" fill="#469933" />
        <circle cx="0" cy="-64" r="24" fill="#58b940" />
        {/* Sunlight Highlights */}
        <ellipse cx="-6" cy="-80" rx="14" ry="10" fill="#78d356" opacity="0.85" />
        <ellipse cx="8" cy="-66" rx="12" ry="8" fill="#6cc94c" opacity="0.7" />
        {fruit > 0 && (
          <g>
            <circle cx="-16" cy="-48" r="4.5" fill="#ef4444" />
            <circle cx="-14.5" cy="-49.5" r="1.5" fill="#fca5a5" />
            <circle cx="14" cy="-64" r="4.5" fill="#ef4444" />
            <circle cx="15.5" cy="-65.5" r="1.5" fill="#fca5a5" />
            <circle cx="2" cy="-44" r="4.5" fill="#ef4444" />
            <circle cx="3.5" cy="-45.5" r="1.5" fill="#fca5a5" />
            <circle cx="-8" cy="-68" r="4" fill="#ef4444" />
            <circle cx="18" cy="-46" r="4" fill="#ef4444" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Bush({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="18" ry="6" fill="rgba(15, 23, 42, 0.12)" />
      <g className="anim-sway" style={{ animationDuration: "5.4s" }}>
        <circle cx="-9" cy="-8" r="13" fill="#2d6e24" />
        <circle cx="10" cy="-9" r="14" fill="#3c8e2f" />
        <circle cx="0" cy="-15" r="12" fill="#4ea839" />
        <circle cx="-2" cy="-16" r="9" fill="#6ecf4c" opacity="0.8" />
        <circle cx="-6" cy="-10" r="2.2" fill="#f43f5e" />
        <circle cx="7" cy="-7" r="2.2" fill="#f43f5e" />
        <circle cx="2" cy="-16" r="2" fill="#fbbf24" />
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
      <ellipse cx="0" cy="2" rx="14" ry="5" fill="rgba(15, 23, 42, 0.22)" />
      <g
        className="anim-npc"
        style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s`, "--dx": `${dx}px` }}
      >
        <ellipse cx="0" cy="0" rx="9" ry="3.5" fill="rgba(15, 23, 42, 0.2)" />
        <rect x="-6.5" y="-10" width="5" height="11" rx="2" fill="#374151" />
        <rect x="1.5" y="-10" width="5" height="11" rx="2" fill="#1f2937" />
        <rect x="-7.5" y="-2" width="6" height="4" rx="1.5" fill="#58351f" />
        <rect x="1.5" y="-2" width="6" height="4" rx="1.5" fill="#452714" />
        <path d="M -9 -34 Q 0 -39 9 -34 L 8 -8 L -8 -8 Z" fill={tunic} />
        <rect x="-8.5" y="-16" width="17" height="4" fill="#603813" />
        <rect x="-3" y="-17.5" width="6" height="7" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        <line x1="-8" y1="-34" x2="6" y2="-12" stroke="#452714" strokeWidth="2.5" />
        <circle cx="0" cy="-43" r="10" fill="#f8c89b" />
        <ellipse cx="-3" cy="-43" rx="1" ry="1.4" fill="#374151" />
        <ellipse cx="3" cy="-43" rx="1" ry="1.4" fill="#374151" />
        <path d="M -10 -45 Q 0 -54 10 -45 Q 11 -41 8 -41 Q 0 -47 -8 -41 Z" fill="#5b3a29" />
        {hat && (
          <g>
            <ellipse cx="0" cy="-51" rx="15" ry="5" fill="#d97706" />
            <path d="M -8 -51 a 8 9 0 0 1 16 0 Z" fill="#f59e0b" />
            <rect x="-8" y="-52" width="16" height="2" fill="#92400e" />
            <circle cx="8" cy="-54" r="2" fill="#ef4444" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Sign({ x, y, label, w = 104 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="3" rx={w * 0.44} ry="6" fill="rgba(15, 23, 42, 0.16)" />
      <rect x="-4" y="-30" width="8" height="32" rx="2" fill="#6d472b" />
      <rect x="-2" y="-30" width="4" height="32" rx="1" fill="#8c5b36" />
      <rect x={-w / 2} y="-58" width={w} height="32" rx="7" fill="#fdf0d5" stroke="#78471e" strokeWidth="3" />
      <rect x={-w / 2 + 4} y="-54" width={w - 8} height="24" rx="5" fill="#f7e1b5" />
      <circle cx={-w / 2 + 8} cy="-42" r="1.8" fill="#5c3818" />
      <circle cx={w / 2 - 8} cy="-42" r="1.8" fill="#5c3818" />
      <text
        x="0"
        y="-37"
        textAnchor="middle"
        fontSize="14.5"
        fontWeight="800"
        letterSpacing="0.5"
        fill="#5a310c"
        style={HEADING_FONT}
      >
        {label}
      </text>
    </g>
  );
}

/* ── Location clusters ─────────────────────────────────────────────────────── */

function HomeArt() {
  return (
    <g>
      {/* Ground hill base with grass and shadow */}
      <ellipse cx="0" cy="4" rx="195" ry="102" fill="rgba(15, 23, 42, 0.18)" />
      <ellipse cx="0" cy="-6" rx="190" ry="98" fill="#88cf72" />
      <ellipse cx="-20" cy="-14" rx="170" ry="84" fill="#9de086" opacity="0.65" />

      {/* Flagstone walkway down to gate */}
      <g>
        <ellipse cx="-28" cy="46" rx="14" ry="7" fill="#c4ad8e" />
        <ellipse cx="-28" cy="44" rx="13" ry="6" fill="#ded0b6" />
        <ellipse cx="-34" cy="28" rx="13" ry="7" fill="#baa383" />
        <ellipse cx="-34" cy="26" rx="12" ry="6" fill="#d9c9ae" />
        <ellipse cx="-30" cy="10" rx="14" ry="7" fill="#baa383" />
        <ellipse cx="-30" cy="8" rx="13" ry="6" fill="#e7dac4" />
        <ellipse cx="-24" cy="-8" rx="15" ry="7.5" fill="#c4ad8e" />
        <ellipse cx="-24" cy="-10" rx="14" ry="6.5" fill="#ebdcc8" />
      </g>

      {/* Flower gardens around the cottage */}
      <rect x="-174" y="-62" width="102" height="48" rx="12" fill="#714828" stroke="#523218" strokeWidth="2" />
      <Flower x="-156" y="-60" c="#ec4899" />
      <Flower x="-138" y="-66" c="#f59e0b" />
      <Flower x="-118" y="-60" c="#8b5cf6" />
      <Flower x="-98" y="-64" c="#38bdf8" />
      <Flower x="-82" y="-58" c="#ef4444" />
      <Flower x="-146" y="-46" c="#fbbf24" />
      <Flower x="-124" y="-44" c="#ec4899" />
      <Flower x="-104" y="-46" c="#10b981" />

      {/* Picket fence with gate */}
      <g fill="#fefefe" stroke="#b8af9c" strokeWidth="1.5">
        {[-165, -145, -125, -105, -85, -65, 45, 65, 85, 105, 125, 145].map((fx) => (
          <path key={fx} d={`M ${fx - 5} 24 L ${fx - 5} 2 L ${fx} -5 L ${fx + 5} 2 L ${fx + 5} 24 Z`} />
        ))}
        <rect x="-170" y="8" width="112" height="4" rx="1" fill="#ffffff" />
        <rect x="-170" y="16" width="112" height="4" rx="1" fill="#ffffff" />
        <rect x="40" y="8" width="112" height="4" rx="1" fill="#ffffff" />
        <rect x="40" y="16" width="112" height="4" rx="1" fill="#ffffff" />
      </g>

      {/* The 2.5D Cottage */}
      <g>
        {/* House Ground Shadow */}
        <ellipse cx="-15" cy="-28" rx="92" ry="24" fill="rgba(15, 23, 42, 0.28)" />

        {/* Stone foundation */}
        <rect x="-122" y="-48" width="158" height="24" rx="3" fill="#8c827a" stroke="#635b54" strokeWidth="2" />
        {[-110, -78, -46, -14, 18].map((sx) => (
          <line key={sx} x1={sx} y1="-48" x2={sx} y2="-24" stroke="#635b54" strokeWidth="1.5" />
        ))}

        {/* Main Walls (warm plaster) */}
        <rect x="-120" y="-168" width="154" height="122" rx="4" fill="#fdf8eb" />
        {/* Shaded side wall for 2.5D depth */}
        <rect x="-120" y="-168" width="28" height="122" rx="4" fill="#eeddb8" />

        {/* Timber framing beams */}
        <rect x="-120" y="-168" width="8" height="122" fill="#6d472b" />
        <rect x="26" y="-168" width="8" height="122" fill="#6d472b" />
        <rect x="-56" y="-168" width="8" height="122" fill="#6d472b" />
        <rect x="-120" y="-112" width="154" height="7" fill="#6d472b" />
        <line x1="-118" y1="-166" x2="-58" y2="-112" stroke="#6d472b" strokeWidth="6" />
        <line x1="-54" y1="-166" x2="26" y2="-112" stroke="#6d472b" strokeWidth="6" />

        {/* Stone Chimney */}
        <rect x="2" y="-226" width="28" height="74" fill="#857a72" stroke="#5a524c" strokeWidth="2" />
        <rect x="-1" y="-232" width="34" height="10" rx="3" fill="#635a53" />
        <circle cx="8" cy="-206" r="4" fill="#635a53" />
        <circle cx="20" cy="-192" r="5" fill="#635a53" />
        <circle cx="12" cy="-176" r="4" fill="#635a53" />
        <Smoke x="15" y="-234" />

        {/* Gable Roof with terracotta clay tiles */}
        <polygon points="-142,-156 -42,-236 56,-156" fill="#c75239" stroke="#9e3a24" strokeWidth="3" />
        <polygon points="-142,-156 -42,-236 -122,-156" fill="#a83c26" />
        {[-176, -196, -216].map((ty) => (
          <line key={ty} x1="-42" y1={ty} x2={ty + 100} y2="-156" stroke="#9e3a24" strokeWidth="3" />
        ))}
        {/* Bargeboard / Eaves trim */}
        <polyline points="-144,-153 -42,-238 58,-153" fill="none" stroke="#6d472b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Upper Attic Dormer Window */}
        <circle cx="-42" cy="-184" r="14" fill="#fff5cc" stroke="#6d472b" strokeWidth="3" />
        <line x1="-42" y1="-198" x2="-42" y2="-170" stroke="#6d472b" strokeWidth="2.5" />
        <line x1="-56" y1="-184" x2="-28" y2="-184" stroke="#6d472b" strokeWidth="2.5" />

        {/* Cozy Oak Front Door */}
        <rect x="-44" y="-102" width="38" height="56" rx="6" fill="#58351f" stroke="#3b2010" strokeWidth="2" />
        <path d="M -44 -86 Q -25 -100 -6 -86 L -6 -46 L -44 -46 Z" fill="#6d472b" />
        <circle cx="-12" cy="-72" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        <rect x="-43" y="-94" width="12" height="4" rx="1" fill="#2d2a29" />
        <rect x="-43" y="-60" width="12" height="4" rx="1" fill="#2d2a29" />
        <rect x="-48" y="-46" width="46" height="8" rx="2" fill="#ded0b6" stroke="#8c827a" strokeWidth="1.5" />

        {/* Glowing Lantern by the Door */}
        <line x1="-50" y1="-86" x2="-54" y2="-86" stroke="#374151" strokeWidth="2" />
        <rect x="-58" y="-92" width="8" height="12" rx="2" fill="#fde047" stroke="#374151" strokeWidth="1.5" />
        <circle cx="-54" cy="-86" r="10" fill="rgba(253, 224, 71, 0.25)" />

        {/* Windows with warm glowing interior & Flowerboxes */}
        <rect x="-104" y="-134" width="36" height="34" rx="4" fill="#fef3c7" stroke="#6d472b" strokeWidth="3" />
        <line x1="-86" y1="-134" x2="-86" y2="-100" stroke="#6d472b" strokeWidth="2.5" />
        <line x1="-104" y1="-117" x2="-68" y2="-117" stroke="#6d472b" strokeWidth="2.5" />
        <rect x="-106" y="-100" width="40" height="10" rx="3" fill="#78471e" />
        <circle cx="-98" cy="-102" r="4" fill="#ec4899" />
        <circle cx="-88" cy="-103" r="4.5" fill="#f59e0b" />
        <circle cx="-76" cy="-102" r="4" fill="#38bdf8" />

        <rect x="2" y="-134" width="22" height="34" rx="4" fill="#fef3c7" stroke="#6d472b" strokeWidth="3" />
        <line x1="13" y1="-134" x2="13" y2="-100" stroke="#6d472b" strokeWidth="2.5" />
        <line x1="2" y1="-117" x2="24" y2="-117" stroke="#6d472b" strokeWidth="2.5" />
        <rect x="0" y="-100" width="26" height="10" rx="3" fill="#78471e" />
        <circle cx="8" cy="-102" r="4" fill="#ef4444" />
        <circle cx="18" cy="-102" r="4" fill="#a855f7" />
      </g>

      <Tree x="120" y="14" s="1" delay="-1.2" fruit={4} />
      <Tree x="-182" y="24" s="0.75" delay="-2.6" />
      <Bush x="68" y="28" />
      <Sign x="36" y="48" label="Home" />
    </g>
  );
}

function SchoolArt() {
  return (
    <g>
      {/* Ground hill base */}
      <ellipse cx="0" cy="4" rx="225" ry="110" fill="rgba(15, 23, 42, 0.18)" />
      <ellipse cx="0" cy="-4" rx="220" ry="106" fill="#8ecf75" />
      <ellipse cx="-15" cy="-12" rx="195" ry="92" fill="#a4e08c" opacity="0.6" />

      {/* Flagstone courtyard & brick pathway */}
      <g>
        <ellipse cx="0" cy="28" rx="80" ry="24" fill="#ded0ba" stroke="#b09f87" strokeWidth="2" />
        <ellipse cx="0" cy="28" rx="72" ry="20" fill="#eddcc4" />
      </g>

      {/* Hopscotch grid on courtyard */}
      {[-180, -150, -120].map((hx, i) => (
        <rect key={hx} x={hx} y={-14 - (i % 2) * 20} width="24" height="18" rx="3" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.8" />
      ))}
      <text x="-168" y="-2" fontSize="11" fontWeight="bold" fill="#ffffff" opacity="0.85" textAnchor="middle">1</text>
      <text x="-138" y="-22" fontSize="11" fontWeight="bold" fill="#ffffff" opacity="0.85" textAnchor="middle">2</text>
      <text x="-108" y="-2" fontSize="11" fontWeight="bold" fill="#ffffff" opacity="0.85" textAnchor="middle">3</text>

      {/* Academy Building (Collegiate Neoclassical architecture) */}
      <g>
        {/* Building Ground Shadow */}
        <ellipse cx="-5" cy="-28" rx="135" ry="28" fill="rgba(15, 23, 42, 0.28)" />

        {/* Foundation & Steps */}
        <rect x="-146" y="-52" width="276" height="26" rx="4" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
        <rect x="-42" y="-36" width="70" height="10" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="-36" y="-44" width="58" height="10" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Main Facade (warm academic stone brick) */}
        <rect x="-140" y="-182" width="264" height="134" rx="6" fill="#fffdf5" />
        <rect x="-140" y="-182" width="34" height="134" rx="6" fill="#f0e9d2" />
        {[-176, -154, -132, -110, -88, -66].map((qy) => (
          <g key={qy}>
            <rect x="-140" y={qy} width="16" height="10" fill="#e2d8be" stroke="#cfc3a5" strokeWidth="1" />
            <rect x="108" y={qy} width="16" height="10" fill="#e2d8be" stroke="#cfc3a5" strokeWidth="1" />
          </g>
        ))}

        {/* Neoclassical Pediment & Central Entry */}
        <polygon points="-52,-182 40,-182 -6,-218" fill="#f8f4e6" stroke="#cfc3a5" strokeWidth="2" />
        <rect x="-40" y="-146" width="10" height="96" rx="2" fill="#f3ede0" stroke="#cfc3a5" strokeWidth="1.5" />
        <rect x="16" y="-146" width="10" height="96" rx="2" fill="#f3ede0" stroke="#cfc3a5" strokeWidth="1.5" />

        {/* Double Entrance Doors */}
        <rect x="-26" y="-120" width="38" height="70" rx="6" fill="#1e40af" stroke="#e5e7eb" strokeWidth="3" />
        <line x1="-7" y1="-120" x2="-7" y2="-50" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle cx="-13" cy="-84" r="3" fill="#facc15" />
        <circle cx="-1" cy="-84" r="3" fill="#facc15" />
        <path d="M -26 -120 Q -7 -142 12 -120 Z" fill="#93c5fd" stroke="#e5e7eb" strokeWidth="2" />

        {/* Academic Sash Windows (First & Second Floor) */}
        {[-114, -68, 48, 92].map((wx) => (
          <g key={wx}>
            <rect x={wx} y="-116" width="32" height="42" rx="4" fill="#eff6ff" stroke="#cfc3a5" strokeWidth="2.5" />
            <line x1={wx + 16} y1="-116" x2={wx + 16} y2="-74" stroke="#cfc3a5" strokeWidth="2" />
            <line x1={wx} y1="-95" x2={wx + 32} y2="-95" stroke="#cfc3a5" strokeWidth="2" />
            <path d={`M ${wx} -148 Q ${wx + 16} -162 ${wx + 32} -148 L ${wx + 32} -128 L ${wx} -128 Z`} fill="#fef08a" stroke="#cfc3a5" strokeWidth="2" />
            <line x1={wx + 16} y1="-155" x2={wx + 16} y2="-128" stroke="#cfc3a5" strokeWidth="2" />
          </g>
        ))}

        {/* Roof (Slate Blue Hip Roof) */}
        <polygon points="-156,-182 140,-182 108,-218 -124,-218" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
        <line x1="-124" y1="-218" x2="108" y2="-218" stroke="#93c5fd" strokeWidth="3" />

        {/* Grand Clock & Bell Tower */}
        <g>
          <rect x="-42" y="-282" width="70" height="76" fill="#fffef7" stroke="#cfc3a5" strokeWidth="2" />
          <rect x="-46" y="-286" width="78" height="8" rx="2" fill="#e2d8be" />

          {/* Clock Face */}
          <circle cx="-7" cy="-256" r="20" fill="#ffffff" stroke="#d97706" strokeWidth="3.5" />
          <circle cx="-7" cy="-256" r="17" fill="#fffdf0" />
          <line x1="-7" y1="-256" x2="-7" y2="-268" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-7" y1="-256" x2="3" y2="-252" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-7" cy="-256" r="2.5" fill="#d97706" />

          {/* Open Belfry Arch & Bell */}
          <path d="M -22 -220 a 15 16 0 0 1 30 0 v 18 h -30 Z" fill="#374151" />
          <g className="anim-sway" style={{ animationDuration: "3s" }}>
            <path d="M -16 -210 Q -7 -222 2 -210 L 4 -200 L -18 -200 Z" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="-7" cy="-198" r="3" fill="#78350f" />
          </g>

          {/* Tower Spire */}
          <polygon points="-46,-286 32,-286 -7,-336" fill="#1d4ed8" stroke="#1e40af" strokeWidth="2" />
          <line x1="-7" y1="-336" x2="-7" y2="-352" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-7" cy="-354" r="4.5" fill="#facc15" stroke="#d97706" strokeWidth="1.5" />
        </g>

        {/* Flagpole & School Flag */}
        <line x1="174" y1="0" x2="174" y2="-278" stroke="#9ca3af" strokeWidth="5" strokeLinecap="round" />
        <circle cx="174" cy="-280" r="4.5" fill="#facc15" />
        <g className="anim-flag">
          <polygon points="176,-276 176,-238 244,-257" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <polygon points="176,-276 176,-238 214,-257" fill="#dc2626" />
        </g>

        {/* Chalkboard Sign on Easel */}
        <g>
          <line x1="-202" y1="-4" x2="-202" y2="-62" stroke="#6d472b" strokeWidth="6" strokeLinecap="round" />
          <line x1="-164" y1="-4" x2="-164" y2="-62" stroke="#6d472b" strokeWidth="6" strokeLinecap="round" />
          <rect x="-212" y="-102" width="88" height="46" rx="6" fill="#1e293b" stroke="#78471e" strokeWidth="4" />
          <text x="-168" y="-73" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fef08a" style={HEADING_FONT}>
            A+ ✎ 🧮
          </text>
        </g>
      </g>

      <Villager x="96" y="32" dur="12" delay="-2" dx="34" tunic="#38bdf8" />
      <Tree x="218" y="10" s="0.85" delay="-0.8" />
      <Bush x="-214" y="20" />
      <Sign x="-80" y="56" label="School" />
    </g>
  );
}

function FarmArt() {
  const rows = [-96, -64, -32, 0];
  return (
    <g>
      {/* Ground hill base */}
      <ellipse cx="0" cy="4" rx="225" ry="106" fill="rgba(15, 23, 42, 0.18)" />
      <ellipse cx="0" cy="-2" rx="220" ry="102" fill="#8ece6d" />
      <ellipse cx="-15" cy="-10" rx="198" ry="88" fill="#9fe07e" opacity="0.6" />

      {/* Split rail wooden fence around the farm */}
      <g stroke="#6d472b" strokeWidth="4" strokeLinecap="round">
        {[-196, -140, -84, -28].map((fx) => (
          <line key={fx} x1={fx} y1="-12" x2={fx} y2="16" strokeWidth="6" />
        ))}
        <line x1="-202" y1="-6" x2="-22" y2="-6" strokeWidth="3.5" />
        <line x1="-202" y1="6" x2="-22" y2="6" strokeWidth="3.5" />
      </g>

      {/* Tilled Crop Field */}
      <rect x="-204" y="-124" width="224" height="142" rx="14" fill="#6d4427" stroke="#4a2c16" strokeWidth="3" />
      {rows.map((ry, ri) => (
        <g key={ry}>
          <rect x="-194" y={ry} width="204" height="16" rx="8" fill="#54331b" />
          <g className="anim-crop" style={{ animationDelay: `${ri * -0.42}s` }}>
            {[-184, -164, -144, -124, -104, -84, -64, -44, -24, -4].map((cx, ci) => (
              <g key={cx}>
                {ci % 3 === 0 ? (
                  <g>
                    <line x1={cx} y1={ry + 4} x2={cx} y2={ry - 12} stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
                    <circle cx={cx} cy={ry - 15} r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    <circle cx={cx - 3} cy={ry - 12} r="3" fill="#eab308" />
                    <circle cx={cx + 3} cy={ry - 12} r="3" fill="#eab308" />
                  </g>
                ) : ci % 3 === 1 ? (
                  <g>
                    <ellipse cx={cx} cy={ry - 4} rx="7" ry="5.5" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
                    <line x1={cx} y1={ry - 9} x2={cx + 2} y2={ry - 12} stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                  </g>
                ) : (
                  <g>
                    <circle cx={cx} cy={ry - 5} r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                    <circle cx={cx} cy={ry - 5} r="3" fill="#86efac" />
                  </g>
                )}
              </g>
            ))}
          </g>
        </g>
      ))}

      {/* The Big Red Barn */}
      <g>
        <ellipse cx="115" cy="-28" rx="84" ry="24" fill="rgba(15, 23, 42, 0.28)" />
        <rect x="42" y="-164" width="146" height="120" rx="8" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2.5" />
        <rect x="42" y="-164" width="28" height="120" rx="8" fill="#991b1b" />
        {[-150, -136, -122, -108, -94, -80, -66].map((ly) => (
          <line key={ly} x1="44" y1={ly} x2="186" y2={ly} stroke="#7f1d1d" strokeWidth="1.5" />
        ))}
        <rect x="48" y="-164" width="9" height="120" fill="#f8fafc" />
        <rect x="171" y="-164" width="9" height="120" fill="#f8fafc" />

        <rect x="80" y="-112" width="68" height="68" rx="4" fill="#7f1d1d" stroke="#f8fafc" strokeWidth="4" />
        <line x1="114" y1="-112" x2="114" y2="-44" stroke="#f8fafc" strokeWidth="3" />
        <path d="M 80 -112 L 114 -44 M 114 -112 L 80 -44" stroke="#f8fafc" strokeWidth="3.5" />
        <path d="M 114 -112 L 148 -44 M 148 -112 L 114 -44" stroke="#f8fafc" strokeWidth="3.5" />
        <ellipse cx="114" cy="-44" rx="14" ry="4" fill="#facc15" />

        <rect x="94" y="-154" width="40" height="34" rx="3" fill="#521515" stroke="#f8fafc" strokeWidth="3" />
        <line x1="114" y1="-154" x2="114" y2="-120" stroke="#f8fafc" strokeWidth="2" />
        <line x1="114" y1="-168" x2="114" y2="-146" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" />
        <circle cx="114" cy="-144" r="3" fill="#ca8a04" />
        <path d="M 98 -134 Q 114 -126 130 -134" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />

        <polygon points="26,-164 202,-164 176,-204 114,-224 52,-204" fill="#831843" stroke="#500724" strokeWidth="2" />
        <polygon points="26,-164 114,-224 52,-204" fill="#701a38" />
        <line x1="52" y1="-204" x2="176" y2="-204" stroke="#f8fafc" strokeWidth="3" />
        <line x1="114" y1="-224" x2="114" y2="-204" stroke="#f8fafc" strokeWidth="3" />

        <rect x="100" y="-242" width="28" height="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="96,-242 132,-242 114,-254" fill="#831843" />
        <line x1="114" y1="-254" x2="114" y2="-270" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="114" cy="-271" r="3" fill="#f59e0b" />
        <path d="M 114 -271 L 122 -273 L 114 -275 Z" fill="#ef4444" />
      </g>

      {/* Stone Wishing Well */}
      <g>
        <ellipse cx="-150" cy="-12" rx="32" ry="14" fill="rgba(15, 23, 42, 0.22)" />
        <rect x="-176" y="-56" width="52" height="42" rx="4" fill="#9ca3af" stroke="#4b5563" strokeWidth="2" />
        <ellipse cx="-150" cy="-56" rx="26" ry="11" fill="#cbd5e1" stroke="#4b5563" strokeWidth="2" />
        <ellipse cx="-150" cy="-56" rx="18" ry="7" fill="#0284c7" />
        <line x1="-172" y1="-56" x2="-172" y2="-102" stroke="#6d472b" strokeWidth="6" strokeLinecap="round" />
        <line x1="-128" y1="-56" x2="-128" y2="-102" stroke="#6d472b" strokeWidth="6" strokeLinecap="round" />
        <polygon points="-186,-100 -114,-100 -150,-126" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
        <line x1="-172" y1="-86" x2="-128" y2="-86" stroke="#ca8a04" strokeWidth="4" />
        <line x1="-150" y1="-86" x2="-150" y2="-68" stroke="#ca8a04" strokeWidth="2.5" />
        <rect x="-156" y="-68" width="12" height="12" rx="2" fill="#78350f" stroke="#ca8a04" strokeWidth="1" />
      </g>

      {/* Scarecrow */}
      <g>
        <line x1="212" y1="-4" x2="212" y2="-68" stroke="#6d472b" strokeWidth="5" strokeLinecap="round" />
        <line x1="192" y1="-54" x2="232" y2="-54" stroke="#6d472b" strokeWidth="5" strokeLinecap="round" />
        <polygon points="198,-54 226,-54 222,-24 202,-24" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
        <circle cx="212" cy="-72" r="11" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
        <ellipse cx="212" cy="-78" rx="17" ry="6" fill="#d97706" />
        <path d="M 203 -78 a 9 10 0 0 1 18 0 Z" fill="#f59e0b" />
      </g>

      {/* Golden Hay Bales */}
      <g>
        <ellipse cx="20" cy="-16" rx="18" ry="12" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
        <line x1="6" y1="-16" x2="34" y2="-16" stroke="#a16207" strokeWidth="2" />
        <ellipse cx="48" cy="-8" rx="16" ry="10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
      </g>

      <Tree x="160" y="36" s="1.05" delay="-1.8" fruit={4} />
      <Tree x="-50" y="42" s="0.8" delay="-3" />
      <Villager x="-30" y="32" dur="11" delay="-4" dx="30" tunic="#16a34a" hat />
      <Sign x="80" y="60" label="Farm" />
    </g>
  );
}

function MarketArt() {
  const pennants = [
    [-156, -135], [-128, -128], [-100, -124], [-72, -122], [-44, -124], [-16, -128], [12, -134]
  ];
  return (
    <g>
      {/* Ground cobblestone square */}
      <ellipse cx="0" cy="4" rx="220" ry="106" fill="rgba(15, 23, 42, 0.18)" />
      <ellipse cx="0" cy="-4" rx="215" ry="100" fill="#edd6b6" />
      <ellipse cx="-10" cy="-12" rx="192" ry="86" fill="#f5e4cd" opacity="0.6" />

      {/* Decorative flagstone pavement rounds */}
      {[-160, -110, -60, -10, 40, 90, 140, 180].map((cx, i) => (
        <ellipse key={cx} cx={cx} cy={i % 2 === 0 ? 24 : 42} rx="16" ry="7" fill="#debfa0" />
      ))}

      {/* Festive Pennant Bunting between stalls */}
      <path d="M -176 -142 Q -80 -105 32 -142" stroke="#6d472b" strokeWidth="3" fill="none" />
      {pennants.map(([px, py], i) => (
        <polygon
          key={i}
          points={`${px},${py} ${px + 18},${py} ${px + 9},${py + 18}`}
          fill={["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316"][i % 7]}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />
      ))}

      {/* LEFT STALL — Fresh Farm Produce */}
      <g>
        <ellipse cx="-110" cy="-30" rx="66" ry="18" fill="rgba(15, 23, 42, 0.25)" />
        <rect x="-172" y="-76" width="124" height="42" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="2.5" />
        <rect x="-168" y="-72" width="116" height="8" rx="2" fill="#ca8a04" />
        <rect x="-168" y="-134" width="8" height="64" fill="#713f12" />
        <rect x="-56" y="-134" width="8" height="64" fill="#713f12" />

        {/* 3D Scalloped Candy-Striped Awning */}
        <g className="anim-sway" style={{ animationDuration: "6s" }}>
          <rect x="-180" y="-134" width="138" height="32" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          {[-158, -136, -114, -92, -70].map((sx) => (
            <rect key={sx} x={sx} y="-134" width="12" height="32" fill="#ffffff" />
          ))}
          {[-180, -157, -134, -111, -88, -65].map((sx) => (
            <circle key={sx} cx={sx + 11} cy="-102" r="7.5" fill="#ef4444" />
          ))}
        </g>

        {/* Produce Crates & Baskets on Counter */}
        <rect x="-164" y="-84" width="34" height="18" rx="3" fill="#854d0e" stroke="#713f12" strokeWidth="1.5" />
        <circle cx="-154" cy="-86" r="6" fill="#ef4444" />
        <circle cx="-142" cy="-88" r="6" fill="#ef4444" />
        <rect x="-124" y="-84" width="34" height="18" rx="3" fill="#854d0e" stroke="#713f12" strokeWidth="1.5" />
        <circle cx="-114" cy="-86" r="6" fill="#f97316" />
        <circle cx="-102" cy="-88" r="6" fill="#f59e0b" />
        <rect x="-84" y="-84" width="34" height="18" rx="3" fill="#854d0e" stroke="#713f12" strokeWidth="1.5" />
        <circle cx="-74" cy="-86" r="6" fill="#22c55e" />
        <circle cx="-62" cy="-88" r="6" fill="#8b5cf6" />
      </g>

      {/* RIGHT STALL — Potions & Wonders */}
      <g>
        <ellipse cx="68" cy="-30" rx="66" ry="18" fill="rgba(15, 23, 42, 0.25)" />
        <rect x="6" y="-76" width="124" height="42" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="2.5" />
        <rect x="10" y="-72" width="116" height="8" rx="2" fill="#ca8a04" />
        <rect x="10" y="-134" width="8" height="64" fill="#713f12" />
        <rect x="122" y="-134" width="8" height="64" fill="#713f12" />

        {/* 3D Scalloped Awning (Emerald & White) */}
        <g className="anim-sway" style={{ animationDuration: "6.8s", animationDelay: "-2s" }}>
          <rect x="-2" y="-134" width="138" height="32" rx="2" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {[-2, 20, 42, 64, 86, 108].map((sx) => (
            <rect key={sx} x={sx} y="-134" width="12" height="32" fill="#ffffff" />
          ))}
          {[-2, 21, 44, 67, 90, 113].map((sx) => (
            <circle key={sx} cx={sx + 11} cy="-102" r="7.5" fill="#10b981" />
          ))}
        </g>

        {/* Potions & Magical Geodes on Shelves */}
        <path d="M 22 -76 C 18 -84, 30 -84, 26 -76 Z" fill="#ef4444" />
        <circle cx="24" cy="-82" r="6" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        <rect x="22" y="-91" width="4" height="5" fill="#ca8a04" />

        <circle cx="48" cy="-82" r="6.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <rect x="46" y="-91" width="4" height="5" fill="#ca8a04" />

        <circle cx="72" cy="-82" r="6.5" fill="#facc15" stroke="#d97706" strokeWidth="1" />
        <rect x="70" y="-91" width="4" height="5" fill="#ca8a04" />

        <polygon points="94,-76 102,-92 110,-76 102,-72" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
      </g>

      {/* Crates & Barrels of Goods */}
      <g>
        <ellipse cx="162" cy="-42" rx="14" ry="24" fill="#a16207" stroke="#713f12" strokeWidth="2" />
        <line x1="148" y1="-50" x2="176" y2="-50" stroke="#475569" strokeWidth="2.5" />
        <line x1="148" y1="-34" x2="176" y2="-34" stroke="#475569" strokeWidth="2.5" />
        <rect x="156" y="-76" width="54" height="34" rx="3" fill="#ca8a04" stroke="#854d0e" strokeWidth="2.5" />
        <line x1="156" y1="-76" x2="210" y2="-42" stroke="#854d0e" strokeWidth="2" />
        <rect x="162" y="-108" width="44" height="32" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
        <circle cx="174" cy="-110" r="6" fill="#22c55e" />
        <circle cx="188" cy="-112" r="6" fill="#ef4444" />
        <circle cx="200" cy="-110" r="6" fill="#f97316" />
      </g>

      {/* Hanging Market Signpost */}
      <g>
        <line x1="192" y1="-4" x2="192" y2="-106" stroke="#6d472b" strokeWidth="7" strokeLinecap="round" />
        <line x1="192" y1="-98" x2="242" y2="-98" stroke="#6d472b" strokeWidth="5" strokeLinecap="round" />
        <line x1="206" y1="-98" x2="206" y2="-112" stroke="#475569" strokeWidth="2" />
        <line x1="234" y1="-98" x2="234" y2="-112" stroke="#475569" strokeWidth="2" />
        <rect x="194" y="-138" width="86" height="38" rx="8" fill="#fef3c7" stroke="#92400e" strokeWidth="3.5" />
        <text x="237" y="-113" textAnchor="middle" fontSize="16" fontWeight="800" fill="#78350f" style={HEADING_FONT}>
          MARKET
        </text>
      </g>

      <Villager x="-30" y="36" dur="8" delay="-1" dx="26" tunic="#7c3aed" />
      <Villager x="60" y="44" dur="9" delay="-5" dx="22" tunic="#f59e0b" hat />
      <circle className="anim-twinkle" cx="212" cy="-106" r="5" fill="#facc15" />
      <circle className="anim-twinkle" cx="228" cy="-50" r="4.5" fill="#facc15" style={{ animationDelay: "-0.9s" }} />
    </g>
  );
}

function MarketingArt() {
  return (
    <g>
      {/* Ground hill base */}
      <ellipse cx="0" cy="4" rx="220" ry="106" fill="rgba(15, 23, 42, 0.18)" />
      <ellipse cx="0" cy="-2" rx="215" ry="102" fill="#d8cfe6" />
      <ellipse cx="-15" cy="-10" rx="192" ry="88" fill="#e8e0f5" opacity="0.6" />

      {/* Decorative paint splashes & stone terrace */}
      <line x1="-196" y1="20" x2="196" y2="20" stroke="#beb2d6" strokeWidth="4" />
      <line x1="-160" y1="-32" x2="160" y2="-32" stroke="#beb2d6" strokeWidth="4" />
      <ellipse cx="-42" cy="28" rx="14" ry="6" fill="#f59e0b" opacity="0.75" />
      <ellipse cx="122" cy="36" rx="12" ry="5" fill="#10b981" opacity="0.75" />
      <ellipse cx="192" cy="12" rx="11" ry="5" fill="#3b82f6" opacity="0.75" />
      <ellipse cx="-120" cy="34" rx="10" ry="4.5" fill="#ec4899" opacity="0.75" />

      {/* Studio Workshop Building */}
      <g>
        <ellipse cx="-60" cy="-28" rx="105" ry="24" fill="rgba(15, 23, 42, 0.28)" />
        <rect x="-164" y="-170" width="194" height="122" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
        <rect x="-174" y="-184" width="214" height="18" rx="7" fill="#db2777" stroke="#be185d" strokeWidth="2" />

        <rect x="-150" y="-154" width="166" height="48" rx="6" fill="#dbeafe" stroke="#ffffff" strokeWidth="4" />
        <line x1="-110" y1="-154" x2="-110" y2="-106" stroke="#ffffff" strokeWidth="3" />
        <line x1="-70" y1="-154" x2="-70" y2="-106" stroke="#ffffff" strokeWidth="3" />
        <line x1="-30" y1="-154" x2="-30" y2="-106" stroke="#ffffff" strokeWidth="3" />
        <rect x="-142" y="-146" width="26" height="32" rx="2" fill="#f43f5e" />
        <circle cx="-129" cy="-132" r="5" fill="#fde047" />

        <rect x="-102" y="-98" width="40" height="50" rx="6" fill="#7c3aed" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="-72" cy="-73" r="3.5" fill="#fde047" />
        <rect x="-50" y="-98" width="62" height="42" rx="6" fill="#e0e7ff" stroke="#ffffff" strokeWidth="4" />
        <polygon points="-38,-68 -24,-90 -10,-68" fill="#db2777" />
      </g>

      {/* Domed Observatory with Telescope */}
      <g>
        <path d="M -156 -184 A 36 36 0 0 1 -84 -184 Z" fill="#d97706" stroke="#92400e" strokeWidth="2.5" />
        <path d="M -146 -184 A 26 26 0 0 1 -94 -184 Z" fill="#f59e0b" />
        <line x1="-120" y1="-184" x2="-120" y2="-220" stroke="#78350f" strokeWidth="5" />
        <line x1="-128" y1="-214" x2="-104" y2="-242" stroke="#ca8a04" strokeWidth="7" strokeLinecap="round" />
        <circle cx="-102" cy="-244" r="5" fill="#38bdf8" />
      </g>

      {/* Broadcast / Creative Antenna */}
      <g>
        <line x1="-40" y1="-184" x2="-40" y2="-268" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <line x1="-58" y1="-248" x2="-22" y2="-248" stroke="#475569" strokeWidth="4" />
        <line x1="-50" y1="-260" x2="-30" y2="-260" stroke="#475569" strokeWidth="4" />
        <circle className="anim-twinkle" cx="-40" cy="-274" r="7" fill="#ef4444" style={{ animationDuration: "1.3s" }} />
      </g>

      {/* Large Creative Billboard Display */}
      <g>
        <rect x="74" y="-92" width="10" height="96" rx="2" fill="#64748b" />
        <rect x="156" y="-92" width="10" height="96" rx="2" fill="#64748b" />
        <rect x="54" y="-246" width="162" height="98" rx="10" fill="#ffffff" stroke="#db2777" strokeWidth="7" />
        <polygon points="90,-182 134,-204 134,-160" fill="#db2777" />
        <rect x="78,-192" width="14" height="20" rx="4" fill="#9d174d" />
        <path d="M 144 -202 q 12 20 0 40" stroke="#f59e0b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M 158 -212 q 18 30 0 60" stroke="#f59e0b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <circle className="anim-twinkle" cx="196" cy="-230" r="5.5" fill="#facc15" />
        <circle className="anim-twinkle" cx="204" cy="-170" r="4.5" fill="#ec4899" style={{ animationDelay: "-0.8s" }} />
      </g>

      {/* Artist's Outdoor Easel with Scenic Painting */}
      <g>
        <line x1="-30" y1="-2" x2="-50" y2="-82" stroke="#6d472b" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="-30" y1="-2" x2="-10" y2="-82" stroke="#6d472b" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="-62" y="-124" width="62" height="48" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
        <polygon points="-60,-80 -40,-104 -20,-80" fill="#3b82f6" />
        <polygon points="-40,-80 -22,-110 -2,-80" fill="#10b981" />
        <circle cx="-50" cy="-110" r="7" fill="#f59e0b" />
      </g>

      <Villager x="30" y="38" dur="10" delay="-3" dx="30" tunic="#ec4899" />
      <Bush x="214" y="12" />
      <Sign x="-160" y="48" label="Studio" />
    </g>
  );
}

export function AgricultureArt() {
  const rows = [-96, -64, -32, 0];
  return (
    <g>
      <ellipse cx="0" cy="-2" rx="212" ry="98" fill="#9ccb6b" />
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
      <g>
        <ellipse cx="100" cy="-14" rx="30" ry="12" fill="rgba(15, 23, 42, 0.15)" />
        <rect x="74" y="-56" width="52" height="42" fill="#c7c1b4" />
        <ellipse cx="100" cy="-56" rx="26" ry="10" fill="#d8d3c6" />
        <ellipse cx="100" cy="-56" rx="16" ry="6" fill="#2c7da0" />
        <line x1="74" y1="-56" x2="74" y2="-96" stroke="#8b5e3c" strokeWidth="5" />
        <line x1="126" y1="-56" x2="126" y2="-96" stroke="#8b5e3c" strokeWidth="5" />
        <polygon points="62,-94 138,-94 100,-118" fill="#c94f3d" />
      </g>
      <Tree x="-60" y="38" s="0.8" delay="-3" />
      <Sign x="-130" y="44" label="Crops" />
    </g>
  );
}

export function AnimalArt() {
  return (
    <g>
      <ellipse cx="0" cy="-2" rx="180" ry="90" fill="#9ccb6b" />
      <g>
        <rect x="-68" y="-152" width="136" height="108" rx="6" fill="#c94f3d" />
        <polygon points="-82,-152 82,-152 0,-202" fill="#8f3a2d" />
        <rect x="-58" y="-152" width="8" height="108" fill="#f8f4e8" />
        <rect x="50" y="-152" width="8" height="108" fill="#f8f4e8" />
        <rect x="-26" y="-106" width="52" height="62" rx="4" fill="#8f3a2d" stroke="#f8f4e8" strokeWidth="4" />
        <path d="M -26 -106 L 26 -44 M 26 -106 L -26 -44" stroke="#f8f4e8" strokeWidth="4" />
        <circle cx="0" cy="-132" r="10" fill="#f8f4e8" />
      </g>
      <g>
        <circle cx="96" cy="-18" r="17" fill="#e9c46a" />
        <path d="M 84 -22 q 12 8 24 0" stroke="#d4a94e" strokeWidth="2.5" fill="none" />
        <circle cx="126" cy="-10" r="14" fill="#efc97e" />
      </g>
      <Tree x="120" y="34" s="1.05" delay="-1.8" />
      <Sign x="-90" y="44" label="Barn" />
    </g>
  );
}

export function ExpArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="160" ry="80" fill="#c4e5a4" />
      <g>
        <rect x="-50" y="-120" width="100" height="80" rx="8" fill="#fffbea" />
        <polygon points="-60,-120 60,-120 0,-160" fill="#3b82f6" />
        <rect x="-20" y="-80" width="40" height="40" rx="4" fill="#f59e0b" />
        <circle cx="10" cy="-60" r="3" fill="#ffffff" />
      </g>
      <g>
        <line x1="-90" y1="-4" x2="-90" y2="-58" stroke="#8b5e3c" strokeWidth="6" />
        <line x1="-54" y1="-4" x2="-54" y2="-58" stroke="#8b5e3c" strokeWidth="6" />
        <rect x="-100" y="-96" width="56" height="42" rx="6" fill="#31424e" stroke="#8b5e3c" strokeWidth="4" />
        <text x="-72" y="-69" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fdf6e3" style={{ fontFamily: "var(--font-heading)" }}>
          EXP ⭐
        </text>
      </g>
      <Tree x="96" y="26" s="0.8" delay="-0.8" />
      <Sign x="-30" y="42" label="Training" />
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

export const FARM_LOCATION_ART = {
  agriculture: AgricultureArt,
  animal: AnimalArt,
  "earn-xp": ExpArt,
};

export function ScienceArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="160" ry="80" fill="#c4e5a4" />
      <g>
        <rect x="-80" y="-140" width="160" height="100" rx="8" fill="#fffbea" />
        <polygon points="-90,-140 90,-140 0,-200" fill="#10b981" />
        <rect x="-30" y="-100" width="60" height="60" rx="6" fill="#047857" />
        <circle cx="15" cy="-70" r="4" fill="#ffffff" />
        {/* Telescope dome */}
        <path d="M -40 -200 A 40 40 0 0 1 40 -200 Z" fill="#d1fae5" />
        <line x1="10" y1="-220" x2="50" y2="-250" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
      </g>
      <Tree x="110" y="26" s="0.85" delay="-1.2" />
      <Sign x="-90" y="42" label="Science" />
    </g>
  );
}

export function MathsArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="160" ry="80" fill="#c4e5a4" />
      <g>
        <rect x="-70" y="-120" width="140" height="80" rx="8" fill="#fffbea" />
        {/* Geometric roof */}
        <polygon points="-80,-120 -40,-180 0,-120" fill="#ef4444" />
        <polygon points="0,-120 40,-180 80,-120" fill="#b91c1c" />
        <rect x="-20" y="-80" width="40" height="40" rx="4" fill="#ef4444" />
        <circle cx="10" cy="-60" r="3" fill="#ffffff" />
        {/* Plus / Minus signs */}
        <text x="-40" y="-130" fill="#fee2e2" fontSize="30" fontWeight="bold">+</text>
        <text x="40" y="-130" fill="#fee2e2" fontSize="30" fontWeight="bold">-</text>
      </g>
      <Tree x="-100" y="10" s="0.75" delay="-2.1" />
      <Sign x="-30" y="52" label="Maths" />
    </g>
  );
}

export function ComputerArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="160" ry="80" fill="#c4e5a4" />
      <g>
        <rect x="-80" y="-110" width="160" height="90" rx="8" fill="#e2e8f0" />
        <polygon points="-90,-110 90,-110 0,-150" fill="#3b82f6" />
        <rect x="-25" y="-80" width="50" height="60" rx="4" fill="#1d4ed8" />
        {/* Monitor */}
        <rect x="-40" y="-190" width="80" height="60" rx="6" fill="#334155" />
        <rect x="-35" y="-185" width="70" height="50" rx="4" fill="#38bdf8" />
        <line x1="0" y1="-130" x2="0" y2="-110" stroke="#334155" strokeWidth="8" />
        <line x1="-20" y1="-110" x2="20" y2="-110" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      </g>
      <Tree x="120" y="10" s="0.9" delay="-0.5" />
      <Sign x="-90" y="42" label="Computer" />
    </g>
  );
}

export function EnglishArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="170" ry="85" fill="#c4e5a4" />
      <g>
        <rect x="-90" y="-130" width="180" height="100" rx="8" fill="#f3e8ff" />
        {/* Book roof */}
        <path d="M -100 -130 Q -50 -180 0 -130 Q 50 -180 100 -130" fill="#8b5cf6" />
        <rect x="-30" y="-90" width="60" height="60" rx="4" fill="#6d28d9" />
        <line x1="-30" y1="-90" x2="-30" y2="-30" stroke="#ffffff" strokeWidth="4" />
        <line x1="30" y1="-90" x2="30" y2="-30" stroke="#ffffff" strokeWidth="4" />
      </g>
      <Bush x="-110" y="20" />
      <Bush x="110" y="20" />
      <Sign x="-40" y="52" label="English" />
    </g>
  );
}

export function FactsArt() {
  return (
    <g>
      <ellipse cx="0" cy="-4" rx="150" ry="75" fill="#c4e5a4" />
      <g>
        <rect x="-60" y="-140" width="120" height="120" rx="60" fill="#fffbeb" />
        <rect x="-40" y="-100" width="80" height="100" fill="#fcd34d" />
        <polygon points="-50,-100 50,-100 0,-150" fill="#f59e0b" />
        <rect x="-20" y="-60" width="40" height="60" rx="4" fill="#b45309" />
        {/* Lightbulb / Exclamation */}
        <circle cx="0" cy="-180" r="25" fill="#fbbf24" className="anim-twinkle" />
        <rect x="-10" y="-155" width="20" height="15" fill="#92400e" />
      </g>
      <Tree x="90" y="30" s="0.75" delay="-1.5" />
      <Sign x="-80" y="42" label="Facts" />
    </g>
  );
}

export const SCHOOL_LOCATION_ART = {
  science: ScienceArt,
  maths: MathsArt,
  computer: ComputerArt,
  english: EnglishArt,
  facts: FactsArt,
};
