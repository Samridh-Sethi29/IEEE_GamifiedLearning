import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  PieChart,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { formatRupees } from "../data/simulationEngine";

export default function CEOExecutiveHeader({ state, onResetSession, onOpenBriefing }) {
  const isCashCritical = state.cash < 1500000;
  const isCashWarning = state.cash < 2500000;

  return (
    <header className="ceo-corp-header">
      <div className="ceo-corp-header-inner">
        {/* Left: Back & Company Brand */}
        <div className="ceo-brand-badge">
          <Link
            to="/world/market"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-xs font-bold"
            title="Return to Market District"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Market</span>
          </Link>

          <div className="ceo-brand-logo">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="ceo-brand-text">
            <h1>NEXORA MOBILITY CORP.</h1>
            <span>Executive Strategy War Room • FY 2026</span>
          </div>
        </div>

        {/* Right: Quarter Indicator, Briefing & Reset */}
        <div className="flex items-center gap-3">
          {onOpenBriefing && (
            <button
              onClick={onOpenBriefing}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Briefing</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
            Quarter {Math.min(state.quarter, state.maxQuarters)} of {state.maxQuarters}
          </div>

          <button
            onClick={onResetSession}
            title="Reset Simulation"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corporate Ticker Ribbon */}
      <div className="ceo-ticker-bar mt-2 -mx-5 px-5">
        <div className="ceo-ticker-inner">
          {/* 1. Treasury */}
          <div className="ceo-ticker-item">
            <span className="ceo-ticker-label">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
              Cash Treasury
            </span>
            <span
              className={`ceo-ticker-value ${
                isCashCritical ? "critical" : isCashWarning ? "warning" : "positive"
              }`}
            >
              {formatRupees(state.cash)}
            </span>
          </div>

          {/* 2. Customer Trust */}
          <div className="ceo-ticker-item">
            <span className="ceo-ticker-label">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Customer Trust
            </span>
            <span
              className={`ceo-ticker-value ${
                state.customerTrust >= 75
                  ? "positive"
                  : state.customerTrust >= 50
                  ? "warning"
                  : "critical"
              }`}
            >
              {state.customerTrust}/100
            </span>
          </div>

          {/* 3. Market Share */}
          <div className="ceo-ticker-item">
            <span className="ceo-ticker-label">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Market Share
            </span>
            <span className="ceo-ticker-value text-cyan-300">
              {state.marketShare}%
            </span>
          </div>

          {/* 4. Fleet Status */}
          <div className="ceo-ticker-item">
            <span className="ceo-ticker-label">
              <PieChart className="w-3.5 h-3.5 text-amber-400" />
              Logistics Asset
            </span>
            <span className="ceo-ticker-value text-amber-300">
              {state.hasOwnedFleet ? "In-House Fleet" : "3PL Agency"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
