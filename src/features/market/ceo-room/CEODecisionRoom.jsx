import React, { useState, useEffect, useCallback } from "react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { marketAudio } from "@/features/market/utils/marketAudio";
import {
  INITIAL_COMPANY_STATE,
  runQuarterSimulation,
} from "./data/simulationEngine";

import CEOWelcomeScreen from "./components/CEOWelcomeScreen";
import CEOExecutiveHeader from "./components/CEOExecutiveHeader";
import CEODepartmentPlanning from "./components/CEODepartmentPlanning";
import CEOSimulationRunning from "./components/CEOSimulationRunning";
import CEOQuarterAnalytics from "./components/CEOQuarterAnalytics";
import CEOAnnualReport from "./components/CEOAnnualReport";

import "./ceo-company.css";
import "./ceo-room.css";

const STORAGE_KEY = "skillverse_ceo_company_session_v3";

export default function CEODecisionRoom() {
  const { player, earnXP, addCoins, updatePlayer } = usePlayer();
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  // Full company simulation state - defaults directly to planning command center
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companyState && parsed.screen && parsed.screen !== "welcome") {
          return parsed;
        }
      }
    } catch (e) {}

    return {
      screen: "planning", // planning | simulating | analytics | annual
      companyState: { ...INITIAL_COMPANY_STATE },
      lastQuarterResult: null,
    };
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {}
  }, [gameState]);

  // Reset Simulation back to Q1
  const handleResetSession = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}
    setGameState({
      screen: "planning",
      companyState: { ...INITIAL_COMPANY_STATE },
      lastQuarterResult: null,
    });
  };

  // Execute Quarter Allocations
  const handleExecuteQuarter = ({ adSpend, rdSpend, transportType }) => {
    try {
      marketAudio.playCash();
    } catch (e) {}

    const { nextState, quarterResult } = runQuarterSimulation(
      gameState.companyState,
      { adSpend, rdSpend, transportType }
    );

    // Enter simulation running phase
    setGameState((prev) => ({
      ...prev,
      screen: "simulating",
      companyState: nextState,
      lastQuarterResult: quarterResult,
    }));
  };

  // Transition from Simulation Animation to Analytics Debrief
  const handleFinishSimulation = () => {
    setGameState((prev) => ({
      ...prev,
      screen: "analytics",
    }));
  };

  // Continue from Analytics to Next Quarter Planning (or Annual Review if Q4 done)
  const handleContinueNextQuarter = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}

    if (gameState.companyState.quarter > gameState.companyState.maxQuarters) {
      setGameState((prev) => ({
        ...prev,
        screen: "annual",
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        screen: "planning",
      }));
    }
  };

  // Claim End-of-Year Performance Bonus
  const handleClaimReward = ({ coins, xp }) => {
    try {
      marketAudio.playSuccess();
    } catch (e) {}

    if (addCoins) addCoins(coins);
    if (earnXP) earnXP(xp);
    if (updatePlayer) {
      updatePlayer({
        badges: [
          ...(player?.badges || []),
          {
            id: "badge_ceo_mobility",
            name: "Enterprise Strategist",
            icon: "🏢",
            unlockedAt: new Date().toISOString(),
          },
        ],
      });
    }
  };

  return (
    <div className="ceo-corp-root">
      {/* Executive Header & Live Ticker */}
      <CEOExecutiveHeader
        state={gameState.companyState}
        onResetSession={handleResetSession}
        onOpenBriefing={() => setShowBriefingModal(true)}
      />

      {/* Main Executive War Room Canvas */}
      <main className="ceo-corp-main">
        {/* Screen: Department Capital Planning (Quarterly Budget Sliders & Toggles) */}
        {gameState.screen === "planning" && (
          <CEODepartmentPlanning
            state={gameState.companyState}
            onExecuteQuarter={handleExecuteQuarter}
          />
        )}

        {/* Screen: Quarter in Motion (Animated 4-Stage Simulation & Customer Sentiment) */}
        {gameState.screen === "simulating" && gameState.lastQuarterResult && (
          <CEOSimulationRunning
            quarterResult={gameState.lastQuarterResult}
            onFinished={handleFinishSimulation}
          />
        )}

        {/* Screen: Audited Analytics & Graphs (P&L Table, SVG Financials, Funnel) */}
        {gameState.screen === "analytics" && gameState.lastQuarterResult && (
          <CEOQuarterAnalytics
            state={gameState.companyState}
            lastResult={gameState.lastQuarterResult}
            onContinueNextQuarter={handleContinueNextQuarter}
          />
        )}

        {/* Screen: Annual Shareholder Meeting & Final Board Review */}
        {gameState.screen === "annual" && (
          <CEOAnnualReport
            state={gameState.companyState}
            onResetSession={handleResetSession}
            onClaimReward={handleClaimReward}
          />
        )}
      </main>

      {/* Optional Company Dossier / Briefing Modal */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-slate-100 space-y-4">
            <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <span>🏢 Nexora Mobility Corp. • Executive Briefing</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are the CEO managing Nexora Mobility, an innovative Indian electric vehicle manufacturer. Your challenge is to steer the company through 4 fiscal quarters by balancing:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Marketing & Ad Spend:</strong> Generates customer demand and showroom footfall.</li>
              <li><strong>R&D & Engineering Quality:</strong> Protects battery safety, drops defect rates, and prevents warranty repair bills.</li>
              <li><strong>Logistics Fulfillment:</strong> Choose between a 3PL Outsourced Agency (₹0 CapEx, but 320 unit cap) vs. buying your own In-House EV Fleet (₹12,00,000 CapEx, but 900 unit capacity).</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBriefingModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm"
              >
                Return to War Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
