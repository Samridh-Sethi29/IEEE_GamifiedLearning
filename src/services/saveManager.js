/**
 * SkillVerse Save Manager
 * Handles local vs cloud save synchronization, end-of-day saves,
 * offline queuing, conflict resolution, and schema migration.
 */

import api, { ApiError } from "@/services/api";
import { normalizeAchievements } from "@/features/achievements/engine/achievementEngine";

export const STORAGE_KEY = "skillverse_save"; // Matches usePlayer.js - DO NOT CHANGE
export const QUEUE_KEY = "skillverse_save_queue";
export const WORLD_PROGRESS_KEY = "skillverse_world_progress";
export const SCHEMA_VERSION = 1;

/**
 * Migration function for future flags and data structure changes.
 * Guarantees required pillars, flags, and default fields exist.
 */
export function migrateState(rawState, fromVersion = 1) {
  if (!rawState || typeof rawState !== "object") return null;

  const state = { ...rawState };

  // Ensure skills pillar object exists
  if (!state.skills || typeof state.skills !== "object") {
    state.skills = {
      life: 0,
      human: 0,
      digital: 0,
      vocational: 0,
      entrepreneurial: 0,
    };
  }

  // Ensure cross-world consequence flags object exists
  if (!state.flags || typeof state.flags !== "object") {
    state.flags = {};
  }

  // Ensure sustainability metric (0-100)
  if (typeof state.sustainability !== "number") {
    state.sustainability = 100;
  }

  // Ensure day exists
  if (typeof state.day !== "number" || state.day < 1) {
    state.day = 1;
  }

  // Ensure achievements object is normalized
  state.achievements = normalizeAchievements(state.achievements);

  // Future version migration hooks
  if (fromVersion < 1) {
    // Example: future migration steps
  }

  return state;
}

