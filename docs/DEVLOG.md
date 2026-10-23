# Devlog

Newest entries first. Written with the `devlog` skill at the end of every session.

---

## 2026-10-23: Phase 3, combat loop
**Built**
- `core/SpatialHash` (hashed uniform grid, stamp dedupe), `entities/projectiles/ProjectilePool` and `entities/XpOrbPool` (packed SoA), and `GameContext` gains `projectiles`, `orbs`, `grid`, `stats`, `progress`, `flags` and `tier`.
- Emitters `aimed`/`spread`/`ring`/`spiral` with bursts and Cycle complexity; `stepEmitter`; `fireBullet` (soft cap, Cycle damage).
- Factions as data: **police** (Officer, Riot Line, Patrol Car) and **SWAT** (Breacher, Marksman, Shield Unit, Armored Van), each with simplifications listed in FACTIONS. Archetype registry. `spawnEnemy` (Cycle HP, tint, desynced emitters).
- Systems: `waveDirector` (budget, tier unlock by time AND level, tier decay, off-screen ring spawns, soft cap), `ai` (chase/keepDistance/strafe, separation, despawn, firing, death patterns on kills only), `grid`, `projectiles`, `satellites`, `collision` (bullets + contact vs player), `damage` (player branch: heavy-hit i-frames, `player:damaged`/`player:died`), `xp` (orbs, magnet, level-ups), `upgrades` (choice/reroll), `stress`.
- 8 buffs (`aura_radius`, `aura_damage`, `beam_energy`, `beam_recharge`, `beam_pierce`, `max_hp`, `satellites`, `move_speed`), derived stats, rarity-weighted rolls with pity and rerolls.
- Rendering: `EnemyPool` ×3 mesh kinds (per-instance tint and dissolve), `BulletPool` (billboard sprites, 1 draw call), `OrbPool`, `Satellites`, and PostFX hit chromatic aberration plus low-HP noise and vignette.
- UI: level-up picker (1/2/3, R reroll), game over (stats, local records, Enter to retry on the same canvas), HUD XP line and tier name. `useRecordsStore` is persisted with try/catch.
- Audio: `fire_generic`, `impact_player`, `levelup_stinger`, `ui_select` (procedural, throttled).
- Flags: `?god`, `?stress=bullets`, `?debug` (`window.__AXIOM__`), `?seed=N`.
- Tests: 70 (new: spatial hash, pools, emitters + bursts, upgrades/stats/rolls/pity, player damage/i-frames/death/god, AI firing, death pattern vs erasure, orb pickup, level-up/reroll/pick flow, pierce, satellites, director unlocks/soft cap).

**Verification**
- `typecheck`, `lint`, `test` (70/70) and `build` are all green.
- Playwright on the prod build (RTX 5060, ANGLE/Vulkan):
  - 25 s of scripted play: enemies spawned and fired, and erasures and kills dropped orbs.
  - Forced level-up: picker shown, reroll consumed, pick applied, sim resumed.
  - Forced damage: HP 5,400 → 3,500, and the chromatic-aberration pulse was visible.
  - Forced death: the game-over screen showed and Enter restarted cleanly.
  - No console errors.
- Bug found by testing and fixed: the loop kept running the remaining substeps of a frame after a level-up or death paused it (ADR-029).

**Perf** (dev desktop: Ryzen 7 5700X · RTX 5060 · headless Chromium/Vulkan · 1600×900 · quality medium; the reference laptop is not measured yet)
| Scenario | Bullets | Enemies | FPS avg / 1% low | Sim ms | Draw calls |
|---|---|---|---|---|---|
| `?stress=bullets` | 2,474 | 300 | 60 / 60 (vsync) | 0.2–0.5 | 25 |
| `?stress=bullets`, CPU 4× throttled | 2,474 | 300 | 60 / 57 | 0.8–2.2 | 25 |
| normal play at 25 s | ~60 | 35 | 60 / 58 | < 0.1 | 26 |

**Balance log** (initial values, all new)
- director: base 1.4 budget/s + 1.1 per minute, bank 30, spawn ring 20–27, tier decay 0.6.
- XP: `5 * level^1.35`. Officer 2 XP, Riot 4, Car 5, Breacher/Marksman 6, Shield 8, Van 15.
- Bullets: pellet 0.16 r, orb 0.28, needle 0.11, shell 0.36. Cull at 48 u.

