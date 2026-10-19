import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Coins, Droplets, Hammer, Lock, Target } from "lucide-react";
import { STUDIO_CSS_VARS } from "@/features/studio/art/palette";
import { MISSION } from "@/features/studio/world-builder/data/mission";
import "@/features/studio/studio.css";
import "@/features/studio/world-builder/world-builder.css";

// World Builder mission briefing (Phase D2). Read-only and static: it shows the mission's own
// starting resources and requirements from data/mission.js. It holds no player state, runs no
// simulation, and the Start Designing action is intentionally disabled until the construction
// workspace exists.

const RESOURCE_ICONS = { budget: Coins, water: Droplets };
const RESOURCE_ACCENT = { budget: "amber", water: "sky" };

export default function WorldBuilderBriefing() {
  const { resources, objectives, howItWorks, loop, startAction } = MISSION;
  return (
    <div className="studio-scope wb-scope" style={STUDIO_CSS_VARS} data-testid="world-builder-briefing" data-accent="emerald">
      <div className="wb-top">
        <Link to={MISSION.backTo} className="studio-back" data-testid="world-builder-back">
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="wb-back-text">{MISSION.backLabel}</span>
        </Link>
      </div>

      <main className="wb-shell">
        <header className="wb-card wb-hero">
          <p className="wb-kicker"><Hammer size={15} aria-hidden="true" /> World Builder mission</p>
          <h1 className="wb-title">{MISSION.title}</h1>
          <p className="wb-subtitle">{MISSION.subtitle}</p>
          <p className="wb-story" data-testid="world-builder-story">{MISSION.situation}</p>
        </header>

        <section className="wb-card" aria-labelledby="wb-res-h" data-testid="world-builder-resources">
          <div className="wb-section-head"><h2 id="wb-res-h">Your mission resources</h2></div>
          <ul className="wb-resources">
            {Object.values(resources).map((r) => {
              const Icon = RESOURCE_ICONS[r.id];
              return (
                <li key={r.id} className="wb-resource" data-accent={RESOURCE_ACCENT[r.id]} data-testid={`world-builder-resource-${r.id}`}>
                  <span className="wb-resource-icon" aria-hidden="true"><Icon size={26} /></span>
                  <div>
                    <p className="wb-resource-label">{r.label}</p>
                    <p className="wb-resource-value">{r.value}</p>
                    <p className="wb-resource-unit">{r.unit}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="wb-resources-note" data-testid="world-builder-resources-note">{MISSION.resourcesNote}</p>
        </section>

        <section className="wb-card" aria-labelledby="wb-obj-h" data-testid="world-builder-objectives">
          <div className="wb-section-head"><Target size={20} aria-hidden="true" /><h2 id="wb-obj-h">Mission requirements</h2></div>
          <p className="wb-muted">{MISSION.objectivesIntro}</p>
          <ol className="wb-objectives">
            {objectives.map((o, i) => (
              <li key={o.id} data-testid={`world-builder-objective-${o.id}`}>
                <span className="wb-obj-n" aria-hidden="true">{i + 1}</span>
                <span>{o.text}</span>
              </li>
            ))}
          </ol>
          <p className="wb-muted">{MISSION.objectivesNote}</p>
        </section>

        <section className="wb-card" aria-labelledby="wb-how-h">
          <div className="wb-section-head"><Droplets size={20} aria-hidden="true" /><h2 id="wb-how-h">How the water network works</h2></div>
          <div className="wb-split">
            {howItWorks.map((h) => (
              <div key={h.id} className="wb-idea">
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-card" aria-labelledby="wb-loop-h" data-testid="world-builder-loop">
          <div className="wb-section-head"><h2 id="wb-loop-h">How you'll work</h2></div>
          <p className="wb-loop-flow">{loop.map((s) => s.label).join(" → ")}</p>
          <ol className="wb-loop">
            {loop.map((s, i) => (
              <li key={s.id}>
                <span className="wb-loop-label"><span className="wb-loop-n" aria-hidden="true">{i + 1}</span>{s.label}</span>
                <span className="wb-loop-text">{s.text}</span>
              </li>
            ))}
          </ol>
          <p className="wb-muted">{MISSION.loopIntro}</p>
        </section>

        <section className="wb-card wb-start" aria-label="Start designing">
          <button type="button" className="studio-cta" disabled={!startAction.enabled} aria-disabled={!startAction.enabled} aria-describedby="wb-start-note" data-testid="world-builder-start">
            {startAction.label} <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p id="wb-start-note" className="wb-start-note" data-testid="world-builder-start-note">
            <Lock size={16} aria-hidden="true" /> {startAction.disabledReason}
          </p>
        </section>
      </main>
    </div>
  );
}
