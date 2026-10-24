/**
 * Authoritative navigation and focus helper for World Builder guided-start actions.
 *
 * Why this is not just `element.scrollIntoView()`:
 *  - In "app mode" (>= 1000px wide, >= 600px tall) the workspace root is `overflow: hidden` and the
 *    palette / Properties panel scroll on their own. `scrollIntoView` also scrolls `overflow: hidden`
 *    ancestors, which shoves the whole shell (header + toolbar) out of view. Here we only ever scroll
 *    containers whose computed overflow is `auto` / `scroll` / `overlay` and that really overflow.
 *  - Targets can sit in several nested scroll containers (page -> Properties panel -> dashboard), so
 *    every scrollable ancestor is handled, innermost first, tracking where the target will end up.
 *  - Targets can be inside collapsed (`hidden`) panels on narrow screens; the controlling toggle is
 *    discovered from `aria-controls` and clicked before measuring.
 *  - Layout is measured only after React has committed the guide change (double animation frame),
 *    not after an arbitrary timeout.
 *
 * Everything here is DOM-injectable (document, window, computed-style reader) so it can be exercised
 * in plain Node tests with small fakes.
 */

export const GUIDE_TARGET_SELECTORS = {
  well: '[data-testid="sce-add-well"]',
  canvas: '[data-testid="sce-canvas"]',
  tank: '[data-testid="sce-add-tank"]',
  householdGoal: '[data-testid="wb-dashboard-item-households"]',
  waterSystem: '[data-testid="wb-check-water-btn"]',
  testVillage: '[data-testid="wb-test-village-btn"]',
  missionDashboard: '[data-testid="wb-planning-inputs"]',
};

/** Used only when the primary selector is not in the DOM. */
export const GUIDE_FALLBACK_SELECTORS = {
  '[data-testid="sce-canvas"]': [".sce-canvas-wrap"],
  '[data-testid="wb-planning-inputs"]': ['[data-testid="wb-mission-dashboard"]'],
  '[data-testid="wb-check-water-btn"]': ['[data-testid="wb-status-inspector"]'],
  '[data-testid="wb-dashboard-item-households"]': ['[data-testid="wb-dashboard-reqs"]'],
};

export const HIGHLIGHT_CLASS = "wb-guide-highlight-target";

const SCROLLABLE_OVERFLOW = /(auto|scroll|overlay)/;
const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";

let activeHighlightTimer = null;
let activeHighlightedElement = null;

/**
 * Applies a temporary accessible visual highlight to the target element.
 * Automatically clears after the duration and never mutates document data.
 */
export function applyHighlight(element, durationMs = 2200) {
  if (!element || typeof element.classList === "undefined") return;

  if (activeHighlightedElement && activeHighlightedElement !== element) {
    try {
      activeHighlightedElement.classList.remove(HIGHLIGHT_CLASS);
    } catch {
      // safe fallback
    }
  }
  if (activeHighlightTimer) {
    clearTimeout(activeHighlightTimer);
    activeHighlightTimer = null;
  }

  element.classList.add(HIGHLIGHT_CLASS);
  activeHighlightedElement = element;

  activeHighlightTimer = setTimeout(() => {
    try {
      element.classList.remove(HIGHLIGHT_CLASS);
    } catch {
      // safe fallback
    }
    if (activeHighlightedElement === element) {
      activeHighlightedElement = null;
      activeHighlightTimer = null;
    }
  }, durationMs);
}

/* ------------------------------------------------------------------ */
/* Scroll maths (pure, unit-tested)                                    */
/* ------------------------------------------------------------------ */

/**
 * Where should a container's scrollTop go so the target is centred in the visible area?
 *
 * @param {object} m
 * @param {number} m.scrollTop        container's current scrollTop
 * @param {number} m.clientHeight     container's visible height
 * @param {number} m.scrollHeight     container's total scrollable height
 * @param {number} m.containerTop     container's viewport-relative top edge (inside its border)
 * @param {number} m.targetTop        target's viewport-relative top edge
 * @param {number} m.targetHeight     target's height
 * @param {number} [m.insetTop=0]     space reserved at the top (sticky headers / scroll-padding)
 * @param {number} [m.insetBottom=0]  space reserved at the bottom
 * @returns {number} clamped scrollTop
 */
