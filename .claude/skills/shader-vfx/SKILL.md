---
name: shader-vfx
description: Use when writing or changing shaders, materials or visual effects in AXIOM — the Unbound body, aura, Erasure Beam, erasure dissolve, telegraphs, explosions, hit distortion, postprocessing, and bloom-friendly HDR colors and uniform conventions.
---

# Shaders and VFX

Visual rules (palette, readability, effect stages) are in `docs/ART_DIRECTION.md`. Read it first.

## Conventions
- Location: `src/game/rendering/shaders/<name>/` containing `<name>.vert.glsl`, `<name>.frag.glsl` (imported as strings; Phase 1 configures a raw loader), and `<name>Material.ts` exporting a factory.
- Uniform names: `uTime` (seconds, sim time), `uIntensity` (0..1+), `uColor` (linear `Color`), `uHdr` (emissive multiplier), `uProgress` (0..1 for timed effects), `uResolution`. Prefix varyings with `v` and attributes with `a`.
- **HDR for bloom:** only things that should glow exceed 1.0. Multiply the color by `uHdr` (player core 6, beam core 5, bullets 3, telegraphs 1.5, world ≤ 1). Set `toneMapped: false` on emissive materials, and let the post chain tone-map.
- Per-instance variation uses `InstancedBufferAttribute` (`aProgress`, `aSeed`, `aTint`). Never use one material per instance.
- Update uniforms in the pool's existing `useFrame` (no extra callbacks), and write `material.uniforms.uTime.value` directly.
- Additive effects: `blending: AdditiveBlending, depthWrite: false, transparent: true`.
- Use cheap noise (hash-based value noise). Avoid textures unless necessary. Keep fragment cost low because effects cover large areas.
- Low-HP and hit distortion belong in **postprocessing** (driven by `vfxBridge.hitPulse`, `vfxBridge.instability`), not in every material.
- Respect `prefers-reduced-motion` and quality presets (`config/rendering.ts`).

## Steps
1. Find the effect in ART_DIRECTION (stages, colors). If it isn't there, add it first.
2. Copy `templates/material.ts` and write GLSL with the uniforms above.
3. Hook it to the sim through a bridge value or event (`enemy:erased` → set `aProgress` start time in the instanced attribute).
4. Verify bloom. Effects that should glow must glow, and enemy bullets must stay distinguishable from player FX.
5. Check the cost: GPU frame time in the Performance panel at 2,000 bullets. Draw calls must not increase per instance.

## Checklist
- [ ] Palette tokens from ART_DIRECTION, warm for enemies and cool for the player
- [ ] Uniform naming follows the conventions
- [ ] Instanced attributes, not per-instance materials
- [ ] `toneMapped: false` and HDR applied only to glowing parts
- [ ] Disposed on unmount
- [ ] Reduced-motion and quality presets respected
- [ ] Erasure leaves no debris (by design)
