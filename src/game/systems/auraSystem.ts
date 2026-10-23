import type { GameEvents } from '@/game/core/events';
import { HitKind } from '@/game/core/HitBuffer';
import type { System } from '@/game/ecs/System';
import { Erasing, Player, Target, Transform } from '@/game/ecs/components';

const _pulse: GameEvents['aura:pulse'] = { radius: 0, level: 1 };

/** Passive pulsing field: every `auraInterval`, damages every target inside the radius (grid query). */
export const auraSystem: System = {
  name: 'aura',
  phase: 'player',
  update(ctx, dt) {
    const { world, config, stats, grid, gridResults } = ctx;
    const e = ctx.player;
    if (e < 0 || !world.isAlive(e)) return;
    const p = world.get(e, Player);
    p.auraRadius = stats.auraRadius;
    p.auraTimer += dt * ctx.time.timeScale;
    if (p.auraTimer < stats.auraInterval) return;
    p.auraTimer -= stats.auraInterval;

    const t = world.get(e, Transform);
    const damage = stats.auraDamage;
    const n = grid.query(t.x, t.z, p.auraRadius, gridResults);
    for (let i = 0; i < n; i++) {
      const te = grid.ids[gridResults[i]];
      if (!world.isAlive(te) || world.has(te, Erasing)) continue;
      const target = world.get(te, Target);
      ctx.hits.push(te, target.air ? damage * config.aura.airDamageScale : damage, HitKind.aura);
    }
    p.auraPulses++;
    _pulse.radius = p.auraRadius;
    _pulse.level = p.level;
    ctx.bus.emit('aura:pulse', _pulse);
  },
};
