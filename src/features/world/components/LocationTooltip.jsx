export default function LocationTooltip({ location, y }) {
  return (
    <foreignObject x="-135" y={y} width="270" height="150" pointerEvents="none">
      <div className="loc-tooltip" data-testid={`location-tooltip-${location.id}`}>
        <div className="flex items-center gap-2">
          <span className="text-[17px] leading-none">{location.icon}</span>
          <span className="font-heading text-[15px] font-extrabold tracking-tight" style={{ color: "#fcd34d" }}>
            {location.name}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "#cbd5e1" }}>
          {location.description}
        </p>
        <div className="enter-badge">
          ENTER
          <span className="kbd">⏎</span>
        </div>
      </div>
    </foreignObject>
  );
}
