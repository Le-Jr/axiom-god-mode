# Devlog

Newest entries first. Written with the `devlog` skill at the end of every session.

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
