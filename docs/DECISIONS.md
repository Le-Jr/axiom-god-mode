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
