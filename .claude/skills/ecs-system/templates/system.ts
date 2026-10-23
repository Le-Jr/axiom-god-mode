// Template: copy to src/game/systems/<name>System.ts and register in systems/index.ts
import type { GameContext } from '@/game/core/GameContext';
import type { GameEvents } from '@/game/core/events';
import type { Query } from '@/game/ecs/World';
import type { System } from '@/game/ecs/System';
import { Health, Transform } from '@/game/ecs/components';

// Reused event payload: listeners must copy, never store
const _damaged: GameEvents['enemy:damaged'] = { entity: 0, amount: 0 };

let healthy: Query;

export const regenSystem: System = {
  name: 'regen',
  phase: 'damage',

  init(ctx: GameContext) {
    healthy = ctx.world.query(Health, Transform); // create queries once
    // subscribe here; keep handler refs (or the returned disposer) to unsubscribe in dispose
  },

  update(ctx: GameContext, dt: number) {
    const step = dt * ctx.time.timeScale;
    const rate = 5; // ← must come from ctx.config.<area> (balance-tuning skill)
    const n = healthy.collect();
    for (let i = 0; i < n; i++) {
      const h = ctx.world.get(healthy.results[i], Health);
      if (h.hp < h.max) h.hp = Math.min(h.max, h.hp + rate * step);
    }
    void _damaged; // e.g. _damaged.entity = e; _damaged.amount = x; ctx.bus.emit('enemy:damaged', _damaged);
  },

  dispose() {
    // unsubscribe listeners
  },
};
