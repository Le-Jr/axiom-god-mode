import type { GameConfig } from '@/game/config';
import type { PlayerStats } from './stats';

export type Rarity = 'common' | 'rare' | 'epic' | 'axiom';
export type Stacking = 'additive' | 'multiplicative' | 'unique' | 'levels';

export interface UpgradeDef {
  id: string;
  name: string;
  rarity: Rarity;
  stacking: Stacking;
  maxStacks: number;
  tags: readonly string[];
  requires?: readonly { id: string; minStacks: number }[];
  /** Player-facing effect of taking the stack that brings the total to `nextStacks`. */
  description(nextStacks: number): string;
  /** Pure and order-independent: called on fresh base stats with the owned stack count. */
  apply(stats: PlayerStats, stacks: number, config: GameConfig): void;
}

export function defineUpgrade(def: UpgradeDef): UpgradeDef {
  return def;
}
