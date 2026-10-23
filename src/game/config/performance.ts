// Pool capacities and soft caps. See docs/PERFORMANCE.md before changing.
export const performance = {
  maxEntities: 4096, // ECS entity slots (enemies, props, pickups, player)
  enemyProjectiles: 4096,
  bulletSoftCap: 2500, // emitters stop spawning above this
  playerProjectiles: 256,
  enemies: 512,
  enemySoftCap: 300,
  props: 1024,
  fragments: 2048,
  fragmentSoftCap: 1500,
  xpOrbs: 512,
  audioVoices: 48,
} as const;
