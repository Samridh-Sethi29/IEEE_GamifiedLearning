// Pure geometry helpers shared by the reducer and the renderer.

export const round2 = (n) => Math.round(n * 100) / 100;
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Normalise any finite angle into [0, 360). */
export function normalizeAngle(deg) {
  const a = ((deg % 360) + 360) % 360;
  return round2(a);
}

/** Half extents of an object's axis-aligned bounding box once rotated. */
export function halfExtents(obj) {
  const rad = (obj.rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { hw: (obj.width * c + obj.height * s) / 2, hh: (obj.width * s + obj.height * c) / 2 };
}

/**
 * Keep the whole (rotated) object inside the workspace. x/y are the object's centre.
 * If the object is larger than the workspace on an axis it is centred on that axis.
 */
export function clampPosition(obj, canvas, x = obj.x, y = obj.y) {
  const { hw, hh } = halfExtents(obj);
  const cx = hw * 2 >= canvas.width ? canvas.width / 2 : clamp(x, hw, canvas.width - hw);
  const cy = hh * 2 >= canvas.height ? canvas.height / 2 : clamp(y, hh, canvas.height - hh);
  return { x: round2(cx), y: round2(cy) };
}
