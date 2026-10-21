import { memo } from "react";

// =============================================================================
// BACKGROUND SVGs (16:9 Aspect Ratio: viewBox="0 0 800 450")
// =============================================================================

export function VillageSquareBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Village Square Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="vs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="vs-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="300" fill="url(#vs-sky)" />

      {/* Soft clouds */}
      <ellipse cx="140" cy="80" rx="65" ry="22" fill="#fff" opacity="0.85" />
      <circle cx="120" cy="70" r="28" fill="#fff" opacity="0.85" />
      <circle cx="165" cy="72" r="22" fill="#fff" opacity="0.85" />

      <ellipse cx="640" cy="110" rx="80" ry="26" fill="#fff" opacity="0.8" />
      <circle cx="610" cy="98" r="32" fill="#fff" opacity="0.8" />
      <circle cx="670" cy="102" r="25" fill="#fff" opacity="0.8" />

      {/* Distant Hills */}
      <ellipse cx="250" cy="300" rx="340" ry="85" fill="#86efac" />
      <ellipse cx="620" cy="310" rx="280" ry="75" fill="#4ade80" />

      {/* Village Houses in Background */}
      {/* Yellow Cottage (left) */}
      <rect x="50" y="160" width="130" height="110" rx="4" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
      <polygon points="35,165 115,100 195,165" fill="#ef4444" stroke="#991b1b" strokeWidth="3" />
      <rect x="100" y="205" width="30" height="65" rx="3" fill="#78350f" />
      <circle cx="124" cy="238" r="3" fill="#facc15" />
      <rect x="68" y="180" width="24" height="24" rx="2" fill="#bae6fd" stroke="#475569" strokeWidth="2" />
      <rect x="145" y="180" width="24" height="24" rx="2" fill="#bae6fd" stroke="#475569" strokeWidth="2" />

      {/* Blue Townhouse (center-left) */}
      <rect x="200" y="130" width="110" height="140" rx="4" fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="3" />
      <polygon points="190,135 255,80 320,135" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
      <rect x="240" y="195" width="28" height="75" rx="3" fill="#1e293b" />
      <rect x="220" y="150" width="22" height="25" rx="2" fill="#fef08a" stroke="#334155" strokeWidth="2" />
      <rect x="270" y="150" width="22" height="25" rx="2" fill="#bae6fd" stroke="#334155" strokeWidth="2" />

      {/* Green Cottage (right) */}
      <rect x="620" y="150" width="140" height="120" rx="4" fill="#fed7aa" stroke="#c2410c" strokeWidth="3" />
      <polygon points="605,155 690,95 775,155" fill="#f97316" stroke="#9a3412" strokeWidth="3" />
      <rect x="675" y="195" width="32" height="75" rx="3" fill="#431407" />
      <rect x="640" y="175" width="24" height="24" rx="2" fill="#bae6fd" stroke="#475569" strokeWidth="2" />
      <rect x="720" y="175" width="24" height="24" rx="2" fill="#fef08a" stroke="#475569" strokeWidth="2" />

      {/* Cobblestone Square Ground */}
      <rect x="0" y="270" width="800" height="180" fill="url(#vs-ground)" stroke="#64748b" strokeWidth="2" />

      {/* Cobblestone texture details */}
      <g stroke="#94a3b8" strokeWidth="2" opacity="0.6">
        {[290, 320, 350, 380, 410, 440].map((y) => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} strokeDasharray="14 18" />
        ))}
      </g>

      {/* Village Fountain in Midground */}
      <ellipse cx="460" cy="300" rx="60" ry="16" fill="#64748b" stroke="#334155" strokeWidth="3" />
      <ellipse cx="460" cy="296" rx="52" ry="12" fill="#38bdf8" />
      <rect x="454" y="250" width="12" height="46" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
      <ellipse cx="460" cy="250" rx="22" ry="7" fill="#64748b" />
      {/* Water Spray */}
      <path d="M 460 245 q -18 -22 -28 5" stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 460 245 q 18 -22 28 5" stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="460" cy="225" r="4" fill="#e0f2fe" />

      {/* Lantern Post on Left */}
      <rect x="18" y="240" width="6" height="140" rx="3" fill="#334155" />
      <circle cx="21" cy="235" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" opacity="0.9" />
      <polygon points="12,225 30,225 26,215 16,215" fill="#334155" />
    </svg>
  );
}

