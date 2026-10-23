// Template: copy to src/game/systems/patterns/<kind>.ts and register in patterns/index.ts
import type { EmitterFn } from './types';

const DEG = Math.PI / 180;

/** Ring: `count` bullets evenly around the emitter, rotating by `angularVel` each volley. */
export const ring: EmitterFn = (ctx, def, state, ox, oz) => {
  const pool = ctx.projectiles;
  const cfg = ctx.config.performance;
  const c = ctx.cycle;
  const cx = def.complexity;
  const count = Math.min(
    (def.count ?? 12) + (cx?.countPerCycle ?? 0) * c,
    cx?.maxCount ?? 64,
  );
  const speed = def.speed + (cx?.speedPerCycle ?? 0) * c;
  const step = (Math.PI * 2) / count;
  const offset = state.angle;

  for (let i = 0; i < count; i++) {
    if (pool.activeCount >= cfg.bulletSoftCap) { ctx.debug.droppedBullets++; break; }
    const a = offset + i * step;
    pool.spawn(def.bulletKind, ox, oz, Math.cos(a) * speed, Math.sin(a) * speed, def.damage);
  }
  state.angle += (def.angularVel ?? 0) * DEG * def.cooldown;
};
