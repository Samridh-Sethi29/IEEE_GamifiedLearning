import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { DEMO_STORAGE_KEY, SCHEMA_VERSION } from "../constants.js";
import { createObject, createProject, isJsonValue, validateObject, validateProject } from "../schema.js";
import { OBJECT_TYPES, OBJECT_TYPE_IDS, checkPropValue, defaultProps, getObjectTypes, getPaletteObjectTypes, isObjectType } from "../objectTypes.js";
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
    const pType = getObjectTypes("sandbox").includes(t) ? "sandbox" : "world-builder";
    const doc = createProject({ type: pType, objects: [createObject(t, { id: `o-${t}`, layer: 0 }, pType)] });
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

test("D3.1-1: Sandbox registry returns exactly the original six types", () => {
  const types = getObjectTypes("sandbox");
  assert.deepEqual(types, ["rectangle", "circle", "triangle", "tree", "house", "gear"]);
  assert.equal(types.length, 6);
  // Returned array should be a detached copy
  types.push("extra");
  assert.equal(getObjectTypes("sandbox").length, 6);
});

test("D3.2B-1: World Builder registry returns exactly seven types", () => {
  const types = getObjectTypes("world-builder");
  assert.deepEqual(types, ["house", "tree", "farm", "well", "tank", "pipe", "road"]);
  for (const t of ["house", "tree", "farm", "well", "tank", "pipe", "road"]) {
    assert.equal(isObjectType(t, "world-builder"), true);
  }
  for (const t of ["rectangle", "circle", "triangle", "gear"]) {
    assert.equal(types.includes(t), false);
    assert.equal(isObjectType(t, "world-builder"), false);
  }
});

test("D3.1-3: Every original sandbox object type still validates", () => {
  for (const t of getObjectTypes("sandbox")) {
    const doc = createProject({ type: "sandbox", objects: [createObject(t, { id: `s-${t}`, layer: 0 })] });
    const check = validateProject(doc);
    assert.equal(check.ok, true, `type ${t} should validate in sandbox`);
    assert.deepEqual(check.errors, []);
  }
});

test("D3.1-4: World Builder accepts house and tree", () => {
  const doc = createProject({
    type: "world-builder",
    objects: [
      createObject("house", { id: "h1", layer: 0 }),
      createObject("tree", { id: "t1", layer: 1 }),
    ],
  });
  const check = validateProject(doc);
  assert.equal(check.ok, true);
  assert.deepEqual(check.errors, []);

  // Serialization round-trip works for valid World Builder documents
  const ser = serializeProject(doc);
  assert.equal(ser.ok, true);
  const back = deserializeProject(ser.text);
  assert.equal(back.ok, true);
  assert.deepEqual(back.project, doc);
});

test("D3.1-5: World Builder rejects rectangle, circle, triangle and gear", () => {
  const forbidden = ["rectangle", "circle", "triangle", "gear"];
  for (const t of forbidden) {
    const doc = createProject({
      type: "world-builder",
      objects: [createObject(t, { id: `bad-${t}`, layer: 0 })],
    });
    const check = validateProject(doc);
    assert.equal(check.ok, false, `World Builder should reject ${t}`);
    assert.ok(check.errors.some((e) => e.includes("not allowed in a world-builder project")));

    // Deserializing a project containing a forbidden object fails
    const badJson = JSON.stringify(doc);
    const des = deserializeProject(badJson);
    assert.equal(des.ok, false);
    assert.equal(des.code, "invalid_project");

    // Directly calling validateObject with projectType argument
    const objErrors = validateObject(createObject(t, { id: `bad-${t}`, layer: 0 }), undefined, "object", "world-builder");
    assert.ok(objErrors.length > 0);
    assert.ok(objErrors.some((e) => e.includes("not allowed in a world-builder project")));

    // Directly calling validateObject with options object
    const optErrors = validateObject(createObject(t, { id: `bad-${t}`, layer: 0 }), { projectType: "world-builder" });
    assert.ok(optErrors.length > 0);
    assert.ok(optErrors.some((e) => e.includes("not allowed in a world-builder project")));

    // createObject with explicit projectType argument or override rejects
    assert.throws(() => createObject(t, {}, "world-builder"), /not allowed in a world-builder project/);
    assert.throws(() => createObject(t, { projectType: "world-builder" }), /not allowed in a world-builder project/);
  }

  // createObject with valid type for world-builder succeeds
  assert.doesNotThrow(() => createObject("house", {}, "world-builder"));
  assert.doesNotThrow(() => createObject("tree", { projectType: "world-builder" }));
});

