// SVG furniture & decoration illustrations for each room.
// Drawn in the same flat-illustration style as the Skillverse world map.

export function LivingRoomArt() {
  return (
    <g>
      {/* Floor */}
      <rect x="0" y="0" width="1200" height="900" fill="#f5edd6" rx="8"/>
      <rect x="150" y="250" width="500" height="350" rx="6" fill="#e8dcc4" opacity="0.5"/> {/* rug */}
      
      {/* Sofa */}
      <g transform="translate(100, 220)">
        <rect x="0" y="20" width="230" height="80" rx="12" fill="#c0885c"/>
        <rect x="10" y="0" width="210" height="70" rx="14" fill="#e0a870"/>
        <rect x="15" y="10" width="60" height="50" rx="10" fill="#d4965e"/>
        <rect x="85" y="10" width="60" height="50" rx="10" fill="#d4965e"/>
        <rect x="155" y="10" width="60" height="50" rx="10" fill="#d4965e"/>
        {/* cushions */}
        <rect x="25" y="15" width="40" height="35" rx="8" fill="#e87461"/>
        <rect x="100" y="15" width="40" height="35" rx="8" fill="#4e9f44"/>
        <rect x="170" y="15" width="40" height="35" rx="8" fill="#5b9bd5"/>
      </g>
      
      {/* TV Stand */}
      <g transform="translate(880, 160)">
        <rect x="0" y="60" width="180" height="30" rx="4" fill="#8b5e3c"/>
        <rect x="10" y="0" width="160" height="65" rx="6" fill="#2c3e50"/>
        <rect x="15" y="5" width="150" height="50" rx="4" fill="#34495e"/>
        <rect x="20" y="8" width="140" height="44" rx="3" fill="#87CEEB"/>
      </g>
      
      {/* Bookshelf */}
      <g transform="translate(60, 600)">
        <rect x="0" y="0" width="60" height="180" rx="4" fill="#8b5e3c"/>
        <rect x="5" y="10" width="50" height="35" rx="2" fill="#6b4226"/>
        <rect x="5" y="55" width="50" height="35" rx="2" fill="#6b4226"/>
        <rect x="5" y="100" width="50" height="35" rx="2" fill="#6b4226"/>
        {/* books */}
        <rect x="8" y="12" width="8" height="30" rx="1" fill="#e87461"/>
        <rect x="18" y="16" width="8" height="26" rx="1" fill="#5b9bd5"/>
        <rect x="28" y="14" width="8" height="28" rx="1" fill="#4e9f44"/>
        <rect x="38" y="18" width="8" height="24" rx="1" fill="#f0b429"/>
        <rect x="10" y="58" width="8" height="28" rx="1" fill="#9b59b6"/>
        <rect x="22" y="60" width="8" height="26" rx="1" fill="#e87461"/>
        <rect x="34" y="57" width="8" height="30" rx="1" fill="#5b9bd5"/>
      </g>
      
      {/* Lamp */}
      <g transform="translate(380, 180)">
        <rect x="8" y="30" width="4" height="60" rx="2" fill="#8b5e3c"/>
        <path d="M -5 30 L 25 30 L 18 0 L 2 0 Z" fill="#fde68a"/>
        <circle cx="10" cy="15" r="4" fill="#fbbf24" opacity="0.6"/>
      </g>
      
      {/* Clock */}
      <g transform="translate(700, 100)">
        <circle cx="0" cy="0" r="30" fill="white" stroke="#8b5e3c" strokeWidth="3"/>
        <circle cx="0" cy="0" r="2" fill="#8b5e3c"/>
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="0" y1="0" x2="12" y2="-6" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/>
      </g>
      
      {/* Toy corner */}
      <g transform="translate(450, 650)">
        <circle cx="0" cy="0" r="14" fill="#e87461"/> {/* ball */}
        <rect x="20" y="-15" width="25" height="25" rx="3" fill="#5b9bd5"/> {/* block */}
        <circle cx="55" cy="-5" r="12" fill="#fde68a"/> {/* ball 2 */}
      </g>
      
      {/* Waste bins area */}
      <g transform="translate(240, 560)">
        <rect x="0" y="0" width="40" height="50" rx="6" fill="#4CAF50"/>
        <rect x="50" y="0" width="40" height="50" rx="6" fill="#2196F3"/>
        <rect x="100" y="0" width="40" height="50" rx="6" fill="#FF9800"/>
        <text x="20" y="30" textAnchor="middle" fontSize="16">♻️</text>
        <text x="70" y="30" textAnchor="middle" fontSize="16">🗑️</text>
        <text x="120" y="30" textAnchor="middle" fontSize="16">⚡</text>
      </g>
      
      {/* Windows */}
      <rect x="500" y="40" width="120" height="90" rx="6" fill="#87CEEB" stroke="#8b5e3c" strokeWidth="3"/>
      <line x1="560" y1="40" x2="560" y2="130" stroke="#8b5e3c" strokeWidth="2"/>
      <line x1="500" y1="85" x2="620" y2="85" stroke="#8b5e3c" strokeWidth="2"/>
      
      {/* Rug detail */}
      <ellipse cx="400" cy="420" rx="180" ry="100" fill="#d4965e" opacity="0.3"/>
      <ellipse cx="400" cy="420" rx="140" ry="75" fill="#e0a870" opacity="0.2"/>
    </g>
  );
}

