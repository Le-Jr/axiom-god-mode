// Template: copy to src/game/upgrades/defs/<id>.ts and register in upgrades/defs/index.ts
import { defineUpgrade } from '../defineUpgrade';

const RAYS_BY_LEVEL = [0, 1, 2, 3, 4] as const; // index = stacks

export default defineUpgrade({
  id: 'beam_multiray',
  name: 'Prism Split',
  icon: '/assets/textures/upgrades/beam_multiray.png',
  rarity: 'epic',
  stacking: 'levels',
  maxStacks: 4,
  tags: ['beam'],
  requires: [],
  description: (stacks) => `Beam splits into ${RAYS_BY_LEVEL[stacks + 1] + 1} rays`,
  apply: (stats, stacks) => {
    stats.beam.extraRays = RAYS_BY_LEVEL[stacks];
    stats.beam.raySpreadDeg = 12;
  },
});
