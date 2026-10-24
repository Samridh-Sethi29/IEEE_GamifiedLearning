/**
 * SkillVerse API Service
 * Central fetch wrapper that attaches JWT tokens, handles 401 unauth,
 * and standardizes error responses.
 */

const TOKEN_KEY = "skillverse_token";
const DEFAULT_BASE_URL = "http://localhost:5000/api";

class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || DEFAULT_BASE_URL;
    this.unauthorizedListeners = new Set();
  }

  // Token management in localStorage
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn("Could not access localStorage for token:", e);
    }
  }

  clearToken() {
    this.setToken(null);
  }

  // Register listener for 401 Unauthorized events (e.g. for AuthContext to log out)
  onUnauthorized(callback) {
    this.unauthorizedListeners.add(callback);
    return () => this.unauthorizedListeners.delete(callback);
  }

  notifyUnauthorized() {
    this.clearToken();
    for (const listener of this.unauthorizedListeners) {
      try {
        listener();
      } catch (err) {
        console.error("Error in onUnauthorized listener:", err);
      }
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      // Offline / network failure / server down
      const error = new ApiError(0, {
        error: "Server is unreachable. Working in offline mode.",
        isNetworkError: true,
      });
      error.isOffline = true;
      throw error;
    }

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.notifyUnauthorized();
      }
      throw new ApiError(response.status, data || { error: response.statusText });
    }

    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Auth Endpoints
  register(username, email, password) {
    return this.post("/auth/register", { username, email, password });
  }

  login(email, password) {
    return this.post("/auth/login", { email, password });
  }

  getMe() {
    return this.get("/auth/me");
  }

  // Save Endpoints
  getSave() {
    return this.get("/save");
  }

  putSave(savePayload) {
    return this.put("/save", savePayload);
  }

  // Health
  checkHealth() {
    return this.get("/health");
  }
}

export const api = new ApiService();
export { ApiError };
export default api;