export function ClassroomBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Classroom Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="cr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="cr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Wall */}
      <rect width="800" height="320" fill="url(#cr-wall)" />
      <rect x="0" y="316" width="800" height="8" fill="#92400e" />

      {/* Wooden Floor */}
      <rect x="0" y="324" width="800" height="126" fill="url(#cr-floor)" />
      <g stroke="#92400e" strokeWidth="1.5" opacity="0.6">
        {[340, 365, 395, 425].map((y) => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} />
        ))}
      </g>

      {/* Left Window showing daylight */}
      <rect x="30" y="40" width="130" height="190" rx="8" fill="#bae6fd" stroke="#b45309" strokeWidth="6" />
      <line x1="95" y1="40" x2="95" y2="230" stroke="#b45309" strokeWidth="4" />
      <line x1="30" y1="135" x2="160" y2="135" stroke="#b45309" strokeWidth="4" />
      {/* Sun outside window */}
      <circle cx="70" cy="90" r="22" fill="#fde047" opacity="0.8" />

      {/* Giant Blackboard in Center */}
      <rect x="200" y="35" width="400" height="230" rx="10" fill="#0f172a" stroke="#78350f" strokeWidth="10" />
      <rect x="210" y="255" width="380" height="8" rx="2" fill="#a16207" />
      {/* Chalk tray chalks */}
      <rect x="240" y="253" width="18" height="5" rx="1" fill="#fff" />
      <rect x="265" y="253" width="18" height="5" rx="1" fill="#fef08a" />
      <rect x="290" y="253" width="18" height="5" rx="1" fill="#f43f5e" />

      {/* Chalkboard drawings */}
      <text x="400" y="90" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="800" fontFamily="sans-serif">
        ★ SkillVerse Village Academy ★
      </text>
      <text x="240" y="140" fill="#fde047" fontSize="20" fontWeight="700" fontFamily="monospace">
        A B C D E
      </text>
      <text x="240" y="175" fill="#7dd3fc" fontSize="20" fontWeight="700" fontFamily="monospace">
        1 + 2 = 3
      </text>
      <text x="240" y="210" fill="#a7f3d0" fontSize="18" fontWeight="700" fontFamily="monospace">
        Save Our Village!
      </text>
      {/* Science atom doodle */}
      <circle cx="530" cy="170" r="28" fill="none" stroke="#f472b6" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="530" cy="170" r="6" fill="#fde047" />

      {/* Right Bookshelf */}
      <rect x="640" y="45" width="130" height="260" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="5" />
      {[105, 175, 245].map((y) => (
        <line key={y} x1="640" y1={y} x2="770" y2={y} stroke="#451a03" strokeWidth="4" />
      ))}
      {/* Books on Shelves */}
      <rect x="655" y="65" width="14" height="40" rx="2" fill="#ef4444" />
      <rect x="672" y="60" width="16" height="45" rx="2" fill="#3b82f6" />
      <rect x="691" y="68" width="13" height="37" rx="2" fill="#10b981" />
      <rect x="707" y="58" width="18" height="47" rx="2" fill="#f59e0b" />
      <rect x="728" y="63" width="15" height="42" rx="2" fill="#a855f7" />

      <rect x="660" y="135" width="15" height="40" rx="2" fill="#3b82f6" />
      <rect x="678" y="130" width="20" height="45" rx="2" fill="#ec4899" />
      <rect x="701" y="138" width="14" height="37" rx="2" fill="#eab308" />

      {/* Globe on bottom shelf */}
      <circle cx="700" cy="215" r="18" fill="#38bdf8" stroke="#475569" strokeWidth="2" />
      <ellipse cx="700" cy="215" rx="18" ry="7" fill="none" stroke="#16a34a" strokeWidth="2" />
      <rect x="696" y="233" width="8" height="12" fill="#475569" />
      <ellipse cx="700" cy="245" rx="14" ry="4" fill="#334155" />
    </svg>
  );
}

