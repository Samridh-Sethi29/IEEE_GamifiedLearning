import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  Users,
  PieChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatRupees } from "../data/scenarios";

export default function CEODecisionCard({
  challenge,
  currentCash,
  onSubmitDecision,
  isSubmitting = false,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const selectedOption = challenge.options.find((opt) => opt.id === selectedOptionId);

  const handleSelect = (option) => {
    // Check if player has enough cash for upfront investment
    if (option.cashImpact < 0 && Math.abs(option.cashImpact) > currentCash) {
      return; // Insufficient cash
    }
    setSelectedOptionId(option.id);
  };

  const handleConfirm = () => {
    if (!selectedOption || isSubmitting) return;
    onSubmitDecision(selectedOption);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Challenge Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-wider uppercase">
            {challenge.quarter}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {challenge.kicker}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400">
          Executive Decision #{challenge.id} of 5
        </span>
      </div>

      {/* Situation Briefing */}
      <div className="space-y-2">
        <h2 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
          {challenge.title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          {challenge.situation}
        </p>
      </div>

      {/* Decision Options Grid */}
      <div className="space-y-3 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Select Your Strategic Course of Action:
        </span>

        <div className="grid grid-cols-1 gap-3">
          {challenge.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const requiresCash = option.cashImpact < 0 ? Math.abs(option.cashImpact) : 0;
            const canAfford = requiresCash <= currentCash;

            return (
              <div
                key={option.id}
                role="button"
                tabIndex={canAfford ? 0 : -1}
                onClick={() => canAfford && handleSelect(option)}
                className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer select-none border-2 flex flex-col justify-between ${
                  !canAfford
                    ? "opacity-50 cursor-not-allowed bg-slate-950/50 border-slate-800"
                    : isSelected
                    ? "bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/15"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isSelected
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {option.id}
                      </div>
                      <h4
                        className={`font-heading font-extrabold text-base sm:text-lg ${
                          isSelected ? "text-cyan-200" : "text-white"
                        }`}
                      >
                        {option.label}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600" />
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 pl-10">
                    {option.summary}
                  </p>
                </div>

                {/* Estimated Upfront Requirements & Tagline */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 pl-10">
                  <div className="flex flex-wrap items-center gap-2">
                    {requiresCash > 0 ? (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 ${
                          canAfford
                            ? "bg-amber-950/60 border border-amber-500/30 text-amber-300"
                            : "bg-rose-950 border border-rose-500 text-rose-300"
                        }`}
                      >
                        <IndianRupee className="w-3 h-3" />
                        Upfront Outlay: {formatRupees(requiresCash)}
                        {!canAfford && " (Insufficient Cash)"}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-400">
                        Zero Upfront Capex
                      </span>
                    )}

                    <span className="text-xs text-slate-400 italic">
                      Focus: {option.concept}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-bold text-cyan-400 animate-pulse">
                      Selected for Execution
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Confirmation Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {selectedOption ? (
            <span>
              Ready to submit: <strong className="text-white">Option {selectedOption.id}</strong>.
              Consequences will be evaluated immediately.
            </span>
          ) : (
            <span>Please choose one strategic option to execute for this quarter.</span>
          )}
        </div>

        <button
          disabled={!selectedOption || isSubmitting}
          onClick={handleConfirm}
          className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
            selectedOption && !isSubmitting
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          <span>{isSubmitting ? "Simulating Market Impact..." : "Confirm & Execute Decision"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
