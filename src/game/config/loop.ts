export const loop = {
  tickRate: 60, // simulation ticks per second
  maxFrameDt: 0.25, // seconds; frame deltas above this are clamped (tab switch, breakpoints)
  maxSubsteps: 5, // ticks per rendered frame before dropping time
} as const;
