import type { GameConfig } from '@/game/config';
import type { Rng } from '@/game/core/Rng';
import { UPGRADES, UPGRADES_BY_ID } from './defs';
import { resetStats, type PlayerStats } from './stats';
import type { Rarity, UpgradeDef } from './types';

/** Run progression state (XP, level, owned buffs, picker bookkeeping). */
export interface Progress {
  xp: number;
  level: number;
  owned: Map<string, number>;
  rerolls: number;
  /** Consecutive offers that contained only Commons (pity timer). */
  commonStreak: number;
  awaitingChoice: boolean;
  choices: string[];
  erasures: number;
  kills: number;
}

export function createProgress(config: GameConfig): Progress {
  return {
    xp: 0,
    level: 1,
    owned: new Map(),
    rerolls: config.upgrades.rerollsAtStart,
    commonStreak: 0,
    awaitingChoice: false,
    choices: [],
    erasures: 0,
    kills: 0,
  };
}

export function xpToNext(level: number, config: GameConfig): number {
  return Math.round(config.progression.xpBase * Math.pow(level, config.progression.xpExponent));
}

/** Recomputes stats from scratch: base config, then every owned buff (order-independent). */
export function computeStats(stats: PlayerStats, owned: ReadonlyMap<string, number>, config: GameConfig): void {
  resetStats(stats, config);
  for (const [id, stacks] of owned) UPGRADES_BY_ID.get(id)?.apply(stats, stacks, config);
}

function available(def: UpgradeDef, owned: ReadonlyMap<string, number>): boolean {
  const stacks = owned.get(def.id) ?? 0;
  if (stacks >= def.maxStacks) return false;
  if (def.stacking === 'unique' && stacks > 0) return false;
  return (def.requires ?? []).every((r) => (owned.get(r.id) ?? 0) >= r.minStacks);
}

export function rarityWeight(rarity: Rarity, config: GameConfig, cycle: number): number {
  const base = config.upgrades.rarityWeights;
  const shift = config.cycle.rarityShift * cycle;
  if (rarity === 'common') return Math.max(10, base.common - shift);
  return base[rarity] + shift / 3;
}

/**
 * Picks up to `choicesPerLevel` distinct buffs weighted by rarity. If the pity counter is due,
 * guarantees one Rare+ when any is available. Mutates `progress.commonStreak`.
 */
export function rollChoices(progress: Progress, rng: Rng, config: GameConfig, cycle: number): string[] {
  const pool = UPGRADES.filter((u) => available(u, progress.owned));
  const picks: string[] = [];
  const pityDue = progress.commonStreak >= config.upgrades.pityAfter;
  if (pityDue) {
    const rare = pool.filter((u) => u.rarity !== 'common');
    if (rare.length > 0) {
      const pick = weightedPick(rare, rng, config, cycle);
      picks.push(pick.id);
      pool.splice(pool.indexOf(pick), 1);
    }
  }
  while (picks.length < config.upgrades.choicesPerLevel && pool.length > 0) {
    const pick = weightedPick(pool, rng, config, cycle);
    picks.push(pick.id);
    pool.splice(pool.indexOf(pick), 1);
  }
  const allCommon = picks.every((id) => UPGRADES_BY_ID.get(id)?.rarity === 'common');
  progress.commonStreak = allCommon ? progress.commonStreak + 1 : 0;
  return picks;
}

function weightedPick(pool: readonly UpgradeDef[], rng: Rng, config: GameConfig, cycle: number): UpgradeDef {
  let total = 0;
  for (const u of pool) total += rarityWeight(u.rarity, config, cycle);
  let r = rng.next() * total;
  for (const u of pool) {
    r -= rarityWeight(u.rarity, config, cycle);
    if (r < 0) return u;
  }
  return pool[pool.length - 1];
}
