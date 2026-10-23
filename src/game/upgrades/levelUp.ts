import type { GameContext } from '@/game/core/GameContext';
import { rollChoices } from './progress';

/** Rolls the next offer and announces it (`player:levelUp`). Returns false when every buff is maxed. */
export function offerLevelUp(ctx: GameContext): boolean {
  const p = ctx.progress;
  const choices = rollChoices(p, ctx.rng, ctx.config, ctx.cycle);
  if (choices.length === 0) {
    p.awaitingChoice = false;
    p.choices = [];
    return false;
  }
  p.awaitingChoice = true;
  p.choices = choices;
  ctx.bus.emit('player:levelUp', { level: p.level, choices, rerolls: p.rerolls });
  return true;
}
