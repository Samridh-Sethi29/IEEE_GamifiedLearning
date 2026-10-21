import React, { useState } from "react";
import {
  FolderHeart,
  Image as ImageIcon,
  Layers,
  Palette,
  Shapes,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";
import { COLOR_CATEGORIES, SHAPES_CATALOG, STICKER_CATALOG } from "../data/projects";

/**
 * Creative Studio Drawer
 * Tabs:
 * 1. Uploads: user can upload custom images from device
 * 2. Elements: stickers, icons, and geometric shapes
 * 3. Text: headline, subtitle, body, action badges
 * 4. Colors: categorized background palette themes
 */
export default function CanvaDrawer({
  activeProjectId,
  onAddText,
  onAddBadge,
  onAddSticker,
  onAddShape,
  onUploadImage,
  uploadedImages = [],
  onChangeBg,
  currentBg,
}) {
  const [navTab, setNavTab] = useState("elements"); // 'elements' | 'text' | 'uploads' | 'colors'
  const [elementCategory, setElementCategory] = useState("All");

  const categories = ["All", "Nature", "Kindness", "Science", "Safety", "Shapes"];

  const filteredStickers =
    elementCategory === "All"
      ? STICKER_CATALOG
      : STICKER_CATALOG.filter((s) => s.category === elementCategory);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl && typeof dataUrl === "string") {
        onUploadImage(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset input so same file can be chosen again if needed
  };

  return (
    <div className="flex h-full">
      {/* 1. Creative Studio Icon Sidebar */}
      <nav className="canva-icon-sidebar" data-testid="canva-sidebar">
        <button
          className={`canva-nav-tab ${navTab === "elements" ? "active" : ""}`}
          onClick={() => setNavTab("elements")}
        >
          <Sparkles size={20} />
          <span>Elements</span>
        </button>

        <button
          className={`canva-nav-tab ${navTab === "text" ? "active" : ""}`}
          onClick={() => setNavTab("text")}
        >
          <Type size={20} />
          <span>Text</span>
        </button>

        <button
          className={`canva-nav-tab ${navTab === "uploads" ? "active" : ""}`}
          onClick={() => setNavTab("uploads")}
        >
          <Upload size={20} />
          <span>Uploads</span>
        </button>

        <button
          className={`canva-nav-tab ${navTab === "colors" ? "active" : ""}`}
          onClick={() => setNavTab("colors")}
        >
          <Palette size={20} />
          <span>Colors</span>
        </button>
      </nav>

      {/* 2. Slide-out Panel */}
      <aside className="canva-drawer-panel" data-testid="canva-drawer">
        <div className="canva-drawer-header">
          <span>
            {navTab === "elements" && "Design Elements"}
            {navTab === "text" && "Typography"}
            {navTab === "uploads" && "Your Images"}
            {navTab === "colors" && "Poster Colors"}
          </span>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            {navTab === "elements" ? `${filteredStickers.length} Items` : "Creative Desk"}
          </span>
        </div>

        <div className="canva-drawer-scroll">
          {/* TAB 1: ELEMENTS (STICKERS & RESIZABLE SHAPES) */}
          {navTab === "elements" && (
            <div className="flex flex-col gap-3">
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border cursor-pointer transition ${
                      elementCategory === cat
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                    onClick={() => setElementCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Geometric Shapes Category */}
              {(elementCategory === "All" || elementCategory === "Shapes") && (
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    Shapes & Frames (Drag Corners to Resize)
                  </span>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {SHAPES_CATALOG.map((shp) => (
                      <button
                        key={shp.id}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition hover:border-cyan-400"
                        onClick={() => onAddShape(shp.shape, shp.name)}
                      >
                        <span className="text-lg text-cyan-400">{shp.icon}</span>
                        <span className="text-xs font-bold text-slate-200">{shp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stickers Grid */}
              {elementCategory !== "Shapes" && (
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    Illustrations & Badges
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {filteredStickers.map((st) => {
                      const isMatch = st.project === activeProjectId;
                      return (
                        <button
                          key={st.id}
                          className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition border cursor-pointer ${
                            isMatch
                              ? "bg-cyan-950/40 border-cyan-400/60 shadow-md shadow-cyan-500/10 hover:scale-105"
                              : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-700 hover:scale-105"
                          }`}
                          onClick={() => onAddSticker(st.id, st.icon, st.name)}
                          title={st.name}
                        >
                          <span className="text-3xl filter drop-shadow">{st.icon}</span>
                          <span className="text-[10px] font-bold text-slate-200 truncate w-full text-center">
                            {st.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEXT */}
          {navTab === "text" && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Click to add text
              </span>

              <button
                className="w-full text-left p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition cursor-pointer shadow-sm hover:border-cyan-400"
                onClick={() => onAddText("heading", "ADD A HEADING", 32)}
              >
                <div className="text-xl font-black text-white tracking-wide">Add a heading</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Large, bold title for your poster</div>
              </button>

              <button
                className="w-full text-left p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition cursor-pointer shadow-sm hover:border-cyan-400"
                onClick={() => onAddText("subtitle", "Add a subheading to share details", 18)}
              >
                <div className="text-sm font-bold text-sky-300">Add a subheading</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Context, subtitle and slogan</div>
              </button>

              <button
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition cursor-pointer shadow-sm hover:border-cyan-400"
                onClick={() => onAddText("details", "📅 Date: Friday 10 AM • Hall B", 14)}
              >
                <div className="text-xs font-semibold text-emerald-300">📅 Add event details</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Time, date and venue location</div>
              </button>

              <button
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-pink-500/30 border border-pink-500/40 transition cursor-pointer shadow-sm"
                onClick={() => onAddBadge("TAKE ACTION NOW!")}
              >
                <div className="text-xs font-black text-amber-300">⚡ Add Call to Action Badge</div>
                <div className="text-[10px] text-slate-300 mt-0.5">Highlight button for reader actions</div>
              </button>
            </div>
          )}

          {/* TAB 3: UPLOADS */}
          {navTab === "uploads" && (
            <div className="flex flex-col gap-3">
              <label className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-dashed border-cyan-400/60 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-cyan-500/30 transition text-center">
                <Upload size={24} className="text-cyan-400" />
                <span className="text-xs font-black text-cyan-200 uppercase tracking-wider">
                  Upload an Image
                </span>
                <span className="text-[10px] text-slate-300">
                  PNG, JPG, SVG from your device
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {uploadedImages.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Uploaded Gallery ({uploadedImages.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((img, idx) => (
                      <button
                        key={idx}
                        className="p-1 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 overflow-hidden cursor-pointer group"
                        onClick={() => onUploadImage(img.src, img.name)}
                        title="Click to place on poster"
                      >
                        <img
                          src={img.src}
                          alt={img.name}
                          className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                        />
                        <span className="text-[9px] text-slate-300 truncate block mt-1 px-1">
                          {img.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COLORS */}
          {navTab === "colors" && (
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select poster background color
              </span>

              {COLOR_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-cyan-300">
                    {cat.name}
                  </span>
                  <div className="canva-color-grid">
                    {cat.colors.map((c) => {
                      const isActive = currentBg.toLowerCase() === c.hex.toLowerCase();
                      const isLight =
                        c.hex === "#ffffff" ||
                        c.hex === "#fef3c7" ||
                        c.hex === "#fce7f3" ||
                        c.hex === "#e0f2fe" ||
                        c.hex === "#dcfce7" ||
                        c.hex === "#f3e8ff";

                      return (
                        <button
                          key={c.hex}
                          className={`canva-palette-card ${isActive ? "active" : ""}`}
                          style={{
                            backgroundColor: c.hex,
                            color: isLight ? "#0f172a" : "#ffffff",
                          }}
                          onClick={() => onChangeBg(c.hex)}
                          title={`${c.name} (${c.hex})`}
                        >
                          {isActive && <span className="font-extrabold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
