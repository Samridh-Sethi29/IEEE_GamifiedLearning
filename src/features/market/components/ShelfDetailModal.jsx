import React, { useState, useEffect } from "react";
import { X, Plus, PackageCheck, AlertCircle, Sparkles } from "lucide-react";
import { PRODUCTS } from "../utils/constants";
import "../market-ui.css";

const TABS = [
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🍿" },
  { id: "food", label: "Food", emoji: "🍎" }
];

export default function ShelfDetailModal({
  isOpen,
  onClose,
  initialCategory = "drinks",
  inventory,
  onRestockItem
}) {
  const [activeTab, setActiveTab] = useState(initialCategory || "drinks");

  useEffect(() => {
    if (isOpen) setActiveTab(initialCategory || "drinks");
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const products = Object.keys(PRODUCTS)
    .filter((k) => PRODUCTS[k].shelf === activeTab)
    .map((k) => ({
      key: k,
      ...PRODUCTS[k],
      shelfQty: inventory?.[k]?.shelf ?? PRODUCTS[k].initialShelf,
      storageQty: inventory?.[k]?.storage ?? PRODUCTS[k].initialStorage
    }));

  return (
    <div className="sv-root sv-overlay" onClick={onClose}>
      <div className="sv-card sv-shelf" onClick={(e) => e.stopPropagation()}>
        <div className="sv-shelf-top">
          <div className="sv-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sv-tab ${tab.id} ${activeTab === tab.id ? "on" : ""}`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <button onClick={onClose} className="sv-close" aria-label="Close">
            <X />
          </button>
        </div>

        <div className="sv-list">
          {products.map((prod) => {
            const isLow = prod.shelfQty <= 2;
            const isFull = prod.shelfQty >= prod.maxShelf;
            const hasStorage = prod.storageQty > 0;
            const pct = Math.min(100, Math.round((prod.shelfQty / prod.maxShelf) * 100));

            return (
              <div key={prod.key} className="sv-row">
                <span className="sv-emoji">{prod.emoji}</span>

                <div className="sv-info">
                  <div className="sv-name">{prod.name}</div>
                  <div className="sv-meter">
                    <div className={`sv-bar ${isFull ? "full" : isLow ? "low" : ""}`}>
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <span className="sv-qty">Shelf {prod.shelfQty}/{prod.maxShelf}</span>
                  </div>
                  <span className="sv-chip">📦 Storage: {prod.storageQty}</span>
                </div>

                <div className="sv-price">
                  <small>Price</small>
                  <b>₹{prod.unitPrice}</b>
                </div>

                {isFull ? (
                  <div className="sv-act full"><PackageCheck /><span>Shelf Full</span></div>
                ) : !hasStorage ? (
                  <div className="sv-act none"><AlertCircle /><span>No Storage</span></div>
                ) : (
                  <button className="sv-act go" onClick={() => onRestockItem(prod.key, 4)}>
                    <Plus /><span>+4 Restock</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="sv-foot">
          <Sparkles />
          <span>Tap <b>+4 Restock</b> to move items from the storage cabinet onto this shelf!</span>
        </div>
      </div>
    </div>
  );
}
