# Audio

All audio goes through `src/game/audio/AudioManager.ts` (Web Audio API). Systems never play sounds directly. They emit events, and `audio/listeners.ts` maps events to sounds. Add sounds with the `audio-sfx` skill.

## Graph
```
SFX voices ─┐
            ├─► sfxBus (Gain) ─┐
UI voices ──┘                  ├─► master (Gain) ─► DynamicsCompressor (limiter) ─► destination
Music stems ─► musicBus (Gain) ┘
              └─ low-HP filter (BiquadFilter lowpass, sweeps at low HP)
```
- The AudioContext is created and resumed on the first user gesture (menu click).
- Volumes for master, music, sfx and ui persist via `useSettingsStore` (localStorage wrapped in try/catch, so failures fall back to defaults).

## Music: adaptive stems
**Direction:** epic orchestral (strings, brass, choir, taiko) with overdriven electric guitar underneath.

### Stems
| Stem id | Content | Enters at intensity |
|---|---|---|
| `ambient` | pads, drones, sparse piano/strings | always (≥ 0) |
| `perc` | taiko, toms, low hits | ≥ 0.25 |
| `orch` | strings ostinato, brass | ≥ 0.45 |
| `guitar` | overdriven rhythm guitar | ≥ 0.65 |
| `choir` | choir, high brass | ≥ 0.85 or boss |

### File spec
- Path: `public/assets/audio/music/<trackId>/<trackId>_<stemId>.ogg` (plus a `.m4a` fallback). `TODO(decision)` Is Safari support required? If so, ship m4a as well.
- 48 kHz, stereo, OGG Vorbis q6 (around 192 kbps). All stems of a track have **identical length**, start on the downbeat and loop seamlessly with no tail. Bake reverb tails into the loop start.
- The manifest `public/assets/audio/music/<trackId>/track.json`:
```json
{ "id": "cycle_theme", "bpm": 120, "beatsPerBar": 4, "bars": 32,
  "loopStart": 0, "loopEnd": 64.0,
  "stems": ["ambient", "perc", "orch", "guitar", "choir"] }
```
- Planned tracks: `menu`, `facility` (tiers 1–3), `war` (4–5), `occult` (6–7), `ascension` (8–9), `cosmic` (10), plus a `boss_*` per boss. `TODO(decision)` Sourcing: commissioned, self-made or licensed?

### Intensity mapping
Recomputed at 10 Hz, smoothed (attack 0.5 s, release 3 s):
```
intensity = clamp01(
    0.45 * norm(activeEnemies, 0, perf.enemySoftCap)
  + 0.20 * norm(activeBullets, 0, 1500)
  + 0.15 * tierProgress
  + 0.20 * (bossActive ? 1 : 0)) 
lowHp → +0.15 and enables the musicBus lowpass sweep + detuned "unstable" layer
```
Each stem's gain crossfades over 2 s toward `stemGain(intensity)`. Track changes on tier transitions are quantized to the next bar.

### Procedural placeholders
Until real stems exist, `audio/procedural/` synthesizes each stem live with oscillators and noise. Placeholder stems: ambient = detuned saw pad + lowpass, perc = noise bursts + sine kicks on a sequencer, orch = square ostinato, guitar = distorted saw (WaveShaper), choir = formant-filtered saws. **The game must never be silent:** any missing file falls back to its procedural stem.

## SFX
| id | Trigger event | Variation | Voice limit | Spatial |
|---|---|---|---|---|
| `aura_hum` | continuous loop | pitch = base × 2^(level/24) | 1 | no |
| `aura_pulse` | `aura:pulse` | ±5% pitch | 2 | no |
| `beam_charge` | `beam:start` | — | 1 | no |
| `beam_loop` | channel loop | slight LFO | 1 | no |
| `beam_tail` | `beam:stop` | ±4% | 1 | no |
| `beam_empty` | `beam:empty` | — | 1 | no |
| `erase_tear` | `enemy:erased` | ±8% pitch, ±2 dB | 6 | yes |
| `explosion_s/m/l` | `enemy:killed`, `prop:destroyed` by size | ±10% pitch, ±3 dB | 8/4/2 | yes |
| `impact_player` | `player:damaged` | ±6% | 4 | no |
| `fire_<faction>_<kind>` | `projectile:fired` (throttled) | ±7% | 6 per id | yes |
| `telegraph_warn` | laser/artillery/airstrike telegraph | — | 3 | yes |
| `boss_intro` | `boss:spawned` | — | 1 | no |
| `levelup_stinger` | `player:levelUp` | — | 1 | no |
| `ui_hover` / `ui_select` / `ui_back` | UI | ±3% | 2 | no |
| `lowhp_heartbeat` | while low HP | — | 1 | no |

- Files: `public/assets/audio/sfx/<id>[_<n>].ogg`. Multiple numbered files are round-robined. A missing file falls back to a procedural synth recipe in `audio/sfxRecipes.ts`.
- Registry: `audio/sfxRegistry.ts` (id → files, volume, pitchVar, volVar, maxVoices, priority, spatial, bus).

## Mixing rules
- Voice limiting per id: when full, steal the oldest voice of the same id. Low-priority sounds are dropped rather than stolen when the global voice count exceeds 48.
- Spatial: `PannerNode` (equalpower, inverse rolloff, refDistance 8). The listener follows the camera target (the player), not the camera.
- Ducking: during `levelup_stinger` and `boss_intro`, the music ducks −6 dB for 1 s. While the game is paused, the music lowpasses to 800 Hz.
- Headroom: master limiter at −1 dBFS. SFX peak normalized to −6 dBFS before import.
- Never play more than one instance of the same id in the same tick (dedupe).

## Asset drop locations
```
public/assets/audio/
  music/<trackId>/track.json, <trackId>_<stem>.ogg
  sfx/<id>.ogg | <id>_1.ogg, <id>_2.ogg ...
public/assets/CREDITS.md   # source + license for every asset
```
