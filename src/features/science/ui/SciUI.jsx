import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Small shared kit used by every Science screen. Styles live in ../science.css.

const PARTICLES = [
  [8, 14, 30], [86, 10, 38], [20, 72, 26], [92, 64, 34], [48, 6, 24], [60, 93, 26], [4, 44, 22],
];

/** Themed page background (drifting glows + floating emoji) wrapped around the content. */
export function SciPage({ theme = "science", particles = [], fit = false, children, className = "" }) {
  return (
    <div className={`sv-page sv-theme-${theme} ${fit ? "sv-fit" : ""} ${className}`}>
      <div className="sv-ambient" aria-hidden="true">
        <div className="sv-orb sv-orb--1" />
        <div className="sv-orb sv-orb--2" />
        {particles.slice(0, PARTICLES.length).map((emoji, i) => (
          <span
            key={`${emoji}-${i}`}
            className="sv-particle"
            style={{ left: `${PARTICLES[i][0]}%`, top: `${PARTICLES[i][1]}%`, fontSize: PARTICLES[i][2], animationDelay: `${-i * 1.3}s`, animationDuration: `${6 + (i % 3)}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

export function SciBackButton({ to, children }) {
  return (
    <Link to={to} className="sv-btn sv-btn--sm">
      <ArrowLeft size={16} strokeWidth={3} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function SciProgress({ percent, large = false, onDark = false }) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`sv-progress ${large ? "sv-progress--lg" : ""} ${onDark ? "sv-progress--onDark" : ""}`}
      role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
    >
      <div className="sv-progress__fill" style={{ "--sv-w": `${pct}%` }} />
    </div>
  );
}

/** Circular progress with the percentage in the middle. */
export function SciRing({ percent, size = 84 }) {
  const pct = Math.max(0, Math.min(100, percent));
  const r = 34;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="sv-ring" style={{ width: size, height: size }} role="img" aria-label={`${pct}% complete`}>
      <svg viewBox="0 0 80 80">
        <defs>
          <linearGradient id="sv-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--sv-a)" />
            <stop offset="100%" stopColor="var(--sv-a2)" />
          </linearGradient>
        </defs>
        <circle className="sv-ring__track" cx="40" cy="40" r={r} fill="none" strokeWidth="8" />
        <circle className="sv-ring__bar" cx="40" cy="40" r={r} fill="none" strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
      </svg>
      <div className="sv-ring__label"><span>{pct}<small>%</small></span></div>
    </div>
  );
}

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#eab308", "#06b6d4"];

/** One-shot confetti burst. Unmounts itself when finished. */
export function Confetti({ count = 70, duration = 4200 }) {
  const [alive, setAlive] = useState(true);
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: `${(i * 37 + (i % 7) * 11) % 100}%`,
      d: `${((i * 53) % 100) / 100 * 0.9}s`,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      dx: `${((i * 29) % 160) - 80}px`,
      w: 6 + (i % 4) * 2,
    })),
    [count],
  );
  useEffect(() => {
    const id = setTimeout(() => setAlive(false), duration);
    return () => clearTimeout(id);
  }, [duration]);
  if (!alive) return null;
  return (
    <div className="sv-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ "--x": p.x, "--d": p.d, "--c": p.c, "--dx": p.dx, width: p.w }} />
      ))}
    </div>
  );
}

/** 0-3 star rating row; stars pop in one after another. */
export function Stars({ count = 0, of = 3, size = 44 }) {
  return (
    <div className="sv-stars" role="img" aria-label={`${count} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span
          key={i}
          className={`sv-star ${i < count ? "sv-star--on" : ""}`}
          style={{ fontSize: size, animationDelay: `${0.25 + i * 0.22}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Shared results screen (quiz, missions, games).
 * props: emoji, title, subtitle, score (string/number), scoreLabel, stars (0-3, optional),
 *        stats [{label, value}], xp (number, optional), actions [{label, onClick, variant}]
 */
export function SciResults({ emoji = "🎉", title, subtitle, score, scoreLabel, stars, stats = [], xp, actions = [], confetti = true }) {
  return (
    <div className="sv-results sv-panel">
      {confetti && <Confetti />}
      <div className="sv-results__emoji">{emoji}</div>
      <h2 className="sv-results__title">{title}</h2>
      {subtitle && <p className="sv-results__sub">{subtitle}</p>}
      {typeof stars === "number" && <Stars count={stars} />}
      {score !== undefined && (
        <div className="sv-results__score">
          <strong>{score}</strong>
          {scoreLabel && <span>{scoreLabel}</span>}
        </div>
      )}
      {stats.length > 0 && (
        <div className="sv-results__stats">
          {stats.map((s) => (
            <div key={s.label}><b>{s.value}</b><small>{s.label}</small></div>
          ))}
        </div>
      )}
      {typeof xp === "number" && <div className="sv-badge sv-badge--gold sv-results__xp">⭐ +{xp} XP</div>}
      <div className="sv-results__actions">
        {actions.map((a) => (
          <button key={a.label} type="button" onClick={a.onClick} className={`sv-btn sv-btn--lg sv-btn--block ${a.variant === "primary" || !a.variant ? "sv-btn--primary" : a.variant === "gold" ? "sv-btn--gold" : ""}`}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
