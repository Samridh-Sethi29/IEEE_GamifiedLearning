import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Package,
  ShieldCheck,
  Coins,
  Store,
  Briefcase,
} from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import "@/features/market/market-hub.css";

export default function MarketWorld() {
  const { player } = usePlayer();

  return (
    <div className="mhub-root">
      {/* Ambient background glows */}
      <div className="mhub-glow-1" />
      <div className="mhub-glow-2" />

      <div className="mhub-container">
        {/* Header */}
        <header className="mhub-header">
          <Link to="/world" className="mhub-back-btn">
            <ArrowLeft />
            <span>Back to Village Map</span>
          </Link>

          <div className="mhub-player-pill">
            <span className="mhub-level-tag">Lv {player?.level || 1}</span>
            <span className="mhub-coin-tag">
              <Coins />
              <span>{player?.coins ?? 250}</span>
            </span>
            <span className="mhub-day-tag">Day {player?.day || 1}</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="mhub-main">
          <div className="mhub-hero-text">
            <div className="mhub-kicker">
              <Sparkles />
              <span>Skillverse Commerce & Enterprise District</span>
            </div>
            <h1 className="mhub-title">
              <span className="mhub-title-gradient">Choose Your Business Path</span>
            </h1>
            <p className="mhub-subtitle">
              Step onto the bustling market floor to master retail store logistics, or take the executive elevator to lead a corporation in the high-stakes CEO Decision Room.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mhub-grid">
            {/* CARD 1: Store Simulator */}
            <div className="mhub-card mhub-card-retail">
              <div>
                <div className="mhub-card-head">
                  <span className="mhub-pill mhub-pill-retail">Retail Operations</span>
                  <div className="mhub-icon-box mhub-icon-box-retail">
                    <Store />
                  </div>
                </div>

                <h2 className="mhub-card-title">Skillz Market</h2>
                <p className="mhub-card-desc">
                  Operate a full 2D supermarket! Restock shelves from the warehouse, direct customers across aisles, manage inventory, and calculate exact change at checkout.
                </p>

                <div className="mhub-features">
                  <div className="mhub-feature-item mhub-feature-item-retail">
                    <Package />
                    <span>Inventory management & restock logistics</span>
                  </div>
                  <div className="mhub-feature-item mhub-feature-item-retail">
                    <Coins />
                    <span>Cash register math & Indian rupee change</span>
                  </div>
                </div>
              </div>

              <div>
                <Link to="/world/market/store" className="mhub-btn mhub-btn-retail">
                  <ShoppingCart />
                  <span>Open Store Simulator</span>
                  <ChevronRight />
                </Link>
              </div>
            </div>

            {/* CARD 2: CEO Decision Room */}
            <div className="mhub-card mhub-card-ceo">
              <div>
                <div className="mhub-card-head">
                  <span className="mhub-pill mhub-pill-ceo">Executive Strategy</span>
                  <div className="mhub-icon-box mhub-icon-box-ceo">
                    <Building2 />
                  </div>
                </div>

                <h2 className="mhub-card-title">CEO Decision Room</h2>
                <p className="mhub-card-desc">
                  Lead an electric vehicle enterprise through real-world business challenges. Navigate battery cost inflation, negative reviews, burnout, expansion, and price wars.
                </p>

                <div className="mhub-features">
                  <div className="mhub-feature-item mhub-feature-item-ceo">
                    <TrendingUp />
                    <span>Real profit margins, revenue & cash calculations</span>
                  </div>
                  <div className="mhub-feature-item mhub-feature-item-ceo">
                    <ShieldCheck />
                    <span>Brand equity, employee morale & opportunity cost</span>
                  </div>
                </div>
              </div>

              <div>
                <Link to="/world/market/ceo-decision-room" className="mhub-btn mhub-btn-ceo">
                  <Briefcase />
                  <span>Play CEO Decision Room</span>
                  <ChevronRight />
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mhub-footer">
          Skillverse Gamified Learning • Market Hub
        </footer>
      </div>
    </div>
  );
}
