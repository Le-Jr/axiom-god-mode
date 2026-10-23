---
name: r3f-performance
description: Use when writing or reviewing ANY rendering code in AXIOM — R3F components, useFrame callbacks, InstancedMesh pools for bullets/enemies/fragments/orbs, materials/geometries, postprocessing, or anything that could allocate per frame or trigger React re-renders.
---

# R3F performance rules (AXIOM)

The simulation owns state. Rendering only copies it into three.js objects. Budgets are in `docs/PERFORMANCE.md`.

## Steps
1. **Decide the render path.**
   - More than ~20 of a kind (bullets, enemies of one archetype, fragments, XP orbs) → `InstancedMesh` pool. Use `templates/InstancedPool.tsx`.
   - Unique or few (player, boss, ground) → regular mesh, still with no per-frame allocation.
2. **Create geometry and materials once.** Use module scope or `useMemo` with `[]` deps. Share them across instances. Dispose them on unmount (`useEffect` cleanup) when not shared globally.
3. **Write a single `useFrame` per pool** that reads `runtime.ctx` (from `@/game/core/runtime`; null-check it, since there is no run between mounts) and the sim source (SoA pool or ECS store) and writes `instanceMatrix` (plus `instanceColor` or custom attributes), sets `mesh.count = active`, and flags `needsUpdate`.
4. **Interpolate** with `time.alpha`: `x = prevX + (x - prevX) * alpha`. The sim stores `prevX` and `prevZ`.
5. **No React state in the loop.** Never call `setState` or store setters inside `useFrame`. Mount and unmount components only on phase changes.
6. **Set `frustumCulled = false`** on pools: instances span the arena and the bounding sphere would be wrong.
7. **Register debug counters.** Write `ctx.debug.counts.<pool> = active` (read by the F3 overlay).

## Conventions
- File: `src/game/rendering/pools/<Kind>Pool.tsx`. Shaders go in `src/game/rendering/shaders/` (see the `shader-vfx` skill).
- Scratch objects live at module level: `const _m = new Matrix4(), _p = new Vector3(), _q = new Quaternion(), _s = new Vector3(1,1,1)`.
- `useFrame((state, dt) => ..., priority)`. Priorities: −1000 DebugProbe reset → −100 LoopDriver (sim) → 0 render pools → 1 EffectComposer → 10 DebugProbe read. Never use another positive priority (it changes who renders).
- Inside `useFrame`, mutate materials/geometries **through the mesh ref** (`(ref.current.material as ShaderMaterial).uniforms...`, `ref.current.geometry.getAttribute(...)`), never through the `useMemo` variable: the React Compiler lint rule `react-hooks/immutability` rejects mutating memoized values after render.
- Use the `state` argument of `useFrame` (`state.camera`, `state.gl`), not values captured from `useThree`, when mutating three.js objects.
- Canvas (`src/game/GameCanvas.tsx`): `flat`, `gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}`, `dpr={[1, quality.maxDpr]}`. Add new scene content as children there.
- Read the quality preset from `config/rendering.ts`, never hardcode it.

## Forbidden in `useFrame` and tick code
`new Vector3/Matrix4/Color/...`, array or object literals, `.map/.filter/.forEach` with closures, template strings, `setState`, `useStore` setters, creating materials, `geometry.clone()`, `scene.add/remove` (use `count` and visibility instead), `console.log`.

## Template
See `templates/InstancedPool.tsx`.

## Checklist
- [ ] Geometry and material are created once and disposed on unmount
- [ ] One `useFrame` per pool, with no allocations inside (search the callback for `new `, `[`, `{`, `=>`)
- [ ] `mesh.count` is set to the active count, and `needsUpdate` is set only when it changed
- [ ] `frustumCulled = false` on instanced pools
- [ ] Interpolation uses `alpha`
- [ ] The debug counter is updated
- [ ] React Profiler shows 0 commits during gameplay
- [ ] Draw calls are still within budget (F3)
