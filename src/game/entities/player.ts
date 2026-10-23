import type { GameContext } from '@/game/core/GameContext';
import type { Entity } from '@/game/ecs/Entity';
import { Health, Player, Transform, Velocity } from '@/game/ecs/components';

export function spawnPlayer(ctx: GameContext, x = 0, z = 0): Entity {
  const { world } = ctx;
  const e = world.create();
  const t = world.add(e, Transform);
  t.x = t.prevX = x;
  t.z = t.prevZ = z;
  world.add(e, Velocity);
  const h = world.add(e, Health);
  h.hp = h.max = ctx.stats.maxHp;
  const p = world.add(e, Player);
  p.energy = p.maxEnergy = ctx.stats.beamMaxEnergy;
  p.auraRadius = ctx.stats.auraRadius;
  ctx.player = e;
  ctx.view.targetX = x;
  ctx.view.targetZ = z;
  return e;
}
