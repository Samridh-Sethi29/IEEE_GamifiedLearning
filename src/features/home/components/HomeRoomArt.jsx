// SVG room illustrations and environmental ambiance for each room.
// Drawn in Skillverse's warm, illustrated-storybook aesthetic.
// Every room component renders in local coordinates: 0,0 to 1200,900.

import React from 'react';

// ── 1. LIVING ROOM (0,0 to 1200,900) ─────────────────────────
export function LivingRoomArt() {
  return (
    <g>
      {/* Floor - Warm Oak Wood Planks */}
      <rect x="0" y="0" width="1200" height="900" fill="#f7efe0" />
      {Array.from({ length: 15 }).map((_, i) => (
        <g key={`plank-${i}`}>
          <line
            x1="0"
            y1={i * 60}
            x2="1200"
            y2={i * 60}
            stroke="#e2cfb2"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
          {/* Subtle wood plank joints */}
          <line x1={((i * 220) % 1100) + 50} y1={i * 60} x2={((i * 220) % 1100) + 50} y2={i * 60 + 60} stroke="#e2cfb2" strokeWidth="1.2" strokeOpacity="0.5" />
          <line x1={(((i * 220) + 550) % 1100) + 50} y1={i * 60} x2={(((i * 220) + 550) % 1100) + 50} y2={i * 60 + 60} stroke="#e2cfb2" strokeWidth="1.2" strokeOpacity="0.5" />
        </g>
      ))}

      {/* Baseboards & Wall Shadow */}
      <rect x="0" y="0" width="1200" height="25" fill="#e8d8be" />
      <line x1="0" y1="25" x2="1200" y2="25" stroke="#d5be9b" strokeWidth="3" />

      {/* Sunlight beam streaming from window across floor */}
      <polygon points="540,40 760,40 920,480 500,480" fill="#fef08a" opacity="0.14" pointerEvents="none" />

      {/* Large Arched Windows with Draped Curtains */}
      <g transform="translate(560, 20)">
        {/* Window frame */}
        <rect x="0" y="0" width="160" height="110" rx="12" fill="#bae6fd" stroke="#8b5e3c" strokeWidth="4" />
        <line x1="80" y1="0" x2="80" y2="110" stroke="#8b5e3c" strokeWidth="3" />
        <line x1="0" y1="55" x2="160" y2="55" stroke="#8b5e3c" strokeWidth="3" />
        {/* Curtains */}
        <path d="M -15 -5 Q 10 50 -10 115 L 15 115 Q 35 50 15 -5 Z" fill="#fde047" opacity="0.85" />
        <path d="M 175 -5 Q 150 50 170 115 L 145 115 Q 125 50 145 -5 Z" fill="#fde047" opacity="0.85" />
        {/* Curtain rod */}
        <rect x="-25" y="-8" width="210" height="6" rx="3" fill="#78350f" />
        <circle cx="-25" cy="-5" r="5" fill="#92400e" />
        <circle cx="185" cy="-5" r="5" fill="#92400e" />
      </g>

      {/* Cozy Fireplace with Mantle & Fire Glow */}
      <g transform="translate(360, 25)">
        {/* Brick chimney breast */}
        <rect x="0" y="0" width="140" height="115" rx="6" fill="#c2410c" stroke="#9a3412" strokeWidth="2" />
        {/* Brick lines */}
        {[20, 40, 60, 80, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="140" y2={y} stroke="#ea580c" strokeWidth="1" strokeOpacity="0.6" />
        ))}
        {/* Mantle shelf */}
        <rect x="-10" y="0" width="160" height="14" rx="4" fill="#78350f" stroke="#5b3a29" strokeWidth="2" />
        {/* Framed picture on mantle */}
        <rect x="15" y="-28" width="36" height="28" rx="3" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
        <circle cx="33" cy="-14" r="8" fill="#38bdf8" />
        {/* Trailing potted ivy on mantle */}
        <rect x="100" y="-16" width="16" height="16" rx="2" fill="#d97706" />
        <circle cx="108" cy="-18" r="10" fill="#22c55e" />
        <path d="M 104 -10 Q 100 2 105 15" stroke="#16a34a" strokeWidth="2" fill="none" />
        {/* Firebox */}
        <rect x="25" y="45" width="90" height="70" rx="8" fill="#1c1917" />
        {/* Logs & Fire */}
        <ellipse cx="70" cy="100" rx="30" ry="8" fill="#78350f" />
        <ellipse cx="70" cy="85" rx="24" ry="16" fill="#f97316" opacity="0.8" />
        <ellipse cx="70" cy="82" rx="14" ry="12" fill="#facc15" />
        <ellipse cx="70" cy="80" rx="7" ry="8" fill="#ffffff" />
        {/* Hearth rug */}
        <ellipse cx="70" cy="125" rx="65" ry="14" fill="#b91c1c" opacity="0.75" />
      </g>

      {/* Large Bohemian Area Rug */}
      <g transform="translate(200, 280)">
        <ellipse cx="250" cy="160" rx="260" ry="150" fill="#fed7aa" stroke="#fb923c" strokeWidth="3" />
        <ellipse cx="250" cy="160" rx="220" ry="125" fill="#ffedd5" />
        <ellipse cx="250" cy="160" rx="170" ry="95" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
        <ellipse cx="250" cy="160" rx="110" ry="60" fill="#fed7aa" />
      </g>

      {/* Plush Sectional Sofa */}
      <g transform="translate(100, 220)">
        {/* Base shadow */}
        <ellipse cx="140" cy="115" rx="145" ry="25" fill="rgba(15, 23, 42, 0.14)" />
        {/* Sofa backrest */}
        <rect x="0" y="0" width="280" height="75" rx="18" fill="#15803d" stroke="#166534" strokeWidth="2" />
        {/* Cushions */}
        <rect x="10" y="25" width="80" height="75" rx="12" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
        <rect x="100" y="25" width="80" height="75" rx="12" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
        <rect x="190" y="25" width="80" height="75" rx="12" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
        {/* Throw pillows */}
        <rect x="20" y="32" width="40" height="35" rx="8" fill="#f97316" transform="rotate(-6 40 45)" />
        <rect x="220" y="32" width="40" height="35" rx="8" fill="#fbbf24" transform="rotate(8 240 45)" />
        {/* Side armrests */}
        <rect x="-8" y="20" width="26" height="85" rx="12" fill="#166534" />
        <rect x="262" y="20" width="26" height="85" rx="12" fill="#166534" />
      </g>

      {/* Wooden Coffee Table */}
      <g transform="translate(180, 360)">
        <ellipse cx="120" cy="50" rx="90" ry="42" fill="rgba(15, 23, 42, 0.12)" />
        <ellipse cx="120" cy="42" rx="85" ry="38" fill="#a16207" stroke="#78350f" strokeWidth="2" />
        <ellipse cx="120" cy="38" rx="80" ry="34" fill="#ca8a04" />
        {/* Tea mug with steam */}
        <rect x="95" y="22" width="16" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 103 16 Q 106 10 101 4" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Open book */}
        <polygon points="125,32 145,28 145,40 125,44" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="145,28 165,32 165,44 145,40" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      </g>

      {/* Modern TV Entertainment Unit */}
      <g transform="translate(860, 150)">
        <ellipse cx="120" cy="115" rx="115" ry="20" fill="rgba(15, 23, 42, 0.12)" />
        {/* Wooden Stand */}
        <rect x="0" y="65" width="240" height="42" rx="6" fill="#854d0e" stroke="#713f12" strokeWidth="2" />
        <rect x="15" y="75" width="60" height="24" rx="3" fill="#a16207" />
        <rect x="85" y="75" width="70" height="24" rx="3" fill="#475569" />
        <rect x="165" y="75" width="60" height="24" rx="3" fill="#a16207" />
        {/* TV Screen */}
        <rect x="25" y="-10" width="190" height="80" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
        <rect x="32" y="-3" width="176" height="66" rx="4" fill="#38bdf8" />
        {/* Screen Nature Display */}
        <circle cx="120" cy="30" r="18" fill="#fbbf24" />
        <polygon points="32,63 80,25 120,63" fill="#15803d" />
        <polygon points="100,63 150,18 208,63" fill="#166534" />
        {/* TV Legs */}
        <line x1="60" y1="70" x2="70" y2="65" stroke="#0f172a" strokeWidth="3" />
        <line x1="180" y1="70" x2="170" y2="65" stroke="#0f172a" strokeWidth="3" />
      </g>

      {/* Tall Wooden Bookshelf */}
      <g transform="translate(60, 560)">
        <rect x="0" y="0" width="85" height="230" rx="6" fill="#78350f" stroke="#5b3a29" strokeWidth="3" />
        {/* Shelves */}
        {[45, 95, 145, 195].map((y) => (
          <rect key={y} x="6" y={y} width="73" height="8" rx="2" fill="#92400e" />
        ))}
        {/* Row 1 Books */}
        <rect x="12" y="10" width="10" height="35" rx="2" fill="#ef4444" />
        <rect x="24" y="14" width="8" height="31" rx="2" fill="#3b82f6" />
        <rect x="34" y="8" width="12" height="37" rx="2" fill="#10b981" />
        <rect x="48" y="16" width="10" height="29" rx="2" fill="#f59e0b" />
        <rect x="60" y="12" width="12" height="33" rx="2" fill="#8b5cf6" />
        {/* Row 2 Books */}
        <rect x="12" y="60" width="14" height="35" rx="2" fill="#06b6d4" />
        <rect x="28" y="64" width="9" height="31" rx="2" fill="#ec4899" />
        <rect x="39" y="58" width="15" height="37" rx="2" fill="#84cc16" />
        {/* Row 3 Globe & Microscope */}
        <circle cx="30" cy="125" r="14" fill="#38bdf8" />
        <path d="M 20 125 A 10 10 0 0 0 40 125" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
        {/* Row 4 Trophy */}
        <polygon points="40,165 46,165 44,185 38,185" fill="#eab308" />
        <circle cx="41" cy="165" r="9" fill="#facc15" />
      </g>

      {/* Indoor Potted Fiddle Leaf Fig Plant */}
      <g transform="translate(1100, 360)">
        <ellipse cx="25" cy="110" rx="28" ry="12" fill="rgba(15, 23, 42, 0.12)" />
        {/* Pot */}
        <polygon points="10,80 40,80 36,112 14,112" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
        <ellipse cx="25" cy="80" rx="15" ry="4" fill="#9a3412" />
        {/* Stem & Leaves */}
        <path d="M 25 80 Q 22 40 25 0" stroke="#15803d" strokeWidth="4" fill="none" />
        <ellipse cx="12" cy="60" rx="18" ry="10" fill="#22c55e" transform="rotate(-30 12 60)" />
        <ellipse cx="38" cy="45" rx="18" ry="10" fill="#16a34a" transform="rotate(30 38 45)" />
        <ellipse cx="14" cy="25" rx="18" ry="10" fill="#22c55e" transform="rotate(-20 14 25)" />
        <ellipse cx="36" cy="10" rx="18" ry="10" fill="#15803d" transform="rotate(25 36 10)" />
        <ellipse cx="25" cy="-2" rx="14" ry="16" fill="#4ade80" />
      </g>

      {/* Arched Floor Lamp */}
      <g transform="translate(70, 160)">
        <ellipse cx="20" cy="80" rx="22" ry="7" fill="rgba(15, 23, 42, 0.12)" />
        <ellipse cx="20" cy="78" rx="18" ry="5" fill="#475569" />
        <path d="M 20 78 Q 20 -20 60 -10" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <polygon points="50,-10 75,-10 82,12 43,12" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
        {/* Warm light cone */}
        <polygon points="43,12 82,12 120,100 10,100" fill="#fde047" opacity="0.12" pointerEvents="none" />
      </g>
    </g>
  );
}

