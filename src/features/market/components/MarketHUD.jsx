import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, ClipboardList, Check, Building2 } from "lucide-react";
import "../market-ui.css";

export default function MarketHUD({
  coins = 0,
  goals = [],
  isMuted = false,
  onToggleMute,
  onRestartDay
}) {
  return (
    <header className="sv-root sv-hud">
      <div className="sv-hud-group">
        <Link to="/world/market" title="Return to Market District Hub" aria-label="Back" className="sv-glass sv-iconbtn">
          <ArrowLeft />
        </Link>

        <div className="sv-glass sv-brand">
          <div className="av">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              {/* Shirt & Overalls */}
              <circle cx="18" cy="18" r="16" fill="#fde047" />
              <path d="M10 26 L14 18 L22 18 L26 26 Z" fill="#2563eb" />
              {/* Head & Skin */}
              <circle cx="18" cy="17" r="9" fill="#f8c89c" />
              {/* Chestnut Hair */}
              <path d="M10 16 Q18 9 26 16 Q18 12 10 16 Z" fill="#6c3b1e" />
              {/* Visor Cap */}
              <path d="M9 13 Q18 9 27 13 L25 10 Q18 7 11 10 Z" fill="#be123c" />
              <polygon points="18,8 19.2,10.5 22,10.8 20,12.7 20.5,15.5 18,14.2 15.5,15.5 16,12.7 14,10.8 16.8,10.5" fill="#facc15" />
              {/* Sparkling Eyes */}
              <circle cx="15" cy="17" r="1.5" fill="#1e1b4b" />
              <circle cx="14.6" cy="16.5" r="0.5" fill="#ffffff" />
              <circle cx="21" cy="17" r="1.5" fill="#1e1b4b" />
              <circle cx="20.6" cy="16.5" r="0.5" fill="#ffffff" />
              {/* Blush & Smile */}
              <ellipse cx="13" cy="19.5" rx="1.2" ry="0.7" fill="#fb7185" opacity="0.7" />
              <ellipse cx="23" cy="19.5" rx="1.2" ry="0.7" fill="#fb7185" opacity="0.7" />
              <path d="M16 20.5 Q18 22.5 20 20.5" stroke="#be123c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="tx">
            <b>Skillz</b>
            <span>Market</span>
          </div>
        </div>

        <div className="sv-glass sv-earn">
          <span className="coin">₹</span>
          <div className="tx">
            <small>Total Earned</small>
            <b>₹{coins}</b>
          </div>
        </div>
      </div>

      <div className="sv-hud-group right">
        <div className="sv-glass sv-goal">
          <div className="sv-goal-title">
            <ClipboardList />
            <span>Today's Goal</span>
          </div>
          {goals.map((g) => {
            const done = g.completed || g.current >= g.target;
            return (
              <div key={g.id} className={`sv-goal-row ${done ? "done" : ""}`}>
                <span className="box">{done && <Check strokeWidth={3} />}</span>
                <span className="t">{g.title}</span>
                <span className="n">{Math.min(g.current, g.target)}/{g.target}</span>
              </div>
            );
          })}
        </div>

        <Link
          to="/world/market/ceo-decision-room"
          title="Switch to CEO Decision Room"
          aria-label="CEO Decision Room"
          className="sv-glass sv-iconbtn"
          style={{ color: "#06b6d4" }}
        >
          <Building2 />
        </Link>

        <button
          onClick={onToggleMute}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className={`sv-glass sv-iconbtn ${isMuted ? "off" : "on"}`}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </button>

        <button onClick={onRestartDay} title="Restart Day" aria-label="Restart Day" className="sv-glass sv-iconbtn">
          <RotateCcw />
        </button>
      </div>
    </header>
  );
}
