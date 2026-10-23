import type { System } from '@/game/ecs/System';
import { Transform } from '@/game/ecs/components';

/** Integrates enemy bullets, ages them out and culls those far from the player. */
export const projectileSystem: System = {
  name: 'projectiles',
  phase: 'projectiles',
  update(ctx, dt) {
    const pool = ctx.projectiles;
    const step = dt * ctx.time.timeScale;
    let px = ctx.view.targetX;
    let pz = ctx.view.targetZ;
    if (ctx.player >= 0 && ctx.world.isAlive(ctx.player)) {
      const t = ctx.world.get(ctx.player, Transform);
      px = t.x;
      pz = t.z;
    }
    const cull = ctx.config.projectiles.cullDistance;
    const cull2 = cull * cull;
    for (let i = pool.count - 1; i >= 0; i--) {
      pool.prevX[i] = pool.x[i];
      pool.prevZ[i] = pool.z[i];
      pool.x[i] += pool.vx[i] * step;
      pool.z[i] += pool.vz[i] * step;
      pool.age[i] += step;
      const dx = pool.x[i] - px;
      const dz = pool.z[i] - pz;
      if (pool.age[i] >= pool.life[i] || dx * dx + dz * dz > cull2) pool.despawn(i);
    }
    ctx.debug.counts.bullets = pool.count;
  },
};
