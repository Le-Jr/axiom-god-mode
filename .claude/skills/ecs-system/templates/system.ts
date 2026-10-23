// Template: copy to src/game/systems/<name>System.ts and register in systems/index.ts
import type { System } from '@/game/ecs/System';
import type { GameContext } from '@/game/core/GameContext';
import type { GameEvents } from '@/game/core/events';
import { Transform, Health } from '@/game/ecs/components';

// Reused event payload: listeners must copy, never store
const _damaged: GameEvents['enemy:damaged'] = { entity: 0, amount: 0 };

export const regenSystem: System = {
  name: 'regen',
  phase: 'damage',

  init(ctx: GameContext) {
    // subscribe here; keep handler refs to unsubscribe in dispose
  },

  update(ctx: GameContext, dt: number) {
    const step = dt * ctx.time.timeScale;
    const rate = ctx.config.enemies.regenPerSecond;
    // query() iterates without allocating
    for (const e of ctx.world.query(Health, Transform)) {
      const h = ctx.world.get(e, Health);
      if (h.hp < h.max) {
        h.hp = Math.min(h.max, h.hp + rate * step);
      }
    }
    void _damaged;
  },

  dispose(ctx: GameContext) {
    // ctx.bus.off(...)
  },
};
