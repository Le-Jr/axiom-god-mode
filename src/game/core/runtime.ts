import { spawnPlayer } from '@/game/entities/player';
import { SYSTEMS } from '@/game/systems';
import { createGameContext, type GameContext } from './GameContext';
import { GameLoop } from './GameLoop';
import { randomSeed } from './Rng';

/**
 * The single live run. Render pools read `runtime.ctx` inside `useFrame`; UI reads the bridges.
 * Mutable module state on purpose: it never triggers React renders.
 */
export const runtime: { ctx: GameContext | null; loop: GameLoop | null } = {
  ctx: null,
  loop: null,
};

export function startRun(seed: number = randomSeed()): GameLoop {
  endRun();
  const ctx = createGameContext(seed);
  spawnPlayer(ctx);
  const loop = new GameLoop(ctx, SYSTEMS);
  loop.init();
  runtime.ctx = ctx;
  runtime.loop = loop;
  ctx.bus.emit('run:start', { seed });
  return loop;
}

export function endRun(): void {
  runtime.loop?.dispose();
  runtime.loop = null;
  runtime.ctx = null;
}
