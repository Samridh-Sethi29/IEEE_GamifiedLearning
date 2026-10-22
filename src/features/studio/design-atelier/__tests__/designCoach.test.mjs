import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateDesign } from "../engine/designCoach.js";

describe("Design Coach Evaluation Unit Tests", () => {
  it("fails if canvas is empty and provides actionable feedback", () => {
    const res = evaluateDesign("project-1", []);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Canvas is Empty/);
  });

  it("fails if headline is missing", () => {
    const elements = [
      { id: "1", type: "sticker", iconKey: "droplet", x: 200, y: 200 },
      { id: "2", type: "badge", text: "Turn off tap", x: 200, y: 400 },
    ];
    const res = evaluateDesign("project-1", elements);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Missing Main Headline/);
  });

  it("fails Project 1 if call-to-action is missing", () => {
    const elements = [
      { id: "1", type: "text", variant: "heading", text: "Save Water", x: 100, y: 50 },
      { id: "2", type: "sticker", iconKey: "droplet", x: 200, y: 200 },
    ];
    const res = evaluateDesign("project-1", elements);
    assert.equal(res.passed, false);
    assert.match(res.failureTitle, /Missing Call to Action/);
  });

  it("passes Project 1 when headline, graphic, and action badge exist", () => {
    const elements = [
      { id: "1", type: "text", variant: "heading", text: "SAVE EVERY DROP", x: 100, y: 60 },
      { id: "2", type: "sticker", iconKey: "droplet", x: 200, y: 200 },
      { id: "3", type: "badge", text: "Turn Off The Tap!", x: 150, y: 450 },
    ];
    const res = evaluateDesign("project-1", elements);
    assert.equal(res.passed, true);
    assert.match(res.title, /Approved/);
  });

  it("evaluates Project 3 for date and location details", () => {
    const elements = [
      { id: "1", type: "text", variant: "heading", text: "ANNUAL SCIENCE FAIR", x: 80, y: 50 },
      { id: "2", type: "sticker", iconKey: "beaker", x: 200, y: 200 },
      { id: "3", type: "text", variant: "details", text: "Friday 10 AM - Main Hall", x: 100, y: 400 },
    ];
    const res = evaluateDesign("project-3", elements);
    assert.equal(res.passed, true);
    assert.match(res.title, /Ready/);
  });

  it("evaluates Project 4 for security shield and safety rule", () => {
    const elements = [
      { id: "1", type: "text", variant: "heading", text: "STAY SAFE ONLINE", x: 80, y: 50 },
      { id: "2", type: "sticker", iconKey: "shield", x: 200, y: 200 },
      { id: "3", type: "badge", text: "Never Share Your Password!", x: 100, y: 400 },
    ];
    const res = evaluateDesign("project-4", elements);
    assert.equal(res.passed, true);
    assert.match(res.title, /Mastered/);
  });
});
