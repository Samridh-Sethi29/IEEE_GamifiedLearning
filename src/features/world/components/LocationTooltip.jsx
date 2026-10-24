export default function LocationTooltip({ location, y }) {
  return (
    <foreignObject x="-145" y={y} width="290" height="160" pointerEvents="none">
      <div
        className="loc-tooltip backdrop-blur-md border border-amber-400/25 shadow-2xl"
        data-testid={`location-tooltip-${location.id}`}
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[18px] leading-none drop-shadow-sm">{location.icon}</span>
            <span className="font-heading text-[15px] font-extrabold tracking-tight" style={{ color: "#fcd34d" }}>
              {location.name}
            </span>
          </div>
          {location.scene?.kicker && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-300/80 border border-amber-400/20">
              {location.scene.kicker.replace(" World", "")}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: "#cbd5e1" }}>
          {location.description}
        </p>
        <div className="enter-badge mt-2.5">
          ENTER
          <span className="kbd">⏎</span>
        </div>
      </div>
    </foreignObject>
  );
}