// ── 2. KITCHEN (0,0 to 1200,900) ──────────────────────────────
export function KitchenArt() {
  return (
    <g>
      {/* Floor - Terracotta & Cream Tiles */}
      <rect x="0" y="0" width="1200" height="900" fill="#fff7ed" />
      {Array.from({ length: 12 }).map((_, i) =>
        Array.from({ length: 9 }).map((_, j) => (
          <rect
            key={`k-tile-${i}-${j}`}
            x={i * 100 + 4}
            y={j * 100 + 4}
            width="92"
            height="92"
            rx="4"
            fill={(i + j) % 2 === 0 ? '#ffedd5' : '#fed7aa'}
            stroke="#fdba74"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        ))
      )}

      {/* Subway Tile Backsplash along top */}
      <rect x="0" y="0" width="1200" height="35" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

      {/* Chef's Cooking Range & Copper Hood */}
      <g transform="translate(320, 30)">
        {/* Copper Exhaust Hood */}
        <polygon points="35,0 105,0 135,50 5,50" fill="#d97706" stroke="#b45309" strokeWidth="2" />
        <rect x="0" y="50" width="140" height="12" rx="3" fill="#b45309" />
        {/* Stove Base */}
        <rect x="5" y="65" width="130" height="90" rx="6" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <rect x="15" y="75" width="110" height="40" rx="4" fill="#0f172a" />
        {/* Stove Burners */}
        <circle cx="45" cy="95" r="16" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="95" cy="95" r="16" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        {/* Simmering Pot with Steam */}
        <rect x="33" y="80" width="24" height="16" rx="4" fill="#dc2626" />
        <ellipse cx="45" cy="80" rx="12" ry="4" fill="#ef4444" />
        <path d="M 42 74 Q 45 68 43 62" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
      </g>

      {/* Double Door Stainless Refrigerator with Kid Art & Magnets */}
      <g transform="translate(680, 20)">
        <ellipse cx="75" cy="185" rx="80" ry="18" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="0" width="150" height="185" rx="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Top freezer door */}
        <rect x="6" y="6" width="138" height="68" rx="6" fill="#cbd5e1" />
        <rect x="12" y="32" width="6" height="24" rx="2" fill="#64748b" />
        {/* Bottom fridge door */}
        <rect x="6" y="78" width="138" height="100" rx="6" fill="#cbd5e1" />
        <rect x="12" y="90" width="6" height="34" rx="2" fill="#64748b" />
        {/* Alphabet & Star Magnets */}
        <circle cx="50" cy="105" r="6" fill="#ef4444" />
        <rect x="70" y="98" width="12" height="12" rx="3" fill="#3b82f6" />
        <polygon points="105,100 108,108 116,108 110,113 112,120 105,116 98,120 100,113 94,108 102,108" fill="#eab308" />
        {/* Grocery list notepad */}
        <rect x="45" y="125" width="30" height="38" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        <line x1="50" y1="135" x2="70" y2="135" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="50" y1="142" x2="70" y2="142" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="50" y1="149" x2="65" y2="149" stroke="#cbd5e1" strokeWidth="1.5" />
      </g>

      {/* Spice Discovery Wall Shelf */}
      <g transform="translate(860, 25)">
        <rect x="0" y="0" width="180" height="65" rx="6" fill="#92400e" stroke="#78350f" strokeWidth="2" />
        <rect x="6" y="8" width="168" height="20" rx="3" fill="#b45309" />
        <rect x="6" y="36" width="168" height="20" rx="3" fill="#b45309" />
        {/* Spice Jars */}
        <circle cx="20" cy="18" r="7" fill="#facc15" title="Turmeric" />
        <circle cx="40" cy="18" r="7" fill="#a16207" title="Cumin" />
        <circle cx="60" cy="18" r="7" fill="#65a30d" title="Coriander" />
        <circle cx="80" cy="18" r="7" fill="#b91c1c" title="Chilli" />
        <circle cx="100" cy="18" r="7" fill="#78350f" title="Cinnamon" />
        <circle cx="120" cy="18" r="7" fill="#15803d" title="Cardamom" />
        <circle cx="140" cy="18" r="7" fill="#1e293b" title="Black Pepper" />
        <circle cx="160" cy="18" r="7" fill="#eab308" title="Mustard" />
      </g>

      {/* Large Kitchen Prep Island with Stools */}
      <g transform="translate(180, 320)">
        <ellipse cx="200" cy="120" rx="205" ry="32" fill="rgba(15, 23, 42, 0.12)" />
        {/* Countertop */}
        <rect x="0" y="20" width="400" height="90" rx="10" fill="#a16207" stroke="#78350f" strokeWidth="2.5" />
        <rect x="-5" y="10" width="410" height="22" rx="6" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
        {/* Front drawers */}
        <rect x="20" y="42" width="100" height="55" rx="4" fill="#b45309" />
        <circle cx="70" cy="68" r="4" fill="#fef08a" />
        <rect x="150" y="42" width="100" height="55" rx="4" fill="#b45309" />
        <circle cx="200" cy="68" r="4" fill="#fef08a" />
        <rect x="280" y="42" width="100" height="55" rx="4" fill="#b45309" />
        <circle cx="330" cy="68" r="4" fill="#fef08a" />
        {/* Items on Counter: Cutting board, Veggies, Fruit bowl */}
        <rect x="40" y="-2" width="60" height="20" rx="3" fill="#854d0e" />
        <circle cx="60" cy="5" r="5" fill="#ef4444" />
        <circle cx="75" cy="6" r="6" fill="#22c55e" />
        {/* Fruit Bowl */}
        <ellipse cx="200" cy="6" rx="28" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="192" cy="0" r="8" fill="#ef4444" />
        <circle cx="208" cy="1" r="8" fill="#eab308" />
        <circle cx="200" cy="-6" r="7" fill="#f97316" />
      </g>

      {/* Round Wooden Dining Table with Sunflower Vase */}
      <g transform="translate(680, 520)">
        <ellipse cx="140" cy="80" rx="145" ry="50" fill="rgba(15, 23, 42, 0.12)" />
        <ellipse cx="140" cy="65" rx="135" ry="44" fill="#a16207" stroke="#78350f" strokeWidth="2.5" />
        <ellipse cx="140" cy="58" rx="125" ry="38" fill="#fef3c7" />
        {/* Table runner */}
        <polygon points="40,58 240,58 220,64 60,64" fill="#fde047" opacity="0.8" />
        {/* Ceramic Sunflower Vase */}
        <ellipse cx="140" cy="52" rx="14" ry="7" fill="#0284c7" />
        <circle cx="140" cy="38" r="9" fill="#eab308" />
        <circle cx="140" cy="38" r="4" fill="#78350f" />
        {/* Dining Plates */}
        <circle cx="85" cy="54" r="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx="195" cy="54" r="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      </g>

      {/* Stainless Sink Counter with Faucet (Water Conservation Area) */}
      <g transform="translate(40, 100)">
        <rect x="0" y="0" width="180" height="90" rx="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <rect x="25" y="15" width="130" height="60" rx="6" fill="#94a3b8" />
        {/* Gooseneck Faucet */}
        <path d="M 90 20 Q 90 0 100 0 Q 110 0 110 12" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Water Droplet Glow */}
        <circle cx="110" cy="24" r="5" fill="#38bdf8" />
      </g>
    </g>
  );
}

