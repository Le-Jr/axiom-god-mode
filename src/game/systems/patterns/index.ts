import { aimed, ring, spiral, spread } from './emitters';
import type { EmitterFn, EmitterState, PatternDef, PatternKind } from './types';
import type { GameContext } from '@/game/core/GameContext';

export const EMITTERS: Record<PatternKind, EmitterFn> = { aimed, spread, ring, spiral };

/**
 * Advances one pattern's timer and fires volleys when due (cooldown → `bursts` volleys
 * `burstGap` apart → cooldown). Returns true if it fired this tick.
 */
export function stepEmitter(
  ctx: GameContext,
  def: PatternDef,
  state: EmitterState,
  dt: number,
  ox: number,
  oz: number,
  tx: number,
  tz: number,
): boolean {
  state.timer -= dt;
  if (state.timer > 0) return false;
  EMITTERS[def.kind](ctx, def, state, ox, oz, tx, tz);
  state.burst++;
  if (state.burst < (def.bursts ?? 1)) {
    state.timer += def.burstGap ?? 0.1;
  } else {
    state.burst = 0;
    state.timer += def.cooldown;
  }
  if (state.timer < 0) state.timer = 0; // never fire multiple volleys in one tick
  return true;
}

export type { EmitterFn, EmitterState, PatternDef, PatternKind } from './types';
