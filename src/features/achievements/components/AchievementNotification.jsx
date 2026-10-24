import React, { useState, useEffect } from "react";
import { Trophy, Sparkles, X, Award, ShoppingBag, Briefcase, TrendingUp, Heart, PackageCheck, Coins, LineChart, Megaphone, Tag, Store, Crown } from "lucide-react";
import { RARITY_CONFIG } from "../data/badgeDefinitions";

const ICON_MAP = {
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  heart: Heart,
  "package-check": PackageCheck,
  award: Award,
  coins: Coins,
  "line-chart": LineChart,
  megaphone: Megaphone,
  tag: Tag,
  store: Store,
  crown: Crown,
};

export default function AchievementNotification() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const handleUnlocked = (e) => {
      const badge = e.detail;
      if (badge && badge.id) {
        setQueue((prev) => [...prev, badge]);
      }
    };

    window.addEventListener("skillverse:achievement-unlocked", handleUnlocked);
    return () => {
      window.removeEventListener("skillverse:achievement-unlocked", handleUnlocked);
    };
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      const nextBadge = queue[0];
      setCurrent(nextBadge);
      setQueue((prev) => prev.slice(1));

      const timer = setTimeout(() => {
        setCurrent(null);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [current, queue]);

  if (!current) return null;

  const IconComponent = ICON_MAP[current.icon] || Trophy;
  const rarity = RARITY_CONFIG[current.rarity] || RARITY_CONFIG.common;

  return (
    <aside
      aria-label="Achievement unlocked notification"
      className="fixed top-5 right-5 z-[9999] pointer-events-auto select-none animate-slide-down"
      style={{ maxWidth: 380, width: "calc(100vw - 40px)" }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          borderColor: rarity.border,
          boxShadow: `0 12px 30px -4px rgba(0, 0, 0, 0.45), 0 0 16px -2px ${rarity.border}40`,
        }}
      >
        {/* Glow Accent */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none opacity-20 blur-xl"
          style={{ background: rarity.color }}
        />

        <div className="flex items-start gap-3.5">
          {/* Badge Icon Frame */}
          <div
            className="flex-shrink-0 w-13 h-13 rounded-xl flex items-center justify-center border shadow-inner relative"
            style={{
              width: 52,
              height: 52,
              background: `linear-gradient(135deg, ${rarity.bg} 0%, #ffffff 100%)`,
              borderColor: rarity.border,
            }}
          >
            <IconComponent className="w-6 h-6" style={{ color: rarity.color }} />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow">
              <Sparkles className="w-3 h-3 fill-current" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-amber-400 mb-0.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Achievement Unlocked!</span>
            </div>

            <h4 className="font-black text-sm text-white truncate leading-tight">
              {current.name}
            </h4>

            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {current.description}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                style={{
                  background: `${rarity.color}20`,
                  color: rarity.border,
                  borderColor: `${rarity.border}50`,
                }}
              >
                {rarity.label}
              </span>

              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                +{current.rewardXP} XP
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setCurrent(null)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
