/**
 * Invention Lab Missions & Component Catalog
 * Completely revamped dimensions, styling, and port locations.
 */

export const INVENTIONS_STORAGE_KEY = "skillverse_invention_lab_v1";

export const MISSIONS = [
  {
    id: "mission-1",
    number: 1,
    title: "Lift the Cargo",
    tagline: "Mechanical Advantage & Levers",
    icon: "📦",
    goal: "Build a lever machine to lift the heavy cargo crate onto the loading platform.",
    allowedParts: ["pivot", "lever", "cargo", "counterweight"],
    workbenchGuides: [
      {
        step: 1,
        title: "Step 1: Place the Pivot Support",
        instruction: "Drag the 🔺 Pivot Base from the drawer and set it on the workbench floor.",
        isComplete: (components) => components.some((c) => c.type === "pivot"),
      },
      {
        step: 2,
        title: "Step 2: Place & Balance Lever Beam",
        instruction: "Drag the 📏 Lever Beam and snap its center directly on top of the Pivot Base.",
        isComplete: (components) =>
          components.some((c) => c.type === "pivot") &&
          components.some((c) => c.type === "lever"),
      },
      {
        step: 3,
        title: "Step 3: Add Cargo & Counterweight",
        instruction: "Place 📦 Heavy Cargo on one end of the beam, and ⚖️ Counterweight on the other. Then click 'Test Invention'!",
        isComplete: (components) =>
          components.some((c) => c.type === "cargo") &&
          components.some((c) => c.type === "counterweight"),
      },
    ],
    hints: [
      "Place the Pivot Base on the ground first, then snap the Lever Beam directly on top of it.",
      "Put the Cargo crate on one end of the beam, and the Counterweight on the opposite end to balance and lift it.",
    ],
  },
  {
    id: "mission-2",
    number: 2,
    title: "Light It Up",
    tagline: "Closed Electric Circuits",
    icon: "💡",
    goal: "Connect a complete circuit so the beacon bulb lights up when the switch is closed.",
    allowedParts: ["battery", "switch", "bulb"],
    workbenchGuides: [
      {
        step: 1,
        title: "Step 1: Place Circuit Parts",
        instruction: "Drag 🔋 Battery, 🎛️ Toggle Switch, and 💡 Light Bulb onto the workbench grid.",
        isComplete: (components) =>
          components.some((c) => c.type === "battery") &&
          components.some((c) => c.type === "switch") &&
          components.some((c) => c.type === "bulb"),
      },
      {
        step: 2,
        title: "Step 2: String Wires in a Loop",
        instruction: "Click colored port dots to connect Battery -> Switch -> Bulb -> Battery with wires!",
        isComplete: (components, wires) => wires && wires.length >= 3,
      },
      {
        step: 3,
        title: "Step 3: Close the Switch & Test",
        instruction: "Make sure the switch is CLOSED (ON), then click 'Test Invention' to illuminate the beacon!",
        isComplete: (components) => {
          const sw = components.find((c) => c.type === "switch");
          return sw && (sw.state?.closed ?? true);
        },
      },
    ],
    hints: [
      "Connect a wire from Battery (+) to one side of the Switch, and from the Switch to the Bulb.",
      "Complete the loop: wire the other side of the Bulb back to the Battery (-) terminal, and make sure the switch is Closed!",
    ],
  },
  {
    id: "mission-3",
    number: 3,
    title: "Move the Package",
    tagline: "Ramps & Rolling Wheels",
    icon: "🚚",
    goal: "Build a rolling cart and an inclined ramp to glide the package into the delivery dock.",
    allowedParts: ["ramp", "cart-chassis", "wheel", "package"],
    workbenchGuides: [
      {
        step: 1,
        title: "Step 1: Set the Incline Ramp",
        instruction: "Drag the 📐 Incline Ramp onto the workbench.",
        isComplete: (components) => components.some((c) => c.type === "ramp"),
      },
      {
        step: 2,
        title: "Step 2: Assemble Wheeled Cart",
        instruction: "Drag 🛒 Cart Chassis and snap two ⚙️ Wheels onto its front and rear axle dots.",
        isComplete: (components) =>
          components.some((c) => c.type === "cart-chassis") &&
          components.filter((c) => c.type === "wheel").length >= 2,
      },
      {
        step: 3,
        title: "Step 3: Load Package & Roll",
        instruction: "Place the 📫 Delivery Box on the cart, place the cart at the top of the ramp, and click 'Test Invention'!",
        isComplete: (components) => components.some((c) => c.type === "package"),
      },
    ],
    hints: [
      "Place the Ramp aligned with the drop shelf on the left.",
      "Snap two Wheels onto the Cart Chassis, put the Package on the cart, and place it at the top of the ramp.",
    ],
  },
  {
    id: "mission-4",
    number: 4,
    title: "Smart Robot Trigger",
    tagline: "Sensors & Automatic Actions",
    icon: "🤖",
    goal: "Build an automated trigger: when the pressure plate is pressed, the robotic motor spins.",
    allowedParts: ["battery", "pressure-plate", "motor", "gear"],
    workbenchGuides: [
      {
        step: 1,
        title: "Step 1: Place Components",
        instruction: "Drag 🔋 Battery, 🔘 Pressure Sensor, and 🌀 Electric Motor onto the workbench.",
        isComplete: (components) =>
          components.some((c) => c.type === "battery") &&
          components.some((c) => c.type === "pressure-plate") &&
          components.some((c) => c.type === "motor"),
      },
      {
        step: 2,
        title: "Step 2: Attach Gear to Motor Shaft",
        instruction: "Snap the ⚙️ Spur Gear directly onto the motor's spinning drive shaft dot.",
        isComplete: (components) => components.some((c) => c.type === "gear"),
      },
      {
        step: 3,
        title: "Step 3: Wire & Test Trigger",
        instruction: "Wire Battery -> Pressure Sensor -> Motor -> Battery. Then click 'Test Invention' to trigger the robot!",
        isComplete: (components, wires) => wires && wires.length >= 3,
      },
    ],
    hints: [
      "Wire the Battery (+) to the Pressure Plate input, and the Pressure Plate output to the Motor (+).",
      "Connect the Motor (-) back to the Battery (-), and snap a Gear onto the Motor axle.",
    ],
  },
];

