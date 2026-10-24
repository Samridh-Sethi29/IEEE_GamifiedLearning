import { useId } from "react";
import { PAL } from "@/features/studio/art/palette";

// Lightweight flat-cartoon SVG art for the World Builder briefing. Pure presentation: every piece is
// decorative (aria-hidden) except VillageScene, which carries a text description. Colours come from
// the Creative Studio palette only.

const ink = { stroke: PAL.ink, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" };
const DROP = "M0 -10 C 7 -1, 10 3, 10 7 A10 10 0 0 1 -10 7 C -10 3, -7 -1, 0 -10 Z";

function Icon({ size = 56, children }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false" className="wb-art">
      {children}
    </svg>
  );
}

export function HouseArt(props) {
  return (
    <Icon {...props}>
      <rect x="14" y="28" width="36" height="26" rx="2" fill={PAL.surface} {...ink} />
      <polygon points="8,31 32,9 56,31" fill={PAL.coral} {...ink} />
      <rect x="27" y="38" width="10" height="16" rx="2" fill={PAL.wood} {...ink} />
      <rect x="17" y="34" width="7" height="7" rx="1" fill={PAL.envLight} {...ink} strokeWidth="2" />
      <rect x="40" y="34" width="7" height="7" rx="1" fill={PAL.envLight} {...ink} strokeWidth="2" />
    </Icon>
  );
}

export function FarmArt(props) {
  return (
    <Icon {...props}>
      <path d="M8 40 H56 L60 56 H4 Z" fill={PAL.woodLight} {...ink} />
      <path d="M12 48 H52" stroke={PAL.ink} strokeWidth="1.5" opacity=".5" />
      {[18, 32, 46].map((x) => (
        <g key={x}>
          <path d={`M${x} 46 V32`} stroke={PAL.leaf} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx={x - 6} cy="33" rx="6" ry="3.5" transform={`rotate(-25 ${x - 6} 33)`} fill={PAL.leafMid} {...ink} strokeWidth="1.8" />
          <ellipse cx={x + 6} cy="30" rx="6" ry="3.5" transform={`rotate(25 ${x + 6} 30)`} fill={PAL.leafLight} {...ink} strokeWidth="1.8" />
        </g>
      ))}
    </Icon>
  );
}

export function WellArt(props) {
  return (
    <Icon {...props}>
      <path d="M17 36 V16 M47 36 V16" stroke={PAL.wood} strokeWidth="4" strokeLinecap="round" />
      <polygon points="9,19 32,6 55,19" fill={PAL.wood} {...ink} />
      <path d="M32 19 V34" stroke={PAL.ink} strokeWidth="2" />
      <rect x="14" y="36" width="36" height="18" rx="3" fill={PAL.plaza} {...ink} />
      <path d="M26 36 V45 M38 45 V54 M20 45 H30" stroke={PAL.plazaEdge} strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="36" rx="18" ry="5" fill={PAL.waterDeep} {...ink} />
      <ellipse cx="32" cy="36" rx="13" ry="3" fill={PAL.water} />
    </Icon>
  );
}

export function PipeArt(props) {
  return (
    <Icon {...props}>
      <path d="M6 20 H38 V54" fill="none" stroke={PAL.ink} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 20 H38 V54" fill="none" stroke={PAL.slateLight} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20 H38 V50" fill="none" stroke={PAL.water} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 9" />
      <rect x="31" y="13" width="14" height="14" rx="3" fill={PAL.slate} {...ink} strokeWidth="2" />
    </Icon>
  );
}

export function DripArt(props) {
  return (
    <Icon {...props}>
      <path d="M6 14 H58" stroke={PAL.ink} strokeWidth="7" strokeLinecap="round" />
      <path d="M6 14 H58" stroke={PAL.slateLight} strokeWidth="3.5" strokeLinecap="round" />
      {[16, 32, 48].map((x) => (
        <g key={x}>
          <g transform={`translate(${x} 28) scale(.55)`}>
            <path d={DROP} fill={PAL.water} {...ink} strokeWidth="3.5" />
          </g>
          <path d={`M${x} 56 V45`} stroke={PAL.leaf} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx={x - 5} cy="46" rx="5" ry="3" transform={`rotate(-25 ${x - 5} 46)`} fill={PAL.leafMid} {...ink} strokeWidth="1.8" />
          <ellipse cx={x + 5} cy="44" rx="5" ry="3" transform={`rotate(25 ${x + 5} 44)`} fill={PAL.leafLight} {...ink} strokeWidth="1.8" />
        </g>
      ))}
    </Icon>
  );
}

