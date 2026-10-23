import type { GameEvents } from '@/game/core/events';
import { HitKind } from '@/game/core/HitBuffer';
import type { System } from '@/game/ecs/System';
import { Erasing, Health, Target, Transform } from '@/game/ecs/components';

const HIT_FLASH = 0.08; // seconds

const _erased: GameEvents['enemy:erased'] = { entity: 0, archetypeId: '', x: 0, z: 0, xp: 0 };
const _killed: GameEvents['enemy:killed'] = { entity: 0, archetypeId: '', x: 0, z: 0, xp: 0 };

/**
 * Drains the hit buffer. Beam kills *erase* (dissolve, no debris); other kills destroy.
 * Player damage arrives in Phase 3 with enemy bullets.
 */
export const damageSystem: System = {
  name: 'damage',
  phase: 'damage',
  update(ctx, dt) {
    const { world, hits, bus } = ctx;
    const step = dt * ctx.time.timeScale;

    // Tick down flash timers first, so a hit this tick shows for the full duration.
    const targets = world.store(Target);
    for (let i = 0; i < targets.size; i++) {
      const tg = targets.data[i];
      if (tg.flash > 0) tg.flash = Math.max(0, tg.flash - step);
    }

    for (let i = 0; i < hits.count; i++) {
      const e = hits.target[i];
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
