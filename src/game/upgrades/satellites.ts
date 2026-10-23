import type { GameContext } from '@/game/core/GameContext';

/** Angle of satellite `i` of `n` at sim time `t` (shared by the satellite system and renderer). */
export function satelliteAngle(ctx: GameContext, i: number, n: number, simTime: number): number {
  return simTime * ctx.config.upgrades.satellite.angularSpeed + (i * Math.PI * 2) / n;
}
