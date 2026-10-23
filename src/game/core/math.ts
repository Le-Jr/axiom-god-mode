// Shared allocation-free math for the XZ gameplay plane.

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Frame-rate independent exponential approach factor. */
export function damp(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

/**
 * Ray (origin o, unit direction d, length len, half-width w) vs circle (c, r).
 * Returns the distance along the ray where the swept segment first touches the circle,
 * or -1 if there is no hit within [0, len].
 */
export function rayCircle(
  ox: number,
  oz: number,
  dx: number,
  dz: number,
  len: number,
  halfWidth: number,
  cx: number,
  cz: number,
  r: number,
): number {
  const R = r + halfWidth;
  const fx = cx - ox;
  const fz = cz - oz;
  const t = fx * dx + fz * dz; // projection of center onto ray
  const perp2 = fx * fx + fz * fz - t * t;
  const R2 = R * R;
  if (perp2 > R2) return -1;
  const entry = t - Math.sqrt(R2 - perp2);
  if (entry > len) return -1;
  if (t + Math.sqrt(R2 - perp2) < 0) return -1; // circle entirely behind origin
  return entry < 0 ? 0 : entry;
}

export function distSq(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}
