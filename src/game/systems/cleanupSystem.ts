import type { System } from '@/game/ecs/System';

/** Last phase: applies deferred entity destruction and publishes counts. */
export const cleanupSystem: System = {
  name: 'cleanup',
  phase: 'cleanup',
  update(ctx) {
    ctx.world.flush();
    ctx.debug.counts.entities = ctx.world.aliveCount;
  },
};
