/**
 * Design Atelier Projects & Catalog Configuration
 * Rich Canva-style assets:
 * - Richer Sticker & Illustration categories
 * - Geometric Shapes & Badges
 * - Professional Palettes (Solid, Pastel, Vibrant & Dark)
 */

export const DESIGN_STORAGE_KEY = "skillverse_design_atelier_v1";

export const PROJECTS = [
  {
    id: "project-1",
    number: 1,
    title: "Save Water!",
    tagline: "Environmental Awareness Poster",
    icon: "💧",
    goal: "Design an awareness poster with a bold headline, a water graphic, and a clear action for the reader.",
    defaultBg: "#0f172a",
    canvasGuides: [
      {
        step: 1,
        title: "Step 1: Add a Bold Headline",
        instruction: "Click 'Add a Heading' from the Text drawer to create your main title.",
        isComplete: (elements) => elements.some((e) => e.type === "text" && e.variant === "heading"),
      },
      {
        step: 2,
        title: "Step 2: Add a Water Illustration",
        instruction: "Open 'Elements' and place a 💧 Water Drop, 🌊 Wave, or 🚰 Faucet sticker.",
        isComplete: (elements) => elements.some((e) => e.type === "sticker" && ["droplet", "wave", "faucet", "cloud-rain"].includes(e.iconKey)),
      },
      {
        step: 3,
        title: "Step 3: Add an Action Badge",
        instruction: "Add a high-contrast action badge like 'Turn off the tap!' or 'Save Every Drop!'.",
        isComplete: (elements) => elements.some((e) => e.type === "badge" || (e.type === "text" && e.variant === "action")),
      },
    ],
    hints: [
      "Place your big title at the top and resize it with [+] so it's the first thing people notice.",
      "Add a bright colored action badge at the bottom (like 'Turn off the tap!') with high contrast.",
    ],
  },
  {
    id: "project-2",
    number: 2,
    title: "Kindness Week",
    tagline: "School Community Campaign",
    icon: "💖",
    goal: "Create a friendly campaign flyer promoting kindness with a warm title, a heart graphic, and an uplifting message.",
    defaultBg: "#4c0519",
    canvasGuides: [
      {
        step: 1,
        title: "Step 1: Set Warm Friendly Title",
        instruction: "Add a main title like 'Kindness Week' or 'Choose Kindness' across the top.",
        isComplete: (elements) => elements.some((e) => e.type === "text" && e.variant === "heading"),
      },
      {
        step: 2,
        title: "Step 2: Add Friendship Graphic",
        instruction: "Place a 💖 Heart, 🤝 Handshake, or 🌟 Star sticker on your canvas.",
        isComplete: (elements) => elements.some((e) => e.type === "sticker" && ["heart", "star", "smile", "hands", "rainbow"].includes(e.iconKey)),
      },
      {
        step: 3,
        title: "Step 3: Add Uplifting Message",
        instruction: "Add a Subtitle or Body note explaining how to share kindness (e.g. 'A smile changes everything').",
        isComplete: (elements) => elements.some((e) => e.type === "text" && (e.variant === "subtitle" || e.variant === "body")),
      },
    ],
    hints: [
      "Pick a friendly warm background color like rose or amber to set a positive mood.",
      "Add a subtitle under your main heading giving an example of an act of kindness.",
    ],
  },
  {
    id: "project-3",
    number: 3,
    title: "Science Fair",
    tagline: "Event Invitation Poster",
    icon: "🔬",
    goal: "Design a readable invitation flyer with the event title, a science graphic, and the date/location.",
    defaultBg: "#06202a",
    canvasGuides: [
      {
        step: 1,
        title: "Step 1: Add Event Title",
        instruction: "Add a big heading like 'Annual Science Fair' or 'Young Innovators Expo'.",
        isComplete: (elements) => elements.some((e) => e.type === "text" && e.variant === "heading"),
      },
      {
        step: 2,
        title: "Step 2: Add Science Graphic",
        instruction: "Place a 🔬 Microscope, 🧪 Beaker, or 🚀 Rocket sticker in the middle.",
        isComplete: (elements) => elements.some((e) => e.type === "sticker" && ["beaker", "rocket", "atom", "telescope"].includes(e.iconKey)),
      },
      {
        step: 3,
        title: "Step 3: Add Date & Location",
        instruction: "Add event details: click 'Add Event Details' to include date, time, and room/hall location.",
        isComplete: (elements) => elements.some((e) => e.type === "text" && (e.variant === "details" || e.variant === "body")),
      },
    ],
    hints: [
      "Make sure event dates and locations have good contrast so people can read the details easily.",
      "Keep text away from the far canvas edges so nothing looks crowded or cut off.",
    ],
  },
  {
    id: "project-4",
    number: 4,
    title: "Stay Safe Online",
    tagline: "Digital Safety Infographic",
    icon: "🛡️",
    goal: "Create a digital security infographic with a safety headline, a security shield, and a golden safety rule.",
    defaultBg: "#0f172a",
    canvasGuides: [
      {
        step: 1,
        title: "Step 1: Add Safety Headline",
        instruction: "Add a bold security title like 'STAY SAFE ONLINE' or 'CYBER HEROES'.",
        isComplete: (elements) => elements.some((e) => e.type === "text" && e.variant === "heading"),
      },
      {
        step: 2,
        title: "Step 2: Add Security Shield",
        instruction: "Place a 🛡️ Shield, 🔒 Lock, or 💻 Tech safety sticker on the canvas.",
        isComplete: (elements) => elements.some((e) => e.type === "sticker" && ["shield", "lock", "computer", "key"].includes(e.iconKey)),
      },
      {
        step: 3,
        title: "Step 3: Add Golden Safety Tip",
        instruction: "Add a key rule (e.g. 'Never share your password!' or 'Ask a grown-up before downloading').",
        isComplete: (elements) => elements.some((e) => e.type === "badge" || (e.type === "text" && e.variant === "action")),
      },
    ],
    hints: [
      "Use high-contrast warning badges like bright yellow or cyan on dark blue to stand out.",
      "Center your shield graphic as the visual focal point of the infographic.",
    ],
  },
];

