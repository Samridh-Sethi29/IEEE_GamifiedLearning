/**
 * Authoritative navigation and focus helper for World Builder guided start actions.
 * Handles:
 * 1. Resolving stable target selectors for all 6 guide actions.
 * 2. Closing or minimizing the guide before navigation so the overlay does not obscure the target.
 * 3. Opening collapsed panels (e.g. Palette or Properties on narrow viewports) before scrolling.
 * 4. Smoothly scrolling the target into view centered within its actual scroll container.
 * 5. Applying a temporary, accessible highlight treatment that automatically clears without altering object data.
 * 6. Safely handling missing DOM elements without throwing errors.
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

let activeHighlightTimer = null;
let activeHighlightedElement = null;

/**
 * Applies a temporary accessible visual highlight to the target element.
 * Automatically clears after the duration and does not mutate any document data.
 *
 * @param {HTMLElement} element - Target DOM node
 * @param {number} durationMs - Duration in milliseconds before clearing (default 2200ms)
 */
export function applyHighlight(element, durationMs = 2200) {
  if (!element || typeof element.classList === "undefined") return;

  // Clear any existing active highlight
  if (activeHighlightedElement && activeHighlightedElement !== element) {
    try {
      activeHighlightedElement.classList.remove("wb-guide-highlight-target");
    } catch {
      // safe fallback
    }
  }
  if (activeHighlightTimer) {
    clearTimeout(activeHighlightTimer);
    activeHighlightTimer = null;
  }

  element.classList.add("wb-guide-highlight-target");
  activeHighlightedElement = element;

  activeHighlightTimer = setTimeout(() => {
    try {
      element.classList.remove("wb-guide-highlight-target");
    } catch {
      // safe fallback
    }
    if (activeHighlightedElement === element) {
      activeHighlightedElement = null;
      activeHighlightTimer = null;
    }
  }, durationMs);
}

/**
 * Expands any collapsed panels on narrow screens that may enclose the target.
 *
 * @param {string} selector - Target query selector
 * @param {Document} doc - Document reference
 */
export function expandPanelForSelector(selector, doc = typeof document !== "undefined" ? document : null) {
  if (!doc || !selector) return;

  try {
    // If target is inside palette or palette object
    if (selector.includes("sce-add-") || selector.includes("palette")) {
      const paletteCollapse = doc.querySelector(
        'button.sce-collapse[aria-controls="sce-palette-body"][aria-expanded="false"]'
      );
      if (paletteCollapse && typeof paletteCollapse.click === "function") {
        paletteCollapse.click();
      }
    }

    // If target is inside properties panel (Dashboard, Water Status, Planning inputs)
    if (
      selector.includes("wb-") ||
      selector.includes("props") ||
      selector.includes("dashboard") ||
      selector.includes("water")
    ) {
      const propsCollapse = doc.querySelector(
        'button.sce-collapse[aria-controls="sce-props-body"][aria-expanded="false"]'
      );
      if (propsCollapse && typeof propsCollapse.click === "function") {
        propsCollapse.click();
      }
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Orchestrates navigation from a guide action to the target UI element.
 *
 * @param {string} selector - CSS selector of the target element
 * @param {object} options
 * @param {Function} [options.onDismiss] - Callback to close or minimize the guide
 * @param {Document} [options.rootDocument] - Document override for testing
 * @param {boolean} [options.smooth=true] - Whether to use smooth scrolling
 * @param {boolean} [options.highlight=true] - Whether to apply temporary highlight
 * @param {boolean} [options.focus=true] - Whether to focus the target
 * @returns {boolean} Whether navigation request was initiated successfully
 */
export function navigateToGuideTarget(selector, {
  onDismiss,
  rootDocument,
  smooth = true,
  highlight = true,
  focus = true,
} = {}) {
  const doc = rootDocument || (typeof document !== "undefined" ? document : null);
  if (!doc || !selector) return false;

  // 1. Close or minimize guide first so it does not obscure the target
  if (typeof onDismiss === "function") {
    try {
      onDismiss();
    } catch {
      // safe fallback
    }
  }

  // 2. Open any collapsed panel that might enclose the target (e.g. narrow viewports)
  expandPanelForSelector(selector, doc);

  // Helper to execute scroll and highlight once DOM is ready
  const performScrollAndHighlight = () => {
    try {
      let target = doc.querySelector(selector);

      // Graceful fallback selectors if primary selector isn't immediately found
      if (!target && selector === '[data-testid="sce-canvas"]') {
        target = doc.querySelector(".sce-canvas-wrap");
      }
      if (!target && selector === '[data-testid="wb-planning-inputs"]') {
        target = doc.querySelector('[data-testid="wb-mission-dashboard"]');
      }
      if (!target && selector === '[data-testid="wb-check-water-btn"]') {
        target = doc.querySelector('[data-testid="wb-status-inspector"]');
      }

      if (!target) return false;

      // Also ensure no ancestor has hidden attribute
      const hiddenAncestor = target.closest?.("[hidden]");
      if (hiddenAncestor && typeof hiddenAncestor.removeAttribute === "function") {
        hiddenAncestor.removeAttribute("hidden");
      }

      // Smooth scroll to center within its scroll container
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "center",
          inline: "nearest",
        });
      }

      // Highlight target temporarily
      if (highlight) {
        applyHighlight(target);
      }

      // Focus target if focusable
      if (focus && typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }

      return true;
    } catch {
      return false;
    }
  };

  // Schedule in next frame/tick so React re-render from onDismiss/expand settles
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        performScrollAndHighlight();
      });
    });
  } else {
    setTimeout(performScrollAndHighlight, 0);
  }

  return true;
}
