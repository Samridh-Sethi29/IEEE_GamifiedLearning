// Scenario definitions, financial formulas, and simulation parameters for CEO Decision Room

export const COMPANY_PROFILE = {
  name: "Nexora Mobility",
  industry: "Electric Vehicles & Smart Clean Energy",
  tagline: "Powering Tomorrow's Commute",
  description:
    "Nexora Mobility is an ambitious clean-tech automotive company manufacturing smart electric two-wheelers and compact urban EVs. As CEO, you must navigate intense competition, supply chain shocks, workforce culture, and capital allocation.",
  initialMetrics: {
    cash: 5000000, // ₹50,00,000
    revenue: 2000000, // ₹20,00,000 per simulated quarter
    expenses: 1500000, // ₹15,00,000 per simulated quarter
    unitsSold: 200,
    unitPrice: 10000,
    customerTrust: 70, // 0 - 100
    employeeMorale: 75, // 0 - 100
    marketShare: 20, // 20%
    period: 1, // Quarter 1
  },
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
  return revenue - expenses;
}

export function calculateMargin(revenue, expenses) {
  if (!revenue || revenue <= 0) return 0;
  const profit = calculateProfit(revenue, expenses);
  return Math.round((profit / revenue) * 100);
}

export const CHALLENGES = [
  {
    id: 1,
    quarter: "Q1 — Cost of Goods Shock",
    title: "Rising Production Costs",
    kicker: "Supply Chain & Pricing Strategy",
    situation:
      "Global shortages of high-grade lithium and battery cells have forced key battery suppliers to raise their prices by 28%. This directly increases Nexora's manufacturing cost per vehicle by ₹2,00,000 per quarter.",
    objective: "Protect operating margins without destroying consumer demand.",
    options: [
      {
        id: "A",
        label: "Increase Vehicle Selling Price by 15%",
        summary: "Pass the raw material cost increase directly onto buyers.",
        cashImpact: 0,
        revenueDelta: 24000, // Net +₹24,000: Price goes up 15%, but sales fall 14%
        expensesDelta: 200000, // Supplier cost increase
        trustDelta: -10,
        moraleDelta: 0,
        marketShareDelta: -2,
        immediateImpact: "Vehicle price increases to ₹11,500. Sales volume contracts by 14% as price-sensitive buyers pause.",
        delayedImpact: "Competitors with stable prices attract customers who feel priced out by Nexora.",
        concept: "Price Elasticity of Demand & Substitution Effect",
        explanation:
          "Raising prices when consumer alternatives exist usually causes sales volume to decline. If demand is elastic, price hikes can sometimes result in less total revenue.",
        takeaway: "Price hikes protect unit margins, but can permanently surrender market share if rivals hold prices steady.",
      },
      {
        id: "B",
        label: "Negotiate Multi-Quarter Contracts & Re-Engineer Pack Architecture",
        summary: "Commit ₹6,00,000 upfront to redesign internal battery mounts and lock in bulk tiered rates.",
        cashImpact: -600000, // Upfront investment
        revenueDelta: 0, // Prices remain unchanged, demand steady
        expensesDelta: -100000, // Long-term efficiency reduces future expenses to ₹14L
        trustDelta: 6,
        moraleDelta: 5,
        marketShareDelta: 1,
        immediateImpact: "Initial capital outlay of ₹6,00,000 to re-engineer battery layouts and lock in volume discounts.",
        delayedImpact: "Structural quarterly operating expenses decrease sustainably, widening profit margins across future quarters.",
        concept: "Operational Efficiency & Economies of Scale",
        explanation:
          "Rather than passing supply shocks onto buyers, high-performing firms invest in lean engineering and long-term volume agreements to compress cost-of-goods-sold (COGS).",
        takeaway: "Investing in process innovation creates durable cost advantages that competitors cannot easily copy.",
      },
      {
        id: "C",
        label: "Reduce Component Quality & Interior Materials to Cut Costs",
        summary: "Replace soft-touch materials and premium relays with lower-grade components.",
        cashImpact: 0,
        revenueDelta: 0,
        expensesDelta: -150000, // Cuts immediate expenses to ₹13.5L
        trustDelta: -18,
        moraleDelta: -8,
        marketShareDelta: -3,
        immediateImpact: "Immediate quarterly savings of ₹1,50,000 on plastics and wiring harnesses.",
        delayedImpact: "Rattle defects and component failures rise. Negative owner reviews surge on social media and warranty claims escalate.",
        concept: "Quality Shading & Hidden Brand Liabilities",
        explanation:
          "Short-changing quality creates an illusion of immediate profitability while quietly degrading brand equity and driving up downstream customer support costs.",
        takeaway: "Cutting corners on product quality turns today's savings into tomorrow's expensive reputational crisis.",
      },
    ],
  },
  {
    id: 2,
    quarter: "Q2 — Reputation & Retention Crisis",
    title: "Negative Customer Reviews",
    kicker: "Customer Lifetime Value (CLV)",
    situation:
      "Customer support backlogs have spiked to 14 days for service requests, software app bug fixes, and roadside assistance. Disgruntled owners are vocal on EV forums, and cancellation rates are climbing.",
    objective: "Restore customer satisfaction and halt customer churn.",
    options: [
      {
        id: "A",
        label: "Overhaul Service: Deploy Mobile Service Vans & Expand Technician Staff",
        summary: "Invest ₹8,00,000 in mobile service vans and add dedicated service staff.",
        cashImpact: -800000,
        revenueDelta: 250000, // Returning happy customers & paid service plans
        expensesDelta: 100000, // Ongoing technician payroll
        trustDelta: 18,
        moraleDelta: 8,
        marketShareDelta: 3,
        immediateImpact: "Upfront capital investment of ₹8,00,000 into modern diagnostic vans and frontline technician onboarding.",
        delayedImpact: "Service turnaround drops from 14 days to 48 hours. Satisfied customers become passionate brand promoters.",
        concept: "Customer Lifetime Value (CLV) & Word of Mouth",
        explanation:
          "Retaining an existing customer costs roughly one-fifth of acquiring a new one. Exceptional service turns satisfied buyers into unpaid brand ambassadors.",
        takeaway: "Great customer support is a revenue driver and defensive moat, not just a cost center.",
      },
      {
        id: "B",
        label: "Launch Flashy Celebrity Marketing Campaign to Drown Out Negative Buzz",
        summary: "Spend ₹10,00,000 on viral influencer campaigns and digital billboards.",
        cashImpact: -1000000,
        revenueDelta: 280000, // Short-term spike in first-time buyer inquiries
        expensesDelta: 0,
        trustDelta: -9,
        moraleDelta: -4,
        marketShareDelta: 1,
        immediateImpact: "High-visibility advertising campaign creates a surge in website traffic and top-of-funnel leads.",
        delayedImpact: "Existing customers criticize the flashy commercials while their vehicles sit broken in workshops, deepening public cynicism.",
        concept: "The Marketing vs. Product Reality Gap",
        explanation:
          "Marketing accelerates the truth about your product. Advertising an unresolved, broken service experience only accelerates customer disillusionment.",
        takeaway: "Never use marketing dollars to wallpaper over operational fractures.",
      },
      {
        id: "C",
        label: "Dismiss Complaints as Vocal Minority Noise & Freeze Service Budget",
        summary: "Maintain current budget, assuming dissatisfaction will blow over.",
        cashImpact: 0,
        revenueDelta: -300000, // Churn and lost repeat sales
        expensesDelta: 0,
        trustDelta: -22,
        moraleDelta: -12,
        marketShareDelta: -5,
        immediateImpact: "Zero capital spent; quarterly expenses stay locked at current levels.",
        delayedImpact: "App ratings plummet to 2.1 stars on Google Play/App Store. Competitors launch trade-in programs targeting frustrated Nexora drivers.",
        concept: "Customer Churn & Compounding Brand Decay",
        explanation:
          "Unhappy customers tell an average of 9 to 15 people about their negative experience. Ignoring churn leads to compounding revenue erosion.",
        takeaway: "Ignoring customer feedback is the fastest way to bleed market share to responsive competitors.",
      },
    ],
  },
  {
    id: 3,
    quarter: "Q3 — Organizational Sustainability",
    title: "Employee Burnout & Capacity Crunch",
    kicker: "Human Capital & Productivity",
    situation:
      "Nexora's engineering and battery assembly teams have missed three straight delivery milestones. Internal HR audits reveal 68% of technicians report extreme fatigue and voluntary turnover is accelerating.",
    objective: "Restore operational capacity and rebuild team morale.",
    options: [
      {
        id: "A",
        label: "Hire 20 Specialized Engineers & Rebalance Project Workloads",
        summary: "Commit ₹4,00,000 to recruiting and add ₹2,00,000/period to baseline payroll.",
        cashImpact: -400000,
        revenueDelta: 350000, // Faster delivery of pending vehicle orders
        expensesDelta: 200000, // Expanded team payroll
        trustDelta: 5,
        moraleDelta: 20,
        marketShareDelta: 2,
        immediateImpact: "Immediate onboarding expense of ₹4,00,000. Fresh talent absorbs bottlenecked work queues.",
        delayedImpact: "Engineering sprint throughput doubles, on-time delivery rates jump to 94%, and costly assembly defects plummet.",
        concept: "Capacity Planning & Sustainable Velocity",
        explanation:
          "Under-resourcing a growing company creates catastrophic bottlenecks. Aligning workforce capacity with production demand restores predictable delivery.",
        takeaway: "Adequate headcount and sustainable pacing prevent expensive institutional brain drain.",
      },
      {
        id: "B",
        label: "Invest in Automated Testing Suites & Ergonomic Manufacturing Tools",
        summary: "Spend ₹7,00,000 to automate repetitive testing pipelines and upgrade assembly jigs.",
        cashImpact: -700000,
        revenueDelta: 200000,
        expensesDelta: 50000, // Software tooling maintenance
        trustDelta: 4,
        moraleDelta: 14,
        marketShareDelta: 1,
        immediateImpact: "Capital investment of ₹7,00,000 in continuous integration test benches and modular assembly equipment.",
        delayedImpact: "Engineers eliminate 15 hours of manual regression testing per week, redirecting cognitive focus toward high-value innovation.",
        concept: "Technological Leverage & Automation",
        explanation:
          "Automating repetitive grunt work multiplies worker leverage, increasing output per labor hour without increasing human fatigue.",
        takeaway: "Equipping your team with superior tools permanently elevates output without burning out talent.",
      },
      {
        id: "C",
        label: "Mandate Mandatory 6-Day Work Weeks & Overtime Under Threat of Penalties",
        summary: "Enforce emergency crunch time without hiring additional staff.",
        cashImpact: 0,
        revenueDelta: 50000, // Negligible short-term rush
        expensesDelta: 50000, // Overtime allowances
        trustDelta: -6,
        moraleDelta: -28,
        marketShareDelta: -2,
        immediateImpact: "Minor short-term bump in assembly volume over the first two weeks.",
        delayedImpact: "Lead architects and senior battery engineers resign in protest. Fatigue-induced assembly errors trigger costly factory recalls.",
        concept: "Diminishing Returns of Overtime & Burnout Collapse",
        explanation:
          "Studies demonstrate that working beyond 50 hours per week causes productivity to decline sharply, while error rates and attrition compound exponentially.",
        takeaway: "Mandatory crunch creates an illusion of progress that almost always collapses into catastrophic failure.",
      },
    ],
  },
  {
    id: 4,
    quarter: "Q4 — Capital Allocation & Geographic Growth",
    title: "Regional Expansion Opportunity",
    kicker: "Opportunity Cost & Capital Risk",
    situation:
      "A fast-growing southern urban corridor (Bengaluru-Hyderabad-Chennai) has announced aggressive clean-mobility purchase incentives and state subsidies. Entering now can establish Nexora as the dominant regional player.",
    objective: "Capture high-growth geographic demand while preserving sufficient cash liquidity.",
    options: [
      {
        id: "A",
        label: "Aggressive Expansion: Construct 4 Mega Experience Hubs & 20 Fast Chargers",
        summary: "Deploy ₹22,00,000 in heavy capital expenditure to dominate the southern corridor.",
        cashImpact: -2200000,
        revenueDelta: 800000, // Large regional sales surge
        expensesDelta: 450000, // Leases, staffing, electricity & charging upkeep
        trustDelta: 8,
        moraleDelta: 5,
        marketShareDelta: 8,
        immediateImpact: "Substantial capital deployment of ₹22,00,000 consumes a major portion of Nexora's liquid cash reserves.",
        delayedImpact: "Nexora captures a dominant regional footprint, locking out rivals and driving massive quarterly revenue growth.",
        concept: "First-Mover Advantage vs. Liquidity Risk",
        explanation:
          "Capital-intensive expansion can build wide market moats, but leaves the enterprise highly vulnerable if unexpected macroeconomic shocks occur.",
        takeaway: "Aggressive growth builds dominant market share, provided you maintain enough cash to survive unexpected delays.",
      },
      {
        id: "B",
        label: "Agile Regional Pilot: Open 1 Pop-Up Studio & Partner With Existing Charging Networks",
        summary: "Invest ₹7,50,000 into a lean showroom and third-party charging roaming agreements.",
        cashImpact: -750000,
        revenueDelta: 420000,
        expensesDelta: 160000,
        trustDelta: 6,
        moraleDelta: 6,
        marketShareDelta: 4,
        immediateImpact: "Controlled capital outlay of ₹7,50,000. Fast market entry with minimal commercial real estate risk.",
        delayedImpact: "Nexora gathers validated regional demand data while preserving over ₹30 Lakhs in liquid cash for future investments.",
        concept: "Lean Market Validation & Option Value",
        explanation:
          "A pilot program creates valuable strategic optionality: it tests customer response with limited downside before greenlighting massive capital deployment.",
        takeaway: "Piloting enables you to learn customer preferences cheaply before betting the whole company on full-scale rollout.",
      },
      {
        id: "C",
        label: "Decline Expansion: Conserve Cash & Focus Exclusively on Existing Home Market",
        summary: "Maintain existing territory, avoiding capital risk entirely.",
        cashImpact: 0,
        revenueDelta: 60000, // Modest incremental home market growth
        expensesDelta: 0,
        trustDelta: 0,
        moraleDelta: -4,
        marketShareDelta: -4, // Competitors capture the new market
        immediateImpact: "Zero capital spent; total cash balance remains completely untouched.",
        delayedImpact: "Aggressive competitors seize the southern corridor and government subsidies, permanently denying Nexora future expansion.",
        concept: "The Opportunity Cost of Inaction",
        explanation:
          "In high-growth markets, sitting still is not a neutral move. By declining to enter, you forfeit valuable market share to aggressive competitors.",
        takeaway: "Overly conservative cash preservation can save money in the short run while surrendering long-term market leadership.",
      },
    ],
  },
  {
    id: 5,
    quarter: "Q5 — Competitive Strategy & Positioning",
    title: "Aggressive Price-Slashing Competitor",
    kicker: "Differentiation vs. Price War",
    situation:
      "A deep-pocketed rival ('Voltix Motors') has slashed their vehicle prices by 22% across all segments and launched a predatory ad blitz claiming identical range for ₹2,500 less than Nexora.",
    objective: "Defend market share without destroying profit margins in a race to the bottom.",
    options: [
      {
        id: "A",
        label: "Match Voltix with an All-Out 25% Price Cut Across the Board",
        summary: "Undercut Voltix to protect sales volume at the cost of gross margins.",
        cashImpact: 0,
        revenueDelta: -320000, // Severe margin compression (-₹3.2L)
        expensesDelta: 0,
        trustDelta: -3,
        moraleDelta: -6,
        marketShareDelta: 1, // Retains volume, but at massive profit loss
        immediateImpact: "Vehicle price slashed to match the rival. Sales volume stabilizes, but gross profit per unit collapses.",
        delayedImpact: "Nexora's profit margins sink into near-zero territory, severely limiting future R&D and wage growth.",
        concept: "The Destructive Race to the Bottom",
        explanation:
          "Price wars commoditize products and destroy industry profitability. The player with the deepest pockets usually wins, while both companies suffer.",
        takeaway: "Never fight a price war against a rival with deeper pockets; compete on value rather than price.",
      },
      {
        id: "B",
        label: "Differentiate Through 5-Year Battery Warranty, Smart App Features & Concierge Care",
        summary: "Invest ₹5,00,000 into battery health AI diagnostics, extended warranty, and doorstep concierge service.",
        cashImpact: -500000,
        revenueDelta: 320000, // Customers happily pay premium for peace of mind
        expensesDelta: 100000,
        trustDelta: 16,
        moraleDelta: 10,
        marketShareDelta: 3,
        immediateImpact: "Capital deployment of ₹5,00,000 to launch industry-first battery longevity guarantees and OTA smart diagnostics.",
        delayedImpact: "Discerning customers reject Voltix's cheap build and pay Nexora's premium price for safety and reliability.",
        concept: "Value Differentiation & Non-Price Competition",
        explanation:
          "When you provide tangible benefits that matter to buyers (reliability, warranty, premium service), you escape commoditization and retain pricing power.",
        takeaway: "Build competitive moats through trust, quality, and service so customers don't make decisions on price alone.",
      },
      {
        id: "C",
        label: "Launch a Limited-Time Festive Trade-In Bundle With Free Helmets & Fast-Charger",
        summary: "Deploy a ₹2,50,000 tactical promotional bundle without lowering the core vehicle sticker price.",
        cashImpact: -250000,
        revenueDelta: 160000,
        expensesDelta: 0,
        trustDelta: 4,
        moraleDelta: 3,
        marketShareDelta: 1,
        immediateImpact: "Short-term promotional campaign creates excitement without compromising Nexora's published MSRP.",
        delayedImpact: "Helps clear inventory and blunt Voltix's promotional wave while keeping Nexora's brand prestige intact.",
        concept: "Tactical Value Bundling vs. Permanent Price Erosion",
        explanation:
          "Offering temporary value bundles protects baseline price integrity while giving price-sensitive buyers a compelling reason to purchase today.",
        takeaway: "Tactical bundles stimulate immediate demand without cheapening your brand's long-term market perception.",
      },
    ],
  },
];

