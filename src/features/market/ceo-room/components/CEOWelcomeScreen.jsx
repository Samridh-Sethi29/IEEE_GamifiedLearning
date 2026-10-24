import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Users,
  PieChart,
  IndianRupee,
  Briefcase,
  Sparkles,
  Info,
} from "lucide-react";
import { COMPANY_PROFILE, formatRupees, calculateProfit, calculateMargin } from "../data/scenarios";

export default function CEOWelcomeScreen({ onStartSimulation }) {
  const { initialMetrics } = COMPANY_PROFILE;
  const initialProfit = calculateProfit(initialMetrics.revenue, initialMetrics.expenses);
  const initialMargin = calculateMargin(initialMetrics.revenue, initialMetrics.expenses);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 bg-[#090d16] text-slate-100 select-none">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <Link
          to="/world/market"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Market</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block">
              Business Simulation
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-white">
              CEO Decision Room
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Briefing & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Executive Challenge Active
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Run a Company. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  Live with the Consequences.
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed pt-2">
                Step into the executive suite as CEO of{" "}
                <span className="font-bold text-white">{COMPANY_PROFILE.name}</span>. You will navigate
                real-world business problems: raw material inflation, angry customer reviews, team burnout,
                capital expansion, and aggressive price-slashing rivals.
              </p>
            </div>

            {/* Strategic Pillars to Learn */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Financial Logic
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Revenue, unit margins, and managing cash flow under uncertainty.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Trade-Offs
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Balancing short-term profit spikes against lasting customer trust.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onStartSimulation}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Boardroom & Start</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Company Dossier Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Target Enterprise
                  </span>
                  <h3 className="text-xl font-black text-white">{COMPANY_PROFILE.name}</h3>
                  <span className="text-xs text-cyan-300 font-semibold">{COMPANY_PROFILE.industry}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              {/* Baseline Metrics Grid */}
              <div className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    Starting Cash
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {formatRupees(initialMetrics.cash)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Quarterly Revenue
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {formatRupees(initialMetrics.revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <PieChart className="w-4 h-4 text-rose-400" />
                    Quarterly Expenses
                  </span>
                  <span className="font-extrabold text-rose-300 text-sm">
                    {formatRupees(initialMetrics.expenses)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="block text-[11px] text-slate-400">Net Margin</span>
                    <span className="font-extrabold text-cyan-400 text-sm">{initialMargin}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="block text-[11px] text-slate-400">Trust</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {initialMetrics.customerTrust}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="block text-[11px] text-slate-400">Morale</span>
                    <span className="font-extrabold text-purple-400 text-sm">
                      {initialMetrics.employeeMorale}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Fictional educational simulation. All company figures, market reactions, and currency values are simulated for business learning.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Skillverse Market Academy • CEO Strategic Business Simulator
      </footer>
    </div>
  );
}
