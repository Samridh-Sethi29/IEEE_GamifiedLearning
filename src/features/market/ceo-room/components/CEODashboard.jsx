import React from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldCheck,
  Users,
  Target,
  Clock,
  History,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatRupees, calculateProfit, calculateMargin } from "../data/scenarios";

export default function CEODashboard({
  metrics,
  currentChallenge,
  decisionHistory = [],
  onOpenHistory,
}) {
  const profit = calculateProfit(metrics.revenue, metrics.expenses);
  const margin = calculateMargin(metrics.revenue, metrics.expenses);
  const isProfitable = profit >= 0;
  const isCashCritical = metrics.cash < 1500000;

  return (
    <div className="w-full space-y-4">
      {/* Cash Alert Banner if low */}
      {isCashCritical && (
        <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Liquidity Warning:</strong> Cash reserves have dipped below ₹15,00,000. Be cautious with large upfront investments.
            </span>
          </div>
        </div>
      )}

      {/* Top Financial & Operational Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Liquid Cash */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            Cash Balance
          </span>
          <div className="mt-2">
            <span
              className={`font-heading font-black text-base sm:text-lg tracking-tight ${
                isCashCritical ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {formatRupees(metrics.cash)}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Liquid capital</span>
          </div>
        </div>

        {/* 2. Quarterly Revenue */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Revenue
          </span>
          <div className="mt-2">
            <span className="font-heading font-black text-base sm:text-lg text-white tracking-tight">
              {formatRupees(metrics.revenue)}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Per quarter</span>
          </div>
        </div>

        {/* 3. Operating Expenses */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-rose-400" />
            Expenses
          </span>
          <div className="mt-2">
            <span className="font-heading font-black text-base sm:text-lg text-rose-300 tracking-tight">
              {formatRupees(metrics.expenses)}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">COGS + Payroll + SG&A</span>
          </div>
        </div>

        {/* 4. Net Profit / Loss & Margin */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            {isProfitable ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            Net Profit
          </span>
          <div className="mt-2 flex items-baseline justify-between gap-1">
            <span
              className={`font-heading font-black text-base sm:text-lg tracking-tight ${
                isProfitable ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatRupees(profit)}
            </span>
            <span
              className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                isProfitable ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
              }`}
            >
              {margin}%
            </span>
          </div>
        </div>

        {/* 5. Customer Trust Gauge */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Trust
            </span>
            <span className="text-xs font-black text-amber-400">{metrics.customerTrust}/100</span>
          </div>
          <div className="mt-2">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, metrics.customerTrust))}%` }}
              />
            </div>
            <span className="block text-[10px] text-slate-400 mt-1">Brand equity</span>
          </div>
        </div>

        {/* 6. Employee Morale Gauge */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Morale
            </span>
            <span className="text-xs font-black text-purple-400">{metrics.employeeMorale}/100</span>
          </div>
          <div className="mt-2">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, metrics.employeeMorale))}%` }}
              />
            </div>
            <span className="block text-[10px] text-slate-400 mt-1">Culture & retention</span>
          </div>
        </div>

        {/* 7. Market Share */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Share
            </span>
            <span className="text-xs font-black text-blue-400">{metrics.marketShare}%</span>
          </div>
          <div className="mt-2">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, (metrics.marketShare / 40) * 100))}%` }}
              />
            </div>
            <span className="block text-[10px] text-slate-400 mt-1">EV market segment</span>
          </div>
        </div>
      </div>

      {/* Objective & History Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Quarter Objective: </span>
            <span className="font-bold text-slate-200">
              {currentChallenge ? currentChallenge.objective : "Review enterprise performance."}
            </span>
          </div>
        </div>

        {decisionHistory.length > 0 && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Decision Log ({decisionHistory.length})</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}
