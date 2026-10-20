/**
 * Tiny layout-aware DOM fake for guideNavigation tests (no jsdom in this project).
 * Each element has a position inside its parent's scrollable content (`top`), a `height`, and optional
 * scroll metrics. getBoundingClientRect() is derived from ancestors' scrollTop, so scrolling a nested
 * container really moves the target, exactly as in a browser.
 */
const attrMatch = (el, sel) => {
  // supports: [data-testid="x"], #id, .class, and chains of [attr="v"]
  const parts = sel.match(/\[[^\]]+\]|#[\w-]+|\.[\w-]+/g) || [];
  if (!parts.length) return false;
  return parts.every((p) => {
    if (p[0] === "#") return el.id === p.slice(1);
    if (p[0] === ".") return el.classList.has(p.slice(1));
    const m = p.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
    if (!m) return false;
    const v = el.getAttribute(m[1]);
    return m[2] === undefined ? v !== null : v === m[2];
  });
};

export function makeEl({
  id = "", testid = null, cls = [], top = 0, height = 40, overflowY = "visible",
  clientHeight, scrollHeight, hidden = false, attrs = {}, children = [], onClick, focusable = false,
} = {}) {
  const attributes = { ...attrs };
  if (testid) attributes["data-testid"] = testid;
  if (hidden) attributes.hidden = "";
  const el = {
    id, top, height, overflowY, parentElement: null, children: [], scrollTop: 0,
    clientTop: 0, focusCalls: [], scrollCalls: [], clicks: 0, focusable,
    classList: new Set(cls),
    getAttribute: (n) => (n === "id" ? (id || null) : n in attributes ? attributes[n] : null),
    setAttribute: (n, v) => { attributes[n] = String(v); },
    removeAttribute: (n) => { delete attributes[n]; },
    get clientHeight() { return clientHeight ?? height; },
    get scrollHeight() { return scrollHeight ?? Math.max(height, clientHeight ?? height); },
    getBoundingClientRect() {
      const base = el.parentElement ? el.parentElement.getBoundingClientRect().top - el.parentElement.scrollTop : 0;
      const t = base + el.top;
      return { top: t, bottom: t + el.height, height: el.height, left: 0, right: 100 };
    },
    scrollTo({ top, behavior }) {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollCalls.push({ top, behavior });
      el.scrollTop = Math.min(Math.max(0, top), max);
    },
    closest(sel) {
      let n = el;
      while (n) {
        if (sel === "[hidden]" ? n.getAttribute("hidden") !== null : attrMatch(n, sel)) return n;
        n = n.parentElement;
      }
      return null;
    },
    matches(sel) {
      if (sel.includes("button") && el.tag === "button") return true;
      return el.focusable;
    },
    focus(opts) { el.focusCalls.push(opts || {}); el.ownerDocument && (el.ownerDocument.activeElement = el); },
    click() { el.clicks += 1; if (onClick) onClick(el); },
    contains: (n) => { while (n) { if (n === el) return true; n = n.parentElement; } return false; },
  };
  el.classList.remove = (c) => el.classList.delete(c);
  el.attributes = attributes;
  children.forEach((c) => { c.parentElement = el; el.children.push(c); });
  return el;
}

export function walk(el, fn) { fn(el); el.children.forEach((c) => walk(c, fn)); }

export function makeDoc(roots, { page } = {}) {
  const documentElement = makeEl({ height: 800 });
  const body = makeEl({ height: 800 });
  const top = makeEl({ height: 800, children: roots });
  top.parentElement = body; body.children.push(top);
  const doc = {
    documentElement, body, scrollingElement: page || null, activeElement: body,
    querySelector(sel) {
      let found = null;
      walk(top, (n) => {
        if (found) return;
        if (attrMatch(n, sel)) found = n;
      });
      return found;
    },
  };
  walk(top, (n) => { n.ownerDocument = doc; });
  return doc;
}

export const fakeWin = ({ reduceMotion = false } = {}) => ({
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  matchMedia: () => ({ matches: reduceMotion }),
});

export const styleOf = (el) => ({ overflowY: el.overflowY, overflow: el.overflowY, scrollPaddingTop: "0px", scrollPaddingBottom: "0px" });
