---
name: balance-tuning
description: Use when changing ANY gameplay number in AXIOM — player stats, aura/beam values, enemy HP/damage/speed, spawn budgets, tier unlock times, XP curve, rarity weights, Cycle scaling formulas, performance caps — or when moving a magic number into src/game/config.
---

# Balance tuning

All tunables live in `src/game/config/`. Faction and upgrade numbers live in their data files, but global multipliers are always in config.

| File | Contents |
|---|---|
| `config/player.ts` | HP, move speed/accel, low-HP threshold, pickup radius, heavy-hit i-frames |
| `config/aura.ts` | radius, damage, pulse interval |
| `config/beam.ts` | range, width, charge time, energy max/drain/recharge, erasure rate |
| `config/combat.ts` | `projectiles` (kinds, cull), `enemies` (fire range, separation, grid), `director` (budget, spawn ring, tier decay), `cycle` (`hpBase`, `dmgBase`, `densityStep`, `timeCompression`, `rarityShift`), `progression` (XP curve `xpBase * level^xpExponent`, orbs), `upgrades` (rarity weights, rerolls, pity, satellites), `stress` |
| `src/game/factions/*.ts` | per-unit HP, speed, XP, budget cost, contact DPS, patterns |
| `src/game/upgrades/defs/index.ts` | per-buff values |
| `config/performance.ts` | pool capacities, soft caps |
| `config/rendering.ts` | quality presets |
| `config/audio.ts` | voices, hum pitch, pause duck, spatial distances |
| `config/beam.ts`, `config/aura.ts`, `config/input.ts`, `config/sandbox.ts` | beam/erasure, aura, key bindings, test dummies |

## Steps
1. Find the value. If it's hardcoded in a system, **move it to config first** (same commit).
2. Change it. Keep the `as const` typing and add a short comment with the unit (`// u/s`, `// seconds`, `// per pulse`).
3. For formulas (Cycle, XP, budget), update the formula **in one place** and mirror the change in `docs/GDD.md` §8 and `docs/FACTIONS.md`.
4. Sanity-check with numbers: compute time-to-kill for the reference unit at levels 1, 10 and 30, and Cycle 0 and 2 (beam DPS vs. HP × hpMult). Note the results.
5. Check that the performance caps are still respected (density never exceeds soft caps).
6. Log the change in the **Balance log** section of `docs/DEVLOG.md` for the session: `value: old → new (reason)`.
7. Run `npm run test`. Formula tests in `config/__tests__` must be updated deliberately, not just to make them pass.

## Rules
- Use one multiplier per concern. Don't stack hidden multipliers across files.
- Data stays pre-Cycle. Cycle math is applied only at spawn or damage time.
- Changing pool capacities needs a perf re-check (`PERFORMANCE.md` profiling checklist).

## Checklist
- [ ] Value lives in `config/` (or faction/upgrade data), with no magic numbers left behind
- [ ] Unit comment present
- [ ] GDD and FACTIONS formulas in sync
- [ ] TTK sanity numbers noted
- [ ] DEVLOG balance log entry
- [ ] Tests pass
