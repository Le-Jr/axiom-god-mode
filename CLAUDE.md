# AXIOM

An infinite 3D "god mode" bullet hell that runs in the browser. You play **The Unbound**, a researcher who was disintegrated in a quantum containment failure and came back as a luminous being. You erase everything the world sends at you, and the world keeps escalating forever: police → SWAT → army → armor → air → secret societies → aliens → heroes → the Demiurge → cosmic entities → a new Cycle with harder scaling.

**Status:** Phase 0 (knowledge base) is done. No game code exists yet. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack
- Next.js (App Router, latest) + TypeScript `strict` + Tailwind (HUD/UI only), **pnpm**
- three.js through `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- zustand for **low-frequency** game/meta state only
- Our own `AudioManager` on the Web Audio API
- Custom sphere/ray collision on a spatial hash grid. No physics engine for combat.
- Vitest for unit tests of pure simulation code

## Commands
```bash
pnpm install
pnpm dev          # dev server, http://localhost:3000
pnpm build        # production build; must pass with zero TS/ESLint errors
pnpm lint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
```
(Phase 1 creates these scripts.)

## Folder map
```
src/
  app/            # routes: / (menu), /play
  game/
    core/         # GameLoop (fixed timestep), Time, EventBus, events.ts, Rng
    ecs/          # World, component stores, System interface
    systems/      # movement, collision, damage, spawning, aura, beam, projectiles, destruction
      patterns/   # bullet emitter implementations (spread, ring, spiral, ...)
    entities/     # player, enemy archetypes, projectiles (SoA pool), props
    factions/     # data-driven faction/tier/boss definitions
    waves/        # WaveDirector
    upgrades/     # buff definitions, rarity, stacking, synergies
    rendering/    # instanced pools, VFX, shaders, postprocessing
    audio/        # AudioManager, adaptive music, SFX registry
    cutscene/     # panel cutscene player
    config/       # ALL tunables
  ui/             # HUD, upgrade picker, pause, game over (React + Tailwind)
  store/          # zustand stores
public/assets/{audio,textures,models,cutscene}
```

## Non-negotiable rules
1. **Original IP only.** Never reference, name or imitate an existing character, comic, film, game or brand, in code, assets, copy or comments. Check new designs against the list in [ART_DIRECTION.md](docs/ART_DIRECTION.md#ip-originality-checklist).
2. **The simulation lives outside React.** The game loop must never set React state per frame. `useFrame` only copies simulation data into three.js objects. HUD values reach the DOM through the HUD bridge (see ARCHITECTURE), never through per-frame `setState`.
3. **Pool everything.** No `new` and no array or closure allocation in per-tick or per-frame code. Anything numerous uses `InstancedMesh`.
4. **All balance numbers live in `src/game/config/`.** No magic numbers in systems.
5. **The canvas is client-only.** Load it with `dynamic(() => import(...), { ssr: false })`.
6. **Systems communicate through the EventBus.** Do not import one system into another.
7. **The game is never silent.** Procedural placeholders cover any missing audio asset.
8. Every `localStorage` access is wrapped in `try/catch`.
9. Unresolved design questions are marked `TODO(decision)`. Do not invent answers.

## Definition of done
- `pnpm typecheck`, `pnpm lint`, `pnpm build` and `pnpm test` all pass with zero errors.
- The feature runs in `pnpm dev`. The F3 overlay shows no FPS regression against the [PERFORMANCE.md](docs/PERFORMANCE.md) budgets.
- No new per-frame allocations or React re-renders. Check with the React Profiler and the Memory panel when touching hot paths.
- The relevant docs are updated in the same commit (GDD, FACTIONS, UPGRADES, AUDIO, ...).
- The `devlog` skill has run: DEVLOG, ROADMAP checkboxes and DECISIONS are updated.
- The work is committed at the end of the phase.

## Docs
| Doc | Purpose |
|---|---|
| [docs/GDD.md](docs/GDD.md) | Game design: concept, story, loop, controls, mechanics, progression |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Systems, ECS, loop, events, state ownership, rendering, data flow |
| [docs/FACTIONS.md](docs/FACTIONS.md) | Faction tiers, units, patterns, bosses, unlocks, Cycle remix |
| [docs/UPGRADES.md](docs/UPGRADES.md) | Buff catalog, rarity, stacking, synergies, template |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Palette, shaders, VFX, postprocessing, IP checklist |
| [docs/AUDIO.md](docs/AUDIO.md) | Music stems, SFX list, mixing, asset drop locations |
| [docs/CUTSCENE.md](docs/CUTSCENE.md) | Intro panel script and JSON schema |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Budgets, pooling rules, profiling checklist |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases with checkboxes and backlog |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADR log |
| [docs/DEVLOG.md](docs/DEVLOG.md) | Dated session log |

## Skills (`.claude/skills/`)
Use the matching skill before you start the task.

| Skill | Use when |
|---|---|
| [r3f-performance](.claude/skills/r3f-performance/SKILL.md) | Writing any rendering code |
| [ecs-system](.claude/skills/ecs-system/SKILL.md) | Adding a system or component |
| [bullet-pattern](.claude/skills/bullet-pattern/SKILL.md) | Creating enemy bullet patterns |
| [faction-authoring](.claude/skills/faction-authoring/SKILL.md) | Adding a faction, enemy archetype or boss |
| [upgrade-authoring](.claude/skills/upgrade-authoring/SKILL.md) | Adding a buff |
| [shader-vfx](.claude/skills/shader-vfx/SKILL.md) | Writing shaders and effects |
| [audio-sfx](.claude/skills/audio-sfx/SKILL.md) | Adding sounds or music stems |
| [balance-tuning](.claude/skills/balance-tuning/SKILL.md) | Changing any number |
| [devlog](.claude/skills/devlog/SKILL.md) | End of every session |
| [frontend-design](.claude/skills/frontend-design/SKILL.md) | Menu, HUD and UI screens (official Anthropic skill) |
| [webapp-testing](.claude/skills/webapp-testing/SKILL.md) | Driving the running game with Playwright for screenshots and console checks (official Anthropic skill) |
