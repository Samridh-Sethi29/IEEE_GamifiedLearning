import GameHUD from "@/features/hud/components/GameHUD";
import WorldMap from "@/features/world/components/WorldMap";

export default function WorldMapPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0c699d]" data-testid="world-map-page">
      <WorldMap />
      <GameHUD objective="Choose where you want to begin." />
    </div>
  );
}
