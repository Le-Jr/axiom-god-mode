import { config } from '@/game/config';
import type { GameContext } from '@/game/core/GameContext';
import { Health, Player, Transform, type PlayerData } from '@/game/ecs/components';

/** Interpolated player pose for rendering, refreshed once per frame by `readPlayerView`. */
export const playerView = {
  valid: false,
  x: 0,
  z: 0,
  rot: 0,
  hpRatio: 1,
  player: null as PlayerData | null,
};

/** Fills `playerView` from the sim. Call at the top of each player-related useFrame (cheap). */
export function readPlayerView(ctx: GameContext | null): typeof playerView {
  const v = playerView;
  if (!ctx || ctx.player < 0 || !ctx.world.isAlive(ctx.player)) {
    v.valid = false;
    v.player = null;
    return v;
  }
  const { world, time } = ctx;
  const t = world.get(ctx.player, Transform);
  const h = world.get(ctx.player, Health);
  const a = time.alpha;
  v.valid = true;
  v.x = t.prevX + (t.x - t.prevX) * a;
  v.z = t.prevZ + (t.z - t.prevZ) * a;
  v.rot = t.rot;
  v.hpRatio = h.max > 0 ? h.hp / h.max : 0;
  v.player = world.get(ctx.player, Player);
  return v;
}

/** 0 above the low-HP threshold, rising to 1 at 0 HP. */
export function instabilityFor(hpRatio: number): number {
  const th = config.player.lowHpThreshold;
  return hpRatio >= th ? 0 : (th - hpRatio) / th;
}
