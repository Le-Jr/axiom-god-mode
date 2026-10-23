import { copyInput, rawInput } from '@/game/core/input';
import type { System } from '@/game/ecs/System';
import { Transform } from '@/game/ecs/components';

/** Snapshots raw input for this tick. */
export const inputSystem: System = {
  name: 'input',
  phase: 'input',
  update(ctx) {
    copyInput(rawInput, ctx.input);
  },
};

/** Stores last tick's positions for render interpolation. Runs before anything moves. */
export const historySystem: System = {
  name: 'history',
  phase: 'input',
  update(ctx) {
    const store = ctx.world.store(Transform);
    const data = store.data;
    for (let i = 0; i < store.size; i++) {
      const t = data[i];
      t.prevX = t.x;
      t.prevZ = t.z;
    }
  },
};
