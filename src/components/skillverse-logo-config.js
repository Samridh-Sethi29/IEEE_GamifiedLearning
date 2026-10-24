/**
 * Skillverse loader layers — cut from the ORIGINAL artwork (public/assets/skillverse/*.webp).
 * Each layer is a transparent crop of the real logo; stacked at `box` (% of the logo square,
 * [left, top, width, height]) they rebuild the original exactly. Nothing is redrawn.
 * Paint order = array order. `at` = entrance start (s). `from` = fly-in offset (% of logo size).
 */
export const ASSET_DIR = "/assets/skillverse/";

export const LAYERS = [
  { id: "base", kind: "planet", at: 0.25, box: [0.0, 0.0, 100.0, 100.0] },
  // (the traveling orbit highlight is rendered here, under the icons/characters/wordmark)
  { id: "iconTools", kind: "icon", at: 0.65, box: [5.66, 25.6, 14.11, 17.07], from: [-32, -10] },
  { id: "iconChef", kind: "icon", at: 0.75, box: [19.94, 11.72, 16.67, 14.43], from: [-20, -34] },
  { id: "iconPalette", kind: "icon", at: 0.85, box: [62.36, 11.56, 16.91, 15.15], from: [20, -34] },
  { id: "iconCode", kind: "icon", at: 0.95, box: [79.19, 27.83, 15.23, 14.83], from: [32, -10] },
  { id: "girl", kind: "char", at: 1.0, box: [48.41, 31.34, 32.38, 30.06] },
  { id: "boy", kind: "char", at: 1.08, box: [17.78, 22.97, 35.09, 36.68] },
  { id: "word", kind: "word", at: 1.25, box: [5.26, 55.42, 88.84, 25.6] },
  { id: "pad", kind: "pad", at: 1.5, box: [36.12, 74.4, 24.32, 12.36] },
  { id: "star0", kind: "star", at: 1.15, box: [46.41, 8.85, 5.42, 6.22] },
  { id: "star1", kind: "star", at: 1.32, box: [32.3, 76.63, 4.39, 4.39] },
  { id: "star2", kind: "star", at: 1.4, box: [54.63, 72.41, 4.39, 4.39] },
  { id: "star3", kind: "star", at: 1.48, box: [63.72, 83.01, 4.39, 4.39] },
  { id: "star4", kind: "star", at: 1.56, box: [66.27, 80.78, 4.39, 4.39] },
];

// Orbital highlight path (ellipse, % of logo square) following the golden ring.
export const ORBIT = { cx: 44, cy: 37, rx: 37.5, ry: 7, rot: -15 };
