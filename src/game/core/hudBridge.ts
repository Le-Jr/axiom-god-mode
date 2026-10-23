// Mutable HUD values written by the sim, read by the HUD at ~20 Hz via DOM refs.
// Never put per-frame values in React state.
export const hudBridge = {
  hp: 0,
  maxHp: 0,
  energy: 0,
  maxEnergy: 0,
  energyLocked: false,
  lowHp: false,
  xp: 0,
  xpToNext: 0,
  level: 1,
  runTime: 0,
  tierId: '',
  cycle: 0,
};

export type HudBridge = typeof hudBridge;
