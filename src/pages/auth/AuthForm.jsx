import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/features/auth/AuthContext";
import saveManager from "@/services/saveManager";
import { queryClient } from "@/lib/queryClient";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Gamepad2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Cloud,
} from "lucide-react";
import "./auth.css";

/**
 * Shared auth screen. `mode` is "login" or "register".
 * Rendered by LoginPage (/login) and RegisterPage (/register).
 */
export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, playAsGuest } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (isRegister && (!username.trim() || username.trim().length < 3)) {
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
      if (isRegister) {
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
          "Cannot connect to the game server. You can still play offline as a Guest!",
        );
      } else {
        setErrorMessage(
          err?.data?.error ||
            err.message ||
            "Something went wrong. Please check your details.",
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
    <div className="sv-auth">
      <motion.div
        className="sv-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <header className="sv-brand">
          <div className="sv-logo">
            <Sparkles size={30} />
          </div>
          <h1>SkillVerse</h1>
          <p>Live a Day. Learn a Life.</p>
        </header>

        <main className="sv-card">
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="sv-sub">
            {isRegister
              ? "Pick a name and save your progress in the cloud."
              : "Log in to pick up where you left off."}
          </p>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="error"
                role="alert"
                className="sv-alert sv-alert--error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                key="success"
                role="status"
                className="sv-alert sv-alert--success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <CheckCircle2 size={20} />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="sv-form" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <div className="sv-field">
                <label className="sv-label" htmlFor="auth-username">
                  Username
                </label>
                <div className="sv-input-wrap">
                  <User className="sv-icon" />
                  <input
                    id="auth-username"
                    className="sv-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Maya_Explorer"
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="sv-field">
              <label className="sv-label" htmlFor="auth-email">
                Email address
              </label>
              <div className="sv-input-wrap">
                <Mail className="sv-icon" />
                <input
                  id="auth-email"
                  className="sv-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="sv-field">
              <label className="sv-label" htmlFor="auth-password">
                Password
              </label>
              <div className="sv-input-wrap">
                <Lock className="sv-icon" />
                <input
                  id="auth-password"
                  className="sv-input sv-input--password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="sv-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isRegister && (
                <p className="sv-hint">Use at least 6 characters.</p>
              )}
            </div>

            <button
              type="submit"
              className="sv-btn sv-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span>Connecting...</span>
                  <Loader2 size={20} className="animate-spin" />
                </>
              ) : (
                <>
                  <span>{isRegister ? "Create account" : "Log in"}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="sv-switch">
            {isRegister ? "Already have an account? " : "New to SkillVerse? "}
            <Link
              to={isRegister ? "/login" : "/register"}
              state={location.state}
              replace
            >
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>

          <div className="sv-divider">or</div>

          <section className="sv-guest">
            <h3>
              <Gamepad2 size={20} />
              <span>Just want to try it out?</span>
            </h3>
            <p>Play without an account. Progress is saved on this device only.</p>
            <button
              type="button"
              className="sv-btn sv-btn--outline"
              onClick={handlePlayAsGuest}
            >
              <span>Play as guest</span>
              <ArrowRight size={18} />
            </button>
          </section>

          <p className="sv-note">
            <Cloud size={16} />
            <span>Accounts keep your progress safe in the cloud</span>
          </p>
        </main>
      </motion.div>
    </div>
  );
}
