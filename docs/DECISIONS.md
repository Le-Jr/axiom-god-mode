# Decisions (ADR log)

Format: `ADR-NNN — Title` · date · status (Accepted / Superseded by ADR-x / Proposed) · Context → Decision → Consequences. Append only; supersede rather than edit.

---

### ADR-001: Next.js App Router + R3F with a client-only canvas
2026-10-23 · Accepted
- **Context:** The vision mandates Next.js, TS strict, Tailwind and R3F.
- **Decision:** `/` is a plain React menu, and `/play` loads `GameCanvas` via `dynamic(..., { ssr: false })`. Tailwind is used for DOM UI only.
- **Consequences:** No WebGL code runs on the server. The menu loads fast without three.js in its bundle.

### ADR-002: The simulation lives outside React; zustand only for low-frequency state
2026-10-23 · Accepted
- **Context:** No per-frame React re-renders allowed, while 2,000+ bullets run at 60 FPS.
- **Decision:** The sim is plain TS objects and typed arrays. R3F `useFrame` copies state into three.js objects. HUD values go through a mutable `hudBridge` read on a throttle and written to DOM refs. zustand holds the phase, level-up choices and settings only.
- **Consequences:** Two ways to read state (bridge vs. store) that must stay documented (ARCHITECTURE §7).

### ADR-003: Fixed 60 Hz timestep with render interpolation, driven from `useFrame`
2026-10-23 · Accepted
- **Decision:** An accumulator loop with `MAX_FRAME_DT = 0.25` and `MAX_SUBSTEPS = 5`, plus interpolation `alpha`, driven by one `useFrame` at priority −100 (single rAF). `timeScale` supports hit-stop and time dilation.
- **Consequences:** Deterministic, frame-rate-independent gameplay. Seeded RNG makes runs reproducible.

### ADR-004: Hybrid data model, a minimal ECS plus SoA pools for numerous things
2026-10-23 · Accepted
- **Context:** A full ECS library adds overhead and dependencies. Bullets dominate entity counts.
- **Decision:** A home-grown sparse-set ECS for player, enemies, props and pickups. Projectiles, fragments and particles use dedicated struct-of-arrays typed-array pools outside the ECS.
- **Consequences:** Hot loops stay cache-friendly and allocation-free. Two iteration styles to learn, covered by the `ecs-system` and `r3f-performance` skills.

### ADR-005: 2D collision on the XZ plane with a uniform spatial hash
2026-10-23 · Accepted
- **Decision:** All combat collision is circle/circle and segment/circle on XZ. The grid is rebuilt every tick in flat Int32Array linked lists. Height is cosmetic (jets, hover).
- **Consequences:** Simple and fast. Air units collide via their ground projection (see the FACTIONS open question).

### ADR-006: Typed synchronous EventBus with reused payloads
2026-10-23 · Accepted
- **Decision:** `bus.on/off/emit` with a typed `GameEvents` map in `core/events.ts`. High-frequency payloads are reused objects, so listeners must not retain them.
- **Consequences:** Zero allocation per emit. Systems are decoupled. There is a risk of listeners storing payloads, which the `ecs-system` checklist covers.

### ADR-007: Web Audio AudioManager, no howler.js for now
2026-10-23 · Accepted
- **Context:** howler is allowed but would duplicate what we need from raw Web Audio (stems, spatial, buses, procedural synthesis).
- **Decision:** A single custom AudioManager on Web Audio with buses, pooled voices, PannerNode spatialization and procedural fallbacks.
- **Consequences:** One less dependency and full control. Codec fallback (Safari) is handled manually.

### ADR-008: Balance data as typed TS modules, content as data files
2026-10-23 · Accepted
- **Decision:** `src/game/config/*.ts` exports typed `as const` objects (type-checked, tree-shaken, hot-reloadable). Faction and upgrade definitions are TS data modules. Only the cutscene and music manifests are JSON under `public/` (loaded at runtime).
- **Consequences:** Typos fail at compile time. Non-programmers edit TS literals (acceptable for now).

### ADR-009: Vitest for unit tests
2026-10-23 · Accepted
- **Decision:** Vitest for pure sim modules (ECS, EventBus, grid, patterns, stacking, director, Cycle math). Playwright (via the `webapp-testing` skill) for visual and console checks.

### ADR-010: External skills installed
2026-10-23 · Accepted
- **Sources checked:** `github.com/anthropics/skills` (commit `dbd4588`, 2026-10-09) and the `claude-plugins-official` marketplace (already configured).
- **Installed into `.claude/skills/`** (copied from anthropics/skills; Apache-2.0; SKILL.md and scripts reviewed):
  - `frontend-design`: distinctive menu, HUD and upgrade-picker design. Instructions only, no scripts.
  - `webapp-testing`: Playwright-driven screenshots and console capture of the running game. Contains `scripts/with_server.py` (starts the given server command, waits for the port, runs a command; no network or other side effects) and example scripts. Requires Python + Playwright locally.
