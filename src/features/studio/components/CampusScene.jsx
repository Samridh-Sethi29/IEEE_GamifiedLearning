import { CoreArt } from "@/features/studio/art/campus/CoreArt";
import { Backdrop, Foreground, Frame } from "@/features/studio/art/campus/Backdrop";
import { DesignAtelierZone, InventionLabZone, StoryStudioZone, WorldBuilderZone } from "@/features/studio/art/campus/zones";
import { ACCENT_COLORS, coreRect, toPercent, zoneRect } from "@/features/studio/data/campusLayout";

const ZONE_ART = {
  "world-builder": WorldBuilderZone,
  "invention-lab": InventionLabZone,
  "story-studio": StoryStudioZone,
  "design-studio": DesignAtelierZone,
};

function Marker({ x, y, n, selected }) {
  return (
    <g transform={`translate(${x} ${y})`} className="studio-marker" data-selected={selected ? "true" : undefined}>
      <circle r="34" fill="#ffd35a" opacity=".35" className="studio-glow" />
      <circle r="25" fill="#7a5a14" stroke="#2a1a0e" strokeWidth="3" />
      <circle r="20" fill="#f5b82e" stroke="#fff0b0" strokeWidth="3" />
      <text className="studio-marker-text" y="9" textAnchor="middle">{n}</text>
    </g>
  );
}

function MissionPlate({ x, y }) {
  return (
    <g transform={`translate(${x - 130} ${y - 32})`} className="studio-mission-plate">
      <rect x="4" y="5" width="260" height="62" rx="8" fill="rgba(0,0,0,.35)" />
      <rect width="260" height="62" rx="8" fill="#e9d7ac" stroke="#4a3320" strokeWidth="3" />
      <rect x="6" y="6" width="248" height="50" rx="5" fill="none" stroke="#a87a3a" strokeWidth="2" />
      <text x="130" y="26" textAnchor="middle" className="studio-mission-kicker">MISSION 01 · COMING SOON</text>
      <text x="130" y="50" textAnchor="middle" className="studio-mission-text">SAVE OUR VILLAGE</text>
    </g>
  );
}

/**
 * The campus: one SVG for the artwork (decorative) plus real <button> hit areas laid over each
 * zone, so selection works with mouse, touch and keyboard independently of the drawing.
 */
export default function CampusScene({ layout, tools, selectedId, hoverId, onSelect, onHover, onBackground }) {
  const core = layout.core;
  return (
    <div
      className="studio-scene"
      style={{ aspectRatio: `${layout.w} / ${layout.h}` }}
      data-testid="studio-world"
      data-at={selectedId ?? "none"}
      onClick={(e) => e.target === e.currentTarget && onBackground()}
    >
      <svg className="studio-svg" viewBox={`0 0 ${layout.w} ${layout.h}`} aria-hidden="true" focusable="false" onClick={onBackground}>
        <Backdrop layout={layout} />
        {tools.map((t) => {
          const z = layout.zones[t.id];
          const Art = ZONE_ART[t.id];
          return (
            <g key={t.id} transform={`translate(${z.x} ${z.y}) scale(${z.s})`}>
              <g
                className="studio-zone"
                data-selected={selectedId === t.id ? "true" : undefined}
                data-lift={hoverId === t.id ? "true" : undefined}
                style={{ "--glow": ACCENT_COLORS[t.accent] }}
              >
                <Art accent={ACCENT_COLORS[t.accent]} />
              </g>
            </g>
          );
        })}
        <g transform={`translate(${core.x} ${core.y}) scale(${core.s})`}>
          <g className="studio-zone studio-zone--core" data-selected={selectedId === "core" ? "true" : undefined} data-lift={hoverId === "core" ? "true" : undefined} style={{ "--glow": "#ffd23f" }}>
            <CoreArt />
          </g>
        </g>
        {layout.mission && <MissionPlate {...layout.mission} />}
        {tools.map((t, i) => <Marker key={t.id} n={i + 1} x={layout.markers[t.id][0]} y={layout.markers[t.id][1]} selected={selectedId === t.id} />)}
        <Foreground layout={layout} />
        <Frame w={layout.w} h={layout.h} />
      </svg>

      {tools.map((t, i) => (
        <button
          key={t.id}
          type="button"
          className="studio-hit"
          style={{ ...toPercent(layout, zoneRect(layout, t.id)), "--glow": ACCENT_COLORS[t.accent] }}
          aria-pressed={selectedId === t.id}
          aria-label={`${i + 1}. ${t.title}${t.available ? "" : ", coming soon"}`}
          data-testid={`studio-zone-${t.id}`}
          onClick={(e) => { e.stopPropagation(); onSelect(t.id); }}
          onPointerEnter={() => onHover(t.id)}
          onPointerLeave={() => onHover(null)}
          onFocus={() => onHover(t.id)}
          onBlur={() => onHover(null)}
        />
      ))}
      <button
        type="button"
        className="studio-hit studio-hit--core"
        style={{ ...toPercent(layout, coreRect(layout)), "--glow": "#ffd23f" }}
        aria-pressed={selectedId === "core"}
        aria-label="Creative Core: how the studio works"
        data-testid="studio-zone-core"
        onClick={(e) => { e.stopPropagation(); onSelect("core"); }}
        onPointerEnter={() => onHover("core")}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover("core")}
        onBlur={() => onHover(null)}
      />
    </div>
  );
}
