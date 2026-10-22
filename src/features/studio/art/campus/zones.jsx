import { PAL } from "../palette.js";
import { Banner, Bush, Crate, Gear, Icons, Kid, Lamp, Pine, Plate, Platform, S, S1, Steps, Tree } from "./parts.jsx";

// Each zone is drawn in a 480 x 340 local box and placed/scaled by the scene layout.

const House = ({ x, y, wall = PAL.surface, roof = PAL.coral, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cy="9" rx="22" ry="5" fill={PAL.shadow} />
    <rect x="-16" y="-14" width="32" height="22" fill={wall} {...S1} />
    <polygon points="-21,-14 0,-33 21,-14" fill={roof} {...S1} />
    <rect x="-4" y="-3" width="8" height="11" fill={PAL.wood} />
    <rect x="7" y="-9" width="6" height="6" fill={PAL.envLight} />
  </g>
);

const Table = ({ x, y, w, top = PAL.woodLight }) => (
  <g>
    <rect x={x + 8} y={y + 18} width="7" height="30" fill={PAL.ink} />
    <rect x={x + w - 15} y={y + 18} width="7" height="30" fill={PAL.ink} />
    <polygon points={`${x},${y + 18} ${x + 14},${y} ${x + w + 14},${y} ${x + w},${y + 18}`} fill={top} {...S1} />
    <rect x={x} y={y + 18} width={w} height="9" fill={PAL.wood} {...S1} />
  </g>
);

export function WorldBuilderZone({ accent, deep }) {
  return (
    <g>
      {/* blueprint boards */}
      <g transform="translate(4 14) rotate(-4)">
        <rect width="124" height="92" rx="4" fill={PAL.blue} {...S} />
        {[22, 44, 66].map((y) => <path key={y} d={`M 6 ${y} H 118`} stroke="rgba(255,255,255,.25)" />)}
        <path d="M 30 70 V 44 L 62 22 L 94 44 V 70 Z M 50 70 V 54 H 74 V 70" fill="none" stroke={PAL.envLight} strokeWidth="2.5" />
      </g>
      <g transform="translate(92 6) rotate(5)">
        <rect width="86" height="70" rx="4" fill={PAL.surface} {...S} />
        <path d="M 10 50 L 36 20 L 60 46 M 18 28 H 70" fill="none" stroke={PAL.slate} strokeWidth="2" />
      </g>
      {/* crane */}
      <g stroke={PAL.amberDeep} strokeWidth="2" fill="none">
        <path d="M 196 100 V 6 M 212 100 V 6 M 196 100 L 212 80 L 196 60 L 212 40 L 196 20 L 212 6" stroke={PAL.sun} strokeWidth="4" />
        <path d="M 170 6 H 330 M 170 14 H 330 M 190 6 L 210 -6 L 290 6" stroke={PAL.sun} strokeWidth="4" />
        <path d="M 300 14 V 52" stroke={PAL.ink} strokeWidth="2" />
      </g>
      <rect x="292" y="52" width="16" height="12" fill={PAL.woodLight} {...S1} />
      {/* village board */}
      <Platform x="150" y="50" w="326" h="190" top={PAL.groundDark} side={PAL.leaf} />
      <path d="M 170 190 H 450 M 300 70 V 220" stroke={PAL.path} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 170 190 H 450 M 300 70 V 220" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeDasharray="8 8" fill="none" />
      <path d="M 170 120 C 220 100 240 150 300 140 S 400 120 466 150" stroke={PAL.waterDeep} strokeWidth="13" fill="none" className="studio-flow" />
      <path d="M 170 120 C 220 100 240 150 300 140 S 400 120 466 150" stroke={PAL.envLight} strokeWidth="3" fill="none" strokeDasharray="6 12" className="studio-flow" />
      <rect x="170" y="70" width="64" height="38" rx="4" fill={PAL.wood} opacity=".75" />
      {[0, 1, 2].map((i) => <path key={i} d={`M 176 ${78 + i * 11} H 228`} stroke={PAL.leaf} strokeWidth="5" />)}
      <House x="340" y="100" roof={PAL.coral} />
      <House x="398" y="92" roof={PAL.blue} wall={PAL.surface} s=".9" />
      <House x="352" y="176" roof={PAL.coral} s=".95" />
      <House x="226" y="170" roof={PAL.orange} wall={PAL.surface2} s=".9" />
      <House x="424" y="170" roof={PAL.coral} s=".85" />
      {/* water tower */}
      <g transform="translate(262 112)">
        <path d="M -14 0 L -18 -34 M 14 0 L 18 -34 M -16 -16 H 16" stroke={PAL.ink} strokeWidth="3" />
        <ellipse cy="-46" rx="22" ry="20" fill={PAL.water} {...S1} />
        <polygon points="-22,-54 0,-76 22,-54" fill={PAL.blue} {...S1} />
        <path d="M 0 0 V 18" stroke={PAL.waterDeep} strokeWidth="5" />
      </g>
      {/* well */}
      <g transform="translate(212 128)"><ellipse rx="12" ry="6" fill={PAL.plazaEdge} {...S1} /><rect x="-12" y="-9" width="24" height="9" fill={PAL.plaza} {...S1} /><path d="M -12 -9 V -26 M 12 -9 V -26 M -15 -26 H 15" stroke={PAL.ink} strokeWidth="3" /></g>
      {[[190, 222], [455, 100], [452, 214], [326, 70], [240, 70]].map(([x, y]) => <Tree key={`${x}${y}`} x={x} y={y} s=".7" />)}
      {[[374, 128], [286, 214], [182, 150]].map(([x, y]) => <Pine key={`${x}${y}`} x={x} y={y} s=".55" />)}
      <Bush x="326" y="222" s=".8" />
      {/* work deck */}
      <Platform x="0" y="168" w="296" h="108" depth="20" top={PAL.path} side={PAL.woodLight} />
      <g transform="translate(14 206)">
        <rect width="86" height="14" rx="7" fill={PAL.surface} {...S1} /><rect x="6" y="3" width="74" height="3" fill={PAL.plaza} />
      </g>
      <Crate x="118" y="204" /><Crate x="150" y="216" w="22" h="20" c={PAL.woodLight} />
      <g transform="translate(206 220)"><rect x="-4" y="-8" width="8" height="26" rx="2" transform="rotate(40)" fill={PAL.wood} {...S1} /><rect x="-13" y="-12" width="22" height="9" rx="2" transform="rotate(40)" fill={PAL.slateLight} {...S1} /></g>
      <g transform="translate(246 190)"><path d="M 0 0 L -8 46 M 22 0 L 30 46" stroke={PAL.wood} strokeWidth="5" /><path d="M 2 12 H 22 M 0 26 H 26 M -3 40 H 30" stroke={PAL.wood} strokeWidth="4" /></g>
      <Kid x="140" y="206" shirt={PAL.emerald} bob s=".9" />
      <Plate x="8" y="274" w="300" label="WORLD BUILDER" icon={Icons.hammer} accent={accent} deep={deep} />
    </g>
  );
}

export function InventionLabZone({ accent, deep }) {
  return (
    <g>
      <Platform x="0" y="112" w="480" h="176" top={PAL.path} side={PAL.woodLight} />
      {[40, 120, 200, 280, 360, 440].map((x) => <path key={x} d={`M ${x} 130 V 262`} stroke={PAL.inkSoft} strokeWidth="2" />)}
      {/* robot arm */}
      <g>
        <rect x="26" y="120" width="76" height="22" rx="6" fill={PAL.blue} {...S} />
        <path d="M 64 124 V 70 L 112 36" stroke={PAL.sun} strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 64 124 V 70 L 112 36" stroke={S.stroke} strokeWidth="2" fill="none" opacity=".35" />
        <circle cx="64" cy="70" r="11" fill={PAL.amberDeep} {...S1} /><circle cx="112" cy="36" r="9" fill={PAL.amberDeep} {...S1} />
        <path d="M 112 36 l 16 8 M 112 36 l 8 18" stroke={PAL.ink} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* workshop building */}
      <g transform="translate(150 14)">
        <rect x="0" y="48" width="320" height="120" rx="6" fill={PAL.blue} {...S} />
        <path d="M -6 52 Q 160 -50 326 52 Z" fill={PAL.orange} {...S} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={30 + i * 24} cy={42 - Math.sin((i / 11) * Math.PI) * 36} r="3" fill={PAL.gold} />)}
        {[24, 84, 204].map((x) => <g key={x}><rect x={x} y="84" width="44" height="34" rx="4" fill={PAL.sunSoft} {...S1} className="studio-glow" /><path d={`M ${x + 22} 84 V 118 M ${x} 101 H ${x + 44}`} stroke={S.stroke} strokeWidth="2" /></g>)}
        <path d="M 138 168 V 118 Q 160 92 182 118 V 168 Z" fill={PAL.ink} {...S1} />
        <path d="M 148 168 V 124 Q 160 108 172 124 V 168 Z" fill={PAL.sun} opacity=".75" className="studio-glow" />
        <path d="M 14 70 V 18 H 70" fill="none" stroke={PAL.orange} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 14 70 V 18 H 70" fill="none" stroke={PAL.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="232" y="-26" width="40" height="76" rx="18" fill={PAL.envLight} opacity=".85" {...S} />
        <rect x="243" y="-16" width="18" height="56" rx="9" fill={PAL.envLight} className="studio-glow" />
        <rect x="228" y="-34" width="48" height="12" rx="4" fill={PAL.orange} {...S1} /><rect x="228" y="44" width="48" height="12" rx="4" fill={PAL.orange} {...S1} />
        <Gear x="290" y="116" r="30" teeth="12" c={PAL.orange} spin />
      </g>
      {/* benches */}
      <Table x="14" y="178" w="150" top={PAL.woodLight} />
      <rect x="30" y="170" width="46" height="26" rx="3" fill={PAL.slateDark} {...S1} /><rect x="35" y="175" width="36" height="16" fill={PAL.water} opacity=".8" />
      <rect x="96" y="176" width="42" height="14" fill={PAL.success} {...S1} /><path d="M 100 183 H 134 M 104 180 V 188 M 118 180 V 188" stroke={PAL.sunSoft} strokeWidth="2" />
      <Table x="236" y="190" w="216" top={PAL.woodLight} />
      <rect x="250" y="182" width="52" height="14" rx="2" fill={PAL.surface} {...S1} /><path d="M 256 189 H 296" stroke={PAL.slate} strokeWidth="2" />
      <g transform="translate(330 168)"><rect width="40" height="30" rx="4" fill={PAL.orange} {...S1} /><circle cx="12" cy="15" r="7" fill={PAL.surface} {...S1} /><circle cx="29" cy="15" r="5" fill={PAL.blue} /><path d="M 20 0 V -14 M 10 -14 H 30" stroke={S.stroke} strokeWidth="3" /></g>
      <Gear x="402" y="188" r="14" teeth="8" c={PAL.slateLight} />
      <Gear x="426" y="180" r="9" teeth="8" c={PAL.orange} />
      <Kid x="196" y="214" shirt={PAL.rose} bob s=".95" />
      <Lamp x="470" y="196" s=".7" />
      <Banner x="8" y="108" c={PAL.orange} mark="gear" s=".8" />
      <Plate x="172" y="276" w="300" label="INVENTION LAB" icon={Icons.gear} accent={accent} deep={deep} />
    </g>
  );
}