// ── 3. BEDROOM (0,0 to 1200,900) ──────────────────────────────
export function BedroomArt() {
  return (
    <g>
      {/* Floor - Soft Lavender/Honey Parquet */}
      <rect x="0" y="0" width="1200" height="900" fill="#faf5ff" />
      {Array.from({ length: 15 }).map((_, i) => (
        <line
          key={`bed-p-${i}`}
          x1="0"
          y1={i * 60}
          x2="1200"
          y2={i * 60}
          stroke="#f3e8ff"
          strokeWidth="1.5"
        />
      ))}

      {/* Fluffy Round Cloud Rug */}
      <g transform="translate(420, 360)">
        <ellipse cx="200" cy="130" rx="210" ry="120" fill="#f5d0fe" stroke="#e879f9" strokeWidth="2.5" />
        <ellipse cx="200" cy="130" rx="175" ry="95" fill="#fae8ff" />
      </g>

      {/* Plush Canopy Platform Bed */}
      <g transform="translate(80, 100)">
        <ellipse cx="180" cy="210" rx="185" ry="30" fill="rgba(15, 23, 42, 0.12)" />
        {/* Wooden Headboard */}
        <rect x="0" y="0" width="360" height="50" rx="10" fill="#78350f" stroke="#5b3a29" strokeWidth="3" />
        {/* Mattress frame */}
        <rect x="10" y="40" width="340" height="160" rx="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        {/* Soft Quilted Duvet */}
        <rect x="20" y="90" width="320" height="105" rx="8" fill="#c084fc" stroke="#a855f7" strokeWidth="2" />
        <line x1="20" y1="120" x2="340" y2="120" stroke="#a855f7" strokeWidth="1.5" />
        <line x1="20" y1="150" x2="340" y2="150" stroke="#a855f7" strokeWidth="1.5" />
        {/* Fluffy Pillows */}
        <rect x="40" y="48" width="110" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="190" y="48" width="110" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Sleeping Teddy Bear */}
        <circle cx="160" cy="80" r="14" fill="#a16207" />
        <circle cx="150" cy="72" r="5" fill="#78350f" />
        <circle cx="170" cy="72" r="5" fill="#78350f" />
        <circle cx="160" cy="82" r="5" fill="#fde047" />
      </g>

      {/* Bedside Nightstand with Lamp & Clock */}
      <g transform="translate(460, 150)">
        <ellipse cx="40" cy="85" rx="38" ry="14" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="15" width="80" height="65" rx="6" fill="#854d0e" stroke="#713f12" strokeWidth="2" />
        <circle cx="40" cy="38" r="4" fill="#fef08a" />
        <circle cx="40" cy="62" r="4" fill="#fef08a" />
        {/* Bedside Lamp */}
        <rect x="35" y="-5" width="10" height="22" rx="2" fill="#64748b" />
        <polygon points="25,-5 55,-5 62,-30 18,-30" fill="#fed7aa" stroke="#f97316" strokeWidth="2" />
        {/* Retro Alarm Clock */}
        <circle cx="15" cy="5" r="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
        <circle cx="15" cy="5" r="7" fill="#ffffff" />
        <line x1="15" y1="5" x2="15" y2="1" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="15" y1="5" x2="19" y2="5" stroke="#0f172a" strokeWidth="1.5" />
      </g>

      {/* Wardrobe Dressing Area */}
      <g transform="translate(60, 440)">
        <ellipse cx="65" cy="245" rx="70" ry="18" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="0" width="130" height="240" rx="8" fill="#78350f" stroke="#5b3a29" strokeWidth="3" />
        <rect x="10" y="10" width="50" height="220" rx="4" fill="#92400e" />
        <circle cx="48" cy="120" r="4" fill="#fef08a" />
        <rect x="68" y="10" width="52" height="220" rx="4" fill="#92400e" />
        <circle cx="80" cy="120" r="4" fill="#fef08a" />
        {/* Hanging clothes visible through open door */}
        <rect x="74" y="25" width="40" height="80" rx="4" fill="#38bdf8" />
        <rect x="76" y="115" width="36" height="60" rx="4" fill="#f43f5e" />
      </g>

      {/* Study Desk & Laptop */}
      <g transform="translate(860, 110)">
        <ellipse cx="110" cy="110" rx="115" ry="24" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="20" width="220" height="85" rx="8" fill="#854d0e" stroke="#713f12" strokeWidth="2.5" />
        <rect x="-5" y="10" width="230" height="18" rx="4" fill="#a16207" />
        {/* Laptop open */}
        <rect x="40" y="-8" width="50" height="22" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="44" y="-5" width="42" height="16" rx="2" fill="#38bdf8" />
        <rect x="36" y="12" width="58" height="6" rx="2" fill="#64748b" />
        {/* Desk Lamp */}
        <path d="M 170 12 Q 170 -16 150 -16" stroke="#f59e0b" strokeWidth="3" fill="none" />
        <polygon points="140,-16 155,-16 160,-28 135,-28" fill="#facc15" />
        {/* Pencil holder */}
        <rect x="110" y="0" width="16" height="16" rx="2" fill="#ef4444" />
        <line x1="114" y1="0" x2="112" y2="-8" stroke="#3b82f6" strokeWidth="2" />
        <line x1="118" y1="0" x2="120" y2="-9" stroke="#10b981" strokeWidth="2" />
      </g>

      {/* Astronomy Poster & Star Window */}
      <g transform="translate(640, 20)">
        <rect x="0" y="0" width="130" height="85" rx="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="35" cy="40" r="16" fill="#facc15" />
        <circle cx="85" cy="40" r="8" fill="#38bdf8" />
        <circle cx="105" cy="30" r="3" fill="#ffffff" />
        <circle cx="20" cy="20" r="2" fill="#ffffff" />
        <circle cx="70" cy="65" r="2" fill="#ffffff" />
      </g>
    </g>
  );
}

