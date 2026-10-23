import { describe, expect, it } from 'vitest';
import { rayCircle } from '../math';

describe('rayCircle', () => {
  it('returns the entry distance for a circle on the ray', () => {
    expect(rayCircle(0, 0, 1, 0, 20, 0, 10, 0, 1)).toBeCloseTo(9);
  });

  it('accounts for beam half-width', () => {
    // circle 1.4 off-axis, radius 1: misses a thin ray, hit by a 0.5 half-width beam
    expect(rayCircle(0, 0, 1, 0, 20, 0, 10, 1.4, 1)).toBe(-1);
    expect(rayCircle(0, 0, 1, 0, 20, 0.5, 10, 1.4, 1)).toBeGreaterThan(8);
  });

  it('misses beyond range and behind the origin', () => {
    expect(rayCircle(0, 0, 1, 0, 5, 0, 10, 0, 1)).toBe(-1);
    expect(rayCircle(0, 0, 1, 0, 20, 0, -10, 0, 1)).toBe(-1);
  });

  it('returns 0 when the origin is inside the circle', () => {
    expect(rayCircle(0, 0, 0, 1, 20, 0, 0, 0.2, 1)).toBe(0);
  });
});