export function StoryStudioZone({ accent, deep }) {
  return (
    <g>
      <Platform x="0" y="64" w="480" h="206" top={PAL.coralLight} side={PAL.coral} />
      <path d="M 14 100 H 466 M 14 160 H 466 M 14 220 H 466" stroke={PAL.inkSoft} strokeWidth="2" />
      {/* character sketches */}
      {[[6, 18], [58, 66]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i ? 4 : -4})`}>
          <rect width="84" height="78" rx="3" fill={PAL.surface} {...S} />
          <circle cx="26" cy="26" r="8" fill="none" stroke={PAL.slate} strokeWidth="2" /><path d="M 26 34 V 58 M 14 44 H 38 M 26 58 L 16 70 M 26 58 L 36 70" stroke={PAL.slate} strokeWidth="2" fill="none" />
          <circle cx="60" cy="30" r="7" fill="none" stroke={PAL.violet} strokeWidth="2" /><path d="M 60 37 V 58 M 50 46 H 70" stroke={PAL.violet} strokeWidth="2" fill="none" />
        </g>
      ))}
      {/* theatre */}
      <g transform="translate(112 0)">
        <rect x="0" y="12" width="250" height="176" rx="22" fill={PAL.violet} {...S} />
        <path d="M 14 188 V 60 Q 14 22 125 22 Q 236 22 236 60 V 188" fill={PAL.purple} />
        <path d="M 6 188 V 52 Q 6 6 125 6 Q 244 6 244 52 V 188 H 214 Q 200 110 190 64 Q 180 30 125 28 Q 70 30 60 64 Q 50 110 36 188 Z" fill={PAL.rose} {...S} />
        <path d="M 6 52 Q 6 6 125 6 Q 244 6 244 52" fill="none" stroke={PAL.sun} strokeWidth="6" />
        {[62, 150, 188].map((x, i) => <polygon key={x} transform={`translate(${x} ${i === 1 ? 20 : 34})`} points="0,-12 3.5,-4 12,-3 6,3 8,12 0,7 -8,12 -6,3 -12,-3 -3.5,-4" fill={PAL.sun} {...S1} className="studio-glow" />)}
        <g transform="translate(124 78)"><path d="M -34 -20 H 34 Q 40 -20 40 -14 V 12 Q 40 18 34 18 H 6 L -8 32 L -8 18 H -34 Q -40 18 -40 12 V -14 Q -40 -20 -34 -20 Z" fill="#fff" {...S} /><circle cx="-14" cy="-1" r="3.5" fill={PAL.slate} /><circle cx="0" cy="-1" r="3.5" fill={PAL.slate} /><circle cx="14" cy="-1" r="3.5" fill={PAL.slate} /></g>
        <rect x="26" y="150" width="198" height="40" rx="4" fill={PAL.wood} {...S1} />
      </g>
      {/* giant open book */}
      <g transform="translate(86 150)">
        <path d="M 0 40 L 110 18 L 110 112 L 0 134 Z" fill={PAL.surface} {...S} />
        <path d="M 220 40 L 110 18 L 110 112 L 220 134 Z" fill={PAL.surface} {...S} />
        <path d="M 6 46 L 106 26 M 6 56 L 106 36" stroke="rgba(0,0,0,.08)" strokeWidth="3" />
        {[[14, 50], [64, 38], [14, 92], [64, 80]].map(([x, y], i) => <rect key={i} x={x} y={y} width="40" height="34" transform={`skewY(-10)`} fill={[PAL.skin, PAL.envLight, PAL.violetPale, PAL.groundDetail][i]} stroke={PAL.ink} strokeWidth="1.5" style={{ transformOrigin: "0 0" }} />)}
        <path d="M 126 36 L 206 52 M 126 50 L 206 66 M 126 64 L 190 78 M 126 78 L 200 94" stroke={PAL.line} strokeWidth="2.5" />
        <path d="M 110 18 V 112" stroke={PAL.coralDeep} strokeWidth="5" />
        <path d="M -4 134 L 110 112 L 224 134 L 224 144 L 110 124 L -4 144 Z" fill={PAL.coralDeep} {...S1} />
      </g>
      {/* quill + inkwell */}
      <path d="M 336 188 Q 372 150 392 132 Q 388 164 346 204 Z" fill={PAL.surface} {...S1} /><path d="M 336 188 L 350 214" stroke={PAL.ink} strokeWidth="3" />
      <rect x="352" y="206" width="16" height="14" rx="3" fill={PAL.slateDark} {...S1} />
      {/* bookshelf */}
      <g transform="translate(388 40)">
        <rect width="86" height="148" rx="4" fill={PAL.wood} {...S} />
        {[34, 70, 106].map((y) => <rect key={y} x="5" y={y} width="76" height="4" fill={PAL.ink} />)}
        {[[PAL.rose, 8], ["#3b82f6", 22], ["#facc15", 34], ["#22c55e", 50], [PAL.violet, 62]].map(([c, x], i) => <rect key={i} x={x} y={i % 2 ? 12 : 8} width="11" height={i % 2 ? 22 : 26} fill={c} {...S1} />)}
        {[[PAL.orange, 8], [PAL.teal, 24], ["#ec4899", 40], [PAL.leafLight, 56]].map(([c, x], i) => <rect key={i} x={x} y="46" width="13" height="24" fill={c} {...S1} />)}
        <circle cx="42" cy="132" r="9" fill={PAL.sun} {...S1} />
      </g>
      {/* typewriter desk */}
      <rect x="300" y="226" width="68" height="18" rx="3" fill={PAL.slate} {...S1} /><rect x="312" y="212" width="44" height="16" fill={PAL.surface} {...S1} />
      <Kid x="62" y="232" shirt="#8b5cf6" bob s=".95" />
      <Kid x="410" y="246" shirt={PAL.rose} s=".9" />
      <Lamp x="14" y="248" s=".7" />
      <Banner x="454" y="60" c={PAL.violet} mark="bulb" s=".7" />
      <Plate x="8" y="276" w="300" label="STORY STUDIO" icon={Icons.book} accent={accent} deep={deep} />
    </g>
  );
}

export function DesignAtelierZone({ accent, deep }) {
  return (
    <g>
      <Platform x="0" y="64" w="480" h="206" top={PAL.surface} side={PAL.violet} />
      <ellipse cx="116" cy="228" rx="92" ry="26" fill={PAL.teal} opacity=".85" {...S1} />
      <ellipse cx="116" cy="228" rx="70" ry="18" fill="none" stroke={PAL.surface} strokeWidth="3" strokeDasharray="6 6" />
      {/* posters */}
      <g transform="translate(250 6) rotate(-2)">
        <rect width="96" height="132" rx="4" fill={PAL.coral} {...S} />
        <text x="48" y="28" textAnchor="middle" className="studio-poster-text" fill={PAL.surface}>IDEAS</text>
        <circle cx="48" cy="72" r="20" fill={PAL.sunSoft} {...S1} className="studio-glow" /><rect x="42" y="90" width="12" height="9" fill={PAL.slateLight} {...S1} /><path d="M 28 112 H 68" stroke={PAL.surface} strokeWidth="3" />
      </g>
      <g transform="translate(362 20) rotate(3)">
        <rect width="104" height="124" rx="4" fill={PAL.surface} {...S} />
        <text x="52" y="28" textAnchor="middle" className="studio-poster-text" fill={PAL.purpleDeep}>CREATE</text>
        {["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6"].map((c, i) => <path key={c} d={`M ${18 + i * 4} 100 A ${34 - i * 4} ${34 - i * 4} 0 0 1 ${86 - i * 4} 100`} fill="none" stroke={c} strokeWidth="4" />)}
      </g>
      {/* easel + canvas */}
      <g transform="translate(40 10)">
        <path d="M 60 150 L 30 206 M 60 150 L 90 206 M 60 150 V 214" stroke={PAL.wood} strokeWidth="6" strokeLinecap="round" />
        <rect x="14" y="14" width="92" height="76" rx="3" fill={PAL.envLight} {...S} />
        <path d="M 14 70 Q 40 44 66 66 T 106 58 V 90 H 14 Z" fill={PAL.groundDark} /><circle cx="84" cy="32" r="9" fill={PAL.sun} />
        <path d="M 14 78 Q 50 72 106 82" stroke={PAL.pinkSoft} strokeWidth="4" fill="none" />
        <rect x="8" y="90" width="104" height="9" rx="2" fill={PAL.wood} {...S1} />
      </g>
      {/* pencil cup */}
      <g transform="translate(176 96)">
        {[["#ef4444", -14, -70], ["#3b82f6", -2, -86], ["#facc15", 10, -64], ["#22c55e", 2, -50]].map(([c, x, h], i) => <g key={i}><rect x={x} y={h} width="9" height={-h + 4} fill={c} {...S1} /><polygon points={`${x},${h} ${x + 9},${h} ${x + 4.5},${h - 10}`} fill={PAL.skin} {...S1} /></g>)}
        <rect x="-22" y="0" width="44" height="52" rx="6" fill="#ec4899" {...S} /><rect x="-22" y="12" width="44" height="8" fill={PAL.pinkPale} />
      </g>
      {/* tote + design boards */}
      <g transform="translate(228 76)"><path d="M -12 0 V -10 Q 0 -22 12 -10 V 0" fill="none" stroke={PAL.wood} strokeWidth="3" /><rect x="-26" y="0" width="52" height="58" rx="4" fill={PAL.surface} {...S1} /><path d="M 0 40 Q -14 24 0 12 Q 14 24 0 40 Z" fill={PAL.leaf} /></g>
      <g transform="translate(300 156)"><rect width="56" height="38" rx="3" fill="#fff" {...S1} /><rect x="6" y="6" width="20" height="26" fill={PAL.envLight} /><rect x="30" y="6" width="20" height="12" fill={PAL.skin} /><rect x="30" y="21" width="20" height="11" fill={PAL.violetPale} /></g>
      {/* worktable */}
      <Table x="290" y="204" w="170" top={PAL.woodLight} />
      <ellipse cx="338" cy="204" rx="26" ry="9" fill={PAL.surface} {...S1} />{[["#ef4444", 326], ["#3b82f6", 337], ["#22c55e", 348], ["#facc15", 332]].map(([c, x], i) => <circle key={i} cx={x} cy={i === 3 ? 207 : 202} r="3.6" fill={c} />)}
      <ellipse cx="420" cy="206" rx="24" ry="8" fill={PAL.surface} {...S1} /><path d="M 392 198 L 448 184 M 398 204 L 452 194" stroke={PAL.wood} strokeWidth="4" strokeLinecap="round" />
      <g transform="translate(386 232)"><rect x="-10" width="20" height="8" rx="3" fill="#8b5cf6" {...S1} /><path d="M -7 8 V 28 M 7 8 V 28" stroke={PAL.ink} strokeWidth="4" /></g>
      <Kid x="150" y="252" shirt="#f59e0b" bob s=".95" />
      <Banner x="14" y="100" c={PAL.violet} mark="bulb" s=".8" />
      <Bush x="460" y="258" s=".8" /><Lamp x="456" y="250" s=".6" />
      <Plate x="172" y="276" w="300" label="DESIGN ATELIER" icon={Icons.palette} accent={accent} deep={deep} />
    </g>
  );
}
