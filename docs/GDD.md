# AXIOM: Game Design Document

## 1. Concept
AXIOM is a top-down/isometric 3D bullet hell with no end. You play a near-omnipotent being. The question is never whether you win but how long you hold out against a world that escalates without limit. The fantasy is power: the screen fills with destruction you cause, while enemy bullet patterns stay readable enough to dodge.

- **Genre:** survivor-style action with a bullet-hell layer and roguelite level-up buffs.
- **Session:** one continuous run until death. `TODO(decision)` Is there any target run length or "victory" milestone, for example surviving Cycle 1?
- **Platform:** desktop browser with mouse and keyboard. `TODO(decision)` Gamepad support? Touch/mobile?

## 2. Story
- **Setup:** a routine experiment at a remote research facility. The quantum containment field fails. The lead researcher is disintegrated.
- **Reassembly:** the researcher's pattern reassembles as **The Unbound**, a being of light that the laws of physics no longer bind.
- **Escalation:** the Unbound wakes in the ruins. Every power on Earth responds, then powers beyond Earth, and finally the **Demiurge**, the architect of reality's rules, followed by **cosmic entities** older than it.
- **Cycle:** after the cosmic tier, reality "re-axiomatizes". The world resets with stronger rules, and the response begins again, harder.
- **Tone:** epic, cosmic, slightly melancholic. The Unbound never speaks. Melancholy comes from the silence of the cutscene, the fading identity, and enemies being *erased* rather than killed.
- `TODO(decision)` Does the researcher have a name or a backstory beyond the intro? Any hint of narrative payoff in later Cycles?

## 3. Core loop
```
move & dodge → aura shreds nearby → channel beam to erase targets → collect XP
    ↑                                                                ↓
 harder waves ← WaveDirector escalates ← pick 1 of 3 buffs ← level up
```
Seconds-scale: dodge patterns, position the aura, aim the beam, manage energy.
Minutes-scale: level-ups shape a build, and tier transitions bring bosses.
Run-scale: push through tiers into Cycles, chasing the deepest Cycle and time.

## 4. Controls
| Input | Action |
|---|---|
| WASD | Move (hover, 8-directional, camera-relative) |
| Mouse | Aim (cursor projected onto the ground plane) |
| Left mouse (hold) | Channel the Erasure Beam |
| Space | Blink (only with the Blink buff), skip cutscene |
| Esc | Pause / skip cutscene |
| 1 / 2 / 3 or click | Choose a buff on level-up |
| F3 | Debug overlay (FPS, entities, draw calls) |

`TODO(decision)` Is the key rebinding UI in scope? Right mouse is free; candidate for a future active ability.

## 5. Mechanics

### 5.1 Camera and movement
- Fixed angled top-down camera (around 55° pitch, perspective with a narrow FOV) that follows the player with critically damped smoothing. No rotation, which keeps patterns readable.
- Gameplay happens on the **XZ plane**. Height is visual only (hover bob, jets at altitude), so collision is 2D.
- The player hovers with acceleration and deceleration from `config/player.ts`. No collision with props: the Unbound passes through them, and the aura breaks them.

### 5.2 Aura (passive)
- A pulsing radius around the player. Each pulse damages enemies and props inside it.
- Stats: `radius`, `damagePerPulse`, `pulseInterval`, all upgradable.
- Visual: a ground ring plus a fresnel shell that brightens on each pulse. Audio: a hum whose pitch rises with player level.

### 5.3 Erasure Beam (active)
- Hold the left mouse button. A beam channels from the player toward the cursor up to `beam.range`.
- There is a **charge** phase (`beam.chargeTime`), then **channel**, then a **tail** on release.
- Targets accumulate *erasure* while hit. At their threshold they are **erased**: they freeze, flatten into a glitching silhouette, then dissolve. No debris, no corpse. A "reality tear" sound plays.
- Resource: **Energy** drains while channeling and recharges after `beam.rechargeDelay`.
- `TODO(decision)` Pure energy pool, or heat with an overheat lockout? (The vision says "energy/heat".) Default plan: energy pool. At 0 the beam stops and needs `beam.minEnergyToFire` to restart.
- Beam vs. props: does the beam destroy props too, or only the aura? Default plan: the beam erases props as well. `TODO(decision)`

