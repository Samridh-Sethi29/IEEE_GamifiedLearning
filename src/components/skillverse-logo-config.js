/**
 * Skillverse loader layer map (generated from the ORIGINAL artwork).
 *
 * The original logo was cut into aligned, transparent layers (planet, rings, 4 skill icons,
 * boy, girl, 5 stars, wordmark, controller). Each layer is the real artwork pixels, positioned
 * with percentages of the 1254x1254 composition, so stacked at rest they reproduce the
 * original logo. Nothing is redrawn.
 *
 * x / y / w / h are percentages of the full logo box.
 */
const BASE = "/assets/skillverse/layers/";
export const LOGO_FULL = "/assets/skillverse/logo.png"; // the exact assembled logo (reference / fallback)

export const LAYERS = {
  "planet": {
    "file": "planet.webp",
    "x": 3.03,
    "y": 7.656,
    "w": 94.976,
    "h": 85.008
  },
  "rings": {
    "file": "rings.webp",
    "x": 2.711,
    "y": 11.802,
    "w": 94.338,
    "h": 71.691
  },
  "iconChef": {
    "file": "iconChef.webp",
    "x": 19.856,
    "y": 11.563,
    "w": 16.268,
    "h": 16.188
  },
  "iconPalette": {
    "file": "iconPalette.webp",
    "x": 63.078,
    "y": 11.404,
    "w": 16.268,
    "h": 16.188
  },
  "iconTools": {
    "file": "iconTools.webp",
    "x": 5.423,
    "y": 28.309,
    "w": 16.268,
    "h": 16.348
  },
  "iconCode": {
    "file": "iconCode.webp",
    "x": 78.469,
    "y": 28.549,
    "w": 16.108,
    "h": 16.188
  },
  "boy": {
    "file": "boy.webp",
    "x": 18.979,
    "y": 22.648,
    "w": 32.217,
    "h": 41.547
  },
  "girl": {
    "file": "girl.webp",
    "x": 47.368,
    "y": 31.499,
    "w": 33.573,
    "h": 32.695
  },
  "star0": {
    "file": "star0.webp",
    "x": 46.252,
    "y": 8.373,
    "w": 6.3,
    "h": 7.018
  },
  "star1": {
    "file": "star1.webp",
    "x": 31.818,
    "y": 76.236,
    "w": 5.502,
    "h": 5.502
  },
  "star2": {
    "file": "star2.webp",
    "x": 54.545,
    "y": 74.482,
    "w": 4.545,
    "h": 4.545
  },
  "star3": {
    "file": "star3.webp",
    "x": 62.998,
    "y": 82.616,
    "w": 5.502,
    "h": 5.502
  },
  "star4": {
    "file": "star4.webp",
    "x": 66.188,
    "y": 80.941,
    "w": 4.545,
    "h": 4.545
  },
  "word": {
    "file": "word.webp",
    "x": 5.502,
    "y": 57.895,
    "w": 88.437,
    "h": 25.678
  },
  "pad": {
    "file": "pad.webp",
    "x": 36.523,
    "y": 76.475,
    "w": 24.322,
    "h": 12.201
  }
};

// Planet centre (percent of the full logo box) – spark, ring sweep and shimmer pivot around it.
export const PLANET_CENTER = { x: 49.2, y: 55.0 };

// Wordmark is animated as 10 letter-slices (percent of the wordmark layer, left/right edges).
export const WORD_SLICES = [[0.36, 16.14], [16.14, 26.87], [26.87, 32.73], [32.73, 38.59], [38.59, 44.91], [44.91, 58.52], [58.52, 67.27], [67.27, 73.85], [73.85, 82.6], [82.6, 99.64]];

// Fly-in offsets for the four skill icons, in cqw (1cqw = 1% of the logo width).
export const ICON_FROM = {
  iconChef:    [-24, -18],
  iconPalette: [ 24, -18],
  iconTools:   [-26,  16],
  iconCode:    [ 26,  16],
};

export const layerUrl = (L) => BASE + L.file;
export const ALL_URLS = [...new Set(Object.values(LAYERS).map(layerUrl))];
