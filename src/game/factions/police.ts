import { defineFaction } from './types';

// Tier 1. Ground-level response: readable, slow, teaches dodging (FACTIONS.md).
export default defineFaction({
  id: 'police',
  name: 'Municipal Response',
  tint: '#3D6BFF',
  unlock: { time: 0, level: 1 },
  spawnWeight: 1.0,
  units: [
    {
      id: 'police_officer',
      name: 'Patrol Officer',
      hp: 50,
      speed: 4.5,
      radius: 0.45,
      xp: 2,
      budgetCost: 1,
      contactDps: 60,
      behavior: { kind: 'keepDistance', preferredDistance: 9 },
      visual: { mesh: 'capsule', scale: 0.9 },
      patterns: [
        { kind: 'aimed', bulletKind: 'pellet', speed: 6, damage: 25, cooldown: 2.4, count: 1, complexity: { countPerCycle: 1, maxCount: 4 } },
      ],
    },
    {
      id: 'police_riot',
      name: 'Riot Line',
      hp: 120,
      speed: 3,
      radius: 0.55,
      xp: 4,
      budgetCost: 2,
      contactDps: 80,
      behavior: { kind: 'chase' },
      visual: { mesh: 'capsule', scale: 1.1 },
      patterns: [
        { kind: 'spread', bulletKind: 'pellet', speed: 5.5, damage: 25, cooldown: 3, count: 3, arc: 30, complexity: { countPerCycle: 1, maxCount: 7 } },
      ],
    },
    {
      id: 'police_car',
      name: 'Patrol Car',
      hp: 150,
      speed: 7,
      radius: 0.9,
      xp: 5,
      budgetCost: 3,
      contactDps: 400,
      behavior: { kind: 'chase' },
      visual: { mesh: 'box', scale: 1 },
      patterns: [],
      deathPattern: { kind: 'ring', bulletKind: 'orb', speed: 4.5, damage: 35, cooldown: 0, count: 6, complexity: { countPerCycle: 2, maxCount: 16 } },
    },
  ],
});
