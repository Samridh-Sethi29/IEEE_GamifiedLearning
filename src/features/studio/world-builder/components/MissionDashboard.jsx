import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Coins,
  Droplets,
  HelpCircle,
  Home,
  RefreshCw,
  Sliders,
  Sparkles,
  Trophy,
  Warehouse,
} from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { evaluateMissionReadiness } from "../engine/missionReadiness.js";
import { evaluateMissionCompletion } from "../engine/missionCompletion.js";
import { MISSION_REWARDS } from "../data/rewards.js";
import {
  executeMissionCompletion,
  isMissionAlreadyCompleted,
} from "../engine/missionRewards.js";
import MissionSuccessScreen from "./MissionSuccessScreen.jsx";
import "./MissionDashboard.css";

/**
 * World Builder Mission Dashboard Component.
 * Integrates water-network connectivity, household supply, construction budget,
 * daily water supply, and water reserve storage into a single clear inspector.
 * Strictly read-only: does not mutate documents, player profile, or persistence.
 */
export default function MissionDashboard({
  doc,
  initialPlanningInputs,
  onPlanningInputsChange,
  onBackToBriefing,
}) {
  const [planningInputs, setPlanningInputs] = useState(() => ({
    dailySupplyLitres: initialPlanningInputs?.dailySupplyLitres ?? "",
    dailyDemandLitres: initialPlanningInputs?.dailyDemandLitres ?? "",
    availableReserveLitres: initialPlanningInputs?.availableReserveLitres ?? "",
  }));

  const [inputErrors, setInputErrors] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);

  // Validate and parse planning inputs
  const cleanInputs = useMemo(() => {
    const parseField = (key, rawStr) => {
      if (rawStr === "" || rawStr === null || rawStr === undefined) {
        return null;
      }
      const num = Number(rawStr);
      if (!Number.isFinite(num)) {
        return NaN;
      }
      return num;
    };

    return {
      dailySupplyLitres: parseField("dailySupplyLitres", planningInputs.dailySupplyLitres),
      dailyDemandLitres: parseField("dailyDemandLitres", planningInputs.dailyDemandLitres),
      availableReserveLitres: parseField("availableReserveLitres", planningInputs.availableReserveLitres),
    };
  }, [planningInputs]);

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [completionError, setCompletionError] = useState(null);

  const { player, updatePlayer } = usePlayer();

  const alreadyCompleted = useMemo(() => {
    return isMissionAlreadyCompleted(player, MISSION_REWARDS.flagKey);
  }, [player]);

  // Execute readiness model using real API
  const readiness = useMemo(() => {
    return evaluateMissionReadiness(doc, cleanInputs);
  }, [doc, cleanInputs, refreshCount]);

  // Execute mission completion eligibility model using real API
  const completion = useMemo(() => {
    return evaluateMissionCompletion(doc, cleanInputs);
  }, [doc, cleanInputs, refreshCount]);

  // If village design or planning inputs change such that completion is no longer eligible,
  // close the success screen to avoid displaying a stale success state.
  useEffect(() => {
    if (showSuccessScreen && !completion.eligibleForCompletion) {
      setShowSuccessScreen(false);
    }
  }, [showSuccessScreen, completion.eligibleForCompletion]);

  const handleCompleteMission = async () => {
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setCompletionError(null);

    // Re-evaluate fresh using current doc and cleanInputs at click time
    const freshCompletion = evaluateMissionCompletion(doc, cleanInputs);
    if (freshCompletion.eligibleForCompletion) {
      try {
        const result = await executeMissionCompletion(
          doc,
          cleanInputs,
          player,
          updatePlayer,
          MISSION_REWARDS
        );

        if (result.success) {
          setCompletionResult(result);
          setShowSuccessScreen(true);
        } else {
          setCompletionError(result.error || "Could not complete mission.");
        }
      } catch (err) {
        setCompletionError(
          err?.message || "An unexpected error occurred while saving mission completion."
        );
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    } else {
      setCompletionError("Mission requirements are not satisfied. Please check the dashboard.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    const nextInputs = { ...planningInputs, [field]: value };
    setPlanningInputs(nextInputs);

    // Validate
    const nextErrors = { ...inputErrors };
    if (value === "") {
      delete nextErrors[field];
    } else {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        nextErrors[field] = "Must be a valid number.";
      } else if (num < 0) {
        nextErrors[field] = "Cannot be negative.";
      } else {
        delete nextErrors[field];
      }
    }
    setInputErrors(nextErrors);

    if (typeof onPlanningInputsChange === "function") {
      onPlanningInputsChange(nextInputs);
    }
  };

  const handleRefresh = () => {
    setRefreshCount((c) => c + 1);
  };

  const {
    overallStatus,
    ready,
    title,
    summary,
    requirements,
  } = readiness;

  const reqWaterNetwork = requirements.waterNetwork;
  const reqHouseholds = requirements.households;
  const reqBudget = requirements.budget;
  const reqDailyWater = requirements.dailyWater;
  const reqReserve = requirements.reserve;

  return (
    <section
      className="wb-mission-dashboard"
      data-testid="wb-mission-dashboard"
      aria-label="Village Mission Dashboard"
    >
      <div className="wb-dashboard-header">
        <h3 className="wb-dashboard-title">
          <Sliders size={16} aria-hidden="true" />
          Mission Dashboard
        </h3>
        <button
          type="button"
          className="wb-dashboard-refresh-btn"
          onClick={handleRefresh}
          data-testid="wb-refresh-readiness-btn"
          title="Refresh readiness assessment"
        >
          <RefreshCw size={12} aria-hidden="true" /> Refresh
        </button>
      </div>

      {/* Overall Mission Status Banner */}
      <div
        className={`wb-dashboard-overall wb-dashboard-overall--${overallStatus}`}
        data-testid="wb-dashboard-overall"
        data-status={overallStatus}
      >
        {overallStatus === "ready" ? (
          <CheckCircle2 size={20} aria-hidden="true" />
        ) : overallStatus === "needs-attention" ? (
          <AlertCircle size={20} aria-hidden="true" />
        ) : (
          <HelpCircle size={20} aria-hidden="true" />
        )}
        <div className="wb-dashboard-overall-text">
          <strong className="wb-dashboard-overall-title" data-testid="wb-dashboard-overall-title">
            {title}
          </strong>
          <span className="wb-dashboard-overall-summary" data-testid="wb-dashboard-overall-summary">
            {summary}
          </span>
        </div>
        <span
          className="wb-dashboard-overall-badge"
          data-testid="wb-dashboard-overall-badge"
        >
          {overallStatus === "ready"
            ? "Ready"
            : overallStatus === "needs-attention"
            ? "Needs Attention"
            : "Incomplete"}
        </span>
      </div>

      {/* 5 Requirements Breakdown */}
      <ul className="wb-dashboard-reqs" data-testid="wb-dashboard-reqs">
        {/* 1. Water Network Connectivity */}
        <li
          className="wb-dashboard-req-item"
          data-testid="wb-dashboard-item-waterNetwork"
          data-status={reqWaterNetwork.status}
        >
          <div className="wb-dashboard-req-header">
            <span className="wb-dashboard-req-label">
              <Droplets size={14} aria-hidden="true" />
              Water Connectivity
            </span>
            <span
              className={`wb-dashboard-badge wb-dashboard-badge--${reqWaterNetwork.status}`}
              data-testid="wb-dashboard-badge-waterNetwork"
            >
              {reqWaterNetwork.status === "pass" ? (
                <>
                  <CheckCircle2 size={12} aria-hidden="true" /> Connected
                </>
              ) : (
                <>
                  <AlertCircle size={12} aria-hidden="true" /> Needs Attention
                </>
              )}
            </span>
          </div>
          <div className="wb-dashboard-values" data-testid="wb-dashboard-values-waterNetwork">
            {reqWaterNetwork.details.reachesFarm
              ? "Well connected to farm plot"
              : "Well not connected to farm plot"}
          </div>
          <p className="wb-dashboard-explanation" data-testid="wb-dashboard-explanation-waterNetwork">
            {reqWaterNetwork.status === "pass"
              ? "Water flows from the well through pipes to the farm."
              : reqWaterNetwork.diagnostics[0] || "Network does not reach the farm."}
          </p>
          {reqWaterNetwork.status !== "pass" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-waterNetwork">
              💡 Suggestion: Connect pipes between the well and farm intake boundary.
            </p>
          )}
        </li>

        {/* 2. Household Water Supply */}
        <li
          className="wb-dashboard-req-item"
          data-testid="wb-dashboard-item-households"
          data-status={reqHouseholds.status}
        >
          <div className="wb-dashboard-req-header">
            <span className="wb-dashboard-req-label">
              <Home size={14} aria-hidden="true" />
              Household Supply
            </span>
            <span
              className={`wb-dashboard-badge wb-dashboard-badge--${reqHouseholds.status}`}
              data-testid="wb-dashboard-badge-households"
            >
              {reqHouseholds.status === "pass" ? (
                <>
                  <CheckCircle2 size={12} aria-hidden="true" /> 4/4 Connected
                </>
              ) : (
                <>
                  <AlertCircle size={12} aria-hidden="true" /> {reqHouseholds.actual}/4 Connected
                </>
              )}
            </span>
          </div>
          <div className="wb-dashboard-values" data-testid="wb-dashboard-values-households">
            {reqHouseholds.actual} of {reqHouseholds.target} households supplied
          </div>
          <p className="wb-dashboard-explanation" data-testid="wb-dashboard-explanation-households">
            {reqHouseholds.status === "pass"
              ? "At least four village households are supplied with water."
              : reqHouseholds.diagnostics[0] || `Connect ${reqHouseholds.details.shortfall} more household(s).`}
          </p>
          {reqHouseholds.status !== "pass" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-households">
              💡 Suggestion: Connect pipe endpoints to house intake ports near their exterior walls.
            </p>
          )}
        </li>

        {/* 3. Construction Budget */}
        <li
          className="wb-dashboard-req-item"
          data-testid="wb-dashboard-item-budget"
          data-status={reqBudget.status}
        >
          <div className="wb-dashboard-req-header">
            <span className="wb-dashboard-req-label">
              <Coins size={14} aria-hidden="true" />
              Construction Budget
            </span>
            <span
              className={`wb-dashboard-badge wb-dashboard-badge--${reqBudget.status}`}
              data-testid="wb-dashboard-badge-budget"
            >
              {reqBudget.status === "pass" ? (
                <>
                  <CheckCircle2 size={12} aria-hidden="true" /> In Budget
                </>
              ) : (
                <>
                  <AlertCircle size={12} aria-hidden="true" /> Over Budget
                </>
              )}
            </span>
          </div>
          <div className="wb-dashboard-values" data-testid="wb-dashboard-values-budget">
            {reqBudget.actual} / {reqBudget.target} coins (
            {reqBudget.details.remainingBudget >= 0
              ? `${reqBudget.details.remainingBudget} remaining`
              : `${reqBudget.details.shortfall} over budget`}
            )
          </div>
          <p className="wb-dashboard-explanation" data-testid="wb-dashboard-explanation-budget">
            {reqBudget.status === "pass"
              ? `Village construction cost (${reqBudget.actual} coins) is within the ${reqBudget.target}-coin limit.`
              : reqBudget.diagnostics[0]}
          </p>
          {reqBudget.status !== "pass" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-budget">
              💡 Suggestion: Remove unnecessary pipes or expensive objects to save coins.
            </p>
          )}
        </li>

        {/* 4. Daily Water Supply & Demand */}
        <li
          className="wb-dashboard-req-item"
          data-testid="wb-dashboard-item-dailyWater"
          data-status={reqDailyWater.status}
        >
          <div className="wb-dashboard-req-header">
            <span className="wb-dashboard-req-label">
              <Droplets size={14} aria-hidden="true" />
              Daily Water Flow
            </span>
            <span
              className={`wb-dashboard-badge wb-dashboard-badge--${reqDailyWater.status}`}
              data-testid="wb-dashboard-badge-dailyWater"
            >
              {reqDailyWater.status === "pass" ? (
                <>
                  <CheckCircle2 size={12} aria-hidden="true" /> Adequate
                </>
              ) : reqDailyWater.status === "fail" ? (
                <>
                  <AlertCircle size={12} aria-hidden="true" /> Shortfall
                </>
              ) : (
                <>
                  <HelpCircle size={12} aria-hidden="true" /> Needs Data
                </>
              )}
            </span>
          </div>
          <div className="wb-dashboard-values" data-testid="wb-dashboard-values-dailyWater">
            {reqDailyWater.status === "unknown" ? (
              reqDailyWater.details.dailySupplyLitres === null && reqDailyWater.details.dailyDemandLitres === null
                ? "Daily supply & demand unconfigured"
                : reqDailyWater.details.dailySupplyLitres === null
                ? "Daily supply unconfigured"
                : "Daily demand unconfigured"
            ) : (
              `Supply: ${reqDailyWater.details.dailySupplyLitres} L/day | Demand: ${reqDailyWater.details.dailyDemandLitres} L/day`
            )}
          </div>
          <p className="wb-dashboard-explanation" data-testid="wb-dashboard-explanation-dailyWater">
            {reqDailyWater.status === "pass"
              ? `Daily supply (${reqDailyWater.details.dailySupplyLitres} L/day) satisfies village demand.`
              : reqDailyWater.diagnostics[0]}
          </p>
          {reqDailyWater.status === "unknown" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-dailyWater">
              💡 Suggestion: Enter planned daily water {reqDailyWater.details.dailySupplyLitres === null ? "supply and " : ""}demand in the planning inputs below.
            </p>
          )}
          {reqDailyWater.status === "fail" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-dailyWater">
              💡 Suggestion: Reduce daily demand or increase daily supply to cover the {reqDailyWater.details.shortfallLitres} L/day shortfall.
            </p>
          )}
        </li>

        {/* 5. Stored Water Reserve */}
        <li
          className="wb-dashboard-req-item"
          data-testid="wb-dashboard-item-reserve"
          data-status={reqReserve.status}
        >
          <div className="wb-dashboard-req-header">
            <span className="wb-dashboard-req-label">
              <Warehouse size={14} aria-hidden="true" />
              Water Reserve
            </span>
            <span
              className={`wb-dashboard-badge wb-dashboard-badge--${reqReserve.status}`}
              data-testid="wb-dashboard-badge-reserve"
            >
              {reqReserve.status === "pass" ? (
                <>
                  <CheckCircle2 size={12} aria-hidden="true" /> Adequate
                </>
              ) : reqReserve.status === "fail" ? (
                <>
                  <AlertCircle size={12} aria-hidden="true" /> Shortfall
                </>
              ) : (
                <>
                  <HelpCircle size={12} aria-hidden="true" /> Needs Data
                </>
              )}
            </span>
          </div>
          <div className="wb-dashboard-values" data-testid="wb-dashboard-values-reserve">
            {reqReserve.status === "unknown"
              ? "Reserve storage unconfigured"
              : `Stored: ${reqReserve.details.availableReserveLitres} L / Min: ${reqReserve.target} L`}
          </div>
          <p className="wb-dashboard-explanation" data-testid="wb-dashboard-explanation-reserve">
            {reqReserve.status === "pass"
              ? `Stored reserve (${reqReserve.details.availableReserveLitres} L) meets the minimum ${reqReserve.target} L requirement.`
              : reqReserve.diagnostics[0]}
          </p>
          {reqReserve.status === "unknown" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-reserve">
              💡 Suggestion: Enter available stored water volume in the planning inputs below.
            </p>
          )}
          {reqReserve.status === "fail" && (
            <p className="wb-dashboard-suggestion" data-testid="wb-dashboard-suggestion-reserve">
              💡 Suggestion: Increase stored water reserve by {reqReserve.details.shortfallLitres} L to meet the {reqReserve.target} L requirement.
            </p>
          )}
        </li>
      </ul>

      {/* Water Planning Inputs Section */}
      <div className="wb-planning-inputs" data-testid="wb-planning-inputs">
        <div className="wb-planning-header">
          <h4 className="wb-planning-title">
            <Sliders size={13} aria-hidden="true" />
            Water Planning Inputs
          </h4>
          <p className="wb-planning-note">
            Planning assumptions — not measured physical simulations.
          </p>
        </div>

        <div className="wb-planning-fields">
          {/* Planned Daily Supply */}
          <div className="wb-planning-row">
            <label htmlFor="wb-input-daily-supply">Daily Supply</label>
            <div className="wb-planning-input-wrap">
              <input
                id="wb-input-daily-supply"
                type="number"
                min="0"
                step="1"
                className="wb-planning-input"
                value={planningInputs.dailySupplyLitres}
                onChange={(e) => handleInputChange("dailySupplyLitres", e.target.value)}
                data-testid="wb-input-daily-supply"
                placeholder="e.g. 100"
              />
              <span className="wb-planning-unit">L/day</span>
            </div>
          </div>
          {inputErrors.dailySupplyLitres && (
            <p className="wb-planning-error" data-testid="wb-input-error-dailySupply">
              {inputErrors.dailySupplyLitres}
            </p>
          )}

          {/* Planned Daily Demand */}
          <div className="wb-planning-row">
            <label htmlFor="wb-input-daily-demand">Daily Demand</label>
            <div className="wb-planning-input-wrap">
              <input
                id="wb-input-daily-demand"
                type="number"
                min="0"
                step="1"
                className="wb-planning-input"
                value={planningInputs.dailyDemandLitres}
                onChange={(e) => handleInputChange("dailyDemandLitres", e.target.value)}
                data-testid="wb-input-daily-demand"
                placeholder="e.g. 80"
              />
              <span className="wb-planning-unit">L/day</span>
            </div>
          </div>
          {inputErrors.dailyDemandLitres && (
            <p className="wb-planning-error" data-testid="wb-input-error-dailyDemand">
              {inputErrors.dailyDemandLitres}
            </p>
          )}

          {/* Available Reserve */}
          <div className="wb-planning-row">
            <label htmlFor="wb-input-available-reserve">Stored Reserve</label>
            <div className="wb-planning-input-wrap">
              <input
                id="wb-input-available-reserve"
                type="number"
                min="0"
                step="1"
                className="wb-planning-input"
                value={planningInputs.availableReserveLitres}
                onChange={(e) => handleInputChange("availableReserveLitres", e.target.value)}
                data-testid="wb-input-available-reserve"
                placeholder="e.g. 15"
              />
              <span className="wb-planning-unit">litres</span>
            </div>
          </div>
          {inputErrors.availableReserveLitres && (
            <p className="wb-planning-error" data-testid="wb-input-error-availableReserve">
              {inputErrors.availableReserveLitres}
            </p>
          )}

          {(planningInputs.dailySupplyLitres === "" ||
            planningInputs.dailyDemandLitres === "" ||
            planningInputs.availableReserveLitres === "") && (
            <p className="wb-planning-missing-hint" data-testid="wb-planning-missing-hint">
              ⚠️ Enter daily supply, demand, and reserve volume to evaluate complete mission readiness.
            </p>
          )}
        </div>
      </div>

      {/* Mission Completion Section */}
      <div className="wb-mission-completion" data-testid="wb-mission-completion">
        <div className="wb-completion-header">
          <h4 className="wb-completion-heading">
            <Trophy size={14} aria-hidden="true" />
            Mission Completion
          </h4>
          {alreadyCompleted ? (
            <span
              className="wb-completion-status-badge wb-completion-status-badge--completed"
              data-testid="wb-completion-status-completed"
            >
              Mission Completed
            </span>
          ) : completion.eligibleForCompletion ? (
            <span
              className="wb-completion-status-badge wb-completion-status-badge--ready"
              data-testid="wb-completion-status-ready"
            >
              Ready to Complete
            </span>
          ) : (
            <span
              className="wb-completion-status-badge wb-completion-status-badge--blocked"
              data-testid="wb-completion-status-blocked"
            >
              Requirements Incomplete
            </span>
          )}
        </div>

        {completion.eligibleForCompletion ? (
          <div className="wb-completion-ready-notice" data-testid="wb-completion-ready-notice">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>
              {alreadyCompleted
                ? "All mission requirements are satisfied! Replaying will verify your updated design (rewards already claimed)."
                : "All mission requirements are satisfied! You can now finish the mission and claim your rewards."}
            </span>
          </div>
        ) : (
          <div className="wb-completion-blockers" data-testid="wb-completion-blockers">
            <p className="wb-completion-blockers-title">
              <AlertTriangle size={14} aria-hidden="true" /> Complete these requirements to finish the mission:
            </p>
            <ul className="wb-completion-blockers-list">
              {completion.remainingTasks.map((task, idx) => (
                <li key={idx} className="wb-completion-blocker-item">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion Rewards Preview */}
        <div className="wb-completion-rewards-preview" data-testid="wb-completion-rewards-preview">
          <span className="wb-rewards-preview-label">Completion Rewards:</span>
          <div className="wb-rewards-preview-tags">
            <span className="wb-reward-tag wb-reward-tag--xp" data-testid="wb-preview-reward-xp">
              <Sparkles size={12} aria-hidden="true" /> +{MISSION_REWARDS.xp} XP
            </span>
            <span className="wb-reward-tag wb-reward-tag--coins" data-testid="wb-preview-reward-coins">
              <Coins size={12} aria-hidden="true" /> +{MISSION_REWARDS.coins} Coins
            </span>
            <span className="wb-reward-tag wb-reward-tag--badge" data-testid="wb-preview-reward-badge">
              <Award size={12} aria-hidden="true" /> {MISSION_REWARDS.badge}
            </span>
          </div>
        </div>

        {completionError && (
          <div className="wb-completion-error" data-testid="wb-completion-error">
            <AlertCircle size={14} aria-hidden="true" />
            <div className="wb-completion-error-content">
              <span className="wb-completion-error-text">{completionError}</span>
              <span className="wb-completion-error-hint">
                Your village design is saved. You can resolve the issue and retry completing the mission.
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`wb-complete-mission-btn ${
            completion.eligibleForCompletion && !isSubmitting
              ? "wb-complete-mission-btn--active"
              : "wb-complete-mission-btn--disabled"
          }`}
          disabled={!completion.eligibleForCompletion}
          onClick={handleCompleteMission}
          data-testid="wb-complete-mission-btn"
        >
          <Trophy size={16} aria-hidden="true" />
          {isSubmitting
            ? "Saving Progress..."
            : completionError
            ? "Retry Mission Completion"
            : alreadyCompleted
            ? "Complete Mission (Replay)"
            : "Complete Mission & Claim Rewards"}
        </button>
      </div>

      {/* Success Screen Modal */}
      {showSuccessScreen && (
        <MissionSuccessScreen
          completion={completion}
          completionResult={completionResult}
          onReturnToWorkspace={() => setShowSuccessScreen(false)}
          onBackToBriefing={onBackToBriefing}
        />
      )}
    </section>
  );
}
