import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  Users,
  Target,
  BookOpen,
} from "lucide-react";
import { formatRupees } from "../data/scenarios";

export default function CEODecisionFeedback({
  decision,
  challenge,
  isLastChallenge,
  onContinue,
}) {
  const { option, oldMetrics, newMetrics } = decision;

  const cashDelta = newMetrics.cash - oldMetrics.cash;
  const revenueDelta = newMetrics.revenue - oldMetrics.revenue;
  const expensesDelta = newMetrics.expenses - oldMetrics.expenses;
  const trustDelta = newMetrics.customerTrust - oldMetrics.customerTrust;
  const moraleDelta = newMetrics.employeeMorale - oldMetrics.employeeMorale;
  const shareDelta = newMetrics.marketShare - oldMetrics.marketShare;

  return (
    <div className="w-full rounded-3xl bg-slate-900/95 border border-slate-700/80 p-5 sm:p-7 shadow-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
              Quarter Execution Report
            </span>
            <h3 className="font-heading font-black text-lg sm:text-xl text-white">
              {challenge.title} — Option {option.id} Executed
            </h3>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
          {option.label}
        </span>
      </div>

      {/* Immediate Impact Metric Changes */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Simulated Financial & Operational Impact:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Cash */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Liquid Cash</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {cashDelta < 0 ? (
                <span className="text-rose-400">{formatRupees(cashDelta)}</span>
              ) : cashDelta > 0 ? (
                <span className="text-emerald-400">+{formatRupees(cashDelta)}</span>
              ) : (
                <span className="text-slate-400">No change</span>
              )}
            </div>
          </div>

          {/* Revenue */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Revenue / Qtr</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {revenueDelta > 0 ? (
                <span className="text-emerald-400">+{formatRupees(revenueDelta)}</span>
              ) : revenueDelta < 0 ? (
                <span className="text-rose-400">{formatRupees(revenueDelta)}</span>
              ) : (
                <span className="text-slate-400">Unchanged</span>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Expenses / Qtr</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {expensesDelta > 0 ? (
                <span className="text-rose-400">+{formatRupees(expensesDelta)}</span>
              ) : expensesDelta < 0 ? (
                <span className="text-emerald-400">{formatRupees(expensesDelta)}</span>
              ) : (
                <span className="text-slate-400">Unchanged</span>
              )}
            </div>
          </div>

          {/* Customer Trust */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Customer Trust</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {trustDelta > 0 ? (
                <span className="text-emerald-400">+{trustDelta} pts</span>
              ) : trustDelta < 0 ? (
                <span className="text-rose-400">{trustDelta} pts</span>
              ) : (
                <span className="text-slate-400">0 pts</span>
              )}
            </div>
          </div>

          {/* Employee Morale */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Employee Morale</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {moraleDelta > 0 ? (
                <span className="text-emerald-400">+{moraleDelta} pts</span>
              ) : moraleDelta < 0 ? (
                <span className="text-rose-400">{moraleDelta} pts</span>
              ) : (
                <span className="text-slate-400">0 pts</span>
              )}
            </div>
          </div>

          {/* Market Share */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Market Share</span>
            <div className="mt-1 flex items-center gap-1 font-extrabold text-sm">
              {shareDelta > 0 ? (
                <span className="text-emerald-400">+{shareDelta}%</span>
              ) : shareDelta < 0 ? (
                <span className="text-rose-400">{shareDelta}%</span>
              ) : (
                <span className="text-slate-400">0%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Immediate & Delayed Consequence Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Immediate Consequence
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {option.immediateImpact}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Strategic Delayed Consequence
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {option.delayedImpact}
          </p>
        </div>
      </div>

      {/* Learning Takeaway Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">
            Business Concept: {option.concept}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {option.explanation}
        </p>
        <div className="pt-2 border-t border-indigo-500/20 flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Core Takeaway: {option.takeaway}</span>
        </div>
      </div>

      {/* Continue CTA Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>{isLastChallenge ? "View Final Executive Report" : "Advance to Next Quarter"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
