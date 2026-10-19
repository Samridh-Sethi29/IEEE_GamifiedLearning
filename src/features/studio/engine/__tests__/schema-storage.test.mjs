import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_STORAGE_KEY, SCHEMA_VERSION } from "../constants.js";
import { createObject, createProject, isJsonValue, validateProject } from "../schema.js";
import { OBJECT_TYPE_IDS } from "../objectTypes.js";
import { deserializeProject, serializeProject } from "../../storage/serialization.js";
import { createDocumentStorage } from "../../storage/documentStorage.js";

const good = () => createProject({ id: "p", now: "2026-01-01T00:00:00.000Z", objects: [createObject("tree", { id: "t", layer: 0 })] });
const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
};

test("every object type builds a valid object", () => {
  for (const t of OBJECT_TYPE_IDS) {
    const doc = createProject({ objects: [createObject(t, { id: `o-${t}`, layer: 0 })] });
    assert.deepEqual(validateProject(doc).errors, [], t);
  }
});

test("a project is JSON-serialisable and round-trips exactly", () => {
  const doc = good();
  assert.equal(isJsonValue(doc), true);
  const out = serializeProject(doc);
  assert.equal(out.ok, true);
  const back = deserializeProject(out.text);
  assert.equal(back.ok, true);
  assert.deepEqual(back.project, doc);
});

test("9. malformed documents are rejected with clear codes", () => {
  assert.equal(deserializeProject("{not json").code, "malformed_json");
  assert.equal(deserializeProject(undefined).code, "malformed_json");
  assert.equal(deserializeProject("[1,2]").code, "not_a_project");
  assert.equal(deserializeProject("null").code, "not_a_project");
  const bad = (mut) => { const d = JSON.parse(JSON.stringify(good())); mut(d); return deserializeProject(JSON.stringify(d)); };
  assert.equal(bad((d) => { d.objects[0].type = "dragon"; }).code, "invalid_project");
  assert.equal(bad((d) => { d.objects[0].x = "left"; }).code, "invalid_project");
  assert.equal(bad((d) => { d.objects[0].props.foliage = "green"; }).code, "invalid_project");
  assert.equal(bad((d) => { d.objects[0].width = 99999; }).code, "invalid_project");
  assert.equal(bad((d) => { d.objects.push({ ...d.objects[0], layer: 1 }); }).code, "invalid_project"); // duplicate id
  assert.equal(bad((d) => { d.objects[0].rotation = 360; }).code, "invalid_project");
  assert.equal(bad((d) => { d.canvas.width = 5; }).code, "invalid_project");
  assert.equal(bad((d) => { d.extra = 1; }).code, "invalid_project");
  assert.equal(bad((d) => { d.metadata = [] ; }).code, "invalid_project");
  assert.equal(bad((d) => { d.type = "nonsense"; }).code, "invalid_project");
  assert.equal(bad((d) => { d.title = ""; }).code, "invalid_project");
  assert.equal(bad((d) => { d.modifiedAt = "yesterday"; }).code, "invalid_project");
});

test("non-JSON values (functions, NaN, undefined, class instances) are not valid documents", () => {
  assert.equal(isJsonValue({ f: () => 1 }), false);
  assert.equal(isJsonValue({ n: NaN }), false);
  assert.equal(isJsonValue({ u: undefined }), false);
  assert.equal(isJsonValue({ d: new Date() }), false);
  const d = good();
  d.metadata = { cb: () => 1 };
  assert.equal(validateProject(d).ok, false);
  assert.equal(serializeProject(d).ok, false);
});

test("10. unsupported schema versions give a clear error", () => {
  const newer = JSON.stringify({ ...good(), schemaVersion: SCHEMA_VERSION + 1 });
  const r = deserializeProject(newer);
  assert.equal(r.code, "unsupported_version");
  assert.equal(r.version, SCHEMA_VERSION + 1);
  assert.match(r.message, /newer version/);
  assert.equal(deserializeProject(JSON.stringify({ ...good(), schemaVersion: 0 })).code, "unsupported_version");
  assert.equal(deserializeProject(JSON.stringify({ ...good(), schemaVersion: "1" })).code, "unsupported_version");
  const missing = { ...good() }; delete missing.schemaVersion;
  assert.equal(deserializeProject(JSON.stringify(missing)).code, "unsupported_version");
});

test("loading normalises layers (sorted, renumbered)", () => {
  const d = createProject({ objects: [] });
  d.objects = [createObject("tree", { id: "a", layer: 5 }), createObject("house", { id: "b", layer: 2 })];
  const r = deserializeProject(JSON.stringify(d));
  assert.equal(r.ok, true);
  assert.deepEqual(r.project.objects.map((o) => [o.id, o.layer]), [["b", 0], ["a", 1]]);
});

test("storage: save/load works and uses only its own key", () => {
  const st = memoryStorage({ skillverse_save: '{"name":"Explorer","coins":150}' });
  const store = createDocumentStorage({ storage: st });
  assert.equal(store.key, DEMO_STORAGE_KEY);
  assert.notEqual(store.key, "skillverse_save");
  assert.deepEqual(store.load(), { ok: true, empty: true, project: null });
  assert.equal(store.save(good()).ok, true);
  const back = store.load();
  assert.equal(back.ok, true);
  assert.deepEqual(back.project, good());
  assert.equal(st.data.skillverse_save, '{"name":"Explorer","coins":150}', "player save untouched");
  assert.deepEqual(Object.keys(st.data).sort(), [DEMO_STORAGE_KEY, "skillverse_save"].sort());
});

test("storage: refuses to overwrite unreadable data unless told to, and then keeps a backup", () => {
  const junk = "{corrupt";
  const st = memoryStorage({ [DEMO_STORAGE_KEY]: junk });
  const store = createDocumentStorage({ storage: st });
  assert.equal(store.load().code, "malformed_json");
  assert.equal(st.data[DEMO_STORAGE_KEY], junk, "load never alters stored data");
  assert.equal(store.save(good()).code, "would_overwrite_unreadable");
  assert.equal(st.data[DEMO_STORAGE_KEY], junk);
  assert.equal(store.save(good(), { replaceUnreadable: true }).ok, true);
  assert.equal(st.data[store.backupKey], junk);
  assert.equal(store.load().ok, true);

  const future = JSON.stringify({ ...good(), schemaVersion: 99 });
  const st2 = memoryStorage({ [DEMO_STORAGE_KEY]: future });
  const store2 = createDocumentStorage({ storage: st2 });
  assert.equal(store2.load().code, "unsupported_version");
  assert.equal(store2.save(good()).code, "would_overwrite_unreadable");
  assert.equal(st2.data[DEMO_STORAGE_KEY], future);
});

test("storage: failures are reported, never thrown", () => {
  assert.equal(createDocumentStorage({ storage: null }).save(good()).code, "storage_unavailable");
  const full = { getItem: () => null, setItem: () => { const e = new Error("full"); e.name = "QuotaExceededError"; throw e; } };
  assert.equal(createDocumentStorage({ storage: full }).save(good()).code, "storage_full");
  const blocked = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
  assert.equal(createDocumentStorage({ storage: blocked }).load().code, "storage_unavailable");
  assert.equal(createDocumentStorage({ storage: blocked }).save(good()).code, "storage_unavailable");
  const invalid = { ...good(), objects: "nope" };
  assert.equal(createDocumentStorage({ storage: memoryStorage() }).save(invalid).code, "invalid_project");
});
