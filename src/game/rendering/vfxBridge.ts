import type { GameContext } from '@/game/core/GameContext';

/** Screen-space feedback driven by game events, read by PostFX every frame. */
export const vfxBridge = {
  /** 0..1, spikes on player hits and decays in PostFX. */
  hitPulse: 0,
};

const HIT_MIN = 0.05; // every hit is visible
const HIT_SCALE = 25; // + proportional to damage / maxHp

/** Subscribes VFX triggers for one run. Returns a detach function. */
export function attachVfx(ctx: GameContext): () => void {
  vfxBridge.hitPulse = 0;
  return ctx.bus.on('player:damaged', (e) => {
    const maxHp = ctx.stats.maxHp || 1;
    vfxBridge.hitPulse = Math.min(1, vfxBridge.hitPulse + HIT_MIN + (e.amount / maxHp) * HIT_SCALE);
  });
}
