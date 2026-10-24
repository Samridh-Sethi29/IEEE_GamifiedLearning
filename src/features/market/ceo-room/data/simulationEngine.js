// Core Mathematical Simulation Engine for Nexora Mobility CEO Decision Room
// Models capital allocation, marketing customer acquisition, R&D quality/defects,
// logistics transport capacity (Agency vs Fleet), P&L financials, and customer trust.

export const INITIAL_COMPANY_STATE = {
  name: "Nexora Mobility Corp.",
  industry: "Smart Electric Vehicles & Clean Energy",
  quarter: 1, // 1 to 4
  maxQuarters: 4,
  cash: 5000000, // ₹50,00,000 starting treasury
  hasOwnedFleet: false, // Whether company has bought in-house delivery fleet
  baseVehiclePrice: 120000, // ₹1,20,000 retail price per EV
  baseUnitMfgCost: 65000, // ₹65,000 base factory production cost
  fixedOverhead: 400000, // ₹4,00,000 quarterly fixed rent & admin
  customerTrust: 75, // 0 - 100
  employeeMorale: 75, // 0 - 100
  marketShare: 16, // 16%
  financialHistory: [], // Prior quarter records
};

export function formatRupees(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  const str = absVal.toString();
  if (str.length <= 3) {
    return (isNegative ? "-₹" : "₹") + str;
  }
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  return (isNegative ? "-₹" : "₹") + formatted;
}

export function calculateProfit(revenue, expenses) {
  return (revenue || 0) - (expenses || 0);
}

export function calculateMargin(revenue, expenses) {
  if (!revenue || revenue <= 0) return 0;
  const profit = calculateProfit(revenue, expenses);
  return Math.round((profit / revenue) * 100);
}

/**
 * Generates realistic customer tweets / forum reviews based on quality & fulfillment
 */
export function generateCustomerReviews(qualityScore, backloggedUnits, transportType) {
  const reviews = [];

  // Quality Reviews
  if (qualityScore >= 85) {
    reviews.push({
      author: "@RohanMehta_Tech",
      stars: 5,
      text: "Picked up my Nexora EV yesterday! Flawless build, zero panel gaps, and the battery range exceeded the EPA estimate. 10/10 engineering!",
      tag: "Verified Buyer",
      sentiment: "positive",
    });
    reviews.push({
      author: "@CleanEnergyDaily",
      stars: 5,
      text: "Nexora's new battery thermal management system is best-in-class. R&D investment is clearly paying off.",
      tag: "Industry Analyst",
      sentiment: "positive",
    });
  } else if (qualityScore >= 65) {
    reviews.push({
      author: "@Priya_V",
      stars: 4,
      text: "Good EV for daily commute. A minor glitch in the dashboard touchscreen, but overall reliable drive.",
      tag: "Verified Buyer",
      sentiment: "neutral",
    });
    reviews.push({
      author: "@AutoDriveIndia",
      stars: 3,
      text: "Decent urban runabout, but suspension feels slightly stiff. Average fit and finish.",
      tag: "EV Enthusiast",
      sentiment: "neutral",
    });
  } else {
    reviews.push({
      author: "@Kunal_B",
      stars: 1,
      text: "Battery overheated on day 3! Dashboard died on the highway. Disastrous quality control. Demanding full refund!",
      tag: "Angry Owner",
      sentiment: "negative",
    });
    reviews.push({
      author: "@ConsumerWatchdog",
      stars: 1,
      text: "Nexora cutting corners on battery relays? We are seeing surge of breakdown complaints on public forums.",
      tag: "Consumer Report",
      sentiment: "negative",
    });
  }

  // Logistics / Delivery Reviews
  if (backloggedUnits > 60) {
    reviews.push({
      author: "@DeepakSharma",
      stars: 1,
      text: "Been waiting 7 weeks for delivery! Customer support says logistics is backlogged. Just cancelled my booking.",
      tag: "Cancelled Order",
      sentiment: "negative",
    });
  } else if (transportType === "fleet") {
    reviews.push({
      author: "@AnanyaS",
      stars: 5,
      text: "Delivered straight to my doorstep on an electric Nexora transport carrier in just 48 hours. Premium white-glove service!",
      tag: "Verified Buyer",
      sentiment: "positive",
    });
  } else {
    reviews.push({
      author: "@Sameer_Goel",
      stars: 4,
      text: "Delivery agency arrived within the scheduled delivery window. Smooth handover.",
      tag: "Verified Buyer",
      sentiment: "positive",
    });
  }

  return reviews;
}

