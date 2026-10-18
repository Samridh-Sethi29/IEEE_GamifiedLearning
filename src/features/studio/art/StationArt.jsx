// Lightweight inline-SVG scenes for the four stations plus the courtyard decorations.
// All art is decorative (aria-hidden); meaning is carried by the text beside it.
// Spinning/bobbing classes live in studio.css and switch off for reduced motion.

const VB = "0 0 240 150";

function gearPath(cx, cy, outer, inner, teeth) {
  const step = (Math.PI * 2) / teeth;
  const pts = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    [
      [a - 0.2 * step, inner],
      [a - 0.1 * step, outer],
      [a + 0.1 * step, outer],
      [a + 0.2 * step, inner],
    ].forEach(([ang, r]) => pts.push(`${(cx + Math.cos(ang) * r).toFixed(1)} ${(cy + Math.sin(ang) * r).toFixed(1)}`));
  }
  return `M ${pts.join(" L ")} Z`;
}

function Ground({ fill }) {
  return <ellipse cx="120" cy="128" rx="108" ry="17" fill={fill} />;
}

function WorldBuilderArt() {
  return (
    <svg viewBox={VB} className="studio-art" aria-hidden="true" focusable="false">
      <Ground fill="#86efac" />
      <path d="M 14 132 Q 120 106 226 130" stroke="#94a3b8" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M 18 132 Q 120 108 222 130" stroke="#f8fafc" strokeWidth="2" fill="none" strokeDasharray="8 8" />
      {/* red house */}
      <rect x="28" y="76" width="46" height="36" rx="3" fill="#fde68a" />
      <polygon points="22,78 51,54 80,78" fill="#ef4444" />
      <rect x="45" y="92" width="12" height="20" rx="2" fill="#92400e" />
      <rect x="60" y="82" width="7" height="12" fill="#a8a29e" />
      <rect x="34" y="84" width="9" height="9" rx="1" fill="#bae6fd" />
      {/* blue house */}
      <rect x="86" y="88" width="34" height="26" rx="3" fill="#bfdbfe" />
      <polygon points="82,90 103,72 124,90" fill="#3b82f6" />
      <rect x="98" y="99" width="9" height="15" rx="1.5" fill="#1e3a8a" />
      {/* tree */}
      <rect x="146" y="90" width="8" height="26" rx="2" fill="#92400e" />
      <circle cx="150" cy="78" r="20" fill="#22c55e" />
      <circle cx="141" cy="84" r="11" fill="#4ade80" />
      {/* water tank on legs */}
      <line x1="182" y1="88" x2="178" y2="114" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1="206" y1="88" x2="210" y2="114" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1="182" y1="100" x2="206" y2="100" stroke="#475569" strokeWidth="2" />
      <rect x="174" y="58" width="40" height="32" rx="10" fill="#38bdf8" />
      <rect x="174" y="66" width="40" height="4" fill="#0ea5e9" opacity="0.6" />
      <path d="M 194 70 q 7 9 0 15 q -7 -6 0 -15 Z" fill="#fff" opacity="0.9" />
      {/* water infrastructure: canal, pipe run and a stone well */}
      <path d="M 120 118 q 22 -6 44 0 t 60 4" stroke="#38bdf8" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 120 118 q 22 -6 44 0 t 60 4" stroke="#e0f2fe" strokeWidth="2" fill="none" strokeDasharray="6 10" className="studio-flow" />
      <path d="M 194 114 V 120 H 92 V 112" stroke="#64748b" strokeWidth="4" fill="none" strokeLinejoin="round" />
      <circle cx="92" cy="112" r="3.5" fill="#94a3b8" />
      <ellipse cx="128" cy="100" rx="12" ry="5" fill="#94a3b8" />
      <rect x="116" y="92" width="24" height="9" fill="#cbd5e1" />
      <ellipse cx="128" cy="92" rx="12" ry="5" fill="#7dd3fc" />
      <polygon points="114,84 128,74 142,84" fill="#b45309" />
      {/* construction crane */}
      <rect x="6" y="40" width="5" height="52" fill="#f59e0b" />
      <rect x="6" y="40" width="48" height="5" fill="#f59e0b" />
      <line x1="46" y1="45" x2="46" y2="62" stroke="#475569" strokeWidth="1.5" />
      <rect x="40" y="62" width="12" height="8" rx="1" fill="#ef4444" />
      {/* hammer */}
      <g transform="rotate(-28 20 112)">
        <rect x="17" y="96" width="6" height="30" rx="2" fill="#b45309" />
        <rect x="8" y="92" width="24" height="10" rx="3" fill="#64748b" />
      </g>
    </svg>
  );
}