export const STICKER_CATALOG = [
  // Water / Nature
  { id: "droplet", name: "Water Drop", icon: "💧", category: "Nature", project: "project-1" },
  { id: "wave", name: "Ocean Wave", icon: "🌊", category: "Nature", project: "project-1" },
  { id: "faucet", name: "Water Tap", icon: "🚰", category: "Nature", project: "project-1" },
  { id: "cloud-rain", name: "Rain Cloud", icon: "🌧️", category: "Nature", project: "project-1" },
  { id: "earth", name: "Planet Earth", icon: "🌍", category: "Nature", project: "project-1" },
  { id: "sprout", name: "Plant Sprout", icon: "🌱", category: "Nature", project: "project-1" },
  { id: "sun", name: "Warm Sun", icon: "☀️", category: "Nature", project: "project-1" },

  // Kindness / Social
  { id: "heart", name: "Heart", icon: "💖", category: "Kindness", project: "project-2" },
  { id: "star", name: "Sparkle Star", icon: "⭐", category: "Kindness", project: "project-2" },
  { id: "smile", name: "Happy Smile", icon: "😊", category: "Kindness", project: "project-2" },
  { id: "hands", name: "High Five", icon: "🙌", category: "Kindness", project: "project-2" },
  { id: "gift", name: "Kind Gift", icon: "🎁", category: "Kindness", project: "project-2" },
  { id: "rainbow", name: "Rainbow", icon: "🌈", category: "Kindness", project: "project-2" },
  { id: "flower", name: "Blossom", icon: "🌸", category: "Kindness", project: "project-2" },

  // Science / Tech
  { id: "beaker", name: "Beaker", icon: "🧪", category: "Science", project: "project-3" },
  { id: "rocket", name: "Rocket", icon: "🚀", category: "Science", project: "project-3" },
  { id: "atom", name: "Science Atom", icon: "⚛️", category: "Science", project: "project-3" },
  { id: "telescope", name: "Telescope", icon: "🔭", category: "Science", project: "project-3" },
  { id: "lightbulb", name: "Idea Bulb", icon: "💡", category: "Science", project: "project-3" },
  { id: "dna", name: "DNA Gene", icon: "🧬", category: "Science", project: "project-3" },
  { id: "robot", name: "Robot Bot", icon: "🤖", category: "Science", project: "project-3" },

  // Security / Safety
  { id: "shield", name: "Safety Shield", icon: "🛡️", category: "Safety", project: "project-4" },
  { id: "lock", name: "Cyber Lock", icon: "🔒", category: "Safety", project: "project-4" },
  { id: "key", name: "Secret Key", icon: "🔑", category: "Safety", project: "project-4" },
  { id: "computer", name: "Laptop", icon: "💻", category: "Safety", project: "project-4" },
  { id: "warning", name: "Alert Badge", icon: "⚠️", category: "Safety", project: "project-4" },
  { id: "check", name: "Verified Mark", icon: "✅", category: "Safety", project: "project-4" },
];

export const SHAPES_CATALOG = [
  { id: "rect", name: "Rectangle Panel", type: "shape", shape: "rect", icon: "▬" },
  { id: "circle", name: "Circle Badge", type: "shape", shape: "circle", icon: "●" },
  { id: "pill", name: "Banner Pill", type: "shape", shape: "pill", icon: "⬭" },
  { id: "divider", name: "Separator Line", type: "shape", shape: "divider", icon: "―" },
];

// Rich, categorized Canva color palettes
export const COLOR_CATEGORIES = [
  {
    name: "Classic Deep",
    colors: [
      { name: "Slate Navy", hex: "#0f172a" },
      { name: "Deep Charcoal", hex: "#18181b" },
      { name: "Ocean Midnight", hex: "#0c4a6e" },
      { name: "Forest Night", hex: "#064e3b" },
      { name: "Crimson Dark", hex: "#4c0519" },
      { name: "Royal Purple", hex: "#3b0764" },
    ],
  },
  {
    name: "Vibrant & Bright",
    colors: [
      { name: "Canva Cyan", hex: "#00c4cc" },
      { name: "Canva Purple", hex: "#7d2ae8" },
      { name: "Electric Blue", hex: "#38bdf8" },
      { name: "Sunburst Gold", hex: "#facc15" },
      { name: "Neon Rose", hex: "#f43f5e" },
      { name: "Mint Emerald", hex: "#10b981" },
    ],
  },
  {
    name: "Pastel & Soft",
    colors: [
      { name: "Pure White", hex: "#ffffff" },
      { name: "Soft Cream", hex: "#fef3c7" },
      { name: "Blush Pink", hex: "#fce7f3" },
      { name: "Sky Mist", hex: "#e0f2fe" },
      { name: "Sage Light", hex: "#dcfce7" },
      { name: "Lavender Glow", hex: "#f3e8ff" },
    ],
  },
];