export function evaluateFinalScore(metrics, decisions) {
  // Balanced scorecard out of 100 points:
  // 1. Financial Sustainability (30 pts): Cash health & sustained profit margin
  // 2. Customer Trust (25 pts): 0 - 100
  // 3. Employee Morale (25 pts): 0 - 100
  // 4. Strategic Growth & Market Share (20 pts): 0 - 100

  const profit = calculateProfit(metrics.revenue, metrics.expenses);
  const margin = calculateMargin(metrics.revenue, metrics.expenses);

  // Cash score: 10 pts if cash >= 35L, 20 pts if cash >= 45L
  let cashScore = 0;
  if (metrics.cash >= 4500000) cashScore = 15;
  else if (metrics.cash >= 3000000) cashScore = 12;
  else if (metrics.cash >= 1500000) cashScore = 8;
  else if (metrics.cash > 0) cashScore = 4;

  // Margin score: 15 pts if margin >= 20%
  let marginScore = 0;
  if (margin >= 25) marginScore = 15;
  else if (margin >= 18) marginScore = 12;
  else if (margin >= 10) marginScore = 8;
  else if (margin > 0) marginScore = 4;

  const financialScore = Math.min(30, cashScore + marginScore);
  const trustScore = Math.min(25, Math.round((metrics.customerTrust / 100) * 25));
  const moraleScore = Math.min(25, Math.round((metrics.employeeMorale / 100) * 25));
  const marketScore = Math.min(20, Math.round((metrics.marketShare / 30) * 20));

  const totalScore = Math.max(0, Math.min(100, financialScore + trustScore + moraleScore + marketScore));

  let grade = "B";
  let title = "Prudent Business Leader";
  let summary = "You balanced risk and growth with reasonable stability.";

  if (totalScore >= 90) {
    grade = "A+";
    title = "Visionary Chief Executive 🏆";
    summary = "Exceptional stewardship! You protected profit margins, built immense customer trust, and inspired an energized workforce.";
  } else if (totalScore >= 78) {
    grade = "A";
    title = "Strategic Business Executive ⭐";
    summary = "Outstanding leadership! You successfully guided Nexora through complex supply and competitive shocks with healthy long-term fundamentals.";
  } else if (totalScore >= 62) {
    grade = "B";
    title = "Balanced Operations Manager 📈";
    summary = "Solid performance. Nexora remained solvent and profitable, though some strategic decisions left opportunities on the table.";
  } else {
    grade = "C";
    title = "Turnaround Specialist in Training 🔄";
    summary = "A tough learning quarter. High burnout or heavy price wars took a toll on Nexora's long-term sustainability.";
  }

  return {
    totalScore,
    grade,
    title,
    summary,
    breakdown: {
      financial: financialScore,
      trust: trustScore,
      morale: moraleScore,
      market: marketScore,
    },
    profit,
    margin,
  };
}
