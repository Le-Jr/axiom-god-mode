// Template: copy to src/game/systems/__tests__/<name>System.test.ts
import { describe, expect, it } from 'vitest';
import { createTestContext } from '@/game/core/testing/createTestContext';
import { Health, Transform } from '@/game/ecs/components';
import { regenSystem } from '../regenSystem';

describe('regenSystem', () => {
  it('regenerates HP up to max', () => {
    const ctx = createTestContext();
    regenSystem.init?.(ctx);
    const e = ctx.world.create();
    ctx.world.add(e, Transform);
    ctx.world.add(e, Health, { hp: 50, max: 52 });

    regenSystem.update(ctx, 1);

    expect(ctx.world.get(e, Health).hp).toBe(52);
  });

  it('emits no events', () => {
    const ctx = createTestContext();
    regenSystem.init?.(ctx);
    const events = ctx.recordEvents();
    regenSystem.update(ctx, ctx.time.step);
    expect(events).toHaveLength(0);
  });
});
