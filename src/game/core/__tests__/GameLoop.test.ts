import { describe, expect, it } from 'vitest';
import type { System } from '@/game/ecs/System';
import { GameLoop } from '../GameLoop';
import { createTestContext } from '../testing/createTestContext';

function counter(name = 'counter', phase: System['phase'] = 'player') {
  const s = { name, phase, ticks: 0, update() { s.ticks++; } };
  return s;
}

describe('GameLoop', () => {
  it('runs one tick per fixed step and keeps the remainder as alpha', () => {
    const ctx = createTestContext();
    const sys = counter();
    const loop = new GameLoop(ctx, [sys]);
    const step = ctx.time.step;

    expect(loop.frame(step * 2.5)).toBe(2);
    expect(sys.ticks).toBe(2);
    expect(ctx.time.alpha).toBeCloseTo(0.5);
    expect(ctx.time.tick).toBe(2);
  });

  it('clamps huge frame deltas and caps substeps', () => {
    const ctx = createTestContext();
    const sys = counter();
    const loop = new GameLoop(ctx, [sys]);
    loop.frame(10); // tab was hidden for 10 s
    expect(sys.ticks).toBe(ctx.config.loop.maxSubsteps);
    loop.frame(0);
    expect(sys.ticks).toBe(ctx.config.loop.maxSubsteps); // backlog dropped
  });

  it('does not tick while any pause reason is active', () => {
    const ctx = createTestContext();
    const sys = counter();
    const loop = new GameLoop(ctx, [sys]);
    const events = ctx.recordEvents();
    loop.pause('ui');
    loop.pause('hidden');
    loop.frame(1);
    loop.resume('ui');
    loop.frame(ctx.time.step);
    expect(sys.ticks).toBe(0);
    loop.resume('hidden');
    loop.frame(ctx.time.step);
    expect(sys.ticks).toBe(1);
    expect(events.map((e) => e.type)).toEqual(['tick:paused', 'tick:paused', 'tick:resumed', 'tick:resumed']);
  });

  it('orders systems by phase, keeping registration order within a phase', () => {
    const ctx = createTestContext();
    const order: string[] = [];
    const mk = (name: string, phase: System['phase']): System => ({ name, phase, update: () => order.push(name) });
    const loop = new GameLoop(ctx, [mk('cleanup', 'cleanup'), mk('b', 'ai'), mk('input', 'input'), mk('c', 'ai')]);
    loop.tick();
    expect(order).toEqual(['input', 'b', 'c', 'cleanup']);
  });

  it('scales simTime by timeScale', () => {
    const ctx = createTestContext();
    const loop = new GameLoop(ctx, []);
    ctx.time.timeScale = 0.5;
    loop.tick();
    expect(ctx.time.simTime).toBeCloseTo(ctx.time.step * 0.5);
  });

  it('dispose calls system dispose and clears listeners', () => {
    const ctx = createTestContext();
    let disposed = false;
    const loop = new GameLoop(ctx, [{ name: 'x', phase: 'ai', update() {}, dispose: () => { disposed = true; } }]);
    ctx.bus.on('run:start', () => {});
    loop.dispose();
    expect(disposed).toBe(true);
    expect(ctx.bus.listenerCount()).toBe(0);
  });
});
