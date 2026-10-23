---
name: audio-sfx
description: Use when adding or changing any sound effect, music track or music stem in AXIOM — SFX registry entries, event→sound mapping, pitch/volume variation, voice limits, spatial setup, procedural fallbacks, stem manifests and the docs/AUDIO.md spec.
---

# Audio and SFX

Spec: `docs/AUDIO.md` (graph, stems, intensity, mixing). All playback goes through `AudioManager`. **Systems never play audio.** They emit events, and `src/game/audio/listeners.ts` maps events to sounds.

## Steps: SFX
1. Pick an id: `snake_case`, grouped by prefix (`beam_`, `erase_`, `explosion_`, `fire_<faction>_`, `ui_`).
2. Add a registry entry in `src/game/audio/sfxRegistry.ts` (see `templates/sfxEntry.ts`): files, volume, `pitchVar`, `volVar`, `maxVoices`, `priority`, `spatial`, `bus`.
3. Add a **procedural fallback recipe** in `src/game/audio/sfxRecipes.ts`. This is required, because the game must never be silent.
4. Map the triggering event in `audio/listeners.ts`. Throttle high-frequency events (`projectile:fired`) per id per tick.
5. Drop files at `public/assets/audio/sfx/<id>.ogg` or `<id>_1.ogg, <id>_2.ogg` (round-robin). 48 kHz, peak −6 dBFS, trimmed silence.
6. Record the source and license in `public/assets/CREDITS.md`.
7. Add a row to the SFX table in `docs/AUDIO.md`.

## Steps: music stems
1. Add the folder `public/assets/audio/music/<trackId>/` with `track.json` plus `<trackId>_<stem>.ogg` for each stem in `ambient, perc, orch, guitar, choir`.
2. All stems must have identical length, be bar-aligned and loop seamlessly. BPM goes in the manifest.
3. Register the track for a tier or boss in `config/audio.ts` (`tierTracks`, `bossTracks`).
4. Missing stems fall back to the procedural stem automatically. Verify by removing one file.

## Rules
- Voices are pooled. Never create nodes per play beyond the one-shot `AudioBufferSourceNode`.
- Spatial sounds pass world `x, z`. The listener is at the player.
- Don't duplicate the same id within one tick.
- Volumes are read from `useSettingsStore` (try/catch-persisted).

## Checklist
- [ ] Registry entry, with variation and voice limit set
- [ ] Procedural fallback recipe added
- [ ] Event mapping added and throttled if frequent
- [ ] Files named correctly, CREDITS.md updated
- [ ] AUDIO.md table updated
- [ ] Tested by ear: no clipping when 20+ instances fire at once
