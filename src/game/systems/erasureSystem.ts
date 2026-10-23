import type { System } from '@/game/ecs/System';
import { Erasing } from '@/game/ecs/components';

/** Advances erasure dissolves and removes the entity when the vanish stage ends. */
export const erasureSystem: System = {
  name: 'erasure',
  phase: 'destruction',
  update(ctx, dt) {
    const { world, config } = ctx;
    const total = config.erasure.freeze + config.erasure.flatten + config.erasure.vanish;
    const store = world.store(Erasing);
    const step = dt * ctx.time.timeScale;
    for (let i = 0; i < store.size; i++) {
      const er = store.data[i];
      er.t += step;
      if (er.t >= total) world.destroy(store.entities[i]);
    }
  },
};
