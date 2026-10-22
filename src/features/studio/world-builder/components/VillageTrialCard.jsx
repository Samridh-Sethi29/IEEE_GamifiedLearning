import { AlertCircle, AlertTriangle, CheckCircle2, Droplets, Play, RotateCcw, X } from "lucide-react";
import "./VillageTrialCard.css";

/**
 * Child-friendly Water Connectivity Trial Card for World Builder ("Test Village").
 * Displays pass/fail results, diagnostic next steps, component stats, and stale indicators.
 * Does not mutate documents or player progression.
 */
export default function VillageTrialCard({ trialResult, isStale, onRetest, onDismiss }) {
  if (!trialResult) return null;

  const isPass = trialResult.ok;
  const statusClass = isPass ? "wb-trial-card--pass" : "wb-trial-card--fail";

  return (
    <div
      className={`wb-trial-card ${statusClass}`}
      data-testid="wb-trial-card"
      role="region"
      aria-label="Village Water Connectivity Trial"
    >
      <div className="wb-trial-card-header">
        <div className="wb-trial-title-wrap">
          {isPass ? (
            <CheckCircle2 size={20} className="wb-trial-status-icon wb-trial-status-icon--pass" aria-hidden="true" />
          ) : (
            <AlertCircle size={20} className="wb-trial-status-icon wb-trial-status-icon--fail" aria-hidden="true" />
          )}
          <div>
            <h3 className="wb-trial-title">{trialResult.title}</h3>
            <span
              className={`wb-trial-badge ${isPass ? "wb-trial-badge--pass" : "wb-trial-badge--fail"}`}
              data-testid="wb-trial-badge"
            >
              {isPass ? "Trial Passed" : "Needs Attention"}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="wb-trial-close-btn"
          onClick={onDismiss}
          data-testid="wb-trial-close-btn"
          aria-label="Close trial result"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="wb-trial-scope-note" data-testid="wb-trial-scope-note">
        Note: This is a <strong>water connectivity test</strong>. Full village mission completion requires household connections, budget compliance, and water reserve.
      </p>

      {isStale && (
        <div className="wb-trial-stale" data-testid="wb-trial-stale" role="status">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>Layout modified since last test — result is out of date.</span>
          <button
            type="button"
            className="sce-btn wb-retest-btn"
            onClick={onRetest}
            data-testid="wb-retest-btn"
          >
            <RotateCcw size={13} aria-hidden="true" /> Retest
          </button>
        </div>
      )}

      <div className="wb-trial-body">
        <p className="wb-trial-summary" data-testid="wb-trial-summary">
          {trialResult.summary}
        </p>

        {trialResult.blockingIssue && (
          <div className="wb-trial-blocking" data-testid="wb-trial-blocking">
            <AlertCircle size={16} aria-hidden="true" />
            <strong>{trialResult.blockingIssue}</strong>
          </div>
        )}

        {trialResult.nextSteps && trialResult.nextSteps.length > 0 && (
          <div className="wb-trial-steps-wrap">
            <h4 className="wb-trial-steps-title">
              {isPass ? "Trial Summary:" : "Next Steps to Connect Water:"}
            </h4>
            <ul className="wb-trial-steps" data-testid="wb-trial-steps">
              {trialResult.nextSteps.map((step, idx) => (
                <li key={idx} className="wb-trial-step-item">
                  <span className="wb-step-num">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="wb-trial-stats" data-testid="wb-trial-stats">
          <div className="wb-stat-pill">
            <Droplets size={14} aria-hidden="true" />
            <span>
              {trialResult.stats.wellsConnected}/{trialResult.stats.wellsTotal} Well{trialResult.stats.wellsTotal !== 1 ? "s" : ""} Connected
            </span>
          </div>
          <div className="wb-stat-pill">
            <span>
              {trialResult.stats.pipesConnected} Pipe{trialResult.stats.pipesConnected !== 1 ? "s" : ""} Connected
            </span>
          </div>
          <div className="wb-stat-pill">
            <span>
              {trialResult.stats.farmsReached}/{trialResult.stats.farmsTotal} Farm{trialResult.stats.farmsTotal !== 1 ? "s" : ""} Reached
            </span>
          </div>
        </div>
      </div>

      <div className="wb-trial-actions">
        <button
          type="button"
          className="sce-btn wb-trial-action-btn"
          onClick={onRetest}
          data-testid="wb-trial-retest-btn"
        >
          <Play size={14} aria-hidden="true" fill="currentColor" /> Retest Village
        </button>
        <button
          type="button"
          className="sce-btn wb-trial-dismiss-btn"
          onClick={onDismiss}
          data-testid="wb-trial-dismiss-btn"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