**Decisions:** ADR-024 (collision per pair type), ADR-025 (emitter split), ADR-026 (upgrade flow, restart on same canvas), ADR-027 (run flags, debug hook), ADR-028 (combat render pools), ADR-029 (mid-frame pause).

**Issues / debt**
- Not yet measured on the reference laptop. No 30-minute soak run yet.
- Scripted play showed early XP is slow if the player doesn't walk over orbs (pickup radius 3.5). Watch it in real playtests.
- SWAT simplifications (no laser telegraph, frontal block or van deploy) and no mini-bosses yet.
- A single `fire_generic` SFX id for all factions.
- R3F 9.8 logs the `THREE.Clock` deprecation warning (not ours).

**TODO(decision):** none new.

**Next**
- User review of Phases 1–3. Then the backlog: destructible environment, remaining factions and bosses, Cycles, synergies, adaptive music, intro cutscene, settings menu.

---

## 2026-10-23: Phase 2, player and powers
**Built**
- Config: `player`, `aura`, `beam` (+ `erasure` stage timings), `input` action map, `sandbox`, `audio`. `GameConfig` is now a widened type, so tests can patch values.
- Core: `rawInput`/`InputState`, `HitBuffer`, `math.ts` (`rayCircle`, `damp`), and `GameContext` gains `input`, `hits` and `player`.
- Components: `Player` (aim, energy, beam state machine, aura timer), `Target`, `Erasing`. `Health` gains `iframes`.
- Systems: `input`, `history` (prev positions), `sandbox` (16 dummies), `playerMovement` (camera-relative WASD with exponential accel and aim), `aura` (pulse), `beam` (charge → channel → tail; energy drain/recharge/lockout; first-target trace), `damage`, `erasure`, `hud`.
- Rendering: `InputBinder` (keys, fire, cursor ground ray), the Unbound (additive lattice shader + HDR core + hover), the aura ring shader with a pulse wave, the Erasure Beam ribbon shader (always on top) with origin and impact sparks, and the instanced `TargetPool` with the 3-stage erasure dissolve (freeze → flatten/scanline glitch → violet noise dissolve). The calibration beacon was removed.
- Audio: `AudioManager` (buses, limiter, pause duck, voice limits, spatial), procedural recipes, registry, per-run event listeners.
- UI: HUD (Form/Energy bars, level, timer) refreshed at 20 Hz via refs. Energy shows amber when locked out.
- Tests: 34 (new: rayCircle, movement, aura, beam charge/erase/no-pierce/lockout/re-arm, dissolve removal).

