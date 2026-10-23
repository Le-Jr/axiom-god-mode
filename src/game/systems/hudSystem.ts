import type { GameEvents } from '@/game/core/events';
import type { System } from '@/game/ecs/System';
import { Health, Player, Target } from '@/game/ecs/components';

const _hpRatio: GameEvents['player:lowHp'] = { hpRatio: 1 };

/** Publishes player state to hudBridge (read by the HUD at ~20 Hz) and low-HP transitions. */
export const hudSystem: System = {
  name: 'hud',
  phase: 'progression',
  update(ctx) {
    const { world, hud, config } = ctx;
    hud.runTime = ctx.time.simTime;
    hud.cycle = ctx.cycle;
    ctx.debug.counts.enemies = world.store(Target).size;
    const e = ctx.player;
    if (e < 0 || !world.isAlive(e)) return;
    const h = world.get(e, Health);
    const p = world.get(e, Player);
    hud.hp = h.hp;
    hud.maxHp = h.max;
    hud.energy = p.energy;
    hud.maxEnergy = p.maxEnergy;
    hud.energyLocked = p.lockedOut;
    hud.level = p.level;

    const ratio = h.max > 0 ? h.hp / h.max : 0;
    const low = ratio < config.player.lowHpThreshold;
    hud.lowHp = low;
    if (low !== p.lowHp) {
      p.lowHp = low;
      _hpRatio.hpRatio = ratio;
      ctx.bus.emit(low ? 'player:lowHp' : 'player:recovered', _hpRatio);
    }
  },
};