test("D3.1-6: Sandbox rejects unsupported types", () => {
  const unsupported = ["farm", "well", "tank", "pipe", "road", "dragon", "alien"];
  for (const t of unsupported) {
    const fakeObj = {
      id: "unsupp",
      type: t,
      x: 100,
      y: 100,
      rotation: 0,
      width: 100,
      height: 100,
      layer: 0,
      props: {},
    };
    const doc = createProject({
      type: "sandbox",
      objects: [fakeObj],
    });
    const check = validateProject(doc);
    assert.equal(check.ok, false, `Sandbox should reject unsupported type ${t}`);
    assert.ok(check.errors.some((e) => e.includes("not allowed in a sandbox project") || e.includes("not a supported object type")));

    const objErrors = validateObject(fakeObj, undefined, "object", "sandbox");
    assert.ok(objErrors.length > 0);
  }
});

test("D3.1-7: Unknown project types do not receive an unrestricted type set", () => {
  assert.deepEqual(getObjectTypes("unknown"), []);
  assert.deepEqual(getObjectTypes(""), []);
  assert.deepEqual(getObjectTypes(null), []);
  assert.deepEqual(getObjectTypes(undefined), []);
  assert.deepEqual(getObjectTypes(123), []);
  // Prototype property names safely return empty array
  assert.deepEqual(getObjectTypes("toString"), []);
  assert.deepEqual(getObjectTypes("constructor"), []);
  assert.deepEqual(getObjectTypes("__proto__"), []);
  assert.deepEqual(getObjectTypes("valueOf"), []);
  // Non-implemented project types have safe defined empty list
  assert.deepEqual(getObjectTypes("invention-lab"), []);
  assert.deepEqual(getObjectTypes("story-studio"), []);
  assert.deepEqual(getObjectTypes("design-studio"), []);

  for (const t of OBJECT_TYPE_IDS) {
    assert.equal(isObjectType(t, "unknown"), false);
    assert.equal(isObjectType(t, "invention-lab"), false);
    assert.equal(isObjectType(t, "toString"), false);
  }

  const doc = createProject({
    type: "invention-lab",
    objects: [createObject("house", { id: "h1", layer: 0 })],
  });
  const check = validateProject(doc);
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((e) => e.includes("not allowed in a invention-lab project")));
});

test("D3.1-8: Valid enum values pass validation", () => {
  const def = { kind: "enum", options: ["standard", "drip", "sprinkler"] };
  assert.equal(checkPropValue(def, "standard"), null);
  assert.equal(checkPropValue(def, "drip"), null);
  assert.equal(checkPropValue(def, "sprinkler"), null);

  // values alias also works
  const defValues = { kind: "enum", values: ["low", "medium", "high"] };
  assert.equal(checkPropValue(defValues, "low"), null);
  assert.equal(checkPropValue(defValues, "high"), null);
});

test("D3.1-9: Invalid enum values fail validation", () => {
  const def = { kind: "enum", options: ["standard", "drip"] };
  assert.notEqual(checkPropValue(def, "flood"), null);
  assert.notEqual(checkPropValue(def, ""), null);
  assert.notEqual(checkPropValue(def, null), null);
  assert.notEqual(checkPropValue(def, undefined), null);
  assert.notEqual(checkPropValue(def, 123), null);
  assert.notEqual(checkPropValue(def, true), null);

  // Empty or missing options rejected
  assert.notEqual(checkPropValue({ kind: "enum", options: [] }, "anything"), null);
  assert.notEqual(checkPropValue({ kind: "enum" }, "anything"), null);
});

test("D3.1-10: Actual boolean values pass validation", () => {
  const def = { kind: "bool" };
  assert.equal(checkPropValue(def, true), null);
  assert.equal(checkPropValue(def, false), null);
});

