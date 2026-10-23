import { Color } from 'three';
import type { GameContext } from '@/game/core/GameContext';
import type { Entity } from '@/game/ecs/Entity';
import { Enemy, Health, Target, Transform, Velocity } from '@/game/ecs/components';
import { ARCHETYPES } from '@/game/factions';

// Tints converted once at module load (no per-spawn Color allocation).
const TINTS = ARCHETYPES.map((a) => new Color(a.tintHex));

export function cycleHpMult(ctx: GameContext): number {
  return Math.pow(ctx.config.cycle.hpBase, ctx.cycle);
}

export function spawnEnemy(ctx: GameContext, unit: number, x: number, z: number): Entity {
  const { world, rng } = ctx;
  const a = ARCHETYPES[unit];
  const e = world.create();
  const t = world.add(e, Transform);
  t.x = t.prevX = x;
  t.z = t.prevZ = z;
  world.add(e, Velocity);
  const h = world.add(e, Health);
  h.hp = h.max = a.hp * cycleHpMult(ctx);
  const target = world.add(e, Target);
  target.radius = a.radius;
  target.archetypeId = a.id;
  target.xp = a.xp;
  target.meshIndex = a.meshIndex;
  target.scale = a.visual.scale;
  const tint = TINTS[unit];
  target.tintR = tint.r;
  target.tintG = tint.g;
  target.tintB = tint.b;
  const en = world.add(e, Enemy);
  en.unit = unit;
  en.strafeDir = rng.next() < 0.5 ? -1 : 1;
  for (let i = 0; i < a.patterns.length; i++) {
    const em = en.emitters[i];
    em.timer = rng.range(0.4, a.patterns[i].cooldown); // desync volleys
    em.angle = rng.range(0, Math.PI * 2);
  }
  return e;
}
