/**
 * Server-side Achievement Service (CommonJS)
 * Authoritative badge evaluation and statistics tracking in MongoDB.
 */

const BADGE_DEFINITIONS = [
  // ─── MARKET MANAGEMENT ──────────────────────────────────────────
  {
    id: "market_first_sale",
    name: "First Sale",
    description: "Complete your first successful customer sale",
    world: "market",
    category: "market_management",
    icon: "shopping-bag",
    rarity: "common",
    requirement: { metric: "completedSales", target: 1 },
    rewardXP: 20,
  },
  {
    id: "market_young_entrepreneur",
    name: "Young Entrepreneur",
    description: "Complete 10 successful customer sales",
    world: "market",
    category: "market_management",
    icon: "briefcase",
    rarity: "uncommon",
    requirement: { metric: "completedSales", target: 10 },
    rewardXP: 40,
  },
  {
    id: "market_profit_maker",
    name: "Profit Maker",
    description: "Complete 3 profitable market days with positive net earnings",
    world: "market",
    category: "market_management",
    icon: "trending-up",
    rarity: "rare",
    requirement: { metric: "profitableDays", target: 3 },
    rewardXP: 50,
  },
  {
    id: "market_customer_favorite",
    name: "Customer Favorite",
    description: "Serve at least 20 customers while maintaining ≥90% satisfaction",
    world: "market",
    category: "market_management",
    icon: "heart",
    rarity: "rare",
    requirement: { metric: "highSatisfactionCustomers", target: 20 },
    rewardXP: 60,
  },
  {
    id: "market_stock_strategist",
    name: "Stock Strategist",
    description: "Complete 3 market days with no high-demand stockouts or perishable waste",
    world: "market",
    category: "market_management",
    icon: "package-check",
    rarity: "rare",
    requirement: { metric: "cleanStockDays", target: 3 },
    rewardXP: 60,
  },
  {
    id: "market_veteran",
    name: "Market Veteran",
    description: "Complete 10 market days successfully",
    world: "market",
    category: "market_management",
    icon: "award",
    rarity: "epic",
    requirement: { metric: "completedDays", target: 10 },
    rewardXP: 70,
  },

  // ─── BUSINESS GROWTH ────────────────────────────────────────────
  {
    id: "market_first_investment",
    name: "First Investment",
    description: "Complete the first genuine business investment",
    world: "market",
    category: "business_growth",
    icon: "coins",
    rarity: "common",
    requirement: { metric: "investmentsMade", target: 1 },
    rewardXP: 20,
  },
  {
    id: "market_smart_investor",
    name: "Smart Investor",
    description: "Recover an investment's cost through measurable additional profit",
    world: "market",
    category: "business_growth",
    icon: "line-chart",
    rarity: "epic",
    requirement: { metric: "recoveredInvestments", target: 1 },
    rewardXP: 70,
  },
  {
    id: "market_marketing_master",
    name: "Marketing Master",
    description: "Run an advertising campaign whose attributable incremental profit exceeds its cost",
    world: "market",
    category: "business_growth",
    icon: "megaphone",
    rarity: "epic",
    requirement: { metric: "profitableAdCampaigns", target: 1 },
    rewardXP: 70,
  },
  {
    id: "market_pricing_pro",
    name: "Pricing Pro",
    description: "Successfully improve profit through a price adjustment while maintaining ≥80% satisfaction",
    world: "market",
    category: "business_growth",
    icon: "tag",
    rarity: "rare",
    requirement: { metric: "successfulPricingExperiments", target: 1 },
    rewardXP: 60,
  },
  {
    id: "market_business_builder",
    name: "Business Builder",
    description: "Purchase 2 shop upgrades using accumulated business profits without debt",
    world: "market",
    category: "business_growth",
    icon: "store",
    rarity: "epic",
    requirement: { metric: "profitFundedUpgrades", target: 2 },
    rewardXP: 80,
  },
  {
    id: "market_mogul",
    name: "Market Mogul",
    description: "Earn a cumulative ₹5,000 in positive net business profit",
    world: "market",
    category: "business_growth",
    icon: "crown",
    rarity: "legendary",
    requirement: { metric: "cumulativeNetProfit", target: 5000 },
    rewardXP: 100,
  },

  // ─── HOME ───────────────────────────────────────────────────────
  {
    id: "home_first_chore",
    name: "House Helper",
    description: "Complete your first home station challenge",
    world: "home",
    category: "daily_living",
    icon: "home",
    rarity: "common",
    requirement: { metric: "stationsCompleted", target: 1 },
    rewardXP: 20,
  },
  {
    id: "home_safety_master",
    name: "Safety Champion",
    description: "Master household electrical and fire safety stations",
    world: "home",
    category: "daily_living",
    icon: "shield-check",
    rarity: "uncommon",
    requirement: { metric: "safetyStationsCompleted", target: 2 },
    rewardXP: 40,
  },
  {
    id: "home_master",
    name: "Master of the House",
    description: "Complete all home stations in a single day",
    world: "home",
    category: "daily_living",
    icon: "sparkles",
    rarity: "rare",
    requirement: { metric: "stationsCompleted", target: 6 },
    rewardXP: 60,
  },

  // ─── SCHOOL ─────────────────────────────────────────────────────
  {
    id: "school_first_lesson",
    name: "Curious Mind",
    description: "Complete your first school academic or coding activity",
    world: "school",
    category: "academics",
    icon: "book-open",
    rarity: "common",
    requirement: { metric: "lessonsCompleted", target: 1 },
    rewardXP: 20,
  },
  {
    id: "school_python_debugger",
    name: "Code Fixer",
    description: "Successfully identify and fix a bug in the computer lab",
    world: "school",
    category: "academics",
    icon: "terminal",
    rarity: "uncommon",
    requirement: { metric: "debugChallengesSolved", target: 1 },
    rewardXP: 40,
  },
  {
    id: "school_honor_roll",
    name: "Honor Roll",
    description: "Complete academic challenges across English, Math, and Computer Lab",
    world: "school",
    category: "academics",
    icon: "graduation-cap",
    rarity: "rare",
    requirement: { metric: "subjectsCompleted", target: 3 },
    rewardXP: 60,
  },

  // ─── FARM ───────────────────────────────────────────────────────
  {
    id: "farm_first_harvest",
    name: "Green Thumb",
    description: "Successfully grow and harvest your first crop",
    world: "farm",
    category: "agriculture",
    icon: "sprout",
    rarity: "common",
    requirement: { metric: "cropsHarvested", target: 1 },
    rewardXP: 20,
  },
  {
    id: "farm_master_harvester",
    name: "Master Harvester",
    description: "Harvest 10 healthy crops across the farm plots",
    world: "farm",
    category: "agriculture",
    icon: "wheat",
    rarity: "rare",
    requirement: { metric: "cropsHarvested", target: 10 },
    rewardXP: 50,
  },

  // ─── CREATOR STUDIO ─────────────────────────────────────────────
  {
    id: "studio_first_story",
    name: "Apprentice Author",
    description: "Penned your very first interactive story chapter in Story Studio",
    world: "studio",
    category: "creative_arts",
    icon: "feather",
    rarity: "common",
    requirement: { metric: "chaptersPenned", target: 1 },
    rewardXP: 20,
  },
  {
    id: "studio_story_master",
    name: "Story Master",
    description: "Construct deep, branching narrative quests in Story Studio",
    world: "studio",
    category: "creative_arts",
    icon: "book-marked",
    rarity: "rare",
    requirement: { metric: "questsConstructed", target: 1 },
    rewardXP: 60,
  },
  {
    id: "studio_hydrologist",
    name: "Village Hydrologist",
    description: "Design and verify a functional clean water network in World Builder",
    world: "studio",
    category: "creative_arts",
    icon: "droplet",
    rarity: "rare",
    requirement: { metric: "waterNetworksDesigned", target: 1 },
    rewardXP: 50,
  },
];

