import { describe, expect, it } from 'vitest';
import { GameLoop } from '@/game/core/GameLoop';
import { createTestContext, type TestContext } from '@/game/core/testing/createTestContext';
import { Enemy, Erasing, Health, Player, Transform } from '@/game/ecs/components';
import { spawnEnemy } from '@/game/entities/enemy';
import { spawnPlayer } from '@/game/entities/player';
import { ARCHETYPE_BY_ID } from '@/game/factions';
import { xpToNext } from '@/game/upgrades/progress';
import { waveDirector } from '@/game/waves/WaveDirector';
import { SYSTEMS } from '../index';

type Patch = Parameters<typeof createTestContext>[0];

function setup(patch: Patch = {}, flags: Partial<TestContext['flags']> = {}): { ctx: TestContext; loop: GameLoop } {
  const ctx = createTestContext({ sandbox: { enabled: false }, ...patch });
  Object.assign(ctx.flags, flags);
  spawnPlayer(ctx);
  const loop = new GameLoop(ctx, SYSTEMS.filter((s) => s.name !== 'input')); // tests drive ctx.input directly
  loop.init();
  return { ctx, loop };
}

const ticks = (loop: GameLoop, n: number) => {
  for (let i = 0; i < n; i++) loop.tick();
};
const unit = (id: string) => ARCHETYPE_BY_ID.get(id)!.index;

describe('player damage', () => {
  it('bullets that touch the player deal damage and are consumed', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    ctx.projectiles.spawn(0, 0.1, 0, 0, 0, 40, 0.2, 5);
    const events = ctx.recordEvents();
    loop.tick();
    expect(ctx.projectiles.count).toBe(0);
    expect(ctx.world.get(ctx.player, Health).hp).toBe(ctx.config.player.maxHp - 40);
    expect(events.find((e) => e.type === 'player:damaged')?.payload).toMatchObject({ amount: 40 });
  });

  it('heavy hits grant i-frames that absorb the next hits', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    const heavy = ctx.config.player.maxHp * ctx.config.player.heavyHitRatio;
    ctx.projectiles.spawn(0, 0, 0, 0, 0, heavy, 0.2, 5);
    loop.tick();
    ctx.projectiles.spawn(0, 0, 0, 0, 0, 100, 0.2, 5);
    loop.tick();
    expect(ctx.world.get(ctx.player, Health).hp).toBeCloseTo(ctx.config.player.maxHp - heavy);
  });

  it('dies once, with run stats', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    ctx.world.get(ctx.player, Health).hp = 10;
    const events = ctx.recordEvents();
    ctx.projectiles.spawn(0, 0, 0, 0, 0, 50, 0.2, 5);
    ctx.projectiles.spawn(0, 0, 0, 0, 0, 50, 0.2, 5);
    loop.tick();
    loop.tick();
    expect(events.filter((e) => e.type === 'player:died')).toHaveLength(1);
    expect(events.find((e) => e.type === 'player:died')?.payload).toMatchObject({ level: 1, tierId: 'police' });
  });

  it('god mode ignores damage', () => {
    const { ctx, loop } = setup({ director: { enabled: false } }, { god: true });
    ctx.projectiles.spawn(0, 0, 0, 0, 0, 999, 0.2, 5);
    loop.tick();
    expect(ctx.world.get(ctx.player, Health).hp).toBe(ctx.config.player.maxHp);
  });
});

describe('enemies', () => {
  it('chase the player and fire within range', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    const e = spawnEnemy(ctx, unit('police_riot'), 15, 0);
    const events = ctx.recordEvents();
    ticks(loop, 240);
    expect(ctx.world.get(e, Transform).x).toBeLessThan(15);
    expect(events.some((ev) => ev.type === 'projectile:fired')).toBe(true);
  });

  it('kills (aura) trigger death patterns; erasures do not', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    const car = spawnEnemy(ctx, unit('police_car'), 2, 0);
    ctx.world.get(car, Health).hp = 1;
    let guard = 0;
    while (ctx.world.isAlive(car) && guard++ < 120) loop.tick();
    expect(ctx.world.isAlive(car)).toBe(false);
    expect(ctx.projectiles.count).toBeGreaterThanOrEqual(6); // death ring, checked on the tick it fires

    const { ctx: c2, loop: l2 } = setup({ director: { enabled: false } });
    const car2 = spawnEnemy(c2, unit('police_car'), 10, 0);
    c2.world.get(car2, Health).hp = 1;
    c2.input.hasAim = true;
    c2.input.aimX = 20;
    c2.input.aimZ = 0;
    c2.input.fire = true;
    guard = 0;
    while (!c2.world.has(car2, Erasing) && guard++ < 120) l2.tick();
    expect(c2.world.has(car2, Erasing)).toBe(true);
    expect(c2.projectiles.count).toBe(0);
  });

  it('erased enemies drop XP orbs that the player collects', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    ctx.bus.emit('enemy:erased', { entity: 0, archetypeId: 'police_officer', x: 1, z: 0, xp: 3 });
    expect(ctx.orbs.count).toBe(1);
    ticks(loop, 30);
    expect(ctx.orbs.count).toBe(0);
    expect(ctx.progress.erasures).toBe(1);
  });
});

