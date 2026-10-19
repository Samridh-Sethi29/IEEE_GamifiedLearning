import { Banner, Bush, Kid, Lamp, Pine, S, S1, Tree } from "./parts.jsx";

// Creative Core: a glass-domed idea greenhouse. Drawn in a 440 x 520 local box.
export function CoreArt() {
  const ribs = [0.42, 0.78, 1];
  return (
    <g>
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3a8" stopOpacity=".95" />
          <stop offset="0.5" stopColor="#ffd23f" stopOpacity=".38" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="core-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f1ff" stopOpacity=".62" />
          <stop offset="1" stopColor="#8fd0e8" stopOpacity=".42" />
        </linearGradient>
      </defs>
      {/* stone steps */}
      <ellipse cx="220" cy="486" rx="216" ry="40" fill="#8b8574" {...S} />
      <ellipse cx="220" cy="474" rx="198" ry="34" fill="#b9b2a0" {...S1} />
      <ellipse cx="220" cy="462" rx="178" ry="28" fill="#d3ccb9" {...S1} />
      {/* drum wall */}
      <path d="M 52 330 V 436 Q 220 482 388 436 V 330 Z" fill="#8a5a2b" {...S} />
      {[70, 100, 130, 160, 190, 250, 280, 310, 340, 370].map((x) => <path key={x} d={`M ${x} 336 V ${450 - Math.abs(x - 220) * 0.06}`} stroke="rgba(50,25,8,.3)" strokeWidth="2" />)}
      <path d="M 186 452 V 396 Q 220 362 254 396 V 452 Z" fill="#ffcf6b" {...S1} className="studio-glow" />
      <path d="M 186 452 V 396 Q 220 362 254 396" fill="none" stroke="#5a3a1c" strokeWidth="5" />
      {[78, 126, 292, 340].map((x) => <rect key={x} x={x} y="352" width="26" height="30" rx="13" fill="#ffd36b" {...S1} className="studio-glow" />)}
      {/* dome */}
      <path d="M 46 332 A 174 190 0 0 1 394 332 Z" fill="url(#core-glass)" />
      <circle cx="220" cy="248" r="104" fill="url(#core-glow)" className="studio-glow" />
      {/* plants inside */}
      <Bush x="96" y="324" s="1.4" /><Bush x="344" y="324" s="1.4" /><Tree x="132" y="326" s="1" /><Tree x="310" y="326" s="1" c="#2b8a5a" />
      {/* bulb */}
      <g className="studio-glow">
        <circle cx="220" cy="244" r="40" fill="#ffe66b" {...S} />
        <ellipse cx="206" cy="230" rx="12" ry="16" fill="#fffbe0" opacity=".85" />
        <path d="M 206 262 Q 214 238 220 252 Q 226 238 234 262" fill="none" stroke="#e08a00" strokeWidth="3" />
        <rect x="204" y="282" width="32" height="20" rx="4" fill="#9aa4b2" {...S1} />
      </g>
      <g className="studio-orbit"><ellipse cx="220" cy="248" rx="86" ry="26" fill="none" stroke="#4ad1ff" strokeWidth="5" transform="rotate(24 220 248)" /></g>
      <g className="studio-orbit studio-orbit--rev"><ellipse cx="220" cy="248" rx="86" ry="26" fill="none" stroke="#ff5ec8" strokeWidth="5" transform="rotate(-24 220 248)" /></g>
      {/* glass frame */}
      <g fill="none" stroke="#2f3b4a" strokeWidth="3">
        {ribs.map((k) => <path key={k} d={`M 220 142 Q ${220 - 150 * k} 214 ${220 - 174 * k} 332`} />)}
        {ribs.map((k) => <path key={`r${k}`} d={`M 220 142 Q ${220 + 150 * k} 214 ${220 + 174 * k} 332`} />)}
        <path d="M 64 290 Q 220 262 376 290 M 96 232 Q 220 206 344 232 M 140 184 Q 220 166 300 184" />
        <path d="M 46 332 A 174 190 0 0 1 394 332" strokeWidth="5" />
      </g>
      <rect x="40" y="326" width="360" height="12" rx="5" fill="#4a3320" {...S1} />
      <rect x="214" y="124" width="12" height="22" fill="#c98a2b" {...S1} /><circle cx="220" cy="120" r="7" fill="#ffd23f" {...S1} />
      {/* ribbon: the guiding loop */}
      <g transform="translate(10 70)" className="studio-core-ribbon">
        <path d="M 0 6 H 420 L 404 22 L 420 38 H 0 L 16 22 Z" fill="#5b3fc4" {...S} />
        <path d="M 10 10 H 410 M 10 34 H 410" stroke="#ffd23f" strokeWidth="2" />
        <text x="210" y="29" textAnchor="middle" className="studio-ribbon-text">IMAGINE · BUILD · TEST · IMPROVE</text>
      </g>
      {/* sign */}
      <g transform="translate(96 396)">
        <rect x="4" y="6" width="248" height="46" rx="6" fill="rgba(0,0,0,.35)" />
        <rect width="248" height="46" rx="6" fill="#4a3320" {...S} /><rect x="5" y="5" width="238" height="36" rx="4" fill="#2c1f14" stroke="#ffd23f" strokeWidth="2.5" />
        <text x="124" y="31" textAnchor="middle" className="studio-core-text">CREATIVE CORE</text>
      </g>
      <Banner x="40" y="440" c="#2f6fb7" mark="gear" s="1.15" /><Banner x="400" y="440" c="#d6336c" mark="book" s="1.15" />
      <Lamp x="18" y="486" s=".9" /><Lamp x="422" y="486" s=".9" />
      <Pine x="14" y="318" s=".9" /><Pine x="428" y="318" s=".9" />
      <Kid x="150" y="500" shirt="#2563eb" bob s=".95" /><Kid x="292" y="496" shirt="#16a34a" s=".95" /><Kid x="220" y="470" shirt="#ef4444" bob s=".85" />
    </g>
  );
}
