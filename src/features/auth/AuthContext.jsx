import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { ApiError } from "@/services/api";

const AuthContext = createContext(null);

const GUEST_KEY = "skillverse_is_guest";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize: check if existing token is valid
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = api.getToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (isMounted && res?.user) {
          setUser(res.user);
          setIsGuest(false);
          try {
            localStorage.removeItem(GUEST_KEY);
          } catch {}
        }
      } catch (err) {
        console.warn("[Auth] Failed to restore session:", err?.message || err);
        if (isMounted) {
          setUser(null);
          api.clearToken();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for 401 unauthorized calls from API
    const unsubscribe = api.onUnauthorized(() => {
      if (isMounted) {
        setUser(null);
        setAuthError("Session expired. Please log in again.");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_KEY);
      } catch {}
      return res;
    } catch (err) {
      const msg = err?.data?.error || err.message || "Failed to log in.";
      setAuthError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setAuthError(null);
    try {
      const res = await api.register(username, email, password);
      api.setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_KEY);
      } catch {}
      return res;
    } catch (err) {
      const msg = err?.data?.error || err.message || "Failed to register.";
      setAuthError(msg);
      throw err;
    }
  }, []);

  const playAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    setAuthError(null);
    api.clearToken();
    try {
      localStorage.setItem(GUEST_KEY, "true");
    } catch {}
  }, []);

  const logout = useCallback(async (beforeLogoutCallback) => {
    if (typeof beforeLogoutCallback === "function") {
      try {
        await beforeLogoutCallback();
      } catch (e) {
        console.warn("[Auth] Best-effort save on logout failed:", e);
      }
    }

    setUser(null);
    setIsGuest(false);
    setAuthError(null);
    api.clearToken();
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {}
  }, []);

  const value = {
    user,
    token: api.getToken(),
    isGuest,
    isAuthenticated: Boolean(user && api.getToken()),
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    playAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