export function KitchenArt() {
  return (
    <g transform="translate(1200, 0)">
      {/* Floor */}
      <rect x="0" y="0" width="1200" height="900" fill="#fef3e2" rx="8"/>
      
      {/* Tile pattern */}
      {Array.from({length: 10}).map((_, i) => (
        Array.from({length: 8}).map((_, j) => (
          <rect key={`${i}-${j}`} x={i*120+5} y={j*112+5} width="115" height="107" rx="2" fill={(i+j)%2===0 ? "#fce8c8" : "#f5ddb0"} opacity="0.4"/>
        ))
      )).flat()}
      
      {/* Kitchen counter */}
      <g transform="translate(30, 100)">
        <rect x="0" y="0" width="300" height="70" rx="4" fill="#d4a76a"/>
        <rect x="0" y="0" width="300" height="15" rx="4" fill="#e8c48a"/>
        {/* items on counter */}
        <rect x="20" y="-30" width="25" height="30" rx="4" fill="#e87461"/> {/* mug */}
        <circle cx="80" cy="-15" r="12" fill="#fbbf24"/> {/* plate */}
        <rect x="120" y="-20" width="40" height="20" rx="3" fill="#4e9f44"/> {/* cutting board */}
      </g>
      
      {/* Stove */}
      <g transform="translate(360, 100)">
        <rect x="0" y="0" width="140" height="70" rx="4" fill="#4a5568"/>
        <circle cx="35" cy="35" r="18" fill="#2d3748" stroke="#718096" strokeWidth="2"/>
        <circle cx="105" cy="35" r="18" fill="#2d3748" stroke="#718096" strokeWidth="2"/>
        <circle cx="35" cy="35" r="8" fill="#e53e3e" opacity="0.4"/>
      </g>
      
      {/* Fridge */}
      <g transform="translate(520, 80)">
        <rect x="0" y="0" width="140" height="200" rx="8" fill="#e2e8f0"/>
        <rect x="5" y="5" width="130" height="90" rx="6" fill="#cbd5e1"/>
        <rect x="5" y="105" width="130" height="90" rx="6" fill="#cbd5e1"/>
        <circle cx="120" cy="50" r="4" fill="#a0aec0"/>
        <circle cx="120" cy="150" r="4" fill="#a0aec0"/>
      </g>
      
      {/* Cupboards */}
      <g transform="translate(700, 80)">
        <rect x="0" y="0" width="250" height="70" rx="4" fill="#d4a76a"/>
        <rect x="10" y="5" width="70" height="60" rx="3" fill="#c0885c"/>
        <rect x="90" y="5" width="70" height="60" rx="3" fill="#c0885c"/>
        <rect x="170" y="5" width="70" height="60" rx="3" fill="#c0885c"/>
        <circle cx="45" cy="35" r="3" fill="#8b5e3c"/>
        <circle cx="125" cy="35" r="3" fill="#8b5e3c"/>
        <circle cx="205" cy="35" r="3" fill="#8b5e3c"/>
      </g>
      
      {/* Dining table */}
      <g transform="translate(280, 580)">
        <ellipse cx="100" cy="40" rx="120" ry="50" fill="#d4a76a"/>
        <ellipse cx="100" cy="35" rx="115" ry="45" fill="#e8c48a"/>
        {/* plates */}
        <circle cx="50" cy="30" r="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
        <circle cx="150" cy="30" r="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      </g>
      
      {/* Sink area */}
      <g transform="translate(430, 620)">
        <rect x="0" y="0" width="120" height="60" rx="6" fill="#94a3b8"/>
        <rect x="10" y="8" width="100" height="44" rx="4" fill="#cbd5e1"/>
        <rect x="50" y="-15" width="6" height="15" rx="2" fill="#94a3b8"/>
        <circle cx="55" cy="-15" r="8" fill="#94a3b8"/>
        {/* water drop */}
        <ellipse cx="60" cy="55" rx="4" ry="3" fill="#87CEEB" opacity="0.5"/>
      </g>
      
      {/* Spice rack */}
      <g transform="translate(850, 300)">
        <rect x="0" y="0" width="150" height="100" rx="4" fill="#8b5e3c"/>
        <rect x="5" y="10" width="140" height="25" rx="2" fill="#6b4226"/>
        <rect x="5" y="45" width="140" height="25" rx="2" fill="#6b4226"/>
        {/* spice jars */}
        <rect x="12" y="3" width="16" height="24" rx="3" fill="#f0b429"/>
        <rect x="34" y="5" width="16" height="22" rx="3" fill="#DC143C"/>
        <rect x="56" y="4" width="16" height="23" rx="3" fill="#228B22"/>
        <rect x="78" y="3" width="16" height="24" rx="3" fill="#D2691E"/>
        <rect x="100" y="5" width="16" height="22" rx="3" fill="#333"/>
        <rect x="122" y="4" width="16" height="23" rx="3" fill="#DAA520"/>
      </g>
      
      {/* Window */}
      <rect x="150" y="20" width="100" height="70" rx="6" fill="#87CEEB" stroke="#8b5e3c" strokeWidth="3"/>
      <line x1="200" y1="20" x2="200" y2="90" stroke="#8b5e3c" strokeWidth="2"/>
      <line x1="150" y1="55" x2="250" y2="55" stroke="#8b5e3c" strokeWidth="2"/>
    </g>
  );
}

