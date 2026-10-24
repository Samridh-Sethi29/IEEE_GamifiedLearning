import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  TrendingUp,
  ShieldCheck,
  Coins,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Building2,
  ArrowRight,
} from "lucide-react";
import { formatRupees, evaluateAnnualPerformance } from "../data/simulationEngine";

export default function CEOAnnualReport({
  state,
  onResetSession,
  onClaimReward,
}) {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const evaluation = evaluateAnnualPerformance(state);

  const handleClaim = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    if (onClaimReward) {
      onClaimReward({
        coins: 500,
        xp: 250,
      });
    }
  };

  const gradeClass =
    evaluation.grade === "A+" || evaluation.grade === "A"
      ? "ceo-grade-A"
      : evaluation.grade === "B"
      ? "ceo-grade-B"
      : evaluation.grade === "C"
      ? "ceo-grade-C"
      : "ceo-grade-F";

  return (
    <div className="ceo-annual-card">
      {/* Top Annual Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Annual Shareholder Meeting • Fiscal Year Review
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-black text-white">
            Board of Directors CEO Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Nexora Mobility Corp. • Complete 4-Quarter Fiscal Performance Summary
          </p>
        </div>

        {/* Big Grade Badge */}
        <div className={`ceo-grade-badge ${gradeClass}`}>
          {evaluation.grade}
        </div>
      </div>

      {/* Executive Title & Verdict */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Executive Title Awarded: {evaluation.title}</span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          {evaluation.verdict}
        </p>
      </div>

      {/* 4 Key Cumulative Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cumulative Revenue
          </span>
          <b className="font-heading text-xl font-black text-white block mt-1">
            {formatRupees(evaluation.totalRevenue)}
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {evaluation.totalUnitsDelivered} Total EVs Sold
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cumulative Net Profit
          </span>
          <b
            className={`font-heading text-xl font-black block mt-1 ${
              evaluation.totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatRupees(evaluation.totalProfit)}
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            All 4 Quarters combined
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Final Cash Reserves
          </span>
          <b
            className={`font-heading text-xl font-black block mt-1 ${
              evaluation.finalCash >= 4000000 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {formatRupees(evaluation.finalCash)}
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Ending Treasury Balance
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Brand Trust Score
          </span>
          <b className="font-heading text-xl font-black text-white block mt-1">
            {evaluation.finalTrust} / 100
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Customer Loyalty & CSAT
          </span>
        </div>
      </div>

      {/* Strategic Educational Lessons */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Core Strategic Principles Mastered:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300">
            <strong className="text-white block mb-1">1. Opportunity Cost</strong>
            Every Rupee spent on advertising was a Rupee taken away from product engineering. Growth without product quality causes recalls and customer churn.
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300">
            <strong className="text-white block mb-1">2. CapEx vs OpEx Trade-off</strong>
            Logistics agencies avoid upfront capital costs, but cap delivery capacity. Buying an in-house fleet requires heavy CapEx upfront but scales profit margins.
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300">
            <strong className="text-white block mb-1">3. Customer Lifetime Value</strong>
            Acquiring buyers is expensive; keeping them happy with high build quality and on-time fulfillment is the foundation of durable enterprise value.
          </div>
        </div>
      </div>

      {/* Claim Rewards & Play Again Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <div>
          {rewardClaimed ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Executive Performance Reward Claimed: +500 Coins & +250 XP!</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Claim CEO Performance Bonus (+500 Coins, +250 XP)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetSession}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Fiscal Year</span>
          </button>

          <Link
            to="/world/market"
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Return to Market District</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
