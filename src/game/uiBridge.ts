import type { GameContext } from '@/game/core/GameContext';
import { runtime } from '@/game/core/runtime';
import { UPGRADES_BY_ID } from '@/game/upgrades/defs';
import { useGameStore, type UpgradeChoiceView } from '@/store/useGameStore';
import { useRecordsStore } from '@/store/useRecordsStore';

/** Game → UI: forwards low-frequency events into zustand. Returns a detach function. */
export function attachUiBridge(ctx: GameContext): () => void {
  const offs = [
    ctx.bus.on('player:levelUp', ({ level, choices, rerolls }) => {
      const views: UpgradeChoiceView[] = [];
      for (const id of choices) {
        const def = UPGRADES_BY_ID.get(id);
        if (!def) continue;
        const owned = ctx.progress.owned.get(id) ?? 0;
        views.push({ id, name: def.name, rarity: def.rarity, description: def.description(owned + 1), owned, maxStacks: def.maxStacks });
      }
      useGameStore.getState().openLevelUp(level, views, rerolls);
    }),
    ctx.bus.on('player:died', (stats) => {
      const copy = { ...stats };
      useRecordsStore.getState().submitRun(copy);
      useGameStore.getState().showGameOver(copy);
    }),
  ];
  return () => {
    for (const off of offs) off();
  };
}

// UI → game commands. Components call these instead of touching the bus directly.

export function chooseUpgrade(upgradeId: string): void {
  const ctx = runtime.ctx;
  if (!ctx) return;
  ctx.bus.emit('upgrade:chosen', { upgradeId });
  if (!ctx.progress.awaitingChoice) useGameStore.getState().closeLevelUp();
}

export function rerollUpgrades(): void {
  runtime.ctx?.bus.emit('upgrade:reroll', {});
}

export function restartRun(): void {
  useGameStore.getState().restart();
}