export function BedroomArt() {
  return (
    <g transform="translate(0, 900)">
      {/* Floor */}
      <rect x="0" y="0" width="1200" height="900" fill="#f0e8f5" rx="8"/>
      
      {/* Bed */}
      <g transform="translate(80, 100)">
        <rect x="0" y="30" width="330" height="160" rx="8" fill="#d4a76a"/>
        <rect x="5" y="35" width="320" height="150" rx="6" fill="white"/>
        <rect x="10" y="40" width="310" height="140" rx="4" fill="#e8d5f5"/>
        {/* pillows */}
        <ellipse cx="80" cy="70" rx="50" ry="30" fill="white"/>
        <ellipse cx="200" cy="70" rx="50" ry="30" fill="white"/>
        {/* blanket */}
        <rect x="15" y="110" width="300" height="65" rx="6" fill="#c084fc"/>
        <rect x="15" y="110" width="300" height="20" rx="6" fill="#a855f7"/>
        {/* headboard */}
        <rect x="0" y="0" width="330" height="35" rx="8" fill="#8b5e3c"/>
      </g>
      
      {/* Wardrobe */}
      <g transform="translate(60, 400)">
        <rect x="0" y="0" width="100" height="230" rx="6" fill="#8b5e3c"/>
        <rect x="5" y="5" width="42" height="220" rx="4" fill="#a0734f"/>
        <rect x="52" y="5" width="43" height="220" rx="4" fill="#a0734f"/>
        <circle cx="42" cy="115" r="4" fill="#d4a76a"/>
        <circle cx="57" cy="115" r="4" fill="#d4a76a"/>
      </g>
      
      {/* Desk */}
      <g transform="translate(880, 100)">
        <rect x="0" y="40" width="180" height="60" rx="4" fill="#d4a76a"/>
        <rect x="10" y="50" width="70" height="40" rx="3" fill="#8b5e3c"/>
        <rect x="130" y="50" width="40" height="40" rx="3" fill="#8b5e3c"/>
        {/* items on desk */}
        <rect x="20" y="20" width="60" height="20" rx="3" fill="#34495e"/> {/* laptop */}
        <rect x="25" y="22" width="50" height="13" rx="2" fill="#87CEEB"/>
        <rect x="100" y="25" width="20" height="15" rx="2" fill="#e87461"/> {/* pencil holder */}
      </g>
      
      {/* Rug */}
      <ellipse cx="600" cy="500" rx="200" ry="110" fill="#fce8c8" opacity="0.4"/>
      
      {/* Nightstand */}
      <g transform="translate(430, 140)">
        <rect x="0" y="0" width="60" height="50" rx="4" fill="#8b5e3c"/>
        <rect x="5" y="5" width="50" height="20" rx="3" fill="#a0734f"/>
        <circle cx="30" cy="15" r="3" fill="#d4a76a"/>
        {/* alarm clock */}
        <circle cx="30" cy="-12" r="14" fill="#e87461" stroke="#d4543c" strokeWidth="2"/>
        <circle cx="30" cy="-12" r="10" fill="white"/>
        <line x1="30" y1="-12" x2="30" y2="-20" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="30" y1="-12" x2="36" y2="-9" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      
      {/* Shoes */}
      <g transform="translate(700, 750)">
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="#5b3a29" transform="rotate(-15)"/>
        <ellipse cx="25" cy="2" rx="14" ry="8" fill="#5b3a29" transform="rotate(10)"/>
        <ellipse cx="55" cy="-2" rx="14" ry="8" fill="#2c3e50" transform="rotate(-5)"/>
        <ellipse cx="80" cy="3" rx="14" ry="8" fill="#2c3e50" transform="rotate(20)"/>
      </g>
      
      {/* Window with curtains */}
      <rect x="550" y="20" width="140" height="100" rx="6" fill="#87CEEB" stroke="#8b5e3c" strokeWidth="3"/>
      <rect x="545" y="15" width="30" height="110" rx="3" fill="#c084fc" opacity="0.6"/>
      <rect x="665" y="15" width="30" height="110" rx="3" fill="#c084fc" opacity="0.6"/>
    </g>
  );
}

