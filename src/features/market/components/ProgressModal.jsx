import React from "react";
import { X, Star, Users, Package, TrendingUp } from "lucide-react";

export default function ProgressModal({
  isOpen,
  onClose,
  stats = { customersServed: 0, revenueEarned: 0, storeUpgrades: 0, itemsRestocked: 0 },
  level = 1,
  xp = 0
}) {
  if (!isOpen) return null;

  const xpMax = 100;
  const xpNow = xp % xpMax;
  const xpPercent = Math.min(100, (xpNow / xpMax) * 100);

  const cards = [
    { icon: <Star className="w-7 h-7 text-amber-400 fill-amber-300" />, value: xpNow, label: "Points", bg: "bg-amber-50 border-amber-200" },
    { icon: <span className="w-7 h-7 rounded-full bg-amber-400 text-white font-black flex items-center justify-center text-sm">₹</span>, value: `₹${stats.revenueEarned}`, label: "Money", bg: "bg-yellow-50 border-yellow-200" },
    { icon: <Users className="w-7 h-7 text-sky-500" />, value: stats.customersServed, label: "Customers", bg: "bg-sky-50 border-sky-200" },
    { icon: <Package className="w-7 h-7 text-orange-500" />, value: stats.itemsRestocked || 0, label: "Restocked", bg: "bg-orange-50 border-orange-200" },
    { icon: <TrendingUp className="w-7 h-7 text-green-500" />, value: stats.storeUpgrades || 0, label: "Upgrades", bg: "bg-green-50 border-green-200" },
    { icon: <span className="text-2xl">🎖️</span>, value: `Level ${level}`, label: "Store Owner", bg: "bg-violet-50 border-violet-200" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm select-none animate-fade-in">
      <div
        style={{ maxWidth: 560 }}
        className="relative w-full rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-50 to-white shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border-2 border-sky-200 hover:bg-rose-50 flex items-center justify-center text-slate-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-black text-xl text-sky-900">Points &amp; Rewards</h3>
        <p className="text-xs font-bold text-slate-500 mb-3">Earn points for good service, smart decisions and store growth.</p>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-1">
            <span>Level {level}</span>
            <span>{xpNow} / {xpMax}</span>
          </div>
          <div className="h-3.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-2xl border-2 ${c.bg} p-3 flex flex-col items-center gap-1 shadow-sm`}>
              {c.icon}
              <div className="font-black text-lg text-slate-800 leading-none">{c.value}</div>
              <div className="text-[11px] font-extrabold text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 mx-auto w-fit px-6 py-2 rounded-2xl bg-gradient-to-b from-green-400 to-green-600 border-b-4 border-green-800 text-white text-center shadow-lg">
          <div className="font-black text-sm">Keep going!</div>
          <div className="font-extrabold text-xs">You're doing great! ⭐</div>
        </div>
      </div>
    </div>
  );
}
