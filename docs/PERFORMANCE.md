# Performance

**Target:** 60 FPS with **2,000+ active enemy bullets** on a mid-range laptop The **reference machine** is a laptop with an Intel Core i5-1135G7 and Iris Xe integrated graphics, 16 GB RAM, Chrome stable, a 1080p display and DPR capped at 1.5. It is the weakest common "mid-range" target. If that hardware isn't available, the closest machine on hand is used and noted in DEVLOG.

## Budgets (per frame at 60 FPS = 16.6 ms)
| Item | Budget |
|---|---|
| Simulation tick (all systems) | ≤ 4 ms at 2,000 bullets + 300 enemies |
| Collision (grid rebuild + queries) | ≤ 1.5 ms of the above |
| Render CPU (useFrame copies + three.js) | ≤ 4 ms |
| GPU frame | ≤ 8 ms |
| Draw calls | ≤ 150 (target ~60) |
| Triangles | ≤ 500k |
| Postprocessing passes | ≤ 6 |

## Entity caps (in `config/performance.ts`)
| Pool | Capacity | Soft cap (director stops adding) |
|---|---|---|
| Enemy projectiles | 4,096 | 2,500 |
| Player projectiles / satellites | 256 | — |
| Enemies | 512 | 300 |
| Props (active chunks) | 1,024 | — |
| Fragments | 2,048 | 1,500 |
| Particles (GPU) | 8,192 | — |
| XP orbs | 512 | merge orbs above 400 |
| Audio voices | 48 | — |

## Memory
- JS heap must be **flat** over a 30-minute soak (growth < 5 MB after warm-up). GC pauses must not cause visible hitches (no major GC > 8 ms).
- GPU memory ≤ 256 MB textures and geometry.
- Listener count, pool usage and ECS entity counts are reported in the F3 overlay. They must return to baseline after `run:end`.

## Pooling rules
1. Every pool is preallocated at run start with fixed capacity. When full, the spawn is **dropped** (and counted in debug). Pools never grow mid-run.
2. Numerous things are SoA (typed arrays), with a free list (Int32Array stack) and a dense active list for iteration.
3. Despawn swaps the slot with the last active slot (O(1)), and render iteration covers `[0, activeCount)`.
4. No `new Vector3()`, `[]`, `{}`, `.map/.filter/.forEach` with closures, string concatenation, or `Array.prototype.push` on unbounded arrays in tick or frame code. Use module-level scratch objects.
5. Events reuse payload objects. Listeners copy what they need.
6. three.js: geometries and materials are created once per kind, shared, and disposed on unmount. Never create materials in render.
7. Audio: AudioBuffers are decoded once. Voices are pooled `AudioBufferSourceNode`s (sources are one-shot, so the wrapper and gain/panner chain are pooled instead).

## React rules
- No component re-renders while the game is playing, except on phase changes and level-up. Verify with the React Profiler: recording 10 s of gameplay must show zero commits.
- `useFrame` callbacks never call `setState`, and never call store setters per frame.
- The HUD reads `hudBridge` in its own throttled rAF/interval and writes to `ref.current.style` or `textContent`.

## Profiling checklist
- [ ] F3 overlay: FPS (1 s avg + 1% low), frame ms, sim ms, draw calls (`gl.info.render.calls`), triangles, active counts per pool, dropped spawns.
- [ ] Stress scene: `/play?stress=bullets` spawns 2,500 bullets in rings and 300 enemies. Record FPS.
- [ ] Chrome Performance panel, 10 s capture: no long tasks > 50 ms, and GC slices are small.
- [ ] Memory panel: 3 heap snapshots 5 min apart in a run show no growth in retained `Vector3`/`Object`/`Array` counts.
- [ ] React Profiler: zero commits during steady gameplay.
- [ ] `gl.info.memory` geometries/textures are stable across tier changes.
- [ ] Test at DPR 1 and 2, and with quality presets low/high.
- [ ] Log the results in DEVLOG with the machine and browser.