test("D3.1-11: Non-boolean values fail boolean validation", () => {
  const def = { kind: "bool" };
  assert.notEqual(checkPropValue(def, "true"), null);
  assert.notEqual(checkPropValue(def, "false"), null);
  assert.notEqual(checkPropValue(def, 1), null);
  assert.notEqual(checkPropValue(def, 0), null);
  assert.notEqual(checkPropValue(def, null), null);
  assert.notEqual(checkPropValue(def, undefined), null);
  assert.notEqual(checkPropValue(def, {}), null);
  assert.notEqual(checkPropValue(def, []), null);
});

test("D3.2A-1: Palette filtering for Sandbox shows all six existing objects in the correct order", () => {
  const types = getPaletteObjectTypes("sandbox");
  assert.deepEqual(types, ["rectangle", "circle", "triangle", "tree", "house", "gear"]);
  assert.equal(types.length, 6);
});

test("D3.2B-2: Palette filtering for World Builder shows all seven permitted objects in order", () => {
  const types = getPaletteObjectTypes("world-builder");
  assert.deepEqual(types, ["house", "tree", "farm", "well", "tank", "pipe", "road"]);
  // Disallowed sandbox types are excluded
  for (const t of ["rectangle", "circle", "triangle", "gear"]) {
    assert.equal(types.includes(t), false);
  }
});

test("D3.2A-3: Palette filtering for unsupported and unknown project types shows no choices", () => {
  assert.deepEqual(getPaletteObjectTypes("invention-lab"), []);
  assert.deepEqual(getPaletteObjectTypes("story-studio"), []);
  assert.deepEqual(getPaletteObjectTypes("design-studio"), []);
  assert.deepEqual(getPaletteObjectTypes("unknown"), []);
  assert.deepEqual(getPaletteObjectTypes(""), []);
  assert.deepEqual(getPaletteObjectTypes(null), []);
  assert.deepEqual(getPaletteObjectTypes(undefined), []);
  assert.deepEqual(getPaletteObjectTypes("toString"), []);
  assert.deepEqual(getPaletteObjectTypes("constructor"), []);
});

test("D3.2A-4: Palette safely excludes and warns for types without palette presentation", () => {
  // If an object type definition is missing or lacks defaultSize/label,
  // getPaletteObjectTypes safely reports and excludes it
  const origWarn = console.warn;
  let warnCalled = false;
  console.warn = (msg) => {
    warnCalled = true;
    assert.match(msg, /has no valid presentation/);
  };
  try {
    // getPaletteObjectTypes on valid sandbox has no warning
    const sb = getPaletteObjectTypes("sandbox");
    assert.equal(warnCalled, false);
    assert.equal(sb.length, 6);
  } finally {
    console.warn = origWarn;
  }
});

test("D3.2B-3: Five new definitions contain valid default properties, dimensions and bounds", () => {
  const expected = {
    farm: { min: 40, max: 320, defaultW: 120, defaultH: 90, propKeys: ["irrigation"] },
    well: { min: 30, max: 300, defaultW: 80, defaultH: 90, propKeys: ["roof"] },
    tank: { min: 30, max: 300, defaultW: 80, defaultH: 100, propKeys: ["fill"] },
    pipe: { min: 20, max: 400, defaultW: 100, defaultH: 30, propKeys: ["fill"] },
    road: { min: 24, max: 400, defaultW: 120, defaultH: 50, propKeys: ["fill"] },
  };

  for (const [type, exp] of Object.entries(expected)) {
    const def = OBJECT_TYPES[type];
    assert.ok(def, `Definition for ${type} must exist`);
    assert.equal(def.minSize, exp.min);
    assert.equal(def.maxSize, exp.max);
    assert.equal(def.defaultSize.width, exp.defaultW);
    assert.equal(def.defaultSize.height, exp.defaultH);
    assert.deepEqual(Object.keys(def.props), exp.propKeys);

    // Validate defaultProps
    const defaults = defaultProps(type);
    for (const key of exp.propKeys) {
      assert.ok(key in defaults, `defaultProps(${type}) must include ${key}`);
      assert.equal(checkPropValue(def.props[key], defaults[key]), null);
    }
  }
});

