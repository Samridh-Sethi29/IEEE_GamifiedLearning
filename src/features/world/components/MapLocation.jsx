import { LOCATION_ART, FARM_LOCATION_ART, SCHOOL_LOCATION_ART } from "./locationArt";
import LocationTooltip from "./LocationTooltip";

// One interactive landmark: ground patch + building art (scales up on hover),
// a rotating highlight ring, an invisible hit area for pointer/keyboard focus,
// and the floating tooltip with the ENTER prompt.
export default function MapLocation({ location, active, onHover, onEnter }) {
  const { id, name, color, position, hit, tooltipY, description } = location;
  const Art = LOCATION_ART[id] || FARM_LOCATION_ART[id] || SCHOOL_LOCATION_ART[id];
  return (
    <g transform={`translate(${position.x} ${position.y})`} data-testid={`map-location-${id}`}>
      <ellipse
        className={`loc-ring${active ? " is-on" : ""}`}
        cx="0"
        cy="-14"
        rx={hit.w * 0.54}
        ry={hit.h * 0.3}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray="16 14"
        strokeLinecap="round"
      />
      <g className={`loc-art${active ? " is-active" : ""}`}>
        <Art />
      </g>
      <g
        className="loc-hit"
        role="button"
        tabIndex={0}
        aria-label={`${name} — ${description}`}
        data-testid={`map-location-hit-${id}`}
        onPointerEnter={() => onHover(id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(id)}
        onBlur={() => onHover(null)}
        onClick={() => onEnter(location)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onEnter(location);
          }
        }}
      >
        <rect x={-hit.w / 2} y={hit.top} width={hit.w} height={hit.h} fill="transparent" />
      </g>
      {active && <LocationTooltip location={location} y={tooltipY} />}
    </g>
  );
}
