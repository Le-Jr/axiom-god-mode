import { describe, expect, it } from 'vitest';
import { SpatialHash } from '../SpatialHash';

describe('SpatialHash', () => {
  it('finds overlapping circles and skips distant ones', () => {
    const g = new SpatialHash(64, 2, 64);
    g.insert(1, 0, 0, 0.5);
    g.insert(2, 3, 0, 0.5);
    g.insert(3, 50, 50, 0.5);
    const out = new Int32Array(8);
    const n = g.query(1, 0, 1, out);
    const ids = Array.from(out.subarray(0, n), (s) => g.ids[s]).sort();
    expect(ids).toEqual([1]);
    const n2 = g.query(1.5, 0, 1.5, out);
    expect(Array.from(out.subarray(0, n2), (s) => g.ids[s]).sort()).toEqual([1, 2]);
  });

  it('accounts for large item radii stored in neighboring cells', () => {
    const g = new SpatialHash(8, 1, 64);
    g.insert(7, 5, 5, 3); // big item, center far from the query cell
    const out = new Int32Array(4);
    expect(g.query(2.5, 5, 0.1, out)).toBe(1);
  });

  it('dedupes candidates when buckets alias (tiny table)', () => {
    const g = new SpatialHash(32, 1, 2); // 2 buckets: heavy aliasing
    for (let i = 0; i < 10; i++) g.insert(i, i * 0.1, 0, 0.2);
    const out = new Int32Array(32);
    const n = g.query(0.5, 0, 5, out);
    expect(n).toBe(10);
    expect(new Set(out.subarray(0, n)).size).toBe(10);
  });

  it('clear resets contents; overflow is counted', () => {
    const g = new SpatialHash(2, 1, 8);
    g.insert(1, 0, 0, 1);
    g.insert(2, 0, 0, 1);
    g.insert(3, 0, 0, 1);
    expect(g.dropped).toBe(1);
    g.clear();
    expect(g.query(0, 0, 10, new Int32Array(4))).toBe(0);
  });

  it('rejects non power-of-two bucket counts', () => {
    expect(() => new SpatialHash(4, 1, 100)).toThrow();
  });
});