// ── 4. BATHROOM (0,0 to 1200,900) ─────────────────────────────
export function BathroomArt() {
  return (
    <g>
      {/* Floor - Aquatic Mint & Sky Mosaic Tiles */}
      <rect x="0" y="0" width="1200" height="900" fill="#f0fdfa" />
      {Array.from({ length: 15 }).map((_, i) =>
        Array.from({ length: 11 }).map((_, j) => (
          <rect
            key={`b-tile-${i}-${j}`}
            x={i * 80 + 3}
            y={j * 80 + 3}
            width="74"
            height="74"
            rx="4"
            fill={(i + j) % 2 === 0 ? '#ccfbf1' : '#e0f2fe'}
            stroke="#99f6e4"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        ))
      )}

      {/* Freestanding Porcelain Soaking Bathtub with Bubble Bath */}
      <g transform="translate(680, 120)">
        <ellipse cx="140" cy="115" rx="145" ry="35" fill="rgba(15, 23, 42, 0.12)" />
        {/* Bathtub body */}
        <path
          d="M 10 30 Q 10 90 60 105 L 220 105 Q 270 90 270 30 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="3"
        />
        <ellipse cx="140" cy="30" rx="130" ry="24" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        {/* Bath water & Foamy bubbles */}
        <ellipse cx="140" cy="34" rx="115" ry="18" fill="#7dd3fc" opacity="0.75" />
        <circle cx="90" cy="30" r="10" fill="#ffffff" opacity="0.9" />
        <circle cx="110" cy="28" r="8" fill="#ffffff" opacity="0.9" />
        <circle cx="135" cy="32" r="12" fill="#ffffff" opacity="0.9" />
        <circle cx="160" cy="29" r="9" fill="#ffffff" opacity="0.9" />
        {/* Yellow Rubber Duck */}
        <circle cx="190" cy="28" r="8" fill="#facc15" />
        <polygon points="196,28 202,26 196,30" fill="#ea580c" />
        {/* Claw Feet */}
        <circle cx="45" cy="106" r="6" fill="#94a3b8" />
        <circle cx="235" cy="106" r="6" fill="#94a3b8" />
      </g>

      {/* Modern Vanity Counter & Backlit Round Mirror */}
      <g transform="translate(80, 110)">
        <ellipse cx="110" cy="95" rx="115" ry="22" fill="rgba(15, 23, 42, 0.12)" />
        {/* Counter */}
        <rect x="0" y="20" width="220" height="70" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2.5" />
        <rect x="-5" y="10" width="230" height="18" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
        {/* Basins */}
        <ellipse cx="65" cy="18" rx="35" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
        <ellipse cx="155" cy="18" rx="35" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Backlit Circular Mirror */}
        <circle cx="110" cy="-45" r="48" fill="#ffffff" stroke="#38bdf8" strokeWidth="4" />
        <circle cx="110" cy="-45" r="42" fill="#bae6fd" />
        <ellipse cx="100" cy="-55" rx="28" ry="14" fill="#ffffff" opacity="0.5" transform="rotate(-30 100 -55)" />
      </g>

      {/* Laundry Washing Machine & Sorter Area */}
      <g transform="translate(380, 420)">
        <ellipse cx="130" cy="155" rx="135" ry="26" fill="rgba(15, 23, 42, 0.12)" />
        {/* Washing machine unit */}
        <rect x="0" y="0" width="130" height="150" rx="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
        {/* Control panel */}
        <rect x="10" y="12" width="110" height="24" rx="4" fill="#0f172a" />
        <circle cx="30" cy="24" r="5" fill="#22c55e" />
        <circle cx="50" cy="24" r="5" fill="#3b82f6" />
        {/* Circular front-loader door */}
        <circle cx="65" cy="90" r="42" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
        <circle cx="65" cy="90" r="32" fill="#38bdf8" opacity="0.6" />
        {/* Clothes inside spinning */}
        <ellipse cx="65" cy="95" rx="20" ry="14" fill="#ec4899" />
        {/* Laundry sorting hampers beside washer */}
        <g transform="translate(150, 40)">
          {/* Whites basket */}
          <rect x="0" y="0" width="50" height="65" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="25" cy="0" rx="22" ry="6" fill="#ffffff" />
          <ellipse cx="25" cy="-2" rx="18" ry="8" fill="#f1f5f9" />
          {/* Colors basket */}
          <rect x="65" y="0" width="50" height="65" rx="6" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="2" />
          <ellipse cx="90" cy="0" rx="22" ry="6" fill="#3b82f6" />
          <ellipse cx="90" cy="-2" rx="18" ry="8" fill="#ef4444" />
        </g>
      </g>

      {/* Heated Chrome Towel Rack */}
      <g transform="translate(1080, 200)">
        <rect x="0" y="0" width="60" height="140" rx="6" fill="none" stroke="#94a3b8" strokeWidth="4" />
        <line x1="0" y1="35" x2="60" y2="35" stroke="#94a3b8" strokeWidth="4" />
        <line x1="0" y1="70" x2="60" y2="70" stroke="#94a3b8" strokeWidth="4" />
        <line x1="0" y1="105" x2="60" y2="105" stroke="#94a3b8" strokeWidth="4" />
        {/* Folded mint towel */}
        <rect x="8" y="22" width="44" height="40" rx="4" fill="#2dd4bf" />
        <rect x="8" y="58" width="44" height="40" rx="4" fill="#f43f5e" />
      </g>
    </g>
  );
}

