import { describe, expect, it } from 'vitest';
import { config } from '@/game/config';
import { Rng } from '@/game/core/Rng';
import { UPGRADES, UPGRADES_BY_ID } from '../defs';
import { computeStats, createProgress, rollChoices, xpToNext } from '../progress';
import { createStats } from '../stats';

describe('computeStats', () => {
  it('returns base stats with no buffs', () => {
    const s = createStats();
    computeStats(s, new Map(), config);
    expect(s.auraRadius).toBe(config.aura.radius);
    expect(s.maxHp).toBe(config.player.maxHp);
    expect(s.beamPierce).toBe(0);
  });

  it('applies stacks order-independently', () => {
    const a = createStats();
    const b = createStats();
    computeStats(a, new Map([['aura_radius', 2], ['max_hp', 1]]), config);
    computeStats(b, new Map([['max_hp', 1], ['aura_radius', 2]]), config);
    expect(a).toEqual(b);
    expect(a.auraRadius).toBeCloseTo(config.aura.radius * 1.12 ** 2);
    expect(a.maxHp).toBeCloseTo(config.player.maxHp * 1.08);
  });

  it('pierce maxes out at "everything"', () => {
    const s = createStats();
    computeStats(s, new Map([['beam_pierce', 3]]), config);
    expect(s.beamPierce).toBe(Infinity);
  });
});

describe('rollChoices', () => {
  it('offers distinct buffs and never maxed ones', () => {
    const p = createProgress(config);
    for (const u of UPGRADES) if (u.id !== 'satellites' && u.id !== 'move_speed') p.owned.set(u.id, u.maxStacks);
    const picks = rollChoices(p, new Rng(3), config, 0);
    expect(new Set(picks).size).toBe(picks.length);
    expect(picks.sort()).toEqual(['move_speed', 'satellites']);
  });

  it('pity guarantees a Rare+ after enough all-Common offers', () => {
    const p = createProgress(config);
    p.commonStreak = config.upgrades.pityAfter;
    for (let seed = 1; seed < 30; seed++) {
      p.commonStreak = config.upgrades.pityAfter;
      const picks = rollChoices(p, new Rng(seed), config, 0);
      expect(picks.some((id) => UPGRADES_BY_ID.get(id)?.rarity !== 'common')).toBe(true);
      expect(p.commonStreak).toBe(0);
    }
  });

  it('returns nothing when every buff is maxed', () => {
    const p = createProgress(config);
    for (const u of UPGRADES) p.owned.set(u.id, u.maxStacks);
    expect(rollChoices(p, new Rng(1), config, 0)).toEqual([]);
  });
});

describe('xpToNext', () => {
  it('grows with level', () => {
    expect(xpToNext(1, config)).toBe(config.progression.xpBase);
    expect(xpToNext(10, config)).toBeGreaterThan(xpToNext(5, config));
  });
});
