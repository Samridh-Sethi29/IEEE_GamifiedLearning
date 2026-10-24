import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Award,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Users,
  Target,
  IndianRupee,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  formatRupees,
  calculateProfit,
  calculateMargin,
  evaluateFinalScore,
} from "../data/scenarios";

export default function CEOFinalReport({
  initialMetrics,
  finalMetrics,
  decisions,
  onRestart,
  onClaimReward,
}) {
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const scoreData = evaluateFinalScore(finalMetrics, decisions);
  const initialProfit = calculateProfit(initialMetrics.revenue, initialMetrics.expenses);
  const initialMargin = calculateMargin(initialMetrics.revenue, initialMetrics.expenses);

  const finalProfit = calculateProfit(finalMetrics.revenue, finalMetrics.expenses);
  const finalMargin = calculateMargin(finalMetrics.revenue, finalMetrics.expenses);

  const handleClaim = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    if (onClaimReward) {
      onClaimReward({ xp: 100, coins: 250 });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-900/95 border border-slate-700/80 p-5 sm:p-8 shadow-2xl space-y-7 animate-fade-in text-slate-100 select-none">
      {/* Top Banner / Scorecard */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Executive Performance Assessment
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-white">
            {scoreData.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            {scoreData.summary}
          </p>
        </div>

        {/* Big Grade Badge */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl shrink-0 min-w-[140px]">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
            Final Score
          </span>
          <span className="font-heading text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
            {scoreData.totalScore}
          </span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 mt-1">
            Grade {scoreData.grade}
          </span>
        </div>
      </div>

      {/* Balanced Scorecard Breakdown (4 Pillars) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Financial */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            Financials (30)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-black text-xl text-white">
              {scoreData.breakdown.financial} / 30
            </span>
            <span className="text-xs text-slate-400">Cash & Margin</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${(scoreData.breakdown.financial / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Customer Trust */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Customer Trust (25)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-black text-xl text-white">
              {scoreData.breakdown.trust} / 25
            </span>
            <span className="text-xs text-slate-400">Brand Equity</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(scoreData.breakdown.trust / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Employee Morale */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Team Morale (25)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-black text-xl text-white">
              {scoreData.breakdown.morale} / 25
            </span>
            <span className="text-xs text-slate-400">Culture & Retention</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full"
              style={{ width: `${(scoreData.breakdown.morale / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Market Share */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Market Share (20)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-black text-xl text-white">
              {scoreData.breakdown.market} / 20
            </span>
            <span className="text-xs text-slate-400">EV Segment</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: `${(scoreData.breakdown.market / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Starting vs Final Enterprise Comparison Table */}
      <div className="space-y-3">
        <h3 className="font-heading font-black text-lg text-white">
          Quarter 1 vs Quarter 5 Enterprise Comparison:
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Starting (Q1)</th>
                <th className="py-3 px-4">Final (Q5)</th>
                <th className="py-3 px-4">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              <tr>
                <td className="py-3 px-4 text-slate-300">Liquid Cash Balance</td>
                <td className="py-3 px-4 text-slate-400">{formatRupees(initialMetrics.cash)}</td>
                <td className="py-3 px-4 font-bold text-white">{formatRupees(finalMetrics.cash)}</td>
                <td className="py-3 px-4">
                  {finalMetrics.cash >= initialMetrics.cash ? (
                    <span className="text-emerald-400 font-bold">
                      +{formatRupees(finalMetrics.cash - initialMetrics.cash)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {formatRupees(finalMetrics.cash - initialMetrics.cash)}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Quarterly Revenue</td>
                <td className="py-3 px-4 text-slate-400">{formatRupees(initialMetrics.revenue)}</td>
                <td className="py-3 px-4 font-bold text-white">{formatRupees(finalMetrics.revenue)}</td>
                <td className="py-3 px-4">
                  {finalMetrics.revenue >= initialMetrics.revenue ? (
                    <span className="text-emerald-400 font-bold">
                      +{formatRupees(finalMetrics.revenue - initialMetrics.revenue)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {formatRupees(finalMetrics.revenue - initialMetrics.revenue)}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Quarterly Expenses</td>
                <td className="py-3 px-4 text-slate-400">{formatRupees(initialMetrics.expenses)}</td>
                <td className="py-3 px-4 font-bold text-white">{formatRupees(finalMetrics.expenses)}</td>
                <td className="py-3 px-4">
                  {finalMetrics.expenses <= initialMetrics.expenses ? (
                    <span className="text-emerald-400 font-bold">
                      {formatRupees(finalMetrics.expenses - initialMetrics.expenses)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      +{formatRupees(finalMetrics.expenses - initialMetrics.expenses)}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Quarterly Net Profit</td>
                <td className="py-3 px-4 text-slate-400">{formatRupees(initialProfit)}</td>
                <td className="py-3 px-4 font-bold text-white">{formatRupees(finalProfit)}</td>
                <td className="py-3 px-4">
                  {finalProfit >= initialProfit ? (
                    <span className="text-emerald-400 font-bold">
                      +{formatRupees(finalProfit - initialProfit)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {formatRupees(finalProfit - initialProfit)}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Profit Margin %</td>
                <td className="py-3 px-4 text-slate-400">{initialMargin}%</td>
                <td className="py-3 px-4 font-bold text-white">{finalMargin}%</td>
                <td className="py-3 px-4">
                  {finalMargin >= initialMargin ? (
                    <span className="text-emerald-400 font-bold">+{finalMargin - initialMargin}%</span>
                  ) : (
                    <span className="text-rose-400 font-bold">{finalMargin - initialMargin}%</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Customer Trust</td>
                <td className="py-3 px-4 text-slate-400">{initialMetrics.customerTrust}/100</td>
                <td className="py-3 px-4 font-bold text-white">{finalMetrics.customerTrust}/100</td>
                <td className="py-3 px-4">
                  {finalMetrics.customerTrust >= initialMetrics.customerTrust ? (
                    <span className="text-emerald-400 font-bold">
                      +{finalMetrics.customerTrust - initialMetrics.customerTrust} pts
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {finalMetrics.customerTrust - initialMetrics.customerTrust} pts
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Employee Morale</td>
                <td className="py-3 px-4 text-slate-400">{initialMetrics.employeeMorale}/100</td>
                <td className="py-3 px-4 font-bold text-white">{finalMetrics.employeeMorale}/100</td>
                <td className="py-3 px-4">
                  {finalMetrics.employeeMorale >= initialMetrics.employeeMorale ? (
                    <span className="text-emerald-400 font-bold">
                      +{finalMetrics.employeeMorale - initialMetrics.employeeMorale} pts
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {finalMetrics.employeeMorale - initialMetrics.employeeMorale} pts
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Market Share</td>
                <td className="py-3 px-4 text-slate-400">{initialMetrics.marketShare}%</td>
                <td className="py-3 px-4 font-bold text-white">{finalMetrics.marketShare}%</td>
                <td className="py-3 px-4">
                  {finalMetrics.marketShare >= initialMetrics.marketShare ? (
                    <span className="text-emerald-400 font-bold">
                      +{finalMetrics.marketShare - initialMetrics.marketShare}%
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {finalMetrics.marketShare - initialMetrics.marketShare}%
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Decisions Chronicle */}
      <div className="space-y-3">
        <h3 className="font-heading font-black text-lg text-white">
          Major Strategic Decisions Chronicle:
        </h3>
        <div className="space-y-2">
          {decisions.map((dec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 text-xs sm:text-sm"
            >
              <div>
                <span className="font-bold text-cyan-400 block text-xs">
                  {dec.challenge.quarter}: {dec.challenge.title}
                </span>
                <span className="font-extrabold text-white">
                  Chosen Option {dec.option.id}: {dec.option.label}
                </span>
                <p className="text-slate-400 text-xs mt-1">{dec.option.takeaway}</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs shrink-0">
                Quarter {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards & Replay Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base block">
              Skillverse Entrepreneurial Award
            </span>
            <span className="text-xs text-slate-400">
              Claim 100 XP + 250 Coins for completing the executive simulation.
            </span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={rewardClaimed}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all ${
            rewardClaimed
              ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300 cursor-default"
              : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{rewardClaimed ? "Rewards Claimed! ✓" : "Claim Rewards"}</span>
        </button>
      </div>

      {/* Bottom Nav Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <Link
          to="/world/market"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Market Section</span>
        </Link>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay Simulation</span>
        </button>
      </div>
    </div>
  );
}
