/**
 * SkillVerse Centralized Badge & Achievement Definitions
 *
 * Each badge follows the authoritative specification:
 * - id: unique string identifier
 * - name: human-readable title
 * - description: clear requirement description
 * - world: "market" | "home" | "farm" | "school" | "studio" | "global"
 * - category: world-specific category ("market_management", "business_growth", etc.)
 * - icon: visual identifier / lucide icon name or emoji
 * - rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
 * - requirement: { metric: string, target: number }
 * - rewardXP: XP awarded once upon unlocking
 */

export const RARITY_CONFIG = {
  common: { label: "Common", color: "#64748b", border: "#cbd5e1", bg: "#f1f5f9" },
  uncommon: { label: "Uncommon", color: "#16a34a", border: "#86efac", bg: "#f0fdf4" },
  rare: { label: "Rare", color: "#0284c7", border: "#7dd3fc", bg: "#f0f9ff" },
  epic: { label: "Epic", color: "#9333ea", border: "#d8b4fe", bg: "#faf5ff" },
  legendary: { label: "Legendary", color: "#d97706", border: "#fde68a", bg: "#fffbeb" },
};

export const BADGE_DEFINITIONS = [
  // ─── MARKET MANAGEMENT BADGES ───────────────────────────────────────────
  {
    id: "market_first_sale",
    name: "First Sale",
    description: "Complete your first successful customer sale",
    world: "market",
    category: "market_management",
    icon: "shopping-bag",
    rarity: "common",
    requirement: {
      metric: "completedSales",
      target: 1,
    },
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
    requirement: {
      metric: "completedSales",
      target: 10,
    },
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
    requirement: {
      metric: "profitableDays",
      target: 3,
    },
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
    requirement: {
      metric: "highSatisfactionCustomers",
      target: 20,
    },
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
    requirement: {
      metric: "cleanStockDays",
      target: 3,
    },
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
    requirement: {
      metric: "completedDays",
      target: 10,
    },
    rewardXP: 70,
  },

  // ─── BUSINESS GROWTH BADGES ─────────────────────────────────────────────
  {
    id: "market_first_investment",
    name: "First Investment",
    description: "Complete the first genuine business investment",
    world: "market",
    category: "business_growth",
    icon: "coins",
    rarity: "common",
    requirement: {
      metric: "investmentsMade",
      target: 1,
    },
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
    requirement: {
      metric: "recoveredInvestments",
      target: 1,
    },
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
    requirement: {
      metric: "profitableAdCampaigns",
      target: 1,
    },
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
    requirement: {
      metric: "successfulPricingExperiments",
      target: 1,
    },
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
    requirement: {
      metric: "profitFundedUpgrades",
      target: 2,
    },
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
    requirement: {
      metric: "cumulativeNetProfit",
      target: 5000,
    },
    rewardXP: 100,
  },

  // ─── HOME WORLD BADGES ──────────────────────────────────────────────────
  {
    id: "home_first_chore",
    name: "House Helper",
    description: "Complete your first home station challenge",
    world: "home",
    category: "daily_living",
    icon: "home",
    rarity: "common",
    requirement: {
      metric: "stationsCompleted",
      target: 1,
    },
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
    requirement: {
      metric: "safetyStationsCompleted",
      target: 2,
    },
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
    requirement: {
      metric: "stationsCompleted",
      target: 6,
    },
    rewardXP: 60,
  },

  // ─── SCHOOL WORLD BADGES ────────────────────────────────────────────────
  {
    id: "school_first_lesson",
    name: "Curious Mind",
    description: "Complete your first school academic or coding activity",
    world: "school",
    category: "academics",
    icon: "book-open",
    rarity: "common",
    requirement: {
      metric: "lessonsCompleted",
      target: 1,
    },
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
    requirement: {
      metric: "debugChallengesSolved",
      target: 1,
    },
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
    requirement: {
      metric: "subjectsCompleted",
      target: 3,
    },
    rewardXP: 60,
  },

  // ─── FARM WORLD BADGES ──────────────────────────────────────────────────
  {
    id: "farm_first_harvest",
    name: "Green Thumb",
    description: "Successfully grow and harvest your first crop",
    world: "farm",
    category: "agriculture",
    icon: "sprout",
    rarity: "common",
    requirement: {
      metric: "cropsHarvested",
      target: 1,
    },
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
    requirement: {
      metric: "cropsHarvested",
      target: 10,
    },
    rewardXP: 50,
  },

  // ─── CREATOR STUDIO BADGES ──────────────────────────────────────────────
  {
    id: "studio_first_story",
    name: "Apprentice Author",
    description: "Penned your very first interactive story chapter in Story Studio",
    world: "studio",
    category: "creative_arts",
    icon: "feather",
    rarity: "common",
    requirement: {
      metric: "chaptersPenned",
      target: 1,
    },
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
    requirement: {
      metric: "questsConstructed",
      target: 1,
    },
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
    requirement: {
      metric: "waterNetworksDesigned",
      target: 1,
    },
    rewardXP: 50,
  },
];

// Helper maps & getters
export const BADGES_BY_ID = BADGE_DEFINITIONS.reduce((acc, b) => {
  acc[b.id] = b;
  return acc;
}, {});

export function getBadgeById(id) {
  return BADGES_BY_ID[id] || null;
}

export function getBadgesByWorld(world) {
  if (!world || world === "all") return BADGE_DEFINITIONS;
  return BADGE_DEFINITIONS.filter((b) => b.world === world);
}

export function getBadgesByCategory(world, category) {
  return BADGE_DEFINITIONS.filter(
    (b) => b.world === world && (!category || b.category === category)
  );
}
