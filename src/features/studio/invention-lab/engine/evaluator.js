/**
 * Deterministic Invention Evaluation Engine
 * Tests the user's built machine against specific mission rules.
 * Generates actionable educational diagnostic feedback when requirements fail.
 * Supports generous snap distances (55px) and flexible relative positioning.
 */

import { COMPONENT_CATALOG } from "../data/missions.js";

/**
 * Calculates absolute coordinate for a port given component position, rotation, and normalized (or absolute) port coords.
 */
export function getPortAbsolutePos(comp, port) {
  const angle = ((comp.rotation || 0) * Math.PI) / 180;
  const w = comp.width;
  const h = comp.height;
  const cx = w / 2;
  const cy = h / 2;

  const px = port.nx !== undefined ? port.nx * w : (port.x !== undefined ? port.x : cx);
  const py = port.ny !== undefined ? port.ny * h : (port.y !== undefined ? port.y : cy);

  const dx = px - cx;
  const dy = py - cy;
  const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
  const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
  return {
    x: comp.x + cx + rx,
    y: comp.y + cy + ry,
  };
}

/**
 * Checks if two ports are touching within a generous snap distance threshold (55px).
 */
export function arePortsConnected(compA, portA, compB, portB, threshold = 55) {
  const posA = getPortAbsolutePos(compA, portA);
  const posB = getPortAbsolutePos(compB, portB);
  const dist = Math.hypot(posA.x - posB.x, posA.y - posB.y);
  return dist <= threshold;
}

/**
 * Validates Mission 1: Lift the Cargo
 * Accepts either:
 * - Direct snap between ports OR
 * - Lever resting above the pivot and boxes placed on opposite halves of the beam.
 */
export function evaluateMission1(components) {
  const pivot = components.find((c) => c.type === "pivot");
  if (!pivot) {
    return {
      passed: false,
      failureTitle: "Missing Support",
      failureReason: "Your lever needs a sturdy base to rest on. Without a pivot, it will simply fall to the ground.",
      hint: "Drag a Pivot Base onto the floor first, then place the Lever Beam on top of it.",
    };
  }

  const lever = components.find((c) => c.type === "lever");
  if (!lever) {
    return {
      passed: false,
      failureTitle: "Missing Lever Beam",
      failureReason: "You need a lever arm to transfer the lifting force.",
      hint: "Place a Lever Beam directly above the Pivot Base so the center connects.",
    };
  }

  // Check lever resting on pivot (either port connection or bounding box proximity)
  const pivotPort = pivot.ports.find((p) => p.id === "top");
  const leverCenterPort = lever.ports.find((p) => p.id === "center");
  const pivotConnected =
    arePortsConnected(pivot, pivotPort, lever, leverCenterPort, 65) ||
    (Math.abs((lever.x + lever.width / 2) - (pivot.x + pivot.width / 2)) <= 60 &&
     Math.abs((lever.y + lever.height / 2) - pivot.y) <= 50);

  if (!pivotConnected) {
    return {
      passed: false,
      failureTitle: "Lever is Not Balanced on Pivot",
      failureReason: "The Lever Beam is not resting securely on the Pivot Fulcrum.",
      hint: "Align the center of the Lever Beam directly over the top of the Pivot Base.",
    };
  }

  const cargo = components.find((c) => c.type === "cargo");
  if (!cargo) {
    return {
      passed: false,
      failureTitle: "Cargo Missing",
      failureReason: "There is no cargo crate on the machine to lift!",
      hint: "Place the Cargo Crate on one of the ends of the Lever Beam.",
    };
  }

  const weight = components.find((c) => c.type === "counterweight");
  if (!weight) {
    return {
      passed: false,
      failureTitle: "No Counterweight to Lift the Cargo",
      failureReason: "The heavy cargo stays on the ground because nothing is pushing down the other side.",
      hint: "Add a Heavy Weight to the opposite end of the lever to tilt it upward.",
    };
  }

  const leverCenterX = lever.x + lever.width / 2;
  const cargoCenterX = cargo.x + cargo.width / 2;
  const weightCenterX = weight.x + weight.width / 2;

  // Check vertical alignment: boxes must be resting near or on the lever
  const cargoNearLever = Math.abs((cargo.y + cargo.height) - lever.y) <= 55 || Math.abs(cargo.y - lever.y) <= 55;
  const weightNearLever = Math.abs((weight.y + weight.height) - lever.y) <= 55 || Math.abs(weight.y - lever.y) <= 55;

  if (!cargoNearLever) {
    return {
      passed: false,
      failureTitle: "Cargo Not Attached to Lever",
      failureReason: "The cargo crate is resting too far away from the Lever Beam.",
      hint: "Place the Cargo Crate right on top of the left or right side of the Lever Beam.",
    };
  }

  if (!weightNearLever) {
    return {
      passed: false,
      failureTitle: "Counterweight Not Attached to Lever",
      failureReason: "The counterweight is not placed on the lever arm.",
      hint: "Place the Heavy Weight on the opposite side of the Lever Beam.",
    };
  }

  const cargoOnLeft = cargoCenterX < leverCenterX;
  const weightOnLeft = weightCenterX < leverCenterX;

  if (cargoOnLeft === weightOnLeft) {
    return {
      passed: false,
      failureTitle: "Both Weights on the Same Side!",
      failureReason: "The cargo and the counterweight are on the same side, causing the lever to tip over.",
      hint: "Place the cargo on one end (e.g. left) and the counterweight on the opposite end (e.g. right).",
    };
  }

  return {
    passed: true,
    title: "Cargo Successfully Lifted! 📦🎉",
    summary: "The counterweight pulled down the lever arm, effortlessly lifting the heavy cargo crate onto the platform!",
    liftedSide: cargoOnLeft ? "left" : "right",
  };
}