test("D3.2B-4: World Builder validates documents containing all seven types", () => {
  const wbTypes = getObjectTypes("world-builder");
  assert.equal(wbTypes.length, 7);
  const objects = wbTypes.map((t, i) => createObject(t, { id: `wb-${t}`, layer: i, x: 100 + i * 20, y: 100 + i * 20 }, "world-builder"));
  const doc = createProject({ type: "world-builder", objects });
  const check = validateProject(doc);
  assert.equal(check.ok, true);
  assert.deepEqual(check.errors, []);
});

test("D3.2B-5: Sandbox rejects documents containing any of the five new types", () => {
  const newVillageTypes = ["farm", "well", "tank", "pipe", "road"];
  for (const t of newVillageTypes) {
    const obj = createObject(t, { id: `sb-${t}`, layer: 0 }, "world-builder");
    const doc = createProject({ type: "sandbox", objects: [obj] });
    const check = validateProject(doc);
    assert.equal(check.ok, false, `Sandbox must reject ${t}`);
    assert.ok(check.errors.some((e) => e.includes(`type "${t}" is not allowed in a sandbox project`)));
  }
});

test("D3.2B-6: Farm irrigation property strictly accepts only flood and drip", () => {
  const farmDef = OBJECT_TYPES.farm;
  const irrigDef = farmDef.props.irrigation;
  assert.equal(irrigDef.kind, "enum");
  assert.deepEqual(irrigDef.options, ["flood", "drip"]);
  assert.equal(irrigDef.default, "flood");

  assert.equal(checkPropValue(irrigDef, "flood"), null);
  assert.equal(checkPropValue(irrigDef, "drip"), null);

  for (const bad of ["sprinkler", "pivot", "furrow", "", "FLOOD", "DRIP", 1, 0, true, false, null, undefined, {}, []]) {
    assert.notEqual(checkPropValue(irrigDef, bad), null, `irrigation should reject ${JSON.stringify(bad)}`);
  }
});

test("D3.2B-7: Documents containing all seven World Builder types serialize and deserialize cleanly", () => {
  const wbTypes = getObjectTypes("world-builder");
  const objects = wbTypes.map((t, i) => createObject(t, { id: `wb-ser-${t}`, layer: i, x: 80 + i * 30, y: 80 + i * 30 }, "world-builder"));
  const doc = createProject({ type: "world-builder", objects });

  assert.equal(isJsonValue(doc), true);
  const out = serializeProject(doc);
  assert.equal(out.ok, true);
  const back = deserializeProject(out.text);
  assert.equal(back.ok, true);
  assert.deepEqual(back.project, doc);
});