- **Skipped:** `algorithmic-art`, `canvas-design`, `theme-factory`, `web-artifacts-builder` (aimed at standalone artifacts, not a Next.js game), `docx/pdf/pptx/xlsx`, `brand-guidelines` (Anthropic's brand), `internal-comms`, `slack-gif-creator`, `mcp-builder`, `claude-api`, `doc-coauthoring`, `skill-creator` (useful but available globally as a plugin skill; not needed in-repo). Marketplace plugins: `typescript-lsp` and `playwright` look useful but are user-level plugins, so they were left for the user to opt into rather than auto-installed. This was confirmed in ADR-012: the repo stays self-contained, and contributors may install those plugins individually.

### ADR-011: Package manager is pnpm
2026-10-23 · Superseded by ADR-014
- **Note:** On this machine, corepack failed to fetch pnpm 12.15.0 (`Cannot find module .../pnpm.cjs`). Phase 1 must fix this first (e.g. `corepack enable && corepack prepare pnpm@latest --activate`, or `npm i -g pnpm`) and pin `packageManager` in `package.json`.

### ADR-012: Resolution of the Phase 0 open design questions
2026-10-23 · Accepted
- **Context:** Phase 0 left 24 `TODO(decision)` items. The user delegated them: "decide whatever makes the most sense for the project".
- **Decision:** guided by three priorities: readability of the bullet hell, a power fantasy without frustration, and a small v1 scope.
  | Area | Decision |
  |---|---|
  | Beam resource | Energy pool; re-arm at 25% after emptying (no heat gauge) |
  | Beam vs. props | The beam erases props (no debris); the aura destroys them (fragments) |
  | HP | No passive regen; no i-frames for chip damage; 0.5 s i-frames after telegraphed heavy hits |
  | XP | Physical orbs, merged above the soft cap |
  | Picker | 1 reroll at start, +1 per 10 levels (max 3); pity after 4 all-Common offers; no banish or skip in v1 |
  | Synergies | Auto-activate with a toast and HUD icon; cards show "completes: X" |
  | Typefaces | Unbounded (titles) + Chakra Petch (HUD), both OFL |
  | Reference machine | i5-1135G7 / Iris Xe, 16 GB, Chrome, 1080p, DPR 1.5 |
  | Victory | None. A "Transcendence" interstitial at the end of Cycle 1; best Cycle recorded |
  | Platform | Desktop KB+M on the latest Chrome/Edge/Firefox/Safari; gamepad in the backlog; no mobile |
  | Rebinding | Action map from day one, UI later; right mouse reserved |
  | Story | Researcher Dr. Aren Vael; one memory fragment panel per Cycle transition |
  | Mini-bosses | SWAT: Breach Captain; army: Siege Colonel |
  | Boss fights | Regular spawns continue at 40% budget |
  | Air units | The aura deals 50% damage to them; the beam deals full damage |
  | Heroes | Boss team "the Meridian Compact": Rhune, Velt, Moraine, Tessaly; regular units are generic augments |
  | Demiurge | No control inversion; axioms change the world, never the input |
  | Cycle bosses | +1 phase per Cycle, capped at +2 |
  | Cycle palette | World hue rotates 40° per Cycle; player and bullet colors fixed |
  | Biomes | facility → city → occult district → fractured reality |
  | Meta-progression | None in v1; local records only; online leaderboard in the backlog |
  | Cutscene | First-person captions; click advances, Space/Esc skips |
  | Audio formats | .ogg + .m4a fallback (Safari supported) |
  | Music sourcing | Procedural first; final stems self-produced or commissioned under a commercial license, recorded in CREDITS.md |
  | Plugins | No user-level plugins required; the repo stays self-contained |
- **Consequences:** The docs now carry these answers in place of the markers. New values (`beam.minEnergyToFire`, `director.bossBudgetScale`, `aura.airDamageScale`, `upgrades.pityAfter`, `rendering.cycleHueStep`) must be created in `config/` during the relevant phase.

### ADR-013: GitHub remote
2026-10-23 · Accepted
- **Decision:** The canonical repository is `https://github.com/Le-Jr/axiom-god-mode` (remote `origin`, branch `main`).

### ADR-014: Package manager is npm (replaces pnpm)
2026-10-23 · Accepted
- **Context:** pnpm was never a hard requirement. Corepack failed to install it on the dev machine (ADR-011), and the project gains nothing from pnpm's disk and speed benefits at this size.
- **Decision:** Use **npm** (bundled with Node 22; npm 10.9 on the dev machine). Commit `package-lock.json`, use `npm ci` in CI, and use `npx` for one-off tools. Pin `"engines": { "node": ">=22" }` in `package.json`.
- **Consequences:** Zero extra setup for contributors. Commands are `npm run <script>`. Docs, skills and `.claude/settings.json` permissions were updated accordingly.

### ADR-015: Next.js 16 `cacheComponents` disabled
2026-10-23 · Accepted
- **Context:** `create-next-app` (Next 16.4) enables `cacheComponents` and `partialPrefetching`. With `cacheComponents`, Next keeps previously visited routes alive inside React `<Activity mode="hidden">` instead of unmounting them.
- **Decision:** Keep it off. The app has no server data to cache, and a hidden-but-mounted `/play` would keep a WebGL context and the game route alive after quitting to the menu.
- **Consequences:** Plain App Router semantics: leaving `/play` unmounts the canvas, and `endRun()` disposes the run. Revisit only if server-side features appear (leaderboard).

### ADR-016: Run lifecycle through a `runtime` singleton; queries are prebuilt objects
2026-10-23 · Accepted
- **Decision:** `core/runtime.ts` holds `{ ctx, loop }` for the single live run (`startRun`/`endRun`, called from `GameCanvas`'s effect, StrictMode-safe). Render components read `runtime.ctx` inside `useFrame` and null-check it. ECS queries are `Query` objects created once (`world.query(A, B)`) and filled each tick with `collect()` into a preallocated `Int32Array`, instead of generators (which allocate an iterator per call).
- **Consequences:** No React context plumbing for per-frame reads, and no per-tick allocation in queries. Only one run can exist at a time, which is by design.

### ADR-017: Draw-call accounting across postprocessing passes
2026-10-23 · Accepted
- **Decision:** `gl.info.autoReset = false` (set in `onCreated`). `DebugProbe` resets at useFrame priority −1000 and reads at +10, after the EffectComposer's render at +1, so F3 shows totals for the whole multi-pass frame.
- **Consequences:** Any code that calls `gl.render` outside this window is counted in the next frame. No other component may use a positive priority besides the composer (1) and the probe (10).

### ADR-018: GLSL as TypeScript template strings
2026-10-23 · Accepted
- **Decision:** Shaders live in `<name>.glsl.ts` modules exporting `/* glsl */` strings, instead of `.glsl` files that need a raw loader under Turbopack.
- **Consequences:** Zero bundler config. Editor GLSL highlighting comes from the `/* glsl */` tag. The `shader-vfx` skill is updated.

### ADR-019: Tooling versions
2026-10-23 · Accepted
- **Decision:** Next 16.4.3 (Turbopack), React 19.3, three 0.186, R3F 9.8, drei 10.7, @react-three/postprocessing 3.2 + postprocessing 6.39, zustand 5, Tailwind 4 (via `@tailwindcss/turbopack`), TypeScript 5.9 (not 7.x; Next's type-check pipeline uses the TS JS API), ESLint 9 (`eslint-config-next` flat config), Vitest 5 with native `resolve.tsconfigPaths`.
- **Consequences:** R3F 9.8 peer-limits React to `<19.4`, so upgrade React only together with R3F. R3F still uses the deprecated `THREE.Clock`, which logs a console warning that is harmless and not ours.

### ADR-020: Hit buffer between producers and the damage system; beam kills erase, other kills destroy
2026-10-23 · Accepted
- **Decision:** All damage goes through `ctx.hits` (a preallocated SoA `HitBuffer`: target, amount, kind). The `damage` system drains it once per tick. `HitKind.beam` kills add the `Erasing` component (no debris; `erasureSystem` destroys the entity after freeze + flatten + vanish), while other kinds emit `enemy:killed` and destroy at once. Targets keep a `flash` timer for hit feedback.
- **Consequences:** One place for HP rules (i-frames, heavy hits and Cycle damage multipliers go here in Phase 3). Order-independent producers.

### ADR-021: Procedural audio first, voice accounting by timer
2026-10-23 · Accepted
- **Decision:** Every SFX id has a Web Audio recipe. Loops (aura hum, beam) are long-lived handles. Voice limits per id and globally are tracked with counters that a `setTimeout` releases after the recipe duration. Spatial sounds use a `PannerNode` positioned relative to the player. The AudioContext is created when `/play` mounts (sticky user activation from the menu click) and resumed on the first gesture as a fallback.
- **Consequences:** The game is never silent with zero assets. One-shot nodes are created per play (inherent to Web Audio). This is acceptable because plays are event-rate, not per-tick.

### ADR-022: Sandbox dummies until the WaveDirector exists
2026-10-23 · Accepted
- **Decision:** `sandboxSystem` (director phase, `config/sandbox.ts`) keeps 16 static, erasable `Target` dummies around the player. It is disabled once the Phase 3 director lands.

### ADR-023: Mutate three.js objects through refs inside `useFrame`
2026-10-23 · Accepted
- **Context:** `eslint-config-next` 16 ships the React Compiler rule `react-hooks/immutability`, which rejects mutating `useMemo` values after render.
- **Decision:** Create materials and geometries with `useMemo` (for disposal), but inside `useFrame` reach them through the mesh ref (`ref.current.material`, `ref.current.geometry`). Documented in the `r3f-performance` skill.

