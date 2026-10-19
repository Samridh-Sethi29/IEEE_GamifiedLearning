import { PAL } from "../palette.js";
import { Banner, Bush, Kid, Lamp, Pine, S, S1, Tree } from "./parts.jsx";

// Creative Core: a glass-domed idea greenhouse. Drawn in a 440 x 520 local box.
export function CoreArt() {
  const ribs = [0.42, 0.78, 1];
  return (
    <g>
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={PAL.sunPale} stopOpacity=".95" />
          <stop offset="0.5" stopColor={PAL.sun} stopOpacity=".38" />
          <stop offset="1" stopColor={PAL.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="core-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.envLight} stopOpacity=".62" />
          <stop offset="1" stopColor={PAL.envLight} stopOpacity=".42" />
        </linearGradient>
      </defs>
      {/* stone steps */}
      <ellipse cx="220" cy="486" rx="216" ry="40" fill={PAL.pathEdge} {...S} />
      <ellipse cx="220" cy="474" rx="198" ry="34" fill={PAL.plaza} {...S1} />
      <ellipse cx="220" cy="462" rx="178" ry="28" fill={PAL.cream} {...S1} />
      {/* drum wall */}
      <path d="M 52 330 V 436 Q 220 482 388 436 V 330 Z" fill={PAL.surface2} {...S} />
      {[70, 100, 130, 160, 190, 250, 280, 310, 340, 370].map((x) => <path key={x} d={`M ${x} 336 V ${450 - Math.abs(x - 220) * 0.06}`} stroke={PAL.inkSoft} strokeWidth="2" />)}
      <path d="M 186 452 V 396 Q 220 362 254 396 V 452 Z" fill={PAL.wood} {...S1} />
      <path d="M 196 452 V 400 Q 220 374 244 400 V 452 Z" fill={PAL.sunSoft} className="studio-glow" />
      <path d="M 186 452 V 396 Q 220 362 254 396" fill="none" stroke={PAL.ink} strokeWidth="4" />
      {[78, 126, 292, 340].map((x) => <rect key={x} x={x} y="352" width="26" height="30" rx="13" fill={PAL.sunSoft} {...S1} className="studio-glow" />)}
      {/* dome */}
      <path d="M 46 332 A 174 190 0 0 1 394 332 Z" fill="url(#core-glass)" />
      <circle cx="220" cy="248" r="104" fill="url(#core-glow)" className="studio-glow" />
      {/* plants inside */}
      <Bush x="96" y="324" s="1.4" /><Bush x="344" y="324" s="1.4" /><Tree x="132" y="326" s="1" /><Tree x="310" y="326" s="1" c={PAL.emerald} />
      {/* bulb */}
      <g className="studio-glow">
        <circle cx="220" cy="244" r="40" fill={PAL.sun} {...S} />
        <ellipse cx="206" cy="230" rx="12" ry="16" fill={PAL.surface} opacity=".85" />
        <path d="M 206 262 Q 214 238 220 252 Q 226 238 234 262" fill="none" stroke={PAL.amberDeep} strokeWidth="3" />
        <rect x="204" y="282" width="32" height="20" rx="4" fill={PAL.slateLight} {...S1} />
      </g>
      <g className="studio-orbit"><ellipse cx="220" cy="248" rx="86" ry="26" fill="none" stroke={PAL.water} strokeWidth="5" transform="rotate(24 220 248)" /></g>
      <g className="studio-orbit studio-orbit--rev"><ellipse cx="220" cy="248" rx="86" ry="26" fill="none" stroke={PAL.pinkSoft} strokeWidth="5" transform="rotate(-24 220 248)" /></g>
      {/* glass frame */}
      <g fill="none" stroke={PAL.slate} strokeWidth="3">
        {ribs.map((k) => <path key={k} d={`M 220 142 Q ${220 - 150 * k} 214 ${220 - 174 * k} 332`} />)}
        {ribs.map((k) => <path key={`r${k}`} d={`M 220 142 Q ${220 + 150 * k} 214 ${220 + 174 * k} 332`} />)}
        <path d="M 64 290 Q 220 262 376 290 M 96 232 Q 220 206 344 232 M 140 184 Q 220 166 300 184" />
        <path d="M 46 332 A 174 190 0 0 1 394 332" strokeWidth="5" />
      </g>
      <rect x="40" y="326" width="360" height="12" rx="5" fill={PAL.wood} {...S1} />
      <rect x="214" y="124" width="12" height="22" fill={PAL.orange} {...S1} /><circle cx="220" cy="120" r="7" fill={PAL.sun} {...S1} />
      {/* ribbon: the guiding loop */}
      <g transform="translate(10 70)" className="studio-core-ribbon">
        <path d="M 0 6 H 420 L 404 22 L 420 38 H 0 L 16 22 Z" fill={PAL.purple} {...S} />
        <path d="M 10 10 H 410 M 10 34 H 410" stroke={PAL.sun} strokeWidth="2" />
        <text x="210" y="29" textAnchor="middle" className="studio-ribbon-text">IMAGINE · BUILD · TEST · IMPROVE</text>
      </g>
      {/* sign: same signboard style as the village map */}
      <g transform="translate(96 396)">
        <rect x="3" y="5" width="248" height="46" rx="10" fill={PAL.shadow} />
        <rect width="248" height="46" rx="10" fill={PAL.surface2} {...S} />
        <rect x="6" y="6" width="236" height="34" rx="6" fill="none" stroke={PAL.line} strokeWidth="1.5" strokeDasharray="2 5" />
        <text x="124" y="31" textAnchor="middle" className="studio-core-text">CREATIVE CORE</text>
      </g>
      <Banner x="40" y="440" c={PAL.blue} mark="gear" s="1.15" /><Banner x="400" y="440" c={PAL.pink} mark="book" s="1.15" />
      <Lamp x="18" y="486" s=".9" /><Lamp x="422" y="486" s=".9" />
      <Pine x="14" y="318" s=".9" /><Pine x="428" y="318" s=".9" />
      <Kid x="150" y="500" shirt={PAL.blue} bob s=".95" /><Kid x="292" y="496" shirt={PAL.success} s=".95" /><Kid x="220" y="470" shirt="#ef4444" bob s=".85" />
    </g>
  );
}
