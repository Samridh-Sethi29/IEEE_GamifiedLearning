import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FarmWorldMap from "@/features/world/components/FarmWorldMap";
import GameHUD from "@/features/hud/components/GameHUD";

// The Farm Hub screen: an interactive SVG map just like the main WorldMap.
export default function FarmWorld() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0c699d]" data-testid="farm-world-page">
      <FarmWorldMap />
      <GameHUD objective="Choose a farming activity." />
      
      {/* Back to World Navigation */}
      <div className="pointer-events-auto fixed left-4 top-[100px] z-40 sm:left-4">
        <Link 
          to="/world" 
          className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-4 py-2.5 text-[14px] font-bold text-slate-700 shadow-lg shadow-emerald-950/15 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to World
        </Link>
      </div>
    </div>
  );
}
