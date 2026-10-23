// Template: copy to src/game/systems/patterns/__tests__/<kind>.test.ts
import { describe, expect, it } from 'vitest';
import { createTestContext } from '@/game/core/testing/createTestContext';
import { ring } from '../ring';

describe('ring emitter', () => {
  it('spawns `count` bullets at equal angles', () => {
    const ctx = createTestContext();
    const state = { angle: 0, timer: 0, burst: 0 };
    ring(ctx, { kind: 'ring', bulletKind: 'pellet', speed: 5, damage: 10, cooldown: 1, count: 8 }, state, 0, 0);
    expect(ctx.projectiles.activeCount).toBe(8);
    const s = ctx.projectiles.active[2];
    expect(Math.atan2(ctx.projectiles.vz[s], ctx.projectiles.vx[s])).toBeCloseTo(Math.PI / 2);
  });

  it('scales with cycle and clamps at maxCount', () => {
    const ctx = createTestContext({}, { cycle: 10 });
    ring(ctx, { kind: 'ring', bulletKind: 'pellet', speed: 5, damage: 10, cooldown: 1, count: 8,
      complexity: { countPerCycle: 4, maxCount: 24 } }, { angle: 0, timer: 0, burst: 0 }, 0, 0);
    expect(ctx.projectiles.activeCount).toBe(24);
  });
});
