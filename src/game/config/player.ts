export const player = {
  maxHp: 5000,
  radius: 0.6, // world units, collision circle
  moveSpeed: 9, // u/s
  moveResponsiveness: 14, // 1/s; exponential approach to target velocity
  hoverHeight: 1.2, // visual only
  hoverBobAmplitude: 0.12,
  hoverBobSpeed: 2.2, // rad/s
  lowHpThreshold: 0.3, // hp ratio
  heavyHitRatio: 0.05, // hits >= this * maxHp are "heavy"
  heavyHitIFrames: 0.5, // seconds of invulnerability after a heavy hit
  minAimDistance: 0.5, // below this the aim direction keeps its last value
} as const;
