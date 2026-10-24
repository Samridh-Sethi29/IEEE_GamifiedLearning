import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateMission,
  evaluateMission1,
  evaluateMission2,
  evaluateMission3,
  evaluateMission4,
  arePortsConnected,
  getPortAbsolutePos,
} from "../engine/evaluator.js";
import { COMPONENT_CATALOG } from "../data/missions.js";

function createComp(type, x, y, rotation = 0, state = {}) {
  const meta = COMPONENT_CATALOG[type];
  return {
    id: `${type}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    x,
    y,
    width: meta.width,
    height: meta.height,
    rotation,
    ports: JSON.parse(JSON.stringify(meta.ports)),
    state: { ...(meta.defaultState || {}), ...state },
  };
}

describe("Invention Lab Evaluator Tests", () => {
  it("Mission 1: detects missing pivot support and gives actionable hint", () => {
    const lever = createComp("lever", 200, 200);
    const cargo = createComp("cargo", 210, 190);
    const res = evaluateMission1([lever, cargo]);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Missing Support/);
    assert.match(res.hint, /Pivot Base/);
  });

  it("Mission 1: passes when pivot, lever, cargo, and counterweight are connected correctly", () => {
    // Pivot at x=300, y=300, port top at (300+30, 300+5) = (330, 305)
    const pivot = createComp("pivot", 300, 300);
    // Lever centered on pivot: width=220, height=24. center port at (110, 12).
    // So lever at x = 330 - 110 = 220, y = 305 - 12 = 293.
    const lever = createComp("lever", 220, 293);

    // Left port of lever at (220+20, 293+12) = (240, 305).
    // Cargo bottom port at (25, 45). Place cargo at x = 240 - 25 = 215, y = 305 - 45 = 260.
    const cargo = createComp("cargo", 215, 260);

    // Right port of lever at (220+200, 293+12) = (420, 305).
    // Weight bottom port at (22, 40). Place weight at x = 420 - 22 = 398, y = 305 - 40 = 265.
    const weight = createComp("counterweight", 398, 265);

    const res = evaluateMission1([pivot, lever, cargo, weight]);
    assert.equal(res.passed, true);
    assert.match(res.title, /Successfully Lifted/);
  });

  it("Mission 2: fails if circuit is incomplete or switch is open", () => {
    const battery = createComp("battery", 100, 100);
    const sw = createComp("switch", 200, 100, 0, { closed: false });
    const bulb = createComp("bulb", 300, 100);

    const wires = [
      { fromCompId: battery.id, toCompId: sw.id },
      { fromCompId: sw.id, toCompId: bulb.id },
      { fromCompId: bulb.id, toCompId: battery.id },
    ];

    const res = evaluateMission2([battery, sw, bulb], wires);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Switch is Open/);
    assert.match(res.hint, /CLOSED/);
  });

  it("Mission 2: passes when circuit loop is closed and switch is closed", () => {
    const battery = createComp("battery", 100, 100);
    const sw = createComp("switch", 200, 100, 0, { closed: true });
    const bulb = createComp("bulb", 300, 100);

    const wires = [
      { fromCompId: battery.id, toCompId: sw.id },
      { fromCompId: sw.id, toCompId: bulb.id },
      { fromCompId: bulb.id, toCompId: battery.id },
    ];

    const res = evaluateMission2([battery, sw, bulb], wires);
    assert.equal(res.passed, true);
    assert.match(res.title, /Illuminated/);
  });

  it("Mission 3: detects missing wheels on cart", () => {
    const ramp = createComp("ramp", 100, 200);
    const cart = createComp("cart-chassis", 250, 200);
    const pkg = createComp("package", 280, 170);

    const res = evaluateMission3([ramp, cart, pkg]);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Cart Needs Wheels/);
  });

  it("Mission 4: checks motor trigger automation loop", () => {
    const battery = createComp("battery", 100, 100);
    const sensor = createComp("pressure-plate", 200, 100);
    const motor = createComp("motor", 300, 100);
    const gear = createComp("gear", 332, 105);

    const wires = [
      { fromCompId: battery.id, toCompId: sensor.id },
      { fromCompId: sensor.id, toCompId: motor.id },
      { fromCompId: motor.id, toCompId: battery.id },
    ];

    const res = evaluateMission4([battery, sensor, motor, gear], wires);
    assert.equal(res.passed, true);
    assert.match(res.title, /Robot Automated/);
  });
});
