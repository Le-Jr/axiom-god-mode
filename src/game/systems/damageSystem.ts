import type { GameContext } from '@/game/core/GameContext';
import type { GameEvents } from '@/game/core/events';
import { HitKind } from '@/game/core/HitBuffer';
import type { System } from '@/game/ecs/System';
import { Erasing, Health, Target, Transform } from '@/game/ecs/components';
import { FACTIONS } from '@/game/factions';

const HIT_FLASH = 0.08; // seconds

const _erased: GameEvents['enemy:erased'] = { entity: 0, archetypeId: '', x: 0, z: 0, xp: 0 };
const _killed: GameEvents['enemy:killed'] = { entity: 0, archetypeId: '', x: 0, z: 0, xp: 0 };
const _damaged: GameEvents['player:damaged'] = { amount: 0, hpRatio: 1 };

export function runStats(ctx: GameContext): GameEvents['player:died'] {
  const p = ctx.progress;
  return {
    timeSurvived: ctx.time.simTime,
    level: p.level,
    erasures: p.erasures,
    kills: p.kills,
    cycle: ctx.cycle,
    tierId: FACTIONS[ctx.tier]?.id ?? '',
  };
}

function damagePlayer(ctx: GameContext, amount: number): void {
  if (ctx.flags.god || ctx.flags.stress) return;
  const h = ctx.world.get(ctx.player, Health);
  if (h.hp <= 0 || h.iframes > 0) return;
  h.hp -= amount;
  const cfg = ctx.config.player;
  if (amount >= cfg.heavyHitRatio * h.max) h.iframes = cfg.heavyHitIFrames;
  _damaged.amount = amount;
  _damaged.hpRatio = Math.max(0, h.hp) / h.max;
  ctx.bus.emit('player:damaged', _damaged);
  if (h.hp <= 0) {
    h.hp = 0;
    ctx.bus.emit('player:died', runStats(ctx)); // once per run: hp <= 0 short-circuits above
  }
}

/**
 * Drains the hit buffer. Beam kills *erase* (dissolve, no debris); other kills destroy.
 * Player hits honor i-frames (granted by heavy hits) and the god/stress flags.
 */
export const damageSystem: System = {
  name: 'damage',
  phase: 'damage',
  update(ctx, dt) {
    const { world, hits, bus } = ctx;
    const step = dt * ctx.time.timeScale;

    // Tick down flash timers / i-frames first, so a hit this tick shows for the full duration.
    const targets = world.store(Target);
    for (let i = 0; i < targets.size; i++) {
      const tg = targets.data[i];
      if (tg.flash > 0) tg.flash = Math.max(0, tg.flash - step);
    }
    const playerAlive = ctx.player >= 0 && world.isAlive(ctx.player);
    if (playerAlive) {
      const ph = world.get(ctx.player, Health);
      if (ph.iframes > 0) ph.iframes = Math.max(0, ph.iframes - step);
    }

    for (let i = 0; i < hits.count; i++) {
      const e = hits.target[i];
      if (e === ctx.player) {
        if (playerAlive) damagePlayer(ctx, hits.amount[i]);
        continue;
      }
      if (!world.isAlive(e) || world.has(e, Erasing)) continue;
      const h = world.store(Health).tryGet(e);
      if (!h || h.hp <= 0 || h.iframes > 0) continue;
      h.hp -= hits.amount[i];
      const target = targets.tryGet(e);
      if (target) target.flash = HIT_FLASH;
      if (h.hp > 0 || !target) continue;

      const pos = world.get(e, Transform);
      if (hits.kind[i] === HitKind.beam) {
        world.add(e, Erasing);
        _erased.entity = e;
        _erased.archetypeId = target.archetypeId;
        _erased.x = pos.x;
        _erased.z = pos.z;
        _erased.xp = target.xp;
        bus.emit('enemy:erased', _erased);
      } else {
        _killed.entity = e;
        _killed.archetypeId = target.archetypeId;
        _killed.x = pos.x;
        _killed.z = pos.z;
        _killed.xp = target.xp;
        bus.emit('enemy:killed', _killed);
        world.destroy(e);
      }
    }
    hits.clear();
  },
};
