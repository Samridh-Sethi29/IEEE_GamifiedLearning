import React, { useState } from "react";
import { Image, Palette, Sparkles, Type, Wand2 } from "lucide-react";
import { PALETTE_COLORS, STICKER_CATALOG } from "../data/projects";

/**
 * Creative Magic Dock (Right-Side Palette)
 * Distinct, colorful, fun tabs:
 * 1. Typography & Badges
 * 2. Visual Stickers & Icons
 * 3. Color Mood Swatches
 */
export default function MagicDock({
  activeProjectId,
  onAddText,
  onAddBadge,
  onAddSticker,
  onChangeBg,
  currentBg,
}) {
  const [activeTab, setActiveTab] = useState("text"); // 'text' | 'stickers' | 'theme'

  return (
    <aside className="atelier-magic-dock" data-testid="magic-dock">
      <div className="atelier-dock-header">
        <div className="atelier-palette-nav">
          <button
            className={`atelier-palette-tab ${activeTab === "text" ? "active" : ""}`}
            onClick={() => setActiveTab("text")}
          >
            <Type size={14} />
            <span>Types</span>
          </button>
          <button
            className={`atelier-palette-tab ${activeTab === "stickers" ? "active" : ""}`}
            onClick={() => setActiveTab("stickers")}
          >
            <Sparkles size={14} />
            <span>Stickers</span>
          </button>
          <button
            className={`atelier-palette-tab ${activeTab === "theme" ? "active" : ""}`}
            onClick={() => setActiveTab("theme")}
          >
            <Palette size={14} />
            <span>Theme</span>
          </button>
        </div>
      </div>

      <div className="atelier-dock-scroll">
        {/* TAB 1: TEXT & BADGES */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">
              ✦ Add Typography
            </span>

            <div
              className="atelier-preset-card"
              onClick={() => onAddText("heading", "BOLD HEADLINE", 28)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg">
                  H1
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">Hero Heading</div>
                  <div className="text-[10px] text-slate-400">Eye-catching main title</div>
                </div>
              </div>
              <span className="text-purple-400 text-xs font-bold">+ Drop</span>
            </div>

            <div
              className="atelier-preset-card"
              onClick={() => onAddText("subtitle", "Supporting Subtitle", 18)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-purple-500/30 flex items-center justify-center font-bold text-sky-400 text-sm">
                  Sub
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">Subtitle Note</div>
                  <div className="text-[10px] text-slate-400">Message context</div>
                </div>
              </div>
              <span className="text-purple-400 text-xs font-bold">+ Drop</span>
            </div>

            <div
              className="atelier-preset-card"
              onClick={() => onAddText("details", "📅 Friday 10 AM • Main Hall", 14)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-lg">
                  📅
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">Date & Location</div>
                  <div className="text-[10px] text-slate-400">Event information</div>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-bold">+ Drop</span>
            </div>

            <div
              className="atelier-preset-card"
              onClick={() => onAddBadge("TAKE ACTION NOW!")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">Action Badge</div>
                  <div className="text-[10px] text-slate-400">Call-to-action button</div>
                </div>
              </div>
              <span className="text-pink-400 text-xs font-bold">+ Drop</span>
            </div>
          </div>
        )}

        {/* TAB 2: STICKERS */}
        {activeTab === "stickers" && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-pink-300 uppercase tracking-wider">
              ✦ Choose Visual Stickers
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {STICKER_CATALOG.map((st) => {
                const isProjectMatch = st.project === activeProjectId;
                return (
                  <div
                    key={st.id}
                    className={`atelier-sticker-tile ${isProjectMatch ? "recommended" : ""}`}
                    onClick={() => onAddSticker(st.id, st.icon, st.name)}
                    title={`Click to place ${st.name}`}
                  >
                    <span className="text-3xl">{st.icon}</span>
                    <span className="text-[11px] font-bold text-slate-200">{st.name}</span>
                    {isProjectMatch && (
                      <span className="text-[8px] font-black text-pink-400 uppercase tracking-wide">
                        ★ Match
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: THEMES & COLOR MOODS */}
        {activeTab === "theme" && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider">
              ✦ Canvas Color Mood
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {PALETTE_COLORS.map((hex) => (
                <button
                  key={hex}
                  className={`h-14 rounded-xl border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                    currentBg === hex
                      ? "border-pink-400 scale-105 shadow-lg shadow-pink-500/20"
                      : "border-slate-700/60 hover:border-slate-500"
                  }`}
                  style={{ backgroundColor: hex }}
                  onClick={() => onChangeBg(hex)}
                  title={hex}
                >
                  {currentBg === hex && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
