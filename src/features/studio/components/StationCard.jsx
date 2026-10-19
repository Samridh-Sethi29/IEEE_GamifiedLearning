import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { PILLAR_LABELS, STUDIO_LOOP, STUDIO_MISSION } from "@/features/studio/data/studioTools";

// Small contextual card for the selected zone. It floats at the bottom of the screen so it never
// covers the heading or HUD, and it is honest: unfinished stations say so and have no live button.

export default function StationCard({ tool, onClose }) {
  if (!tool) {
    return (
      <aside className="studio-card" data-accent="sky" aria-label="Creative Core" data-testid="studio-detail">
        <button type="button" className="studio-card-x" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
        <p className="studio-card-kicker">The heart of the studio</p>
        <h2 className="studio-card-title">Creative Core</h2>
        <ol className="studio-loop">
          {STUDIO_LOOP.map((s, i) => (
            <li key={s.id}><span className="studio-loop-n" aria-hidden="true">{i + 1}</span><span><strong>{s.label}.</strong> {s.text}</span></li>
          ))}
        </ol>
      </aside>
    );
  }
  const live = tool.available && tool.route;
  const { Icon } = tool;
  return (
    <aside className="studio-card" data-accent={tool.accent} aria-label={`${tool.title} details`} data-testid="studio-detail" key={tool.id}>
      <button type="button" className="studio-card-x" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
      <p className="studio-card-kicker"><Icon size={15} aria-hidden="true" /> Zone</p>
      <h2 className="studio-card-title">{tool.title}</h2>
      <p className="studio-card-text">{tool.purpose}</p>
      <ul className="studio-chips" aria-label="Skill focus" data-testid="studio-skills">
        {tool.pillars.map((p) => <li key={p}>{PILLAR_LABELS[p]}</li>)}
      </ul>
      {tool.id === STUDIO_MISSION.station && (
        <p className="studio-card-mission" data-testid="studio-mission">Planned first mission: <strong>{STUDIO_MISSION.title}</strong> (not available yet).</p>
      )}
      <div className="studio-card-foot">
        {live ? (
          <Link to={tool.route} className="studio-cta" data-testid="studio-enter">Enter {tool.title}</Link>
        ) : (
          <>
            <span className="studio-badge" data-testid="studio-status">Coming soon</span>
            <span className="studio-note" data-testid="studio-note">Preview only. The activity isn't playable yet.</span>
          </>
        )}
      </div>
    </aside>
  );
}