export function FarmFieldBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Farm Field Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="ff-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="ff-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
      </defs>

      {/* Sky & Sun */}
      <rect width="800" height="260" fill="url(#ff-sky)" />
      <circle cx="100" cy="70" r="36" fill="#fde047" stroke="#f59e0b" strokeWidth="3" />

      {/* Distant Mountains */}
      <polygon points="120,260 280,130 440,260" fill="#93c5fd" opacity="0.6" />
      <polygon points="360,260 520,110 680,260" fill="#60a5fa" opacity="0.5" />

      {/* Farm Windmill on Right */}
      <polygon points="650,260 670,140 700,140 720,260" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
      <polygon points="665,140 685,110 705,140" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      <circle cx="685" cy="140" r="7" fill="#78350f" />
      {/* Windmill sails */}
      <line x1="685" y1="140" x2="685" y2="70" stroke="#78350f" strokeWidth="4" />
      <line x1="685" y1="140" x2="685" y2="210" stroke="#78350f" strokeWidth="4" />
      <line x1="685" y1="140" x2="615" y2="140" stroke="#78350f" strokeWidth="4" />
      <line x1="685" y1="140" x2="755" y2="140" stroke="#78350f" strokeWidth="4" />

      {/* Rolling Farm Hills */}
      <ellipse cx="250" cy="270" rx="380" ry="70" fill="#a3e635" />
      <ellipse cx="600" cy="280" rx="320" ry="60" fill="#65a30d" />

      {/* Crop Ground */}
      <rect x="0" y="270" width="800" height="180" fill="url(#ff-ground)" />

      {/* Crop rows & plants */}
      <g fill="#15803d">
        {[295, 335, 375, 415].map((y) => (
          <g key={y}>
            <ellipse cx="120" cy={y} rx="18" ry="9" />
            <ellipse cx="220" cy={y} rx="18" ry="9" />
            <ellipse cx="320" cy={y} rx="18" ry="9" />
            <ellipse cx="420" cy={y} rx="18" ry="9" />
            <ellipse cx="520" cy={y} rx="18" ry="9" />
            <ellipse cx="620" cy={y} rx="18" ry="9" />
            <ellipse cx="720" cy={y} rx="18" ry="9" />
          </g>
        ))}
      </g>

      {/* Wooden Fence */}
      <line x1="0" y1="268" x2="560" y2="268" stroke="#92400e" strokeWidth="4" />
      {[30, 90, 150, 210, 270, 330, 390, 450, 510].map((x) => (
        <rect key={x} x={x} y="250" width="8" height="30" rx="2" fill="#78350f" />
      ))}
    </svg>
  );
}

export function WaterWellBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Water Well Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="ww-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="280" fill="url(#ww-sky)" />

      {/* Big Oak Tree on Left */}
      <rect x="70" y="160" width="40" height="150" rx="8" fill="#78350f" />
      <circle cx="90" cy="120" r="75" fill="#15803d" />
      <circle cx="140" cy="140" r="55" fill="#16a34a" />
      <circle cx="50" cy="130" r="50" fill="#22c55e" />

      {/* Grassy Meadow Ground */}
      <rect x="0" y="270" width="800" height="180" fill="#4ade80" />
      <ellipse cx="400" cy="270" rx="420" ry="40" fill="#86efac" />

      {/* Stone Pathway */}
      <path d="M 400 450 L 370 290 L 430 290 Z" fill="#cbd5e1" opacity="0.8" />

      {/* The Historic Stone Well in Center */}
      <rect x="340" y="230" width="120" height="70" rx="8" fill="#64748b" stroke="#334155" strokeWidth="4" />
      <ellipse cx="400" cy="230" rx="60" ry="18" fill="#94a3b8" stroke="#334155" strokeWidth="4" />
      <ellipse cx="400" cy="230" rx="46" ry="13" fill="#0284c7" />
      {/* Stone pattern on well */}
      <g stroke="#334155" strokeWidth="2">
        <line x1="365" y1="245" x2="365" y2="280" />
        <line x1="400" y1="245" x2="400" y2="280" />
        <line x1="435" y1="245" x2="435" y2="280" />
        <line x1="340" y1="262" x2="460" y2="262" />
      </g>

      {/* Well Wooden Posts and Roof */}
      <rect x="350" y="130" width="10" height="105" rx="2" fill="#78350f" />
      <rect x="440" y="130" width="10" height="105" rx="2" fill="#78350f" />
      <line x1="355" y1="160" x2="445" y2="160" stroke="#78350f" strokeWidth="6" />
      {/* Pulley & Rope & Bucket */}
      <circle cx="400" cy="160" r="9" fill="#ca8a04" stroke="#78350f" strokeWidth="2" />
      <line x1="400" y1="169" x2="400" y2="215" stroke="#fde047" strokeWidth="2" strokeDasharray="3 2" />
      <rect x="390" y="215" width="20" height="16" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="2" />

      {/* Well Roof */}
      <polygon points="330,135 400,80 470,135" fill="#ef4444" stroke="#991b1b" strokeWidth="4" />

      {/* Water canal leading away */}
      <path d="M 455 285 Q 560 300 700 290" stroke="#38bdf8" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 455 285 Q 560 300 700 290" stroke="#e0f2fe" strokeWidth="3" fill="none" strokeDasharray="6 8" />
    </svg>
  );
}

