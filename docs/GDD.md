# AXIOM: Game Design Document

## 1. Concept
AXIOM is a top-down/isometric 3D bullet hell with no end. You play a near-omnipotent being. The question is never whether you win but how long you hold out against a world that escalates without limit. The fantasy is power: the screen fills with destruction you cause, while enemy bullet patterns stay readable enough to dodge.

- **Genre:** survivor-style action with a bullet-hell layer and roguelite level-up buffs.
- **Session:** one continuous run until death. There is no victory. Completing Cycle 1 triggers a "Transcendence" interstitial and records the best Cycle reached, which is the main long-term goal. A first Cycle is tuned to take about 25 minutes.
- **Platform:** desktop browser (latest Chrome, Edge, Firefox and Safari) with mouse and keyboard. Gamepad is in the backlog. Touch/mobile is out of scope.

## 2. Story
- **Setup:** a routine experiment at a remote research facility. The quantum containment field fails. The lead researcher is disintegrated.
- **Reassembly:** the researcher's pattern reassembles as **The Unbound**, a being of light that the laws of physics no longer bind.
- **Escalation:** the Unbound wakes in the ruins. Every power on Earth responds, then powers beyond Earth, and finally the **Demiurge**, the architect of reality's rules, followed by **cosmic entities** older than it.
- **Cycle:** after the cosmic tier, reality "re-axiomatizes". The world resets with stronger rules, and the response begins again, harder.
- **Tone:** epic, cosmic, slightly melancholic. The Unbound never speaks. Melancholy comes from the silence of the cutscene, the fading identity, and enemies being *erased* rather than killed.
- **The researcher** is Dr. Aren Vael, a quantum-containment physicist, and is never named on screen during the intro. Narrative payoff: each Cycle transition shows one recovered **memory fragment** (a single panel and one line of text, reusing the cutscene player). The fragments slowly reveal who Aren was and hint that the Demiurge allowed the accident.

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

Key rebinding is in the backlog. Input goes through an action map (`config/input.ts`) from day one, so rebinding is just a UI later. Right mouse is reserved for a future active ability.

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
- The resource is an **energy pool**, not heat. Draining to 0 stops the beam, which needs `beam.minEnergyToFire` (25%) to restart. That pause is the "overheat" moment, and it is easier to read than a separate heat gauge.
- **The beam erases props too.** Props hit by the beam vanish with the erasure dissolve and leave no debris. The aura *destroys* them physically, with fragments. Both grant XP.

### 5.4 Health
- Very large but finite HP (for example 5,000, set in config). Enemy bullets deal small chip damage, so the threat is volume.
- Hits cause chromatic aberration and distortion pulses scaled by damage.
- Below `lowHpThreshold` (30%), visuals destabilize (glitch, desaturation, vignette) and the music shifts to unstable stems.
- **No passive HP regen.** Healing comes only from buffs (Shield Regen, Densified Form) and rare heal orbs dropped by bosses.
- **No i-frames for chip damage**, because volume is the threat. **Heavy hits** (≥ 5% max HP, always telegraphed) grant 0.5 s of invulnerability, so overlapping artillery can't chain-delete the player.

### 5.5 Enemy bullet patterns
Spreads, rings, spirals, homing shots, lasers (telegraphed), artillery (ground markers), airstrikes (line telegraphs). Each faction has a pattern vocabulary; see [FACTIONS.md](FACTIONS.md). Telegraphs are mandatory for anything that deals 5% or more of max HP.

### 5.6 Leveling and buffs
- XP comes from erasures (by enemy tier) and destruction (by prop size). Orbs drift to the player inside `pickupRadius`.
  XP comes as **physical orbs**, because collecting them creates movement decisions. Orbs merge above the pool soft cap.
- Level-up **pauses the simulation** and offers 3 random buffs weighted by rarity. Full catalog: [UPGRADES.md](UPGRADES.md).
- The XP curve lives in `config/progression.ts`: `xpToNext(level) = base * level^exponent`.
- **Rerolls:** the player starts with 1 reroll and earns +1 every 10 levels (max 3 stored). Banish and skip-for-heal are not in v1 (backlog).

### 5.7 WaveDirector
- An infinite director driven by a budget. Every tick it accrues a spawn budget (scaled by time, level and Cycle) and spends it on unlocked faction units.
- Faction tiers unlock by **time and level** (both conditions). Bosses spawn at tier transitions.
- After the cosmic tier, **Cycle N+1** begins: multipliers on HP, damage, density and pattern complexity, plus remixed faction combos. See [FACTIONS.md](FACTIONS.md#cycles).
- It must run forever: fixed-size pools, no unbounded arrays, no growing timers.

### 5.8 Destructible environment
- Procedural chunks (facility, then city blocks) stream around the player.
- Props have HP and break, burn or collapse into **pooled fragments** that fade out. Destruction grants XP and feeds music intensity.
- **Biomes**, which share one chunk generator with different prop sets: *facility* (tiers 1–2) → *city* (tiers 3–5) → *occult district* (tiers 6–7) → *fractured reality* (tiers 8–10, floating slabs and geometry artifacts). Later Cycles reuse the same biomes with a tint shift (see ART_DIRECTION).

## 6. Win / lose
- **Lose:** HP reaches 0. Game-over screen with time survived, Cycle/tier reached, erasures, level and build summary.
- **Win:** there is none. The run is endless.
- **There is no meta-progression in v1.** Every run starts equal, which keeps balance clean. **Local records** (best time, best Cycle, most erasures) are stored in localStorage (try/catch). An online leaderboard is in the backlog.

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