/**
 * Validates Mission 2: Light It Up
 */
export function evaluateMission2(components, wires = []) {
  const battery = components.find((c) => c.type === "battery");
  if (!battery) {
    return {
      passed: false,
      failureTitle: "No Power Source",
      failureReason: "Electric devices need power to work. There is no battery on the bench.",
      hint: "Drag a Battery onto the bench to supply voltage.",
    };
  }

  const bulb = components.find((c) => c.type === "bulb");
  if (!bulb) {
    return {
      passed: false,
      failureTitle: "No Light Bulb",
      failureReason: "You need a light bulb to illuminate the beacon.",
      hint: "Drag a Light Bulb onto the bench.",
    };
  }

  const sw = components.find((c) => c.type === "switch");
  if (!sw) {
    return {
      passed: false,
      failureTitle: "Missing Control Switch",
      failureReason: "The circuit needs a switch so you can turn the light on and off safely.",
      hint: "Add a Toggle Switch between the battery and the bulb.",
    };
  }

  if (wires.length < 3) {
    return {
      passed: false,
      failureTitle: "Incomplete Circuit Loop",
      failureReason: "Electricity cannot jump through empty air. You need wires connecting all components in a full loop.",
      hint: "Click on the colored terminal dots to draw wires connecting Battery, Switch, and Bulb in a circle.",
    };
  }

  const graph = new Map();
  const addEdge = (idA, idB) => {
    if (!graph.has(idA)) graph.set(idA, new Set());
    if (!graph.has(idB)) graph.set(idB, new Set());
    graph.get(idA).add(idB);
    graph.get(idB).add(idA);
  };

  wires.forEach((w) => {
    addEdge(w.fromCompId, w.toCompId);
  });

  const batteryConnectedToSwitch = graph.get(battery.id)?.has(sw.id);
  const switchConnectedToBulb = graph.get(sw.id)?.has(bulb.id);
  const bulbConnectedToBattery = graph.get(bulb.id)?.has(battery.id);

  if (!((batteryConnectedToSwitch && switchConnectedToBulb && bulbConnectedToBattery))) {
    return {
      passed: false,
      failureTitle: "Circuit Not in a Complete Loop",
      failureReason: "The components are wired incorrectly or have open terminals.",
      hint: "Wire Battery -> Switch -> Bulb -> Battery to form a continuous circle.",
    };
  }

  if (sw.state && sw.state.closed === false) {
    return {
      passed: false,
      failureTitle: "Switch is Open (Off)",
      failureReason: "The circuit is wired properly, but the switch is turned OFF, breaking the flow of electricity.",
      hint: "Click on the Toggle Switch on the bench to flip it to CLOSED (ON)!",
    };
  }

  return {
    passed: true,
    title: "Beacon Illuminated! 💡✨",
    summary: "Electric current flows through the closed switch into the bulb, creating a bright glowing beacon!",
  };
}

