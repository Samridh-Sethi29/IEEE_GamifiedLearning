// World Builder mission data: "Save Our Village".
//
// Pure data, owned by the World Builder. The Creative Studio hub reads the title and subtitle from
// here so the mission copy lives in one place. Nothing in this module reads or writes the player
// profile, and nothing here is editor state. The numbers are the mission's OWN resources: they are
// not the player's global balance.
//
// Phase D2 is the briefing only. These are requirement DEFINITIONS, not results: there are no costs,
// water calculations, connectivity or pass/fail rules yet (those belong to later phases).

export const MISSION = {
  id: "save-our-village",
  stationId: "world-builder",
  route: "/world/studio/world-builder",
  backTo: "/world/studio",
  backLabel: "Back to Creative Studio",

  title: "Save Our Village",
  subtitle: "Design a Better Water System",
  situation:
    "Our village has a limited supply of water. Families need water at home, farms need water for crops, and water can be wasted through inefficient distribution. Design a system that balances everyone's needs while staying within your budget.",

  // Starting resources for this mission only.
  resources: {
    budget: { id: "budget", label: "Construction budget", value: 100, unit: "mission coins" },
    water: { id: "water", label: "Water supply", value: 100, unit: "litres per day" },
  },
  resourcesNote:
    "These are resources for this mission only. They are separate from your coins and water in the rest of SkillVerse, and nothing you do here changes them.",

  // The five starting requirements. `target` is the number the later simulation will check against.
  objectivesIntro: "Your village design needs to meet all five:",
  objectivesNote: "These are the mission requirements. They'll be checked once you can test your design.",
  objectives: [
    { id: "budget", text: "Stay within the 100-coin construction budget.", target: 100 },
    { id: "households", text: "Supply at least four connected households.", target: 4 },
    { id: "farm", text: "Supply at least one connected farm plot.", target: 1 },
    { id: "well", text: "Connect at least one well to the distribution network.", target: 1 },
    { id: "reserve", text: "Keep at least 10 litres/day of water in reserve.", target: 10 },
  ],

  // Two ideas the player needs before building.
  howItWorks: [
    {
      id: "pipes",
      title: "Pipes carry the water",
      text: "Houses and farms only receive water when they are connected to the well through pipes.",
    },
    {
      id: "drip",
      title: "Drip saves water",
      text: "Drip irrigation reduces a farm's water demand compared with flood irrigation.",
    },
  ],

  // Plan -> Build -> Test -> Improve
  loopIntro: "Players will be able to build a village, test the water system, understand failures and revise their design.",
  loop: [
    { id: "plan", label: "Plan", text: "Decide what your village needs." },
    { id: "build", label: "Build", text: "Lay out wells, pipes, homes and farms." },
    { id: "test", label: "Test", text: "See where the water goes." },
    { id: "improve", label: "Improve", text: "Fix the weak spots and try again." },
  ],

  startAction: {
    label: "Start Designing",
    enabled: false,
    disabledReason: "Construction workspace is coming in the next update.",
  },
};