export function BathroomArt() {
  return (
    <g transform="translate(1200, 900)">
      {/* Floor - tiled */}
      <rect x="0" y="0" width="1200" height="900" fill="#e8f4f8" rx="8"/>
      {Array.from({length: 12}).map((_, i) => (
        Array.from({length: 9}).map((_, j) => (
          <rect key={`b${i}-${j}`} x={i*100+2} y={j*100+2} width="96" height="96" rx="2" 
                fill={(i+j)%2===0 ? "#d4eef5" : "#c5e4ed"} opacity="0.4"/>
        ))
      )).flat()}
      
      {/* Sink */}
      <g transform="translate(60, 100)">
        <rect x="0" y="30" width="180" height="60" rx="6" fill="#e2e8f0"/>
        <ellipse cx="90" cy="50" rx="60" ry="25" fill="#cbd5e1"/>
        <ellipse cx="90" cy="48" rx="50" ry="18" fill="#87CEEB" opacity="0.4"/>
        <rect x="85" y="0" width="10" height="30" rx="3" fill="#94a3b8"/>
        <circle cx="90" cy="0" r="10" fill="#94a3b8"/>
        {/* mirror */}
        <rect x="20" y="-80" width="140" height="80" rx="8" fill="#87CEEB" opacity="0.5" stroke="#94a3b8" strokeWidth="2"/>
      </g>
      
      {/* Shower */}
      <g transform="translate(520, 80)">
        <rect x="0" y="0" width="180" height="200" rx="8" fill="#cbd5e1" opacity="0.5"/>
        <rect x="10" y="10" width="160" height="180" rx="6" fill="#87CEEB" opacity="0.2"/>
        <rect x="80" y="-10" width="10" height="30" rx="3" fill="#94a3b8"/>
        <circle cx="85" cy="-10" r="15" fill="#94a3b8"/>
        {/* water drops */}
        <circle cx="60" cy="80" r="3" fill="#87CEEB" opacity="0.5"/>
        <circle cx="90" cy="120" r="3" fill="#87CEEB" opacity="0.5"/>
        <circle cx="110" cy="60" r="3" fill="#87CEEB" opacity="0.5"/>
      </g>
      
      {/* Washing Machine */}
      <g transform="translate(200, 500)">
        <rect x="0" y="0" width="140" height="120" rx="8" fill="#e2e8f0"/>
        <circle cx="70" cy="65" r="40" fill="white" stroke="#cbd5e1" strokeWidth="3"/>
        <circle cx="70" cy="65" r="30" fill="#87CEEB" opacity="0.3"/>
        <rect x="10" y="5" width="120" height="20" rx="4" fill="#cbd5e1"/>
        <circle cx="30" cy="15" r="5" fill="#94a3b8"/>
        <circle cx="50" cy="15" r="5" fill="#22c55e"/>
      </g>
      
      {/* Laundry basket */}
      <g transform="translate(400, 540)">
        <path d="M 0 0 L 80 0 L 70 80 L 10 80 Z" fill="#d4a76a"/>
        <path d="M 5 10 L 75 10 L 68 75 L 12 75 Z" fill="#e8c48a"/>
        {/* clothes sticking out */}
        <rect x="15" y="-15" width="20" height="20" rx="3" fill="#e87461" transform="rotate(-15, 25, -5)"/>
        <rect x="45" y="-10" width="20" height="18" rx="3" fill="#5b9bd5" transform="rotate(10, 55, -1)"/>
      </g>
      
      {/* Towel rack */}
      <g transform="translate(800, 200)">
        <rect x="0" y="0" width="80" height="6" rx="3" fill="#94a3b8"/>
        <rect x="0" y="20" width="80" height="6" rx="3" fill="#94a3b8"/>
        <rect x="5" y="6" width="30" height="40" rx="2" fill="#87CEEB" opacity="0.6"/>
        <rect x="40" y="6" width="30" height="45" rx="2" fill="#fbbf24" opacity="0.6"/>
      </g>
    </g>
  );
}

