import { BookOpen, Hammer, Lightbulb, Palette } from "lucide-react";
import { MISSION } from "../world-builder/data/mission.js";

// Single source of truth for the Creative Studio Hub.
//
// World Builder and Story Studio are `available: true`: their routes are registered in App.jsx.
// The other two stations stay `available: false`: their activities do not exist yet and NO route
// is registered for them, so the hub never links there.
// When a station ships: register its route, set `available: true`, and the hub renders a live
// "Enter" link automatically (see StationCard).
//
// `pillars` use the same five keys as usePlayer().player.skills. They are display labels only —
// nothing in the Studio reads or writes skills yet.

export const PILLAR_LABELS = {
  life: "Life",
  human: "Human",
  digital: "Digital",
  vocational: "Vocational",
  entrepreneurial: "Entrepreneurial",
};

export const STUDIO_HUB = {
  title: "Creative Studio",
  subtitle: "Imagine it. Build it. Test it.",
};

// The SkillVerse loop, phrased for makers.
export const STUDIO_LOOP = [
  { id: "imagine", label: "Imagine", text: "Pick a problem worth solving." },
  { id: "build", label: "Build", text: "Make your solution with limited parts." },
  { id: "test", label: "Test", text: "See what really happens." },
  { id: "improve", label: "Improve", text: "Fix the weak spots and try again." },
];

export const STUDIO_MISSION = {
  title: MISSION.title,
  subtitle: MISSION.subtitle,
  story:
    "The well is running low and the fields are thirsty. With a small budget and a few parts, can you keep homes, crops and the community supplied?",
  station: "world-builder",
};

export const STUDIO_TOOLS = [
  {
    id: "world-builder",
    purpose: "Plan a water system for a small village: connect a well to homes and farms within a budget, then see how your plan holds up.",
    title: "World Builder",
    description: "Build better places to live.",
    Icon: Hammer,
    accent: "emerald",
    pillars: ["life", "vocational"],
    learn: [
      "Plan with a budget and limited resources",
      "See how one decision changes the whole village",
      "Balance what people need today with tomorrow",
    ],
    available: true,
    availabilityNote: "Mission briefing is open. The construction workspace is coming soon.",
    route: MISSION.route,
  },
  {
    id: "invention-lab",
    purpose: "Combine gears, parts and blueprints into a working machine that solves a real problem.",
    title: "Invention Lab",
    description: "Invent, experiment and solve problems.",
    Icon: Lightbulb,
    accent: "amber",
    pillars: ["digital", "vocational"],
    learn: [
      "Break a big problem into smaller parts",
      "Test, fail, and improve your design",
      "Choose materials under a cost limit",
    ],
    available: true,
    availabilityNote: "Workbench & Challenge Missions open. Test your inventions!",
    route: "/world/studio/invention-lab",
  },
  {
    id: "story-studio",
    purpose: "Build a story panel by panel, give characters a voice, and see how each choice changes the ending.",
    title: "Story Studio",
    description: "Create stories and explore different choices.",
    Icon: BookOpen,
    accent: "rose",
    pillars: ["human"],
    learn: [
      "Practise empathy by seeing another point of view",
      "Handle a disagreement kindly",
      "Discover how one choice can change an ending",
    ],
    available: true,
    route: "/world/studio/story-studio",
  },
  {
    id: "design-studio",
    purpose: "Turn an idea into a poster or product label that says something clear and honest.",
    title: "Design Atelier",
    description: "Design ideas that make a difference.",
    Icon: Palette,
    accent: "violet",
    pillars: ["digital", "entrepreneurial"],
    learn: [
      "Share a clear message people remember",
      "Present a product honestly and attractively",
      "Use colour, text and layout with purpose",
    ],
    available: true,
    availabilityNote: "Design canvas & projects open. Create inspiring posters!",
    route: "/world/studio/design-studio",
  },
];

