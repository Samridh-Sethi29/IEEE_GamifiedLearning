// Shared, read-only description of the three Science branches plus helpers that
// read the existing localStorage progress. Nothing here WRITES progress, and the
// keys / shapes are exactly the ones the lessons and games already use:
//   physics_progress   { force, energy, light, sound, "force-game", "light-game", mission }
//   chemistry_progress { atoms, states, reactions, acids, "atoms-game", "reactions-game", mission }
//   biology_progress   { cell, "human-body", plants, ecosystem, "cell-game", "ecosystem-game" }

const BASE = "/world/school/science";

export const PHYSICS_TOPICS = [
  { id: "force", name: "Force & Motion", short: "Force", icon: "🏃", tone: ["#3b82f6", "#6366f1"],
    desc: "Discover how forces change motion and how acceleration controls movement.",
    route: `${BASE}/physics/force`, hasGame: true, gameName: "Speed Racer", gameRoute: `${BASE}/physics/speed-racer` },
  { id: "energy", name: "Energy", short: "Energy", icon: "⚡", tone: ["#f59e0b", "#f97316"],
    desc: "Discover different forms of energy and how energy transforms from one form to another.",
    route: `${BASE}/physics/energy`, hasGame: false },
  { id: "light", name: "Light", short: "Light", icon: "💡", tone: ["#eab308", "#f59e0b"],
    desc: "Explore light, reflection, shadows, materials, and simple electrical circuits.",
    route: `${BASE}/physics/light`, hasGame: true, gameName: "Build the Circuit", gameRoute: `${BASE}/physics/circuit-builder` },
  { id: "sound", name: "Sound", short: "Sound", icon: "🔊", tone: ["#8b5cf6", "#d946ef"],
    desc: "Discover how vibrations create sound and how pitch and loudness change.",
    route: `${BASE}/physics/sound`, hasGame: false },
];

export const CHEMISTRY_TOPICS = [
  { id: "atoms", name: "Atoms & Elements", short: "Atoms", icon: "⚛️", tone: ["#6366f1", "#8b5cf6"],
    desc: "Discover atoms, elements, protons, neutrons, electrons, and the periodic table.",
    route: `${BASE}/chemistry/atoms`, hasGame: true, gameName: "Build the Atom", gameRoute: `${BASE}/chemistry/build-atom` },
  { id: "states", name: "States of Matter", short: "States", icon: "🧊", tone: ["#06b6d4", "#3b82f6"],
    desc: "Explore solids, liquids, gases, particles, and changes of state.",
    route: `${BASE}/chemistry/states`, hasGame: false },
  { id: "reactions", name: "Chemical Reactions", short: "Reactions", icon: "🔗", tone: ["#f43f5e", "#ec4899"],
    desc: "Discover how substances combine and change to form new substances.",
    route: `${BASE}/chemistry/reactions`, hasGame: true, gameName: "Reaction Lab", gameRoute: `${BASE}/chemistry/reaction-lab` },
  { id: "acids", name: "Acids, Bases & Indicators", short: "Acids", icon: "🧴", tone: ["#84cc16", "#10b981"],
    desc: "Explore acids, bases, pH, and color-changing indicators.",
    route: `${BASE}/chemistry/acids`, hasGame: false },
];

export const BIOLOGY_TOPICS = [
  { id: "cell", name: "The Cell", short: "Cell", icon: "🧫", tone: ["#a855f7", "#6366f1"],
    desc: "Discover the tiny structures that make life possible.",
    route: `${BASE}/biology/cell`, hasGame: true, gameName: "Build the Cell", gameRoute: `${BASE}/biology/build-cell` },
  { id: "human-body", name: "Human Body", short: "Body", icon: "🫀", tone: ["#ef4444", "#f97316"],
    desc: "Explore the organs and systems that keep us alive.",
    route: `${BASE}/biology/human-body`, hasGame: false },
  { id: "plants", name: "Plants", short: "Plants", icon: "🌱", tone: ["#10b981", "#84cc16"],
    desc: "Discover how plants grow and make their own food.",
    route: `${BASE}/biology/plants`, hasGame: false },
  { id: "ecosystem", name: "Ecosystem & Food Chain", short: "Ecosystem", icon: "🌍", tone: ["#0ea5e9", "#10b981"],
    desc: "Discover how organisms interact and how energy moves.",
    route: `${BASE}/biology/ecosystem`, hasGame: true, gameName: "Build the Ecosystem", gameRoute: `${BASE}/biology/build-ecosystem` },
];

export function readProgress(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

// Physics and Chemistry share one formula (same as their hubs always used).
function topicGameStats(topics, progress) {
  const topicsDone = topics.filter((t) => progress[t.id]).length;
  const games = topics.filter((t) => t.hasGame);
  const gamesDone = games.filter((t) => progress[`${t.id}-game`]).length;
  const missionDone = !!progress.mission;
  const unlocked = topicsDone === topics.length && gamesDone === games.length;
  const total = topics.length + games.length + 1;
  return {
    topicsDone, topicsTotal: topics.length, gamesDone, gamesTotal: games.length,
    unlocked, missionDone,
    percent: Math.round(((topicsDone + gamesDone + (missionDone ? 1 : 0)) / total) * 100),
    remaining: topics.length - topicsDone + games.length - gamesDone,
  };
}

export const getPhysicsStats = (p = readProgress("physics_progress")) => topicGameStats(PHYSICS_TOPICS, p);
export const getChemistryStats = (p = readProgress("chemistry_progress")) => topicGameStats(CHEMISTRY_TOPICS, p);

// Biology's hub always counted every truthy key out of 6 (4 lessons + 2 games).
export function getBiologyStats(p = readProgress("biology_progress")) {
  const completed = Object.values(p).filter(Boolean).length;
  const games = BIOLOGY_TOPICS.filter((t) => t.hasGame);
  const topicsDone = BIOLOGY_TOPICS.filter((t) => p[t.id]).length;
  const gamesDone = games.filter((t) => p[`${t.id}-game`]).length;
  return {
    topicsDone, topicsTotal: BIOLOGY_TOPICS.length, gamesDone, gamesTotal: games.length,
    unlocked: completed >= 6, missionDone: false,
    percent: Math.round((completed / 6) * 100),
    remaining: Math.max(0, 6 - completed),
  };
}
