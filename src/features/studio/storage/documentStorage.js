// Minimal local save/load adapter for ONE project document. Future phases can build a gallery
// on top of it. It uses its own key and never touches the player-profile save.
//
// What it really does: writes the validated JSON text to the given Storage (localStorage by
// default). Every call reports success or a reason for failure; storage being missing, full or
// blocked is handled, not thrown.
//
// Data safety: if the key already holds something this version can't read (corrupt or a newer
// schema), `save` REFUSES to overwrite it unless `{ replaceUnreadable: true }` is passed, and
// then it first copies the old text to `<key>__backup`.

import { DEMO_STORAGE_KEY } from "../engine/constants.js";
import { deserializeProject, serializeProject } from "./serialization.js";

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // access itself can throw (blocked cookies / privacy mode)
  }
}

const unavailable = { ok: false, code: "storage_unavailable", message: "Saving isn't available in this browser right now." };

export function createDocumentStorage({ storage, key = DEMO_STORAGE_KEY } = {}) {
  const store = () => storage ?? defaultStorage();
  const backupKey = `${key}__backup`;

  function readRaw(s, targetKey = key) {
    try {
      return { ok: true, raw: s.getItem(targetKey) };
    } catch {
      return { ok: false, ...unavailable };
    }
  }

  return {
    key,
    backupKey,

    load() {
      const s = store();
      if (!s) return unavailable;
      const read = readRaw(s, key);
      if (!read.ok) return read;
      if (read.raw === null) return { ok: true, empty: true, project: null };
      return deserializeProject(read.raw);
    },

    hasBackup() {
      const s = store();
      if (!s) return false;
      try {
        return s.getItem(backupKey) !== null;
      } catch {
        return false;
      }
    },

    loadBackup() {
      const s = store();
      if (!s) return unavailable;
      const read = readRaw(s, backupKey);
      if (!read.ok) return read;
      if (read.raw === null) return { ok: true, empty: true, project: null };
      return deserializeProject(read.raw);
    },

    restoreBackup() {
      const s = store();
      if (!s) return unavailable;
      const read = readRaw(s, backupKey);
      if (!read.ok) return read;
      if (read.raw === null) return { ok: false, code: "no_backup", message: "No backup document was found." };
      const parsed = deserializeProject(read.raw);
      if (!parsed.ok) return parsed;
      try {
        s.setItem(key, read.raw);
        return { ok: true, project: parsed.project };
      } catch (err) {
        const full = err && (err.name === "QuotaExceededError" || err.code === 22);
        return {
          ok: false,
          code: full ? "storage_full" : "storage_unavailable",
          message: full ? "There isn't enough space to restore this backup." : unavailable.message,
        };
      }
    },

    save(project, { replaceUnreadable = false } = {}) {
      const s = store();
      if (!s) return unavailable;
      const out = serializeProject(project);
      if (!out.ok) return out;
      const read = readRaw(s, key);
      if (!read.ok) return read;
      try {
        if (read.raw !== null) {
          const existing = deserializeProject(read.raw);
          if (!existing.ok) {
            if (!replaceUnreadable) {
              return { ok: false, code: "would_overwrite_unreadable", message: `${existing.message} Saving now would replace it.` };
            }
            s.setItem(backupKey, read.raw);
          }
        }
        s.setItem(key, out.text);
        return { ok: true };
      } catch (err) {
        const full = err && (err.name === "QuotaExceededError" || err.code === 22);
        return {
          ok: false,
          code: full ? "storage_full" : "storage_unavailable",
          message: full ? "There isn't enough space to save this." : unavailable.message,
        };
      }
    },
  };
}
