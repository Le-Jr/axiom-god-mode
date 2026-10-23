import type { PatternDef } from '@/game/systems/patterns/types';

export const MESH_KINDS = ['capsule', 'box', 'wedge'] as const;
export type MeshKind = (typeof MESH_KINDS)[number];

export type BehaviorKind = 'chase' | 'keepDistance';

export interface UnitDef {
  id: string; // stable snake_case
  name: string;
  hp: number; // pre-Cycle
  speed: number; // u/s
  radius: number; // collision
  xp: number;
  budgetCost: number;
  contactDps: number; // damage per second while touching the player
  behavior: { kind: BehaviorKind; preferredDistance?: number };
  visual: { mesh: MeshKind; scale: number; tint?: string };
  patterns: readonly PatternDef[];
  /** Fired when *killed* (aura). Erased units vanish without a death pattern. */
  deathPattern?: PatternDef;
}

export interface FactionDef {
  id: string;
  name: string;
  tint: string;
  unlock: { time: number; level: number }; // seconds, player level (both required)
  spawnWeight: number;
  units: readonly UnitDef[];
}

export function defineFaction(def: FactionDef): FactionDef {
  return def;
}
