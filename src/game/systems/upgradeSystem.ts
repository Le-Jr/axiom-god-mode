import type { GameContext } from '@/game/core/GameContext';
import type { System } from '@/game/ecs/System';
import { Health, Player } from '@/game/ecs/components';
import { computeStats } from '@/game/upgrades/progress';
import { offerLevelUp } from '@/game/upgrades/levelUp';

/** Recomputes derived stats and pushes them into the player's components. */
export function applyStats(ctx: GameContext): void {
  const prevMaxHp = ctx.stats.maxHp;
  const prevMaxEnergy = ctx.stats.beamMaxEnergy;
  computeStats(ctx.stats, ctx.progress.owned, ctx.config);
  if (ctx.player < 0 || !ctx.world.isAlive(ctx.player)) return;
  const h = ctx.world.get(ctx.player, Health);
  const p = ctx.world.get(ctx.player, Player);
  h.max = ctx.stats.maxHp;
  if (ctx.stats.maxHp > prevMaxHp) h.hp = Math.min(h.max, h.hp + (ctx.stats.maxHp - prevMaxHp)); // Densified Form heals
  p.maxEnergy = ctx.stats.beamMaxEnergy;
  if (ctx.stats.beamMaxEnergy > prevMaxEnergy) p.energy += ctx.stats.beamMaxEnergy - prevMaxEnergy;
  p.energy = Math.min(p.energy, p.maxEnergy);
  p.auraRadius = ctx.stats.auraRadius;
}

/**
 * Applies the chosen buff (`upgrade:chosen`) and handles rerolls (`upgrade:reroll`). Both arrive
 * from the UI while the sim is paused on the level-up picker.
 */
export const upgradeSystem: System = {
  name: 'upgrades',
  phase: 'progression',
  init(ctx) {
    applyStats(ctx);
    ctx.bus.on('upgrade:chosen', ({ upgradeId }) => {
      const p = ctx.progress;
      if (!p.awaitingChoice || !p.choices.includes(upgradeId)) return;
      p.owned.set(upgradeId, (p.owned.get(upgradeId) ?? 0) + 1);
      p.awaitingChoice = false;
      p.choices = [];
      applyStats(ctx);
    });
    ctx.bus.on('upgrade:reroll', () => {
      const p = ctx.progress;
      if (!p.awaitingChoice || p.rerolls <= 0) return;
      p.rerolls--;
      offerLevelUp(ctx);
    });
  },
  update() {
    // Event-driven; nothing per tick.
  },
};
