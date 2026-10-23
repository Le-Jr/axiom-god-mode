import type { GameContext } from '@/game/core/GameContext';

export const SYSTEM_PHASES = [
  'input',
  'director',
  'ai',
  'player',
  'projectiles',
  'collision',
  'damage',
  'destruction',
  'progression',
  'cleanup',
] as const;

export type SystemPhase = (typeof SYSTEM_PHASES)[number];

export interface System {
  readonly name: string;
  readonly phase: SystemPhase;
  init?(ctx: GameContext): void;
  /** `dt` is the fixed step; multiply by `ctx.time.timeScale` for scaled time. */
  update(ctx: GameContext, dt: number): void;
  dispose?(ctx: GameContext): void;
}

/** Stable sort by phase; registration order is kept inside a phase. */
export function orderSystems(systems: readonly System[]): System[] {
  return systems
    .map((s, i) => ({ s, i }))
    .sort((a, b) => SYSTEM_PHASES.indexOf(a.s.phase) - SYSTEM_PHASES.indexOf(b.s.phase) || a.i - b.i)
    .map(({ s }) => s);
}
