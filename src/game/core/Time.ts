export interface Time {
  /** Fixed step in seconds (1 / tickRate). */
  readonly step: number;
  /** Ticks simulated since run start. */
  tick: number;
  /** Simulated seconds, scaled by timeScale. */
  simTime: number;
  /** Render interpolation factor in [0, 1) between the previous and current tick. */
  alpha: number;
  /** Global sim speed (hit-stop, time dilation). 1 = normal. */
  timeScale: number;
  /** Last real frame delta in seconds (unclamped). */
  frameDt: number;
}

export function createTime(tickRate: number): Time {
  return { step: 1 / tickRate, tick: 0, simTime: 0, alpha: 0, timeScale: 1, frameDt: 0 };
}
