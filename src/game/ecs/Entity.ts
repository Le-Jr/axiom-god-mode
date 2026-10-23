// Entity = index (low 20 bits) + generation (high 11 bits). Stale handles fail `world.isAlive`.
export type Entity = number;

const INDEX_BITS = 20;
export const MAX_ENTITY_INDEX = (1 << INDEX_BITS) - 1;
const INDEX_MASK = MAX_ENTITY_INDEX;
export const MAX_GENERATION = 0x7ff;

export function makeEntity(index: number, generation: number): Entity {
  return ((generation & MAX_GENERATION) << INDEX_BITS) | index;
}

export function entityIndex(e: Entity): number {
  return e & INDEX_MASK;
}

export function entityGeneration(e: Entity): number {
  return (e >>> INDEX_BITS) & MAX_GENERATION;
}