export function computeScrollTop({
  scrollTop,
  clientHeight,
  scrollHeight,
  containerTop,
  targetTop,
  targetHeight,
  insetTop = 0,
  insetBottom = 0,
}) {
  const visible = Math.max(0, clientHeight - insetTop - insetBottom);
  const targetOffsetInContent = scrollTop + (targetTop - containerTop);
  let desired;
  if (targetHeight >= visible) {
    // Taller than the viewport: line the top edge up just below the inset.
    desired = targetOffsetInContent - insetTop;
  } else {
    desired = targetOffsetInContent - insetTop - (visible - targetHeight) / 2;
  }
  const max = Math.max(0, scrollHeight - clientHeight);
  return Math.min(Math.max(0, Math.round(desired)), max);
}

const parsePx = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

function defaultGetStyle(win) {
  return (el) => (win && typeof win.getComputedStyle === "function" ? win.getComputedStyle(el) : {});
}

/**
 * Scrollable ancestors of `target`, innermost first. Containers with `overflow: hidden|clip` are
 * deliberately skipped: they are not user-scrollable and scrolling them hides the app chrome.
 */
export function findScrollContainers(target, { getStyle, rootDocument } = {}) {
  const read = getStyle || defaultGetStyle(typeof window !== "undefined" ? window : null);
  const containers = [];
  let node = target && target.parentElement;
  while (node) {
    const isRoot = rootDocument && (node === rootDocument.documentElement || node === rootDocument.body);
    if (!isRoot) {
      let style = {};
      try {
        style = read(node) || {};
      } catch {
        style = {};
      }
      const overflowY = style.overflowY || style.overflow || "";
      if (
        SCROLLABLE_OVERFLOW.test(overflowY) &&
        node.scrollHeight - node.clientHeight > 1
      ) {
        containers.push({ element: node, style });
      }
    }
    node = node.parentElement;
  }
  const page = rootDocument && rootDocument.scrollingElement;
  if (page && page.scrollHeight - page.clientHeight > 1 && !containers.some((c) => c.element === page)) {
    containers.push({ element: page, style: {}, isPage: true });
  }
  return containers;
}

export function prefersReducedMotion(win = typeof window !== "undefined" ? window : null) {
  try {
    return Boolean(win && typeof win.matchMedia === "function" && win.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

/**
 * Scrolls every real scroll container between the target and the page so the target is visible.
 * Returns the list of scroll operations performed (useful for tests / diagnostics).
 */
export function scrollTargetIntoView(target, {
  rootDocument,
  win = typeof window !== "undefined" ? window : null,
  getStyle,
  smooth = true,
} = {}) {
  if (!target || typeof target.getBoundingClientRect !== "function") return [];
  const behavior = smooth && !prefersReducedMotion(win) ? "smooth" : "auto";
  const containers = findScrollContainers(target, { getStyle, rootDocument });
  const rect = target.getBoundingClientRect();
  let virtualTop = rect.top;
  const ops = [];

  for (const { element, style, isPage } of containers) {
    const cRect = element.getBoundingClientRect();
    const insetTop = isPage ? 0 : parsePx(style.scrollPaddingTop);
    const insetBottom = isPage ? 0 : parsePx(style.scrollPaddingBottom);
    const containerTop = isPage ? 0 : cRect.top + (element.clientTop || 0);
    const next = computeScrollTop({
      scrollTop: element.scrollTop,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      containerTop,
      targetTop: virtualTop,
      targetHeight: rect.height,
      insetTop,
      insetBottom,
    });
    const from = element.scrollTop;
    const delta = next - from;
    if (Math.abs(delta) < 1) continue;
    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top: next, behavior });
    } else {
      element.scrollTop = next;
    }
    virtualTop -= delta;
    ops.push({ element, from, to: next, behavior });
  }
  return ops;
}

/* ------------------------------------------------------------------ */
/* Collapsed panels                                                    */
/* ------------------------------------------------------------------ */

/**
 * If the target is inside a collapsed (`hidden`) panel body, click the toggle that controls it.
 * The toggle is found through `aria-controls`, so no selector guessing is needed.
 *
 * @returns {boolean} true when at least one panel was asked to expand
 */
export function expandCollapsedAncestors(target, doc) {
  if (!target || !doc || typeof target.closest !== "function") return false;
  let expanded = false;
  try {
    for (let i = 0; i < 4; i += 1) {
      const hidden = target.closest("[hidden]");
      if (!hidden || !hidden.id) break;
      const toggle = doc.querySelector(`[aria-controls="${hidden.id}"][aria-expanded="false"]`);
      if (!toggle || typeof toggle.click !== "function") break;
      toggle.click();
      expanded = true;
      // React applies the state change synchronously for discrete events, so `hidden` is gone now.
      if (target.closest("[hidden]") === hidden) break;
    }
  } catch {
    // never throw from navigation
  }
  return expanded;
}

