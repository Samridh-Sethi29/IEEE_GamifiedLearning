// Geometry for the Creative Campus scene. Pure data + helpers (no React).
// Two compositions share the same zone artwork:
//   wide  (>= 900px): one framed campus board, 16:10, zones in the four corners around the Core.
//   tall  (<  900px): a vertical campus: Core on top, then the four zones in a winding column,
//                     so labels stay large instead of shrinking the desktop scene.

export const ZONE_W = 480;
export const ZONE_H = 340;
export const CORE_W = 440;
export const CORE_H = 520;

export const ACCENT_COLORS = { emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e", violet: "#8b5cf6" };

const wide = {
  key: "wide",
  w: 1600,
  h: 1000,
  zones: {
    "world-builder": { x: 40, y: 96, s: 1 },
    "invention-lab": { x: 1080, y: 96, s: 1 },
    "story-studio": { x: 40, y: 560, s: 1 },
    "design-studio": { x: 1080, y: 560, s: 1 },
  },
  core: { x: 580, y: 150, s: 1 },
  markers: { "world-builder": [556, 404], "invention-lab": [1044, 404], "story-studio": [556, 792], "design-studio": [1044, 792] },
  goldPaths: [
    "M 556 404 C 640 430 700 520 746 626",
    "M 1044 404 C 960 430 900 520 854 626",
    "M 746 640 C 660 690 600 730 556 792",
    "M 854 640 C 940 690 1000 730 1044 792",
    "M 556 792 C 640 820 740 860 790 900",
    "M 1044 792 C 960 820 860 860 810 900",
  ],
  rivers: [
    "M 770 228 C 660 236 590 300 580 430 C 574 540 620 640 706 730",
    "M 830 228 C 940 236 1010 300 1020 430 C 1026 540 980 640 894 730",
  ],
  bridges: [[580, 440, -6], [1020, 440, 6]],
  pond: { cx: 800, cy: 786, rx: 196, ry: 62 },
  mission: { x: 800, y: 790 },
  waterfall: { x: 800, y: 40 },
  stairs: { x: 690, y: 888, w: 220 },
  foreground: [[22, 540, 1.5], [1580, 540, 1.5], [20, 985, 1.6], [96, 996, 1.2], [1582, 985, 1.6], [1504, 996, 1.2], [320, 1000, 1], [1280, 1000, 1], [520, 1000, 0.9], [1080, 1000, 0.9]],
  banners: [[672, 990, "#2f6fb7"], [928, 990, "#2f6fb7"]],
};

const tallZones = { "world-builder": { x: 20, y: 500, s: 1 }, "invention-lab": { x: 100, y: 880, s: 1 }, "story-studio": { x: 20, y: 1260, s: 1 }, "design-studio": { x: 100, y: 1640, s: 1 } };
const tall = {
  key: "tall",
  w: 600,
  h: 2050,
  zones: tallZones,
  core: { x: 124, y: 24, s: 0.8 },
  markers: { "world-builder": [552, 560], "invention-lab": [48, 940], "story-studio": [552, 1320], "design-studio": [48, 1700] },
  goldPaths: ["M 300 440 C 300 500 552 500 552 560 C 552 740 48 760 48 940 C 48 1120 552 1140 552 1320 C 552 1500 48 1520 48 1700"],
  rivers: [],
  bridges: [],
  pond: { cx: 300, cy: 462, rx: 150, ry: 24 },
  mission: null,
  waterfall: null,
  stairs: { x: 220, y: 1990, w: 160 },
  foreground: [[24, 2030, 1.4], [576, 2030, 1.4], [90, 2046, 1.1], [510, 2046, 1.1]],
  banners: [[196, 2046, "#2f6fb7"], [404, 2046, "#2f6fb7"]],
};

export const LAYOUTS = { wide, tall };

/** Rect of an item in scene units: used for hit areas and tree keep-out. */
export function zoneRect(layout, id) {
  const z = layout.zones[id];
  return { x: z.x, y: z.y, w: ZONE_W * z.s, h: ZONE_H * z.s };
}
export function coreRect(layout) {
  const c = layout.core;
  return { x: c.x, y: c.y, w: CORE_W * c.s, h: CORE_H * c.s };
}
export const toPercent = (layout, r) => ({
  left: `${(r.x / layout.w) * 100}%`,
  top: `${(r.y / layout.h) * 100}%`,
  width: `${(r.w / layout.w) * 100}%`,
  height: `${(r.h / layout.h) * 100}%`,
});

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic background forest: stays off the glowing paths, ponds and the Core. */
export function scatterForest(layout, count, seed = 7) {
  const rnd = mulberry32(seed);
  const keep = [coreRect(layout)];
  const pts = [];
  layout.goldPaths.forEach((d) => {
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  });
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const x = rnd() * layout.w;
    const y = 50 + rnd() * (layout.h - 60);
    if (keep.some((r) => x > r.x - 20 && x < r.x + r.w + 20 && y > r.y - 20 && y < r.y + r.h + 20)) continue;
    if (pts.some(([px, py]) => Math.hypot(px - x, py - y) < 55)) continue;
    const p = layout.pond;
    if (((x - p.cx) / (p.rx + 30)) ** 2 + ((y - p.cy) / (p.ry + 30)) ** 2 < 1) continue;
    const r = rnd();
    out.push({ x, y, s: 0.7 + rnd() * 0.6, k: r < 0.5 ? "tree" : r < 0.8 ? "pine" : r < 0.9 ? "blossom" : "bush" });
  }
  return out.sort((a, b) => a.y - b.y);
}
