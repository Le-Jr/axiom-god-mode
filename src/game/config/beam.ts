export const beam = {
  range: 22, // world units
  width: 0.6, // world units (collision + visual)
  chargeTime: 0.18, // seconds before the beam hits
  tailTime: 0.2, // seconds of fade after release
  erasureRate: 300, // HP per second applied to the first target hit
  maxEnergy: 100,
  drainPerSecond: 28,
  rechargePerSecond: 22,
  rechargeDelay: 0.6, // seconds after the last drain before recharge starts
  minEnergyToFire: 25, // energy needed to re-arm after running dry
} as const;

// Erasure dissolve stages (seconds). See ART_DIRECTION "Erasure dissolve".
export const erasure = {
  freeze: 0.15,
  flatten: 0.25,
  vanish: 0.3,
} as const;
