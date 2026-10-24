/**
 * SkillVerse Event-Driven Achievement Evaluation Engine
 *
 * Authoritative, pure function evaluation:
 * - Processes gameplay events
 * - Computes real metrics & statistics (revenue, profit, satisfaction, inventory)
 * - Evaluates badge eligibility against target thresholds
 * - Unlocks newly eligible badges idempotently
 * - Awards XP exactly once per badge
 * - Prevents duplicate event processing via event IDs
 */

import { BADGE_DEFINITIONS, getBadgeById } from "../data/badgeDefinitions.js";

export const DEFAULT_ACHIEVEMENTS = {
  unlockedBadges: [], // Array of { badgeId: string, unlockedAt: string }
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
    home: {
      stationsCompleted: 0,
      safetyStationsCompleted: 0,
    },
    school: {
      lessonsCompleted: 0,
      debugChallengesSolved: 0,
      subjectsCompleted: 0,
    },
    farm: {
      cropsHarvested: 0,
    },
    studio: {
      chaptersPenned: 0,
      questsConstructed: 0,
      waterNetworksDesigned: 0,
    },
  },
  businessState: {
    investments: [], // [ { id, name, category, cost, product, additionalProfitAttributed, recovered } ]
    activeAdCampaign: null, // { id, cost, product, incrementalProfitAttributed, completed }
    activePricingExperiment: null, // { productId, originalPrice, testPrice, profitImproved, avgSatisfaction, evaluated }
    upgradesPurchased: [],
  },
  processedEvents: [], // Array of string event IDs for deduplication
};

/**
 * Ensures achievement state has valid structure and all fields populated.
 */
export function normalizeAchievements(raw) {
  if (!raw || typeof raw !== "object") return JSON.parse(JSON.stringify(DEFAULT_ACHIEVEMENTS));

  return {
    unlockedBadges: Array.isArray(raw.unlockedBadges) ? [...raw.unlockedBadges] : [],
    stats: {
      market: {
        ...DEFAULT_ACHIEVEMENTS.stats.market,
        ...(raw.stats?.market || {}),
      },
      home: {
        ...DEFAULT_ACHIEVEMENTS.stats.home,
        ...(raw.stats?.home || {}),
      },
      school: {
        ...DEFAULT_ACHIEVEMENTS.stats.school,
        ...(raw.stats?.school || {}),
      },
      farm: {
        ...DEFAULT_ACHIEVEMENTS.stats.farm,
        ...(raw.stats?.farm || {}),
      },
      studio: {
        ...DEFAULT_ACHIEVEMENTS.stats.studio,
        ...(raw.stats?.studio || {}),
      },
    },
    businessState: {
      investments: Array.isArray(raw.businessState?.investments)
        ? [...raw.businessState.investments]
        : [],
      activeAdCampaign: raw.businessState?.activeAdCampaign || null,
      activePricingExperiment: raw.businessState?.activePricingExperiment || null,
      upgradesPurchased: Array.isArray(raw.businessState?.upgradesPurchased)
        ? [...raw.businessState.upgradesPurchased]
        : [],
    },
    processedEvents: Array.isArray(raw.processedEvents) ? [...raw.processedEvents] : [],
  };
}

/**
 * Evaluates all badge conditions against the current statistics.
 * Returns newly unlocked badges and calculates XP rewards.
 */