export function CoinsArt(props) {
  return (
    <Icon {...props}>
      {[44, 34, 24].map((y) => (
        <g key={y}>
          <ellipse cx="32" cy={y + 8} rx="18" ry="7" fill={PAL.gold} {...ink} />
          <rect x="14" y={y} width="36" height="8" fill={PAL.gold} />
          <path d={`M14 ${y} V${y + 8} M50 ${y} V${y + 8}`} {...ink} fill="none" />
          <ellipse cx="32" cy={y} rx="18" ry="7" fill={PAL.sun} {...ink} />
        </g>
      ))}
    </Icon>
  );
}

// A water tank. `fill` (0-1) is how full it looks; `mark` draws a small reserve line.
export function TankArt({ fill = 1, mark = false, ...props }) {
  const id = useId();
  const top = 54 - 42 * fill;
  return (
    <Icon {...props}>
      <defs><clipPath id={id}><rect x="15" y="12" width="34" height="42" rx="8" /></clipPath></defs>
      <rect x="15" y="12" width="34" height="42" rx="8" fill={PAL.surface} />
      <g clipPath={`url(#${id})`}>
        <rect x="15" y={top} width="34" height={56 - top} fill={PAL.water} />
        <path d={`M15 ${top} q4 -4 8.5 0 t8.5 0 t8.5 0 t8.5 0`} fill="none" stroke="#fff" strokeWidth="2" opacity=".8" />
      </g>
      {mark && <path d="M15 46 H49" stroke={PAL.coralDeep} strokeWidth="2.5" strokeDasharray="4 3" />}
      <rect x="15" y="12" width="34" height="42" rx="8" fill="none" {...ink} />
      <rect x="25" y="6" width="14" height="6" rx="2" fill={PAL.slate} {...ink} strokeWidth="2" />
    </Icon>
  );
}

function House({ x, y, roof }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="44" ry="6" fill={PAL.shadow} />
      <rect x="-34" y="-44" width="68" height="44" rx="2" fill={PAL.surface} {...ink} />
      <polygon points="-43,-41 0,-82 43,-41" fill={roof} {...ink} />
      <rect x="-8" y="-26" width="16" height="26" rx="3" fill={PAL.wood} {...ink} strokeWidth="2" />
      <rect x="-27" y="-34" width="14" height="14" rx="2" fill={PAL.envLight} {...ink} strokeWidth="2" />
      <rect x="13" y="-34" width="14" height="14" rx="2" fill={PAL.envLight} {...ink} strokeWidth="2" />
    </g>
  );
}