test("D3.2B-8: Object artwork definitions exist for all 11 object types and support farm irrigation", () => {
  const artSrc = fs.readFileSync(new URL("../objectArt.jsx", import.meta.url), "utf8");
  for (const t of OBJECT_TYPE_IDS) {
    assert.match(artSrc, new RegExp(`\\b${t}\\s*:`), `objectArt.jsx must have a renderer for ${t}`);
  }
  // Farm must support both irrigation options
  assert.match(artSrc, /props\??\.irrigation\s*===\s*["']drip["']/);
});

test("D3.2C-1: Each supported World Builder property has valid defaults and schemas", () => {
  const wbTypes = getObjectTypes("world-builder");
  assert.equal(wbTypes.length, 7);

  const expectedProps = {
    house: { wall: { kind: "color", default: "#facc15" }, roof: { kind: "color", default: "#ef4444" } },
    tree: { foliage: { kind: "color", default: "#22c55e" } },
    farm: { irrigation: { kind: "enum", default: "flood", options: ["flood", "drip"] } },
    well: { roof: { kind: "color", default: "#ef4444" } },
    tank: { fill: { kind: "color", default: "#3b82f6" } },
    pipe: { fill: { kind: "color", default: "#14b8a6" } },
    road: { fill: { kind: "color", default: "#facc15" } },
  };

  for (const t of wbTypes) {
    const def = OBJECT_TYPES[t];
    assert.ok(def, `OBJECT_TYPES must have definition for ${t}`);
    const exp = expectedProps[t];
    assert.deepEqual(Object.keys(def.props), Object.keys(exp), `Props for ${t} should match expected keys`);

    for (const [pKey, pExp] of Object.entries(exp)) {
      const pdef = def.props[pKey];
      assert.equal(pdef.kind, pExp.kind, `${t}.${pKey} kind should be ${pExp.kind}`);
      assert.equal(pdef.default, pExp.default, `${t}.${pKey} default should be ${pExp.default}`);
      if (pExp.options) {
        assert.deepEqual(pdef.options, pExp.options, `${t}.${pKey} options should match`);
      }
      // Check default value is valid according to checkPropValue
      assert.equal(checkPropValue(pdef, pdef.default), null, `${t}.${pKey} default value must pass validation`);
    }

    // Default object creation produces valid properties
    const defaults = defaultProps(t);
    for (const [pKey, pExp] of Object.entries(exp)) {
      assert.equal(defaults[pKey], pExp.default);
    }
  }
});

test("D3.2C-2: Invalid color and enum values are rejected for all World Builder properties", () => {
  const colorInvalid = ["red", "#123", "#1234567", "#zzz", "invalid", "", 123, true, null, undefined, {}, []];
  const enumInvalid = ["sprinkler", "drips", "flood-channel", "FLOOD", "DRIP", "", 1, false, null, undefined, {}, []];

  // Test color properties
  const colorProps = [
    OBJECT_TYPES.house.props.wall,
    OBJECT_TYPES.house.props.roof,
    OBJECT_TYPES.tree.props.foliage,
    OBJECT_TYPES.well.props.roof,
    OBJECT_TYPES.tank.props.fill,
    OBJECT_TYPES.pipe.props.fill,
    OBJECT_TYPES.road.props.fill,
  ];

  for (const pdef of colorProps) {
    for (const bad of colorInvalid) {
      assert.notEqual(checkPropValue(pdef, bad), null, `${pdef.label} should reject ${JSON.stringify(bad)}`);
    }
  }

  // Test farm irrigation enum property
  const irrigDef = OBJECT_TYPES.farm.props.irrigation;
  for (const bad of enumInvalid) {
    assert.notEqual(checkPropValue(irrigDef, bad), null, `irrigation should reject ${JSON.stringify(bad)}`);
  }
});

test("D3.2C-3: Serialization and deserialization preserve custom edited properties on all World Builder objects", () => {
  const customProps = {
    house: { wall: "#8b5cf6", roof: "#14b8a6" },
    tree: { foliage: "#78716c" },
    farm: { irrigation: "drip" },
    well: { roof: "#3b82f6" },
    tank: { fill: "#22c55e" },
    pipe: { fill: "#ef4444" },
    road: { fill: "#78716c" },
  };

  const wbTypes = getObjectTypes("world-builder");
  const objects = wbTypes.map((t, i) =>
    createObject(t, { id: `wb-custom-${t}`, layer: i, x: 100 + i * 40, y: 100 + i * 40, props: customProps[t] }, "world-builder"),
  );

  const doc = createProject({ type: "world-builder", objects });
  const check = validateProject(doc);
  assert.equal(check.ok, true, "Project with custom properties must be valid");

  const out = serializeProject(doc);
  assert.equal(out.ok, true);

  const back = deserializeProject(out.text);
  assert.equal(back.ok, true);
  assert.deepEqual(back.project, doc);

  // Explicitly check each object retained its custom edited properties
  for (const o of back.project.objects) {
    assert.deepEqual(o.props, customProps[o.type], `${o.type} must retain custom props after deserialization`);
  }
});

test("D3.2C-4: Object artwork definitions connect every editable property to visible SVG attributes", () => {
  const artSrc = fs.readFileSync(new URL("../objectArt.jsx", import.meta.url), "utf8");

  // House: uses wall and roof
  assert.match(artSrc, /fill=\{props\.wall\}/);
  assert.match(artSrc, /fill=\{props\.roof\}/);

  // Tree: uses foliage
  assert.match(artSrc, /fill=\{props\.foliage\}/);

  // Farm: conditional check on irrigation === "drip"
  assert.match(artSrc, /props\??\.irrigation\s*===\s*["']drip["']/);

  // Well: uses roof
  assert.match(artSrc, /fill=\{props\??\.roof/);

  // Tank, Pipe, Road: use fill
  assert.match(artSrc, /tank:[\s\S]*?fill=\{props\??\.fill/);
  assert.match(artSrc, /pipe:[\s\S]*?fill=\{props\??\.fill/);
  assert.match(artSrc, /road:[\s\S]*?fill=\{props\??\.fill/);
});