class SaveManager {
  constructor() {
    this.status = "idle"; // "idle" | "saving" | "saved" | "offline" | "conflict" | "error"
    this.statusListeners = new Set();
    this.worldProgress = this.loadLocalWorldProgress();
    this.isFlushing = false;
    this.statusTimeout = null;

    // Automatic queue sync when network connectivity returns
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[SaveManager] Network back online. Flushing queue...");
        this.flushQueue();
      });
    }
  }

  // Status management for UI indicators ("Saved ✓", "Saving...", "Offline - will sync")
  getStatus() {
    return this.status;
  }

  setStatus(newStatus) {
    this.status = newStatus;
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }

    // Auto-reset "saved" to "idle" after 3 seconds
    if (newStatus === "saved") {
      this.statusTimeout = setTimeout(() => {
        if (this.status === "saved") {
          this.setStatus("idle");
        }
      }, 3000);
    }

    for (const listener of this.statusListeners) {
      try {
        listener(newStatus);
      } catch (err) {
        console.error("Error in status listener:", err);
      }
    }
  }

  subscribeStatus(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  // World Progress registration for teammates
  loadLocalWorldProgress() {
    try {
      const stored = localStorage.getItem(WORLD_PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  setWorldProgress(worldName, progressData) {
    this.worldProgress = {
      ...this.worldProgress,
      [worldName]: {
        ...(this.worldProgress[worldName] || {}),
        ...progressData,
      },
    };
    try {
      localStorage.setItem(
        WORLD_PROGRESS_KEY,
        JSON.stringify(this.worldProgress)
      );
    } catch (e) {
      console.warn("Failed to persist world progress locally:", e);
    }
  }

  getWorldProgress() {
    return this.worldProgress || {};
  }

  // Offline queue management
  getQueue() {
    try {
      const q = localStorage.getItem(QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  addToQueue(payload) {
    try {
      const queue = this.getQueue();
      // Keep only the latest payload per day to prevent queue bloat
      const filtered = queue.filter((item) => item.day !== payload.day);
      filtered.push({ ...payload, queuedAt: new Date().toISOString() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
      this.setStatus("offline");
    } catch (e) {
      console.warn("Failed to write to save queue:", e);
    }
  }

  clearQueue() {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {}
  }

  async flushQueue() {
    if (this.isFlushing) return;
    const token = api.getToken();
    if (!token) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isFlushing = true;
    this.setStatus("saving");

    try {
      // Process newest queue entry
      const latestPayload = queue[queue.length - 1];
      await api.putSave({
        schemaVersion: latestPayload.schemaVersion || SCHEMA_VERSION,
        day: latestPayload.day,
        state: latestPayload.state,
        worldProgress: latestPayload.worldProgress || this.getWorldProgress(),
        clientUpdatedAt: latestPayload.clientUpdatedAt,
        force: true, // Queue flush uses force to reconcile offline progress
      });

      this.clearQueue();
      this.setStatus("saved");
    } catch (err) {
      console.warn("[SaveManager] Queue flush failed:", err?.message || err);
      this.setStatus("offline");
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Primary save hook called ONLY at the end of each day cycle.
   * Never crashes or blocks if API is unreachable.
   */
  async saveDay(stateSnapshot, extraWorldProgress = null, options = {}) {
    if (!stateSnapshot) {
      console.warn("[SaveManager] saveDay called with empty state.");
      return { success: false };
    }

    // 1. Immediately persist to localStorage so local session is 100% safe
    const migratedState = migrateState(stateSnapshot, SCHEMA_VERSION);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedState));
    } catch (e) {
      console.error("[SaveManager] Failed to write to localStorage:", e);
    }

    if (extraWorldProgress && typeof extraWorldProgress === "object") {
      for (const [w, data] of Object.entries(extraWorldProgress)) {
        this.setWorldProgress(w, data);
      }
    }

    // 2. Check auth
    const token = api.getToken();
    if (!token) {
      // Guest or logged out: local save only
      this.setStatus("saved");
      return { success: true, localOnly: true };
    }

    // 3. Attempt cloud save
    this.setStatus("saving");
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      day: migratedState.day || 1,
      state: migratedState,
      worldProgress: this.getWorldProgress(),
      clientUpdatedAt: new Date().toISOString(),
      force: Boolean(options.force),
    };

    try {
      const res = await api.putSave(payload);
      // Clean up queue if this day was in it
      const queue = this.getQueue().filter((item) => item.day !== payload.day);
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      } catch {}

      this.setStatus("saved");
      return { success: true, save: res?.save };
    } catch (err) {
      // Conflict check (409)
      if (err.status === 409) {
        this.setStatus("conflict");
        return {
          success: false,
          conflict: true,
          serverSave: err.data?.serverSave,
          localSave: migratedState,
        };
      }

      // Network error / server unreachable / 500: Queue offline & keep going
      console.warn(
        "[SaveManager] Network save failed. Queuing for background sync:",
        err.message || err
      );
      this.addToQueue(payload);
      this.setStatus("offline");
      return { success: true, queued: true, offline: true };
    }
  }

  /**
   * Loads save on login/init.
   * Compares local and cloud saves, flagging conflicts if detected.
   */
  async load() {
    let localSave = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localSave = migrateState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("[SaveManager] Could not parse local save:", e);
    }

    const token = api.getToken();
    if (!token) {
      return { source: "local", state: localSave };
    }

    try {
      const res = await api.getSave();
      const cloudSave = res?.save;

      if (!cloudSave || !cloudSave.state) {
        // No cloud save exists yet
        return { source: "local", state: localSave };
      }

      const cloudState = migrateState(cloudSave.state, cloudSave.schemaVersion);

      // Hydrate world progress if available in cloud
      if (cloudSave.worldProgress) {
        this.worldProgress = {
          ...this.worldProgress,
          ...cloudSave.worldProgress,
        };
        try {
          localStorage.setItem(
            WORLD_PROGRESS_KEY,
            JSON.stringify(this.worldProgress)
          );
        } catch {}
      }

      if (!localSave) {
        // Only cloud save exists: hydrate local store
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
        } catch {}
        return { source: "cloud", state: cloudState };
      }

      // Both exist: check for conflict
      const localDay = localSave.day || 1;
      const cloudDay = cloudSave.day || cloudState.day || 1;

      // If days differ or states have significant divergence
      const isDayDifferent = localDay !== cloudDay;
      const isStateDifferent =
        JSON.stringify(localSave) !== JSON.stringify(cloudState);

      if (isDayDifferent || isStateDifferent) {
        return {
          hasConflict: true,
          localSave,
          cloudSave: cloudState,
          cloudMeta: {
            day: cloudDay,
            updatedAt: cloudSave.updatedAt,
            schemaVersion: cloudSave.schemaVersion,
          },
        };
      }

      // Identical
      return { source: "synced", state: cloudState };
    } catch (err) {
      console.warn(
        "[SaveManager] Failed to fetch cloud save (offline mode):",
        err?.message || err
      );
      this.setStatus("offline");
      return { source: "local", state: localSave, offline: true };
    }
  }

  /**
   * Resolves a conflict chosen by player.
   */
  async resolveConflict(chosenState, { syncToCloud = true } = {}) {
    const migrated = migrateState(chosenState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch {}

    if (syncToCloud && api.getToken()) {
      return this.saveDay(migrated, null, { force: true });
    }
    return { success: true };
  }

  /**
   * Best-effort save on logout.
   */
  async saveOnLogout() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && api.getToken()) {
        const state = JSON.parse(stored);
        await this.saveDay(state, null, { force: true });
      }
    } catch (e) {
      console.warn("[SaveManager] Best-effort logout save failed:", e);
    }
  }
}

export const saveManager = new SaveManager();
export default saveManager;