export function GardenArt() {
  return (
    <g transform="translate(2400, 0)">
      {/* Ground - grass */}
      <rect x="0" y="0" width="1200" height="900" fill="#c5e8b0" rx="8"/>
      
      {/* Sky gradient at top */}
      <rect x="0" y="0" width="1200" height="200" rx="8" fill="#87CEEB" opacity="0.3"/>
      
      {/* Fence */}
      <g transform="translate(20, 100)">
        {Array.from({length: 12}).map((_, i) => (
          <g key={i}>
            <rect x={i*95} y="0" width="12" height="50" rx="2" fill="#d4a76a"/>
            <polygon points={`${i*95},0 ${i*95+6},-10 ${i*95+12},0`} fill="#d4a76a"/>
          </g>
        ))}
        <rect x="0" y="12" width="1140" height="6" rx="2" fill="#c0885c"/>
        <rect x="0" y="32" width="1140" height="6" rx="2" fill="#c0885c"/>
      </g>
      
      {/* Trees */}
      <g transform="translate(100, 300)">
        <rect x="12" y="0" width="16" height="60" rx="5" fill="#8b5e3c"/>
        <circle cx="20" cy="-20" r="30" fill="#4e9f44"/>
        <circle cx="5" cy="-5" r="22" fill="#5fb352"/>
        <circle cx="35" cy="-8" r="22" fill="#469238"/>
        <circle cx="20" cy="-40" r="24" fill="#63bd55"/>
      </g>
      
      <g transform="translate(1000, 250)">
        <rect x="12" y="0" width="16" height="50" rx="5" fill="#8b5e3c"/>
        <circle cx="20" cy="-15" r="28" fill="#4e9f44"/>
        <circle cx="5" cy="-2" r="20" fill="#469238"/>
        <circle cx="35" cy="-5" r="20" fill="#5fb352"/>
        <circle cx="20" cy="-35" r="22" fill="#63bd55"/>
        {/* fruits */}
        <circle cx="8" cy="-8" r="4" fill="#e25c4a"/>
        <circle cx="30" cy="-20" r="4" fill="#e25c4a"/>
      </g>
      
      {/* Flower pots */}
      <g transform="translate(300, 500)">
        {/* pot 1 */}
        <path d="M 0 0 L 40 0 L 35 40 L 5 40 Z" fill="#d4543c"/>
        <rect x="-3" y="-3" width="46" height="8" rx="3" fill="#c0885c"/>
        <circle cx="20" cy="-12" r="6" fill="#e87461"/>
        <circle cx="10" cy="-8" r="5" fill="#e87461"/>
        <circle cx="30" cy="-8" r="5" fill="#e87461"/>
        <circle cx="20" cy="-10" r="4" fill="#fbbf24"/>
        <line x1="20" y1="-20" x2="20" y2="0" stroke="#4e9f44" strokeWidth="3"/>
        <ellipse cx="12" cy="-18" rx="8" ry="5" fill="#4e9f44"/>
        <ellipse cx="28" cy="-16" rx="7" ry="5" fill="#5fb352"/>
      </g>
      
      <g transform="translate(500, 480)">
        <path d="M 0 0 L 40 0 L 35 40 L 5 40 Z" fill="#8b5e3c"/>
        <rect x="-3" y="-3" width="46" height="8" rx="3" fill="#6b4226"/>
        <line x1="20" y1="-30" x2="20" y2="0" stroke="#4e9f44" strokeWidth="3"/>
        <ellipse cx="12" cy="-28" rx="10" ry="6" fill="#4e9f44"/>
        <ellipse cx="28" cy="-25" rx="8" ry="6" fill="#5fb352"/>
        <ellipse cx="20" cy="-35" rx="8" ry="5" fill="#63bd55"/>
      </g>
      
      {/* Watering can */}
      <g transform="translate(650, 550)">
        <ellipse cx="20" cy="15" rx="22" ry="15" fill="#5b9bd5"/>
        <rect x="5" y="0" width="30" height="20" rx="5" fill="#4a90c4"/>
        <path d="M 35 5 L 55 -10 L 58 -8 L 40 8 Z" fill="#5b9bd5"/>
        <circle cx="57" cy="-9" r="4" fill="#4a90c4"/>
      </g>
      
      {/* Compost bin */}
      <g transform="translate(800, 600)">
        <rect x="0" y="0" width="80" height="60" rx="6" fill="#6b4226"/>
        <rect x="5" y="5" width="70" height="50" rx="4" fill="#8b5e3c"/>
        <rect x="0" y="-6" width="80" height="10" rx="4" fill="#5b3a29"/>
        <text x="40" y="38" textAnchor="middle" fontSize="20">🌱</text>
      </g>
      
      {/* Garden path */}
      <g>
        {Array.from({length: 8}).map((_, i) => (
          <ellipse key={i} cx={400 + i * 80} cy={750} rx="25" ry="12" fill="#d4a76a" opacity="0.5"/>
        ))}
      </g>
      
      {/* Flowers */}
      {[
        [200, 650, '#e87461'], [250, 680, '#f472b6'], [350, 700, '#a78bfa'],
        [700, 400, '#fbbf24'], [750, 430, '#f472b6'], [850, 450, '#e87461'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <line x1="0" y1="0" x2="0" y2="15" stroke="#4e9f44" strokeWidth="2"/>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos(a*Math.PI/180)*5} cy={Math.sin(a*Math.PI/180)*5} r="3.5" fill={c}/>
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#fde68a"/>
        </g>
      ))}
      
      {/* Butterflies */}
      <g transform="translate(500, 300)" className="anim-idle">
        <path d="M 0 0 Q -8 -8 -4 -14 Q 0 -8 0 0" fill="#f472b6" opacity="0.7"/>
        <path d="M 0 0 Q 8 -8 4 -14 Q 0 -8 0 0" fill="#a78bfa" opacity="0.7"/>
      </g>
    </g>
  );
}

