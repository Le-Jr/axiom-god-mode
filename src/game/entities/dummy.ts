import type { GameContext } from '@/game/core/GameContext';
import type { Entity } from '@/game/ecs/Entity';
import { Health, Target, Transform } from '@/game/ecs/components';

export const DUMMY_ARCHETYPE = 'sandbox_dummy';

/** Phase 2 test target: static, erasable, killable by the aura. */
export function spawnDummy(ctx: GameContext, x: number, z: number): Entity {
  const { world, config } = ctx;
  const e = world.create();
  const t = world.add(e, Transform);
  t.x = t.prevX = x;
  t.z = t.prevZ = z;
  t.rot = ctx.rng.range(0, Math.PI * 2);
  const h = world.add(e, Health);
  h.hp = h.max = config.sandbox.dummyHp;
  const target = world.add(e, Target);
  target.radius = config.sandbox.dummyRadius;
  target.archetypeId = DUMMY_ARCHETYPE;
  return e;
}
