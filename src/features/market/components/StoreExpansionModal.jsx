import React, { useState } from "react";
import { X, Check, Lock } from "lucide-react";

const UPGRADES = [
  { id: "newShelf", title: "More Shelves", description: "+4 items on every shelf", cost: 100, icon: "🏪" },
  { id: "largerSpace", title: "New Products", description: "Bigger storage for more stock", cost: 200, icon: "📦" },
  { id: "moreCustomers", title: "More Customers", description: "Customers arrive faster", cost: 150, icon: "👥" }
];

export default function StoreExpansionModal({
  isOpen,
  onClose,
  coins,
  onBuyUpgrade,
  upgrades = { newShelf: false, largerSpace: false, moreCustomers: false }
}) {
  const [feedback, setFeedback] = useState("");
  if (!isOpen) return null;

  const ownedCount = UPGRADES.filter((u) => upgrades[u.id]).length;
  const next = UPGRADES.find((u) => !upgrades[u.id]);
  const level = ownedCount + 1;
  const canAfford = next ? coins >= next.cost : false;
  const progress = next ? Math.min(100, Math.round((coins / next.cost) * 100)) : 100;

  const handleUpgrade = () => {
    if (!next) return;
    if (!canAfford) {
      setFeedback("Not enough coins yet. Serve more customers!");
      return;
    }
    onBuyUpgrade(next.id, next.cost);
    setFeedback(`Upgraded: ${next.title}!`);
    setTimeout(() => setFeedback(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm select-none animate-fade-in">
      <div
        style={{ maxWidth: 640 }}
        className="relative w-full rounded-[2rem] border-4 border-white bg-gradient-to-b from-amber-50 to-sky-50 shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border-2 border-sky-200 hover:bg-rose-50 flex items-center justify-center text-slate-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-black text-xl text-sky-900 mb-3">Store Expansion</h3>

        {feedback && (
          <div className="mb-3 bg-green-50 border-2 border-green-300 text-green-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Your Store */}
          <div className="rounded-2xl bg-white border-2 border-sky-100 shadow-md p-4">
            <div className="text-center text-4xl">🏬</div>
            <div className="mt-1 text-center font-black text-lg text-sky-900">Your Store</div>
            <div className="text-center font-extrabold text-sm text-slate-600">Level {level}</div>
            <div className="mt-3 h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[11px] font-extrabold text-slate-500">
              {next ? `${Math.min(coins, next.cost)} / ${next.cost}` : "MAX"}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={!next}
              className={`mt-3 w-full py-3 rounded-2xl font-black text-base border-b-4 ${
                !next
                  ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                  : canAfford
                  ? "bg-gradient-to-b from-green-400 to-green-600 text-white border-green-800 shadow-lg active:translate-y-0.5 active:border-b-2"
                  : "bg-green-200 text-green-700 border-green-300"
              }`}
            >
              {next ? `Upgrade · ₹${next.cost}` : "Fully Upgraded"}
            </button>
            <div className="mt-2 text-center text-xs font-bold text-slate-500">
              You have <span className="text-amber-600 font-black">₹{coins}</span>
            </div>
          </div>

          {/* Next Upgrade */}
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <span className="font-black text-sm text-amber-900">Next Upgrade</span>
            </div>
            <ul className="space-y-2">
              {UPGRADES.map((u) => {
                const owned = upgrades[u.id];
                return (
                  <li
                    key={u.id}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border-2 ${
                      owned ? "bg-green-50 border-green-200" : "bg-white border-amber-100"
                    }`}
                  >
                    <span className="text-xl">{u.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xs text-slate-800">+ {u.title}</div>
                      <div className="text-[10px] font-bold text-slate-500 leading-tight">{u.description}</div>
                    </div>
                    {owned ? (
                      <span className="text-[10px] font-black text-green-700 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-amber-700">₹{u.cost}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
