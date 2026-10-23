// Template: add to src/game/upgrades/defs/index.ts and append to UPGRADES.
import { defineUpgrade } from '../types';

const RAYS_BY_LEVEL = [0, 1, 2, 3, 4] as const; // index = stacks

export const beamMultiray = defineUpgrade({
  id: 'beam_multiray',
  name: 'Prism Split',
  rarity: 'epic',
  stacking: 'levels',
  maxStacks: 4,
  tags: ['beam'],
  description: (next) => `Beam splits into ${RAYS_BY_LEVEL[next] + 1} rays`,
  // Pure + order-independent: called on fresh base stats with the owned stack count.
  apply: (stats, stacks) => {
    stats.beamExtraRays = RAYS_BY_LEVEL[stacks]; // ← add `beamExtraRays` to PlayerStats/resetStats first
  },
});
