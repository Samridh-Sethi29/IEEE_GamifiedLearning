import React from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  ShieldCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatRupees } from "../data/simulationEngine";

export default function CEOQuarterAnalytics({
  state,
  lastResult,
  onContinueNextQuarter,
}) {
  const history = state.financialHistory || [];
  const isProfitable = lastResult.netProfit >= 0;
  const isLastQuarter = state.quarter > state.maxQuarters;

  // Compute SVG chart metrics
  const maxFinancialVal = Math.max(
    ...history.map((h) => Math.max(h.grossRevenue, h.totalExpenses)),
    1000000
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Quarter {lastResult.quarter} Financial & Operational Debrief
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-white">
            Quarterly Performance Results & Audited Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review your P&L income statement, customer fulfillment funnel, and board feedback before adjusting next quarter's strategy.
          </p>
        </div>

        <button onClick={onContinueNextQuarter} className="ceo-btn-execute">
          <span>
            {isLastQuarter
              ? "View Annual Shareholder Report"
              : `Proceed to Quarter ${state.quarter} Planning`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Revenue
          </span>
          <b className="font-heading text-xl font-black text-white block mt-1">
            {formatRupees(lastResult.grossRevenue)}
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {lastResult.deliveredUnits} EVs Delivered
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Profit / (Loss)
          </span>
          <b
            className={`font-heading text-xl font-black block mt-1 ${
              isProfitable ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatRupees(lastResult.netProfit)}
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Margin: {lastResult.profitMargin}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Reliability
          </span>
          <b
            className={`font-heading text-xl font-black block mt-1 ${
              lastResult.qualityScore >= 80 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {lastResult.qualityScore}/100
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Defects: {lastResult.defectiveUnits} units
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Fulfillment Rate
          </span>
          <b className="font-heading text-xl font-black text-white block mt-1">
            {lastResult.totalBuyerDemand > 0
              ? Math.round(
                  (lastResult.deliveredUnits / lastResult.totalBuyerDemand) * 100
                )
              : 100}
            %
          </b>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Backlog: {lastResult.backloggedUnits} delayed
          </span>
        </div>
      </div>

      {/* Two Analytics Panels */}
      <div className="ceo-analytics-grid">
        {/* PANEL 1: Pure SVG Visual Financial Trends Chart */}
        <div className="ceo-analytics-panel">
          <div className="ceo-analytics-head">
            <h3>Quarterly Financial Performance Trajectory</h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                Expenses
              </span>
            </div>
          </div>

          <div className="ceo-chart-box">
            <svg viewBox="0 0 460 220" className="w-full h-auto">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="440" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="440" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="440" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="40" y1="180" x2="440" y2="180" stroke="#334155" strokeWidth="1.5" />

              {/* Y Axis labels */}
              <text x="35" y="24" fill="#64748b" fontSize="10" textAnchor="end">
                {formatRupees(maxFinancialVal)}
              </text>
              <text x="35" y="104" fill="#64748b" fontSize="10" textAnchor="end">
                {formatRupees(maxFinancialVal / 2)}
              </text>
              <text x="35" y="184" fill="#64748b" fontSize="10" textAnchor="end">
                ₹0
              </text>

              {/* Render Bars per quarter */}
              {history.map((h, i) => {
                const totalSlots = Math.max(state.maxQuarters, history.length);
                const slotWidth = 380 / totalSlots;
                const slotX = 55 + i * slotWidth;

                const revHeight = (h.grossRevenue / maxFinancialVal) * 150;
                const expHeight = (h.totalExpenses / maxFinancialVal) * 150;

                return (
                  <g key={i}>
                    {/* Revenue Bar */}
                    <rect
                      x={slotX}
                      y={180 - revHeight}
                      width={slotWidth * 0.35}
                      height={revHeight}
                      rx="4"
                      fill="#06b6d4"
                      opacity="0.85"
                    />

                    {/* Expenses Bar */}
                    <rect
                      x={slotX + slotWidth * 0.4}
                      y={180 - expHeight}
                      width={slotWidth * 0.35}
                      height={expHeight}
                      rx="4"
                      fill="#f43f5e"
                      opacity="0.85"
                    />

                    {/* Quarter X label */}
                    <text
                      x={slotX + slotWidth * 0.37}
                      y="200"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      Q{h.quarter}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Comparing Gross Revenue vs Total Operating Expenses across fiscal quarters. Aim to expand the spread between blue (revenue) and red (expenses).
          </p>
        </div>

        {/* PANEL 2: Customer Funnel & Fulfillment Chart */}
        <div className="ceo-analytics-panel">
          <div className="ceo-analytics-head">
            <h3>Customer Demand & Conversion Funnel</h3>
            <span className="text-xs font-bold text-slate-400">Quarter {lastResult.quarter}</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Step 1: Inbound Demand */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-cyan-400">1. Total Inbound Buyers</span>
                <span className="text-white">{lastResult.totalBuyerDemand} Buyers</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 w-full" />
              </div>
            </div>

            {/* Step 2: Delivered */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-400">2. Dispatched & Delivered</span>
                <span className="text-white">
                  {lastResult.deliveredUnits} Units (
                  {Math.round(
                    (lastResult.deliveredUnits / Math.max(1, lastResult.totalBuyerDemand)) *
                      100
                  )}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      100,
                      (lastResult.deliveredUnits / Math.max(1, lastResult.totalBuyerDemand)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Step 3: Satisfied Drivers */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-indigo-400">3. Flawless Vehicles (Satisfied)</span>
                <span className="text-white">{lastResult.satisfiedUnits} Drivers</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (lastResult.satisfiedUnits / Math.max(1, lastResult.totalBuyerDemand)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Step 4: Losses (Defects & Backlog Cancellations) */}
            <div className="pt-2 border-t border-slate-800 text-xs flex justify-between text-rose-300">
              <span>Warranty Defects: {lastResult.defectiveUnits}</span>
              <span>Backlog Cancellations: {lastResult.cancelledUnits}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 mt-auto leading-relaxed">
            {lastResult.backloggedUnits > 0 ? (
              <span className="text-amber-300">
                ⚠️ <strong>Fulfillment Bottleneck:</strong> Transport capacity fell short by {lastResult.backloggedUnits} units. Buyers cancelled orders due to delays.
              </span>
            ) : lastResult.defectiveUnits > 15 ? (
              <span className="text-rose-300">
                ⚠️ <strong>Quality Defect Warning:</strong> {lastResult.defectiveUnits} vehicles had manufacturing bugs, causing warranty costs and negative PR reviews.
              </span>
            ) : (
              <span className="text-emerald-300">
                ✅ <strong>Balanced Execution:</strong> Smooth fulfillment and strong quality prevented cancellations and warranty claims!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audited Corporate P&L Table */}
      <div className="ceo-analytics-panel">
        <div className="ceo-analytics-head">
          <h3>Audited Income Statement (P&L Breakdown)</h3>
          <span className="text-xs font-bold text-slate-400">Quarter {lastResult.quarter} Results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="ceo-pnl-table">
            <thead>
              <tr>
                <th>Account Line Item</th>
                <th>Classification</th>
                <th>Quarterly Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Gross Sales Revenue</strong> ({lastResult.deliveredUnits} EVs × ₹1,20,000)</td>
                <td>Operating Inflow</td>
                <td style={{ color: "#34d399", fontWeight: 700 }}>
                  {formatRupees(lastResult.grossRevenue)}
                </td>
              </tr>
              <tr>
                <td>Direct Manufacturing Cost of Goods (COGS)</td>
                <td>Variable Production</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.mfgCost)}</td>
              </tr>
              <tr>
                <td>Logistics & Transport Fulfillment {lastResult.fleetCapEx > 0 ? "(incl. CapEx)" : ""}</td>
                <td>Supply Chain</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.logisticsCost)}</td>
              </tr>
              <tr>
                <td>Marketing & Digital Customer Acquisition</td>
                <td>Growth & SG&A</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.adSpend)}</td>
              </tr>
              <tr>
                <td>Product Engineering & R&D Quality</td>
                <td>Research & Development</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.rdSpend)}</td>
              </tr>
              <tr>
                <td>Fixed Factory Rent & Admin Overhead</td>
                <td>Fixed Overhead</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(state.fixedOverhead)}</td>
              </tr>
              {lastResult.warrantyRepairCost > 0 && (
                <tr>
                  <td>Defect Warranty Repairs & Refunds ({lastResult.defectiveUnits} claims)</td>
                  <td>Quality Liability</td>
                  <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.warrantyRepairCost)}</td>
                </tr>
              )}
              <tr className="total-row">
                <td>Total Operating Expenses</td>
                <td>All Outflows</td>
                <td style={{ color: "#f87171" }}>-{formatRupees(lastResult.totalExpenses)}</td>
              </tr>
              <tr className="profit-row">
                <td><strong>Net Operating Profit / (Loss)</strong></td>
                <td>Bottom Line</td>
                <td style={{ color: isProfitable ? "#34d399" : "#f87171", fontSize: "16px" }}>
                  {formatRupees(lastResult.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