describe('level-up flow', () => {
  it('announces choices, waits, applies the pick, and supports rerolls', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    const events = ctx.recordEvents();
    ctx.progress.xp = xpToNext(1, ctx.config);
    loop.tick();
    const lv = events.find((e) => e.type === 'player:levelUp')?.payload as { choices: string[]; rerolls: number };
    expect(lv.choices).toHaveLength(3);
    expect(ctx.progress.awaitingChoice).toBe(true);
    expect(ctx.world.get(ctx.player, Player).level).toBe(2);

    ctx.bus.emit('upgrade:reroll', {});
    expect(ctx.progress.rerolls).toBe(ctx.config.upgrades.rerollsAtStart - 1);
    expect(events.filter((e) => e.type === 'player:levelUp')).toHaveLength(2);

    const pick = ctx.progress.choices[0];
    ctx.bus.emit('upgrade:chosen', { upgradeId: pick });
    expect(ctx.progress.owned.get(pick)).toBe(1);
    expect(ctx.progress.awaitingChoice).toBe(false);
  });

  it('ignores choices that were not offered', () => {
    const { ctx } = setup({ director: { enabled: false } });
    ctx.bus.emit('upgrade:chosen', { upgradeId: 'aura_radius' });
    expect(ctx.progress.owned.size).toBe(0);
  });
});

describe('buff effects', () => {
  it('pierce lets the beam damage 1 + pierce targets in a line', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    ctx.progress.awaitingChoice = true;
    ctx.progress.choices = ['beam_pierce'];
    ctx.bus.emit('upgrade:chosen', { upgradeId: 'beam_pierce' }); // pierce 2
    const es = [8, 10, 12, 14].map((x) => spawnEnemy(ctx, unit('swat_shield'), x, 0));
    ctx.input.hasAim = true;
    ctx.input.aimX = 30;
    ctx.input.aimZ = 0;
    ctx.input.fire = true;
    // Check right after the charge, before AI movement can break the line.
    ticks(loop, Math.ceil(ctx.config.beam.chargeTime / ctx.time.step) + 3);
    const damaged = es.filter((e) => ctx.world.get(e, Health).hp < ctx.world.get(e, Health).max).length;
    expect(damaged).toBe(3);
  });

  it('satellites block bullets', () => {
    const { ctx, loop } = setup({ director: { enabled: false } });
    ctx.progress.awaitingChoice = true;
    ctx.progress.choices = ['satellites'];
    ctx.bus.emit('upgrade:chosen', { upgradeId: 'satellites' });
    expect(ctx.stats.satellites).toBe(1);
    // Put a bullet exactly where the satellite will be next tick.
    const t = ctx.time.simTime + ctx.time.step;
    const a = t * ctx.config.upgrades.satellite.angularSpeed;
    const r = ctx.config.upgrades.satellite.orbitRadius;
    ctx.projectiles.spawn(0, Math.cos(a) * r, Math.sin(a) * r, 0, 0, 10, 0.2, 5);
    loop.tick();
    expect(ctx.projectiles.count).toBe(0);
    expect(ctx.world.get(ctx.player, Health).hp).toBe(ctx.config.player.maxHp);
  });
});

describe('WaveDirector', () => {
  it('spends budget on police at start and spawns off-screen', () => {
    const { ctx, loop } = setup({}, { god: true });
    const enemies = ctx.world.store(Enemy);
    let guard = 0;
    while (enemies.size === 0 && guard++ < 600) loop.tick();
    expect(enemies.size).toBeGreaterThan(0);
    for (let i = 0; i < enemies.size; i++) {
      const e = enemies.entities[i];
      const a = Object.values([...ARCHETYPE_BY_ID.values()]).find((x) => x.index === ctx.world.get(e, Enemy).unit);
      expect(a?.factionId).toBe('police');
      const t = ctx.world.get(e, Transform);
      expect(Math.hypot(t.x, t.z)).toBeGreaterThanOrEqual(ctx.config.director.spawnDistanceMin - 0.5);
    }
  });

  it('unlocks SWAT only when both time and level are met', () => {
    const { ctx } = setup();
    waveDirector.init?.(ctx);
    ctx.time.simTime = 200; // past 90 s
    waveDirector.update(ctx, ctx.time.step);
    expect(ctx.tier).toBe(0); // level 1 < 4
    ctx.progress.level = 4;
    waveDirector.update(ctx, ctx.time.step);
    expect(ctx.tier).toBe(1);
  });

  it('stops spawning at the enemy soft cap', () => {
    const { ctx, loop } = setup({ performance: { enemySoftCap: 3 }, director: { baseBudgetPerSecond: 100, maxBank: 100 } }, { god: true });
    ticks(loop, 60);
    expect(ctx.world.store(Enemy).size).toBeLessThanOrEqual(3 + ctx.config.director.maxSpawnsPerTick);
  });
});
