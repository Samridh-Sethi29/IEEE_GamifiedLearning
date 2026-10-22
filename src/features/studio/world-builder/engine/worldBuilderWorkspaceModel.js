// Pure logic and storage helpers for World Builder workspace initialization and view routing.
// Pure JavaScript: zero React, zero DOM, and zero player-state mutations.

import { createProject } from "../../engine/schema.js";
import { createDocumentStorage } from "../../storage/documentStorage.js";
import { MISSION } from "../data/mission.js";

export const WORLD_BUILDER_STORAGE_KEY = "skillverse_world_builder_doc_v1";

/**
 * Resolves whether the user is viewing the mission briefing or the construction editor.
 */
export function resolveWorldBuilderView(searchParams) {
  if (!searchParams) return "briefing";
  const mode = typeof searchParams.get === "function" ? searchParams.get("mode") : searchParams.mode;
  return mode === "edit" ? "editor" : "briefing";
}

/**
 * Creates document storage for World Builder using its dedicated storage key.
 */
export function createWorldBuilderStorage(storage = undefined) {
  return createDocumentStorage({ storage, key: WORLD_BUILDER_STORAGE_KEY });
}

/**
 * Creates a clean default World Builder project.
 */
export function createDefaultWorldBuilderProject() {
  return createProject({
    title: `${MISSION.title} — World Builder`,
    type: "world-builder",
  });
}

/**
 * Loads a World Builder project from storage and validates it.
 * Returns detailed outcome: { ok, empty, project, code, message, errors, version }
 * Never throws. Never alters or overwrites storage.
 */
export function loadWorldBuilderProject(storage) {
  if (!storage || typeof storage.load !== "function") {
    return {
      ok: true,
      empty: true,
      project: createDefaultWorldBuilderProject(),
    };
  }

  const loaded = storage.load();
  if (!loaded.ok) {
    return {
      ok: false,
      empty: false,
      code: loaded.code || "load_failed",
      message: loaded.message || "Failed to load project.",
      errors: loaded.errors || [],
      version: loaded.version,
      project: null,
    };
  }

  if (loaded.empty || !loaded.project) {
    return {
      ok: true,
      empty: true,
      project: createDefaultWorldBuilderProject(),
    };
  }

  if (loaded.project.type !== "world-builder") {
    return {
      ok: false,
      empty: false,
      code: "invalid_project",
      message: "The saved document is not a World Builder project.",
      project: null,
    };
  }

  return {
    ok: true,
    empty: false,
    project: loaded.project,
  };
}

/**
 * Initializes the World Builder project.
 * Restores a saved project if one exists in storage, or creates a clean new World Builder document.
 * Backward compatible: returns a valid project object even if load fails,
 * while loadWorldBuilderProject should be used when failure details are needed.
 */
export function initializeWorldBuilderProject(storage) {
  const result = loadWorldBuilderProject(storage);
  if (result.ok && result.project) {
    return result.project;
  }
  return createDefaultWorldBuilderProject();
}

