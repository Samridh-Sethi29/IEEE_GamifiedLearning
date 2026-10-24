import React from "react";
import { Trophy, Star, Home, CheckCircle2, Users, ShoppingCart, RefreshCw } from "lucide-react";
import "../market-ui.css";

export default function DaySummaryModal({
  isOpen,
  stats = { customersServed: 0, revenueEarned: 0, changeAccuracy: 100, goalsCompleted: 3 },
  onNextDay,
  onReturnToMap
}) {
  if (!isOpen) return null;

  const items = [
    { icon: <Users />, label: "Customers Served", value: `${stats.customersServed} / 3 Complete`, tone: "sky" },
    { icon: <span>₹</span>, label: "Sales Earned", value: `₹${stats.revenueEarned}`, tone: "amber" },
    { icon: <CheckCircle2 />, label: "Change Accuracy", value: `${stats.changeAccuracy}% Perfect`, tone: "green" },
    { icon: <ShoppingCart />, label: "Store Management", value: "Master Vendor", tone: "violet" }
  ];

  return (
    <div className="sv-root sv-overlay">
      <div className="sv-card sv-sum">
        <div className="sv-sum-in">
          <div className="sv-medal"><Trophy /></div>
          <div className="sv-stars">
            <Star />
            <Star className="mid" />
            <Star />
          </div>

          <h2>Supermarket Master!</h2>
          <p className="sub">
            All daily goals completed! You served customers, calculated exact change, and managed the stockroom like a pro!
          </p>

          <div className="sv-sum-grid">
            {items.map((it, idx) => (
              <div key={idx} className={`sv-sum-card ${it.tone}`}>
                <span className="ic">{it.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <small>{it.label}</small>
                  <b>{it.value}</b>
                </div>
              </div>
            ))}
          </div>

          <div className="sv-learned">
            <CheckCircle2 />
            <span>Learned: Indian Currency calculation, inventory restock, and customer service!</span>
          </div>

          <div className="sv-sum-actions">
            <button onClick={onReturnToMap} className="sv-cancel"><Home /> Return to Village</button>
            <button onClick={onNextDay} className="sv-confirm"><RefreshCw /> Play Again</button>
          </div>
        </div>
      </div>
    </div>
  );
}