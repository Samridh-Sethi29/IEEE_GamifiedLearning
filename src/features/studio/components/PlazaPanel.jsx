import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Droplets, MousePointerClick } from "lucide-react";
import { PILLAR_LABELS, STUDIO_LOOP, STUDIO_MISSION } from "@/features/studio/data/studioTools";

// Compact preview for the selected station (or a short prompt when nothing is selected).
// It sits beside/below the illustrated campus, never on top of it.

function ComingSoon() {
  return <span className="studio-badge">Coming soon</span>;
}

function Idle() {
  return (
    <div className="studio-idle" data-testid="studio-idle">
      <span className="studio-idle-icon" aria-hidden="true">
        <MousePointerClick size={22} />
      </span>
      <h2 className="studio-panel-title">Choose where you want to begin</h2>
      <p className="studio-panel-lead">
        Click a station in the workshop, or use the station menu above. You'll see what it's for before you go in.
      </p>
      <ol className="studio-loop" aria-label="How the studio works">
        {STUDIO_LOOP.map((s, i) => (
          <li key={s.id}>
            <span className="studio-loop-n" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong>{s.label}.</strong> {s.text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Detail({ tool, water, onClear }) {
  const live = tool.available && tool.route;
  const { Icon } = tool;
  return (
    <div className="studio-detail" data-accent={tool.accent} data-testid="studio-detail">
      <p className="studio-detail-kicker">
        <Icon size={16} aria-hidden="true" /> Station preview
      </p>
      <h2 className="studio-panel-title">{tool.title}</h2>
      <p className="studio-panel-lead">{tool.purpose}</p>

      <p className="studio-detail-label">Skill focus</p>
      <ul className="studio-chips" data-testid="studio-skills">
        {tool.pillars.map((p) => (
          <li key={p}>{PILLAR_LABELS[p]}</li>
        ))}
      </ul>

      <p className="studio-detail-label">What you'll practise</p>
      <ul className="studio-detail-list">
        {tool.learn.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      {tool.id === STUDIO_MISSION.station && (
        <div className="studio-mission" data-testid="studio-mission">
          <Droplets size={18} aria-hidden="true" />
          <p>
            <strong>{STUDIO_MISSION.title}</strong> mission is on its way.{" "}
            <span data-testid="studio-water">
              Water in your village today: <strong>{water} L</strong>
            </span>
          </p>
        </div>
      )}

      {live ? (
        <Link to={tool.route} className="studio-cta" data-testid="studio-enter">
          Enter {tool.title}
        </Link>
      ) : (
        <>
          <button type="button" className="studio-cta" aria-disabled="true" data-testid="studio-enter">
            Enter {tool.title} <ComingSoon />
          </button>
          <p className="studio-note" data-testid="studio-note">
            This station isn't playable yet. What you see here is a preview of what's coming.
          </p>
        </>
      )}
      <button type="button" className="studio-link-btn" onClick={onClear}>
        <ArrowLeft size={14} aria-hidden="true" /> Clear selection
      </button>
    </div>
  );
}

const PlazaPanel = forwardRef(function PlazaPanel({ tool, water, onClear }, ref) {
  return (
    <aside className="studio-panel" ref={ref} aria-label="Station preview">
      {tool ? <Detail key={tool.id} tool={tool} water={water} onClear={onClear} /> : <Idle />}
    </aside>
  );
});

export default PlazaPanel;
