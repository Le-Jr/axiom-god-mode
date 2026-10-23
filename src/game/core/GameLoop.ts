import { orderSystems, type System } from '@/game/ecs/System';
import type { PauseReason } from './events';
import type { GameContext } from './GameContext';

const REASON_BITS: Record<PauseReason, number> = { ui: 1, levelUp: 2, hidden: 4 };

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * Fixed-timestep accumulator. Driven by one R3F `useFrame` (priority -100), so there is a
 * single rAF. Rendering reads `ctx.time.alpha` to interpolate between ticks.
 */
export class GameLoop {
  private readonly systems: System[];
  private accumulator = 0;
  private pauseMask = 0;
  private readonly reasonPayload: { reason: PauseReason } = { reason: 'ui' };
  private initialized = false;

  constructor(
    readonly ctx: GameContext,
    systems: readonly System[],
  ) {
    this.systems = orderSystems(systems);
  }

  init(): void {
    if (this.initialized) return;
    for (let i = 0; i < this.systems.length; i++) this.systems[i].init?.(this.ctx);
    this.initialized = true;
  }

  get paused(): boolean {
    return this.pauseMask !== 0;
  }

  pause(reason: PauseReason): void {
    const bit = REASON_BITS[reason];
    if (this.pauseMask & bit) return;
    this.pauseMask |= bit;
    this.reasonPayload.reason = reason;
    this.ctx.bus.emit('tick:paused', this.reasonPayload);
  }

  resume(reason: PauseReason): void {
    const bit = REASON_BITS[reason];
    if (!(this.pauseMask & bit)) return;
    this.pauseMask &= ~bit;
    if (this.pauseMask === 0) this.accumulator = 0; // no catch-up burst after a pause
    this.reasonPayload.reason = reason;
    this.ctx.bus.emit('tick:resumed', this.reasonPayload);
  }

  /** Advance by a real frame delta (seconds). Returns the number of ticks run. */
  frame(frameDt: number): number {
    const { time, config, debug } = this.ctx;
    time.frameDt = frameDt;
    if (this.pauseMask !== 0) return 0;

    const step = time.step;
    this.accumulator += Math.min(frameDt, config.loop.maxFrameDt);
    let substeps = 0;
    const t0 = now();
    while (this.accumulator >= step && substeps < config.loop.maxSubsteps) {
      this.tick(step);
      this.accumulator -= step;
      substeps++;
    }
    // Hit the substep cap: drop the backlog rather than spiral.
    if (substeps === config.loop.maxSubsteps && this.accumulator >= step) this.accumulator = 0;
    if (substeps > 0) debug.simMs = now() - t0;
    debug.substeps = substeps;
    time.alpha = this.accumulator / step;
    return substeps;
  }

  /** Run exactly one tick. Exposed for tests and headless soak runs. */
  tick(step: number = this.ctx.time.step): void {
    const { time } = this.ctx;
    time.tick++;
    time.simTime += step * time.timeScale;
    for (let i = 0; i < this.systems.length; i++) this.systems[i].update(this.ctx, step);
  }

  dispose(): void {
    for (let i = this.systems.length - 1; i >= 0; i--) this.systems[i].dispose?.(this.ctx);
    this.ctx.bus.clear();
    this.ctx.world.clear();
    this.initialized = false;
  }
}
