import { HitKind } from '@/game/core/HitBuffer';
import { rayCircle } from '@/game/core/math';
import type { GameContext } from '@/game/core/GameContext';
import type { System } from '@/game/ecs/System';
import type { Query } from '@/game/ecs/World';
import { BeamState, Erasing, Player, Target, Transform, type PlayerData } from '@/game/ecs/components';

const EMPTY = {} as Record<string, never>;
let targets: Query;
// Scratch for pierce: hits along the ray, sorted by distance (insertion sort, small n).
let hitT = new Float32Array(0);
let hitE = new Int32Array(0);

function enter(p: PlayerData, state: BeamState): void {
  p.beamState = state;
  p.beamTimer = 0;
}

/**
 * Traces the aim ray. Returns how many of the sorted hits (in `hitE`) the beam damages:
 * 1 + pierce, capped by the hits found. Updates the visual length (ends at the last damaged
 * target when the beam is stopped, else full range).
 */
function traceBeam(ctx: GameContext, p: PlayerData, ox: number, oz: number): number {
  const { world, config, stats } = ctx;
  const range: number = config.beam.range;
  const halfWidth = stats.beamWidth / 2;
  let count = 0;
  const n = targets.collect();
  for (let i = 0; i < n; i++) {
    const te = targets.results[i];
    if (world.has(te, Erasing)) continue;
    const pos = world.get(te, Transform);
    const t = rayCircle(ox, oz, p.aimDirX, p.aimDirZ, range, halfWidth, pos.x, pos.z, world.get(te, Target).radius);
    if (t < 0) continue;
    let j = count++;
    while (j > 0 && hitT[j - 1] > t) {
      hitT[j] = hitT[j - 1];
      hitE[j] = hitE[j - 1];
      j--;
    }
    hitT[j] = t;
    hitE[j] = te;
  }
  const allowed = stats.beamPierce === Infinity ? count : Math.min(count, 1 + stats.beamPierce);
  p.beamHit = allowed > 0;
  // Stopped when every allowed slot was used (pierce exhausted); otherwise it reaches full range.
  const stopped = stats.beamPierce !== Infinity && allowed === 1 + stats.beamPierce;
  p.beamLength = stopped ? hitT[allowed - 1] : range;
  return allowed;
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
    hitT = new Float32Array(ctx.config.performance.maxEntities);
    hitE = new Int32Array(ctx.config.performance.maxEntities);
  },
  update(ctx, dt) {
    const { world, config, input, bus, stats } = ctx;
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
      const hits = traceBeam(ctx, p, t.x, t.z);
      const amount = cfg.erasureRate * step;
      for (let i = 0; i < hits; i++) ctx.hits.push(hitE[i], amount, HitKind.beam);
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
        p.energy = Math.min(p.maxEnergy, p.energy + stats.beamRecharge * step);
      }
      if (p.lockedOut && p.energy >= cfg.minEnergyToFire) p.lockedOut = false;
    }
  },
};
