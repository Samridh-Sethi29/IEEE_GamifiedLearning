import GameHUD from "@/features/hud/components/GameHUD";
import WorldMap from "@/features/world/components/WorldMap";
import { Link } from "react-router-dom";
import { Moon } from "lucide-react";

export default function WorldMapPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0c699d]" data-testid="world-map-page">
      <WorldMap />
      <GameHUD objective="Choose where you want to begin." />
      
      <div className="fixed bottom-6 right-6 z-50">
        <Link 
          to="/night"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-indigo-900/50 font-bold flex items-center gap-3 transition-transform active:scale-95 border-2 border-indigo-400"
        >
          <Moon className="w-6 h-6" />
          End Day
        </Link>
      </div>
    </div>
  );
}
