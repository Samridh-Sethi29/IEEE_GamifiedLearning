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

const STORAGE_KEY = "skillverse_ceo_company_session_v2";

export default function CEODecisionRoom() {
  const { player, earnXP, addCoins, updatePlayer } = usePlayer();

  // Full company simulation state
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companyState && parsed.screen) {
          return parsed;
        }
      }
    } catch (e) {}

    return {
      screen: "welcome", // welcome | planning | simulating | analytics | annual
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

  // Start Simulation from Welcome Screen
  const handleStartSimulation = () => {
    try {
      marketAudio.playClick();
    } catch (e) {}
    setGameState({
      screen: "planning",
      companyState: { ...INITIAL_COMPANY_STATE },
      lastQuarterResult: null,
    });
  };

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

  // Screen 1: Welcome Screen
  if (gameState.screen === "welcome") {
    return <CEOWelcomeScreen onStartSimulation={handleStartSimulation} />;
  }

  return (
    <div className="ceo-corp-root">
      {/* Executive Header & Live Ticker */}
      <CEOExecutiveHeader
        state={gameState.companyState}
        onResetSession={handleResetSession}
      />

      {/* Main Executive War Room Canvas */}
      <main className="ceo-corp-main">
        {/* Screen 2: Department Capital Planning (Quarterly Budget Sliders & Toggles) */}
        {gameState.screen === "planning" && (
          <CEODepartmentPlanning
            state={gameState.companyState}
            onExecuteQuarter={handleExecuteQuarter}
          />
        )}

        {/* Screen 3: Quarter in Motion (Animated 4-Stage Simulation & Customer Sentiment) */}
        {gameState.screen === "simulating" && gameState.lastQuarterResult && (
          <CEOSimulationRunning
            quarterResult={gameState.lastQuarterResult}
            onFinished={handleFinishSimulation}
          />
        )}

        {/* Screen 4: Audited Analytics & Graphs (P&L Table, SVG Financials, Funnel) */}
        {gameState.screen === "analytics" && gameState.lastQuarterResult && (
          <CEOQuarterAnalytics
            state={gameState.companyState}
            lastResult={gameState.lastQuarterResult}
            onContinueNextQuarter={handleContinueNextQuarter}
          />
        )}

        {/* Screen 5: Annual Shareholder Meeting & Final Board Review */}
        {gameState.screen === "annual" && (
          <CEOAnnualReport
            state={gameState.companyState}
            onResetSession={handleResetSession}
            onClaimReward={handleClaimReward}
          />
        )}
      </main>
    </div>
  );
}
