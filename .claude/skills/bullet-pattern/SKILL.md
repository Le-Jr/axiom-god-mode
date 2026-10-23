---
name: bullet-pattern
description: Use when creating or modifying an enemy bullet pattern or emitter in AXIOM (spread, ring, spiral, homing, laser, artillery, airstrike, wave, burst) — parameterized emitter functions, the PatternDef data format, telegraphs, Cycle complexity scaling and tests.
---

# Bullet patterns

Patterns are **data** (`PatternDef` in faction files) executed by **emitter functions** (`src/game/systems/patterns/<kind>.ts`). Emitters write directly into the SoA `ProjectilePool`. They never create entities.

## Data format
```ts
// src/game/systems/patterns/types.ts
export type PatternKind = 'aimed' | 'spread' | 'ring' | 'spiral' | 'homing'
  | 'laser' | 'artillery' | 'airstrike' | 'wave' | 'burst';

export interface PatternDef {
  kind: PatternKind;
  bulletKind: BulletKindId;     // visual + radius preset ('pellet' | 'orb' | 'shell' | 'needle' ...)
  speed: number;                // u/s
  damage: number;               // pre-Cycle
  cooldown: number;             // seconds between volleys
  count?: number;               // bullets per volley (spread/ring)
  arc?: number;                 // degrees (spread)
  arms?: number;                // spiral arms
  angularVel?: number;          // deg/s (spiral rotation)
  bursts?: number;              // volleys per activation
  burstGap?: number;            // s between bursts
  telegraph?: number;           // s warning before damage (laser/artillery/airstrike); REQUIRED if damage >= 5% player max HP
  homing?: { turnRate: number; duration: number };
  complexity?: { countPerCycle?: number; armsPerCycle?: number; speedPerCycle?: number; maxCount?: number };
  aim?: 'player' | 'forward' | 'random';
}
```
Each emitter's state (current angle, burst index, timer) lives in the enemy's `Emitter` component as plain numbers.

## Steps
1. Check whether an existing kind with different params can do it. Prefer new **data** over a new emitter.
2. New kind: create `src/game/systems/patterns/<kind>.ts` from `templates/emitter.ts` and register it in `patterns/index.ts` (`EMITTERS[kind] = fn`).
3. Apply Cycle scaling only through `def.complexity` and `ctx.cycle` (`count + countPerCycle * cycle`, clamped by `maxCount`). Damage multipliers come from `config/cycle.ts` and are applied by the damage system, not the emitter.
4. **Telegraphs:** lasers, artillery and airstrikes spawn a telegraph (amber outline, see ART_DIRECTION) via the `telegraph:spawn` event, then deal damage after `telegraph` seconds.
5. Respect the bullet soft cap: `if (pool.activeCount >= config.performance.bulletSoftCap) return;` (count it as dropped).
6. Emit `projectile:fired` at most once per volley (audio throttles further).
7. Add a test: the bullet count, angles and speeds produced for a given def and cycle (`templates/emitter.test.ts`).
8. Add the kind or usage to `docs/FACTIONS.md` (pattern vocabulary).

## Rules
- Angles are in radians internally. Data uses degrees and is converted once at load.
- Precompute `cos/sin` tables for ring counts if profiling shows a hotspot.
- Never `Math.random()`. Use `ctx.rng`.
- Bullets are warm-colored (ember/blood) only.

## Checklist
- [ ] Pure data change, or a new emitter registered in `patterns/index.ts`
- [ ] Respects the soft cap, with no allocations
- [ ] Telegraph is present for heavy hits
- [ ] Cycle complexity is clamped by `maxCount`
- [ ] Unit test for geometry (count, angles)
- [ ] FACTIONS.md updated
