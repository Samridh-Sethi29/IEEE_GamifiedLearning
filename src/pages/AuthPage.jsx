import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/features/auth/AuthContext";
import saveManager from "@/services/saveManager";
import { queryClient } from "@/lib/queryClient";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Gamepad2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Cloud,
  ShieldCheck,
} from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, playAsGuest } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const destination = location.state?.from?.pathname || "/world";

  const handlePostAuthNavigation = async () => {
    try {
      // Hydrate state from cloud save if available
      const loaded = await saveManager.load();
      if (loaded?.state) {
        queryClient.setQueryData(["player"], loaded.state);
        // Check if player is brand new
        if (loaded.state.day === 1 && loaded.state.xp === 0 && !loaded.state.flags?.onboardingComplete) {
          navigate("/onboarding", { replace: true });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to hydrate save during auth:", e);
    }
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic frontend checks
    if (mode === "register" && (!username.trim() || username.trim().length < 3)) {
      setErrorMessage("Username must be at least 3 characters long.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register(username.trim(), email.trim(), password);
        setSuccessMessage("Account created! Loading your world...");
      } else {
        await login(email.trim(), password);
        setSuccessMessage("Welcome back! Loading your world...");
      }

      await handlePostAuthNavigation();
    } catch (err) {
      console.error("[Auth Error]", err);
      if (err.isOffline || err.status === 0) {
        setErrorMessage(
          "Cannot connect to the game server. You can still play offline as a Guest!"
        );
      } else {
        setErrorMessage(
          err?.data?.error || err.message || "Something went wrong. Please check your details."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAsGuest = () => {
    playAsGuest();
    navigate(destination, { replace: true });
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-center">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 mb-3">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="text-emerald-400">Skill</span>Verse
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live a Day. Learn a Life.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-2xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === "login"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === "register"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Explorer Name (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Maya_Explorer"
                    required
                    disabled={isSubmitting}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span>Connecting...</span>
                  <Loader2 className="w-5 h-5 animate-spin" />
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Start Adventure" : "Join SkillVerse"}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/60" />
            </div>
            <span className="relative bg-slate-800 px-3 text-xs uppercase font-bold text-slate-400 tracking-wider">
              or
            </span>
          </div>

          {/* Play as Guest Option */}
          <div className="bg-slate-900/60 border border-slate-700/70 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5 text-amber-300 font-bold text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>Just want to try it out?</span>
            </div>
            <p className="text-slate-400 text-xs mb-3">
              Play without an account. Progress is stored on this device only.
            </p>
            <button
              type="button"
              onClick={handlePlayAsGuest}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Play as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Benefits info pill */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accounts keep your game progress safe in the cloud</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
