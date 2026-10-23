# Devlog

Newest entries first. Written with the `devlog` skill at the end of every session.

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