export function CozyCottageBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Cozy Cottage Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="cc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="cc-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Wall */}
      <rect width="800" height="310" fill="url(#cc-wall)" />
      <rect x="0" y="306" width="800" height="8" fill="#451a03" />

      {/* Floor */}
      <rect x="0" y="314" width="800" height="136" fill="url(#cc-floor)" />

      {/* Cozy Rose Rug */}
      <ellipse cx="400" cy="380" rx="190" ry="46" fill="#f43f5e" stroke="#be123c" strokeWidth="3" />
      <ellipse cx="400" cy="380" rx="160" ry="36" fill="#ffe4e6" stroke="#fb7185" strokeWidth="2" strokeDasharray="6 4" />

      {/* Stone Fireplace on Left */}
      <rect x="40" y="70" width="160" height="240" rx="6" fill="#64748b" stroke="#334155" strokeWidth="4" />
      <rect x="30" y="60" width="180" height="18" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
      {/* Hearth opening */}
      <path d="M 70 310 V 190 Q 120 160 170 190 V 310 Z" fill="#0f172a" />
      {/* Fire flame */}
      <ellipse cx="120" cy="275" rx="28" ry="16" fill="#f59e0b" />
      <path d="M 100 275 Q 120 210 120 210 Q 120 210 140 275 Z" fill="#ef4444" />
      <path d="M 110 275 Q 120 230 120 230 Q 120 230 130 275 Z" fill="#fde047" />

      {/* Mantle Clock & Tea Pot */}
      <circle cx="120" cy="50" r="16" fill="#fde047" stroke="#b45309" strokeWidth="2" />
      <rect x="65" y="45" width="20" height="15" rx="3" fill="#3b82f6" />

      {/* Wooden Dining Table on Right */}
      <rect x="580" y="240" width="180" height="18" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />
      <rect x="600" y="258" width="12" height="70" rx="2" fill="#78350f" />
      <rect x="728" y="258" width="12" height="70" rx="2" fill="#78350f" />
      {/* Teacup & Fresh Loaf on Table */}
      <ellipse cx="630" cy="235" rx="9" ry="5" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="700" cy="232" rx="22" ry="10" fill="#d97706" />

      {/* Warm Lamp Sconce on Wall */}
      <circle cx="400" cy="110" r="24" fill="#fef08a" opacity="0.6" />
      <polygon points="388,125 412,125 406,105 394,105" fill="#f59e0b" />
      <rect x="398" y="125" width="4" height="20" fill="#78350f" />
    </svg>
  );
}

export function StarryNightBackdrop() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="story-backdrop-svg"
      aria-label="Starry Night Background"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="340" fill="url(#sn-sky)" />

      {/* Crescent Moon */}
      <g transform="translate(680, 80)">
        <circle cx="0" cy="0" r="32" fill="#fde047" />
        <circle cx="-10" cy="-6" r="28" fill="#090d16" />
      </g>

      {/* Twinkling Stars */}
      {[
        [80, 50], [140, 90], [220, 40], [290, 110], [360, 60],
        [430, 95], [500, 45], [570, 85], [630, 40], [740, 120],
        [50, 140], [180, 160], [310, 170], [450, 160], [580, 180]
      ].map(([x, y], idx) => (
        <g key={idx} transform={`translate(${x}, ${y})`}>
          <circle cx="0" cy="0" r="2.5" fill="#fff" opacity="0.9" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
        </g>
      ))}

      {/* Distant Hills in Twilight */}
      <ellipse cx="260" cy="340" rx="360" ry="70" fill="#1e293b" />
      <ellipse cx="640" cy="350" rx="290" ry="60" fill="#0f172a" />

      {/* Village Silhouettes */}
      <polygon points="120,330 160,260 200,330" fill="#0f172a" />
      <rect x="140" y="290" width="12" height="14" rx="2" fill="#fde047" opacity="0.8" />

      <polygon points="260,330 310,240 360,330" fill="#020617" />
      <rect x="295" y="275" width="14" height="16" rx="2" fill="#fde047" opacity="0.9" />

      {/* Dark Cobblestone Path & Ground */}
      <rect x="0" y="330" width="800" height="120" fill="#090d16" />

      {/* Glowing Lantern by Path */}
      <rect x="420" y="320" width="5" height="90" rx="2" fill="#334155" />
      <circle cx="422" cy="315" r="14" fill="#fef08a" opacity="0.9" />
      <polygon points="414,306 430,306 426,298 418,298" fill="#475569" />
    </svg>
  );
}

