import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Palette } from "lucide-react";
import { CoinIcon } from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { STUDIO_HUB, STUDIO_TOOLS } from "@/features/studio/data/studioTools";
import { STUDIO_CSS_VARS } from "@/features/studio/art/palette";
import { LAYOUTS } from "@/features/studio/data/campusLayout";
import CampusScene from "@/features/studio/components/CampusScene";
import StationCard from "@/features/studio/components/StationCard";
import StationNav from "@/features/studio/components/StationNav";
import { useMediaQuery } from "@/features/studio/components/useMediaQuery";
import "@/features/studio/studio.css";

// Shows the player's real level, coins and day from the existing player state (read-only).
function StudioHud({ player }) {
  return (
    <div className="studio-hud" aria-label="Player status" data-testid="studio-hud">
      <span className="studio-pill"><strong>Lv {player.level}</strong></span>
      <span className="studio-pill"><CoinIcon className="studio-pill-icon" /><strong>{player.coins}</strong></span>
      <span className="studio-pill"><CalendarDays className="studio-pill-icon" aria-hidden="true" /><strong>Day {player.day}</strong></span>
    </div>
  );
}

export default function StudioHome() {
  const { player } = usePlayer();
  const narrow = useMediaQuery("(max-width: 899px)");
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const layout = narrow ? LAYOUTS.tall : LAYOUTS.wide;
  const selected = STUDIO_TOOLS.find((t) => t.id === selectedId) ?? null;

  const select = useCallback((id) => setSelectedId((cur) => (cur === id ? cur : id)), []);
  const clear = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="studio-scope" style={STUDIO_CSS_VARS} data-testid="studio-home" data-layout={layout.key} data-card={selectedId ? "true" : undefined}>
      <header className="studio-top">
        <Link to="/world" className="studio-back" data-testid="studio-back">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Village Map</span>
        </Link>
        <div className="studio-titleplate">
          <Palette size={26} aria-hidden="true" className="studio-title-icon" />
          <div>
            <h1 className="studio-title">{STUDIO_HUB.title}</h1>
            <p className="studio-lead">{STUDIO_HUB.subtitle}</p>
          </div>
        </div>
        <StudioHud player={player} />
      </header>

      <StationNav tools={STUDIO_TOOLS} selectedId={selectedId} onSelect={select} />

      <main className="studio-stage">
        <CampusScene layout={layout} tools={STUDIO_TOOLS} selectedId={selectedId} hoverId={hoverId} onSelect={select} onHover={setHoverId} onBackground={clear} />
      </main>

      {selectedId && <StationCard tool={selected} onClose={clear} />}

      <p className="studio-sr" role="status" aria-live="polite">
        {selectedId === "core"
          ? "Creative Core selected: Imagine, Build, Test, Improve."
          : selected
            ? `${selected.title} selected. ${selected.available ? "Use the Enter link." : "Coming soon: not playable yet."}`
            : ""}
      </p>
    </div>
  );
}
