import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Hammer, Lock } from "lucide-react";
import { STUDIO_CSS_VARS } from "@/features/studio/art/palette";
import { MISSION } from "@/features/studio/world-builder/data/mission";
import { CoinsArt, DripArt, FarmArt, HouseArt, PipeArt, TankArt, VillageScene, WellArt } from "@/features/studio/world-builder/art/WorldBuilderArt";
import "@/features/studio/studio.css";
import "@/features/studio/world-builder/world-builder.css";

// World Builder mission briefing (Phases D2 / D2.1). Read-only and static: it shows the mission's own
// starting resources and requirements from data/mission.js. It holds no player state, runs no
// simulation, and the Start Designing action is intentionally disabled until the construction
// workspace exists. Requirements are shown as requirements, never as results.

const RESOURCE_ART = { budget: CoinsArt, water: TankArt };
const RESOURCE_ACCENT = { budget: "amber", water: "sky" };
const OBJECTIVE_ART = { budget: CoinsArt, households: HouseArt, farm: FarmArt, well: WellArt, reserve: TankArt };
const CONCEPT_ART = { well: WellArt, pipes: PipeArt, houses: HouseArt, farms: FarmArt, drip: DripArt };
const ROLE_TONE = { Supply: "sky", Delivery: "slate", Demand: "amber", Saver: "green" };
const METER_SEGMENTS = 10;

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
          <div className="wb-hero-text">
            <p className="wb-kicker"><Hammer size={15} aria-hidden="true" /> World Builder mission</p>
            <h1 className="wb-title">{MISSION.title}</h1>
            <p className="wb-subtitle">{MISSION.subtitle}</p>
            <p className="wb-story" data-testid="world-builder-story">{MISSION.situation}</p>
            <div className="wb-goal" data-testid="world-builder-goal">
              <p className="wb-goal-head">Your goal</p>
              <p className="wb-goal-q">{MISSION.challenge}</p>
              <p className="wb-goal-text">{MISSION.goal}</p>
            </div>
          </div>
          <figure className="wb-scene">
            <VillageScene />
            <figcaption>The well has water, but nothing is connected yet. That's where you come in.</figcaption>
          </figure>
        </header>

        <div className="wb-duo">
          <section className="wb-card" aria-labelledby="wb-res-h" data-testid="world-builder-resources">
            <h2 id="wb-res-h" className="wb-h2">Your mission resources</h2>
            <ul className="wb-resources">
              {Object.values(resources).map((r) => {
                const Art = RESOURCE_ART[r.id];
                return (
                  <li key={r.id} className="wb-resource" data-accent={RESOURCE_ACCENT[r.id]} data-testid={`world-builder-resource-${r.id}`}>
                    <span className="wb-resource-art"><Art size={60} fill={1} /></span>
                    <div className="wb-resource-body">
                      <p className="wb-resource-label">{r.label}</p>
                      <p className="wb-resource-main">
                        <span className="wb-resource-value">{r.value}</span>
                        <span className="wb-resource-unit">{r.unit}</span>
                      </p>
                      <div className="wb-meter" aria-hidden="true">
                        {Array.from({ length: METER_SEGMENTS }, (_, i) => <i key={i} />)}
                      </div>
                      <p className="wb-meter-cap">Full at the start</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="wb-resources-note" data-testid="world-builder-resources-note">{MISSION.resourcesNote}</p>
          </section>

          <section className="wb-card" aria-labelledby="wb-obj-h" data-testid="world-builder-objectives">
            <h2 id="wb-obj-h" className="wb-h2">Mission requirements</h2>
            <p className="wb-muted">{MISSION.objectivesIntro}</p>
            <ol className="wb-objectives">
              {objectives.map((o) => {
                const Art = OBJECTIVE_ART[o.id];
                return (
                  <li key={o.id} data-testid={`world-builder-objective-${o.id}`}>
                    <span className="wb-obj-art"><Art size={40} fill={0.2} mark /></span>
                    <span className="wb-obj-copy">
                      <strong>{o.short}</strong>
                      <span>{o.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="wb-muted">{MISSION.objectivesNote}</p>
          </section>
        </div>

        <section className="wb-card" aria-labelledby="wb-how-h" data-testid="world-builder-how">
          <h2 id="wb-how-h" className="wb-h2">How the water network works</h2>
          <ul className="wb-how">
            {howItWorks.map((h) => {
              const Art = CONCEPT_ART[h.id];
              return (
                <li key={h.id} className="wb-concept" data-tone={ROLE_TONE[h.role]} data-testid={`world-builder-concept-${h.id}`}>
                  <span className="wb-concept-art"><Art size={56} /></span>
                  <div className="wb-concept-copy">
                    <span className="wb-tag">{h.role}</span>
                    <h3>{h.title}</h3>
                    <p>{h.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="wb-card" aria-labelledby="wb-loop-h" data-testid="world-builder-loop">
          <h2 id="wb-loop-h" className="wb-h2">How you'll work</h2>
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
          <span className="wb-start-art" aria-hidden="true"><Hammer size={28} /></span>
          <div className="wb-start-copy">
            <p className="wb-start-title">{startAction.preparingTitle}</p>
            <p className="wb-start-text">{startAction.preparingText}</p>
            <p id="wb-start-note" className="wb-start-note" data-testid="world-builder-start-note">
              <Lock size={16} aria-hidden="true" /> {startAction.disabledReason}
            </p>
          </div>
          <button type="button" className="studio-cta" disabled={!startAction.enabled} aria-disabled={!startAction.enabled} aria-describedby="wb-start-note" data-testid="world-builder-start">
            {startAction.label} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </section>
      </main>
    </div>
  );
}