// An empty, dashed water-drop bubble: "this building has no water yet".
function ThirstyBubble({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="wb-bob" style={{ animationDelay: `${delay}s` }}>
        <polygon points="-6,15 6,15 0,26" fill="#fff" />
        <rect x="-19" y="-19" width="38" height="36" rx="13" fill="#fff" stroke={PAL.waterDeep} strokeWidth="2.5" strokeDasharray="5 4" />
        <path d={DROP} transform="translate(0 -1) scale(.95)" fill="none" stroke={PAL.waterDeep} strokeWidth="2.5" strokeDasharray="4 3" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function WiltedCrop({ x, y }) {
  return (
    <g fill="none" strokeLinecap="round" strokeWidth="3">
      <path d={`M${x} ${y} V${y - 12}`} stroke="#a3873a" />
      <path d={`M${x} ${y - 12} q-9 -1 -10 8`} stroke={PAL.sandEdge} />
      <path d={`M${x} ${y - 12} q9 -1 10 8`} stroke={PAL.sandEdge} />
    </g>
  );
}

// The opening picture: the well has water, but nothing is connected and the village is thirsty.
export function VillageScene() {
  const uid = useId();
  const sky = `${uid}-sky`;
  const title = `${uid}-t`;
  return (
    <svg viewBox="0 0 640 360" className="wb-scene-svg" role="img" aria-labelledby={title}>
      <title id={title}>
        A village with a well and a water tank. Four houses and a farm have dashed, empty water drops above them, and the
        farm's crops are drooping, because no pipes connect them to the well yet.
      </title>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.env} />
          <stop offset="1" stopColor={PAL.envLight} />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${sky})`} />
      <circle cx="560" cy="58" r="38" fill={PAL.sunSoft} opacity=".7" />
      <circle cx="560" cy="58" r="26" fill={PAL.sun} />
      {[[110, 62, 1], [400, 44, 0.8]].map(([cx, cy, s]) => (
        <g key={cx} transform={`translate(${cx} ${cy}) scale(${s})`} fill="#fff" opacity=".95">
          <ellipse cx="0" cy="0" rx="34" ry="13" /><ellipse cx="-16" cy="-9" rx="17" ry="12" /><ellipse cx="12" cy="-12" rx="20" ry="14" />
        </g>
      ))}
      <path d="M0 232 Q110 168 230 214 T450 204 T640 218 V360 H0 Z" fill={PAL.groundPale} />
      <path d="M0 244 Q160 224 320 238 T640 232 V360 H0 Z" fill={PAL.ground} />
      <path d="M0 304 Q200 288 400 304 T640 298 V360 H0 Z" fill={PAL.groundDark} />

      {/* tank on a tower, behind the well */}
      <g>
        <path d="M303 242 L309 196 M337 242 L331 196 M306 224 H334" stroke={PAL.wood} strokeWidth="5" strokeLinecap="round" />
        <rect x="290" y="150" width="60" height="48" rx="12" fill={PAL.slateLight} {...ink} />
        <rect x="297" y="172" width="46" height="20" rx="8" fill={PAL.water} />
        <path d="M290 164 H350" stroke={PAL.ink} strokeWidth="2" opacity=".5" />
        <rect x="312" y="141" width="16" height="9" rx="3" fill={PAL.slate} {...ink} strokeWidth="2" />
      </g>

      {/* dotted routes: pipes that have not been built */}
      <g fill="none" stroke={PAL.waterDeep} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" opacity=".95">
        <path d="M268 308 H234 V272 H80 V250 M180 272 V250 M234 272 V298" />
        <path d="M372 308 H408 V272 H570 V250 M470 272 V250" />
      </g>

      {/* houses */}
      <House x={80} y={246} roof={PAL.coral} />
      <House x={180} y={240} roof={PAL.orange} />
      <House x={470} y={240} roof={PAL.coral} />
      <House x={570} y={246} roof={PAL.orange} />
      <ThirstyBubble x={80} y={136} delay={0} />
      <ThirstyBubble x={180} y={130} delay={0.3} />
      <ThirstyBubble x={470} y={130} delay={0.6} />
      <ThirstyBubble x={570} y={136} delay={0.9} />

      {/* thirsty farm */}
      <path d="M40 300 H236 L258 350 H16 Z" fill={PAL.woodLight} {...ink} />
      <path d="M32 320 H246 M26 336 H252" stroke={PAL.ink} strokeWidth="2" opacity=".35" />
      <path d="M96 304 l6 8 l-5 6 M206 326 l7 6 l-4 7" fill="none" stroke={PAL.ink} strokeWidth="2" opacity=".5" strokeLinecap="round" />
      {[[70, 322], [118, 322], [166, 322], [212, 322], [56, 342], [112, 342], [168, 342], [226, 342]].map(([x, y]) => (
        <WiltedCrop key={`${x}-${y}`} x={x} y={y} />
      ))}
      <ThirstyBubble x={30} y={272} delay={1.2} />

      {/* the well: water is available here */}
      <ellipse cx="320" cy="326" rx="58" ry="10" fill={PAL.shadow} />
      <path d="M276 292 V240 M364 292 V240" stroke={PAL.wood} strokeWidth="7" strokeLinecap="round" />
      <polygon points="262,246 320,208 378,246" fill={PAL.wood} {...ink} />
      <path d="M320 246 V284" stroke={PAL.ink} strokeWidth="2.5" />
      <rect x="312" y="278" width="16" height="12" rx="3" fill={PAL.woodLight} {...ink} strokeWidth="2" />
      <rect x="268" y="292" width="104" height="34" rx="6" fill={PAL.plaza} {...ink} />
      <path d="M296 292 V308 M326 308 V326 M344 292 V306 M276 308 H306" stroke={PAL.plazaEdge} strokeWidth="2.5" fill="none" />
      <ellipse cx="320" cy="292" rx="52" ry="12" fill={PAL.waterDeep} {...ink} />
      <ellipse cx="320" cy="292" rx="42" ry="8" fill={PAL.water} />
      <path d="M300 292 q6 -3 12 0 M326 293 q6 -3 12 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* trees and bushes */}
      {[[520, 316, 1], [600, 306, 0.85]].map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-5" y="-26" width="10" height="28" rx="3" fill={PAL.wood} {...ink} strokeWidth="2" />
          <circle cx="0" cy="-42" r="24" fill={PAL.leafMid} {...ink} />
          <circle cx="-9" cy="-48" r="8" fill={PAL.leafLight} opacity=".8" />
        </g>
      ))}
    </svg>
  );
}
