import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { CoinIcon } from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { STUDIO_HUB, STUDIO_TOOLS } from "@/features/studio/data/studioTools";
import { Birds, Bush, Cloud, Explorer, Fountain, Pond, Sign, Tree, Villager } from "@/features/studio/art/StationArt";
import StationButton from "@/features/studio/components/StationButton";
import StationNav from "@/features/studio/components/StationNav";
import PlazaPanel from "@/features/studio/components/PlazaPanel";
import "@/features/studio/studio.css";

// Compact HUD that lives in the page header (the global floating HUD would sit on the scene).
function StudioHud({ player }) {
  return (
    <div className="studio-hud" aria-label="Player status" data-testid="studio-hud">
      <span className="studio-pill studio-pill--player">
        <span className="studio-pill-name">{player.name}</span>
        <strong>Lv {player.level}</strong>
      </span>
      <span className="studio-pill">
        <CoinIcon className="studio-pill-icon" />
        <strong>{player.coins}</strong>
      </span>
      <span className="studio-pill">
        <CalendarDays className="studio-pill-icon" aria-hidden="true" />
        <strong>Day {player.day}</strong>
      </span>
    </div>
  );
}

export default function StudioHome() {
  const { player } = usePlayer();
  const [selectedId, setSelectedId] = useState(null);
  const panelRef = useRef(null);
  const selected = STUDIO_TOOLS.find((t) => t.id === selectedId) ?? null;

  const select = useCallback((id) => setSelectedId(id), []);
  const clear = useCallback(() => setSelectedId(null), []);

  // Escape clears the selection.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When the layout stacks (panel below the scene), bring the preview into view.
  useEffect(() => {
    if (!selectedId || !panelRef.current) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
  }, [selectedId]);

  return (
    <div className="studio-scope" data-testid="studio-home">
      <div className="studio-shell">
        <header className="studio-header">
          <Link to="/world" className="studio-back" data-testid="studio-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Village Map
          </Link>
          <div className="studio-heading">
            <h1 className="studio-title">{STUDIO_HUB.title}</h1>
            <p className="studio-lead">{STUDIO_HUB.subtitle}</p>
          </div>
          <StudioHud player={player} />
        </header>

        <StationNav tools={STUDIO_TOOLS} selectedId={selectedId} onSelect={select} />

        <div className="studio-stage">
          <div className="studio-viewport">
            <div className="studio-world" data-at={selectedId ?? "plaza"} data-testid="studio-world">
              <Cloud className="studio-sky studio-sky--a" />
              <Cloud className="studio-sky studio-sky--b" />
              <div className="studio-island" aria-hidden="true">
              </div>

              <svg className="studio-paths studio-paths--wide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <g className="studio-trail">
                  <path d="M 50 50 L 27.5 46" />
                  <path d="M 50 50 L 72.5 46" />
                  <path d="M 50 50 L 27.5 53" />
                  <path d="M 50 50 L 72.5 53" />
                </g>
              </svg>
              <svg className="studio-paths studio-paths--tall" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <g className="studio-trail">
                  <path d="M 50 49 L 27 37.5" />
                  <path d="M 50 49 L 73 37.5" />
                  <path d="M 50 49 L 27 60" />
                  <path d="M 50 49 L 73 60" />
                </g>
              </svg>
              <div className="studio-plaza-disc" aria-hidden="true" />

              <Birds className="studio-birds" />
              <Sign className="studio-deco studio-deco--sign" />
              <Tree className="studio-deco studio-deco--tree-l" />
              <Tree className="studio-deco studio-deco--tree-r" />
              <Bush className="studio-deco studio-deco--bush-l" flower="#f472b6" />
              <Bush className="studio-deco studio-deco--bush-r" flower="#fde047" />
              <Pond className="studio-deco studio-deco--pond" />
              <Fountain className="studio-plaza-art" />
              <Villager className="studio-npc studio-npc--a" shirt="#ef4444" />
              <Villager className="studio-npc studio-npc--b" shirt="#a855f7" />

              {STUDIO_TOOLS.map((tool) => (
                <StationButton key={tool.id} tool={tool} selected={tool.id === selectedId} onSelect={select} />
              ))}

              <div className="studio-explorer">
                <span className="studio-tag">
                  {player.name} <b>Lv {player.level}</b>
                </span>
                <Explorer className="studio-explorer-art" />
              </div>
            </div>
          </div>

          <PlazaPanel ref={panelRef} tool={selected} water={player.water} onClear={clear} />
        </div>

        <p className="studio-sr" role="status" aria-live="polite">
          {selected
            ? `${selected.title} selected. ${selected.available ? "Use the Enter button." : "Coming soon: not playable yet."}`
            : ""}
        </p>
      </div>
    </div>
  );
}
