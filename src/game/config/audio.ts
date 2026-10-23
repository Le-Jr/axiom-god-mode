export const audio = {
  maxVoices: 48, // global; low-priority sounds drop above this
  auraHumBaseHz: 55,
  auraHumSemitonesPerLevel: 0.5, // pitch = base * 2^(level * this / 12)
  pauseDuck: 0.0001, // sfx bus gain while paused
  pauseFade: 0.2, // seconds
  spatialRefDistance: 8,
  spatialMaxDistance: 60,
} as const;
