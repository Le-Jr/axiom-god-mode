// Template: copy to src/game/factions/<tierId>.ts and register in factions/index.ts
import { defineFaction } from './defineFaction';

export default defineFaction({
  id: 'swat',
  name: 'Tactical Response',
  tint: '#2B3340',
  unlock: { time: 90, level: 4 },     // seconds, player level (both required)
  spawnWeight: 1.3,
  units: [
    {
      id: 'swat_breacher',
      name: 'Breacher',
      hp: 150, speed: 5, radius: 0.6, xp: 6, budgetCost: 3,
      behavior: { kind: 'chase', stopDistance: 7 },
      visual: { mesh: 'capsule', scale: 1 },
      patterns: [
        { kind: 'spread', bulletKind: 'pellet', speed: 9, damage: 12, cooldown: 2.2,
          count: 5, arc: 40, bursts: 3, burstGap: 0.15, aim: 'player',
          complexity: { countPerCycle: 1, maxCount: 9 } },
      ],
    },
  ],
  boss: undefined, // or { id, name, hp, radius, visual, phases: [{ untilHpRatio: 0.6, patterns: [...], adds: [...] }] }
});
