---
name: devlog
description: Use at the END of every AXIOM work session (and before each phase commit) to update docs/DEVLOG.md, tick docs/ROADMAP.md checkboxes, append ADRs to docs/DECISIONS.md, and verify CLAUDE.md/docs are in sync with the code.
---

# Devlog (end of session)

## Steps
1. **Gather facts:** `git status`, `git diff --stat`, and `git log --oneline` since the last DEVLOG entry. Don't write from memory.
2. **DEVLOG.md:** prepend an entry from `templates/entry.md` (newest first) with today's date (absolute, `YYYY-MM-DD`). Include the perf numbers if you measured any (machine, browser, bullets, FPS).
3. **ROADMAP.md:** tick only items that are done and verified (build green, works in `npm run dev`). Add newly discovered work to the backlog.
4. **DECISIONS.md:** append an ADR for every architectural or library choice made this session (next `ADR-NNN`). Supersede old ADRs rather than editing them.
5. **TODO(decision):** if the user resolved any, replace the marker in the docs with the answer and note it in DEVLOG. List any new ones.
6. **Sync check:** if folders, commands, rules or skills changed, update `CLAUDE.md` (keep it under 150 lines). Keep the ARCHITECTURE event table in sync with `core/events.ts`.
7. **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build` (Phase 1+). Record failures honestly in DEVLOG.
8. **Commit** (at the end of a phase, or when asked): `git add -A && git commit -m "<phase>: <summary>"`.

## Checklist
- [ ] DEVLOG entry with date, built, decisions, perf, issues and next
- [ ] ROADMAP ticks reflect verified reality
- [ ] New ADRs appended
- [ ] TODO(decision) list updated
- [ ] CLAUDE.md and docs in sync
- [ ] Verification commands run and results recorded
- [ ] Committed
