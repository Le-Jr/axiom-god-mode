// Template: copy to src/game/factions/<tierId>.ts and add to FACTIONS in factions/index.ts
import { defineFaction } from './types';

export default defineFaction({
  id: 'swat',
  name: 'Tactical Response',
  tint: '#8A97A8',
  unlock: { time: 90, level: 4 }, // seconds, player level (both required)
  spawnWeight: 1.3,
  units: [
    {
      id: 'swat_breacher',
      name: 'Breacher',
      hp: 150, // pre-Cycle
      speed: 5,
      radius: 0.5,
      xp: 6,
      budgetCost: 3,
      contactDps: 100,
      behavior: { kind: 'keepDistance', preferredDistance: 7 },
      visual: { mesh: 'capsule', scale: 1, tint: '#4A5566' },
      patterns: [
        { kind: 'spread', bulletKind: 'pellet', speed: 8, damage: 22, cooldown: 2.6, count: 5, arc: 40,
          bursts: 3, burstGap: 0.15, complexity: { countPerCycle: 1, maxCount: 9 } },
      ],
      // deathPattern: { kind: 'ring', bulletKind: 'orb', speed: 4, damage: 35, cooldown: 0, count: 10 },
    },
  ],
});
