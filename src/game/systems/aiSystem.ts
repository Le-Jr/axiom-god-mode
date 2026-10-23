import type { GameEvents } from '@/game/core/events';
import { damp } from '@/game/core/math';
import type { System } from '@/game/ecs/System';
import type { Query } from '@/game/ecs/World';
import { Enemy, Erasing, Transform, Velocity } from '@/game/ecs/components';
import { ARCHETYPE_BY_ID, ARCHETYPES } from '@/game/factions';
import { EMITTERS, stepEmitter } from './patterns';
import type { EmitterState } from './patterns/types';

const _fired: GameEvents['projectile:fired'] = { factionId: '', kind: '', x: 0, z: 0 };
const _deathState: EmitterState = { timer: 0, burst: 0, angle: 0 };
let enemies: Query;

/** Enemy steering (chase / keep distance + strafe), crowd separation, despawn and firing. */
export const aiSystem: System = {
  name: 'ai',
  phase: 'ai',
  init(ctx) {
    enemies = ctx.world.query(Enemy, Transform);
    // Death patterns fire only on *kills*: erased units leave nothing behind, not even bullets.
    ctx.bus.on('enemy:killed', (e) => {
      const a = ARCHETYPE_BY_ID.get(e.archetypeId);
      if (!a?.deathPattern || ctx.flags.stress) return;
      _deathState.angle = ctx.rng.range(0, Math.PI * 2);
      EMITTERS[a.deathPattern.kind](ctx, a.deathPattern, _deathState, e.x, e.z, ctx.view.targetX, ctx.view.targetZ);
    });
  },
  update(ctx, dt) {
    const { world, config, grid, gridResults } = ctx;
    if (ctx.player < 0 || !world.isAlive(ctx.player)) return;
    const step = dt * ctx.time.timeScale;
    const pt = world.get(ctx.player, Transform);
    const px = pt.x;
    const pz = pt.z;
    const ec = config.enemies;
    const despawn2 = ec.despawnDistance * ec.despawnDistance;
    const k = damp(ec.steeringResponsiveness, step);

    const n = enemies.collect();
    for (let i = 0; i < n; i++) {
      const e = enemies.results[i];
      if (world.has(e, Erasing)) continue; // erased units freeze in place
      const en = world.get(e, Enemy);
      const a = ARCHETYPES[en.unit];
      const t = world.get(e, Transform);
      const v = world.get(e, Velocity);

      const dx = px - t.x;
      const dz = pz - t.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > despawn2) {
        world.destroy(e);
        continue;
      }
      const dist = Math.sqrt(d2) || 1e-6;
      const nx = dx / dist;
      const nz = dz / dist;

      let wx = 0;
      let wz = 0;
      if (a.behavior.kind === 'chase') {
        wx = nx;
        wz = nz;
      } else {
        const pd = a.behavior.preferredDistance ?? 8;
        if (dist > pd * 1.15) {
          wx = nx;
          wz = nz;
        } else if (dist < pd * 0.85) {
          wx = -nx;
          wz = -nz;
        } else {
          wx = -nz * en.strafeDir * 0.6;
          wz = nx * en.strafeDir * 0.6;
        }
      }

      // Separation from neighbors (grid is from the previous tick: one tick stale is fine).
      const sepR = ec.separationRadius + a.radius;
      const m = grid.query(t.x, t.z, sepR, gridResults);
      let sx = 0;
      let sz = 0;
      for (let j = 0; j < m; j++) {
        const slot = gridResults[j];
        if (grid.ids[slot] === e) continue;
        const ox = t.x - grid.x[slot];
        const oz = t.z - grid.z[slot];
        const od = Math.hypot(ox, oz) || 1e-6;
        const overlap = 1 - od / (sepR + grid.r[slot]);
        if (overlap <= 0) continue;
        sx += (ox / od) * overlap;
        sz += (oz / od) * overlap;
      }

      const tx = wx * a.speed + sx * ec.separationStrength;
      const tz = wz * a.speed + sz * ec.separationStrength;
      v.vx += (tx - v.vx) * k;
      v.vz += (tz - v.vz) * k;
      t.x += v.vx * step;
      t.z += v.vz * step;
      t.rot = Math.atan2(nz, nx);

      if (ctx.flags.stress || dist > ec.fireRange) continue;
      for (let p = 0; p < a.patterns.length; p++) {
        if (stepEmitter(ctx, a.patterns[p], en.emitters[p], step, t.x, t.z, px, pz)) {
          _fired.factionId = a.factionId;
          _fired.kind = a.patterns[p].bulletKind;
          _fired.x = t.x;
          _fired.z = t.z;
          ctx.bus.emit('projectile:fired', _fired);
        }
      }
    }
    ctx.debug.counts.enemies = world.store(Enemy).size;
  },
};