export function SafetyCornerArt() {
  return (
    <g transform="translate(2400, 900)">
      {/* Floor */}
      <rect x="0" y="0" width="1200" height="900" fill="#fff5e6" rx="8"/>
      
      {/* Safety equipment shelf */}
      <g transform="translate(60, 100)">
        <rect x="0" y="0" width="150" height="70" rx="4" fill="#8b5e3c"/>
        <rect x="5" y="5" width="140" height="25" rx="2" fill="#6b4226"/>
        <rect x="5" y="40" width="140" height="25" rx="2" fill="#6b4226"/>
        {/* items */}
        <text x="25" y="24" fontSize="18">🔦</text>
        <text x="55" y="24" fontSize="18">🧯</text>
        <text x="85" y="24" fontSize="18">🩹</text>
        <text x="115" y="24" fontSize="18">📞</text>
      </g>
      
      {/* Smoke alarm */}
      <g transform="translate(500, 50)">
        <circle cx="0" cy="0" r="20" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
        <circle cx="0" cy="0" r="8" fill="#ef4444"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">!</text>
      </g>
      
      {/* Safety poster */}
      <g transform="translate(700, 100)">
        <rect x="0" y="0" width="200" height="150" rx="8" fill="white" stroke="#fbbf24" strokeWidth="3"/>
        <text x="100" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#b45309">SAFETY FIRST</text>
        <text x="100" y="60" textAnchor="middle" fontSize="24">🛡️</text>
        <text x="100" y="90" textAnchor="middle" fontSize="11" fill="#64748b">Stay Safe at Home!</text>
        <text x="100" y="110" textAnchor="middle" fontSize="11" fill="#64748b">Know your exits</text>
        <text x="100" y="130" textAnchor="middle" fontSize="11" fill="#64748b">Ask an adult for help</text>
      </g>
      
      {/* Emergency exit sign */}
      <g transform="translate(400, 300)">
        <rect x="0" y="0" width="100" height="40" rx="6" fill="#22c55e"/>
        <text x="50" y="15" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">EXIT →</text>
        <text x="50" y="32" textAnchor="middle" fontSize="14">🚪</text>
      </g>
      
      {/* First aid kit */}
      <g transform="translate(200, 400)">
        <rect x="0" y="0" width="80" height="60" rx="8" fill="white" stroke="#ef4444" strokeWidth="3"/>
        <rect x="30" y="10" width="20" height="40" rx="2" fill="#ef4444"/>
        <rect x="10" y="20" width="60" height="20" rx="2" fill="#ef4444"/>
      </g>
      
      {/* Electrical panel (safely illustrated) */}
      <g transform="translate(800, 400)">
        <rect x="0" y="0" width="100" height="120" rx="6" fill="#4a5568"/>
        <rect x="10" y="10" width="80" height="100" rx="4" fill="#2d3748"/>
        {/* switches */}
        {[0,1,2,3].map(i => (
          <g key={i} transform={`translate(${25 + (i%2)*35}, ${20 + Math.floor(i/2)*40})`}>
            <rect x="0" y="0" width="25" height="30" rx="3" fill="#718096"/>
            <rect x="5" y="2" width="15" height="12" rx="2" fill={i===2 ? "#22c55e" : "#94a3b8"}/>
          </g>
        ))}
        <text x="50" y="-10" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">⚡ CAUTION</text>
      </g>
      
      {/* Window */}
      <rect x="300" y="50" width="120" height="80" rx="6" fill="#87CEEB" stroke="#8b5e3c" strokeWidth="3"/>
    </g>
  );
}

