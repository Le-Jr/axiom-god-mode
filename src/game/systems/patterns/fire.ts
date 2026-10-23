import { BULLET_KINDS, type BulletKindId } from '@/game/config';
import type { GameContext } from '@/game/core/GameContext';
import type { PatternDef } from './types';

const KIND_INDEX = new Map<BulletKindId, number>(BULLET_KINDS.map((k, i) => [k, i]));

export function cycleDamageMult(ctx: GameContext): number {
  return Math.pow(ctx.config.cycle.dmgBase, ctx.cycle);
}

/** Bullet count for this Cycle, clamped by the pattern's cap. */
export function scaledCount(ctx: GameContext, def: PatternDef, base: number, perCycle: number | undefined): number {
  const max = def.complexity?.maxCount ?? base + 32;
  return Math.max(1, Math.min(base + Math.floor((perCycle ?? 0) * ctx.cycle), max));
}

export function scaledSpeed(ctx: GameContext, def: PatternDef): number {
  return def.speed + (def.complexity?.speedPerCycle ?? 0) * ctx.cycle;
}

/** Spawns one enemy bullet. Returns false (and counts a drop) at the soft cap. */
export function fireBullet(ctx: GameContext, def: PatternDef, x: number, z: number, angle: number, speed: number): boolean {
  const pool = ctx.projectiles;
  if (pool.count >= ctx.config.performance.bulletSoftCap) {
    ctx.debug.droppedBullets++;
    return false;
  }
  const kind = ctx.config.projectiles.kinds[def.bulletKind];
  const slot = pool.spawn(
    KIND_INDEX.get(def.bulletKind) ?? 0,
    x,
    z,
    Math.cos(angle) * speed,
    Math.sin(angle) * speed,
    def.damage * cycleDamageMult(ctx),
    kind.radius,
    kind.life,
  );
  if (slot === -1) ctx.debug.droppedBullets++;
  return slot !== -1;
}