// ── 5. GARDEN & GREENHOUSE (0,0 to 1200,900) ──────────────────
export function GardenArt() {
  return (
    <g>
      {/* Ground - Lush Green Lawn with Clover Patches */}
      <rect x="0" y="0" width="1200" height="900" fill="#86efac" />
      {/* Clover texture */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle
          key={`clover-${i}`}
          cx={((i * 137) % 1150) + 30}
          cy={((i * 219) % 850) + 30}
          r={6 + (i % 3)}
          fill="#4ade80"
          opacity="0.45"
        />
      ))}

      {/* Winding Cobblestone Garden Path */}
      <path
        d="M 60 450 Q 300 480 500 350 T 900 480 T 1150 420"
        stroke="#cbd5e1"
        strokeWidth="65"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 60 450 Q 300 480 500 350 T 900 480 T 1150 420"
        stroke="#94a3b8"
        strokeWidth="60"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="16 10"
      />

      {/* Sunlit Glass Greenhouse */}
      <g transform="translate(680, 50)">
        <ellipse cx="140" cy="220" rx="150" ry="30" fill="rgba(15, 23, 42, 0.14)" />
        {/* Wall Frame */}
        <rect x="0" y="50" width="280" height="160" rx="8" fill="#e0f2fe" opacity="0.8" stroke="#78350f" strokeWidth="4" />
        {/* Glass panes grid */}
        <line x1="70" y1="50" x2="70" y2="210" stroke="#78350f" strokeWidth="3" />
        <line x1="140" y1="50" x2="140" y2="210" stroke="#78350f" strokeWidth="3" />
        <line x1="210" y1="50" x2="210" y2="210" stroke="#78350f" strokeWidth="3" />
        <line x1="0" y1="130" x2="280" y2="130" stroke="#78350f" strokeWidth="3" />
        {/* A-frame Glass Roof */}
        <polygon points="140,0 290,50 -10,50" fill="#bae6fd" opacity="0.85" stroke="#78350f" strokeWidth="4" />
        <line x1="140" y1="0" x2="140" y2="50" stroke="#78350f" strokeWidth="3" />
        {/* Potted seedlings inside greenhouse */}
        <circle cx="35" cy="180" r="14" fill="#22c55e" />
        <circle cx="105" cy="175" r="16" fill="#16a34a" />
        <circle cx="175" cy="178" r="15" fill="#4ade80" />
        <circle cx="245" cy="176" r="14" fill="#15803d" />
      </g>

      {/* Raised Wooden Garden Beds with Carrots, Lettuce & Tomatoes */}
      <g transform="translate(180, 180)">
        {/* Planter 1 */}
        <ellipse cx="110" cy="95" rx="115" ry="26" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="20" width="220" height="70" rx="6" fill="#78350f" stroke="#5b3a29" strokeWidth="3" />
        <ellipse cx="110" cy="20" rx="105" ry="20" fill="#451a03" />
        {/* Sprouting Carrots */}
        {[30, 70, 110, 150, 190].map((x, idx) => (
          <g key={`carrot-${idx}`} transform={`translate(${x}, 15)`}>
            <polygon points="-4,5 4,5 0,16" fill="#f97316" />
            <path d="M 0 5 Q -6 -10 -2 -18" stroke="#16a34a" strokeWidth="2.5" fill="none" />
            <path d="M 0 5 Q 0 -12 2 -20" stroke="#22c55e" strokeWidth="2.5" fill="none" />
            <path d="M 0 5 Q 6 -10 4 -18" stroke="#16a34a" strokeWidth="2.5" fill="none" />
          </g>
        ))}
      </g>

      {/* 3-Compartment Wooden Aerobic Compost Station */}
      <g transform="translate(180, 560)">
        <ellipse cx="130" cy="115" rx="135" ry="25" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="0" y="0" width="260" height="110" rx="6" fill="#78350f" stroke="#5b3a29" strokeWidth="3" />
        {/* Slats & Compost Layers */}
        <line x1="85" y1="0" x2="85" y2="110" stroke="#5b3a29" strokeWidth="3" />
        <line x1="175" y1="0" x2="175" y2="110" stroke="#5b3a29" strokeWidth="3" />
        {/* Compost material inside */}
        <rect x="8" y="30" width="70" height="72" rx="3" fill="#854d0e" />
        <rect x="92" y="45" width="76" height="58" rx="3" fill="#451a03" />
        <rect x="182" y="20" width="70" height="82" rx="3" fill="#1c1917" />
        {/* Green leaves on top */}
        <circle cx="42" cy="30" r="10" fill="#65a30d" />
        <circle cx="130" cy="45" r="9" fill="#eab308" />
      </g>

      {/* Sunflower Hedge along back fence */}
      <g transform="translate(70, 40)">
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={`sunflower-${i}`} transform={`translate(${i * 60}, 0)`}>
            <line x1="20" y1="60" x2="20" y2="10" stroke="#15803d" strokeWidth="3" />
            <circle cx="20" cy="10" r="16" fill="#facc15" />
            <circle cx="20" cy="10" r="8" fill="#78350f" />
          </g>
        ))}
      </g>

      {/* Birdbath with Water Ripples */}
      <g transform="translate(860, 540)">
        <ellipse cx="40" cy="95" rx="42" ry="16" fill="rgba(15, 23, 42, 0.12)" />
        <rect x="34" y="30" width="12" height="65" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
        <ellipse cx="40" cy="30" rx="45" ry="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2.5" />
        <ellipse cx="40" cy="28" rx="38" ry="12" fill="#38bdf8" />
        <circle cx="40" cy="28" r="4" fill="#ffffff" opacity="0.6" />
      </g>
    </g>
  );
}

