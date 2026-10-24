import test from "node:test";
import assert from "node:assert/strict";
import {
  COMPANY_PROFILE,
  CHALLENGES,
  formatRupees,
  calculateProfit,
  calculateMargin,
  evaluateFinalScore,
} from "../ceo-room/data/scenarios.js";

test("formatRupees properly formats Indian numbers and negative values", () => {
  assert.equal(formatRupees(5000000), "₹50,00,000");
  assert.equal(formatRupees(2000000), "₹20,00,000");
  assert.equal(formatRupees(150000), "₹1,50,000");
  assert.equal(formatRupees(25000), "₹25,000");
  assert.equal(formatRupees(500), "₹500");
  assert.equal(formatRupees(0), "₹0");
  assert.equal(formatRupees(-250000), "-₹2,50,000");
  assert.equal(formatRupees(null), "₹0");
});

test("calculateProfit and calculateMargin handle valid and edge cases", () => {
  // Normal profit
  assert.equal(calculateProfit(2000000, 1500000), 500000);
  assert.equal(calculateMargin(2000000, 1500000), 25);

  // Negative profit (Loss)
  assert.equal(calculateProfit(1000000, 1500000), -500000);
  assert.equal(calculateMargin(1000000, 1500000), -50);

  // Zero revenue edge case
  assert.equal(calculateProfit(0, 500000), -500000);
  assert.equal(calculateMargin(0, 500000), 0);
});

test("CHALLENGES contains all 5 required business scenarios with 3 strategic options each", () => {
  assert.equal(CHALLENGES.length, 5);

  CHALLENGES.forEach((challenge, idx) => {
    assert.equal(challenge.id, idx + 1);
    assert.ok(challenge.title, `Challenge ${idx + 1} has a title`);
    assert.ok(challenge.situation, `Challenge ${idx + 1} has a situation`);
    assert.ok(challenge.objective, `Challenge ${idx + 1} has an objective`);
    assert.equal(challenge.options.length, 3, `Challenge ${idx + 1} has 3 options`);

    challenge.options.forEach((opt) => {
      assert.ok(["A", "B", "C"].includes(opt.id), `Option id is A, B, or C`);
      assert.ok(opt.label, `Option ${opt.id} has a label`);
      assert.ok(opt.concept, `Option ${opt.id} has an educational concept`);
      assert.ok(opt.takeaway, `Option ${opt.id} has a takeaway`);
      assert.ok(typeof opt.cashImpact === "number", `cashImpact is numeric`);
      assert.ok(typeof opt.revenueDelta === "number", `revenueDelta is numeric`);
      assert.ok(typeof opt.expensesDelta === "number", `expensesDelta is numeric`);
      assert.ok(typeof opt.trustDelta === "number", `trustDelta is numeric`);
      assert.ok(typeof opt.moraleDelta === "number", `moraleDelta is numeric`);
      assert.ok(typeof opt.marketShareDelta === "number", `marketShareDelta is numeric`);
    });
  });
});

test("evaluateFinalScore produces balanced evaluation and correct grades", () => {
  // High performance test
  const highMetrics = {
    cash: 4800000,
    revenue: 2800000,
    expenses: 1800000,
    customerTrust: 90,
    employeeMorale: 88,
    marketShare: 28,
  };
  const highResult = evaluateFinalScore(highMetrics, []);
  assert.ok(highResult.totalScore >= 80, "High metrics receive high score");
  assert.ok(["A", "A+"].includes(highResult.grade), "High metrics receive A or A+");
  assert.ok(highResult.breakdown.financial > 0);
  assert.ok(highResult.breakdown.trust > 0);
  assert.ok(highResult.breakdown.morale > 0);
  assert.ok(highResult.breakdown.market > 0);

  // Stressed company test
  const lowMetrics = {
    cash: 500000,
    revenue: 1200000,
    expenses: 1500000,
    customerTrust: 35,
    employeeMorale: 30,
    marketShare: 12,
  };
  const lowResult = evaluateFinalScore(lowMetrics, []);
  assert.ok(lowResult.totalScore < 60, "Stressed company receives lower score");
  assert.equal(lowResult.grade, "C");
});
