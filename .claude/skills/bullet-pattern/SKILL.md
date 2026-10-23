---
name: bullet-pattern
description: Use when creating or modifying an enemy bullet pattern or emitter in AXIOM (spread, ring, spiral, homing, laser, artillery, airstrike, wave, burst) — parameterized emitter functions, the PatternDef data format, telegraphs, Cycle complexity scaling and tests.
---

# Bullet patterns

Patterns are **data** (`PatternDef` in faction files) executed by **emitter functions** in `src/game/systems/patterns/emitters.ts`, registered in `patterns/index.ts` (`EMITTERS`). Emitters spawn through `fireBullet(ctx, def, x, z, angle, speed)` (`patterns/fire.ts`), which applies bullet-kind radius and life, the Cycle damage multiplier and the soft cap. They never create entities. `stepEmitter` (in `index.ts`) owns cooldown and burst timing; emitters only fire one volley.

## Data format
```ts
// src/game/systems/patterns/types.ts (implemented: aimed, spread, ring, spiral)
export type PatternKind = 'aimed' | 'spread' | 'ring' | 'spiral';
// EmitterFn = (ctx, def, state, ox, oz, tx, tz) => void   — (tx, tz) is the target (player)

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
  aim?: 'player' | 'random';
}
```
Each pattern's runtime state (`EmitterState`: timer, burst, angle) lives in `Enemy.emitters[i]` as plain numbers, pooled with the component.

## Steps
1. Check whether an existing kind with different params can do it. Prefer new **data** over a new emitter.
2. New kind: add the function to `patterns/emitters.ts` (see `templates/emitter.ts`), extend `PatternKind`, and register it in `EMITTERS` (`patterns/index.ts`). Use `scaledCount` and `scaledSpeed` from `fire.ts` for Cycle scaling.
3. Apply Cycle scaling only through `def.complexity` and `ctx.cycle` (`count + countPerCycle * cycle`, clamped by `maxCount`). The Cycle damage multiplier (`config.cycle.dmgBase ^ cycle`) is applied once, at spawn, by `fireBullet`. Never multiply damage inside an emitter.
4. **Telegraphs:** lasers, artillery and airstrikes spawn a telegraph (amber outline, see ART_DIRECTION) via the `telegraph:spawn` event, then deal damage after `telegraph` seconds.
5. Respect the bullet soft cap: stop the volley when `fireBullet` returns `false` (it counts the drop).
6. `aiSystem` emits `projectile:fired` once per volley (audio throttles further). Emitters don't emit events.
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