/**
 * Validates Mission 3: Move the Package
 */
export function evaluateMission3(components) {
  const ramp = components.find((c) => c.type === "ramp");
  if (!ramp) {
    return {
      passed: false,
      failureTitle: "Missing Incline Ramp",
      failureReason: "Without a ramp, gravity cannot roll the cart across the drop-off.",
      hint: "Place an Incline Ramp on the left staging shelf.",
    };
  }

  const cart = components.find((c) => c.type === "cart-chassis");
  if (!cart) {
    return {
      passed: false,
      failureTitle: "Missing Cart Chassis",
      failureReason: "You need a vehicle bed to carry the package safely.",
      hint: "Place a Cart Chassis at the top of the ramp.",
    };
  }

  const wheels = components.filter((c) => c.type === "wheel");
  if (wheels.length < 2) {
    return {
      passed: false,
      failureTitle: "Cart Needs Wheels to Roll!",
      failureReason: "A flat cart without wheels suffers from severe friction and won't slide down.",
      hint: "Attach two Wheels onto the front and rear axle mounts of the Cart Chassis.",
    };
  }

  const pkg = components.find((c) => c.type === "package");
  if (!pkg) {
    return {
      passed: false,
      failureTitle: "Package Not Loaded",
      failureReason: "The mission is to deliver the package, but the cart is empty!",
      hint: "Place the Delivery Box inside the bed of the Cart Chassis.",
    };
  }

  // Generous proximity detection for wheels attached to cart
  const cartCenterX = cart.x + cart.width / 2;
  const cartCenterY = cart.y + cart.height / 2;

  const wheelsNearCart = wheels.filter(
    (w) =>
      Math.abs(w.x + w.width / 2 - cartCenterX) <= cart.width * 0.7 &&
      Math.abs(w.y + w.height / 2 - cartCenterY) <= 60
  );

  if (wheelsNearCart.length < 2) {
    return {
      passed: false,
      failureTitle: "Wheels Not Snapped to Axles",
      failureReason: "The wheels are loose and not securely locked into the cart's axle hubs.",
      hint: "Place one wheel under the front of the cart and the second wheel under the rear.",
    };
  }

  const pkgNearCart =
    Math.abs(pkg.x + pkg.width / 2 - cartCenterX) <= cart.width * 0.6 &&
    Math.abs(pkg.y + pkg.height / 2 - cartCenterY) <= 65;

  if (!pkgNearCart) {
    return {
      passed: false,
      failureTitle: "Package Not Centered on Cart",
      failureReason: "The delivery box is not sitting on the cart bed.",
      hint: "Drop the Delivery Box right on top of the Cart Chassis.",
    };
  }

  return {
    passed: true,
    title: "Delivery Complete! 🚚💨",
    summary: "The wheeled cart rolled smoothly down the ramp and safely delivered the package into the dock!",
  };
}

/**
 * Validates Mission 4: Smart Robot Trigger
 */
