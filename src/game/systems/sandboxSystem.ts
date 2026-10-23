import type { GameContext } from '@/game/core/GameContext';
import type { System } from '@/game/ecs/System';
import { Erasing, Target, Transform } from '@/game/ecs/components';
import { spawnDummy } from '@/game/entities/dummy';

let respawnTimer = 0;

function spawnAround(ctx: GameContext): void {
  const { config, rng, world } = ctx;
  let cx = 0;
  let cz = 0;
  if (ctx.player >= 0 && world.isAlive(ctx.player)) {
    const t = world.get(ctx.player, Transform);
    cx = t.x;
    cz = t.z;
  }
  const a = rng.range(0, Math.PI * 2);
  const d = rng.range(config.sandbox.minDistance, config.sandbox.maxDistance);
  spawnDummy(ctx, cx + Math.cos(a) * d, cz + Math.sin(a) * d);
}

/** Phase 2 stand-in for the WaveDirector: keeps `dummyCount` test dummies around the player. */
export const sandboxSystem: System = {
  name: 'sandbox',
  phase: 'director',
  init(ctx) {
    respawnTimer = 0;
    if (!ctx.config.sandbox.enabled) return;
    for (let i = 0; i < ctx.config.sandbox.dummyCount; i++) spawnAround(ctx);
  },
  update(ctx, dt) {
    const { config, world } = ctx;
    if (!config.sandbox.enabled) return;
    const alive = world.store(Target).size - world.store(Erasing).size;
    if (alive >= config.sandbox.dummyCount) {
      respawnTimer = 0;
      return;
    }
    respawnTimer += dt * ctx.time.timeScale;
    if (respawnTimer >= config.sandbox.respawnInterval) {
      respawnTimer = 0;
      spawnAround(ctx);
    }
  },
};
