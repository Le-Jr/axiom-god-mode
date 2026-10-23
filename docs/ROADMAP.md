# Roadmap

## Phase 0: Knowledge base
- [x] CLAUDE.md and docs/ (GDD, ARCHITECTURE, FACTIONS, UPGRADES, ART_DIRECTION, AUDIO, CUTSCENE, PERFORMANCE, ROADMAP, DECISIONS, DEVLOG)
- [x] Official skills installed (frontend-design, webapp-testing)
- [x] Project skills created (9)
- [x] `.claude/settings.json` permissions
- [x] User approval of Phase 0; all `TODO(decision)` items resolved (ADR-012)
- [x] Styled README and push to GitHub

## Phase 1: Scaffold
- [x] Next.js (App Router) + TS strict + Tailwind + ESLint, with npm (`package-lock.json` committed)
- [x] R3F, drei, postprocessing, zustand, vitest installed
- [x] Folder structure per CLAUDE.md; exclude `.claude/` (skill templates) from tsconfig and ESLint
- [x] `core/`: GameLoop (fixed timestep, interpolation, pause), Time, EventBus + `events.ts`, Rng
- [x] `ecs/`: World, ComponentStore, System interface + unit tests
- [x] zustand stores: `useGameStore`, `useSettingsStore` (persist with try/catch)
- [x] Routes: `/` menu → `/play` (client-only canvas via `dynamic(..., { ssr: false })`)
- [x] Empty scene: ground plane, fog, camera rig, postprocessing chain
- [x] F3 debug overlay (FPS, frame/sim ms, entity counts, draw calls)
- [x] `npm run build` / `lint` / `typecheck` / `test` green; commit

## Phase 2: Player and powers
- [x] The Unbound body shader (placeholder)
- [x] Input snapshot, WASD movement, cursor ground ray, camera follow
- [x] Aura system + ground ring shader + pulse
- [x] Erasure Beam: charge/channel/tail, energy resource, ray collision
- [x] Erasure dissolve effect (freeze → flatten/glitch → vanish) on test dummies
- [x] HUD: HP and energy bars via the HUD bridge
- [x] Procedural audio placeholders: aura hum, beam, erase tear
- [x] Docs synced; devlog; commit

## Phase 3: Combat loop
- [x] SoA ProjectilePool + instanced bullet renderer
- [x] Spatial hash grid + collision system + tests
- [x] Pattern emitters: aimed, spread, ring, spiral (+ tests)
- [x] Police + SWAT factions (data) + enemy instanced renderer
- [x] WaveDirector v1 (budget, tier unlock by time and level)
- [x] Damage, erasure, aura kills, player hits → screen distortion
- [x] XP orbs, leveling, 3-choice picker with ~8 buffs
- [x] Game over screen with run stats
- [x] Stress test results (`?stress=bullets`) logged
- [x] **STOP and report**: perf numbers, decisions, next steps

## Later-phase backlog
- [ ] Breach Captain / Siege Colonel mini-bosses; SWAT mechanics deferred in Phase 3 (Marksman laser telegraph, Shield frontal block, Van deploy)
- [ ] Per-faction weapon SFX ids (currently `fire_generic`)
- [ ] Measure on the reference laptop (Iris Xe) and run the 30-minute soak
- [ ] Destructible environment: procedural facility/city chunks, prop HP, pooled fragments, fire
- [ ] Remaining factions: army, armor, air, society, aliens, heroes, demiurge, cosmic
- [ ] Bosses: Tank Commander, Squadron Leader, Grand Master, Alien Mothership, Hero Team, The Demiurge, Cosmic Entity
- [ ] Remaining emitters: homing, laser, artillery, airstrike, wave, burst; telegraphs
- [ ] Cycle system: multipliers, remixes, pattern complexity
- [ ] Full buff catalog + synergies
- [ ] Adaptive music stem system + intensity mapping; real stem drop-in
- [ ] Full SFX registry, spatial audio, voice limiting
- [ ] Intro cutscene player + placeholder panels
- [ ] Low-HP instability (postFX + music)
- [ ] Pause menu, settings (volumes, quality, reduced motion)
- [ ] 30-minute soak test (memory flat)
- [ ] Quality presets and auto-detect
- [ ] Local records (best time, best Cycle, most erasures)
- [ ] Memory fragments at Cycle transitions
- [ ] Rerolls and pity timer in the upgrade picker
- [ ] Later: gamepad, key rebinding UI, banish, online leaderboard (mobile is out of scope)
