# Art direction

## Identity
A dark, quiet world lit almost entirely by the player. **The Unbound** is a luminous cyan-white energy body with faint geometric and atomic line patterns (orbital ellipses, lattice lines) drifting across its surface. Hostile forces read as **warm, material, mechanical**. The Unbound reads as **cool, immaterial, mathematical**. That contrast is both the aesthetic and the readability rule.

Keywords: luminous, geometric, cosmic, silent, melancholic, overwhelming.

## Palette
| Token | Hex | Use |
|---|---|---|
| `void` | `#05070D` | background, fog, sky |
| `ash` | `#1A1F2B` | ground, buildings (low-key) |
| `concrete` | `#3A4152` | props, mid-tones |
| `unbound-core` | `#F2FEFF` | player core (HDR ×4–8 for bloom) |
| `unbound-cyan` | `#5CF2FF` | player aura, beam, UI primary |
| `axiom-violet` | `#9B6BFF` | erasure glitch, Epic rarity, Demiurge accents |
| `hostile-ember` | `#FF5A2E` | **enemy bullets** (core is lighter `#FFD2A8`) |
| `hostile-blood` | `#E0203A` | lasers, telegraph fills, damage flashes |
| `warning-amber` | `#FFB020` | telegraph outlines, artillery markers |
| `axiom-gold` | `#FFE7A3` | Axiom rarity, level-up |

Faction tints (enemy body accents, never bullets): police `#3D6BFF`, swat `#2B3340`, army `#5B6B3A`, armor `#6E6A55`, air `#8A97A8`, society `#C8A040`, aliens `#4DFFB0`, heroes per member, demiurge `#9B6BFF`/white, cosmic shifting hue.

**Readability rules**
1. Enemy bullets are always warm (ember or blood), with a bright core and a dark rim. Nothing else on screen uses that combination.
2. Player effects are always cool (cyan, white, violet).
3. Telegraphs (lasers, artillery, airstrikes) show an amber outline at least 0.6 s before damage.
4. The background stays under 15% luminance, so bloom can never wash out bullets.

## Shaders
All live in `src/game/rendering/shaders/`. See the `shader-vfx` skill for conventions (`uTime`, `uIntensity`, `uColor`, HDR scale).
- **Unbound body:** fresnel rim + scrolling triplanar line pattern (orbitals and lattice) + core emissive HDR. Low HP adds vertex jitter and chromatic split.
- **Aura:** ground ring (SDF circle, soft inner falloff, pulse wave that travels outward on each pulse) + a faint additive fresnel dome.
- **Erasure Beam:** a camera-facing ribbon with an HDR core and a noise-scrolling edge, a charge-up flare at the origin and a spark at the impact point. Width and intensity are uniforms.
- **Erasure dissolve** (enemy erased), in three timed stages:
  1. *freeze* (0.15 s): the enemy stops and flashes white-violet.
  2. *flatten* (0.25 s): the vertex shader squashes it toward the camera plane, and a scanline glitch offsets bands horizontally.
  3. *vanish* (0.3 s): a noise-threshold dissolve with violet edge glow. **No debris and no particles left behind.**
  Implemented as one InstancedMesh variant with a per-instance `aErase` progress attribute.
- **Destruction (aura/props):** classic explosions (warm, debris fragments) contrast with erasure (cold, nothing left).

## Postprocessing
Order: Bloom → ChromaticAberration → Glitch/Noise (conditional) → Vignette → ToneMapping (ACES) → SMAA (quality ≥ high).
- Bloom: mipmap blur, threshold 0.9, intensity 1.2. Only HDR emissives (> 1.0) bloom.
- Hit distortion: chromatic aberration offset spikes in proportion to damage and decays over 0.25 s.
- Low HP (< 30%): animated noise, light glitch, desaturation 30%, red-shifted vignette.
- Quality presets (`config/rendering.ts`): low disables CA and SMAA and uses half-resolution bloom.
- Respect `prefers-reduced-motion`: cap screen shake and glitch intensity at 30%.

## Camera and scale
- About 55° pitch, FOV 40, distance around 30 units. The player is roughly 1.6 units tall. The arena view covers about 40 × 25 units.
- Screen shake is additive trauma (`trauma²`) with a cap. Reduced motion clamps it.

## UI / HUD
- Use the `frontend-design` skill. HUD elements sit at screen edges and never cover the central 60%.
- HP bar labeled **Form** (bottom-left, cyan → ember at low HP), energy bar (beside it), XP bar (thin line at the top), timer + tier + Cycle (top-center), level (top-left).
- Upgrade picker: 3 cards, rarity color frame, icon, name, effect text, stacks owned. Keys 1/2/3.
- **Typefaces** (both are SIL OFL, loaded with `next/font/google`):
  - **Unbounded** for titles, the logo, boss names and tier banners. It is wide and geometric, and its name happens to fit the project.
  - **Chakra Petch** for HUD numbers, labels and buff text. It is technical and angular, and readable at small sizes.

## Cycle tint
Each Cycle rotates the hue of the *world* tokens (`void`, `ash`, `concrete`, fog) by `+40°` (`config/rendering.ts → cycleHueStep`), at low saturation. Cycle 0 is cold blue-gray, Cycle 1 drifts toward teal, Cycle 2 toward dusk violet, and so on. Player tokens, enemy bullet tokens and telegraph tokens are **never** tinted.

## Placeholders policy
Until final assets exist: primitives + shaders only (no textures needed). Enemies are colored low-poly shapes per faction (capsule officers, box vehicles, wedge jets, torus aliens). Placeholder cutscene panels are generated gradient-and-silhouette images or SVGs.

## IP originality checklist
Run this before any new character, enemy, boss, logo, name or panel is merged:
- [ ] The name is not, and is not phonetically close to, any existing character, team, company or product.
- [ ] The silhouette and costume do not reproduce an existing character's (no recognizable emblem, chest symbol, cape plus color combination or helmet).
- [ ] The powers and pattern set are not presented as a direct homage ("like X but…").
- [ ] Colors and logos do not mimic an existing brand or franchise.
- [ ] Copy and lore contain no references or Easter eggs to existing IP.
- [ ] Specifically, the Unbound is **not** a glowing blue nude humanoid with a single hydrogen-atom forehead symbol, or any other trait recognizable from existing comics or film. Our body is abstract and luminous, with distributed lattice lines and no emblem.
- [ ] Assets are self-made, procedurally generated or under a license that permits commercial use (record the source in `public/assets/CREDITS.md`).