export function evaluateMission4(components, wires = []) {
  const battery = components.find((c) => c.type === "battery");
  if (!battery) {
    return {
      passed: false,
      failureTitle: "No Power Source",
      failureReason: "The robotic motor needs electrical power to turn.",
      hint: "Add a Battery to the bench to power the automation system.",
    };
  }

  const sensor = components.find((c) => c.type === "pressure-plate");
  if (!sensor) {
    return {
      passed: false,
      failureTitle: "Missing Sensor Trigger",
      failureReason: "The robot needs a sensor to detect when someone steps on the target pad.",
      hint: "Place a Pressure Sensor on the trigger platform.",
    };
  }

  const motor = components.find((c) => c.type === "motor");
  if (!motor) {
    return {
      passed: false,
      failureTitle: "Missing Motor",
      failureReason: "Without a motor, the robot cannot create rotational mechanical movement.",
      hint: "Add an Electric Motor to the robot mount.",
    };
  }

  const gear = components.find((c) => c.type === "gear");
  if (!gear) {
    return {
      passed: false,
      failureTitle: "No Output Gear on Motor",
      failureReason: "The motor can spin, but without a gear on its shaft, it cannot drive any machinery.",
      hint: "Attach a Spur Gear directly onto the motor's drive shaft.",
    };
  }

  // Gear near motor shaft
  const motorShaftX = motor.x + motor.width * 0.85;
  const motorShaftY = motor.y + motor.height * 0.5;
  const gearCenterX = gear.x + gear.width / 2;
  const gearCenterY = gear.y + gear.height / 2;
  const gearAttached = Math.hypot(motorShaftX - gearCenterX, motorShaftY - gearCenterY) <= 60;

  if (!gearAttached) {
    return {
      passed: false,
      failureTitle: "Gear Not Attached to Shaft",
      failureReason: "The gear is not snapped onto the motor's spinning drive shaft.",
      hint: "Place the center of the Gear onto the right side of the motor shaft.",
    };
  }

  if (wires.length < 3) {
    return {
      passed: false,
      failureTitle: "Wiring Incomplete",
      failureReason: "The sensor and motor are not wired into a closed circuit with the battery.",
      hint: "Wire Battery -> Pressure Sensor -> Motor -> Battery to complete the circuit.",
    };
  }

  const graph = new Map();
  wires.forEach((w) => {
    if (!graph.has(w.fromCompId)) graph.set(w.fromCompId, new Set());
    if (!graph.has(w.toCompId)) graph.set(w.toCompId, new Set());
    graph.get(w.fromCompId).add(w.toCompId);
    graph.get(w.toCompId).add(w.fromCompId);
  });

  const batToSensor = graph.get(battery.id)?.has(sensor.id);
  const sensorToMotor = graph.get(sensor.id)?.has(motor.id);
  const motorToBat = graph.get(motor.id)?.has(battery.id);

  if (!(batToSensor && sensorToMotor && motorToBat)) {
    return {
      passed: false,
      failureTitle: "Incorrect Automation Wiring",
      failureReason: "Power must flow from Battery to Sensor, then to Motor, then return to Battery.",
      hint: "Connect Battery -> Pressure Sensor -> Motor -> Battery.",
    };
  }

  return {
    passed: true,
    title: "Robot Automated! 🤖⚡",
    summary: "Stepping on the sensor triggers current to the motor, spinning the gear at high speed!",
  };
}

export function evaluateMission(missionId, components, wires = []) {
  switch (missionId) {
    case "mission-1":
      return evaluateMission1(components);
    case "mission-2":
      return evaluateMission2(components, wires);
    case "mission-3":
      return evaluateMission3(components);
    case "mission-4":
      return evaluateMission4(components, wires);
    default:
      return {
        passed: false,
        failureTitle: "Unknown Mission",
        failureReason: "This mission cannot be validated.",
        hint: "Please choose a valid challenge mission.",
      };
  }
}
