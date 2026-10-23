import { describe, expect, it } from 'vitest';
import { createTestContext } from '@/game/core/testing/createTestContext';
import { aimed, ring, spiral, spread } from '../emitters';
import { stepEmitter } from '../index';
import type { EmitterState, PatternDef } from '../types';

const state = (): EmitterState => ({ timer: 0, burst: 0, angle: 0 });
const angleOf = (ctx: ReturnType<typeof createTestContext>, i: number) => Math.atan2(ctx.projectiles.vz[i], ctx.projectiles.vx[i]);
const base = { bulletKind: 'pellet', speed: 5, damage: 10, cooldown: 1 } as const;

describe('emitters', () => {
  it('ring: `count` bullets at equal angles, rotating each volley', () => {
    const ctx = createTestContext();
    const def: PatternDef = { ...base, kind: 'ring', count: 8, angularVel: 90 };
    const s = state();
    ring(ctx, def, s, 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(8);
    expect(angleOf(ctx, 2)).toBeCloseTo(Math.PI / 2);
    expect(s.angle).toBeCloseTo(Math.PI / 2); // 90 deg/s * 1 s cooldown
  });

  it('spread: evenly across the arc, centered on the target', () => {
    const ctx = createTestContext();
    spread(ctx, { ...base, kind: 'spread', count: 3, arc: 60 }, state(), 0, 0, 10, 0);
    expect(ctx.projectiles.count).toBe(3);
    expect(angleOf(ctx, 0)).toBeCloseTo(-Math.PI / 6);
    expect(angleOf(ctx, 1)).toBeCloseTo(0);
    expect(angleOf(ctx, 2)).toBeCloseTo(Math.PI / 6);
  });

  it('aimed: a stream toward the target with decreasing speed', () => {
    const ctx = createTestContext();
    aimed(ctx, { ...base, kind: 'aimed', count: 2 }, state(), 0, 0, 0, 10);
    expect(angleOf(ctx, 0)).toBeCloseTo(Math.PI / 2);
    expect(Math.hypot(ctx.projectiles.vx[1], ctx.projectiles.vz[1])).toBeLessThan(5);
  });

  it('spiral: arms per volley and rotation per burst gap', () => {
    const ctx = createTestContext();
    const s = state();
    spiral(ctx, { ...base, kind: 'spiral', arms: 3, angularVel: 100, bursts: 4, burstGap: 0.1 }, s, 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(3);
    expect(s.angle).toBeCloseTo(10 * (Math.PI / 180));
  });

  it('scales count with Cycle and clamps at maxCount; damage scales by dmgBase^cycle', () => {
    const ctx = createTestContext({}, { cycle: 10 });
    ring(ctx, { ...base, kind: 'ring', count: 8, complexity: { countPerCycle: 4, maxCount: 24 } }, state(), 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(24);
    expect(ctx.projectiles.damage[0]).toBeCloseTo(10 * Math.pow(ctx.config.cycle.dmgBase, 10), 3);
  });

  it('stops at the bullet soft cap and counts drops', () => {
    const ctx = createTestContext({ performance: { bulletSoftCap: 5 } });
    const before = ctx.debug.droppedBullets;
    ring(ctx, { ...base, kind: 'ring', count: 8 }, state(), 0, 0, 0, 0);
    expect(ctx.projectiles.count).toBe(5);
    expect(ctx.debug.droppedBullets).toBe(before + 1);
  });
});

describe('stepEmitter', () => {
  it('fires bursts `burstGap` apart, then waits the cooldown', () => {
    const ctx = createTestContext();
    const def: PatternDef = { ...base, kind: 'aimed', count: 1, cooldown: 2, bursts: 3, burstGap: 0.1 };
    const s = state();
    const fired: number[] = [];
    for (let t = 0; t < 120; t++) if (stepEmitter(ctx, def, s, 1 / 60, 0, 0, 1, 0)) fired.push(t);
    // Burst at t = 0, 6, 12 ticks; the 2 s cooldown pushes the next burst past this 2 s window.
    expect(fired).toEqual([0, 6, 12]);
  });
});