export function evaluateBadges(currentUnlocked, stats) {
  const unlockedSet = new Set(currentUnlocked.map((u) => u.badgeId));
  const newlyUnlocked = [];
  let xpToAdd = 0;

  for (const badge of BADGE_DEFINITIONS) {
    if (unlockedSet.has(badge.id)) continue;

    const worldStats = stats[badge.world] || {};
    const metricVal = Number(worldStats[badge.requirement.metric] || 0);

    if (metricVal >= badge.requirement.target) {
      const unlockRecord = {
        badgeId: badge.id,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push({
        ...badge,
        unlockedAt: unlockRecord.unlockedAt,
      });
      unlockedSet.add(badge.id);
      xpToAdd += badge.rewardXP;
    }
  }

  return {
    newlyUnlocked,
    xpToAdd,
  };
}

/**
 * Calculates current progress for a given badge.
 */
export function getBadgeProgress(badge, achievements) {
  const norm = normalizeAchievements(achievements);
  const unlockRecord = norm.unlockedBadges.find((u) => u.badgeId === badge.id);
  const isUnlocked = Boolean(unlockRecord);

  const worldStats = norm.stats[badge.world] || {};
  const current = Number(worldStats[badge.requirement.metric] || 0);
  const target = badge.requirement.target;

  let state = "locked";
  if (isUnlocked) {
    state = "unlocked";
  } else if (current > 0) {
    state = "in-progress";
  }

  const percentage = Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  return {
    badgeId: badge.id,
    current: Math.min(current, target),
    target,
    percentage,
    state,
    unlockedAt: unlockRecord ? unlockRecord.unlockedAt : null,
  };
}

/**
 * Main event processor.
 * Receives an event and returns the next achievements state,
 * list of newly unlocked badge objects, and total XP earned.
 */
export function processGameplayEvent(prevAchievements, event) {
  const state = normalizeAchievements(prevAchievements);

  if (!event || typeof event !== "object" || !event.type) {
    return { nextAchievements: state, newlyUnlocked: [], xpAwarded: 0 };
  }

  // Deduplication check: if eventId provided and already processed, ignore
  if (event.eventId) {
    if (state.processedEvents.includes(event.eventId)) {
      return { nextAchievements: state, newlyUnlocked: [], xpAwarded: 0 };
    }
    state.processedEvents.push(event.eventId);
    // Keep processedEvents bounded to the last 200 events
    if (state.processedEvents.length > 200) {
      state.processedEvents = state.processedEvents.slice(-200);
    }
  }

  const market = state.stats.market;
  const business = state.businessState;
  const payload = event.payload || {};

  switch (event.type) {
    // ─── 1. SALE_COMPLETED ──────────────────────────────────────────────
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

      // Check active investments for profit attribution
      if (business.investments.length > 0) {
        business.investments = business.investments.map((inv) => {
          if (inv.recovered) return inv;

          // Attribution based on product or general efficiency
          let attributableProfit = 0;
          if (inv.product && payload.items) {
            const matchingItems = payload.items.filter((it) => it.productId === inv.product);
            const qty = matchingItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
            attributableProfit = qty * (inv.unitBonus || 4);
          } else {
            // General business investment: attributes 15% of sale net profit
            attributableProfit = Math.round(netProfit * 0.2);
          }

          const newTotal = (inv.additionalProfitAttributed || 0) + attributableProfit;
          const recovered = newTotal >= inv.cost;

          if (recovered && !inv.recovered) {
            market.recoveredInvestments += 1;
          }

          return {
            ...inv,
            additionalProfitAttributed: newTotal,
            recovered,
          };
        });
      }

      // Check active advertising campaign
      if (business.activeAdCampaign && !business.activeAdCampaign.completed) {
        const ad = business.activeAdCampaign;
        let incrementalProfit = 0;
        if (ad.product && payload.items) {
          const match = payload.items.some((it) => it.productId === ad.product);
          if (match) {
            incrementalProfit = Math.round(netProfit * 0.6); // Attributable contribution margin
          }
        } else {
          // General ad campaign attributes portion of profit from extra customer traffic
          incrementalProfit = Math.round(netProfit * 0.4);
        }
        ad.incrementalProfitAttributed = (ad.incrementalProfitAttributed || 0) + incrementalProfit;
      }
      break;
    }

    // ─── 2. CUSTOMER_SERVED ─────────────────────────────────────────────
    case "CUSTOMER_SERVED": {
      market.customersServed += 1;
      const satisfaction = Number(payload.satisfaction ?? 100);
      if (satisfaction >= 90) {
        market.highSatisfactionCustomers += 1;
      }
      break;
    }

    // ─── 3. MARKET_DAY_COMPLETED ────────────────────────────────────────
    case "MARKET_DAY_COMPLETED": {
      const dayRevenue = Number(payload.dayRevenue || 0);
      const dayExpenses = Number(payload.dayExpenses || 0);
      const dayNetProfit = dayRevenue - dayExpenses;
      const shortages = Number(payload.inventoryShortages || payload.stockouts || 0);
      const waste = Number(payload.productWaste || 0);

      market.completedDays += 1;
      if (dayNetProfit > 0) {
        market.profitableDays += 1;
      }

      if (shortages === 0 && waste === 0) {
        market.cleanStockDays += 1;
      }

      // Evaluate active advertising campaign at day end
      if (business.activeAdCampaign && !business.activeAdCampaign.completed) {
        const ad = business.activeAdCampaign;
        const totalIncremental = Number(ad.incrementalProfitAttributed || 0);
        if (totalIncremental > ad.cost) {
          market.profitableAdCampaigns += 1;
        }
        ad.completed = true;
      }

      // Evaluate active pricing experiment at day end
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

    // ─── 4. INVENTORY_DAY_EVALUATED ─────────────────────────────────────
    case "INVENTORY_DAY_EVALUATED": {
      const shortages = Number(payload.inventoryShortages || 0);
      const waste = Number(payload.productWaste || 0);
      market.inventoryShortages += shortages;
      market.productWaste += waste;
      break;
    }

    // ─── 5. INVESTMENT_CREATED ──────────────────────────────────────────
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

    // ─── 6. INVESTMENT_RECOVERED (Direct event or manual trigger) ────────
    case "INVESTMENT_RECOVERED": {
      market.recoveredInvestments += 1;
      break;
    }

    // ─── 7. AD_CAMPAIGN_STARTED ─────────────────────────────────────────
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

    // ─── 8. AD_CAMPAIGN_COMPLETED ───────────────────────────────────────
    case "AD_CAMPAIGN_COMPLETED": {
      const cost = Number(payload.cost || business.activeAdCampaign?.cost || 50);
      const profit = Number(payload.incrementalProfit || business.activeAdCampaign?.incrementalProfitAttributed || 0);
      if (profit > cost) {
        market.profitableAdCampaigns += 1;
      }
      if (business.activeAdCampaign) {
        business.activeAdCampaign.completed = true;
      }
      break;
    }

    // ─── 9. PRICING_EXPERIMENT_STARTED ──────────────────────────────────
    case "PRICING_EXPERIMENT_STARTED": {
      business.activePricingExperiment = {
        productId: payload.productId,
        productName: payload.productName || payload.productId,
        originalPrice: Number(payload.originalPrice),
        testPrice: Number(payload.testPrice),
        profitImproved: Boolean(payload.profitImproved),
        avgSatisfaction: Number(payload.avgSatisfaction || 90),
        evaluated: false,
        timestamp: new Date().toISOString(),
      };
      break;
    }

    // ─── 10. PRICING_EXPERIMENT_COMPLETED ───────────────────────────────
    case "PRICING_EXPERIMENT_COMPLETED": {
      const profitImproved = Boolean(payload.profitImproved);
      const satisfaction = Number(payload.satisfaction ?? 85);
      if (profitImproved && satisfaction >= 80) {
        market.successfulPricingExperiments += 1;
      }
      if (business.activePricingExperiment) {
        business.activePricingExperiment.evaluated = true;
        business.activePricingExperiment.successful = profitImproved && satisfaction >= 80;
      }
      break;
    }

    // ─── 11. SHOP_UPGRADED ──────────────────────────────────────────────
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

    // ─── OTHER WORLDS ───────────────────────────────────────────────────
    case "HOME_STATION_COMPLETED": {
      state.stats.home.stationsCompleted += 1;
      if (payload.isSafety) {
        state.stats.home.safetyStationsCompleted += 1;
      }
      break;
    }

    case "SCHOOL_LESSON_COMPLETED": {
      state.stats.school.lessonsCompleted += 1;
      if (payload.isDebugging) {
        state.stats.school.debugChallengesSolved += 1;
      }
      if (payload.subject) {
        state.stats.school.subjectsCompleted += 1;
      }
      break;
    }

    case "FARM_CROP_HARVESTED": {
      const amount = Number(payload.amount || 1);
      state.stats.farm.cropsHarvested += amount;
      break;
    }

    case "STUDIO_CHAPTER_PENNED": {
      state.stats.studio.chaptersPenned += 1;
      break;
    }

    case "STUDIO_QUEST_CONSTRUCTED": {
      state.stats.studio.questsConstructed += 1;
      break;
    }

    case "STUDIO_WATER_DESIGNED": {
      state.stats.studio.waterNetworksDesigned += 1;
      break;
    }

    default:
      break;
  }

  // Evaluate newly unlocked badges
  const { newlyUnlocked, xpToAdd } = evaluateBadges(state.unlockedBadges, state.stats);

  if (newlyUnlocked.length > 0) {
    for (const badge of newlyUnlocked) {
      state.unlockedBadges.push({
        badgeId: badge.id,
        unlockedAt: badge.unlockedAt,
      });
    }
  }

  return {
    nextAchievements: state,
    newlyUnlocked,
    xpAwarded: xpToAdd,
  };
}