function InventionLabArt() {
  const big = gearPath(150, 66, 34, 27, 10);
  const small = gearPath(198, 92, 21, 16, 8);
  return (
    <svg viewBox={VB} className="studio-art" aria-hidden="true" focusable="false">
      <Ground fill="#fcd34d" />
      {/* blueprint */}
      <rect x="18" y="20" width="92" height="66" rx="5" fill="#1d4ed8" />
      <g stroke="#93c5fd" strokeWidth="1" opacity="0.7">
        {[34, 48, 62, 76].map((y) => (
          <line key={y} x1="22" y1={y} x2="106" y2={y} />
        ))}
        {[36, 54, 72, 90].map((x) => (
          <line key={x} x1={x} y1="24" x2={x} y2="82" />
        ))}
      </g>
      <circle cx="46" cy="54" r="12" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M 46 54 L 84 40 M 46 54 L 84 68" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="80" y="36" width="10" height="8" fill="none" stroke="#fff" strokeWidth="2" />
      {/* lightbulb */}
      <circle cx="132" cy="30" r="12" fill="#fde047" />
      <rect x="127" y="40" width="10" height="7" rx="2" fill="#94a3b8" />
      <path d="M 127 30 q 5 -8 10 0" stroke="#f59e0b" strokeWidth="2" fill="none" />
      {/* gears */}
      <g className="studio-spin" style={{ transformOrigin: "150px 66px" }}>
        <path d={big} fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <circle cx="150" cy="66" r="9" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
      </g>
      <g className="studio-spin studio-spin--rev" style={{ transformOrigin: "198px 92px" }}>
        <path d={small} fill="#fb923c" stroke="#9a3412" strokeWidth="2" />
        <circle cx="198" cy="92" r="6" fill="#ffedd5" stroke="#9a3412" strokeWidth="2" />
      </g>
      {/* workbench */}
      <rect x="14" y="104" width="212" height="12" rx="4" fill="#b45309" />
      <rect x="26" y="114" width="10" height="14" fill="#92400e" />
      <rect x="204" y="114" width="10" height="14" fill="#92400e" />
      {/* pegboard tools */}
      <rect x="114" y="14" width="3" height="3" fill="#78350f" />
      <g stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M 120 78 v 12" />
        <path d="M 126 78 v 12" />
      </g>
      {/* circuit board + battery + bolts on the bench */}
      <rect x="104" y="92" width="42" height="12" rx="2" fill="#16a34a" />
      <rect x="112" y="95" width="9" height="6" fill="#1e293b" />
      <rect x="126" y="95" width="9" height="6" fill="#1e293b" />
      <path d="M 106 98 h 6 M 121 98 h 5 M 135 98 h 9" stroke="#fde68a" strokeWidth="1" />
      <rect x="182" y="94" width="18" height="10" rx="2" fill="#0f172a" />
      <rect x="200" y="97" width="3" height="4" fill="#94a3b8" />
      <rect x="185" y="96" width="6" height="6" fill="#facc15" />
      <circle cx="170" cy="101" r="3" fill="#94a3b8" />
      <circle cx="162" cy="102" r="2.5" fill="#cbd5e1" />
      {/* wrench */}
      <g transform="rotate(-18 70 100)">
        <rect x="52" y="97" width="42" height="6" rx="3" fill="#64748b" />
        <circle cx="52" cy="100" r="7" fill="none" stroke="#64748b" strokeWidth="5" />
      </g>
    </svg>
  );
}

