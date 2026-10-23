import { damp } from '@/game/core/math';
import type { System } from '@/game/ecs/System';
import { Player, Transform, Velocity } from '@/game/ecs/components';

/** WASD hover movement (camera looks toward -Z, so "up" is -Z) and aim direction. */
export const playerMovementSystem: System = {
  name: 'playerMovement',
  phase: 'player',
  update(ctx, dt) {
    const { world, input, config } = ctx;
    const e = ctx.player;
    if (e < 0 || !world.isAlive(e)) return;
    const step = dt * ctx.time.timeScale;
    const t = world.get(e, Transform);
    const v = world.get(e, Velocity);
    const p = world.get(e, Player);

    let ix = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let iz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const len = Math.hypot(ix, iz);
    if (len > 0) {
      ix /= len;
      iz /= len;
    }
    const k = damp(config.player.moveResponsiveness, step);
    const speed = ctx.stats.moveSpeed;
    v.vx += (ix * speed - v.vx) * k;
    v.vz += (iz * speed - v.vz) * k;
    t.x += v.vx * step;
    t.z += v.vz * step;

    if (input.hasAim) {
      const ax = input.aimX - t.x;
      const az = input.aimZ - t.z;
      const d = Math.hypot(ax, az);
      if (d > config.player.minAimDistance) {
        p.aimDirX = ax / d;
        p.aimDirZ = az / d;
      }
    }
    t.rot = Math.atan2(p.aimDirZ, p.aimDirX);

    ctx.view.targetX = t.x;
    ctx.view.targetZ = t.z;
  },
};
