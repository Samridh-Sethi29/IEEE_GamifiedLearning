import { useCallback, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Droplets } from "lucide-react";
import {
  getSelectedWaterStatus,
  getWaterStatus,
  isDocModified,
} from "../engine/waterStatusModel.js";
import "./WaterStatusInspector.css";

/**
 * Child-friendly Water Status Inspector for World Builder.
 * Evaluates water network reachability from wells to village farms.
 * Does not mutate documents or history.
 */
export default function WaterStatusInspector({ doc, selected }) {
  const [lastEvaluatedDoc, setLastEvaluatedDoc] = useState(null);
  const [status, setStatus] = useState(null);

  const runCheck = useCallback(() => {
    const nextStatus = getWaterStatus(doc);
    setStatus(nextStatus);
    setLastEvaluatedDoc(doc);
  }, [doc]);

  const isStale = lastEvaluatedDoc !== null && isDocModified(lastEvaluatedDoc, doc);
  const selectedWaterStatus = selected
    ? getSelectedWaterStatus(doc, selected.id, status?.evaluation)
    : null;

  return (
    <section className="wb-status-inspector" data-testid="wb-status-inspector" aria-label="Water System Status">
      <div className="wb-status-header">
        <h3 className="wb-status-title">
          <Droplets size={16} aria-hidden="true" />
          Water System
        </h3>
      </div>

      <button
        type="button"
        className="sce-btn wb-check-btn"
        onClick={runCheck}
        data-testid="wb-check-water-btn"
      >
        <Droplets size={16} aria-hidden="true" />
        Check Water System
      </button>

      {isStale && (
        <div className="wb-status-stale" data-testid="wb-status-stale" role="status">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>Layout modified — click Check Water System to update.</span>
        </div>
      )}

      {!status ? (
        <p className="sce-hint" data-testid="wb-status-initial">
          Click &ldquo;Check Water System&rdquo; to evaluate your village layout.
        </p>
      ) : (
        <>
          <div
            className={`wb-status-banner wb-status-banner--${status.status}`}
            data-testid="wb-status-banner"
            data-status={status.status}
          >
            {status.status === "connected" ? (
              <CheckCircle2 size={18} className="wb-status-icon wb-status-icon--connected" aria-hidden="true" />
            ) : (
              <AlertCircle size={18} className="wb-status-icon wb-status-icon--attention" aria-hidden="true" />
            )}
            <div className="wb-status-banner-text">
              <strong>{status.statusLabel}</strong>
              <span>{status.summaryText}</span>
            </div>
          </div>

          {status.messages.length > 0 && (
            <div className="wb-status-messages" data-testid="wb-status-messages">
              {status.messages.map((m, i) => (
                <div
                  key={i}
                  className={`wb-msg wb-msg--${m.kind}`}
                  data-testid={`wb-status-msg-${i}`}
                >
                  {m.kind === "success" ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : m.kind === "warning" ? (
                    <AlertTriangle size={14} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={14} aria-hidden="true" />
                  )}
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          )}

          <ul className="wb-status-checklist" data-testid="wb-status-checklist">
            {status.checklist.map((item) => (
              <li
                key={item.id}
                className="wb-checklist-item"
                data-testid={`wb-checklist-${item.id}`}
                data-ok={item.ok ? "true" : "false"}
              >
                <span className="wb-check-badge">
                  {item.ok ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={14} aria-hidden="true" />
                  )}
                </span>
                <div className="wb-check-copy">
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedWaterStatus && (
        <div
          className="wb-selected-water-status"
          data-testid="wb-selected-water-status"
          data-connected={selectedWaterStatus.connected ? "true" : "false"}
        >
          <p className="wb-selected-label">
            <Droplets size={14} aria-hidden="true" />
            {selectedWaterStatus.label}
          </p>
          <div className="wb-selected-badge">
            {selectedWaterStatus.connected ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : (
              <AlertCircle size={14} aria-hidden="true" />
            )}
            <strong>{selectedWaterStatus.status}</strong>
          </div>
          <p className="wb-selected-detail">{selectedWaterStatus.detail}</p>
        </div>
      )}
    </section>
  );
}