function StoryStudioArt() {
  return (
    <svg viewBox={VB} className="studio-art" aria-hidden="true" focusable="false">
      <Ground fill="#fda4af" />
      {/* storyboard */}
      <rect x="112" y="16" width="112" height="72" rx="5" fill="#fff" stroke="#9f1239" strokeWidth="2.5" />
      <line x1="150" y1="18" x2="150" y2="86" stroke="#9f1239" strokeWidth="2" />
      <line x1="187" y1="18" x2="187" y2="86" stroke="#9f1239" strokeWidth="2" />
      <rect x="115" y="19" width="32" height="66" fill="#fef9c3" />
      <circle cx="131" cy="38" r="7" fill="#f59e0b" />
      <rect x="153" y="21" width="31" height="64" fill="#dbeafe" />
      <circle cx="168" cy="48" r="7" fill="#f8c89b" />
      <rect x="160" y="55" width="16" height="22" rx="5" fill="#3b82f6" />
      <rect x="190" y="21" width="31" height="64" fill="#fce7f3" />
      <path d="M 196 70 q 9 -22 20 0" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* speech bubbles */}
      <g className="studio-bob">
        <path d="M 22 18 h 58 a 10 10 0 0 1 10 10 v 18 a 10 10 0 0 1 -10 10 h -34 l -12 12 v -12 h -12 a 10 10 0 0 1 -10 -10 v -18 a 10 10 0 0 1 10 -10 Z" fill="#fff" stroke="#be123c" strokeWidth="2.5" />
        <circle cx="38" cy="37" r="3.5" fill="#be123c" />
        <circle cx="52" cy="37" r="3.5" fill="#be123c" />
        <circle cx="66" cy="37" r="3.5" fill="#be123c" />
      </g>
      <g className="studio-bob studio-bob--late">
        <ellipse cx="96" cy="68" rx="14" ry="9" fill="#fecdd3" stroke="#be123c" strokeWidth="2" />
        <path d="M 90 75 l -4 7 l 10 -4 Z" fill="#fecdd3" stroke="#be123c" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 91 68 h 10" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* books */}
      <rect x="18" y="104" width="78" height="15" rx="3" fill="#ef4444" />
      <rect x="26" y="90" width="64" height="15" rx="3" fill="#3b82f6" />
      <rect x="20" y="76" width="68" height="15" rx="3" fill="#22c55e" />
      <g stroke="#fff" strokeWidth="2" opacity="0.8">
        <line x1="30" y1="104" x2="30" y2="119" />
        <line x1="36" y1="90" x2="36" y2="105" />
        <line x1="28" y1="76" x2="28" y2="91" />
      </g>
      {/* reading rug + open book + lamp */}
      <ellipse cx="206" cy="120" rx="26" ry="8" fill="#fb7185" opacity="0.6" />
      <path d="M 192 112 l 14 -4 l 14 4 v 8 l -14 -3 l -14 3 Z" fill="#fff" stroke="#9f1239" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="206" y1="108" x2="206" y2="117" stroke="#9f1239" strokeWidth="1.5" />
      <rect x="226" y="62" width="3" height="48" fill="#78350f" />
      <polygon points="218,64 237,64 232,52 223,52" fill="#fde047" />
      {/* little author */}
      <rect x="150" y="104" width="22" height="22" rx="8" fill="#a855f7" />
      <circle cx="161" cy="98" r="11" fill="#f8c89b" />
      <path d="M 150 97 a 11 11 0 0 1 22 0 Z" fill="#5b3a29" />
      <circle cx="157" cy="99" r="1.5" fill="#292524" />
      <circle cx="165" cy="99" r="1.5" fill="#292524" />
    </svg>
  );
}

function DesignStudioArt() {
  return (
    <svg viewBox={VB} className="studio-art" aria-hidden="true" focusable="false">
      <Ground fill="#c4b5fd" />
      {/* easel */}
      <line x1="68" y1="30" x2="38" y2="130" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="30" x2="100" y2="130" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="30" x2="68" y2="120" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      <rect x="40" y="38" width="56" height="50" rx="3" fill="#fff" stroke="#6d28d9" strokeWidth="2.5" />
      <circle cx="58" cy="56" r="9" fill="#f59e0b" />
      <polygon points="52,82 72,52 90,82" fill="#22c55e" />
      <path d="M 44 70 q 10 -8 20 0 t 24 0" stroke="#3b82f6" strokeWidth="3" fill="none" />
      <rect x="36" y="88" width="64" height="6" rx="2" fill="#b45309" />
      {/* poster */}
      <g transform="rotate(5 150 52)">
        <rect x="122" y="14" width="56" height="74" rx="4" fill="#8b5cf6" />
        <polygon points="150,26 154,38 167,38 157,46 161,58 150,51 139,58 143,46 133,38 146,38" fill="#fde047" />
        <rect x="132" y="66" width="36" height="5" rx="2" fill="#fff" />
        <rect x="138" y="75" width="24" height="4" rx="2" fill="#ddd6fe" />
      </g>
      {/* palette */}
      <ellipse cx="160" cy="116" rx="34" ry="19" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
      <ellipse cx="174" cy="120" rx="6" ry="4" fill="#bef264" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="140" cy="110" r="5" fill="#ef4444" />
      <circle cx="152" cy="104" r="5" fill="#3b82f6" />
      <circle cx="166" cy="104" r="5" fill="#22c55e" />
      <circle cx="178" cy="110" r="5" fill="#f97316" />
      {/* product label bottle */}
      <rect x="203" y="82" width="14" height="10" rx="2" fill="#94a3b8" />
      <rect x="196" y="90" width="28" height="38" rx="9" fill="#a7f3d0" />
      <rect x="196" y="100" width="28" height="16" fill="#fff" />
      <path d="M 202 108 h 16" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
      {/* bunting */}
      <path d="M 4 8 Q 120 26 236 8" stroke="#78350f" strokeWidth="1.5" fill="none" />
      {[[24, "#ef4444"], [50, "#f59e0b"], [196, "#ec4899"], [220, "#fde047"]].map(([x, c]) => {
        const t = (x - 4) / 232;
        const y = 8 + 36 * t * (1 - t);
        return <polygon key={x} points={`${x - 7},${y} ${x + 7},${y} ${x},${y + 13}`} fill={c} />;
      })}
      {/* paint jars + swatches */}
      <rect x="104" y="112" width="10" height="12" rx="2" fill="#f43f5e" />
      <rect x="116" y="114" width="10" height="10" rx="2" fill="#0ea5e9" />
      <rect x="4" y="114" width="8" height="12" rx="1" fill="#fde047" stroke="#b45309" strokeWidth="1" />
      <rect x="13" y="114" width="8" height="12" rx="1" fill="#a3e635" stroke="#b45309" strokeWidth="1" />
      {/* brush */}
      <g transform="rotate(32 108 104)">
        <rect x="104" y="86" width="5" height="32" rx="2" fill="#b45309" />
        <rect x="103" y="116" width="7" height="9" rx="2" fill="#ec4899" />
      </g>
    </svg>
  );
}