const DEFAULT_ACHIEVEMENTS = {
  unlockedBadges: [],
  stats: {
    market: {
      completedSales: 0,
      customersServed: 0,
      completedDays: 0,
      profitableDays: 0,
      cumulativeNetProfit: 0,
      profitableAdCampaigns: 0,
      recoveredInvestments: 0,
      successfulPricingExperiments: 0,
      profitFundedUpgrades: 0,
      cleanStockDays: 0,
      highSatisfactionCustomers: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      inventoryShortages: 0,
      productWaste: 0,
      investmentsMade: 0,
    },
    home: { stationsCompleted: 0, safetyStationsCompleted: 0 },
    school: { lessonsCompleted: 0, debugChallengesSolved: 0, subjectsCompleted: 0 },
    farm: { cropsHarvested: 0 },
    studio: { chaptersPenned: 0, questsConstructed: 0, waterNetworksDesigned: 0 },
  },
  businessState: {
    investments: [],
    activeAdCampaign: null,
    activePricingExperiment: null,
    upgradesPurchased: [],
  },
  processedEvents: [],
};

function normalizeAchievements(raw) {
  if (!raw || typeof raw !== "object") return JSON.parse(JSON.stringify(DEFAULT_ACHIEVEMENTS));

  return {
    unlockedBadges: Array.isArray(raw.unlockedBadges) ? [...raw.unlockedBadges] : [],
    stats: {
      market: { ...DEFAULT_ACHIEVEMENTS.stats.market, ...(raw.stats?.market || {}) },
      home: { ...DEFAULT_ACHIEVEMENTS.stats.home, ...(raw.stats?.home || {}) },
      school: { ...DEFAULT_ACHIEVEMENTS.stats.school, ...(raw.stats?.school || {}) },
      farm: { ...DEFAULT_ACHIEVEMENTS.stats.farm, ...(raw.stats?.farm || {}) },
      studio: { ...DEFAULT_ACHIEVEMENTS.stats.studio, ...(raw.stats?.studio || {}) },
    },
    businessState: {
      investments: Array.isArray(raw.businessState?.investments) ? [...raw.businessState.investments] : [],
      activeAdCampaign: raw.businessState?.activeAdCampaign || null,
      activePricingExperiment: raw.businessState?.activePricingExperiment || null,
      upgradesPurchased: Array.isArray(raw.businessState?.upgradesPurchased) ? [...raw.businessState.upgradesPurchased] : [],
    },
    processedEvents: Array.isArray(raw.processedEvents) ? [...raw.processedEvents] : [],
  };
}

