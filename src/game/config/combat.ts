// Enemy-side combat tunables. Unit stats live in src/game/factions/*.

export const projectiles = {
  kinds: {
    pellet: { radius: 0.16, life: 6 },
    orb: { radius: 0.28, life: 7 },
    needle: { radius: 0.11, life: 4 },
    shell: { radius: 0.36, life: 5 },
  },
  cullDistance: 48, // despawn bullets this far from the player
  visualScale: 1.6, // sprite radius vs collision radius (glow margin)
} as const;

export type BulletKindId = keyof typeof projectiles.kinds;
export const BULLET_KINDS = Object.keys(projectiles.kinds) as BulletKindId[];

export const enemies = {
  fireRange: 26, // enemies only shoot within this distance of the player
  despawnDistance: 70, // silently removed beyond this (the director refills)
  separationRadius: 1.1, // neighbors closer than this push apart
  separationStrength: 6, // u/s at full overlap
  steeringResponsiveness: 6, // 1/s
  gridCellSize: 2.5,
  gridBuckets: 4096, // power of two
} as const;

export const director = {
  enabled: true,
  baseBudgetPerSecond: 1.4,
  budgetGrowthPerMinute: 1.1, // added to the per-second rate each minute
  maxBank: 30,
  maxSpawnsPerTick: 3,
  spawnDistanceMin: 20,
  spawnDistanceMax: 27,
  tierDecay: 0.6, // weight multiplier per tier behind the newest
  bossBudgetScale: 0.4, // regular spawns during boss fights (bosses: later phase)
} as const;

export const cycle = {
  hpBase: 1.6,
  dmgBase: 1.3,
  densityStep: 0.35,
  timeCompression: 0.85,
  rarityShift: 2, // weight moved from Common to higher rarities per Cycle
} as const;

export const progression = {
  xpBase: 5,
  xpExponent: 1.35, // xpToNext(level) = round(xpBase * level^xpExponent)
  orbMergeThreshold: 400, // above this, new orbs merge into existing ones
  orbMagnetSpeed: 16, // u/s once inside pickup radius
  orbCollectRadius: 0.8,
  orbLife: 60, // seconds before an uncollected orb fades
} as const;

export const upgrades = {
  rarityWeights: { common: 60, rare: 28, epic: 10, axiom: 2 },
  choicesPerLevel: 3,
  pityAfter: 4, // consecutive all-Common offers before a guaranteed Rare+
  rerollsAtStart: 1,
  rerollEveryLevels: 10,
  maxRerolls: 3,
  satellite: {
    orbitRadius: 2.3,
    angularSpeed: 2.6, // rad/s
    radius: 0.32, // collision
    contactDps: 60,
  },
} as const;

export const stress = {
  enemies: 300,
  bullets: 2500,
  ringSize: 40,
  ringSpeed: 5,
  ringDistance: 14,
} as const;
