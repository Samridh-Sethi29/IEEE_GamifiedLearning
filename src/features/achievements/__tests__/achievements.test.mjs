import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BADGE_DEFINITIONS,
  getBadgeById,
  getBadgesByWorld,
} from "../data/badgeDefinitions.js";
import {
  DEFAULT_ACHIEVEMENTS,
  normalizeAchievements,
  processGameplayEvent,
  getBadgeProgress,
} from "../engine/achievementEngine.js";

describe("Achievement & Badge System", () => {
  test("Badge definitions include all 12 Market badges with exact specifications", () => {
    assert.strictEqual(BADGE_DEFINITIONS.length >= 12, true);

    const firstSale = getBadgeById("market_first_sale");
    assert.ok(firstSale);
    assert.strictEqual(firstSale.name, "First Sale");
    assert.strictEqual(firstSale.world, "market");
    assert.strictEqual(firstSale.category, "market_management");
    assert.strictEqual(firstSale.rewardXP, 20);
    assert.strictEqual(firstSale.requirement.metric, "completedSales");
    assert.strictEqual(firstSale.requirement.target, 1);

    const youngEnt = getBadgeById("market_young_entrepreneur");
    assert.strictEqual(youngEnt.rewardXP, 40);
    assert.strictEqual(youngEnt.requirement.target, 10);

    const profitMaker = getBadgeById("market_profit_maker");
    assert.strictEqual(profitMaker.rewardXP, 50);
    assert.strictEqual(profitMaker.requirement.target, 3);

    const customerFav = getBadgeById("market_customer_favorite");
    assert.strictEqual(customerFav.rewardXP, 60);
    assert.strictEqual(customerFav.requirement.target, 20);

    const stockStrat = getBadgeById("market_stock_strategist");
    assert.strictEqual(stockStrat.rewardXP, 60);
    assert.strictEqual(stockStrat.requirement.target, 3);

    const veteran = getBadgeById("market_veteran");
    assert.strictEqual(veteran.rewardXP, 70);
    assert.strictEqual(veteran.requirement.target, 10);

    // Business growth badges
    const firstInv = getBadgeById("market_first_investment");
    assert.strictEqual(firstInv.rewardXP, 20);
    assert.strictEqual(firstInv.category, "business_growth");

    const smartInv = getBadgeById("market_smart_investor");
    assert.strictEqual(smartInv.rewardXP, 70);

    const marketingMaster = getBadgeById("market_marketing_master");
    assert.strictEqual(marketingMaster.rewardXP, 70);

    const pricingPro = getBadgeById("market_pricing_pro");
    assert.strictEqual(pricingPro.rewardXP, 60);

    const builder = getBadgeById("market_business_builder");
    assert.strictEqual(builder.rewardXP, 80);

    const mogul = getBadgeById("market_mogul");
    assert.strictEqual(mogul.rewardXP, 100);
    assert.strictEqual(mogul.requirement.target, 5000);
  });

  test("Player completes first sale: unlocks First Sale and awards 20 XP", () => {
    const initial = normalizeAchievements(null);
    const saleEvent = {
      type: "SALE_COMPLETED",
      eventId: "sale_001",
      payload: {
        billTotal: 25,
        cogs: 10,
        satisfaction: 95,
      },
    };

    const res = processGameplayEvent(initial, saleEvent);
    assert.strictEqual(res.newlyUnlocked.length, 1);
    assert.strictEqual(res.newlyUnlocked[0].id, "market_first_sale");
    assert.strictEqual(res.xpAwarded, 20);
    assert.strictEqual(res.nextAchievements.stats.market.completedSales, 1);
    assert.strictEqual(res.nextAchievements.stats.market.totalRevenue, 25);
    assert.strictEqual(res.nextAchievements.stats.market.cumulativeNetProfit, 15);
  });

  test("Duplicate event processing is prevented via eventId (idempotency)", () => {
    const initial = normalizeAchievements(null);
    const saleEvent = {
      type: "SALE_COMPLETED",
      eventId: "sale_001",
      payload: { billTotal: 25, cogs: 10 },
    };

    const res1 = processGameplayEvent(initial, saleEvent);
    assert.strictEqual(res1.newlyUnlocked.length, 1);
    assert.strictEqual(res1.xpAwarded, 20);

    // Replay identical event
    const res2 = processGameplayEvent(res1.nextAchievements, saleEvent);
    assert.strictEqual(res2.newlyUnlocked.length, 0);
    assert.strictEqual(res2.xpAwarded, 0);
    assert.strictEqual(res2.nextAchievements.stats.market.completedSales, 1);
  });

  test("Young Entrepreneur unlocks upon 10 sales with partial progress tracking", () => {
    let state = normalizeAchievements(null);
    const badge = getBadgeById("market_young_entrepreneur");

    for (let i = 1; i <= 9; i++) {
      const res = processGameplayEvent(state, {
        type: "SALE_COMPLETED",
        eventId: `sale_${i}`,
        payload: { billTotal: 20, cogs: 10 },
      });
      state = res.nextAchievements;
      const prog = getBadgeProgress(badge, state);
      assert.strictEqual(prog.current, i);
      assert.strictEqual(prog.state, "in-progress");
      assert.strictEqual(prog.percentage, i * 10);
    }

    // 10th sale unlocks Young Entrepreneur
    const res10 = processGameplayEvent(state, {
      type: "SALE_COMPLETED",
      eventId: "sale_10",
      payload: { billTotal: 20, cogs: 10 },
    });
    const unlockedIds = res10.newlyUnlocked.map((b) => b.id);
    assert.ok(unlockedIds.includes("market_young_entrepreneur"));
    assert.strictEqual(res10.xpAwarded, 40);

    const finalProg = getBadgeProgress(badge, res10.nextAchievements);
    assert.strictEqual(finalProg.state, "unlocked");
    assert.strictEqual(finalProg.percentage, 100);
  });

  test("Profitable Market Days count net profit, not just revenue", () => {
    let state = normalizeAchievements(null);

    // Day 1: Profitable (Revenue 200, Expenses 150 -> Net 50)
    let res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_1",
      payload: { dayRevenue: 200, dayExpenses: 150, stockouts: 0, waste: 0 },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.completedDays, 1);
    assert.strictEqual(state.stats.market.profitableDays, 1);

    // Day 2: Unprofitable (Revenue 100, Expenses 120 -> Net -20)
    res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_2",
      payload: { dayRevenue: 100, dayExpenses: 120, stockouts: 1, waste: 0 },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.completedDays, 2);
    assert.strictEqual(state.stats.market.profitableDays, 1); // Does not increment

    // Day 3: Profitable (Revenue 300, Expenses 100 -> Net 200)
    res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_3",
      payload: { dayRevenue: 300, dayExpenses: 100, stockouts: 0, waste: 0 },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.profitableDays, 2);

    // Day 4: Profitable -> Unlocks Profit Maker!
    res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_4",
      payload: { dayRevenue: 180, dayExpenses: 100, stockouts: 0, waste: 0 },
    });
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_profit_maker"));
  });

  test("Stock Strategist requires 3 days with NO stockouts and NO waste", () => {
    let state = normalizeAchievements(null);

    // Day with stockouts -> no clean day
    let res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_a",
      payload: { dayRevenue: 100, dayExpenses: 50, stockouts: 2, waste: 0 },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.cleanStockDays, 0);

    // 3 clean days
    for (let d = 1; d <= 3; d++) {
      res = processGameplayEvent(state, {
        type: "MARKET_DAY_COMPLETED",
        eventId: `clean_day_${d}`,
        payload: { dayRevenue: 100, dayExpenses: 50, stockouts: 0, waste: 0 },
      });
      state = res.nextAchievements;
    }

    assert.strictEqual(state.stats.market.cleanStockDays, 3);
    assert.ok(state.unlockedBadges.some((u) => u.badgeId === "market_stock_strategist"));
  });

  test("Smart Investor requires full recovery of investment cost through attributed profit", () => {
    let state = normalizeAchievements(null);

    // Create investment of ₹100
    let res = processGameplayEvent(state, {
      type: "INVESTMENT_CREATED",
      eventId: "inv_1",
      payload: {
        investmentId: "chiller_01",
        name: "Cooler Display",
        cost: 100,
        product: "water",
        unitBonus: 10,
      },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.investmentsMade, 1);
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_first_investment"));
    assert.strictEqual(res.newlyUnlocked.some((b) => b.id === "market_smart_investor"), false);

    // First 5 sales of water: 5 * 10 = ₹50 profit attributed (not recovered yet)
    for (let i = 1; i <= 5; i++) {
      res = processGameplayEvent(state, {
        type: "SALE_COMPLETED",
        eventId: `water_sale_${i}`,
        payload: {
          billTotal: 15,
          cogs: 5,
          items: [{ productId: "water", quantity: 1 }],
        },
      });
      state = res.nextAchievements;
    }
    assert.strictEqual(state.businessState.investments[0].additionalProfitAttributed, 50);
    assert.strictEqual(state.stats.market.recoveredInvestments, 0);
    assert.strictEqual(state.unlockedBadges.some((u) => u.badgeId === "market_smart_investor"), false);

    // Another 5 sales of water: 5 * 10 = additional ₹50 -> total ₹100 >= cost!
    for (let i = 6; i <= 10; i++) {
      res = processGameplayEvent(state, {
        type: "SALE_COMPLETED",
        eventId: `water_sale_${i}`,
        payload: {
          billTotal: 15,
          cogs: 5,
          items: [{ productId: "water", quantity: 1 }],
        },
      });
      state = res.nextAchievements;
    }

    assert.strictEqual(state.stats.market.recoveredInvestments, 1);
    assert.ok(state.unlockedBadges.some((u) => u.badgeId === "market_smart_investor"));
  });

  test("Marketing Master unlocks only when attributable incremental profit exceeds campaign cost", () => {
    let state = normalizeAchievements(null);

    // Start campaign costing ₹50
    let res = processGameplayEvent(state, {
      type: "AD_CAMPAIGN_STARTED",
      eventId: "ad_1",
      payload: { campaignId: "flyers", cost: 50, product: "juice" },
    });
    state = res.nextAchievements;

    // Sales during campaign generate ₹70 attributable incremental contribution profit
    for (let i = 1; i <= 7; i++) {
      res = processGameplayEvent(state, {
        type: "SALE_COMPLETED",
        eventId: `ad_sale_${i}`,
        payload: {
          billTotal: 25,
          cogs: 8,
          items: [{ productId: "juice", quantity: 1 }],
        },
      });
      state = res.nextAchievements;
    }

    // Complete market day to evaluate campaign
    res = processGameplayEvent(state, {
      type: "MARKET_DAY_COMPLETED",
      eventId: "day_with_ad",
      payload: { dayRevenue: 200, dayExpenses: 60, stockouts: 0, waste: 0 },
    });

    assert.strictEqual(res.nextAchievements.stats.market.profitableAdCampaigns, 1);
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_marketing_master"));
  });

  test("Pricing Pro unlocks upon successful price experiment with profit improvement & satisfaction >= 80%", () => {
    let state = normalizeAchievements(null);

    // Start pricing experiment
    let res = processGameplayEvent(state, {
      type: "PRICING_EXPERIMENT_STARTED",
      eventId: "price_exp_1",
      payload: { productId: "cookies", originalPrice: 20, testPrice: 24 },
    });
    state = res.nextAchievements;

    // Completed pricing experiment: profit improved and 88% satisfaction
    res = processGameplayEvent(state, {
      type: "PRICING_EXPERIMENT_COMPLETED",
      eventId: "price_exp_done",
      payload: { profitImproved: true, satisfaction: 88 },
    });

    assert.strictEqual(res.nextAchievements.stats.market.successfulPricingExperiments, 1);
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_pricing_pro"));
  });

  test("Business Builder requires 2 shop upgrades purchased from profits without debt", () => {
    let state = normalizeAchievements(null);

    // Upgrade 1
    let res = processGameplayEvent(state, {
      type: "SHOP_UPGRADED",
      eventId: "up_1",
      payload: { upgradeId: "newShelf", cost: 100, fundedByProfit: true, hasDebt: false },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.profitFundedUpgrades, 1);
    assert.strictEqual(state.unlockedBadges.some((u) => u.badgeId === "market_business_builder"), false);

    // Upgrade 2
    res = processGameplayEvent(state, {
      type: "SHOP_UPGRADED",
      eventId: "up_2",
      payload: { upgradeId: "largerSpace", cost: 200, fundedByProfit: true, hasDebt: false },
    });
    assert.strictEqual(res.nextAchievements.stats.market.profitFundedUpgrades, 2);
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_business_builder"));
  });

  test("Other worlds badges function cleanly without affecting market", () => {
    let state = normalizeAchievements(null);

    // Home chore
    let res = processGameplayEvent(state, {
      type: "HOME_STATION_COMPLETED",
      eventId: "home_1",
      payload: { isSafety: false },
    });
    assert.ok(res.newlyUnlocked.some((b) => b.id === "home_first_chore"));

    // School lesson
    res = processGameplayEvent(res.nextAchievements, {
      type: "SCHOOL_LESSON_COMPLETED",
      eventId: "school_1",
      payload: { isDebugging: true },
    });
    assert.ok(res.newlyUnlocked.some((b) => b.id === "school_first_lesson"));
    assert.ok(res.newlyUnlocked.some((b) => b.id === "school_python_debugger"));

    // Farm crop
    res = processGameplayEvent(res.nextAchievements, {
      type: "FARM_CROP_HARVESTED",
      eventId: "farm_1",
      payload: { amount: 1 },
    });
    assert.ok(res.newlyUnlocked.some((b) => b.id === "farm_first_harvest"));
  });

  test("Unfinished advertising campaigns do not earn badges", () => {
    let state = normalizeAchievements(null);

    // Start ad campaign
    let res = processGameplayEvent(state, {
      type: "AD_CAMPAIGN_STARTED",
      eventId: "ad_unfinished",
      payload: { campaignId: "radio", cost: 80 },
    });
    state = res.nextAchievements;

    // No sales or market day completed yet
    assert.strictEqual(state.stats.market.profitableAdCampaigns, 0);
    assert.strictEqual(
      state.unlockedBadges.some((b) => b.badgeId === "market_marketing_master"),
      false
    );
  });

  test("Market Mogul unlocks upon reaching cumulative ₹5,000 net profit", () => {
    let state = normalizeAchievements(null);

    // Earn ₹4,990 net profit
    let res = processGameplayEvent(state, {
      type: "SALE_COMPLETED",
      eventId: "huge_sale_1",
      payload: { billTotal: 5990, cogs: 1000 },
    });
    state = res.nextAchievements;
    assert.strictEqual(state.stats.market.cumulativeNetProfit, 4990);
    assert.strictEqual(
      state.unlockedBadges.some((b) => b.badgeId === "market_mogul"),
      false
    );

    // Another sale earning ₹20 net profit -> total ₹5,010 >= 5000
    res = processGameplayEvent(state, {
      type: "SALE_COMPLETED",
      eventId: "huge_sale_2",
      payload: { billTotal: 30, cogs: 10 },
    });
    assert.strictEqual(res.nextAchievements.stats.market.cumulativeNetProfit, 5010);
    assert.ok(res.newlyUnlocked.some((b) => b.id === "market_mogul"));
    assert.strictEqual(res.xpAwarded, 100);
  });

  test("Customer Favorite unlocks upon serving 20 customers with >=90% satisfaction", () => {
    let state = normalizeAchievements(null);

    // Serve 19 customers with 95% satisfaction
    for (let i = 1; i <= 19; i++) {
      const res = processGameplayEvent(state, {
        type: "CUSTOMER_SERVED",
        eventId: `cust_high_sat_${i}`,
        payload: { satisfaction: 95 },
      });
      state = res.nextAchievements;
    }
    assert.strictEqual(state.stats.market.highSatisfactionCustomers, 19);
    assert.strictEqual(
      state.unlockedBadges.some((b) => b.badgeId === "market_customer_favorite"),
      false
    );

    // 20th customer served with 92% satisfaction
    const res20 = processGameplayEvent(state, {
      type: "CUSTOMER_SERVED",
      eventId: "cust_high_sat_20",
      payload: { satisfaction: 92 },
    });
    assert.strictEqual(res20.nextAchievements.stats.market.highSatisfactionCustomers, 20);
    assert.ok(res20.newlyUnlocked.some((b) => b.id === "market_customer_favorite"));
  });

  test("Simultaneous duplicate events do not duplicate rewards or unlocked badges", () => {
    let state = normalizeAchievements(null);

    const event = {
      type: "SALE_COMPLETED",
      eventId: "unique_sale_99",
      payload: { billTotal: 25, cogs: 10 },
    };

    // First call
    const res1 = processGameplayEvent(state, event);
    assert.strictEqual(res1.newlyUnlocked.length, 1);
    assert.strictEqual(res1.xpAwarded, 20);

    // Second call with same state & event (simulating race condition / replay)
    const res2 = processGameplayEvent(res1.nextAchievements, event);
    assert.strictEqual(res2.newlyUnlocked.length, 0);
    assert.strictEqual(res2.xpAwarded, 0);

    // Ensure badge is only recorded once in unlockedBadges
    const unlocks = res2.nextAchievements.unlockedBadges.filter(
      (u) => u.badgeId === "market_first_sale"
    );
    assert.strictEqual(unlocks.length, 1);
  });

  test("Existing user records with null or legacy fields load with proper defaults", () => {
    const legacyState = {
      level: 2,
      xp: 150,
      coins: 300,
      badges: ["wealth_builder"],
      // No achievements field at all
    };

    const normalized = normalizeAchievements(legacyState.achievements);
    assert.ok(normalized.stats);
    assert.ok(normalized.stats.market);
    assert.strictEqual(normalized.stats.market.completedSales, 0);
    assert.strictEqual(normalized.stats.market.cumulativeNetProfit, 0);
    assert.deepStrictEqual(normalized.unlockedBadges, []);
  });
});
