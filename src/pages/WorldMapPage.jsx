import GameHUD from "@/features/hud/components/GameHUD";
import WorldMap from "@/features/world/components/WorldMap";
import RealisticWater from "@/components/water/RealisticWater";


export default function WorldMapPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0c699d]" data-testid="world-map-page">
      <RealisticWater preset="ocean" className="absolute inset-0" causticIntensity={1.15} />
      <WorldMap />
      <GameHUD objective="Choose where you want to begin." />
    </div>
  );
}