/**
 * Runs one quarterly simulation period and calculates the complete P&L statement
 */
export function runQuarterSimulation(state, { adSpend, rdSpend, transportType }) {
  // 1. Logistics Setup
  let fleetCapEx = 0;
  let hasOwnedFleet = state.hasOwnedFleet;
  let transportCapacity = 320;
  let deliveryFeePerUnit = 8000; // 3PL Agency fee

  if (transportType === "fleet") {
    if (!hasOwnedFleet) {
      fleetCapEx = 1200000; // ₹12,00,000 one-time capital asset acquisition
      hasOwnedFleet = true;
    }
    transportCapacity = 900;
    deliveryFeePerUnit = 2200; // In-house direct delivery
  }

  // 2. Customer Demand Generation (Ad Spend + Trust Factor)
  // Base demand + 1 customer per ₹2,200 ad spend
  const adEffect = Math.floor(adSpend / 2200);
  const baseDemand = 140;
  const trustMultiplier = state.customerTrust / 75;
  const totalBuyerDemand = Math.max(30, Math.round((baseDemand + adEffect) * trustMultiplier));

  // 3. Product Engineering & Quality Defect Rate
  // rdSpend ranges from ₹0 to ₹15,00,000 -> Quality Score 35 to 98
  const qualityScore = Math.min(98, Math.round(35 + (rdSpend / 1500000) * 63));
  // Defect rate: quality 98 -> 0.8%; quality 35 -> 14.5%
  const defectRate = Math.max(0.008, ((100 - qualityScore) / 450));

  // 4. Fulfillment & Backlog Mechanics
  const deliveredUnits = Math.min(totalBuyerDemand, transportCapacity);
  const backloggedUnits = Math.max(0, totalBuyerDemand - transportCapacity);
  // Angry backlogged buyers cancel order
  const cancelledUnits = Math.round(backloggedUnits * 0.4);

  // Defective delivered units that need warranty service / refunds
  const defectiveUnits = Math.round(deliveredUnits * defectRate);
  const satisfiedUnits = Math.max(0, deliveredUnits - defectiveUnits);

  // 5. Financial P&L Statement (Indian Rupees)
  const grossRevenue = deliveredUnits * state.baseVehiclePrice;
  const mfgCost = deliveredUnits * state.baseUnitMfgCost;
  const logisticsCost = (deliveredUnits * deliveryFeePerUnit) + fleetCapEx;
  const warrantyRepairCost = defectiveUnits * 32000; // ₹32,000 repair & parts per defect
  const totalOperatingExpenses =
    mfgCost + logisticsCost + adSpend + rdSpend + state.fixedOverhead + warrantyRepairCost;

  const netProfit = grossRevenue - totalOperatingExpenses;
  const endingCash = state.cash + netProfit;
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  // 6. Brand Reputation & Market Share Dynamics
  let trustDelta = 0;
  if (defectiveUnits > 25) {
    trustDelta -= 14;
  } else if (defectiveUnits > 8) {
    trustDelta -= 5;
  } else {
    trustDelta += 4;
  }

  if (backloggedUnits > 50) {
    trustDelta -= 9;
  } else if (backloggedUnits === 0 && deliveredUnits > 180) {
    trustDelta += 3;
  }

  // Over-hyping penalty: heavy ad spend + terrible product quality damages brand integrity
  if (adSpend >= 800000 && qualityScore < 60) {
    trustDelta -= 10;
  }

  if (rdSpend >= 700000) {
    trustDelta += 4;
  }

  const newTrust = Math.max(10, Math.min(100, state.customerTrust + trustDelta));
  const newShare = Math.max(
    5,
    Math.min(40, Math.round(state.marketShare + (deliveredUnits / 55) - (defectiveUnits / 12)))
  );

  const reviews = generateCustomerReviews(qualityScore, backloggedUnits, transportType);

  const quarterResult = {
    quarter: state.quarter,
    adSpend,
    rdSpend,
    transportType,
    fleetCapEx,
    totalBuyerDemand,
    deliveredUnits,
    backloggedUnits,
    cancelledUnits,
    defectiveUnits,
    satisfiedUnits,
    qualityScore,
    grossRevenue,
    mfgCost,
    logisticsCost,
    warrantyRepairCost,
    totalExpenses: totalOperatingExpenses,
    netProfit,
    profitMargin,
    beginningCash: state.cash,
    endingCash,
    customerTrust: newTrust,
    marketShare: newShare,
    reviews,
  };

  const nextState = {
    ...state,
    quarter: state.quarter + 1,
    cash: endingCash,
    hasOwnedFleet,
    customerTrust: newTrust,
    marketShare: newShare,
    financialHistory: [...state.financialHistory, quarterResult],
  };

  return { nextState, quarterResult };
}

