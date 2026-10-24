import React, { useState } from "react";
import { Image, Palette, Sparkles, Type } from "lucide-react";
import { PALETTE_COLORS, STICKER_CATALOG } from "../data/projects";

/**
 * Creative Drawer (Left Panel)
 * Tabs:
 * 1. Text (Heading, Subtitle, Body, Action Badge)
 * 2. Graphics (Stickers / Illustrations)
 * 3. Colors (Background canvas themes)
 */
export default function CreativeDrawer({
  activeProjectId,
  onAddText,
  onAddBadge,
  onAddSticker,
  onChangeBg,
  currentBg,
}) {
  const [tab, setTab] = useState("text"); // 'text' | 'graphics' | 'colors'

  return (
    <aside className="atelier-drawer" data-testid="creative-drawer">
      {/* Drawer Tabs */}
      <div className="atelier-drawer-tabs">
        <button
          className={`atelier-tab-btn ${tab === "text" ? "active" : ""}`}
          onClick={() => setTab("text")}
        >
          <Type size={16} />
          <span>Text</span>
        </button>
        <button
          className={`atelier-tab-btn ${tab === "graphics" ? "active" : ""}`}
          onClick={() => setTab("graphics")}
        >
          <Image size={16} />
          <span>Graphics</span>
        </button>
        <button
          className={`atelier-tab-btn ${tab === "colors" ? "active" : ""}`}
          onClick={() => setTab("colors")}
        >
          <Palette size={16} />
          <span>Colors</span>
        </button>
      </div>

      {/* Drawer Content */}
      <div className="atelier-drawer-content">
        {tab === "text" && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Add Typography
            </span>

            <button
              className="atelier-add-card"
              onClick={() => onAddText("heading", "BOLD HEADLINE", 28)}
            >
              <span className="text-xl font-black text-amber-300">T</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100">+ Add Heading</span>
                <span className="text-[10px] text-slate-400">Large, eye-catching title</span>
              </div>
            </button>

            <button
              className="atelier-add-card"
              onClick={() => onAddText("subtitle", "Supporting Subtitle", 18)}
            >
              <span className="text-lg font-bold text-sky-300">T</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100">+ Add Subtitle</span>
                <span className="text-[10px] text-slate-400">Context & explanation</span>
              </div>
            </button>

            <button
              className="atelier-add-card"
              onClick={() => onAddText("details", "📅 Friday 10 AM • Main Hall", 14)}
            >
              <span className="text-sm font-semibold text-emerald-300">📅</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100">+ Event Details</span>
                <span className="text-[10px] text-slate-400">Date, time & location</span>
              </div>
            </button>

            <button
              className="atelier-add-card"
              onClick={() => onAddBadge("TAKE ACTION NOW!")}
            >
              <span className="text-xs font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                BADGE
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100">+ Action Badge</span>
                <span className="text-[10px] text-slate-400">High-contrast call-to-action</span>
              </div>
            </button>
          </div>
        )}

        {tab === "graphics" && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Illustration Stickers
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STICKER_CATALOG.map((sticker) => {
                const isRecommended = sticker.project === activeProjectId;
                return (
                  <button
                    key={sticker.id}
                    className={`atelier-add-card flex-col items-center justify-center p-3 text-center ${
                      isRecommended ? "border-violet-500 bg-violet-950/30" : ""
                    }`}
                    onClick={() => onAddSticker(sticker.id, sticker.icon, sticker.name)}
                    title={sticker.name}
                  >
                    <span className="text-3xl">{sticker.icon}</span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">
                      {sticker.name}
                    </span>
                    {isRecommended && (
                      <span className="text-[8px] font-bold text-violet-400 uppercase">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "colors" && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Poster Canvas Color
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-12 rounded-lg border-2 transition-transform cursor-pointer ${
                    currentBg === c ? "border-violet-400 scale-105" : "border-slate-700"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => onChangeBg(c)}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
