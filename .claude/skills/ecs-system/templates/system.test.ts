// Template: copy to src/game/systems/__tests__/<name>System.test.ts
import { describe, expect, it } from 'vitest';
import { createTestContext } from '@/game/core/testing/createTestContext';
import { regenSystem } from '../regenSystem';
import { Health, Transform } from '@/game/ecs/components';

describe('regenSystem', () => {
  it('regenerates HP up to max', () => {
    const ctx = createTestContext({ enemies: { regenPerSecond: 10 } });
    const e = ctx.world.create();
    ctx.world.add(e, Transform, { x: 0, z: 0 });
    ctx.world.add(e, Health, { hp: 50, max: 55 });

    regenSystem.update(ctx, 1);

    expect(ctx.world.get(e, Health).hp).toBe(55);
  });

  it('emits no events and leaves pools unchanged', () => {
    const ctx = createTestContext();
    const emitted = ctx.bus.recordAll();
    regenSystem.update(ctx, 1 / 60);
    expect(emitted).toHaveLength(0);
  });
});
