import { STATION_ART } from "@/features/studio/art/StationArt";

// One illustrated station in the campus. A real <button> laid over the scene, so click, touch,
// Enter and Space all work and screen readers announce the name, purpose and pressed state.
// Selecting never navigates; the explicit "Enter" action lives in the preview panel.
export default function StationButton({ tool, selected, onSelect }) {
  const Art = STATION_ART[tool.id];
  return (
    <button
      type="button"
      className="studio-station"
      data-station={tool.id}
      data-accent={tool.accent}
      aria-pressed={selected}
      aria-label={`${tool.title}. ${tool.description}${tool.available ? "" : " Coming soon."}`}
      onClick={() => onSelect(tool.id)}
      data-testid={`studio-station-${tool.id}`}
    >
      <span className="studio-station-glow" aria-hidden="true" />
      <Art />
      <span className="studio-station-label" aria-hidden="true">
        {tool.title}
      </span>
    </button>
  );
}
