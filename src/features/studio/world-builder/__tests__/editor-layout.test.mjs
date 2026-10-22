import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Structural checks for the World Builder layout. Real rendering (clipping, scroll positions, overlays)
// was verified separately in Chromium; these tests pin the CSS/markup contract that makes it work.

const here = dirname(fileURLToPath(import.meta.url));
const studioRoot = resolve(here, "../..");
const read = (...p) => readFileSync(resolve(studioRoot, ...p), "utf-8");

const engineCss = read("engine", "engine.css");
const wbCss = read("world-builder", "world-builder.css");
const dashCss = read("world-builder", "components", "MissionDashboard.css");
const modalCss = read("world-builder", "components", "MissionSuccessScreen.css");

/** Returns the body of the first @media block whose query contains `query`. */
function mediaBlock(css, query) {
  const start = css.indexOf(`@media ${query}`);
  assert.ok(start >= 0, `@media ${query} exists`);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(css.indexOf("{", start) + 1, i);
    }
  }
  throw new Error("unterminated media block");
}

test("1. App-mode: Properties and Palette panels are columns whose body is the independent scroll region", () => {
  const app = mediaBlock(engineCss, "(min-width: 1000px) and (min-height: 600px)");
  assert.match(app, /\.sce-palette,\s*\.sce-props\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/);
  assert.match(app, /\.sce-props\s*>\s*\.sce-panel-body\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior:\s*contain;/);
  assert.match(app, /\.sce-scope\s*\{\s*overflow:\s*hidden;\s*\}/, "page itself does not scroll in app mode");
  assert.match(app, /\.sce-shell\s*\{[^}]*height:\s*100%;/);
});

test("2. Layout never hard-codes a viewport height; canvas takes the remaining space via container queries", () => {
  assert.doesNotMatch(engineCss, /\.sce-(layout|stage|props|palette|workspace)\s*\{[^}]*\bheight:\s*\d+px/);
  assert.match(engineCss, /\.sce-canvas-wrap\s*\{[^}]*container-type:\s*size;/);
  assert.match(engineCss, /min-width:\s*0/);
});

test("3. Narrow screens stack canvas, palette and Properties and let the page scroll (no inner scroll traps)", () => {
  assert.match(engineCss, /grid-template-areas:\s*"stage"\s*"palette"\s*"props";/);
  const app = mediaBlock(engineCss, "(min-width: 1000px) and (min-height: 600px)");
  assert.doesNotMatch(app, /@media/);
  assert.match(engineCss, /\.sce-scope\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/, "root scrolls vertically below app-mode breakpoint");
});

test("4. The guide is height-capped, never squeezed, scrolls inside, and minimized has no reserved space", () => {
  assert.match(wbCss, /\.wb-guide-card\s*\{[^}]*flex:\s*0 0 auto;[^}]*max-height:\s*min\(\d+px,\s*\d+dvh\);[^}]*overflow:\s*hidden;/);
  assert.match(wbCss, /\.wb-guide-body\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;/);
  assert.match(wbCss, /\.wb-guide-card--minimized\s*\{[^}]*max-height:\s*none;[^}]*padding:\s*4px 8px 4px 12px;/);
  assert.doesNotMatch(wbCss, /\.wb-guide-card\s*\{[^}]*position:\s*(fixed|absolute)/);
});

