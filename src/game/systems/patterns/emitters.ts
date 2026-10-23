import { fireBullet, scaledCount, scaledSpeed } from './fire';
import { DEG, type EmitterFn, type PatternDef } from './types';

function aimAngle(ctx: Parameters<EmitterFn>[0], def: PatternDef, ox: number, oz: number, tx: number, tz: number): number {
  return def.aim === 'random' ? ctx.rng.range(0, Math.PI * 2) : Math.atan2(tz - oz, tx - ox);
}

/** Time the next rotation step covers: one burst gap inside a burst, else the cooldown. */
function rotationStep(def: PatternDef): number {
  return (def.angularVel ?? 0) * DEG * ((def.bursts ?? 1) > 1 ? (def.burstGap ?? def.cooldown) : def.cooldown);
}

/** A stream of `count` bullets along the aim line, each slightly slower (reads as a dashed line). */
export const aimed: EmitterFn = (ctx, def, _state, ox, oz, tx, tz) => {
  const a = aimAngle(ctx, def, ox, oz, tx, tz);
  const count = scaledCount(ctx, def, def.count ?? 1, def.complexity?.countPerCycle);
  const speed = scaledSpeed(ctx, def);
  for (let i = 0; i < count; i++) {
    if (!fireBullet(ctx, def, ox, oz, a, speed * (1 - 0.08 * i))) return;
  }
};

/** `count` bullets evenly across `arc` degrees, centered on the aim. */
export const spread: EmitterFn = (ctx, def, _state, ox, oz, tx, tz) => {
  const center = aimAngle(ctx, def, ox, oz, tx, tz);
  const count = scaledCount(ctx, def, def.count ?? 5, def.complexity?.countPerCycle);
  const arc = (def.arc ?? 45) * DEG;
  const speed = scaledSpeed(ctx, def);
  const start = count > 1 ? center - arc / 2 : center;
  const step = count > 1 ? arc / (count - 1) : 0;
  for (let i = 0; i < count; i++) {
    if (!fireBullet(ctx, def, ox, oz, start + step * i, speed)) return;
  }
};

/** `count` bullets evenly around the emitter, rotating by `angularVel` over time. */
export const ring: EmitterFn = (ctx, def, state, ox, oz) => {
  const count = scaledCount(ctx, def, def.count ?? 12, def.complexity?.countPerCycle);
  const speed = scaledSpeed(ctx, def);
  const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    if (!fireBullet(ctx, def, ox, oz, state.angle + step * i, speed)) break;
  }
  state.angle += rotationStep(def);
};

/** `arms` bullets per volley, evenly spaced and rotating: chain volleys with short gaps for a spiral. */
export const spiral: EmitterFn = (ctx, def, state, ox, oz) => {
  const arms = scaledCount(ctx, def, def.arms ?? 2, def.complexity?.armsPerCycle);
  const speed = scaledSpeed(ctx, def);
  const step = (Math.PI * 2) / arms;
  for (let i = 0; i < arms; i++) {
    if (!fireBullet(ctx, def, ox, oz, state.angle + step * i, speed)) break;
  }
  state.angle += rotationStep(def);
};
