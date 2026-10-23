// Template: add to src/game/systems/patterns/emitters.ts, extend PatternKind, register in EMITTERS.
import { fireBullet, scaledCount, scaledSpeed } from './fire';
import { DEG, type EmitterFn } from './types';

/** Ring: `count` bullets evenly around the emitter, rotating by `angularVel` (deg/s) per cooldown. */
export const ring: EmitterFn = (ctx, def, state, ox, oz /*, tx, tz: target (unused for rings) */) => {
  const count = scaledCount(ctx, def, def.count ?? 12, def.complexity?.countPerCycle);
  const speed = scaledSpeed(ctx, def);
  const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    if (!fireBullet(ctx, def, ox, oz, state.angle + step * i, speed)) break; // soft cap reached
  }
  state.angle += (def.angularVel ?? 0) * DEG * def.cooldown;
};
