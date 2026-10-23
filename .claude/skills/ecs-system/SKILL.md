---
name: ecs-system
description: Use when adding or changing a simulation system or ECS component in AXIOM (src/game/systems, src/game/ecs) — covers file location, phase ordering, registration, EventBus usage, allocation rules and unit tests.
---

# Adding a system or component

Background: `docs/ARCHITECTURE.md` §3–§6. The ECS is a minimal sparse-set ECS. Numerous things (bullets, fragments) are **not** ECS entities; they live in SoA pools (`src/game/entities/*Pool.ts`).

## Steps: component
1. Define the data shape in `src/game/ecs/components/<name>.ts`: a plain interface plus a `reset` function and a factory. Use numbers, not nested objects.
2. Register the store in `src/game/ecs/components/index.ts` (`export const Health = defineComponent<HealthData>('Health', create, reset)`).
3. Component instances are pooled by the store. Never keep references after `destroy`.

## Steps: system
1. Create `src/game/systems/<name>System.ts` from `templates/system.ts`.
2. Pick a `phase` from: `input | director | ai | player | projectiles | collision | damage | destruction | progression | cleanup`.
3. Read tunables from `ctx.config.<area>`. **No magic numbers.** Add new values to `src/game/config/` (see the `balance-tuning` skill).
4. Communicate with other systems through `ctx.bus.emit('event:name', payload)` only. If the event is new, add it to `src/game/core/events.ts` **and** the table in `docs/ARCHITECTURE.md` §6.
5. Register the system in `src/game/systems/index.ts` (the array order inside a phase matters).
6. Write `src/game/systems/__tests__/<name>System.test.ts` from `templates/system.test.ts`.
7. If the system subscribes to events, unsubscribe in `dispose`.

## Rules
- `update` is allocation-free: use preallocated scratch objects and reuse event payloads (`_payload.amount = x; bus.emit('player:damaged', _payload)`).
- Listeners must not store a payload reference; copy primitives instead.
- Use `ctx.rng`, never `Math.random()`. Use `dt` (the fixed step) times `ctx.time.timeScale`.
- Destroy entities via `world.destroy(e)`, which is deferred to `cleanup`, never mid-iteration.
- Don't import other systems. Shared math goes in `src/game/core/math.ts`.

## Checklist
- [ ] The file is in `systems/`, the correct phase is set, and it's registered in `systems/index.ts`
- [ ] All numbers come from `config/`
- [ ] New events are added to `events.ts` and ARCHITECTURE §6
- [ ] There are no allocations in `update`
- [ ] `dispose` unsubscribes listeners
- [ ] There is a unit test and `pnpm test` passes
- [ ] Docs are updated if behavior is player-visible (GDD)