/**
 * Evaluates the full 4-quarter corporate tenure and computes final letter grade
 */
export function evaluateAnnualPerformance(finalState) {
  const history = finalState.financialHistory || [];
  const totalRevenue = history.reduce((sum, q) => sum + q.grossRevenue, 0);
  const totalExpenses = history.reduce((sum, q) => sum + q.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalUnitsDelivered = history.reduce((sum, q) => sum + q.deliveredUnits, 0);
  const totalDefects = history.reduce((sum, q) => sum + q.defectiveUnits, 0);
  const finalCash = finalState.cash;
  const finalTrust = finalState.customerTrust;

  let score = 50; // Base score

  // Profitability scoring
  if (totalProfit > 2000000) score += 25;
  else if (totalProfit > 500000) score += 15;
  else if (totalProfit > 0) score += 8;
  else score -= 15;

  // Solvency & Cash scoring
  if (finalCash >= 6000000) score += 15;
  else if (finalCash >= 4000000) score += 10;
  else if (finalCash < 1500000) score -= 20;

  // Customer trust & brand equity
  if (finalTrust >= 85) score += 15;
  else if (finalTrust >= 70) score += 8;
  else if (finalTrust < 50) score -= 15;

  // Quality & Defect ratio
  const defectRate = totalUnitsDelivered > 0 ? (totalDefects / totalUnitsDelivered) : 0;
  if (defectRate < 0.02) score += 10;
  else if (defectRate > 0.08) score -= 15;

  score = Math.max(0, Math.min(100, score));

  let grade = "C";
  let title = "Operational Manager";
  let verdict = "Your company survived, but faced substantial growing pains and volatility.";

  if (score >= 90) {
    grade = "A+";
    title = "Visionary Corporate Leader";
    verdict = "Outstanding tenure! Balanced marketing growth, world-class product quality, and prudent capital allocation.";
  } else if (score >= 80) {
    grade = "A";
    title = "Strategic Executive";
    verdict = "Strong corporate performance. Built a durable brand with healthy margins and happy EV drivers.";
  } else if (score >= 70) {
    grade = "B";
    title = "Capable CEO";
    verdict = "Delivered profitable growth, though faced occasional quality or fulfillment friction.";
  } else if (score < 50) {
    grade = "F";
    title = "Distressed Turnaround";
    verdict = "Severe capital burn and damaged customer trust. The Board of Directors has initiated restructuring.";
  }

  return {
    score,
    grade,
    title,
    verdict,
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalUnitsDelivered,
    totalDefects,
    finalCash,
    finalTrust,
  };
}
