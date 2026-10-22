import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Coins,
  Droplets,
  Home,
  Sparkles,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import "./MissionSuccessScreen.css";

/**
 * World Builder Mission Success Screen Component.
 * Child-friendly celebration dialog presented when all "Save Our Village"
 * objectives are verified and the player explicitly completes the mission.
 *
 * Displays the verified mission objectives and the awarded player progression rewards
 * (or replay notice if previously completed).
 *
 * @param {object} props
 * @param {object} props.completion - Evaluator output from evaluateMissionCompletion()
 * @param {object} [props.completionResult] - Output from executeMissionCompletion() containing reward outcome
 * @param {Function} props.onReturnToWorkspace - Callback to dismiss success dialog and return to editor
 * @param {Function} [props.onBackToBriefing] - Callback to navigate back to mission briefing
 */
export default function MissionSuccessScreen({
  completion,
  completionResult,
  onReturnToWorkspace,
  onBackToBriefing,
}) {
  const reqs = completion?.requirements || {};
  const thresholds = completion?.thresholds || {};

  const networkStatus = reqs.waterNetwork;
  const householdsStatus = reqs.households;
  const budgetStatus = reqs.budget;
  const dailyWaterStatus = reqs.dailyWater;
  const reserveStatus = reqs.reserve;

  const connectedHouseholds = householdsStatus?.actual ?? 0;
  const targetHouseholds = householdsStatus?.target ?? thresholds.households ?? 4;

  const budgetSpent = budgetStatus?.actual ?? 0;
  const budgetLimit = budgetStatus?.details?.budgetLimit ?? budgetStatus?.target ?? thresholds.budgetLimit ?? 100;
  const budgetRemaining = budgetStatus?.details?.remainingBudget ?? (budgetLimit - budgetSpent);

  const plannedSupply = dailyWaterStatus?.details?.dailySupplyLitres ?? dailyWaterStatus?.actual ?? 0;
  const requiredSupply = thresholds.dailySupply ?? 100;
  const plannedDemand = dailyWaterStatus?.details?.dailyDemandLitres ?? 0;

  const storedReserve = reserveStatus?.details?.availableReserveLitres ?? reserveStatus?.actual ?? 0;
  const minimumReserve = thresholds.minimumReserve ?? 10;

  const isRewarded = completionResult?.rewarded === true;
  const isReplay = completionResult?.isReplay === true;
  const grantSummary = completionResult?.grantSummary;

  const handleBackToBriefing = () => {
    if (typeof onBackToBriefing === "function") {
      onBackToBriefing();
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("activity");
      url.searchParams.delete("mode");
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <div
      className="wb-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wb-completion-title"
      data-testid="wb-mission-success-screen"
    >
      <div className="wb-success-dialog">
        {/* Celebratory Header */}
        <div className="wb-success-banner">
          <div className="wb-success-badge-icon" aria-hidden="true">
            <Sparkles size={32} />
          </div>
          <h2
            id="wb-completion-title"
            className="wb-success-title"
            data-testid="wb-completion-title"
          >
            Village Saved!
          </h2>
          <p
            className="wb-success-message"
            data-testid="wb-completion-message"
          >
            Outstanding work! You solved the water crisis and secured a bright future for the entire village.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="wb-success-body" data-testid="wb-completion-body">
          {/* Rewards Section: First-time completion */}
          {isRewarded && (
            <div className="wb-success-rewards-card" data-testid="wb-completion-rewards-card">
              <h3 className="wb-rewards-card-title">
              <Sparkles size={16} aria-hidden="true" /> Rewards Earned
            </h3>
            <div className="wb-rewards-grid">
              <div className="wb-reward-badge" data-testid="wb-reward-xp">
                <span className="wb-reward-icon"><Zap size={18} /></span>
                <span className="wb-reward-val">+{grantSummary?.xp ?? 200} XP</span>
                <span className="wb-reward-lbl">Player XP</span>
              </div>
              <div className="wb-reward-badge" data-testid="wb-reward-coins">
                <span className="wb-reward-icon"><Coins size={18} /></span>
                <span className="wb-reward-val">+{grantSummary?.coins ?? 50} Coins</span>
                <span className="wb-reward-lbl">Player Coins</span>
              </div>
              <div className="wb-reward-badge" data-testid="wb-reward-badge">
                <span className="wb-reward-icon"><Award size={18} /></span>
                <span className="wb-reward-val">Badge</span>
                <span className="wb-reward-lbl">{grantSummary?.badge ?? "Village Hydrologist"}</span>
              </div>
            </div>
            {grantSummary?.leveledUp && (
              <div className="wb-reward-levelup-notice" data-testid="wb-reward-levelup">
                🎉 Level Up! You reached Level {grantSummary.newLevel}! (+{grantSummary.coinBonus} Coin Level-Up Bonus)
              </div>
            )}
          </div>
        )}

        {/* Replay Notice: Already completed previously */}
        {isReplay && (
          <div className="wb-success-replay-card" data-testid="wb-completion-replay-card">
            <h3 className="wb-replay-card-title">
              <Sparkles size={16} aria-hidden="true" /> Mission Replayed
            </h3>
            <p className="wb-replay-card-text">
              Village saved again! Your updated design meets all standards. One-time completion rewards (+200 XP, +50 Coins, Village Hydrologist Badge) were already claimed on your previous completion.
            </p>
          </div>
        )}

        {/* Narrative Challenge Solved */}
        <div
          className="wb-success-challenge-card"
          data-testid="wb-completion-challenge-solved"
        >
          <h3 className="wb-challenge-title">
            <Droplets size={18} aria-hidden="true" /> How You Solved the Village Challenge
          </h3>
          <p className="wb-challenge-text">
            By connecting the well directly to the farm and surrounding homes, balancing daily
            water flow, and maintaining a secure emergency reserve within the village construction
            budget, you designed an efficient, working water network that keeps everyone safe and supplied.
          </p>
        </div>

        {/* Objectives Summary */}
        <div className="wb-success-objectives-section">
          <h3 className="wb-objectives-heading">
            <CheckCircle2 size={16} aria-hidden="true" /> Completed Mission Objectives
          </h3>

          <ul
            className="wb-success-objectives-list"
            data-testid="wb-completion-objectives"
          >
            {/* 1. Water Network */}
            <li
              className="wb-success-objective-item"
              data-testid="wb-completion-metric-network"
            >
              <div className="wb-objective-icon-wrap wb-icon-network">
                <Warehouse size={18} aria-hidden="true" />
              </div>
              <div className="wb-objective-info">
                <div className="wb-objective-header">
                  <span className="wb-objective-name">Water Network</span>
                  <span className="wb-objective-tag">Completed</span>
                </div>
                <p className="wb-objective-metric">
                  Well connected to farm plot intake via continuous pipeline
                </p>
              </div>
            </li>

            {/* 2. Households */}
            <li
              className="wb-success-objective-item"
              data-testid="wb-completion-metric-households"
            >
              <div className="wb-objective-icon-wrap wb-icon-households">
                <Home size={18} aria-hidden="true" />
              </div>
              <div className="wb-objective-info">
                <div className="wb-objective-header">
                  <span className="wb-objective-name">Household Supply</span>
                  <span className="wb-objective-tag">Target Met</span>
                </div>
                <p className="wb-objective-metric">
                  <strong>{connectedHouseholds} / {targetHouseholds}</strong> households connected and receiving water
                </p>
              </div>
            </li>

            {/* 3. Budget */}
            <li
              className="wb-success-objective-item"
              data-testid="wb-completion-metric-budget"
            >
              <div className="wb-objective-icon-wrap wb-icon-budget">
                <Coins size={18} aria-hidden="true" />
              </div>
              <div className="wb-objective-info">
                <div className="wb-objective-header">
                  <span className="wb-objective-name">Construction Budget</span>
                  <span className="wb-objective-tag">Within Budget</span>
                </div>
                <p className="wb-objective-metric">
                  <strong>{budgetSpent} / {budgetLimit}</strong> coins spent ({budgetRemaining} coins remaining)
                </p>
              </div>
            </li>

            {/* 4. Daily Water Supply */}
            <li
              className="wb-success-objective-item"
              data-testid="wb-completion-metric-dailyWater"
            >
              <div className="wb-objective-icon-wrap wb-icon-supply">
                <Droplets size={18} aria-hidden="true" />
              </div>
              <div className="wb-objective-info">
                <div className="wb-objective-header">
                  <span className="wb-objective-name">Daily Water Supply</span>
                  <span className="wb-objective-tag">Balanced</span>
                </div>
                <p className="wb-objective-metric">
                  <strong>{plannedSupply} L/day</strong> planned (meets {requiredSupply} L/day requirement; planned demand: {plannedDemand} L/day)
                </p>
              </div>
            </li>

            {/* 5. Water Reserve */}
            <li
              className="wb-success-objective-item"
              data-testid="wb-completion-metric-reserve"
            >
              <div className="wb-objective-icon-wrap wb-icon-reserve">
                <Droplets size={18} aria-hidden="true" />
              </div>
              <div className="wb-objective-info">
                <div className="wb-objective-header">
                  <span className="wb-objective-name">Water Reserve</span>
                  <span className="wb-objective-tag">Safeguarded</span>
                </div>
                <p className="wb-objective-metric">
                  <strong>{storedReserve} L</strong> stored reserve (meets {minimumReserve} L minimum requirement)
                </p>
              </div>
            </li>
          </ul>

          <p className="wb-success-planning-disclaimer">
            * Note: Water supply, demand, and reserve values reflect your entered operational plan, while network connectivity and construction budget are evaluated directly from your village layout.
          </p>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="wb-success-actions">
          <button
            type="button"
            className="wb-btn-return-workspace"
            onClick={onReturnToWorkspace}
            data-testid="wb-completion-return-workspace"
          >
            <Wrench size={16} aria-hidden="true" />
            Return to Workspace
          </button>
          <button
            type="button"
            className="wb-btn-return-briefing"
            onClick={handleBackToBriefing}
            data-testid="wb-completion-return-briefing"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Mission Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