### 5.4 Health
- Very large but finite HP (for example 5,000, set in config). Enemy bullets deal small chip damage, so the threat is volume.
- Hits cause chromatic aberration and distortion pulses scaled by damage.
- Below `lowHpThreshold` (30%), visuals destabilize (glitch, desaturation, vignette) and the music shifts to unstable stems.
- `TODO(decision)` Is there passive HP regen without the Shield Regen buff? Are there invulnerability frames after hits?

### 5.5 Enemy bullet patterns
Spreads, rings, spirals, homing shots, lasers (telegraphed), artillery (ground markers), airstrikes (line telegraphs). Each faction has a pattern vocabulary; see [FACTIONS.md](FACTIONS.md). Telegraphs are mandatory for anything that deals 5% or more of max HP.

### 5.6 Leveling and buffs
- XP comes from erasures (by enemy tier) and destruction (by prop size). Orbs drift to the player inside `pickupRadius`.
  `TODO(decision)` Physical XP orbs, or instant XP? Default plan: orbs, since they create movement decisions.
- Level-up **pauses the simulation** and offers 3 random buffs weighted by rarity. Full catalog: [UPGRADES.md](UPGRADES.md).
- The XP curve lives in `config/progression.ts`: `xpToNext(level) = base * level^exponent`.
- `TODO(decision)` Rerolls or banish? Skip-for-heal?

### 5.7 WaveDirector
- An infinite director driven by a budget. Every tick it accrues a spawn budget (scaled by time, level and Cycle) and spends it on unlocked faction units.
- Faction tiers unlock by **time and level** (both conditions). Bosses spawn at tier transitions.
- After the cosmic tier, **Cycle N+1** begins: multipliers on HP, damage, density and pattern complexity, plus remixed faction combos. See [FACTIONS.md](FACTIONS.md#cycles).
- It must run forever: fixed-size pools, no unbounded arrays, no growing timers.

### 5.8 Destructible environment
- Procedural chunks (facility, then city blocks) stream around the player.
- Props have HP and break, burn or collapse into **pooled fragments** that fade out. Destruction grants XP and feeds music intensity.
- `TODO(decision)` Chunk biomes per tier, for example military base, desert or orbital? Default plan: facility → city for Cycle 1, with remixed palettes later.

## 6. Win / lose
- **Lose:** HP reaches 0. Game-over screen with time survived, Cycle/tier reached, erasures, level and build summary.
- **Win:** there is none. The run is endless.
- `TODO(decision)` Meta-progression between runs (unlocks, permanent stats)? Local high scores? Online leaderboard?

## 7. Progression summary
| Layer | Driver | Rewards |
|---|---|---|
| Moment | Dodging, aiming | Survival, XP |
| Level | XP | 1 of 3 buffs |
| Tier | Time + level | New faction, boss, music intensity |
| Cycle | Clearing the cosmic tier | Multipliers, remixes, Cycle counter |

## 8. Cycle scaling
For Cycle `c` (starting at 0), with initial values in `config/cycle.ts`:
- `hpMult = cycle.hpBase ^ c` (start 1.6)
- `dmgMult = cycle.dmgBase ^ c` (start 1.3)
- `densityMult = min(1 + cycle.densityStep * c, perf cap)`. Density is capped by [PERFORMANCE.md](PERFORMANCE.md) budgets. Above the cap, difficulty moves into HP and pattern complexity.
- `patternComplexity = c`. Emitters read this to add arms, bullets and speed variants.
- Player buffs carry over into the new Cycle. Level and XP keep accumulating.
