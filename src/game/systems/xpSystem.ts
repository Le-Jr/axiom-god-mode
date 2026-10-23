import type { GameContext } from '@/game/core/GameContext';
import type { GameEvents } from '@/game/core/events';
import type { System } from '@/game/ecs/System';
import { Player, Transform } from '@/game/ecs/components';
import { offerLevelUp } from '@/game/upgrades/levelUp';
import { xpToNext } from '@/game/upgrades/progress';

const _gained: GameEvents['xp:gained'] = { amount: 0 };

function spawnOrb(ctx: GameContext, x: number, z: number, xp: number): void {
  if (xp <= 0) return;
  ctx.orbs.spawn(x, z, xp, ctx.config.progression.orbMergeThreshold, ctx.rng.int(0, 1 << 20));
}

/** XP orbs (drop, magnet, collect) and level-ups. Level-ups wait for a choice before the next. */
export const xpSystem: System = {
  name: 'xp',
  phase: 'progression',
  init(ctx) {
    ctx.bus.on('enemy:erased', (e) => {
      ctx.progress.erasures++;
      spawnOrb(ctx, e.x, e.z, e.xp);
    });
    ctx.bus.on('enemy:killed', (e) => {
      ctx.progress.kills++;
      spawnOrb(ctx, e.x, e.z, e.xp);
    });
  },
  update(ctx, dt) {
    const { world, orbs, progress, config } = ctx;
    if (ctx.player < 0 || !world.isAlive(ctx.player)) return;
    const step = dt * ctx.time.timeScale;
    const pt = world.get(ctx.player, Transform);
    const pc = config.progression;
    const pickup2 = ctx.stats.pickupRadius * ctx.stats.pickupRadius;
    const collect2 = pc.orbCollectRadius * pc.orbCollectRadius;

    for (let i = orbs.count - 1; i >= 0; i--) {
      orbs.prevX[i] = orbs.x[i];
      orbs.prevZ[i] = orbs.z[i];
      orbs.age[i] += step;
      const dx = pt.x - orbs.x[i];
      const dz = pt.z - orbs.z[i];
      const d2 = dx * dx + dz * dz;
      if (d2 <= collect2) {
        progress.xp += orbs.value[i];
        _gained.amount = orbs.value[i];
        ctx.bus.emit('xp:gained', _gained);
        orbs.despawn(i);
        continue;
      }
      if (orbs.magnet[i] === 0 && d2 <= pickup2) orbs.magnet[i] = 1;
      if (orbs.magnet[i] === 1) {
        const d = Math.sqrt(d2);
        const move = Math.min(d, pc.orbMagnetSpeed * step);
        orbs.x[i] += (dx / d) * move;
        orbs.z[i] += (dz / d) * move;
      } else if (orbs.age[i] >= pc.orbLife) {
        orbs.despawn(i);
      }
    }
    ctx.debug.counts.orbs = orbs.count;

    if (!progress.awaitingChoice) {
      const need = xpToNext(progress.level, config);
      if (progress.xp >= need) {
        progress.xp -= need;
        progress.level++;
        world.get(ctx.player, Player).level = progress.level;
        if (progress.level % config.upgrades.rerollEveryLevels === 0) {
          progress.rerolls = Math.min(config.upgrades.maxRerolls, progress.rerolls + 1);
        }
        offerLevelUp(ctx);
      }
    }
  },
};
