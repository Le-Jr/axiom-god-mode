import { HitKind } from '@/game/core/HitBuffer';
import type { System } from '@/game/ecs/System';
import { Enemy, Transform } from '@/game/ecs/components';
import { satelliteAngle } from '@/game/upgrades/satellites';

/** Atomic Orbit buff: orbiting atoms damage enemies on contact and block enemy bullets. */
export const satelliteSystem: System = {
  name: 'satellites',
  phase: 'collision', // before `collision`, so blocked bullets never reach the player
  update(ctx, dt) {
    const n = ctx.stats.satellites;
    if (n <= 0 || ctx.player < 0 || !ctx.world.isAlive(ctx.player)) return;
    const { world, grid, gridResults, projectiles: pool } = ctx;
    const cfg = ctx.config.upgrades.satellite;
    const step = dt * ctx.time.timeScale;
    const pt = world.get(ctx.player, Transform);

    for (let s = 0; s < n; s++) {
      const a = satelliteAngle(ctx, s, n, ctx.time.simTime);
      const sx = pt.x + Math.cos(a) * cfg.orbitRadius;
      const sz = pt.z + Math.sin(a) * cfg.orbitRadius;

      const m = grid.query(sx, sz, cfg.radius, gridResults);
      for (let j = 0; j < m; j++) {
        const e = grid.ids[gridResults[j]];
        if (world.isAlive(e) && world.has(e, Enemy)) ctx.hits.push(e, cfg.contactDps * step, HitKind.satellite);
      }

      for (let i = pool.count - 1; i >= 0; i--) {
        const dx = pool.x[i] - sx;
        const dz = pool.z[i] - sz;
        const rr = pool.radius[i] + cfg.radius;
        if (dx * dx + dz * dz <= rr * rr) pool.despawn(i);
      }
    }
  },
};
