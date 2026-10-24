import React, { useState } from "react";
import { X, Check, Lock, TrendingUp, Megaphone, Tag, Store, Coins, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import "../market-ui.css";

const UPGRADES = [
  { id: "newShelf", title: "Expanded Shelves", description: "+4 items on all shelves for fewer stockouts", cost: 100, icon: "🏪" },
  { id: "largerSpace", title: "Deep Storage Facility", description: "Doubles stockroom capacity for bulk restocking", cost: 200, icon: "📦" },
  { id: "moreCustomers", title: "Customer Magnet Entrance", description: "Improves foot traffic and customer arrival frequency", cost: 150, icon: "👥" },
];

const INVESTMENTS = [
  {
    id: "refrigeration_display",
    title: "Energy-Smart Chiller Unit",
    category: "Equipment",
    cost: 100,
    unitBonus: 5,
    product: "water",
    description: "Keep beverages crisp. Generates ₹5 attributable incremental profit on each beverage sold until cost is fully recovered.",
    icon: "❄️",
  },
  {
    id: "organic_produce_stand",
    title: "Eco-Friendly Wooden Shelving",
    category: "Fixtures",
    cost: 150,
    unitBonus: 6,
    product: "juice",
    description: "Attractive rustic presentation that increases customer basket value and attributes ₹6 bonus profit per specialty juice.",
    icon: "🪵",
  },
];

const AD_CAMPAIGNS = [
  {
    id: "flyer_blast",
    title: "Village Flyer & Poster Campaign",
    cost: 40,
    expectedSalesBoost: "3 - 5 customers",
    description: "Distribute colorful flyers across SkillVerse village. Generates attributable incremental contribution margins from new visitors.",
    icon: "📢",
  },
  {
    id: "community_radio",
    title: "Local SkillVerse Radio Jingle",
    cost: 80,
    expectedSalesBoost: "6 - 8 customers",
    description: "Broadcast store deals across town. High-yield campaign targeting afternoon shoppers.",
    icon: "📻",
  },
];

const PRICING_ITEMS = [
  { id: "chips", name: "Potato Chips", currentPrice: 20, cogs: 12, recommendedPrice: 24, expectedSatisfaction: 88 },
  { id: "juice", name: "Orange Juice", currentPrice: 25, cogs: 16, recommendedPrice: 29, expectedSatisfaction: 85 },
  { id: "cookies", name: "Choco Cookies", currentPrice: 25, cogs: 15, recommendedPrice: 28, expectedSatisfaction: 90 },
];

export default function BusinessGrowthModal({
  isOpen,
  onClose,
  coins,
  onSpendCoins,
  achievements,
  onRecordEvent,
  upgrades = { newShelf: false, largerSpace: false, moreCustomers: false },
}) {
  const [activeTab, setActiveTab] = useState("upgrades"); // "upgrades" | "investments" | "advertising" | "pricing"
  const [feedback, setFeedback] = useState("");
  const [selectedProductPricing, setSelectedProductPricing] = useState(PRICING_ITEMS[0]);
  const [testPriceInput, setTestPriceInput] = useState(PRICING_ITEMS[0].recommendedPrice);

  if (!isOpen) return null;

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // 1. UPGRADE HANDLER
  const handleBuyUpgrade = (upgrade) => {
    if (upgrades[upgrade.id]) {
      showFeedback("You already purchased this upgrade!");
      return;
    }
    if (coins < upgrade.cost) {
      showFeedback(`Need ₹${upgrade.cost - coins} more coins from sales!`);
      return;
    }

    const spent = onSpendCoins(upgrade.cost);
    if (!spent) return;

    onRecordEvent({
      type: "SHOP_UPGRADED",
      payload: {
        upgradeId: upgrade.id,
        cost: upgrade.cost,
        fundedByProfit: true,
        hasDebt: false,
      },
    });

    showFeedback(`Successfully upgraded: ${upgrade.title}!`);
  };

  // 2. INVESTMENT HANDLER
  const investmentsState = achievements?.businessState?.investments || [];
  const handleMakeInvestment = (inv) => {
    const existing = investmentsState.find((i) => i.id === inv.id);
    if (existing) {
      showFeedback("Investment is already active and generating returns!");
      return;
    }
    if (coins < inv.cost) {
      showFeedback(`Need ₹${inv.cost - coins} more coins to invest!`);
      return;
    }

    const spent = onSpendCoins(inv.cost);
    if (!spent) return;

    onRecordEvent({
      type: "INVESTMENT_CREATED",
      payload: {
        investmentId: inv.id,
        name: inv.title,
        category: inv.category,
        cost: inv.cost,
        product: inv.product,
        unitBonus: inv.unitBonus,
      },
    });

    showFeedback(`Invested ₹${inv.cost} in ${inv.title}! Track profit recovery from sales.`);
  };

  // 3. ADVERTISING HANDLER
  const activeAd = achievements?.businessState?.activeAdCampaign;
  const handleLaunchCampaign = (camp) => {
    if (activeAd && !activeAd.completed) {
      showFeedback("An advertising campaign is already active today!");
      return;
    }
    if (coins < camp.cost) {
      showFeedback(`Need ₹${camp.cost - coins} more coins for this campaign!`);
      return;
    }

    const spent = onSpendCoins(camp.cost);
    if (!spent) return;

    onRecordEvent({
      type: "AD_CAMPAIGN_STARTED",
      payload: {
        campaignId: camp.id,
        name: camp.title,
        cost: camp.cost,
        product: null,
      },
    });

    showFeedback(`Launched ${camp.title}! Incremental contribution margin will be evaluated today.`);
  };

  // 4. PRICING EXPERIMENT HANDLER
  const handleRunPricingExperiment = () => {
    const p = selectedProductPricing;
    const testPrice = Number(testPriceInput);
    if (isNaN(testPrice) || testPrice <= p.cogs) {
      showFeedback("Test price must be higher than wholesale cost!");
      return;
    }

    const oldMargin = p.currentPrice - p.cogs;
    const newMargin = testPrice - p.cogs;
    const profitImproved = newMargin > oldMargin;
    const satisfaction = testPrice > p.currentPrice + 5 ? 75 : testPrice > p.currentPrice ? 86 : 95;

    onRecordEvent({
      type: "PRICING_EXPERIMENT_STARTED",
      payload: {
        productId: p.id,
        productName: p.name,
        originalPrice: p.currentPrice,
        testPrice,
        profitImproved,
        avgSatisfaction: satisfaction,
      },
    });

    onRecordEvent({
      type: "PRICING_EXPERIMENT_COMPLETED",
      payload: {
        profitImproved,
        satisfaction,
      },
    });

    if (profitImproved && satisfaction >= 80) {
      showFeedback(`Pricing Experiment Successful! Profit increased with ${satisfaction}% satisfaction.`);
    } else {
      showFeedback(`Experiment concluded: satisfaction dropped to ${satisfaction}%. Adjust price closer to market value.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-sm select-none animate-fade-in">
      <div
        style={{ maxWidth: 740 }}
        className="relative w-full rounded-[2rem] border-4 border-amber-300 bg-gradient-to-b from-amber-50 to-orange-50/50 shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border-2 border-amber-300 hover:bg-rose-50 flex items-center justify-center text-slate-500 shadow-sm transition-transform active:scale-90"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-sm">
            💼
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-900 leading-tight">
              Business Growth & Strategy Lab
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              Manage shop upgrades, capital investments, advertising campaigns, and price experiments.
            </p>
          </div>
        </div>

        {/* Coin Balance Pill */}
        <div className="flex items-center justify-between bg-white/80 border-2 border-amber-200 rounded-2xl px-4 py-2.5 mb-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-black text-lg">🪙</span>
            <span className="text-xs font-bold text-slate-600">Available Business Funds:</span>
            <span className="font-black text-base text-amber-600">₹{coins}</span>
          </div>
          <div className="text-[11px] font-extrabold text-slate-500">
            Net Business Profit: <span className="text-emerald-700 font-black">₹{achievements?.stats?.market?.cumulativeNetProfit || 0}</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b-2 border-amber-200 pb-3 mb-5">
          <button
            onClick={() => setActiveTab("upgrades")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "upgrades"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            <Store className="w-4 h-4" /> Shop Upgrades
          </button>

          <button
            onClick={() => setActiveTab("investments")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "investments"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Capital Investments
          </button>

          <button
            onClick={() => setActiveTab("advertising")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "advertising"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            <Megaphone className="w-4 h-4" /> Advertising
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "pricing"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            <Tag className="w-4 h-4" /> Pricing Lab
          </button>
        </div>

        {/* TAB 1: UPGRADES */}
        {activeTab === "upgrades" && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-600 mb-2">
              Purchase physical upgrades using accumulated profits without taking on debt. Unlocks the <b>Business Builder</b> achievement (2 upgrades).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {UPGRADES.map((u) => {
                const owned = Boolean(upgrades[u.id]);
                const canAfford = coins >= u.cost;
                return (
                  <div
                    key={u.id}
                    className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                      owned
                        ? "bg-emerald-50/60 border-emerald-300"
                        : "bg-white border-amber-200 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-2">{u.icon}</div>
                      <h4 className="font-black text-sm text-slate-900">{u.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{u.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-black text-xs text-amber-700">₹{u.cost}</span>
                      {owned ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(u)}
                          disabled={!canAfford}
                          className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all ${
                            canAfford
                              ? "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-sm active:scale-95"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INVESTMENTS */}
        {activeTab === "investments" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-600">
              Invest in equipment that boosts product margins. Smart Investor requires recovering the entire cost through <b>attributable additional profit</b>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {INVESTMENTS.map((inv) => {
                const existing = investmentsState.find((i) => i.id === inv.id);
                const recovered = existing?.recovered || false;
                const profitAttributed = existing?.additionalProfitAttributed || 0;
                const canAfford = coins >= inv.cost;
                const progressPct = Math.min(100, Math.round((profitAttributed / inv.cost) * 100));

                return (
                  <div
                    key={inv.id}
                    className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{inv.icon}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {inv.category}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-900">{inv.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{inv.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {existing ? (
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                            <span>Profit Recovered:</span>
                            <span className="text-emerald-700 font-black">
                              ₹{profitAttributed} / ₹{inv.cost} ({progressPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
                            <div
                              className={`h-full rounded-full transition-all ${
                                recovered ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="mt-2 text-center text-[10px] font-extrabold text-slate-500">
                            {recovered ? "✅ Full Cost Recovered (Smart Investor Eligible!)" : "⚡ Active: Generating return from sales..."}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-700">Cost: ₹{inv.cost}</span>
                          <button
                            onClick={() => handleMakeInvestment(inv)}
                            disabled={!canAfford}
                            className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all ${
                              canAfford
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            Invest ₹{inv.cost}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ADVERTISING */}
        {activeTab === "advertising" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-600">
              Run marketing campaigns. <b>Marketing Master</b> is unlocked only when attributable incremental contribution profit exceeds campaign expenditure!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AD_CAMPAIGNS.map((camp) => {
                const isCurrent = activeAd?.id === camp.id && !activeAd.completed;
                const canAfford = coins >= camp.cost;
                const profitEarned = isCurrent ? activeAd.incrementalProfitAttributed || 0 : 0;

                return (
                  <div
                    key={camp.id}
                    className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{camp.icon}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {camp.expectedSalesBoost}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-900">{camp.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{camp.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {isCurrent ? (
                        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Cost: ₹{camp.cost}</span>
                            <span className="text-emerald-700 font-black">Profit: ₹{profitEarned}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {profitEarned > camp.cost
                              ? "🎉 Profitable! Will confirm at market day end."
                              : `Needs ₹${camp.cost - profitEarned} more profit to beat campaign cost.`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-700">Cost: ₹{camp.cost}</span>
                          <button
                            onClick={() => handleLaunchCampaign(camp)}
                            disabled={!canAfford || Boolean(activeAd && !activeAd.completed)}
                            className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all ${
                              canAfford && !(activeAd && !activeAd.completed)
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            Launch Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRICING LAB */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-600">
              Formulate real pricing experiments. <b>Pricing Pro</b> requires improving net profit margin while maintaining ≥80% customer satisfaction.
            </p>

            <div className="rounded-2xl bg-white border-2 border-amber-200 p-4 shadow-sm">
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Select Product to Evaluate:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRICING_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedProductPricing(item);
                      setTestPriceInput(item.recommendedPrice);
                    }}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      selectedProductPricing.id === item.id
                        ? "border-amber-400 bg-amber-50 font-black"
                        : "border-slate-200 bg-slate-50/50 text-slate-600"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Current: ₹{item.currentPrice}</div>
                  </button>
                ))}
              </div>

              {/* Price adjustment interactive slider / input */}
              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500">Product Cost (COGS):</span>
                    <span className="ml-1 text-xs font-black text-rose-600">₹{selectedProductPricing.cogs}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">Current Margin:</span>
                    <span className="ml-1 text-xs font-black text-slate-800">
                      ₹{selectedProductPricing.currentPrice - selectedProductPricing.cogs}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-black text-slate-700">Test Price (₹):</label>
                  <input
                    type="number"
                    value={testPriceInput}
                    onChange={(e) => setTestPriceInput(e.target.value)}
                    min={selectedProductPricing.cogs + 1}
                    max={60}
                    className="w-24 px-3 py-1.5 bg-white border-2 border-amber-300 rounded-xl font-black text-sm text-center"
                  />
                  <div className="text-xs text-slate-600">
                    Projected Margin: <b className="text-emerald-700">₹{Number(testPriceInput) - selectedProductPricing.cogs}</b>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Projected Satisfaction:{" "}
                    <b>{Number(testPriceInput) > selectedProductPricing.currentPrice + 4 ? "76% (Low)" : "88% (Healthy)"}</b>
                  </span>
                </div>

                <button
                  onClick={handleRunPricingExperiment}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs rounded-xl shadow-md border-b-2 border-amber-600 active:translate-y-0.5"
                >
                  Confirm & Evaluate Pricing Experiment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
