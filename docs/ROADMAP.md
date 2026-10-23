# Roadmap

## Phase 0: Knowledge base
- [x] CLAUDE.md and docs/ (GDD, ARCHITECTURE, FACTIONS, UPGRADES, ART_DIRECTION, AUDIO, CUTSCENE, PERFORMANCE, ROADMAP, DECISIONS, DEVLOG)
- [x] Official skills installed (frontend-design, webapp-testing)
- [x] Project skills created (9)
- [x] `.claude/settings.json` permissions
- [x] User approval of Phase 0; all `TODO(decision)` items resolved (ADR-012)
- [x] Styled README and push to GitHub

## Phase 1: Scaffold
- [ ] Next.js (App Router) + TS strict + Tailwind + ESLint, with npm (`package-lock.json` committed)
- [ ] R3F, drei, postprocessing, zustand, vitest installed
- [ ] Folder structure per CLAUDE.md; exclude `.claude/` (skill templates) from tsconfig and ESLint
- [ ] `core/`: GameLoop (fixed timestep, interpolation, pause), Time, EventBus + `events.ts`, Rng
- [ ] `ecs/`: World, ComponentStore, System interface + unit tests
- [ ] zustand stores: `useGameStore`, `useSettingsStore` (persist with try/catch)
- [ ] Routes: `/` menu → `/play` (client-only canvas via `dynamic(..., { ssr: false })`)
- [ ] Empty scene: ground plane, fog, camera rig, postprocessing chain
- [ ] F3 debug overlay (FPS, frame/sim ms, entity counts, draw calls)
- [ ] `npm run build` / `lint` / `typecheck` / `test` green; commit

## Phase 2: Player and powers
- [ ] The Unbound body shader (placeholder)
- [ ] Input snapshot, WASD movement, cursor ground ray, camera follow
- [ ] Aura system + ground ring shader + pulse
- [ ] Erasure Beam: charge/channel/tail, energy resource, ray collision
- [ ] Erasure dissolve effect (freeze → flatten/glitch → vanish) on test dummies
- [ ] HUD: HP and energy bars via the HUD bridge
- [ ] Procedural audio placeholders: aura hum, beam, erase tear
- [ ] Docs synced; devlog; commit

## Phase 3: Combat loop
- [ ] SoA ProjectilePool + instanced bullet renderer
- [ ] Spatial hash grid + collision system + tests
- [ ] Pattern emitters: aimed, spread, ring, spiral (+ tests)
- [ ] Police + SWAT factions (data) + enemy instanced renderer
- [ ] WaveDirector v1 (budget, tier unlock by time and level)
- [ ] Damage, erasure, aura kills, player hits → screen distortion
- [ ] XP orbs, leveling, 3-choice picker with ~8 buffs
- [ ] Game over screen with run stats
- [ ] Stress test results (`?stress=bullets`) logged
- [ ] **STOP and report**: perf numbers, decisions, next steps

## Later-phase backlog
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