// Door/passage openings between rooms
export function DoorwaysArt() {
  return (
    <g>
      {/* Living → Kitchen */}
      <rect x="1170" y="350" width="30" height="200" fill="#d4a76a" rx="4"/>
      <rect x="1175" y="360" width="20" height="180" fill="#e8c48a" rx="3"/>
      
      {/* Living → Bedroom */}
      <rect x="450" y="870" width="300" height="30" fill="#d4a76a" rx="4"/>
      <rect x="460" y="875" width="280" height="20" fill="#e8c48a" rx="3"/>
      
      {/* Kitchen → Bathroom */}
      <rect x="1450" y="870" width="300" height="30" fill="#d4a76a" rx="4"/>
      <rect x="1460" y="875" width="280" height="20" fill="#e8c48a" rx="3"/>
      
      {/* Kitchen → Garden */}
      <rect x="2370" y="350" width="30" height="200" fill="#d4a76a" rx="4"/>
      <rect x="2375" y="360" width="20" height="180" fill="#e8c48a" rx="3"/>
      
      {/* Bedroom → Bathroom */}
      <rect x="1170" y="1300" width="30" height="200" fill="#d4a76a" rx="4"/>
      <rect x="1175" y="1310" width="20" height="180" fill="#e8c48a" rx="3"/>
      
      {/* Garden → Safety */}
      <rect x="2850" y="870" width="300" height="30" fill="#d4a76a" rx="4"/>
      <rect x="2860" y="875" width="280" height="20" fill="#e8c48a" rx="3"/>
    </g>
  );
}
