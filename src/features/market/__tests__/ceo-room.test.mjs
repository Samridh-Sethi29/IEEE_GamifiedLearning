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
import {
  INITIAL_COMPANY_STATE,
  runQuarterSimulation,
  evaluateAnnualPerformance,
} from "../ceo-room/data/simulationEngine.js";

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

test("runQuarterSimulation computes accurate P&L, customer demand, and logistics bottlenecks", () => {
  // Scenario 1: Balanced allocation with 3PL Agency
  const { nextState, quarterResult } = runQuarterSimulation(INITIAL_COMPANY_STATE, {
    adSpend: 500000,
    rdSpend: 500000,
    transportType: "agency",
  });

  assert.equal(quarterResult.quarter, 1);
  assert.ok(quarterResult.totalBuyerDemand > 150, "Marketing generates customer demand");
  assert.ok(quarterResult.deliveredUnits <= 320, "Agency capacity caps at 320 units");
  assert.ok(quarterResult.grossRevenue > 0, "Revenue earned from delivered units");
  assert.ok(quarterResult.totalExpenses > 0, "Expenses accounted");
  assert.equal(quarterResult.endingCash, quarterResult.beginningCash + quarterResult.netProfit);
  assert.equal(nextState.quarter, 2, "Advances to Quarter 2");

  // Scenario 2: In-House Fleet purchase handles high demand without backlog
  const { nextState: fleetState, quarterResult: fleetResult } = runQuarterSimulation(
    INITIAL_COMPANY_STATE,
    {
      adSpend: 1000000, // Aggressive marketing
      rdSpend: 800000,  // High quality
      transportType: "fleet",
    }
  );

  assert.equal(fleetResult.fleetCapEx, 1200000, "Applies one-time fleet purchase CapEx");
  assert.ok(fleetResult.deliveredUnits > 320, "Fleet fulfills high volume beyond agency limit");
  assert.equal(fleetState.hasOwnedFleet, true, "Marks fleet as owned");
});

test("evaluateAnnualPerformance computes comprehensive 4-quarter scorecard", () => {
  const mockAnnualState = {
    ...INITIAL_COMPANY_STATE,
    cash: 6500000,
    customerTrust: 88,
    financialHistory: [
      { grossRevenue: 3000000, totalExpenses: 2200000, deliveredUnits: 250, defectiveUnits: 2 },
      { grossRevenue: 3600000, totalExpenses: 2600000, deliveredUnits: 300, defectiveUnits: 3 },
      { grossRevenue: 4200000, totalExpenses: 3000000, deliveredUnits: 350, defectiveUnits: 3 },
      { grossRevenue: 4800000, totalExpenses: 3400000, deliveredUnits: 400, defectiveUnits: 4 },
    ],
  };

  const perf = evaluateAnnualPerformance(mockAnnualState);
  assert.ok(perf.score >= 80, "Profitable year receives high score");
  assert.ok(["A", "A+"].includes(perf.grade), "Received top grade");
  assert.equal(perf.totalUnitsDelivered, 1300);
});
