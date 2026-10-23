import { describe, expect, it } from 'vitest';
import { GameLoop } from '@/game/core/GameLoop';
import { createTestContext, type TestContext } from '@/game/core/testing/createTestContext';
import { BeamState, Erasing, Health, Player, Target, Transform, Velocity } from '@/game/ecs/components';
import { spawnDummy } from '@/game/entities/dummy';
import { spawnPlayer } from '@/game/entities/player';
import { auraSystem } from '../auraSystem';
import { beamSystem } from '../beamSystem';
import { cleanupSystem } from '../cleanupSystem';
import { damageSystem } from '../damageSystem';
import { erasureSystem } from '../erasureSystem';
import { gridSystem } from '../gridSystem';
import { playerMovementSystem } from '../playerMovementSystem';

function setup(): { ctx: TestContext; loop: GameLoop } {
  const ctx = createTestContext({ sandbox: { enabled: false } });
  spawnPlayer(ctx);
  const loop = new GameLoop(ctx, [gridSystem, playerMovementSystem, auraSystem, beamSystem, damageSystem, erasureSystem, cleanupSystem]);
  loop.init();
  return { ctx, loop };
}

const ticks = (loop: GameLoop, n: number) => {
  for (let i = 0; i < n; i++) loop.tick();
};

describe('player movement', () => {
  it('moves toward -Z with "up" and approaches move speed', () => {
    const { ctx, loop } = setup();
    ctx.input.up = true;
    ticks(loop, 60);
    const t = ctx.world.get(ctx.player, Transform);
    expect(t.z).toBeLessThan(-6);
    expect(Math.abs(t.x)).toBeLessThan(1e-9);
    expect(ctx.view.targetZ).toBe(t.z);
  });

  it('normalizes diagonal input', () => {
    const { ctx, loop } = setup();
    ctx.input.up = ctx.input.right = true;
    ticks(loop, 120);
    const v = ctx.world.get(ctx.player, Velocity);
    expect(Math.hypot(v.vx, v.vz)).toBeCloseTo(ctx.config.player.moveSpeed, 3);
  });
});

describe('aura', () => {
  it('pulses on its interval and only hits targets inside the radius', () => {
    const { ctx, loop } = setup();
    const near = spawnDummy(ctx, 3, 0);
    const far = spawnDummy(ctx, 12, 0);
    const events = ctx.recordEvents();
    const ticksPerPulse = Math.ceil(ctx.config.aura.pulseInterval / ctx.time.step);
    ticks(loop, ticksPerPulse);
    expect(events.filter((e) => e.type === 'aura:pulse')).toHaveLength(1);
    expect(ctx.world.get(near, Health).hp).toBe(ctx.config.sandbox.dummyHp - ctx.config.aura.damagePerPulse);
    expect(ctx.world.get(far, Health).hp).toBe(ctx.config.sandbox.dummyHp);
  });

  it('kills (not erases) and destroys targets', () => {
    const { ctx, loop } = setup();
    const near = spawnDummy(ctx, 2, 0);
    ctx.world.get(near, Health).hp = 1;
    const events = ctx.recordEvents();
    ticks(loop, Math.ceil(ctx.config.aura.pulseInterval / ctx.time.step) + 1);
    expect(events.some((e) => e.type === 'enemy:killed')).toBe(true);
    expect(events.some((e) => e.type === 'enemy:erased')).toBe(false);
    expect(ctx.world.isAlive(near)).toBe(false);
  });
});

describe('erasure beam', () => {
  function aimAt(ctx: TestContext, x: number, z: number) {
    ctx.input.hasAim = true;
    ctx.input.aimX = x;
    ctx.input.aimZ = z;
  }

  it('charges, channels and erases the first target on the ray', () => {
    const { ctx, loop } = setup();
    const front = spawnDummy(ctx, 10, 0);
    const behind = spawnDummy(ctx, 14, 0);
    aimAt(ctx, 20, 0);
    ctx.input.fire = true;
    const events = ctx.recordEvents();

    loop.tick();
    expect(ctx.world.get(ctx.player, Player).beamState).toBe(BeamState.charging);

    let guard = 0;
    while (!ctx.world.has(front, Erasing) && guard++ < 600) loop.tick();

    expect(events.some((e) => e.type === 'beam:start')).toBe(true);
    expect(ctx.world.has(front, Erasing)).toBe(true);
    expect(ctx.world.get(behind, Health).hp).toBe(ctx.config.sandbox.dummyHp); // no pierce while front stands
    loop.tick();
    expect(ctx.world.get(behind, Health).hp).toBeLessThan(ctx.config.sandbox.dummyHp); // erased front no longer blocks
    const erased = events.find((e) => e.type === 'enemy:erased');
    expect(erased?.payload).toMatchObject({ archetypeId: 'sandbox_dummy', x: 10, z: 0 });
  });

  it('removes erased entities after the dissolve', () => {
    const { ctx, loop } = setup();
    const d = spawnDummy(ctx, 5, 0);
    ctx.world.get(d, Health).hp = 1;
    aimAt(ctx, 20, 0);
    ctx.input.fire = true;
    ticks(loop, Math.ceil(ctx.config.beam.chargeTime / ctx.time.step) + 2);
    expect(ctx.world.has(d, Erasing)).toBe(true);
    const { freeze, flatten, vanish } = ctx.config.erasure;
    ticks(loop, Math.ceil((freeze + flatten + vanish) / ctx.time.step) + 1);
    expect(ctx.world.isAlive(d)).toBe(false);
  });

  it('drains energy, locks out when empty, and re-arms at minEnergyToFire', () => {
    const { ctx, loop } = setup();
    const cfg = ctx.config.beam;
    aimAt(ctx, 20, 0);
    ctx.input.fire = true;
    const events = ctx.recordEvents();
    ticks(loop, Math.ceil((cfg.chargeTime + cfg.maxEnergy / cfg.drainPerSecond) / ctx.time.step) + 5);
    const p = ctx.world.get(ctx.player, Player);
    expect(p.energy).toBe(0);
    expect(p.lockedOut).toBe(true);
    expect(events.some((e) => e.type === 'beam:empty')).toBe(true);

    // Holding fire while locked out does not restart the beam.
    ticks(loop, 30);
    expect(p.beamState).toBe(BeamState.idle);

    let guard = 0;
    while (p.lockedOut && guard++ < 600) loop.tick();
    expect(p.lockedOut).toBe(false);
    expect(p.energy).toBeGreaterThanOrEqual(cfg.minEnergyToFire);
    expect(p.energy).toBeLessThan(cfg.minEnergyToFire + 1);
    loop.tick();
    expect(p.beamState).toBe(BeamState.charging);
  });

  it('releasing during charge goes to tail without damage', () => {
    const { ctx, loop } = setup();
    const d = spawnDummy(ctx, 5, 0);
    aimAt(ctx, 20, 0);
    ctx.input.fire = true;
    loop.tick();
    ctx.input.fire = false;
    loop.tick();
    expect(ctx.world.get(ctx.player, Player).beamState).toBe(BeamState.tail);
    expect(ctx.world.get(d, Health).hp).toBe(ctx.config.sandbox.dummyHp);
    expect(ctx.world.get(d, Target).flash).toBe(0);
  });
});