// ── 6. SAFETY CORNER & WORKSHOP (0,0 to 1200,900) ─────────────
export function SafetyCornerArt() {
  return (
    <g>
      {/* Floor - Cushioned Safety Cork Flooring */}
      <rect x="0" y="0" width="1200" height="900" fill="#fff7ed" />
      {/* Diagonal Safety Hazard Border on Designated Workshop Zone */}
      <rect x="60" y="60" width="1080" height="780" rx="14" fill="#fed7aa" opacity="0.3" stroke="#f97316" strokeWidth="2" strokeDasharray="16 10" />

      {/* Sturdy Safety Detective Workbench */}
      <g transform="translate(360, 280)">
        <ellipse cx="240" cy="140" rx="245" ry="32" fill="rgba(15, 23, 42, 0.14)" />
        {/* Bench Base */}
        <rect x="0" y="25" width="480" height="105" rx="10" fill="#854d0e" stroke="#713f12" strokeWidth="3" />
        <rect x="-8" y="10" width="496" height="24" rx="6" fill="#a16207" stroke="#78350f" strokeWidth="2" />
        {/* Workbench Tools: Safety goggles, Magnifying Glass, Clipboard */}
        {/* Safety Goggles */}
        <g transform="translate(80, 2)">
          <ellipse cx="14" cy="4" rx="12" ry="7" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <ellipse cx="40" cy="4" rx="12" ry="7" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <line x1="26" y1="4" x2="28" y2="4" stroke="#0f172a" strokeWidth="2" />
        </g>
        {/* Magnifying Glass */}
        <circle cx="240" cy="2" r="14" fill="#e0f2fe" stroke="#eab308" strokeWidth="3" />
        <line x1="250" y1="12" x2="265" y2="24" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        {/* Safety Checklist Clipboard */}
        <rect x="360" y="-8" width="45" height="28" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="375" y="-12" width="15" height="6" rx="2" fill="#64748b" />
        <line x1="368" y1="0" x2="395" y2="0" stroke="#22c55e" strokeWidth="2" />
        <line x1="368" y1="8" x2="395" y2="8" stroke="#22c55e" strokeWidth="2" />
      </g>

      {/* Wall Pegboard with Outlined Safety Equipment */}
      <g transform="translate(140, 40)">
        <rect x="0" y="0" width="340" height="140" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
        {/* Pegboard holes */}
        {Array.from({ length: 10 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <circle key={`peg-${i}-${j}`} cx={i * 32 + 25} cy={j * 32 + 22} r="2" fill="#d97706" opacity="0.6" />
          ))
        )}
        {/* Flashlight hanging */}
        <rect x="40" y="30" width="16" height="50" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
        <polygon points="36,80 60,80 54,95 42,95" fill="#facc15" />
        {/* Safety Helmet */}
        <ellipse cx="140" cy="65" rx="30" ry="20" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        <line x1="110" y1="65" x2="170" y2="65" stroke="#eab308" strokeWidth="3" />
        {/* Work Gloves */}
        <rect x="220" y="40" width="24" height="45" rx="6" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      </g>

      {/* Wall-Mounted First-Aid Station */}
      <g transform="translate(680, 40)">
        <rect x="0" y="0" width="140" height="150" rx="10" fill="#ffffff" stroke="#ef4444" strokeWidth="3.5" />
        {/* Red Cross */}
        <rect x="58" y="35" width="24" height="70" rx="4" fill="#ef4444" />
        <rect x="35" y="58" width="70" height="24" rx="4" fill="#ef4444" />
        <text x="70" y="130" textAnchor="middle" fontSize="12" fontWeight="800" fill="#b91c1c">
          FIRST AID
        </text>
      </g>

      {/* Fire Safety Station: Fire Extinguisher & Blanket */}
      <g transform="translate(900, 40)">
        {/* Extinguisher */}
        <rect x="0" y="40" width="40" height="95" rx="14" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
        <rect x="12" y="24" width="16" height="18" rx="2" fill="#1e293b" />
        <line x1="28" y1="30" x2="45" y2="40" stroke="#1e293b" strokeWidth="3" />
        <text x="20" y="90" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff">
          FIRE
        </text>
        {/* Smoke Alarm on Wall */}
        <circle cx="110" cy="50" r="22" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="110" cy="50" r="6" fill="#22c55e">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Child-Safe Socket Protector & Corner Guard Display */}
      <g transform="translate(160, 520)">
        <rect x="0" y="0" width="200" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <text x="100" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a">
          Child-Safe Outlet Protectors
        </text>
        {/* Sockets */}
        <rect x="40" y="45" width="45" height="45" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="55" cy="65" r="4" fill="#cbd5e1" />
        <circle cx="70" cy="65" r="4" fill="#cbd5e1" />
        {/* Protected Socket */}
        <rect x="115" y="45" width="45" height="45" rx="6" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
        <text x="137" y="72" textAnchor="middle" fontSize="14" fontWeight="900" fill="#ffffff">
          ✓
        </text>
      </g>
    </g>
  );
}

