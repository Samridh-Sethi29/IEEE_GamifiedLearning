// The hero, idling at the village plaza: shadow, breathing bob, blinking eyes
// and a floating nameplate with the current level.

export default function PlayerAvatar({ name, level, x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="player-avatar">
      <ellipse className="anim-shadow" cx="0" cy="7" rx="25" ry="9" fill="rgba(15, 23, 42, 0.3)" />
      <g className="anim-idle">
        <rect x="-11" y="-26" width="8.5" height="21" rx="4" fill="#3e5c9a" />
        <rect x="2.5" y="-26" width="8.5" height="21" rx="4" fill="#344e88" />
        <path d="M -14 -58 Q 0 -65 14 -58 L 12.5 -24 Q 0 -19 -12.5 -24 Z" fill="#22a45d" />
        <path d="M -13 -38 Q 0 -33 13 -38 L 13 -33 Q 0 -28 -13 -33 Z" fill="#7a4a21" />
        <rect x="-21" y="-56" width="7.5" height="25" rx="3.75" fill="#1f8e51" />
        <rect x="13.5" y="-56" width="7.5" height="25" rx="3.75" fill="#1f8e51" />
        <circle cx="0" cy="-73" r="16.5" fill="#f8c89b" />
        <path d="M -16.5 -73 a 16.5 16.5 0 0 1 33 0 Z" fill="#5b3a29" />
        <g className="anim-blink">
          <circle cx="-6" cy="-71" r="2.1" fill="#292524" />
          <circle cx="6" cy="-71" r="2.1" fill="#292524" />
        </g>
        <path d="M -4 -63 q 4 3 8 0" stroke="#b4562f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      <foreignObject x="-80" y="-142" width="160" height="40" pointerEvents="none">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="player-nameplate" data-testid="player-nameplate">
            <span className="font-heading text-[13px] font-bold text-slate-900">{name}</span>
            <span className="rounded-full bg-amber-400 px-1.5 py-px text-[10px] font-extrabold text-amber-950" data-testid="player-level-chip">
              Lv {level}
            </span>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