/**
 * Legacy-compatible helper: expands any collapsed panel around the element matching `selector`.
 */
export function expandPanelForSelector(selector, doc = typeof document !== "undefined" ? document : null) {
  if (!doc || !selector || typeof doc.querySelector !== "function") return false;
  try {
    const target = doc.querySelector(selector);
    return target ? expandCollapsedAncestors(target, doc) : false;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

/** Resolves after React has committed and the browser has laid out (two animation frames). */
export function waitForLayout(win = typeof window !== "undefined" ? window : null) {
  return new Promise((resolve) => {
    if (win && typeof win.requestAnimationFrame === "function") {
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function resolveTarget(doc, selector) {
  let target = doc.querySelector(selector);
  if (target) return target;
  for (const fallback of GUIDE_FALLBACK_SELECTORS[selector] || []) {
    target = doc.querySelector(fallback);
    if (target) return target;
  }
  return null;
}

const isTextEntry = (el) =>
  Boolean(el && typeof el.closest === "function" && el.closest("input, textarea, select, [contenteditable='true']"));

function focusTarget(target, doc, focusSelector) {
  try {
    let node = null;
    if (focusSelector) {
      // Moving focus into a form field is only polite when the player is not already typing elsewhere.
      if (!isTextEntry(doc.activeElement)) node = doc.querySelector(focusSelector);
    } else if (typeof target.matches === "function" && target.matches(FOCUSABLE)) {
      node = target;
    }
    if (node && typeof node.focus === "function") {
      node.focus({ preventScroll: true });
    }
  } catch {
    // focus is best effort
  }
}

/**
 * Navigates from a guide action to its on-screen target.
 *
 * @param {string} selector
 * @param {object} [options]
 * @param {Function} [options.onBeforeNavigate] Minimise/close the guide so it cannot cover the target.
 * @param {Function} [options.onDismiss]        Alias of onBeforeNavigate (kept for compatibility).
 * @param {string}   [options.focusSelector]    Optional field to focus once the target is visible.
 * @param {Document} [options.rootDocument]
 * @param {Window}   [options.win]
 * @param {Function} [options.getStyle]         Computed-style reader (tests inject a fake).
 * @param {boolean}  [options.smooth=true]
 * @param {boolean}  [options.highlight=true]
 * @param {boolean}  [options.focus=true]
 * @returns {Promise<{ok: boolean, reason?: string, target?: Element, scrolled?: Array}>}
 */
export async function navigateToGuideTarget(selector, {
  onBeforeNavigate,
  onDismiss,
  focusSelector,
  rootDocument,
  win = typeof window !== "undefined" ? window : null,
  getStyle,
  smooth = true,
  highlight = true,
  focus = true,
} = {}) {
  const doc = rootDocument || (typeof document !== "undefined" ? document : null);
  if (!doc || !selector) return { ok: false, reason: "no-document-or-selector" };

  // 1. Get the guide out of the way first so it cannot cover the target.
  const beforeNavigate = onBeforeNavigate || onDismiss;
  if (typeof beforeNavigate === "function") {
    try {
      beforeNavigate();
    } catch {
      // never let a callback break navigation
    }
  }

  try {
    // 2. Let React commit and the browser re-layout before measuring anything.
    await waitForLayout(win);

    const target = resolveTarget(doc, selector);
    if (!target) return { ok: false, reason: "target-not-found" };

    // 3. Open any collapsed panel (narrow screens), then wait once more for it to lay out.
    if (expandCollapsedAncestors(target, doc)) {
      await waitForLayout(win);
    }
    if (typeof target.closest === "function" && target.closest("[hidden]")) {
      return { ok: false, reason: "target-hidden", target };
    }

    // 4. Scroll only real scroll containers, nested ones included.
    const scrolled = scrollTargetIntoView(target, { rootDocument: doc, win, getStyle, smooth });

    // 5. Highlight and (politely) focus.
    if (highlight) applyHighlight(target);
    if (focus) focusTarget(target, doc, focusSelector);

    return { ok: true, target, scrolled };
  } catch {
    return { ok: false, reason: "navigation-error" };
  }
}