export function StoryBackdrop({ background = "village-square", className = "" }) {
  switch (background) {
    case "school-classroom":
      return <ClassroomBackdrop />;
    case "farm-field":
      return <FarmFieldBackdrop />;
    case "water-well":
      return <WaterWellBackdrop />;
    case "cozy-cottage":
      return <CozyCottageBackdrop />;
    case "starry-night":
      return <StarryNightBackdrop />;
    case "village-square":
    default:
      return <VillageSquareBackdrop />;
  }
}

// =============================================================================
// CHARACTER SVG ILLUSTRATIONS (viewBox="0 0 120 180")
// =============================================================================

function CharacterFace({ expression = "happy" }) {
  switch (expression) {
    case "thoughtful":
      return (
        <g>
          {/* Eyebrows: one raised */}
          <path d="M 50 48 q 5 -5 10 0" stroke="#451a03" strokeWidth="2" fill="none" />
          <path d="M 68 45 q 5 -8 10 -2" stroke="#451a03" strokeWidth="2" fill="none" />
          {/* Eyes looking up */}
          <circle cx="56" cy="54" r="3" fill="#1c1917" />
          <circle cx="72" cy="54" r="3" fill="#1c1917" />
          {/* Thoughtful mouth */}
          <line x1="58" y1="68" x2="68" y2="67" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "surprised":
      return (
        <g>
          {/* High arched brows */}
          <path d="M 49 46 q 6 -8 12 0" stroke="#451a03" strokeWidth="2" fill="none" />
          <path d="M 67 46 q 6 -8 12 0" stroke="#451a03" strokeWidth="2" fill="none" />
          {/* Big open eyes */}
          <circle cx="55" cy="55" r="4.5" fill="#1c1917" />
          <circle cx="73" cy="55" r="4.5" fill="#1c1917" />
          <circle cx="56" cy="53" r="1.5" fill="#fff" />
          <circle cx="74" cy="53" r="1.5" fill="#fff" />
          {/* Open 'O' mouth */}
          <ellipse cx="64" cy="69" rx="5" ry="6" fill="#9a3412" />
        </g>
      );
    case "worried":
      return (
        <g>
          {/* Angled worried brows */}
          <line x1="50" y1="46" x2="60" y2="50" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="78" y1="46" x2="68" y2="50" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
          {/* Concerned eyes */}
          <circle cx="55" cy="56" r="3" fill="#1c1917" />
          <circle cx="73" cy="56" r="3" fill="#1c1917" />
          {/* Wavy mouth */}
          <path d="M 58 69 q 6 -4 12 0" stroke="#9a3412" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "determined":
      return (
        <g>
          {/* Focused angled brows */}
          <line x1="49" y1="49" x2="60" y2="46" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="79" y1="49" x2="68" y2="46" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sharp confident eyes */}
          <circle cx="55" cy="55" r="3.2" fill="#1c1917" />
          <circle cx="73" cy="55" r="3.2" fill="#1c1917" />
          {/* Firm smile */}
          <path d="M 57 67 q 7 3 14 -2" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "happy":
    default:
      return (
        <g>
          {/* Gentle happy brows */}
          <path d="M 50 48 q 5 -4 10 0" stroke="#451a03" strokeWidth="2" fill="none" />
          <path d="M 68 48 q 5 -4 10 0" stroke="#451a03" strokeWidth="2" fill="none" />
          {/* Cheerful eyes */}
          <circle cx="55" cy="55" r="3" fill="#1c1917" />
          <circle cx="73" cy="55" r="3" fill="#1c1917" />
          <circle cx="56" cy="53.5" r="1" fill="#fff" />
          <circle cx="74" cy="53.5" r="1" fill="#fff" />
          {/* Wide smile */}
          <path d="M 56 65 q 8 8 16 0" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <circle cx="49" cy="62" r="3.5" fill="#fda4af" opacity="0.6" />
          <circle cx="79" cy="62" r="3.5" fill="#fda4af" opacity="0.6" />
        </g>
      );
  }
}

export function MayaArt({ expression = "happy" }) {
  return (
    <svg viewBox="0 0 120 180" className="story-char-svg" aria-label="Maya">
      <ellipse cx="60" cy="172" rx="28" ry="6" fill="#000" opacity="0.18" />
      {/* Boots */}
      <rect x="44" y="148" width="12" height="22" rx="4" fill="#78350f" />
      <rect x="64" y="148" width="12" height="22" rx="4" fill="#78350f" />
      {/* Explorer trousers */}
      <rect x="44" y="115" width="13" height="36" rx="3" fill="#1e3a8a" />
      <rect x="63" y="115" width="13" height="36" rx="3" fill="#1e3a8a" />
      {/* Rose Tunic */}
      <path d="M 36 82 L 84 82 L 88 122 L 32 122 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
      <rect x="36" y="114" width="48" height="6" fill="#be123c" />
      {/* Explorer Satchel */}
      <path d="M 38 84 L 78 126" stroke="#b45309" strokeWidth="4" />
      <rect x="74" y="116" width="16" height="14" rx="3" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      {/* Arms */}
      <rect x="26" y="86" width="11" height="32" rx="4" fill="#f43f5e" />
      <circle cx="31" cy="120" r="5" fill="#f8c89b" />
      <rect x="83" y="86" width="11" height="32" rx="4" fill="#f43f5e" />
      <circle cx="89" cy="120" r="5" fill="#f8c89b" />
      {/* Neck */}
      <rect x="54" y="70" width="12" height="16" fill="#f8c89b" />
      {/* Head */}
      <circle cx="64" cy="58" r="22" fill="#f8c89b" />
      {/* Dark wavy hair */}
      <path d="M 42 58 Q 42 28 64 28 Q 86 28 86 58 Q 88 75 80 82 Q 74 62 64 62 Q 54 62 48 82 Q 42 75 42 58 Z" fill="#451a03" />
      {/* Explorer Bandana */}
      <path d="M 42 45 Q 64 40 86 45" stroke="#facc15" strokeWidth="5" fill="none" />
      <circle cx="84" cy="46" r="3" fill="#f59e0b" />
      {/* Face */}
      <CharacterFace expression={expression} />
    </svg>
  );
}

export function TariqArt({ expression = "happy" }) {
  return (
    <svg viewBox="0 0 120 180" className="story-char-svg" aria-label="Tariq">
      <ellipse cx="60" cy="172" rx="28" ry="6" fill="#000" opacity="0.18" />
      {/* Heavy Work Boots */}
      <rect x="42" y="148" width="14" height="22" rx="4" fill="#451a03" />
      <rect x="64" y="148" width="14" height="22" rx="4" fill="#451a03" />
      {/* Farmer Overalls */}
      <rect x="43" y="112" width="14" height="40" rx="3" fill="#2563eb" />
      <rect x="63" y="112" width="14" height="40" rx="3" fill="#2563eb" />
      <rect x="36" y="86" width="48" height="32" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
      {/* Overall Straps & Buttons */}
      <rect x="44" y="80" width="6" height="22" fill="#1d4ed8" />
      <rect x="70" y="80" width="6" height="22" fill="#1d4ed8" />
      <circle cx="47" cy="94" r="2.5" fill="#facc15" />
      <circle cx="73" cy="94" r="2.5" fill="#facc15" />
      {/* Yellow/Orange shirt underneath */}
      <rect x="32" y="80" width="56" height="18" fill="#f59e0b" />
      {/* Arms */}
      <rect x="23" y="84" width="12" height="34" rx="4" fill="#f59e0b" />
      <circle cx="29" cy="120" r="5" fill="#e0a97a" />
      <rect x="85" y="84" width="12" height="34" rx="4" fill="#f59e0b" />
      <circle cx="91" cy="120" r="5" fill="#e0a97a" />
      {/* Head */}
      <rect x="54" y="68" width="12" height="16" fill="#e0a97a" />
      <circle cx="64" cy="56" r="21" fill="#e0a97a" />
      {/* Dark Hair */}
      <path d="M 43 54 a 21 21 0 0 1 42 0 Z" fill="#1c1917" />
      {/* Farmer Straw Hat */}
      <ellipse cx="64" cy="38" rx="36" ry="10" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <path d="M 44 38 a 20 16 0 0 1 40 0 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
      <rect x="44" y="34" width="40" height="5" fill="#15803d" />
      {/* Face */}
      <CharacterFace expression={expression} />
    </svg>
  );
}

export function ElderSamiraArt({ expression = "happy" }) {
  return (
    <svg viewBox="0 0 120 180" className="story-char-svg" aria-label="Elder Samira">
      <ellipse cx="60" cy="172" rx="30" ry="6" fill="#000" opacity="0.18" />
      {/* Purple Elder Robe */}
      <path d="M 32 82 Q 60 76 88 82 L 96 168 L 24 168 Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2.5" />
      {/* Gold Trim & Shawl */}
      <path d="M 32 82 L 60 125 L 88 82" stroke="#facc15" strokeWidth="5" fill="none" />
      <rect x="57" y="125" width="6" height="42" fill="#facc15" />
      {/* Sleeves */}
      <rect x="18" y="86" width="16" height="40" rx="5" fill="#6d28d9" />
      <circle cx="26" cy="128" r="5" fill="#d49b6a" />
      <rect x="86" y="86" width="16" height="40" rx="5" fill="#6d28d9" />
      <circle cx="94" cy="128" r="5" fill="#d49b6a" />
      {/* Head */}
      <rect x="54" y="68" width="12" height="16" fill="#d49b6a" />
      <circle cx="64" cy="56" r="20" fill="#d49b6a" />
      {/* Silver Hair Bun */}
      <circle cx="64" cy="24" r="14" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M 44 54 a 20 20 0 0 1 40 0 Z" fill="#e2e8f0" />
      {/* Spectacles */}
      <circle cx="56" cy="55" r="6" fill="none" stroke="#d97706" strokeWidth="2" />
      <circle cx="72" cy="55" r="6" fill="none" stroke="#d97706" strokeWidth="2" />
      <line x1="62" y1="55" x2="66" y2="55" stroke="#d97706" strokeWidth="2" />
      {/* Face */}
      <CharacterFace expression={expression} />
    </svg>
  );
}

export function DrLeoArt({ expression = "happy" }) {
  return (
    <svg viewBox="0 0 120 180" className="story-char-svg" aria-label="Dr. Leo">
      <ellipse cx="60" cy="172" rx="28" ry="6" fill="#000" opacity="0.18" />
      {/* Shoes */}
      <rect x="42" y="150" width="14" height="20" rx="3" fill="#1e293b" />
      <rect x="64" y="150" width="14" height="20" rx="3" fill="#1e293b" />
      {/* Teal Engineer Coat */}
      <path d="M 34 82 L 86 82 L 92 148 L 28 148 Z" fill="#0d9488" stroke="#115e59" strokeWidth="2" />
      <rect x="58" y="82" width="4" height="66" fill="#042f2e" />
      {/* Coat Pocket with wrench doodle */}
      <rect x="70" y="105" width="14" height="14" rx="2" fill="#115e59" />
      <line x1="77" y1="98" x2="77" y2="108" stroke="#94a3b8" strokeWidth="3" />
      {/* Sleeves */}
      <rect x="22" y="84" width="14" height="34" rx="4" fill="#0f766e" />
      <circle cx="29" cy="120" r="5" fill="#fed7aa" />
      <rect x="84" y="84" width="14" height="34" rx="4" fill="#0f766e" />
      <circle cx="91" cy="120" r="5" fill="#fed7aa" />
      {/* Head */}
      <rect x="54" y="68" width="12" height="16" fill="#fed7aa" />
      <circle cx="64" cy="56" r="21" fill="#fed7aa" />
      {/* Messy Auburn Hair */}
      <path d="M 40 50 Q 42 22 64 24 Q 86 22 88 50 Q 76 34 64 36 Q 52 34 40 50 Z" fill="#b45309" />
      {/* Brass Inventor Goggles on Forehead */}
      <rect x="46" y="38" width="36" height="5" fill="#451a03" />
      <circle cx="53" cy="40" r="8" fill="#fde047" stroke="#b45309" strokeWidth="2.5" />
      <circle cx="75" cy="40" r="8" fill="#fde047" stroke="#b45309" strokeWidth="2.5" />
      {/* Face */}
      <CharacterFace expression={expression} />
    </svg>
  );
}

export function PipArt({ expression = "happy" }) {
  return (
    <svg viewBox="0 0 120 180" className="story-char-svg" aria-label="Pip the Cat">
      <ellipse cx="60" cy="168" rx="28" ry="6" fill="#000" opacity="0.18" />
      {/* Orange Tabby Body */}
      <ellipse cx="60" cy="130" rx="24" ry="32" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      {/* Cream Chest */}
      <ellipse cx="60" cy="134" rx="14" ry="20" fill="#ffedd5" />
      {/* Paws */}
      <ellipse cx="48" cy="162" rx="8" ry="5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
      <ellipse cx="72" cy="162" rx="8" ry="5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
      {/* Curled Tail */}
      <path d="M 80 145 Q 105 130 95 105 Q 85 90 95 85" stroke="#ea580c" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Red Collar with Golden Bell */}
      <path d="M 44 94 Q 60 102 76 94" stroke="#ef4444" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="100" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="60" cy="74" r="24" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      {/* Pointy Ears */}
      <polygon points="40,62 34,36 54,54" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      <polygon points="41,60 38,42 51,55" fill="#fda4af" />
      <polygon points="80,62 86,36 66,54" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      <polygon points="79,60 82,42 69,55" fill="#fda4af" />
      {/* Cat Eyes */}
      <ellipse cx="50" cy="72" rx="4" ry="5" fill="#22c55e" />
      <ellipse cx="50" cy="72" rx="1.5" ry="4" fill="#052e16" />
      <ellipse cx="70" cy="72" rx="4" ry="5" fill="#22c55e" />
      <ellipse cx="70" cy="72" rx="1.5" ry="4" fill="#052e16" />
      {/* Pink Nose & Whiskers */}
      <polygon points="57,80 63,80 60,84" fill="#f43f5e" />
      <path d="M 56 86 q 4 4 8 0" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
      <line x1="32" y1="78" x2="48" y2="81" stroke="#fff" strokeWidth="1.5" />
      <line x1="32" y1="85" x2="48" y2="84" stroke="#fff" strokeWidth="1.5" />
      <line x1="88" y1="78" x2="72" y2="81" stroke="#fff" strokeWidth="1.5" />
      <line x1="88" y1="85" x2="72" y2="84" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function StoryCharacter({
  characterId = "maya",
  expression = "happy",
  facing = "right",
  className = "",
}) {
  const isFlipped = facing === "left";
  const flipStyle = isFlipped ? { transform: "scaleX(-1)" } : undefined;

  let Art = MayaArt;
  switch (characterId) {
    case "tariq":
      Art = TariqArt;
      break;
    case "elder-samira":
      Art = ElderSamiraArt;
      break;
    case "dr-leo":
      Art = DrLeoArt;
      break;
    case "pip":
      Art = PipArt;
      break;
    case "maya":
    default:
      Art = MayaArt;
      break;
  }

  return (
    <div
      className={`story-character-wrapper ${className}`}
      style={flipStyle}
      data-testid={`story-character-${characterId}`}
      data-facing={facing}
      data-expression={expression}
    >
      <Art expression={expression} />
    </div>
  );
}

// =============================================================================
// PROPS SVGs
// =============================================================================

export function StoryProp({ propId, className = "" }) {
  switch (propId) {
    case "water-bucket":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Water Bucket">
          <ellipse cx="20" cy="12" rx="14" ry="4" fill="#38bdf8" />
          <path d="M 6 12 L 10 34 L 30 34 L 34 12 Z" fill="#92400e" stroke="#78350f" strokeWidth="2" />
          <path d="M 6 12 Q 20 2 34 12" stroke="#475569" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case "ancient-book":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Storybook">
          <rect x="6" y="8" width="28" height="24" rx="3" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
          <line x1="20" y1="8" x2="20" y2="32" stroke="#fff" strokeWidth="2" />
          <rect x="10" y="14" width="7" height="12" rx="1" fill="#fef08a" />
        </svg>
      );
    case "harvest-basket":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Harvest Basket">
          <path d="M 6 18 Q 20 4 34 18" stroke="#78350f" strokeWidth="2.5" fill="none" />
          <path d="M 4 18 L 8 36 L 32 36 L 36 18 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
          <circle cx="16" cy="18" r="6" fill="#ef4444" />
          <circle cx="24" cy="17" r="6" fill="#f97316" />
        </svg>
      );
    case "lantern":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Glowing Lantern">
          <ellipse cx="20" cy="22" rx="10" ry="14" fill="#fef08a" opacity="0.9" />
          <rect x="12" y="10" width="16" height="4" rx="2" fill="#334155" />
          <rect x="12" y="32" width="16" height="4" rx="2" fill="#334155" />
          <path d="M 14 10 Q 20 2 26 10" stroke="#334155" strokeWidth="2" fill="none" />
        </svg>
      );
    case "seed-packet":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Seed Packet">
          <rect x="8" y="6" width="24" height="28" rx="3" fill="#15803d" stroke="#14532d" strokeWidth="2" />
          <circle cx="20" cy="18" r="6" fill="#fde047" />
          <path d="M 20 18 L 20 26" stroke="#16a34a" strokeWidth="2" />
        </svg>
      );
    case "magnifying-glass":
      return (
        <svg viewBox="0 0 40 40" className={`story-prop-svg ${className}`} aria-label="Magnifying Glass">
          <circle cx="16" cy="16" r="11" fill="#bae6fd" stroke="#475569" strokeWidth="3" opacity="0.8" />
          <line x1="24" y1="24" x2="36" y2="36" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
