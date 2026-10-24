import React from "react";
import { Star, Package, Coins, Store, Sparkles, BookOpen } from "lucide-react";

const GOALS = [
  { icon: Star, label: "Serve customers", tint: "bg-amber-100 text-amber-500 border-amber-300" },
  { icon: Package, label: "Manage your stock", tint: "bg-orange-100 text-orange-500 border-orange-300" },
  { icon: Coins, label: "Earn money", tint: "bg-yellow-100 text-yellow-600 border-yellow-300" },
  { icon: Store, label: "Grow your store", tint: "bg-sky-100 text-sky-500 border-sky-300" }
];

function Shopkeeper({ size = 150 }) {
  return (
    <svg viewBox="0 0 120 130" style={{ width: size, height: size }} aria-hidden="true">
      <ellipse cx="60" cy="122" rx="34" ry="6" fill="rgba(0,0,0,0.12)" />
      <path d="M30 128 Q30 92 60 92 Q90 92 90 128 Z" fill="#fff" />
      <path d="M40 128 L42 98 L78 98 L80 128 Z" fill="#2563eb" />
      <circle cx="60" cy="52" r="34" fill="#2b1a12" />
      <circle cx="30" cy="40" r="12" fill="#2b1a12" />
      <circle cx="60" cy="58" r="28" fill="#fed7aa" />
      <path d="M32 50 Q60 28 88 50 Q80 36 60 34 Q40 36 32 50 Z" fill="#2b1a12" />
      <circle cx="49" cy="60" r="4" fill="#1e293b" />
      <circle cx="71" cy="60" r="4" fill="#1e293b" />
      <circle cx="50" cy="58.5" r="1.3" fill="#fff" />
      <circle cx="72" cy="58.5" r="1.3" fill="#fff" />
      <path d="M52 72 Q60 80 68 72" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="70" r="4" fill="#fb7185" opacity="0.55" />
      <circle cx="78" cy="70" r="4" fill="#fb7185" opacity="0.55" />
    </svg>
  );
}

export default function WelcomeScreen({ onStartGame, onOpenLearnMoney }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-sky-200/70 backdrop-blur-md select-none animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 shadow-2xl overflow-hidden">
        {/* soft clouds / hills */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/70 blur-2xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-56 h-40 rounded-full bg-white/60 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 left-0 right-0 h-48 bg-emerald-200/60 rounded-[50%] pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-8 items-center">
          {/* LEFT: title + mascot */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-300" />
              <h1
                className="font-black text-5xl sm:text-6xl leading-none tracking-tight text-sky-500"
                style={{ WebkitTextStroke: "3px #fff", paintOrder: "stroke fill", textShadow: "0 4px 0 #0ea5e9" }}
              >
                Skillz
              </h1>
              <Star className="w-5 h-5 text-amber-400 fill-amber-300" />
            </div>
            <div className="mt-2 px-6 py-1.5 rounded-full bg-sky-600 text-white font-black text-xl sm:text-2xl border-4 border-white shadow-lg">
              Marketing Game
            </div>
            <p className="mt-3 text-sm sm:text-base font-bold text-indigo-900 max-w-xs">
              Run your own store, serve customers, manage stock and learn real-world money skills!
            </p>
            <div className="mt-2">
              <Shopkeeper size={150} />
            </div>
          </div>

          {/* RIGHT: My Market card */}
          <div className="rounded-3xl bg-white/90 border-4 border-white shadow-xl overflow-hidden">
            {/* Striped awning */}
            <div
              className="h-12 w-full"
              style={{
                background:
                  "repeating-linear-gradient(90deg,#ef4444 0 36px,#ffffff 36px 72px)",
                borderBottom: "6px solid #b91c1c",
                borderRadius: "0 0 18px 18px"
              }}
            />
            <div className="px-4 pt-3 pb-4">
              <div className="mx-auto -mt-1 mb-3 w-fit px-6 py-1.5 rounded-xl bg-gradient-to-b from-amber-600 to-amber-700 border-4 border-amber-900 shadow-md">
                <span className="font-black text-xl text-amber-100 tracking-wide">My Market</span>
              </div>

              <ul className="space-y-2">
                {GOALS.map(({ icon: Icon, label, tint }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-sky-50 border-2 border-sky-100 px-3 py-2"
                  >
                    <span className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${tint}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="font-extrabold text-sm text-slate-700">{label}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onStartGame}
                className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white font-black text-xl border-b-4 border-green-800 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 active:border-b-2"
              >
                <Sparkles className="w-5 h-5" />
                Let's Play!
              </button>

              <button
                onClick={onOpenLearnMoney}
                className="mt-2 w-full py-2 rounded-xl text-xs font-extrabold text-sky-700 hover:bg-sky-50 flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                Learn about money first
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
