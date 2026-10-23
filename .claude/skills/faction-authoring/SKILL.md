---
name: faction-authoring
description: Use when adding or changing a faction tier, enemy archetype or boss in AXIOM — the faction data file, unit stats, pattern assignment, spawn/unlock rules, boss phases, placeholder visuals, IP check, and keeping docs/FACTIONS.md in sync.
---

# Faction authoring

Factions are pure data in `src/game/factions/<tierId>.ts`, registered in `src/game/factions/index.ts` in ladder order. The WaveDirector reads them, and no code changes should be needed for a new unit that uses existing behaviors and emitters.

## Steps
1. **Run the IP check first** (`docs/ART_DIRECTION.md#ip-originality-checklist`): name, silhouette and powers. Heroes and secret societies need extra care.
2. Copy `templates/faction.ts` to `src/game/factions/<tierId>.ts`.
3. For each unit, define `hp`, `speed`, `radius`, `xp`, `budgetCost`, `contactDps`, `behavior` (implemented: `chase | keepDistance` with `preferredDistance`; planned: `flyby`, `stationary`, `deployer`), `patterns` (at most 3 PatternDefs; see the `bullet-pattern` skill), an optional `deathPattern` (fires only when the unit is *killed*, never when erased), and `visual` (`mesh: 'capsule' | 'box' | 'wedge'`, `scale`, optional `tint` that overrides the faction tint).
4. Set the **unlock rule** (`unlock: { time, level }`), the `spawnWeight`, and the `boss` (optional).
5. Bosses: list `phases` with an HP threshold, patterns and adds. The boss spawns on tier entry. Emit `boss:spawned` and `boss:defeated` (handled by the director).
6. Register the faction in the `FACTIONS` array in `factions/index.ts`. `ARCHETYPES` and the director's tier tables derive from it. Never reorder existing tiers without an ADR. A new mesh kind also needs `MESH_KINDS` plus a `createShape` case in `rendering/pools/EnemyPool.tsx` and an `<EnemyPool mesh=…>` in `GameCanvas`.
7. If a unit needs a new behavior or emitter, add it via the `ecs-system` or `bullet-pattern` skills first.
8. Tune numbers relative to player power (see the header of `docs/FACTIONS.md`). Use the `balance-tuning` skill for global multipliers.
9. **Update `docs/FACTIONS.md`**: tier row, unit table, boss and patterns.
10. Add audio hooks (`fire_<faction>_<kind>`) to the SFX registry (`audio-sfx` skill), with procedural fallbacks.

## Conventions
- Ids are `snake_case` and stable (saves and analytics will key on them). Display names are separate.
- HP is pre-Cycle. Never bake Cycle multipliers into data.
- Faction tint goes on bodies only. Bullets stay ember or blood.

## Checklist
- [ ] IP checklist passed
- [ ] Data file plus registration, and typecheck passes
- [ ] Unlock rule, weights and budget costs are set
- [ ] Boss phases (if any) have telegraphs on heavy attacks
- [ ] Placeholder visual + tint chosen
- [ ] SFX ids registered
- [ ] FACTIONS.md updated
- [ ] Playtested (`/play?god&debug`; force a tier with `window.__AXIOM__.ctx.tier = n`)
