import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Package,
  ShieldCheck,
  Coins,
  Store,
  Briefcase,
} from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import RealisticWater from "@/components/water/RealisticWater";

export default function MarketWorld() {
  const { player } = usePlayer();

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#0f172a] text-slate-100 select-none">
      {/* Ambient background water & gradient */}
      <RealisticWater
        preset="ocean"
        className="absolute inset-0 opacity-40 pointer-events-none"
        causticIntensity={0.8}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950 pointer-events-none" />

      <div className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
        {/* Top Navigation Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <Link
            to="/world"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-sm shadow-lg transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Village Map</span>
          </Link>

          {/* Player status pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs font-extrabold">
            <span className="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              Lv {player?.level || 1}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{player?.coins || 0}</span>
            </span>
            <span className="text-slate-400">Day {player?.day || 1}</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="my-auto py-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Skillverse Commerce & Enterprise District
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Choose Your Business Path
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Step onto the bustling market floor to master retail store
              logistics, or take the executive elevator to lead a corporation in
              the high-stakes CEO Decision Room.
            </p>
          </div>

          {/* The Two Distinct Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* CARD 1: Skillz Store Simulator (Existing 2D Game) */}
            <div className="rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 hover:border-amber-400/60 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 relative group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                    Retail Operations
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Skillz Market
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Operate a full 2D supermarket! Restock shelves from the
                    warehouse, direct customers across aisles, manage inventory,
                    and calculate exact change at checkout.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Inventory management & restock logistics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cash register math & Indian rupee change</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/world/market/store"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Open Store Simulator</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* CARD 2: CEO Decision Room (NEW Game) */}
            <div className="rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 hover:border-cyan-400/60 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/15 hover:-translate-y-1 relative group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                    Executive Strategy
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    CEO Decision Room
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Lead an electric vehicle enterprise through real-world
                    business challenges. Navigate battery cost inflation,
                    negative reviews, burnout, expansion, and price wars.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      Real profit margins, revenue & cash calculations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      Brand equity, employee morale & opportunity cost
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/world/market/ceo-decision-room"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Play CEO Decision Room</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/80">
          Skillverse Gamified Learning • Market Hub
        </footer>
      </div>
    </div>
  );
}
