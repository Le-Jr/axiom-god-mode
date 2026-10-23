import { defineUpgrade, type UpgradeDef } from '../types';

// Phase 3 starter set. Each row mirrors docs/UPGRADES.md (upgrade-authoring skill).

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const auraRadius = defineUpgrade({
  id: 'aura_radius',
  name: 'Expanding Presence',
  rarity: 'common',
  stacking: 'multiplicative',
  maxStacks: 8,
  tags: ['aura'],
  description: () => `Aura radius +${pct(0.12)}`,
  apply: (s, n) => {
    s.auraRadius *= 1.12 ** n;
  },
});

export const auraDamage = defineUpgrade({
  id: 'aura_damage',
  name: 'Resonant Field',
  rarity: 'common',
  stacking: 'multiplicative',
  maxStacks: 10,
  tags: ['aura'],
  description: () => `Aura damage +${pct(0.15)}`,
  apply: (s, n) => {
    s.auraDamage *= 1.15 ** n;
  },
});

export const beamEnergy = defineUpgrade({
  id: 'beam_energy',
  name: 'Deep Reservoir',
  rarity: 'common',
  stacking: 'additive',
  maxStacks: 8,
  tags: ['beam'],
  description: () => 'Maximum energy +20',
  apply: (s, n) => {
    s.beamMaxEnergy += 20 * n;
  },
});

export const beamRecharge = defineUpgrade({
  id: 'beam_recharge',
  name: 'Restoration',
  rarity: 'common',
  stacking: 'multiplicative',
  maxStacks: 6,
  tags: ['beam'],
  description: () => `Energy recharge +${pct(0.15)}`,
  apply: (s, n) => {
    s.beamRecharge *= 1.15 ** n;
  },
});

const PIERCE_BY_LEVEL = [0, 2, 4, Infinity] as const;

export const beamPierce = defineUpgrade({
  id: 'beam_pierce',
  name: 'Unbounded Line',
  rarity: 'rare',
  stacking: 'levels',
  maxStacks: 3,
  tags: ['beam'],
  description: (next) =>
    PIERCE_BY_LEVEL[next] === Infinity ? 'The beam passes through everything' : `The beam passes through ${PIERCE_BY_LEVEL[next]} targets`,
  apply: (s, n) => {
    s.beamPierce = PIERCE_BY_LEVEL[Math.min(n, PIERCE_BY_LEVEL.length - 1)];
  },
});

export const maxHp = defineUpgrade({
  id: 'max_hp',
  name: 'Densified Form',
  rarity: 'common',
  stacking: 'additive',
  maxStacks: 10,
  tags: ['defense'],
  description: () => 'Maximum Form +8%, restored on pickup',
  apply: (s, n, config) => {
    s.maxHp += config.player.maxHp * 0.08 * n;
  },
});

export const satellites = defineUpgrade({
  id: 'satellites',
  name: 'Atomic Orbit',
  rarity: 'rare',
  stacking: 'levels',
  maxStacks: 6,
  tags: ['defense', 'orbit'],
  description: (next) => (next === 1 ? 'An orbiting atom damages enemies and blocks bullets' : `${next} orbiting atoms`),
  apply: (s, n) => {
    s.satellites = n;
  },
});

export const moveSpeed = defineUpgrade({
  id: 'move_speed',
  name: 'Weightless',
  rarity: 'common',
  stacking: 'multiplicative',
  maxStacks: 5,
  tags: ['movement'],
  description: () => `Move speed +${pct(0.08)}`,
  apply: (s, n) => {
    s.moveSpeed *= 1.08 ** n;
  },
});

export const UPGRADES: readonly UpgradeDef[] = [
  auraRadius,
  auraDamage,
  beamEnergy,
  beamRecharge,
  beamPierce,
  maxHp,
  satellites,
  moveSpeed,
];

export const UPGRADES_BY_ID: ReadonlyMap<string, UpgradeDef> = new Map(UPGRADES.map((u) => [u.id, u]));
