import React, { useState } from "react";
import {
  Megaphone,
  Wrench,
  Truck,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatRupees } from "../data/simulationEngine";

export default function CEODepartmentPlanning({ state, onExecuteQuarter }) {
  const [adSpend, setAdSpend] = useState(400000); // Default ₹4,00,000
  const [rdSpend, setRdSpend] = useState(500000); // Default ₹5,00,000
  const [transportType, setTransportType] = useState(
    state.hasOwnedFleet ? "fleet" : "agency"
  );

  // Capital needed for logistics upfront
  const fleetCapEx = transportType === "fleet" && !state.hasOwnedFleet ? 1200000 : 0;
  const totalAllocated = adSpend + rdSpend + fleetCapEx;
  const remainingLiquidCash = state.cash - totalAllocated;
  const isOverBudget = remainingLiquidCash < 0;

  // Live real-time estimations
  const estLeads = Math.round(
    (140 + Math.floor(adSpend / 2200)) * (state.customerTrust / 75)
  );
  const estQuality = Math.min(98, Math.round(35 + (rdSpend / 1500000) * 63));
  const estDefectRate = ((100 - estQuality) / 4.5).toFixed(1);
  const estStars =
    estQuality >= 85 ? "5.0 ★★★★★" : estQuality >= 65 ? "3.8 ★★★★☆" : "1.5 ★☆☆☆☆";
  const estCapacity = transportType === "fleet" ? 900 : 320;

  const handleExecute = () => {
    if (isOverBudget) return;
    onExecuteQuarter({ adSpend, rdSpend, transportType });
  };

  return (
    <div className="space-y-6">
      {/* Quarter Briefing Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Quarter {state.quarter} Executive Strategy Session
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-white">
            Allocate Corporate Capital Across Key Divisions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Every Rupee spent on Marketing drives customer hype, but starves R&D quality and causes product defects. Choose how much to invest in advertising, product engineering, and fulfillment logistics.
          </p>
        </div>

        {isOverBudget && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Budget exceeds available cash treasury! Reduce allocations.</span>
          </div>
        )}
      </div>

      {/* The 3 Department Command Desks */}
      <div className="ceo-dept-grid">
        {/* DEPARTMENT 1: Marketing & Growth */}
        <div className="ceo-dept-card card-mkt">
          <div className="space-y-4">
            <div className="ceo-dept-officer">
              <div className="ceo-avatar-badge ceo-avatar-mkt">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="ceo-dept-info">
                <h3>Marketing & Growth Division</h3>
                <span>Elena Rostova • Chief Marketing Officer</span>
              </div>
            </div>

            <div className="ceo-dept-brief">
              "Aggressive billboard campaigns and digital influencer reviews drive strong showroom footfall. However, if vehicle build quality is lacking, angry buyers will tank our brand reputation."
            </div>

            {/* Range Slider */}
            <div className="ceo-slider-group">
              <div className="ceo-slider-top">
                <span className="ceo-slider-label">Ad Campaign Budget</span>
                <span className="ceo-slider-val">{formatRupees(adSpend)}</span>
              </div>

              <input
                type="range"
                min="0"
                max="1500000"
                step="50000"
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                className="ceo-range-input"
              />

              {/* Quick Presets */}
              <div className="ceo-presets">
                {[100000, 300000, 600000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdSpend(val)}
                    className="ceo-preset-btn"
                  >
                    {formatRupees(val)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Projection Pill */}
          <div className="ceo-projection-box">
            <span>Projected Customer Inbound:</span>
            <b>~{estLeads} EV Buyers</b>
          </div>
        </div>

        {/* DEPARTMENT 2: Product R&D & Engineering */}
        <div className="ceo-dept-card card-rd">
          <div className="space-y-4">
            <div className="ceo-dept-officer">
              <div className="ceo-avatar-badge ceo-avatar-rd">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="ceo-dept-info">
                <h3>Product Engineering & R&D</h3>
                <span>Dr. Marcus Vance • Chief Technology Officer</span>
              </div>
            </div>

            <div className="ceo-dept-brief">
              "We need engineering budget to calibrate battery pack cooling and tighten chassis tolerances. Starving R&D causes high defect rates, battery overheating, and expensive warranty recalls."
            </div>

            {/* Range Slider */}
            <div className="ceo-slider-group">
              <div className="ceo-slider-top">
                <span className="ceo-slider-label">R&D Quality Budget</span>
                <span className="ceo-slider-val" style={{ color: "#34d399" }}>
                  {formatRupees(rdSpend)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1500000"
                step="50000"
                value={rdSpend}
                onChange={(e) => setRdSpend(Number(e.target.value))}
                className="ceo-range-input"
                style={{ accentColor: "#10b981" }}
              />

              {/* Quick Presets */}
              <div className="ceo-presets">
                {[100000, 400000, 750000, 1200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRdSpend(val)}
                    className="ceo-preset-btn"
                  >
                    {formatRupees(val)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Projection Pill */}
          <div className="ceo-projection-box">
            <span>Estimated Defect Rate:</span>
            <b style={{ color: estDefectRate > 5 ? "#f87171" : "#34d399" }}>
              {estDefectRate}% ({estStars})
            </b>
          </div>
        </div>

        {/* DEPARTMENT 3: Supply Chain & Logistics */}
        <div className="ceo-dept-card card-log">
          <div className="space-y-4">
            <div className="ceo-dept-officer">
              <div className="ceo-avatar-badge ceo-avatar-log">
                <Truck className="w-5 h-5" />
              </div>
              <div className="ceo-dept-info">
                <h3>Supply Chain & Transport Logistics</h3>
                <span>Vikram Patel • Director of Operations</span>
              </div>
            </div>

            <div className="ceo-dept-brief">
              "Will we contract an external logistics agency, or purchase our own dedicated in-house EV delivery fleet? Agency has zero upfront capital but limits delivery capacity to 320 units."
            </div>

            {/* Logistics Strategy Selector */}
            <div className="ceo-transport-options">
              {/* Option 1: 3PL Agency */}
              <div
                onClick={() => setTransportType("agency")}
                className={`ceo-transport-card ${
                  transportType === "agency" ? "active" : ""
                }`}
              >
                <div className="ceo-radio-circle" />
                <div className="ceo-transport-details">
                  <h4>Apex Global 3PL Agency</h4>
                  <p>
                    <strong>₹0 Upfront CapEx</strong> • ₹8,000 fee per unit delivered. Capacity capped at <strong>320 units</strong>. Unmet demand suffers cancellation delays.
                  </p>
                </div>
              </div>

              {/* Option 2: In-House Fleet */}
              <div
                onClick={() => setTransportType("fleet")}
                className={`ceo-transport-card ${
                  transportType === "fleet" ? "active" : ""
                }`}
              >
                <div className="ceo-radio-circle" />
                <div className="ceo-transport-details">
                  <h4>Nexora Dedicated EV Fleet</h4>
                  <p>
                    {state.hasOwnedFleet ? (
                      <span className="text-emerald-400 font-bold">
                        Fleet Owned (CapEx already paid)
                      </span>
                    ) : (
                      <span>
                        <strong>₹12,00,000 Upfront CapEx</strong> one-time purchase.
                      </span>
                    )}{" "}
                    Only ₹2,200 per delivery. High <strong>900 units</strong> capacity & 99% on-time rate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Projection Pill */}
          <div className="ceo-projection-box">
            <span>Fulfillment Capacity:</span>
            <b style={{ color: "#f59e0b" }}>{estCapacity} Units / Quarter</b>
          </div>
        </div>
      </div>

      {/* Live Allocation Action Bar */}
      <div className="ceo-allocation-bar">
        <div className="ceo-alloc-stats">
          <div className="ceo-alloc-col">
            <span>Total Available Cash</span>
            <b>{formatRupees(state.cash)}</b>
          </div>

          <div className="ceo-alloc-col">
            <span>Quarterly Capital Outlay</span>
            <b style={{ color: isOverBudget ? "#f87171" : "#38bdf8" }}>
              {formatRupees(totalAllocated)}
            </b>
          </div>

          <div className="ceo-alloc-col">
            <span>Remaining Treasury Reserve</span>
            <b
              style={{
                color: isOverBudget
                  ? "#f87171"
                  : remainingLiquidCash < 1500000
                  ? "#fbbf24"
                  : "#34d399",
              }}
            >
              {formatRupees(remainingLiquidCash)}
            </b>
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={isOverBudget}
          className="ceo-btn-execute"
        >
          <Sparkles className="w-5 h-5" />
          <span>Execute Quarter {state.quarter} & Simulate Market</span>
        </button>
      </div>
    </div>
  );
}
