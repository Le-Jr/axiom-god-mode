import type { GameEvents } from '@/game/core/events';
import { HitKind } from '@/game/core/HitBuffer';
import { distSq } from '@/game/core/math';
import type { System } from '@/game/ecs/System';
import type { Query } from '@/game/ecs/World';
import { Erasing, Player, Target, Transform } from '@/game/ecs/components';

const _pulse: GameEvents['aura:pulse'] = { radius: 0, level: 1 };
let targets: Query;

/** Passive pulsing field: every `pulseInterval`, damages every target inside the radius. */
export const auraSystem: System = {
  name: 'aura',
  phase: 'player',
  init(ctx) {
    targets = ctx.world.query(Target, Transform);
  },
  update(ctx, dt) {
    const { world, config } = ctx;
    const e = ctx.player;
    if (e < 0 || !world.isAlive(e)) return;
    const p = world.get(e, Player);
    p.auraTimer += dt * ctx.time.timeScale;
    if (p.auraTimer < config.aura.pulseInterval) return;
    p.auraTimer -= config.aura.pulseInterval;

    const t = world.get(e, Transform);
    const damage = config.aura.damagePerPulse;
    const n = targets.collect();
    for (let i = 0; i < n; i++) {
      const te = targets.results[i];
      if (world.has(te, Erasing)) continue;
      const target = world.get(te, Target);
      const pos = world.get(te, Transform);
      const reach = p.auraRadius + target.radius;
      if (distSq(t.x, t.z, pos.x, pos.z) > reach * reach) continue;
      ctx.hits.push(te, target.air ? damage * config.aura.airDamageScale : damage, HitKind.aura);
    }
    p.auraPulses++;
    _pulse.radius = p.auraRadius;
    _pulse.level = p.level;
    ctx.bus.emit('aura:pulse', _pulse);
  },
};
