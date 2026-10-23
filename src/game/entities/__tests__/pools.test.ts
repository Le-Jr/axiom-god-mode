import { describe, expect, it } from 'vitest';
import { ProjectilePool } from '../projectiles/ProjectilePool';
import { XpOrbPool } from '../XpOrbPool';

describe('ProjectilePool', () => {
  it('packs bullets and swap-removes on despawn', () => {
    const p = new ProjectilePool(4);
    p.spawn(0, 1, 0, 0, 0, 10, 0.2, 5);
    p.spawn(1, 2, 0, 0, 0, 20, 0.2, 5);
    p.spawn(2, 3, 0, 0, 0, 30, 0.2, 5);
    p.despawn(0);
    expect(p.count).toBe(2);
    expect(p.x[0]).toBe(3); // last moved into the hole
    expect(p.damage[0]).toBe(30);
    expect(p.kind[0]).toBe(2);
  });

  it('drops spawns when full', () => {
    const p = new ProjectilePool(1);
    expect(p.spawn(0, 0, 0, 0, 0, 1, 1, 1)).toBe(0);
    expect(p.spawn(0, 0, 0, 0, 0, 1, 1, 1)).toBe(-1);
    expect(p.dropped).toBe(1);
  });
});

describe('XpOrbPool', () => {
  it('merges value into an existing orb above the threshold', () => {
    const o = new XpOrbPool(8);
    o.spawn(0, 0, 1, 2, 0);
    o.spawn(1, 0, 1, 2, 0);
    o.spawn(2, 0, 5, 2, 1); // merges into slot 1
    expect(o.count).toBe(2);
    expect(o.value[1]).toBe(6);
  });
});
