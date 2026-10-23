import type { GameContext } from '@/game/core/GameContext';
import type { Entity } from '@/game/ecs/Entity';
import { Health, Player, Transform, Velocity } from '@/game/ecs/components';

export function spawnPlayer(ctx: GameContext, x = 0, z = 0): Entity {
  const { world, config } = ctx;
  const e = world.create();
  const t = world.add(e, Transform);
  t.x = t.prevX = x;
  t.z = t.prevZ = z;
  world.add(e, Velocity);
  const h = world.add(e, Health);
  h.hp = h.max = config.player.maxHp;
  const p = world.add(e, Player);
  p.energy = p.maxEnergy = config.beam.maxEnergy;
  p.auraRadius = config.aura.radius;
  ctx.player = e;
  ctx.view.targetX = x;
  ctx.view.targetZ = z;
  return e;
}
