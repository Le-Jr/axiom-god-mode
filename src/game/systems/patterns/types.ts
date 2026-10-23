import type { BulletKindId } from '@/game/config';
import type { GameContext } from '@/game/core/GameContext';

export type PatternKind = 'aimed' | 'spread' | 'ring' | 'spiral';
// Later: 'homing' | 'laser' | 'artillery' | 'airstrike' | 'wave' | 'burst' (FACTIONS.md vocabulary)

export interface PatternDef {
  kind: PatternKind;
  bulletKind: BulletKindId;
  speed: number; // u/s
  damage: number; // pre-Cycle
  cooldown: number; // seconds between activations
  count?: number; // bullets per volley (aimed stream / spread / ring)
  arc?: number; // degrees (spread)
  arms?: number; // spiral arms
  angularVel?: number; // deg/s rotation (ring, spiral)
  bursts?: number; // volleys per activation
  burstGap?: number; // seconds between volleys in a burst
  aim?: 'player' | 'random';
  complexity?: { countPerCycle?: number; armsPerCycle?: number; speedPerCycle?: number; maxCount?: number };
}

/** Per-enemy, per-pattern runtime state (plain numbers, pooled with the Enemy component). */
export interface EmitterState {
  timer: number;
  burst: number;
  angle: number; // radians, accumulated rotation for ring/spiral
}

/** Fires one volley from (ox, oz) toward the target (tx, tz). */
export type EmitterFn = (ctx: GameContext, def: PatternDef, state: EmitterState, ox: number, oz: number, tx: number, tz: number) => void;

export const DEG = Math.PI / 180;
