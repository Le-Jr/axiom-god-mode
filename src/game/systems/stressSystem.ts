import type { System } from '@/game/ecs/System';
import { Enemy, Transform } from '@/game/ecs/components';
import { spawnEnemy } from '@/game/entities/enemy';
import { fireBullet } from './patterns/fire';
import type { PatternDef } from './patterns/types';

const RING: PatternDef = { kind: 'ring', bulletKind: 'pellet', speed: 0, damage: 0, cooldown: 0 };
const MAX_RINGS_PER_TICK = 8;

/**
 * `?stress=bullets` (PERFORMANCE.md): holds ~300 enemies and ~2,500 bullets around the player
 * with the director off and the player invulnerable, to measure frame cost under load.
 */
export const stressSystem: System = {
  name: 'stress',
  phase: 'director',
  update(ctx) {
    if (!ctx.flags.stress || ctx.player < 0 || !ctx.world.isAlive(ctx.player)) return;
    const { world, rng, config } = ctx;
    const s = config.stress;
    const pt = world.get(ctx.player, Transform);

    let spawns = 0;
    while (world.store(Enemy).size < s.enemies && spawns++ < 20) {
      const a = rng.range(0, Math.PI * 2);
      const r = rng.range(8, 30);
      spawnEnemy(ctx, 0, pt.x + Math.cos(a) * r, pt.z + Math.sin(a) * r);
    }

    let rings = 0;
    while (ctx.projectiles.count + s.ringSize <= s.bullets && rings++ < MAX_RINGS_PER_TICK) {
      const a = rng.range(0, Math.PI * 2);
      const ox = pt.x + Math.cos(a) * s.ringDistance;
      const oz = pt.z + Math.sin(a) * s.ringDistance;
      const offset = rng.range(0, Math.PI * 2);
      for (let i = 0; i < s.ringSize; i++) {
        fireBullet(ctx, RING, ox, oz, offset + (i * Math.PI * 2) / s.ringSize, s.ringSpeed);
      }
    }
  },
};
