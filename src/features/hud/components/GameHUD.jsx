import { CalendarDays, Sparkles } from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";

// Small gold coin glyph, reused by the HUD and the world panels.
export function CoinIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#d97706" strokeWidth="2" />
      <path d="M 12 8.5 v 7" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MiniAvatar() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-emerald-100 to-emerald-200 shadow-inner"
      data-testid="hud-player-avatar"
    >
      <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
        <path d="M 11 40 q 9 -10 18 0 Z" fill="#22a45d" />
        <circle cx="20" cy="17" r="11" fill="#f8c89b" />
        <path d="M 9 17 a 11 11 0 0 1 22 0 Z" fill="#5b3a29" />
        <circle cx="15.5" cy="18.5" r="1.8" fill="#292524" />
        <circle cx="24.5" cy="18.5" r="1.8" fill="#292524" />
        <path d="M 16 23.5 q 4 3 8 0" stroke="#b4562f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// Minimal floating HUD: player identity top-left, coins + day top-right,
// objective pill top-center. Everything reads from /api/player and degrades to
// defaults when the backend is unreachable.
export default function GameHUD({ objective }) {
  const { player } = usePlayer();
  const xpMax = player.level * 100;
  const xpPct = Math.min(100, Math.round((player.xp / xpMax) * 100));

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 py-2 pl-2.5 pr-4 shadow-lg shadow-emerald-950/15 backdrop-blur"
          data-testid="hud-player-card"
        >
          <MiniAvatar />
          <div className="min-w-[130px]">
            <div className="font-heading text-[15px] font-bold leading-tight text-slate-900" data-testid="hud-player-name">
              {player.name}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600" data-testid="hud-player-level">
                Lv {player.level}
              </span>
              <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-slate-200" data-testid="hud-xp-bar">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-700"
                  style={{ width: `${xpPct}%` }}
                  data-testid="hud-xp-fill"
                />
              </span>
              <span className="text-[10px] font-medium text-slate-400" data-testid="hud-xp-text">
                {player.xp}/{xpMax}
              </span>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur"
            data-testid="hud-coins-pill"
          >
            <CoinIcon />
            <span className="font-heading text-[15px] font-bold text-slate-900" data-testid="hud-coins">
              {player.coins}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur"
            data-testid="hud-day-pill"
          >
            <CalendarDays className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span className="font-heading text-[15px] font-bold text-slate-900" data-testid="hud-day">
              Day {player.day}
            </span>
          </div>
        </div>
      </div>
      {objective && (
        <div className="pointer-events-none fixed inset-x-0 top-[72px] z-30 flex justify-center px-4 sm:top-[80px]">
          <div
            className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-slate-900/85 py-1.5 pl-3.5 pr-4 text-[13px] font-medium text-amber-50 shadow-lg backdrop-blur"
            data-testid="hud-objective"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            {objective}
          </div>
        </div>
      )}
    </>
  );
}