**Verification**
- `typecheck`, `lint`, `test` (34/34) and `build` are green.
- Playwright (prod build, RTX 5060 via ANGLE/Vulkan): moved, swept the beam for about 4 s. Energy went 100 → 27 → 90 after recharge, erasures were visible, 60 FPS (1% low 58), 26 draw calls, no console errors (only R3F's `THREE.Clock` deprecation warning).
- Fix found by that test: tall ruins occluded the beam, so beam materials now use `depthTest: false`.

**Decisions:** ADR-020 (hit buffer, erase vs kill), ADR-021 (procedural audio), ADR-022 (sandbox dummies), ADR-023 (mutate via refs).

**Issues / debt**
- Player damage, i-frames and screen distortion arrive with enemy bullets (Phase 3).
- `TargetPool` draws every target with one capsule mesh. Phase 3 needs one pool per archetype.
- The visible "sim ms" in F3 rounds to 0.00 at this load.

**Next**
- Phase 3: projectile pool, spatial hash, emitters, police + SWAT, WaveDirector v1, player damage, XP/level-up picker with 8 buffs, game over, stress test.

---

## 2026-10-23: Phase 1, scaffold
**Built**
- Next 16.4 App Router project (npm, TS strict, Tailwind 4, ESLint 9 flat config, Vitest 5). `AGENTS.md` is generated by Next.
- `game/core`: fixed-timestep `GameLoop` (accumulator, clamp, substep cap, pause bitmask, alpha), `Time`, typed `EventBus` + exhaustive `events.ts`, seeded `Rng`, `GameContext`, the `runtime` singleton, `hudBridge`/`debugBridge`, `createTestContext`.
- `game/ecs`: generational `Entity`, sparse-set `ComponentStore` with pooled component objects, `World` with deferred destroy, allocation-free `Query`, the `System` interface with phase ordering, and Transform/Velocity/Health components.
- `game/config`: loop, performance caps, rendering (palette, quality presets, camera, postfx, world), debug.
- Stores: `useGameStore` (phase, run id, pause), `useSettingsStore` (volumes, quality, reduced motion, debug, intro flag) persisted through try/catch `safeStorage`.
- Routes: `/` menu (Unbounded + Chakra Petch, orbit art, Play), `/play` → `PlayClient` → `dynamic(GameCanvas, { ssr: false })`.
- Scene: fog, ground, drei infinite grid, 140 instanced placeholder ruins (1 draw call), a calibration beacon (HDR bloom check), a follow camera rig, and the PostFX chain (Bloom → CA → Vignette → ACES ToneMapping → SMAA on high).
- F3 debug overlay (FPS, 1% low, frame/sim ms, substeps, draw calls, triangles, GPU memory, pool counts, listeners), refreshed at 4 Hz straight to the DOM. Esc pause overlay.
- 22 unit tests (EventBus, Rng, GameLoop, World/ECS, stores).

**Verification**
- `npm run typecheck`, `npm run lint`, `npm run test` (22/22) and `npm run build` are all green.
- Playwright smoke test (headless Chromium, prod build): menu → Play → canvas renders, F3 overlay shows stats, Esc pauses and resumes, menu → /play again shows 0 leaked listeners. No console errors; the only warning is R3F's `THREE.Clock` deprecation (ADR-019).

**Perf** (dev desktop, not the reference laptop: Ryzen 7 5700X, RTX 5060, headless Chromium via ANGLE/Vulkan, 1600×900, quality medium)
| Scenario | Bullets | Enemies | FPS avg / 1% low | Sim ms | Draw calls |
|---|---|---|---|---|---|
| empty scene | 0 | 0 | 60 / 60 (vsync) | ~0 | 24 |
- On SwiftShader (CPU), the same scene ran at about 8 FPS, which only confirms that WebGL fallback renders. Real budget checks need the reference machine (PERFORMANCE.md) once there is load (Phase 3 stress test).

**Decisions:** ADR-015 (cacheComponents off), ADR-016 (runtime singleton + Query objects), ADR-017 (draw-call accounting), ADR-018 (GLSL in TS), ADR-019 (tooling versions).

**Issues / debt**
- `npm run typecheck` runs without Next's generated types, so the layout uses an explicit `{ children: ReactNode }` instead of the global `LayoutProps`.
- Placeholder ruins are static and not yet destructible (later phase).

**TODO(decision):** none new.

**Next**
- Phase 2: the Unbound shader, input + movement, aura, Erasure Beam + dissolve, HP/energy HUD, procedural audio placeholders.

---

## 2026-10-23: Switch to npm
**Built**
- Replaced pnpm with npm in CLAUDE.md, README, ROADMAP, the skills and `.claude/settings.json`.

**Decisions:** ADR-014 (npm replaces pnpm; ADR-011 superseded).

**Issues:** the corepack/pnpm problem is no longer blocking.

**Next**
- Phase 1 (scaffold) with npm.

---

## 2026-10-23: Phase 0 approved, decisions resolved, README
**Built**
- Resolved all 24 `TODO(decision)` items across the GDD, FACTIONS, UPGRADES, ART_DIRECTION, AUDIO, CUTSCENE and PERFORMANCE docs (summary table in ADR-012).
- Added a styled `README.md` with an SVG banner (`docs/assets/banner.svg`).
- Added the `origin` remote (github.com/Le-Jr/axiom-god-mode) and pushed `main`.

**Decisions:** ADR-012 (design decisions), ADR-013 (GitHub remote).

**TODO(decision):** resolved: all 24. New: none.

**Next**
- Phase 1 (scaffold).

---

## 2026-10-23: Phase 0, knowledge base
**Built**
- CLAUDE.md and the full docs set: GDD, ARCHITECTURE, FACTIONS, UPGRADES, ART_DIRECTION, AUDIO, CUTSCENE, PERFORMANCE, ROADMAP, DECISIONS, DEVLOG.
- Installed the official skills `frontend-design` and `webapp-testing` from anthropics/skills.
- Created 9 project skills: r3f-performance, ecs-system, bullet-pattern, faction-authoring, upgrade-authoring, shader-vfx, audio-sfx, balance-tuning, devlog.
- `.claude/settings.json` with dev command permissions.
- Initialized the git repo (`main`).

**Decisions:** ADR-001 to ADR-011.

**Issues**
- Corepack can't download pnpm 12.15.0 on this machine. Fix it before Phase 1 (ADR-011).

**Next**
- User reviews Phase 0 and resolves the `TODO(decision)` items, then Phase 1 (scaffold).