export const COMPONENT_CATALOG = {
  // Mechanical / Levers
  pivot: {
    type: "pivot",
    name: "Pivot Fulcrum",
    category: "structure",
    icon: "🔺",
    desc: "Fixed triangular support stand for levers.",
    width: 70,
    height: 55,
    ports: [{ id: "top", type: "pivot", nx: 0.5, ny: 0.08, label: "Pivot Head" }],
  },
  lever: {
    type: "lever",
    name: "Lever Beam",
    category: "motion",
    icon: "📏",
    desc: "Rigid balance bar that rocks back and forth on a pivot.",
    width: 240,
    height: 32,
    ports: [
      { id: "left", type: "load", nx: 0.12, ny: 0.5, label: "Left Arm" },
      { id: "center", type: "pivot", nx: 0.5, ny: 0.5, label: "Center Pivot" },
      { id: "right", type: "load", nx: 0.88, ny: 0.5, label: "Right Arm" },
    ],
  },
  cargo: {
    type: "cargo",
    name: "Heavy Cargo Crate",
    category: "structure",
    icon: "📦",
    desc: "Heavy payload that needs to be lifted to the dock.",
    width: 65,
    height: 65,
    weight: 25,
    ports: [{ id: "bottom", type: "load", nx: 0.5, ny: 0.95, label: "Base Mount" }],
  },
  counterweight: {
    type: "counterweight",
    name: "Heavy Weight",
    category: "motion",
    icon: "⚖️",
    desc: "Solid counterweight used to pull down lever arms.",
    width: 60,
    height: 60,
    weight: 35,
    ports: [{ id: "bottom", type: "load", nx: 0.5, ny: 0.95, label: "Mount" }],
  },

  // Electrical - Terminals are positioned on dedicated ear lugs OUTSIDE text
  battery: {
    type: "battery",
    name: "Power Battery",
    category: "energy",
    icon: "🔋",
    desc: "9V power source with positive and negative ports.",
    width: 100,
    height: 65,
    ports: [
      { id: "pos", type: "electric-pos", nx: 0.2, ny: 0.15, label: "(+) 9V" },
      { id: "neg", type: "electric-neg", nx: 0.8, ny: 0.15, label: "(-) GND" },
    ],
  },
  switch: {
    type: "switch",
    name: "Toggle Switch",
    category: "control",
    icon: "🎛️",
    desc: "Manual switch that connects or breaks current.",
    width: 90,
    height: 55,
    defaultState: { closed: true },
    ports: [
      { id: "in", type: "electric", nx: 0.12, ny: 0.5, label: "Terminal A" },
      { id: "out", type: "electric", nx: 0.88, ny: 0.5, label: "Terminal B" },
    ],
  },
  bulb: {
    type: "bulb",
    name: "Beacon Light",
    category: "energy",
    icon: "💡",
    desc: "Illuminates when electricity forms a complete loop.",
    width: 70,
    height: 80,
    ports: [
      { id: "in", type: "electric", nx: 0.25, ny: 0.9, label: "Contact 1" },
      { id: "out", type: "electric", nx: 0.75, ny: 0.9, label: "Contact 2" },
    ],
  },

  // Ramps & Rolling
  ramp: {
    type: "ramp",
    name: "Incline Ramp",
    category: "structure",
    icon: "📐",
    desc: "Smooth ramp for vehicles to roll down.",
    width: 160,
    height: 80,
    ports: [
      { id: "top", type: "dock", nx: 0.1, ny: 0.15, label: "Ramp Top" },
      { id: "bottom", type: "dock", nx: 0.9, ny: 0.9, label: "Ramp Exit" },
    ],
  },
  "cart-chassis": {
    type: "cart-chassis",
    name: "Cart Chassis",
    category: "motion",
    icon: "🛒",
    desc: "Lightweight flatbed with 2 axle mounts.",
    width: 120,
    height: 48,
    ports: [
      { id: "axle-front", type: "axle", nx: 0.22, ny: 0.85, label: "Front Axle" },
      { id: "axle-back", type: "axle", nx: 0.78, ny: 0.85, label: "Rear Axle" },
      { id: "bed", type: "cargo-bed", nx: 0.5, ny: 0.15, label: "Cargo Bed" },
    ],
  },
  wheel: {
    type: "wheel",
    name: "Rubber Wheel",
    category: "motion",
    icon: "⚙️",
    desc: "Low-friction rolling wheel for axles.",
    width: 38,
    height: 38,
    ports: [{ id: "center", type: "axle", nx: 0.5, ny: 0.5, label: "Hub" }],
  },
  package: {
    type: "package",
    name: "Delivery Box",
    category: "structure",
    icon: "📫",
    desc: "Fragile cargo that must be delivered safely.",
    width: 60,
    height: 60,
    ports: [{ id: "base", type: "cargo-bed", nx: 0.5, ny: 0.9, label: "Mount" }],
  },

  // Automation
  "pressure-plate": {
    type: "pressure-plate",
    name: "Pressure Sensor",
    category: "control",
    icon: "🔘",
    desc: "Sensor switch that completes the circuit when stepped on.",
    width: 105,
    height: 52,
    defaultState: { active: true },
    ports: [
      { id: "in", type: "electric", nx: 0.12, ny: 0.28, label: "Signal In" },
      { id: "out", type: "electric", nx: 0.88, ny: 0.28, label: "Signal Out" },
    ],
  },
  motor: {
    type: "motor",
    name: "Electric Motor",
    category: "motion",
    icon: "🌀",
    desc: "Converts electrical power into high-speed rotational force.",
    width: 95,
    height: 75,
    ports: [
      { id: "pos", type: "electric", nx: 0.18, ny: 0.22, label: "(+) Lead" },
      { id: "neg", type: "electric", nx: 0.18, ny: 0.78, label: "(-) Lead" },
      { id: "shaft", type: "gear-shaft", nx: 0.88, ny: 0.5, label: "Drive Shaft" },
    ],
  },
  gear: {
    type: "gear",
    name: "Spur Gear",
    category: "motion",
    icon: "⚙️",
    desc: "Toothed wheel that transfers rotational torque.",
    width: 52,
    height: 52,
    ports: [{ id: "center", type: "gear-shaft", nx: 0.5, ny: 0.5, label: "Gear Bore" }],
  },
};