export const STATION_ART = {
  "world-builder": WorldBuilderArt,
  "invention-lab": InventionLabArt,
  "story-studio": StoryStudioArt,
  "design-studio": DesignStudioArt,
};

// ---- courtyard pieces ----------------------------------------------------------------------

export function Fountain({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" className={`studio-fountain ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="80" cy="92" rx="66" ry="14" fill="#cbd5e1" />
      <ellipse cx="80" cy="88" rx="58" ry="11" fill="#7dd3fc" />
      <rect x="74" y="44" width="12" height="44" rx="4" fill="#94a3b8" />
      <ellipse cx="80" cy="46" rx="26" ry="7" fill="#cbd5e1" />
      <g className="studio-splash">
        <path d="M 80 40 q -22 -26 -34 4" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 80 40 q 22 -26 34 4" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 80 40 V 14" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="10" r="4" fill="#7dd3fc" />
      </g>
    </svg>
  );
}

export function Tree({ className = "" }) {
  return (
    <svg viewBox="0 0 80 100" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="92" rx="26" ry="6" fill="#000" opacity="0.1" />
      <rect x="35" y="56" width="10" height="36" rx="3" fill="#92400e" />
      <circle cx="40" cy="40" r="30" fill="#22c55e" />
      <circle cx="28" cy="48" r="16" fill="#4ade80" />
      <circle cx="54" cy="34" r="12" fill="#16a34a" />
    </svg>
  );
}

export function Bush({ className = "", flower = "#f472b6" }) {
  return (
    <svg viewBox="0 0 80 50" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="44" rx="30" ry="5" fill="#000" opacity="0.1" />
      <circle cx="24" cy="30" r="16" fill="#16a34a" />
      <circle cx="42" cy="26" r="18" fill="#22c55e" />
      <circle cx="58" cy="32" r="14" fill="#4ade80" />
      <circle cx="30" cy="22" r="3" fill={flower} />
      <circle cx="50" cy="18" r="3" fill={flower} />
      <circle cx="60" cy="30" r="3" fill={flower} />
    </svg>
  );
}

