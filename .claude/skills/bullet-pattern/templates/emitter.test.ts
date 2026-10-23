// Template: add cases to src/game/systems/patterns/__tests__/emitters.test.ts
import { describe, expect, it } from 'vitest';
import { createTestContext } from '@/game/core/testing/createTestContext';
import { ring } from '../emitters';

const state = () => ({ timer: 0, burst: 0, angle: 0 });

describe('ring emitter', () => {
  it('spawns `count` bullets at equal angles', () => {
    const ctx = createTestContext();
    ring(ctx, { kind: 'ring', bulletKind: 'pellet', speed: 5, damage: 10, cooldown: 1, count: 8 }, state(), 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(8);
    expect(Math.atan2(ctx.projectiles.vz[2], ctx.projectiles.vx[2])).toBeCloseTo(Math.PI / 2);
  });

  it('scales with cycle and clamps at maxCount', () => {
    const ctx = createTestContext({}, { cycle: 10 });
    ring(ctx, { kind: 'ring', bulletKind: 'pellet', speed: 5, damage: 10, cooldown: 1, count: 8,
      complexity: { countPerCycle: 4, maxCount: 24 } }, state(), 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(24);
  });
});
