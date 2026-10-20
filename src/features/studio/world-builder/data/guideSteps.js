/**
 * Authoritative data model for the World Builder "How to build your water system" guided start experience.
 * Pure JavaScript: zero React, zero DOM, zero mutations.
 */

export const BUILDER_GUIDE_HONESTY_NOTE =
  "Pipe ends must touch water connection points (cyan rings) to connect. Visual proximity alone does not establish connectivity, and the village trial checks logical network connectivity rather than physical fluid dynamics.";

export const BUILDER_GUIDE_STEPS = [
  {
    step: 1,
    id: "place-well",
    title: "Place a well as the water source",
    description:
      "Every water network starts here. Drag a Well from the palette on the left onto the village canvas.",
    actionLabel: "Find Well in Palette",
    targetSelector: '[data-testid="sce-add-well"]',
    testId: "wb-guide-step-1",
    actionTestId: "wb-guide-step-1-btn",
  },
  {
    step: 2,
    id: "add-pipes",
    title: "Add pipes and align connection points",
    description:
      "Place pipes and align their endpoints with the cyan connection rings. Press R to rotate pipes around corners.",
    actionLabel: "View Canvas",
    targetSelector: '[data-testid="sce-canvas"]',
    secondaryTargetSelector: ".sce-canvas-wrap",
    testId: "wb-guide-step-2",
    actionTestId: "wb-guide-step-2-btn",
  },
  {
    step: 3,
    id: "add-tank",
    title: "Add a tank if desired",
    description:
      "Place an optional Water Tank along your pipeline to store clean reserve water for dry days.",
    actionLabel: "Find Tank in Palette",
    targetSelector: '[data-testid="sce-add-tank"]',
    testId: "wb-guide-step-3",
    actionTestId: "wb-guide-step-3-btn",
  },
  {
    step: 4,
    id: "connect-farm-households",
    title: "Connect farm and 4+ households",
    description:
      "Run pipes to the village Farm and at least 4 Houses so all families receive water.",
    actionLabel: "Check Household Goal",
    targetSelector: '[data-testid="wb-dashboard-item-households"]',
    testId: "wb-guide-step-4",
    actionTestId: "wb-guide-step-4-btn",
  },
  {
    step: 5,
    id: "check-diagnostics",
    title: "Check Water System or Test Village",
    description:
      "Use Check Water System in the inspector or Test Village in the toolbar to find disconnected pipes and verify flow.",
    actionLabel: "Check Water System",
    targetSelector: '[data-testid="wb-check-water-btn"]',
    secondaryActionLabel: "Test Village",
    secondaryTargetSelector: '[data-testid="wb-test-village-btn"]',
    testId: "wb-guide-step-5",
    actionTestId: "wb-guide-check-water-link",
    secondaryActionTestId: "wb-guide-test-village-link",
  },
  {
    step: 6,
    id: "budget-and-planning",
    title: "Check budget and enter water planning",
    description:
      "Stay under the 100-coin budget. Enter planned daily supply (100L+) and reserve (10L+) in the Mission Dashboard to complete!",
    actionLabel: "Open Mission Dashboard",
    targetSelector: '[data-testid="wb-planning-inputs"]',
    secondaryTargetSelector: '[data-testid="wb-mission-dashboard"]',
    focusSelector: "#wb-input-daily-supply",
    testId: "wb-guide-step-6",
    actionTestId: "wb-guide-dashboard-link",
  },
];
