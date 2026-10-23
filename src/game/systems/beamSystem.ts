import { HitKind } from '@/game/core/HitBuffer';
import { rayCircle } from '@/game/core/math';
import type { GameContext } from '@/game/core/GameContext';
import type { System } from '@/game/ecs/System';
import type { Query } from '@/game/ecs/World';
import { BeamState, Erasing, Player, Target, Transform, type PlayerData } from '@/game/ecs/components';

const EMPTY = {} as Record<string, never>;
let targets: Query;

function enter(p: PlayerData, state: BeamState): void {
  p.beamState = state;
  p.beamTimer = 0;
}

/** Finds the first target along the aim ray; updates beam length. Returns the entity or -1. */
function traceBeam(ctx: GameContext, p: PlayerData, ox: number, oz: number): number {
  const { world, config } = ctx;
  const halfWidth = config.beam.width / 2;
  let best = -1;
  let bestT: number = config.beam.range;
  const n = targets.collect();
  for (let i = 0; i < n; i++) {
    const te = targets.results[i];
    if (world.has(te, Erasing)) continue;
    const pos = world.get(te, Transform);
    const hit = rayCircle(ox, oz, p.aimDirX, p.aimDirZ, config.beam.range, halfWidth, pos.x, pos.z, world.get(te, Target).radius);
    if (hit >= 0 && hit < bestT) {
      bestT = hit;
      best = te;
    }
  }
  p.beamLength = bestT;
  p.beamHit = best !== -1;
  return best;
}

/**
 * Erasure Beam: idle → charging → channel → tail. Energy drains while channeling and recharges
 * after a delay. Running dry locks the beam until energy reaches `minEnergyToFire`.
 */
export const beamSystem: System = {
  name: 'beam',
  phase: 'player',
  init(ctx) {
    targets = ctx.world.query(Target, Transform);
  },
  update(ctx, dt) {
    const { world, config, input, bus } = ctx;
    const e = ctx.player;
    if (e < 0 || !world.isAlive(e)) return;
    const cfg = config.beam;
    const step = dt * ctx.time.timeScale;
    const p = world.get(e, Player);
    const t = world.get(e, Transform);
    p.beamTimer += step;

    switch (p.beamState) {
      case BeamState.idle:
        if (input.fire && !p.lockedOut && p.energy > 0) {
          enter(p, BeamState.charging);
          bus.emit('beam:start', EMPTY);
        }
        break;
      case BeamState.charging:
        if (!input.fire) {
          enter(p, BeamState.tail);
          bus.emit('beam:stop', EMPTY);
        } else if (p.beamTimer >= cfg.chargeTime) {
          enter(p, BeamState.channel);
        }
        break;
      case BeamState.channel:
        if (!input.fire) {
          enter(p, BeamState.tail);
          bus.emit('beam:stop', EMPTY);
        }
        break;
      case BeamState.tail:
        if (p.beamTimer >= cfg.tailTime) enter(p, BeamState.idle);
        break;
    }

    if (p.beamState === BeamState.channel) {
      const hit = traceBeam(ctx, p, t.x, t.z);
      if (hit !== -1) ctx.hits.push(hit, cfg.erasureRate * step, HitKind.beam);
      p.energy -= cfg.drainPerSecond * step;
      p.sinceDrain = 0;
      if (p.energy <= 0) {
        p.energy = 0;
        p.lockedOut = true;
        enter(p, BeamState.tail);
        bus.emit('beam:empty', EMPTY);
        bus.emit('beam:stop', EMPTY);
      }
    } else {
      if (p.beamState !== BeamState.idle) traceBeam(ctx, p, t.x, t.z); // visual length only
      p.sinceDrain += step;
      if (p.sinceDrain >= cfg.rechargeDelay && p.energy < p.maxEnergy) {
        p.energy = Math.min(p.maxEnergy, p.energy + cfg.rechargePerSecond * step);
      }
      if (p.lockedOut && p.energy >= cfg.minEnergyToFire) p.lockedOut = false;
    }
  },
};
