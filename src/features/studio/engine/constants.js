// Shared limits for the creation engine. Pure data: no React, no DOM.

export const SCHEMA_VERSION = 1;
export const SUPPORTED_SCHEMA_VERSIONS = [1];

// Which activity a document belongs to. `sandbox` is the engine demo / any generic workspace.
export const PROJECT_TYPES = ["sandbox", "world-builder", "invention-lab", "story-studio", "design-studio"];

export const CANVAS_LIMITS = { min: 200, max: 4000 };
export const DEFAULT_CANVAS = { width: 800, height: 500 };

export const MAX_OBJECTS = 200;
export const MAX_TITLE_LENGTH = 80;

// Undo history keeps at most this many past documents; the oldest are dropped first.
export const HISTORY_LIMIT = 100;

// Editing step sizes (workspace units / degrees).
export const MOVE_STEP = 8;
export const MOVE_STEP_FINE = 1;
export const ROTATE_STEP = 15;
export const RESIZE_FACTOR = 1.1;

// localStorage key for the OPTIONAL demo save/load. Deliberately unrelated to the player-profile save key.
export const DEMO_STORAGE_KEY = "skillverse_studio_engine_document_v1";