// ── 7. DOORWAYS & INTERIOR CONNECTORS ─────────────────────────
export function DoorwaysArt() {
  return (
    <g pointerEvents="none">
      {/* ── WALL DIVIDER CAPS (Solid walls between rooms) ── */}

      {/* Vertical wall between Living & Kitchen (x: 1180): Top and bottom wall segments */}
      <rect x="1175" y="0" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="1175" y="740" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />

      {/* Vertical wall between Kitchen & Garden (x: 2380): Top and bottom wall segments */}
      <rect x="2375" y="0" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="2375" y="740" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />

      {/* Vertical wall between Bedroom & Bathroom (x: 1180): Top and bottom wall segments */}
      <rect x="1175" y="900" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="1175" y="1640" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />

      {/* Vertical wall between Bathroom & Safety (x: 2380): Top and bottom wall segments */}
      <rect x="2375" y="900" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="2375" y="1640" width="30" height="160" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />

      {/* Horizontal wall between Row 1 & Row 2 (y: 885) */}
      <rect x="0" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="940" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="1200" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="2140" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="2400" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />
      <rect x="3340" y="880" width="260" height="30" rx="4" fill="#5b3a29" stroke="#3d261a" strokeWidth="3" />

      {/* ── OPEN PASSAGEWAY THRESHOLDS & DIRECTIONAL RUNNERS ── */}

      {/* Living Room <-> Kitchen Passageway (y: 160 to 740, 580px wide) */}
      <g transform="translate(1180, 160)">
        {/* Soft floor glow */}
        <rect x="-30" y="0" width="60" height="580" rx="8" fill="#fde68a" opacity="0.25" />
        {/* Decorative wooden arch corners */}
        <path d="M -20 0 Q 0 40 20 0" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M -20 580 Q 0 540 20 580" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Passage Chevron markers on floor */}
        <text x="0" y="270" textAnchor="middle" fontSize="18" fill="#a16207" opacity="0.6" fontWeight="900">
          ◀ ▶
        </text>
        <text x="0" y="420" textAnchor="middle" fontSize="18" fill="#a16207" opacity="0.6" fontWeight="900">
          ◀ ▶
        </text>
      </g>

      {/* Kitchen <-> Garden Patio Passageway (y: 160 to 740, 580px wide) */}
      <g transform="translate(2380, 160)">
        <rect x="-30" y="0" width="60" height="580" rx="8" fill="#bbf7d0" opacity="0.3" />
        <path d="M -20 0 Q 0 40 20 0" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M -20 580 Q 0 540 20 580" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="0" y="320" textAnchor="middle" fontSize="18" fill="#15803d" opacity="0.6" fontWeight="900">
          ◀ ▶
        </text>
      </g>

      {/* Bedroom <-> Bathroom Passageway (y: 1060 to 1640, 580px wide) */}
      <g transform="translate(1180, 1060)">
        <rect x="-30" y="0" width="60" height="580" rx="8" fill="#e0e7ff" opacity="0.3" />
        <path d="M -20 0 Q 0 40 20 0" stroke="#4338ca" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M -20 580 Q 0 540 20 580" stroke="#4338ca" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="0" y="320" textAnchor="middle" fontSize="18" fill="#4338ca" opacity="0.6" fontWeight="900">
          ◀ ▶
        </text>
      </g>

      {/* Bathroom <-> Safety Corner Passageway (y: 1060 to 1640, 580px wide) */}
      <g transform="translate(2380, 1060)">
        <rect x="-30" y="0" width="60" height="580" rx="8" fill="#fed7aa" opacity="0.3" />
        <path d="M -20 0 Q 0 40 20 0" stroke="#c2410c" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M -20 580 Q 0 540 20 580" stroke="#c2410c" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="0" y="320" textAnchor="middle" fontSize="18" fill="#c2410c" opacity="0.6" fontWeight="900">
          ◀ ▶
        </text>
      </g>

      {/* Living Room <-> Bedroom Hallway (x: 260 to 940, 680px wide) */}
      <g transform="translate(260, 880)">
        <rect x="0" y="-30" width="680" height="60" rx="8" fill="#fde68a" opacity="0.25" />
        <path d="M 0 -20 Q 40 0 0 20" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 680 -20 Q 640 0 680 20" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="240" y="8" textAnchor="middle" fontSize="18" fill="#a16207" opacity="0.6" fontWeight="900">
          ▲ ▼
        </text>
        <text x="440" y="8" textAnchor="middle" fontSize="18" fill="#a16207" opacity="0.6" fontWeight="900">
          ▲ ▼
        </text>
      </g>

      {/* Kitchen <-> Bathroom Corridor (x: 1460 to 2140, 680px wide) */}
      <g transform="translate(1460, 880)">
        <rect x="0" y="-30" width="680" height="60" rx="8" fill="#bae6fd" opacity="0.25" />
        <path d="M 0 -20 Q 40 0 0 20" stroke="#0369a1" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 680 -20 Q 640 0 680 20" stroke="#0369a1" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="340" y="8" textAnchor="middle" fontSize="18" fill="#0369a1" opacity="0.6" fontWeight="900">
          ▲ ▼
        </text>
      </g>

      {/* Garden <-> Safety Corner Pathway (x: 2660 to 3340, 680px wide) */}
      <g transform="translate(2660, 880)">
        <rect x="0" y="-30" width="680" height="60" rx="8" fill="#fed7aa" opacity="0.25" />
        <path d="M 0 -20 Q 40 0 0 20" stroke="#c2410c" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 680 -20 Q 640 0 680 20" stroke="#c2410c" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="340" y="8" textAnchor="middle" fontSize="18" fill="#c2410c" opacity="0.6" fontWeight="900">
          ▲ ▼
        </text>
      </g>
    </g>
  );
}
