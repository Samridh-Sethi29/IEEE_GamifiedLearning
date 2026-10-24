import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Sparkles,
  LogOut,
  LogIn,
  Check,
  CloudOff,
  Loader2,
  AlertCircle,
  Cloud,
  User,
} from "lucide-react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/AuthContext";
import saveManager from "@/services/saveManager";
import { queryClient } from "@/lib/queryClient";
import SaveConflictModal from "@/components/save/SaveConflictModal";

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

export default function GameHUD({ objective }) {
  const navigate = useNavigate();
  const { player } = usePlayer();
  const { user, isGuest, isAuthenticated, logout } = useAuth();

  const [saveStatus, setSaveStatus] = useState(saveManager.getStatus());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [conflictModalData, setConflictModalData] = useState(null);

  // Subscribe to save status updates from SaveManager
  useEffect(() => {
    const unsubscribe = saveManager.subscribeStatus((status) => {
      setSaveStatus(status);
    });
    return unsubscribe;
  }, []);

  const xpMax = (player.level || 1) * 100;
  const xpPct = Math.min(100, Math.round(((player.xp || 0) / xpMax) * 100));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(async () => {
        await saveManager.saveOnLogout();
      });
    } finally {
      setIsLoggingOut(false);
      navigate("/auth");
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleResolveConflict = async (chosen) => {
    await saveManager.resolveConflict(chosen, { syncToCloud: true });
    queryClient.setQueryData(["player"], chosen);
    setConflictModalData(null);
    saveManager.setStatus("saved");
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4" style={{ paddingLeft: "max(12px, env(safe-area-inset-left))", paddingRight: "max(12px, env(safe-area-inset-right))", paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        {/* Left: Player Identity & Sync Indicator */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/profile")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/profile")}
            title="View Player Profile & Progress"
            className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 py-2 pl-2.5 pr-4 shadow-lg shadow-emerald-950/15 backdrop-blur cursor-pointer hover:bg-emerald-50/90 hover:border-emerald-300 transition-all active:scale-[0.98]"
            data-testid="hud-player-card"
          >
            <MiniAvatar />
            <div className="min-w-[120px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-heading text-[15px] font-bold leading-tight text-slate-900"
                  data-testid="hud-player-name"
                >
                  {user?.username || player.name}
                </span>
                {isGuest && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase tracking-wider">
                    Guest
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600"
                  data-testid="hud-player-level"
                >
                  Lv {player.level || 1}
                </span>
                <span
                  className="relative h-1.5 w-16 sm:w-20 overflow-hidden rounded-full bg-slate-200"
                  data-testid="hud-xp-bar"
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-700"
                    style={{ width: `${xpPct}%` }}
                    data-testid="hud-xp-fill"
                  />
                </span>
                <span className="text-[10px] font-medium text-slate-400" data-testid="hud-xp-text">
                  {player.xp || 0}/{xpMax}
                </span>
              </div>
            </div>
          </div>

          {/* Non-blocking Cloud Sync Status Indicator */}
          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold shadow-md backdrop-blur">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Saving...</span>
            </div>
          )}

          {saveStatus === "saved" && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-md backdrop-blur">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved ✓</span>
            </div>
          )}

          {saveStatus === "offline" && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-md backdrop-blur">
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline - will sync</span>
            </div>
          )}

          {saveStatus === "conflict" && (
            <button
              onClick={() => {
                // If conflict status is triggered, invoke load to retrieve both versions
                saveManager.load().then((res) => {
                  if (res?.hasConflict) {
                    setConflictModalData(res);
                  }
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold shadow-md backdrop-blur animate-pulse"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Conflict - review</span>
            </button>
          )}
        </div>

        {/* Right: Coins, Day, and Logout / Sign-in Action */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur"
            data-testid="hud-coins-pill"
          >
            <CoinIcon />
            <span className="font-heading text-[15px] font-bold text-slate-900" data-testid="hud-coins">
              {player.coins || 0}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur"
            data-testid="hud-day-pill"
          >
            <CalendarDays className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span className="font-heading text-[15px] font-bold text-slate-900" data-testid="hud-day">
              Day {player.day || 1}
            </span>
          </div>

          {/* Profile Navigation Button */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            title="View Player Profile & Progress"
            className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors"
            data-testid="hud-profile-btn"
          >
            <User className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Account Action: Logout if authenticated, or Sign In if Guest */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Log Out of SkillVerse"
              className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-lg shadow-emerald-950/15 backdrop-blur hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-bold text-xs transition-colors"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Log Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              title="Log in or create an account to save progress online"
              className="flex items-center gap-1.5 rounded-2xl border border-emerald-400 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2.5 shadow-lg shadow-emerald-500/20 font-black text-xs transition-all active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
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

      {/* Save Conflict Modal */}
      {conflictModalData && (
        <SaveConflictModal
          isOpen={Boolean(conflictModalData)}
          localSave={conflictModalData.localSave}
          cloudSave={conflictModalData.cloudSave}
          cloudMeta={conflictModalData.cloudMeta}
          onResolve={handleResolveConflict}
        />
      )}
    </>
  );
}