function processGameplayEvent(prevAchievements, event) {
  const state = normalizeAchievements(prevAchievements);

  if (!event || typeof event !== "object" || !event.type) {
    return { nextAchievements: state, newlyUnlocked: [], xpAwarded: 0 };
  }

  // Deduplication check
  if (event.eventId) {
    if (state.processedEvents.includes(event.eventId)) {
      return { nextAchievements: state, newlyUnlocked: [], xpAwarded: 0 };
    }
    state.processedEvents.push(event.eventId);
    if (state.processedEvents.length > 200) {
      state.processedEvents = state.processedEvents.slice(-200);
    }
  }

  const market = state.stats.market;
  const business = state.businessState;
  const payload = event.payload || {};

  switch (event.type) {
    case "SALE_COMPLETED": {
      const revenue = Number(payload.revenue || payload.billTotal || 0);
      const cogs = Number(payload.cogs || payload.cost || 0);
      const netProfit = Math.max(0, revenue - cogs);
      const satisfaction = Number(payload.satisfaction ?? 100);

      market.completedSales += 1;
      market.totalRevenue += revenue;
      market.totalExpenses += cogs;
      market.cumulativeNetProfit += netProfit;

      if (satisfaction >= 90) {
        market.highSatisfactionCustomers += 1;
      }

      if (business.investments.length > 0) {
        business.investments = business.investments.map((inv) => {
          if (inv.recovered) return inv;
          let attributableProfit = 0;
          if (inv.product && payload.items) {
            const matchingItems = payload.items.filter((it) => it.productId === inv.product);
            const qty = matchingItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
            attributableProfit = qty * (inv.unitBonus || 4);
          } else {
            attributableProfit = Math.round(netProfit * 0.2);
          }

          const newTotal = (inv.additionalProfitAttributed || 0) + attributableProfit;
          const recovered = newTotal >= inv.cost;
          if (recovered && !inv.recovered) {
            market.recoveredInvestments += 1;
          }
          return { ...inv, additionalProfitAttributed: newTotal, recovered };
        });
      }

      if (business.activeAdCampaign && !business.activeAdCampaign.completed) {
        const ad = business.activeAdCampaign;
        let incrementalProfit = 0;
        if (ad.product && payload.items) {
          const match = payload.items.some((it) => it.productId === ad.product);
          if (match) incrementalProfit = Math.round(netProfit * 0.6);
        } else {
          incrementalProfit = Math.round(netProfit * 0.4);
        }
        ad.incrementalProfitAttributed = (ad.incrementalProfitAttributed || 0) + incrementalProfit;
      }
      break;
    }

    case "CUSTOMER_SERVED": {
      market.customersServed += 1;
      const satisfaction = Number(payload.satisfaction ?? 100);
      if (satisfaction >= 90) market.highSatisfactionCustomers += 1;
      break;
    }

    case "MARKET_DAY_COMPLETED": {
      const dayRevenue = Number(payload.dayRevenue || 0);
      const dayExpenses = Number(payload.dayExpenses || 0);
      const dayNetProfit = dayRevenue - dayExpenses;
      const shortages = Number(payload.inventoryShortages || payload.stockouts || 0);
      const waste = Number(payload.productWaste || 0);

      market.completedDays += 1;
      if (dayNetProfit > 0) market.profitableDays += 1;
      if (shortages === 0 && waste === 0) market.cleanStockDays += 1;

      if (business.activeAdCampaign && !business.activeAdCampaign.completed) {
        const ad = business.activeAdCampaign;
        if ((ad.incrementalProfitAttributed || 0) > ad.cost) {
          market.profitableAdCampaigns += 1;
        }
        ad.completed = true;
      }

      if (business.activePricingExperiment && !business.activePricingExperiment.evaluated) {
        const exp = business.activePricingExperiment;
        const profitImproved = Boolean(payload.pricingProfitImproved ?? exp.profitImproved ?? true);
        const satisfaction = Number(payload.avgSatisfaction ?? exp.avgSatisfaction ?? 90);
        if (profitImproved && satisfaction >= 80) {
          market.successfulPricingExperiments += 1;
          exp.successful = true;
        }
        exp.evaluated = true;
      }
      break;
    }

    case "INVESTMENT_CREATED": {
      const inv = {
        id: payload.investmentId || `inv_${Date.now()}`,
        name: payload.name || "Business Equipment",
        category: payload.category || "equipment",
        cost: Number(payload.cost || 100),
        product: payload.product || null,
        unitBonus: Number(payload.unitBonus || 4),
        additionalProfitAttributed: 0,
        recovered: false,
        timestamp: new Date().toISOString(),
      };
      business.investments.push(inv);
      market.investmentsMade += 1;
      break;
    }

    case "AD_CAMPAIGN_STARTED": {
      business.activeAdCampaign = {
        id: payload.campaignId || `ad_${Date.now()}`,
        name: payload.name || "Village Flyer Campaign",
        cost: Number(payload.cost || 50),
        product: payload.product || null,
        incrementalProfitAttributed: 0,
        completed: false,
        timestamp: new Date().toISOString(),
      };
      break;
    }

    case "SHOP_UPGRADED": {
      const fundedByProfit = Boolean(payload.fundedByProfit ?? true);
      const hasDebt = Boolean(payload.hasDebt ?? false);
      if (fundedByProfit && !hasDebt) {
        market.profitFundedUpgrades += 1;
        business.upgradesPurchased.push({
          id: payload.upgradeId,
          cost: Number(payload.cost || 0),
          timestamp: new Date().toISOString(),
        });
      }
      break;
    }

    case "HOME_STATION_COMPLETED": {
      state.stats.home.stationsCompleted += 1;
      if (payload.isSafety) state.stats.home.safetyStationsCompleted += 1;
      break;
    }

    case "SCHOOL_LESSON_COMPLETED": {
      state.stats.school.lessonsCompleted += 1;
      if (payload.isDebugging) state.stats.school.debugChallengesSolved += 1;
      if (payload.subject) state.stats.school.subjectsCompleted += 1;
      break;
    }

    case "FARM_CROP_HARVESTED": {
      state.stats.farm.cropsHarvested += Number(payload.amount || 1);
      break;
    }

    default:
      break;
  }

  // Evaluate newly unlocked badges
  const unlockedSet = new Set(state.unlockedBadges.map((u) => u.badgeId));
  const newlyUnlocked = [];
  let xpAwarded = 0;

  for (const badge of BADGE_DEFINITIONS) {
    if (unlockedSet.has(badge.id)) continue;
    const worldStats = state.stats[badge.world] || {};
    const val = Number(worldStats[badge.requirement.metric] || 0);

    if (val >= badge.requirement.target) {
      const record = { badgeId: badge.id, unlockedAt: new Date().toISOString() };
      state.unlockedBadges.push(record);
      unlockedSet.add(badge.id);
      newlyUnlocked.push({ ...badge, unlockedAt: record.unlockedAt });
      xpAwarded += badge.rewardXP;
    }
  }

  return { nextAchievements: state, newlyUnlocked, xpAwarded };
}

module.exports = {
  BADGE_DEFINITIONS,
  DEFAULT_ACHIEVEMENTS,
  normalizeAchievements,
  processGameplayEvent,
};
