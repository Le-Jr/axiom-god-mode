---
name: upgrade-authoring
description: Use when adding or changing a level-up buff, rarity weight, stacking rule or synergy in AXIOM (src/game/upgrades) — definition file, stat application, runtime behavior hooks, registration, tests and keeping docs/UPGRADES.md in sync.
---

# Upgrade authoring

Buffs are definitions in `src/game/upgrades/defs/index.ts`, collected in the `UPGRADES` array (split into files once the list grows). Player stats are **recomputed** from base stats plus owned buffs (`computeStats`), never mutated incrementally. Behavior buffs (satellites, clones, gravity wells) also have a system that reads the owned stacks.

## Steps
1. Decide the type:
   - **Stat buff:** only `apply(stats, stacks)`.
   - **Behavior buff:** `apply` sets a stat (e.g. `stats.satellites = n`), plus a system in `systems/` that reads `ctx.stats` (use the `ecs-system` skill). Shared math goes in `upgrades/<name>.ts` (e.g. `satellites.ts`), not in the system, because renderers import it too.
2. Add a `defineUpgrade({...})` from `templates/upgrade.ts` to `upgrades/defs/index.ts`. Set `rarity`, `stacking`, `maxStacks`, `tags` and `requires`. `apply(stats, stacks, config)` gets config for base-relative buffs. New stats need a field in `upgrades/stats.ts` (`PlayerStats` + `resetStats`) and wiring where it is read.
3. `apply` must be **pure and order-independent**: multiplicative effects use `**stacks`, additive ones use `* stacks`. Put param tables for `levels` mode in the def or in `config.upgrades` (`config/combat.ts`).
4. Write `description(stacks)` showing the **next** stack's effect in plain player language.
5. Add it to the `UPGRADES` array.
6. Synergies: add an entry to `upgrades/synergies.ts` (`{ id, requires: [{id, minStacks}], apply }`).
7. Add a test in `upgrades/__tests__/upgrades.test.ts`: `computeStats` with 0, 1 and max stacks, plus picker exclusion when maxed.
8. Add an icon at `public/assets/textures/upgrades/<id>.png` (or a placeholder glyph in the def).
9. **Update `docs/UPGRADES.md`** (catalog row and synergy row).

## Rules
- Use the rarity weights from `config.upgrades.rarityWeights` (`config/combat.ts`), never per-def.
- No buff can make the player fully invulnerable, and none can remove the energy constraint entirely.
- Names are original and evocative (physics, geometry, light). Run the IP check on names.

## Checklist
- [ ] Def file plus registration
- [ ] `apply` is pure and order-independent, and the test covers 0, 1 and max
- [ ] The behavior system exists if needed, and is allocation-free
- [ ] The description reads well for the next stack
- [ ] Synergies updated
- [ ] UPGRADES.md updated
