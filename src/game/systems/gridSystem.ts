import type { System } from '@/game/ecs/System';
import { Erasing, Target, Transform } from '@/game/ecs/components';

/**
 * Rebuilds the spatial hash of targetable entities. Runs first in the player phase (after AI
 * moved enemies), so the aura, beam, satellites and collisions all see this tick's positions.
 */
export const gridSystem: System = {
  name: 'grid',
  phase: 'player',
  update(ctx) {
    const { world, grid } = ctx;
    grid.clear();
    const targets = world.store(Target);
    for (let i = 0; i < targets.size; i++) {
      const e = targets.entities[i];
      if (world.has(e, Erasing)) continue;
      const t = world.get(e, Transform);
      grid.insert(e, t.x, t.z, targets.data[i].radius);
    }
  },
};
