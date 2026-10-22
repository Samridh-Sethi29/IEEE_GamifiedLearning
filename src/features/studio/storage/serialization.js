// Project <-> JSON text. Never throws on bad input: returns a result object instead, so callers
// can show a clear message. Unreadable input is reported, never altered or discarded here.

import { SCHEMA_VERSION, SUPPORTED_SCHEMA_VERSIONS } from "../engine/constants.js";
import { normalizeProject, validateProject } from "../engine/schema.js";

/** Error codes: malformed_json | not_a_project | unsupported_version | invalid_project */

export function serializeProject(project) {
  const check = validateProject(project);
  if (!check.ok) {
    return { ok: false, code: "invalid_project", message: `This project can't be saved: ${check.errors[0]}.`, errors: check.errors };
  }
  return { ok: true, text: JSON.stringify(project) };
}

export function deserializeProject(text) {
  if (typeof text !== "string") {
    return { ok: false, code: "malformed_json", message: "There is no project text to read." };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, code: "malformed_json", message: "This isn't valid project data (it couldn't be read as JSON)." };
  }
  return parseProjectData(data);
}

/** Same checks for data that is already a JS value (e.g. a file the player picked). */
export function parseProjectData(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, code: "not_a_project", message: "This doesn't look like a project." };
  }
  const v = data.schemaVersion;
  if (!Number.isInteger(v)) {
    return { ok: false, code: "unsupported_version", message: "This project has no readable schema version, so it can't be opened safely.", version: v };
  }
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(v)) {
    const newer = v > SCHEMA_VERSION;
    return {
      ok: false,
      code: "unsupported_version",
      version: v,
      message: newer
        ? `This project was made with a newer version of the studio (schema ${v}). This copy understands schema ${SCHEMA_VERSION}. Your data was left untouched.`
        : `This project uses an old format (schema ${v}) that can't be opened any more. Your data was left untouched.`,
    };
  }
  const check = validateProject(data);
  if (!check.ok) {
    return { ok: false, code: "invalid_project", message: `This project is damaged: ${check.errors[0]}.`, errors: check.errors };
  }
  return { ok: true, project: normalizeProject(data) };
}
