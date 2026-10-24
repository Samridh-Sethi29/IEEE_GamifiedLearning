import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Building2,
  History,
  X,
  TrendingUp,
} from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { marketAudio } from "@/features/market/utils/marketAudio";
import {
  COMPANY_PROFILE,
  CHALLENGES,
  calculateProfit,
  calculateMargin,
} from "./data/scenarios";
import CEOWelcomeScreen from "./components/CEOWelcomeScreen";
import CEODashboard from "./components/CEODashboard";
import CEODecisionCard from "./components/CEODecisionCard";
import CEODecisionFeedback from "./components/CEODecisionFeedback";
import CEOFinalReport from "./components/CEOFinalReport";
import "./ceo-room.css";

const SESSION_STORAGE_KEY = "skillverse_ceo_session_v1";

export default function CEODecisionRoom() {
  const { player, earnXP, addCoins, updatePlayer } = usePlayer();

  // Simulation State
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.metrics && parsed.screen) {
          return parsed;
        }
      }
    } catch (e) {}

    return {
      screen: "welcome", // welcome | playing | feedback | final
      metrics: { ...COMPANY_PROFILE.initialMetrics },
      challengeIndex: 0,
      decisionHistory: [],
      latestDecision: null,
    };
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state to local session storage
  useEffect(() => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {}
  }, [gameState]);

  const handleStartSimulation = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}
    setGameState((prev) => ({
      ...prev,
      screen: "playing",
      challengeIndex: 0,
      metrics: { ...COMPANY_PROFILE.initialMetrics },
      decisionHistory: [],
      latestDecision: null,
    }));
  };

  const handleExecuteDecision = (option) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      marketAudio.playCash();
    } catch (e) {}

    const challenge = CHALLENGES[gameState.challengeIndex];
    const oldMetrics = { ...gameState.metrics };

    // Apply real mathematical formula changes
    const nextCash = Math.max(0, oldMetrics.cash + (option.cashImpact || 0));
    const nextRevenue = Math.max(0, oldMetrics.revenue + (option.revenueDelta || 0));
    const nextExpenses = Math.max(0, oldMetrics.expenses + (option.expensesDelta || 0));
    const nextTrust = Math.max(0, Math.min(100, oldMetrics.customerTrust + (option.trustDelta || 0)));
    const nextMorale = Math.max(0, Math.min(100, oldMetrics.employeeMorale + (option.moraleDelta || 0)));
    const nextShare = Math.max(0, Math.min(50, oldMetrics.marketShare + (option.marketShareDelta || 0)));

    const newMetrics = {
      ...oldMetrics,
      cash: nextCash,
      revenue: nextRevenue,
      expenses: nextExpenses,
      customerTrust: nextTrust,
      employeeMorale: nextMorale,
      marketShare: nextShare,
      period: oldMetrics.period + 1,
    };

    const decisionRecord = {
      challenge,
      option,
      oldMetrics,
      newMetrics,
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setGameState((prev) => ({
        ...prev,
        screen: "feedback",
        metrics: newMetrics,
        decisionHistory: [...prev.decisionHistory, decisionRecord],
        latestDecision: decisionRecord,
      }));
    }, 450);
  };

  const handleContinueAfterFeedback = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}

    const nextIndex = gameState.challengeIndex + 1;
    if (nextIndex >= CHALLENGES.length) {
      setGameState((prev) => ({
        ...prev,
        screen: "final",
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        screen: "playing",
        challengeIndex: nextIndex,
      }));
    }
  };

  const handleRestart = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setGameState({
      screen: "welcome",
      metrics: { ...COMPANY_PROFILE.initialMetrics },
      challengeIndex: 0,
      decisionHistory: [],
      latestDecision: null,
    });
  };

  const handleClaimReward = ({ xp, coins }) => {
    try {
      marketAudio.playBell();
    } catch (e) {}
    if (earnXP) earnXP(xp);
    if (addCoins) addCoins(coins);
    if (updatePlayer) {
      updatePlayer({
        skills: {
          entrepreneurial: (player?.skills?.entrepreneurial || 0) + 15,
        },
      });
    }
  };

  // Render Screen A: Welcome Screen
  if (gameState.screen === "welcome") {
    return <CEOWelcomeScreen onStartSimulation={handleStartSimulation} />;
  }

  const currentChallenge = CHALLENGES[gameState.challengeIndex] || CHALLENGES[0];
  const isLastChallenge = gameState.challengeIndex === CHALLENGES.length - 1;

  return (
    <div className="ceo-root min-h-screen w-full flex flex-col justify-between bg-[#090d16] text-slate-100 select-none">
      {/* Executive Top Navigation Bar */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/world/market"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to Market</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-heading font-black text-sm sm:text-base text-white leading-tight">
                  {COMPANY_PROFILE.name}
                </h1>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  CEO Decision Room • Quarter {gameState.challengeIndex + 1} of 5
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Log</span>
            </button>

            <button
              onClick={handleRestart}
              title="Reset Run"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="w-full max-w-6xl mx-auto flex-1 p-4 sm:p-6 space-y-6">
        {gameState.screen === "final" ? (
          <CEOFinalReport
            initialMetrics={COMPANY_PROFILE.initialMetrics}
            finalMetrics={gameState.metrics}
            decisions={gameState.decisionHistory}
            onRestart={handleRestart}
            onClaimReward={handleClaimReward}
          />
        ) : (
          <>
            {/* Live KPI Dashboard (Screen B) */}
            <CEODashboard
              metrics={gameState.metrics}
              currentChallenge={currentChallenge}
              decisionHistory={gameState.decisionHistory}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
            />

            {/* Decision Phase vs Feedback Phase */}
            {gameState.screen === "playing" && (
              <CEODecisionCard
                challenge={currentChallenge}
                currentCash={gameState.metrics.cash}
                onSubmitDecision={handleExecuteDecision}
                isSubmitting={isSubmitting}
              />
            )}

            {gameState.screen === "feedback" && gameState.latestDecision && (
              <CEODecisionFeedback
                decision={gameState.latestDecision}
                challenge={gameState.latestDecision.challenge}
                isLastChallenge={isLastChallenge}
                onContinue={handleContinueAfterFeedback}
              />
            )}
          </>
        )}
      </main>

      {/* Decision Log Modal Drawer */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-black text-lg text-white">
                  Executive Decision History
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {gameState.decisionHistory.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  No decisions submitted yet this fiscal year.
                </p>
              ) : (
                gameState.decisionHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>{item.challenge.quarter}: {item.challenge.title}</span>
                      <span>Quarter {idx + 1}</span>
                    </div>
                    <p className="text-white font-extrabold text-sm">
                      Executed Option {item.option.id}: {item.option.label}
                    </p>
                    <p className="text-slate-400 leading-relaxed">{item.option.immediateImpact}</p>
                    <span className="block text-[11px] text-amber-400/90 font-medium pt-1">
                      Concept: {item.option.concept}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Status */}
      <footer className="w-full bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 text-center text-xs text-slate-400">
        Nexora Mobility Simulated Enterprise Model • Indian Rupee Standard
      </footer>
    </div>
  );
}
