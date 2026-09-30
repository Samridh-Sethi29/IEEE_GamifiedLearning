import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Hammer, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/core/button";
import GameHUD, { CoinIcon } from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";

// Shared shell for the five placeholder world scenes: a themed animated backdrop,
// a game-style panel describing the coming quests, progress stats, and the
// "Return to World Map" control. Gameplay modules plug in below the panel later.
export default function WorldSceneLayout({ world, backTo = "/world" }) {
  const { player } = usePlayer();
  const scene = world.scene;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: scene.bg }} data-testid={`world-scene-${world.id}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(52% 60% at 50% 0%, ${world.color}26 0%, transparent 70%), radial-gradient(45% 50% at 85% 100%, ${world.color}1f 0%, transparent 70%)`,
        }}
      />
      {scene.emojis.map((emoji, i) => (
        <span
          key={`${emoji}-${i}`}
          aria-hidden="true"
          className="scene-float pointer-events-none absolute select-none opacity-70"
          style={{
            left: `${8 + ((i * 37) % 88)}%`,
            top: `${12 + ((i * 53) % 68)}%`,
            fontSize: `${22 + (i % 3) * 12}px`,
            animationDuration: `${4.5 + (i % 3)}s`,
            animationDelay: `${-i * 0.9}s`,
          }}
        >
          {emoji}
        </span>
      ))}

      <GameHUD objective={scene.objective} />

      <div className="flex h-full items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="w-full max-w-xl rounded-3xl border-4 border-white/90 bg-white/95 p-7 shadow-2xl shadow-slate-900/25 sm:p-8"
          data-testid={`world-panel-${world.id}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-inner" style={{ background: world.colorSoft }}>
              {world.icon}
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: world.colorDeep }}>
                {scene.kicker}
              </p>
              <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-slate-900" data-testid={`world-title-${world.id}`}>
                {world.name}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{scene.tagline}</p>

          {scene.underConstruction ? (
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-[13px] leading-snug text-slate-500">
              <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{scene.underConstruction}</span>
            </div>
          ) : scene.readyMessage ? (
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-[13px] leading-snug text-emerald-700 font-bold">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <span>{scene.readyMessage}</span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {scene.features.map((feature) => (
              <span key={feature} className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: world.colorSoft, color: world.colorDeep }}>
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500" data-testid={`world-stats-${world.id}`}>
              <CoinIcon className="h-5 w-5" />
              <span className="text-slate-800" data-testid={`world-coins-${world.id}`}>
                {player.coins}
              </span>
              <span className="text-slate-300">•</span>
              <span data-testid={`world-day-${world.id}`}>Day {player.day}</span>
            </div>
            <div className="flex gap-2">
              <Link to={backTo} className={buttonVariants({ variant: "secondary", size: "lg" })} data-testid="return-to-map-button">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Return
              </Link>
              {scene.proceedRoute && (
                <Link to={scene.proceedRoute} className={buttonVariants({ variant: "default", size: "lg" })}>
                  Proceed
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
