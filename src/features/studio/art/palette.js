// Creative Studio colour system: the ONE place the Studio's colours are defined.
//
// Every value below is taken from the original SkillVerse village (WorldMap.jsx, locationArt.jsx,
// config/locations.js, GameHUD.jsx), not invented:
//   ocean      #56c4ef -> #1e9ad6 -> #0c699d      (WorldMap oceanGrad)
//   grass      #a8e08f / #8ed67b / #7cc868 / #c4e5a4 / #dff7c8   (grassGrad, location ground ellipses)
//   sand+paths #fce1a0 rim, #dcb98c + #efdcae dirt paths, #e7d6b4 plaza stones
//   signboard  #f7e7c6 fill, #b98a5a outline, #7c4a1e text, #a9744f post  (locationArt Sign)
//   outlines   #8b5e3c warm brown (the village's most-used outline/wood colour)
//   HUD        white/90 surface, white/70 border, slate text   (GameHUD)
//   accents    blue #3b82f6/#1d4ed8/#dbeafe, emerald #10b981/#047857/#d1fae5, amber #f59e0b/#b45309/#fef3c7
//
// Scoped to the Studio only: nothing here is imported by any other world. SVG artwork imports PAL
// directly; the stylesheet gets the same values as `--st-*` custom properties (STUDIO_CSS_VARS is
// applied to the .studio-scope root in StudioHome), so CSS and artwork can never drift apart.
//
// The only colour not found in the village is teal (#14b8a6), used as a small Design Atelier accent.

export const PAL = {
  // environment: the village ocean
  envLight: "#bde3ff",
  env: "#56c4ef",
  envDeep: "#1e9ad6",
  envDark: "#0c699d",

  // campus ground
  ground: "#8ed67b",
  groundLight: "#a8e08f",
  groundDark: "#7cc868",
  groundPale: "#c4e5a4",
  groundDetail: "#dff7c8",
  leaf: "#4e9f44",
  leafMid: "#5fb352",
  leafLight: "#9ccb6b",

  // sand, paths, stone
  sand: "#fce1a0",
  sandEdge: "#f0c968",
  path: "#efdcae",
  pathEdge: "#dcb98c",
  pathShadow: "#b98a5a",
  plaza: "#e7d6b4",
  plazaEdge: "#d2bc92",

  // water
  water: "#56c4ef",
  waterDeep: "#1e9ad6",
  waterFoam: "#ffffff",

  // interface + sign surfaces
  surface: "#fffbea",
  surface2: "#f7e7c6",
  cream: "#f8f4e8",
  hudSurface: "rgba(255, 255, 255, 0.92)",
  hudBorder: "#ffffff",

  // outlines + wood
  line: "#b98a5a", // sign outline
  ink: "#8b5e3c", // illustration outline
  wood: "#a9744f",
  woodLight: "#c08a57",
  signText: "#7c4a1e",

  // text
  text: "#1e293b",
  text2: "#475569",

  // states
  selected: "#fbbf24", // restrained sun-yellow ring for the chosen destination
  disabled: "#e2e8f0",
  disabledText: "#475569",
  success: "#22c55e",
  successDeep: "#15803d",
  warn: "#f59e0b",
  warnSoft: "#fef3c7",
  warnDeep: "#b45309",

  // shared illustration colours
  sun: "#fbbf24",
  sunSoft: "#fde68a",
  sunPale: "#fef3c7",
  gold: "#e9b949",
  amberDeep: "#b45309",
  blue: "#3b82f6",
  blueDeep: "#1d4ed8",
  slate: "#64748b",
  slateDark: "#334155",
  slateLight: "#94a3b8",
  coral: "#e25c4a",
  coralDeep: "#c94f3d",
  coralLight: "#f9c6c0",
  rose: "#fb7185",
  pink: "#ec4899",
  pinkSoft: "#f472b6",
  pinkPale: "#fbcfe8",
  purple: "#7c5cc4",
  purpleDeep: "#6d28d9",
  violet: "#a78bfa",
  violetPale: "#ede9fe",
  orange: "#fb923c",
  teal: "#14b8a6",
  emerald: "#10b981",
  skin: "#f8c89b",

  // translucent helpers
  shadow: "rgba(124, 74, 30, 0.22)",
  inkSoft: "rgba(139, 94, 60, 0.22)",
};

// The four stations (+ the Core) each get one accent family. They are accents on one shared
// palette, not separate themes.
export const ACCENTS = {
  emerald: { acc: "#10b981", deep: "#047857", soft: "#d1fae5" }, // World Builder
  amber: { acc: "#f59e0b", deep: "#b45309", soft: "#fef3c7" }, // Invention Lab
  rose: { acc: "#f43f5e", deep: "#be123c", soft: "#ffe4e6" }, // Story Studio
  violet: { acc: "#8b5cf6", deep: "#6d28d9", soft: "#ede9fe" }, // Design Atelier
  sky: { acc: "#3b82f6", deep: "#1d4ed8", soft: "#dbeafe" }, // Creative Core
};

// Semantic roles -> `--st-*` custom properties for studio.css.
export const STUDIO_CSS_VARS = {
  "--st-env": PAL.env,
  "--st-env-light": PAL.envLight,
  "--st-env-deep": PAL.envDeep,
  "--st-ground": PAL.ground,
  "--st-ground-light": PAL.groundLight,
  "--st-path": PAL.path,
  "--st-path-edge": PAL.pathEdge,
  "--st-water": PAL.water,
  "--st-surface": PAL.surface,
  "--st-surface-2": PAL.surface2,
  "--st-hud": PAL.hudSurface,
  "--st-hud-border": PAL.hudBorder,
  "--st-text": PAL.text,
  "--st-text-2": PAL.text2,
  "--st-sign-text": PAL.signText,
  "--st-line": PAL.line,
  "--st-ink": PAL.ink,
  "--st-selected": PAL.selected,
  "--st-disabled": PAL.disabled,
  "--st-disabled-text": PAL.disabledText,
  "--st-success": PAL.success,
  "--st-warn": PAL.warn,
  "--st-warn-soft": PAL.warnSoft,
  "--st-warn-deep": PAL.warnDeep,
  "--st-focus": PAL.blueDeep,
  "--st-shadow": "rgba(12, 105, 157, 0.3)",
  "--st-hard-shadow": "rgba(139, 94, 60, 0.35)",
  ...Object.fromEntries(
    Object.entries(ACCENTS).flatMap(([k, v]) => [
      [`--st-${k}`, v.acc],
      [`--st-${k}-deep`, v.deep],
      [`--st-${k}-soft`, v.soft],
    ]),
  ),
};
