// Phase 2 test dummies. Removed or disabled once the WaveDirector exists (Phase 3).
export const sandbox = {
  enabled: true,
  dummyCount: 16,
  minDistance: 7, // from the player
  maxDistance: 16,
  dummyHp: 300,
  dummyRadius: 0.6,
  respawnInterval: 0.5, // seconds between respawns while below dummyCount
  tint: '#3D6BFF', // police tint (FACTIONS)
} as const;
