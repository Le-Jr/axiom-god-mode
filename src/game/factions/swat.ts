import { defineFaction } from './types';

// Tier 2. Phase 3 simplifications (FACTIONS.md): Marksman fires a fast needle without the laser
// telegraph, the Shield Unit has no frontal block yet, the Armored Van turret spirals instead of
// deploying Breachers. The Breach Captain mini-boss arrives with the boss phase.
export default defineFaction({
  id: 'swat',
  name: 'Tactical Response',
  tint: '#8A97A8',
  unlock: { time: 90, level: 4 },
  spawnWeight: 1.3,
  units: [
    {
      id: 'swat_breacher',
      name: 'Breacher',
      hp: 150,
      speed: 5,
      radius: 0.5,
      xp: 6,
      budgetCost: 3,
      contactDps: 100,
      behavior: { kind: 'keepDistance', preferredDistance: 7 },
      visual: { mesh: 'capsule', scale: 1, tint: '#4A5566' },
      patterns: [
        { kind: 'spread', bulletKind: 'pellet', speed: 8, damage: 22, cooldown: 2.6, count: 5, arc: 40, bursts: 3, burstGap: 0.15, complexity: { countPerCycle: 1, maxCount: 9 } },
      ],
    },
    {
      id: 'swat_marksman',
      name: 'Marksman',
      hp: 100,
      speed: 3,
      radius: 0.45,
      xp: 6,
      budgetCost: 3,
      contactDps: 60,
      behavior: { kind: 'keepDistance', preferredDistance: 15 },
      visual: { mesh: 'capsule', scale: 0.95, tint: '#2B3340' },
      patterns: [
        { kind: 'aimed', bulletKind: 'needle', speed: 16, damage: 90, cooldown: 3.2, count: 1, complexity: { countPerCycle: 1, maxCount: 3 } },
      ],
    },
    {
      id: 'swat_shield',
      name: 'Shield Unit',
      hp: 300,
      speed: 3.5,
      radius: 0.65,
      xp: 8,
      budgetCost: 4,
      contactDps: 120,
      behavior: { kind: 'chase' },
      visual: { mesh: 'capsule', scale: 1.3, tint: '#3A4152' },
      patterns: [
        { kind: 'spread', bulletKind: 'orb', speed: 5, damage: 30, cooldown: 2, count: 2, arc: 12, complexity: { countPerCycle: 1, maxCount: 5 } },
      ],
    },
    {
      id: 'swat_van',
      name: 'Armored Van',
      hp: 500,
      speed: 4,
      radius: 1.1,
      xp: 15,
      budgetCost: 8,
      contactDps: 350,
      behavior: { kind: 'keepDistance', preferredDistance: 11 },
      visual: { mesh: 'box', scale: 1.25, tint: '#2B3340' },
      patterns: [
        { kind: 'spiral', bulletKind: 'pellet', speed: 4.5, damage: 20, cooldown: 4, arms: 2, angularVel: 160, bursts: 16, burstGap: 0.12, complexity: { armsPerCycle: 1, maxCount: 6 } },
      ],
      deathPattern: { kind: 'ring', bulletKind: 'orb', speed: 4, damage: 35, cooldown: 0, count: 10, complexity: { countPerCycle: 2, maxCount: 20 } },
    },
  ],
});
