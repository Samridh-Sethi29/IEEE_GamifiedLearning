import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
} from "lucide-react";
import { MISSIONS, COMPONENT_CATALOG, INVENTIONS_STORAGE_KEY } from "../data/missions";
import { evaluateMission } from "../engine/evaluator";
import ComponentDrawer from "../components/ComponentDrawer";
import BuildBench from "../components/BuildBench";
import WorkbenchGuidePopup from "../components/WorkbenchGuidePopup";
import TestResultModal from "../components/TestResultModal";
import MissionHintsModal from "../components/MissionHintsModal";
import "../../studio-lab-theme.css";
import "../inventionLab.css";

export default function InventionLab() {
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Workbench Guidance
  const [showWorkbenchGuide, setShowWorkbenchGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);

  // Modals & Testing Simulation States
  const [showHints, setShowHints] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const mission = MISSIONS[activeMissionIndex] || MISSIONS[0];
  const testTimerRef = useRef(null);

  // Every mission starts fresh with NOTHING on the workbench
  useEffect(() => {
    setComponents([]);
    setWires([]);
    setSelectedId(null);
    setShowWorkbenchGuide(true);
    setGuideStep(0);
    setTestResult(null);
    setIsTesting(false);
  }, [mission.id]);

  // Auto-advance workbench guide step when the child finishes a step
  useEffect(() => {
    if (!mission.workbenchGuides) return;
    const currentGuide = mission.workbenchGuides[guideStep];
    if (currentGuide && currentGuide.isComplete) {
      const done = currentGuide.isComplete(components, wires);
      if (done && guideStep < mission.workbenchGuides.length - 1) {
        const timer = setTimeout(() => {
          setGuideStep((prev) => prev + 1);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [components, wires, guideStep, mission.workbenchGuides]);

  // Add new component to workbench
  const handleAddPart = (partType, customX, customY) => {
    const meta = COMPONENT_CATALOG[partType];
    if (!meta) return;

    const count = components.length;
    const x = customX !== undefined ? customX : Math.min(380, 150 + (count % 4) * 45);
    const y = customY !== undefined ? customY : Math.min(300, 130 + (count % 3) * 50);

    const newComp = {
      id: `${partType}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: partType,
      x,
      y,
      width: meta.width,
      height: meta.height,
      baseWidth: meta.width,
      baseHeight: meta.height,
      scale: 1,
      rotation: 0,
      ports: JSON.parse(JSON.stringify(meta.ports)),
      state: meta.defaultState ? { ...meta.defaultState } : {},
    };

    setComponents((prev) => [...prev, newComp]);
    setSelectedId(newComp.id);
  };

  // Update component properties (position, rotation, scale, state)
  const handleUpdateComponent = (id, updates) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Remove component and associated wires
  const handleRemoveComponent = (id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) => prev.filter((w) => w.fromCompId !== id && w.toCompId !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Add wire connection
  const handleAddWire = (fromCompId, fromPortId, toCompId, toPortId) => {
    const exists = wires.some(
      (w) =>
        (w.fromCompId === fromCompId && w.toCompId === toCompId) ||
        (w.fromCompId === toCompId && w.toCompId === fromCompId)
    );
    if (!exists) {
      setWires((prev) => [...prev, { fromCompId, fromPortId, toCompId, toPortId }]);
    }
  };

  // Clear bench
  const handleClearBench = () => {
    setComponents([]);
    setWires([]);
    setSelectedId(null);
    setTestResult(null);
    setIsTesting(false);
    setGuideStep(0);
  };

  // Run Test Investigation with animation simulation
  const handleTestInvention = () => {
    if (isTesting) return;
    setIsTesting(true);
    setTestResult(null);

    // Evaluate machine logic
    const result = evaluateMission(mission.id, components, wires);

    if (testTimerRef.current) clearTimeout(testTimerRef.current);
    testTimerRef.current = setTimeout(() => {
      setIsTesting(false);
      setTestResult(result);
    }, 1500);
  };

  // Next Mission
  const handleNextMission = () => {
    setTestResult(null);
    setIsTesting(false);
    if (activeMissionIndex < MISSIONS.length - 1) {
      setActiveMissionIndex((cur) => cur + 1);
    }
  };

  return (
    <div className="invention-lab-scope" data-testid="invention-lab">
      {/* 1. Header Bar */}
      <header className="lab-header">
        <div className="lab-header-left">
          <Link to="/world/studio" className="lab-back-btn">
            <ArrowLeft size={14} />
            <span>Studio Campus</span>
          </Link>
          <div className="lab-title-area">
            <span className="lab-badge">Invention Lab</span>
            <h1 className="lab-header-title">Mission {mission.number}: {mission.title}</h1>
          </div>
        </div>

        <div className="lab-header-actions">
          <button
            className={`lab-btn ${showWorkbenchGuide ? "lab-btn-amber" : "lab-btn-ghost"}`}
            onClick={() => setShowWorkbenchGuide((prev) => !prev)}
            title="Toggle On-Workbench Instructions"
          >
            <BookOpen size={14} />
            <span>{showWorkbenchGuide ? "Hide Guide" : "Show Guide"}</span>
          </button>

          <button
            className="lab-btn lab-btn-ghost"
            onClick={handleClearBench}
            title="Clear Workbench"
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>

          <button
            className={`lab-btn lab-btn-test ${isTesting ? "lab-btn-testing" : ""}`}
            onClick={handleTestInvention}
            disabled={isTesting}
            data-testid="test-invention-btn"
          >
            <Play size={14} fill="currentColor" className={isTesting ? "animate-spin" : ""} />
            <span>{isTesting ? "Testing Machine..." : "Test Invention"}</span>
          </button>
        </div>
      </header>

      {/* 2. Mission Selection & Goal Bar */}
      <div className="lab-mission-bar">
        <div className="lab-mission-tabs">
          {MISSIONS.map((m, idx) => (
            <button
              key={m.id}
              className={`lab-mission-tab ${idx === activeMissionIndex ? "active" : ""}`}
              onClick={() => setActiveMissionIndex(idx)}
            >
              <span>{m.icon}</span>
              <span>M{m.number}</span>
            </button>
          ))}
        </div>

        <div className="lab-mission-summary">
          <span className="lab-mission-goal">
            <strong>Goal:</strong> {mission.goal}
          </span>
          <button
            className="lab-hints-btn"
            onClick={() => setShowHints(true)}
            data-testid="open-hints-btn"
          >
            <Lightbulb size={13} />
            <span>Need a Hint? (2)</span>
          </button>
        </div>
      </div>

      {/* 3. Main Construction Workspace */}
      <main className="lab-main">
        {/* Left: Component Library */}
        <ComponentDrawer
          allowedPartIds={mission.allowedParts}
          onAddPart={handleAddPart}
          onDropNewPart={handleAddPart}
        />

        {/* Center: Build Canvas with Workbench Guide & Simulation Animations */}
        <div className="relative flex-1 flex flex-col h-full overflow-hidden">
          {showWorkbenchGuide && (
            <WorkbenchGuidePopup
              key={mission.id}
              guides={mission.workbenchGuides}
              currentStep={guideStep}
              onStepChange={setGuideStep}
              onDismiss={() => setShowWorkbenchGuide(false)}
            />
          )}

          <BuildBench
            components={components}
            wires={wires}
            selectedId={selectedId}
            isTesting={isTesting}
            testResult={testResult}
            activeMissionId={mission.id}
            onSelect={setSelectedId}
            onUpdateComponent={handleUpdateComponent}
            onRemoveComponent={handleRemoveComponent}
            onAddWire={handleAddWire}
            onDropNewPart={handleAddPart}
          />
        </div>
      </main>

      {/* 2-Hint Modal */}
      {showHints && (
        <MissionHintsModal
          mission={mission}
          onClose={() => setShowHints(false)}
        />
      )}

      {/* Test Result Feedback Modal */}
      {testResult && (
        <TestResultModal
          result={testResult}
          onClose={() => setTestResult(null)}
          onNextMission={handleNextMission}
          hasNextMission={activeMissionIndex < MISSIONS.length - 1}
        />
      )}
    </div>
  );
}