test("5. Dashboard planning inputs: aligned label/number/unit grid, readable text, touch-size inputs", () => {
  assert.match(dashCss, /\.wb-planning-fields\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto;/);
  assert.match(dashCss, /\.wb-planning-row\s*\{\s*display:\s*contents;\s*\}/);
  assert.match(dashCss, /\.wb-planning-input\s*\{[^}]*min-height:\s*36px;/);
  assert.match(dashCss, /@media \(pointer: coarse\)\s*\{\s*\.wb-planning-input\s*\{\s*min-height:\s*44px;/);
  assert.match(dashCss, /\.wb-planning-error,\s*\.wb-planning-missing-hint\s*\{\s*grid-column:\s*1 \/ -1;/, "errors and hints span the full row and stay visible");
  const jsx = read("world-builder", "components", "MissionDashboard.jsx");
  for (const id of ["wb-input-daily-supply", "wb-input-daily-demand", "wb-input-available-reserve"]) {
    assert.ok(jsx.includes(`id="${id}"`), `${id} still rendered`);
  }
});

test("6. Dashboard text stays readable (no 10px copy) and badges cannot overflow the panel", () => {
  const polish = dashCss.slice(dashCss.indexOf("Layout polish"));
  const sizes = [...polish.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => Number(m[1]));
  assert.ok(sizes.length > 10);
  assert.ok(Math.min(...sizes) >= 11, `smallest polished font is ${Math.min(...sizes)}px`);
  assert.match(dashCss, /\.wb-completion-header\s*\{\s*flex-wrap:\s*wrap;/);
  assert.match(dashCss, /\.wb-dashboard-overall\s*\{[^}]*display:\s*grid;/);
});

test("7. Properties panel is organised: jump navigation + named sections, World Builder only", () => {
  const jsx = read("engine", "PropertiesPanel.jsx");
  assert.match(jsx, /data-testid="wb-props-nav"/);
  assert.match(jsx, /doc\.type === "world-builder" && \(\s*<nav/);
  for (const id of ["wb-mission-dashboard", "wb-planning-inputs", "wb-status-inspector", "sce-props-selected", "sce-props-layers"]) {
    assert.ok(jsx.includes(id), `jump target ${id} referenced`);
  }
  assert.match(jsx, /data-testid="sce-props-selected"/);
  assert.match(jsx, /data-testid="sce-props-layers"/);
  assert.match(wbCss, /\.wb-props-nav\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/);
});

test("8. SkillVerse skin is scoped to the World Builder editor and cannot restyle the Sandbox", () => {
  const start = wbCss.indexOf("World Builder workspace skin");
  const end = wbCss.indexOf("/* World Builder Guided Start */");
  const skin = wbCss.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [...skin.matchAll(/(^|\})\s*([^{}@/][^{}]*)\{/g)].map((m) => m[2].trim()).filter((s) => s && !s.startsWith("from") && !/^\d/.test(s));
  const sceRules = selectors.filter((s) => /\.sce-/.test(s));
  assert.ok(sceRules.length > 8);
  for (const sel of sceRules) {
    for (const part of sel.split(",").map((p) => p.trim())) {
      if (/\.sce-/.test(part)) assert.match(part, /^\.wb-editor-scope\b/, `scoped: ${part}`);
    }
  }
  const sandbox = read("pages", "EngineLab.jsx");
  assert.doesNotMatch(sandbox, /wb-editor-scope|WorldBuilderGuide|STUDIO_CSS_VARS/);
});

test("9. Success / replay modal fits the dynamic viewport with fixed header + footer and a scrolling body", () => {
  assert.match(modalCss, /\.wb-success-overlay\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;/);
  assert.match(modalCss, /\.wb-success-dialog\s*\{[^}]*max-height:\s*calc\(100dvh - 2rem\);[^}]*max-height:\s*100%;/s);
  assert.match(modalCss, /\.wb-success-dialog\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/);
  assert.match(modalCss, /\.wb-success-body\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;/);
  assert.match(modalCss, /\.wb-success-(banner|actions)\s*\{[^}]*flex-shrink:\s*0;/);
  const jsx = read("world-builder", "components", "MissionSuccessScreen.jsx");
  assert.ok(jsx.indexOf("wb-success-body") < jsx.indexOf("wb-success-actions"), "footer follows the scroll body inside the dialog");
  // The footer is a child of the dialog, not of the scrolling body
  assert.match(jsx, /<\/div>\s*\{\/\* Actions Footer \*\/\}\s*<div className="wb-success-actions">/);
});

test("10. Guide state can never reach the editor: the workspace passes it nothing but stable props", () => {
  const ws = read("world-builder", "components", "WorldBuilderWorkspace.jsx");
  const editorProps = ws.slice(ws.indexOf("<EditorWorkspace"), ws.indexOf("/>", ws.indexOf("<EditorWorkspace")));
  assert.doesNotMatch(editorProps, /isGuide|Guide/);
  assert.match(editorProps, /initialProject=\{project\}/);
  const editor = read("engine", "EditorWorkspace.jsx");
  assert.doesNotMatch(editor, /isGuide|WorldBuilderGuide/);
});
