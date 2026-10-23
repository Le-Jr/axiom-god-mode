import { HitKind } from '@/game/core/HitBuffer';
import type { System } from '@/game/ecs/System';
import { Enemy, Transform } from '@/game/ecs/components';
import { ARCHETYPES } from '@/game/factions';

/**
 * Enemy bullets and enemy bodies vs the player. With a single player, a linear pass over the
 * bullet pool is optimal (one circle test per bullet); the grid serves many-vs-many queries.
 */
export const collisionSystem: System = {
  name: 'collision',
  phase: 'collision',
  update(ctx, dt) {
    const { world, projectiles: pool, hits, grid, gridResults, config } = ctx;
    if (ctx.player < 0 || !world.isAlive(ctx.player)) return;
    const pt = world.get(ctx.player, Transform);
    const pr = config.player.radius;

    for (let i = pool.count - 1; i >= 0; i--) {
      const dx = pool.x[i] - pt.x;
      const dz = pool.z[i] - pt.z;
      const rr = pool.radius[i] + pr;
      if (dx * dx + dz * dz <= rr * rr) {
        hits.push(ctx.player, pool.damage[i], HitKind.bullet);
        pool.despawn(i);
      }
    }

    const step = dt * ctx.time.timeScale;
    const m = grid.query(pt.x, pt.z, pr, gridResults);
    for (let j = 0; j < m; j++) {
      const e = grid.ids[gridResults[j]];
      const en = world.store(Enemy).tryGet(e);
      if (!en) continue;
      hits.push(ctx.player, ARCHETYPES[en.unit].contactDps * step, HitKind.contact);
    }
  },
};
