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
    <div className="atl-drawer-shell">
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
          <h2 className="atl-drawer-title">
            {navTab === "elements" && "Design Elements"}
            {navTab === "text" && "Typography"}
            {navTab === "uploads" && "Your Images"}
            {navTab === "colors" && "Poster Colors"}
          </h2>
          <span className="atl-drawer-count">
            {navTab === "elements" ? `${filteredStickers.length} items` : "Creative desk"}
          </span>
        </div>

        <div className="canva-drawer-scroll">
          {/* TAB 1: ELEMENTS (STICKERS & RESIZABLE SHAPES) */}
          {navTab === "elements" && (
            <div className="atl-stack">
              {/* Category chips */}
              <div className="atl-chips" role="group" aria-label="Element categories">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`atl-chip ${elementCategory === cat ? "atl-chip--on" : ""}`}
                    aria-pressed={elementCategory === cat}
                    onClick={() => setElementCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Geometric shapes */}
              {(elementCategory === "All" || elementCategory === "Shapes") && (
                <section>
                  <h3 className="atl-section-label">Shapes &amp; frames</h3>
                  <p className="atl-section-note">Drag the corners to resize.</p>
                  <div className="atl-grid atl-grid--2">
                    {SHAPES_CATALOG.map((shp) => (
                      <button
                        key={shp.id}
                        type="button"
                        className="atl-shape-btn"
                        onClick={() => onAddShape(shp.shape, shp.name)}
                      >
                        <span className="atl-shape-icon" aria-hidden="true">{shp.icon}</span>
                        <span className="atl-shape-name">{shp.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Stickers */}
              {elementCategory !== "Shapes" && (
                <section>
                  <h3 className="atl-section-label">Illustrations &amp; badges</h3>
                  <div className="atl-grid atl-grid--3">
                    {filteredStickers.map((st) => {
                      const isMatch = st.project === activeProjectId;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          className={`atl-sticker ${isMatch ? "atl-sticker--match" : ""}`}
                          onClick={() => onAddSticker(st.id, st.icon, st.name)}
                          title={isMatch ? `${st.name} (great for this project)` : st.name}
                        >
                          <span className="atl-sticker-icon" aria-hidden="true">{st.icon}</span>
                          <span className="atl-sticker-name">{st.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: TEXT */}
          {navTab === "text" && (
            <div className="atl-stack">
              <p className="atl-section-note">Tap one to add it to your poster.</p>

              <button
                type="button"
                className="atl-text-card atl-text-card--heading"
                onClick={() => onAddText("heading", "ADD A HEADING", 32)}
              >
                <span className="atl-text-card-title">Add a heading</span>
                <span className="atl-text-card-desc">Large, bold title for your poster</span>
              </button>

              <button
                type="button"
                className="atl-text-card atl-text-card--sub"
                onClick={() => onAddText("subtitle", "Add a subheading to share details", 18)}
              >
                <span className="atl-text-card-title">Add a subheading</span>
                <span className="atl-text-card-desc">Context, subtitle and slogan</span>
              </button>

              <button
                type="button"
                className="atl-text-card atl-text-card--details"
                onClick={() => onAddText("details", "📅 Date: Friday 10 AM • Hall B", 14)}
              >
                <span className="atl-text-card-title">📅 Add event details</span>
                <span className="atl-text-card-desc">Time, date and venue location</span>
              </button>

              <button
                type="button"
                className="atl-text-card atl-text-card--cta"
                onClick={() => onAddBadge("TAKE ACTION NOW!")}
              >
                <span className="atl-text-card-title">⚡ Add a call-to-action badge</span>
                <span className="atl-text-card-desc">A bright button that tells readers what to do</span>
              </button>
            </div>
          )}

          {/* TAB 3: UPLOADS */}
          {navTab === "uploads" && (
            <div className="atl-stack">
              <label className="atl-upload">
                <Upload size={28} aria-hidden="true" />
                <span className="atl-upload-title">Upload an image</span>
                <span className="atl-upload-hint">PNG, JPG or SVG from your device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {uploadedImages.length > 0 && (
                <section>
                  <h3 className="atl-section-label">Your gallery ({uploadedImages.length})</h3>
                  <div className="atl-grid atl-grid--2">
                    {uploadedImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="atl-gallery-item"
                        onClick={() => onUploadImage(img.src, img.name)}
                        title="Tap to place on poster"
                      >
                        <img src={img.src} alt={img.name} className="atl-gallery-img" />
                        <span className="atl-gallery-name">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 4: COLORS */}
          {navTab === "colors" && (
            <div className="atl-stack">
              <p className="atl-section-note">Pick a poster background colour.</p>

              {COLOR_CATEGORIES.map((cat, idx) => (
                <section key={idx}>
                  <h3 className="atl-section-label">{cat.name}</h3>
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
                          type="button"
                          className={`canva-palette-card ${isActive ? "active" : ""}`}
                          style={{
                            backgroundColor: c.hex,
                            color: isLight ? "#0f172a" : "#ffffff",
                          }}
                          onClick={() => onChangeBg(c.hex)}
                          aria-pressed={isActive}
                          title={`${c.name} (${c.hex})`}
                          aria-label={c.name}
                        >
                          {isActive && <span className="font-extrabold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