export function Cloud({ className = "" }) {
  return (
    <svg viewBox="0 0 120 50" className={`studio-cloud ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="34" rx="50" ry="13" fill="#fff" opacity="0.9" />
      <circle cx="42" cy="26" r="15" fill="#fff" opacity="0.9" />
      <circle cx="68" cy="22" r="19" fill="#fff" opacity="0.9" />
    </svg>
  );
}

// ---- campus decorations ----------------------------------------------------------------------

export function Pond({ className = "" }) {
  return (
    <svg viewBox="0 0 160 80" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="80" cy="44" rx="76" ry="32" fill="#fde68a" />
      <ellipse cx="80" cy="42" rx="68" ry="27" fill="#38bdf8" />
      <ellipse cx="64" cy="36" rx="30" ry="9" fill="#7dd3fc" opacity="0.7" />
      <ellipse cx="108" cy="50" rx="9" ry="4" fill="#4ade80" />
      <ellipse cx="50" cy="52" rx="7" ry="3.5" fill="#22c55e" />
      <circle cx="108" cy="49" r="2" fill="#f9a8d4" />
      <rect x="64" y="22" width="34" height="9" rx="3" fill="#b45309" />
      <g stroke="#78350f" strokeWidth="1.5">
        <line x1="72" y1="22" x2="72" y2="31" />
        <line x1="82" y1="22" x2="82" y2="31" />
        <line x1="92" y1="22" x2="92" y2="31" />
      </g>
    </svg>
  );
}

export function Lamp({ className = "" }) {
  return (
    <svg viewBox="0 0 30 80" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="15" cy="76" rx="9" ry="3" fill="#000" opacity="0.12" />
      <rect x="13" y="22" width="4" height="54" rx="2" fill="#475569" />
      <circle cx="15" cy="16" r="9" fill="#fde047" stroke="#b45309" strokeWidth="2" />
      <rect x="9" y="26" width="12" height="4" rx="1" fill="#475569" />
    </svg>
  );
}

export function Sign({ className = "", label = "STUDIO" }) {
  return (
    <svg viewBox="0 0 150 80" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <rect x="72" y="34" width="6" height="44" rx="2" fill="#a9744f" />
      <rect x="14" y="6" width="122" height="34" rx="10" fill="#f7e7c6" stroke="#b98a5a" strokeWidth="3" />
      <text x="75" y="30" textAnchor="middle" fontSize="19" fontWeight="800" fill="#7c4a1e" style={{ fontFamily: "var(--font-heading)" }}>
        {label}
      </text>
    </svg>
  );
}

export function Flowers({ className = "" }) {
  return (
    <svg viewBox="0 0 90 36" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <rect x="4" y="18" width="82" height="14" rx="5" fill="#b45309" />
      <rect x="4" y="18" width="82" height="5" rx="2" fill="#92400e" />
      {[[16, "#f472b6"], [32, "#fde047"], [48, "#fb7185"], [64, "#c084fc"], [78, "#fde047"]].map(([x, c]) => (
        <g key={x}>
          <line x1={x} y1="20" x2={x} y2="10" stroke="#16a34a" strokeWidth="2" />
          <circle cx={x} cy="8" r="5" fill={c} />
          <circle cx={x} cy="8" r="1.8" fill="#fff7ed" />
        </g>
      ))}
    </svg>
  );
}

export function Bench({ className = "" }) {
  return (
    <svg viewBox="0 0 70 40" className={`studio-decor ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="35" cy="36" rx="28" ry="3" fill="#000" opacity="0.1" />
      <rect x="8" y="10" width="54" height="6" rx="2" fill="#b45309" />
      <rect x="8" y="19" width="54" height="7" rx="2" fill="#d97706" />
      <rect x="12" y="26" width="5" height="10" fill="#475569" />
      <rect x="53" y="26" width="5" height="10" fill="#475569" />
    </svg>
  );
}

// The player's little explorer. Walks to whichever station is selected.
export function Explorer({ className = "" }) {
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="20" cy="52" rx="12" ry="3.5" fill="#000" opacity="0.18" />
      <rect x="11" y="30" width="18" height="18" rx="6" fill="#22a45d" />
      <rect x="13" y="44" width="5" height="8" rx="2" fill="#1e3a8a" />
      <rect x="22" y="44" width="5" height="8" rx="2" fill="#1e3a8a" />
      <circle cx="20" cy="20" r="12" fill="#f8c89b" />
      <path d="M 8 20 a 12 12 0 0 1 24 0 Z" fill="#5b3a29" />
      <circle cx="15.5" cy="22" r="1.8" fill="#292524" />
      <circle cx="24.5" cy="22" r="1.8" fill="#292524" />
      <path d="M 16 27 q 4 3 8 0" stroke="#b4562f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Little villagers, like the ones wandering the village map.
export function Villager({ className = "", shirt = "#3b82f6", hair = "#5b3a29" }) {
  return (
    <svg viewBox="0 0 20 44" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="10" cy="41" rx="7" ry="2.2" fill="#000" opacity="0.15" />
      <rect x="5" y="17" width="10" height="16" rx="4" fill={shirt} />
      <rect x="6" y="31" width="3" height="9" rx="1.5" fill="#475569" />
      <rect x="11" y="31" width="3" height="9" rx="1.5" fill="#475569" />
      <circle cx="10" cy="10" r="7" fill="#f8c89b" />
      <path d="M 3 10 a 7 7 0 0 1 14 0 Z" fill={hair} />
    </svg>
  );
}

export function Birds({ className = "" }) {
  return (
    <svg viewBox="0 0 60 20" className={className} aria-hidden="true" focusable="false">
      <path d="M 4 10 q 5 -7 10 0 q 5 -7 10 0" stroke="#334155" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 34 14 q 4 -5 8 0 q 4 -5 8 0" stroke="#334155" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
