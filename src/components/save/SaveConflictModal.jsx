import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Cloud, HardDrive, Check, Sparkles } from "lucide-react";
import { CoinIcon } from "@/features/hud/components/GameHUD";

export default function SaveConflictModal({
  isOpen,
  localSave,
  cloudSave,
  cloudMeta,
  onResolve,
}) {
  if (!isOpen || !localSave || !cloudSave) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Which progress do you want to keep?
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                We found different adventures on this device and in the cloud. Choose which one to continue!
              </p>
            </div>
          </div>

          {/* Cards Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Save Option */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-500 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
                  <HardDrive className="w-4 h-4" />
                  <span>On This Device</span>
                </div>
                <div className="text-3xl font-black text-white mb-3">
                  Day {localSave.day || 1}
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Coins</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <CoinIcon className="w-4 h-4" /> {localSave.coins || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">XP</span>
                    <span className="font-bold text-emerald-400">{localSave.xp || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Water</span>
                    <span className="font-bold text-sky-400">{localSave.water || 0} L</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onResolve(localSave)}
                className="mt-5 w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-md"
              >
                <Check className="w-4 h-4 text-indigo-400" />
                <span>Keep Local Save</span>
              </button>
            </div>

            {/* Cloud Save Option */}
            <div className="bg-gradient-to-b from-indigo-950/60 to-slate-800 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-lg shadow-emerald-500/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Cloud className="w-4 h-4" />
                    <span>Cloud Backup</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate(cloudMeta?.updatedAt)}
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-300 mb-3">
                  Day {cloudSave.day || 1}
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Coins</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <CoinIcon className="w-4 h-4" /> {cloudSave.coins || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">XP</span>
                    <span className="font-bold text-emerald-400">{cloudSave.xp || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Water</span>
                    <span className="font-bold text-sky-400">{cloudSave.water || 0} L</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onResolve(cloudSave)}
                className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Keep Cloud Save</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-slate-400">
            * The version you select will become your active save and synchronize to all your devices.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
