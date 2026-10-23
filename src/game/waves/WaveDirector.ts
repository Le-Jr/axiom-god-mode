import type { GameContext } from '@/game/core/GameContext';
import type { System } from '@/game/ecs/System';
import { Enemy, Transform } from '@/game/ecs/components';
import { spawnEnemy } from '@/game/entities/enemy';
import { ARCHETYPES, FACTIONS } from '@/game/factions';

// Archetype indices per tier, computed once.
const TIER_UNITS: number[][] = FACTIONS.map((f) => ARCHETYPES.filter((a) => a.factionId === f.id).map((a) => a.index));

let budget = 0;
let announced = -1;

/** Unlock time for tier `i` in the current Cycle (compressed each Cycle). */
export function unlockTime(ctx: GameContext, i: number): number {
  return FACTIONS[i].unlock.time * Math.pow(ctx.config.cycle.timeCompression, ctx.cycle);
}

/** Budget accrual per second at the current time and Cycle. */
export function budgetRate(ctx: GameContext): number {
  const d = ctx.config.director;
  const minutes = ctx.time.simTime / 60;
  return (d.baseBudgetPerSecond + d.budgetGrowthPerMinute * minutes) * (1 + ctx.config.cycle.densityStep * ctx.cycle);
}

function pickTier(ctx: GameContext): number {
  const decay = ctx.config.director.tierDecay;
  let total = 0;
  for (let t = 0; t <= ctx.tier; t++) total += FACTIONS[t].spawnWeight * Math.pow(decay, ctx.tier - t);
  let r = ctx.rng.next() * total;
  for (let t = 0; t <= ctx.tier; t++) {
    r -= FACTIONS[t].spawnWeight * Math.pow(decay, ctx.tier - t);
    if (r < 0) return t;
  }
  return ctx.tier;
}

/**
 * WaveDirector v1: accrues a spawn budget (grows with time and Cycle), unlocks tiers by time AND
 * level, and spends the budget on units from unlocked tiers (older tiers decay in weight).
 * Spawns land on a ring outside the view. Bosses and Cycles come later.
 */
export const waveDirector: System = {
  name: 'waveDirector',
  phase: 'director',
  init() {
    budget = 0;
    announced = -1;
  },
  update(ctx, dt) {
    const d = ctx.config.director;
    if (!d.enabled || ctx.flags.stress || ctx.player < 0 || !ctx.world.isAlive(ctx.player)) return;
    const step = dt * ctx.time.timeScale;

    const next = ctx.tier + 1;
    if (next < FACTIONS.length && ctx.time.simTime >= unlockTime(ctx, next) && ctx.progress.level >= FACTIONS[next].unlock.level) {
      ctx.tier = next;
    }
    if (announced !== ctx.tier) {
      announced = ctx.tier;
      ctx.bus.emit('tier:changed', { tierId: FACTIONS[ctx.tier].id, cycle: ctx.cycle });
    }

    budget = Math.min(d.maxBank, budget + budgetRate(ctx) * step);
    if (ctx.world.store(Enemy).size >= ctx.config.performance.enemySoftCap) return;

    const pt = ctx.world.get(ctx.player, Transform);
    for (let s = 0; s < d.maxSpawnsPerTick; s++) {
      const units = TIER_UNITS[pickTier(ctx)];
      const unit = units[ctx.rng.int(0, units.length - 1)];
      const cost = ARCHETYPES[unit].budgetCost;
      if (budget < cost) break;
      budget -= cost;
      const a = ctx.rng.range(0, Math.PI * 2);
      const r = ctx.rng.range(d.spawnDistanceMin, d.spawnDistanceMax);
      spawnEnemy(ctx, unit, pt.x + Math.cos(a) * r, pt.z + Math.sin(a) * r);
    }
  },
};

/** Test hook: current budget. */
export function directorBudget(): number {
  return budget;
}
