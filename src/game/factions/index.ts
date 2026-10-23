import police from './police';
import swat from './swat';
import { MESH_KINDS, type FactionDef, type UnitDef } from './types';

/** Tier ladder in order (FACTIONS.md). Never reorder without an ADR. */
export const FACTIONS: readonly FactionDef[] = [police, swat];

export interface Archetype extends UnitDef {
  index: number;
  factionId: string;
  tier: number;
  meshIndex: number;
  tintHex: string;
}

export const ARCHETYPES: readonly Archetype[] = FACTIONS.flatMap((f, tier) =>
  f.units.map((u) => ({ ...u, factionId: f.id, tier, meshIndex: MESH_KINDS.indexOf(u.visual.mesh), tintHex: u.visual.tint ?? f.tint })),
).map((a, index) => ({ ...a, index }));

export const ARCHETYPE_BY_ID: ReadonlyMap<string, Archetype> = new Map(ARCHETYPES.map((a) => [a.id, a]));

export const MAX_PATTERNS_PER_UNIT = 3;

for (const a of ARCHETYPES) {
  if (a.patterns.length > MAX_PATTERNS_PER_UNIT) throw new Error(`${a.id}: more than ${MAX_PATTERNS_PER_UNIT} patterns`);
}

export { MESH_KINDS } from './types';
export type { FactionDef, UnitDef, MeshKind } from './types';
