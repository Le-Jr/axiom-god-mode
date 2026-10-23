# Factions

All numbers are **initial values**. The source of truth is `src/game/factions/*.ts` and `src/game/config/`. Add or edit factions with the `faction-authoring` skill and keep this doc in sync.

HP values are in player-damage units. The base beam erases around 300 HP/s, and the base aura deals around 40 per pulse. Speeds are in world units per second (the player moves at about 9).

## Tier ladder (Cycle 0)
| # | Tier id | Unlock (time AND level) | Boss on entry | Spawn budget weight |
|---|---|---|---|---|
| 1 | `police` | 0:00, L1 | — | 1.0 |
| 2 | `swat` | 1:30, L4 | *mini-boss* **Breach Captain** | 1.3 |
| 3 | `army` | 3:30, L8 | *mini-boss* **Siege Colonel** | 1.7 |
| 4 | `armor` | 5:30, L12 | **Tank Commander** | 2.2 |
| 5 | `air` | 7:30, L16 | **Squadron Leader** | 2.8 |
| 6 | `society` | 10:00, L20 | **Grand Master** | 3.5 |
| 7 | `aliens` | 13:00, L25 | **Alien Mothership** | 4.5 |
| 8 | `heroes` | 16:00, L30 | **Hero Team** | 6.0 |
| 9 | `demiurge` | 19:00, L35 | **The Demiurge** | 8.0 |
| 10 | `cosmic` | 22:00, L40 | **Cosmic Entity** | 10.0 |

- Earlier tiers stay in the mix with decaying weight (`tierDecay`), so the screen escalates rather than swapping out.
- If the player's level lags behind the clock, the next tier waits, while the budget still grows inside the current tier.
- A boss spawns when its tier unlocks. The tier's regular units start once the boss enters, not after it dies. **During a boss fight, regular spawns continue at 40% budget** (`director.bossBudgetScale`), which keeps XP flowing without burying the boss patterns.
- Mini-bosses (SWAT, army) teach the boss format early. They have one or two phases and no music change.

## Pattern vocabulary
**Implemented (Phase 3):** `aimed` (a stream of `count` along the aim), `spread`, `ring`, `spiral`. Each supports `bursts`/`burstGap` and Cycle `complexity` (count, arms and speed per Cycle, clamped by `maxCount`). The rest are pending.

Emitter kinds (implemented in `systems/patterns/`; see the `bullet-pattern` skill): `aimed`, `spread`, `ring`, `spiral`, `homing`, `laser`, `artillery`, `airstrike`, `wave` (sine bullets), `burst` (delayed split).

## Tiers

### 1. Police (`police`)
Ground-level response. Readable, slow, teaches dodging.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Patrol Officer | 40–60 | 4–5 | `aimed` single, slow |
| Patrol Car | 150 (prop-like, explodes) | 7 | rams (contact 400/s); when *killed* (not erased) `ring` of 6 |
| Riot Line | 120 | 3 | `spread` 3 at 30° |

### 2. SWAT (`swat`)
> **Phase 3 simplifications** (`factions/swat.ts`): Marksman fires a fast needle with no laser telegraph, the Shield Unit has no frontal block, and the Armored Van turret spirals and fires a death ring instead of deploying Breachers. The Breach Captain mini-boss is not implemented yet.

| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Breacher | 150 | 5 | `spread` 5 burst ×3 |
| Marksman | 100 | 3 | `laser` telegraph 0.8 s → fast `aimed` |
| Shield Unit | 300, frontal block (beam must flank) | 3.5 | `aimed` pair |
| Armored Van | 500 | 6 | deploys 4 Breachers |
| *Mini-boss: Breach Captain* | 4,000 | 4 | `spread` 7 ×3 bursts → at 50% HP adds `laser` marksman shots and calls 2 Vans |

### 3. Army (`army`)
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Rifle Squad (5) | 120 each | 4.5 | `aimed` staggered volley |
| Gunner | 350 | 3 | long `spread` sweep (oscillating angle) |
| Mortar Team | 250 | 2 | `artillery` 3 markers, 1.2 s fuse |
| *Mini-boss: Siege Colonel* | 10,000 | 2.5 | command post: `artillery` walking barrage + oscillating `spread` sweep; summons Rifle Squads |

### 4. Armor (`armor`)
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Light Tank | 1,200 | 3 | heavy `aimed` shell + small `ring` on impact |
| Rocket Truck | 800 | 4 | `artillery` salvo 8 |
| **Boss: Tank Commander** | 25,000 | 2 | phases: `spread` 9 → `ring` 24 alternating → `artillery` carpet + summons Light Tanks |

### 5. Air (`air`)
Air units render at altitude. Collision stays on the XZ plane via their ground shadow; they can be erased only while over the arena. **The aura deals 50% damage to air units** (`aura.airDamageScale`) because of altitude, while the beam deals full damage. This rewards aiming without making the aura useless.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Attack Helicopter | 900 | 6 | `spiral` 2-arm, strafing |
| Jet | 600 | 25 (fly-by) | `airstrike` line telegraph 1.0 s |
| Drone Swarm (8) | 60 each | 8 | `homing` weak, short life |
| **Boss: Squadron Leader** | 40,000 | 12 | fly-bys of crossing `airstrike`s, `homing` volleys, escort jets |

### 6. Secret Society (`society`)
Ritualists with geometric and occult (original) patterns.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Acolyte | 400 | 4 | `ring` 12, rotating offset |
| Sigil Keeper | 1,500 | 2 | static `spiral` 4-arm while channeling; buffs nearby units |
| Veiled Duelist | 800 | 10 (blinks) | `burst` splitting shots |
| **Boss: Grand Master** | 70,000 | 3 | rotating sigil `ring`s with gaps, mirror clones, `laser` pentagon sweep |

### 7. Aliens (`aliens`)
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Drifter | 700 | 5 | `wave` sine streams |
| Harvester Pod | 2,500 | 2 | `spiral` 6-arm, slow dense |
| Phase Stalker | 1,200 | 9 | cloak → `spread` 7 ambush |
| **Boss: Alien Mothership** | 150,000 | 1 | huge hull with destructible weak points; screen-wide `ring` layers, `laser` grid, spawns Drifters |

### 8. Heroes (`heroes`)
Original super-powered humans. **Never** model them on existing heroes (see the [IP checklist](ART_DIRECTION.md#ip-originality-checklist)). Regular units are rank-and-file "augments". The boss is a named team, **the Meridian Compact**, which passed the IP checklist on names. Re-check the visuals when they are modeled.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Dash Augment (melee rusher) | 4,000 | 12 dash | shockwave `ring` on landing |
| Arc Augment | 3,000 | 5 | chained `laser`s |
| Ward Augment | 8,000 | 3 | reflect field (beam is weakened from the front) |
| **Boss: the Meridian Compact** | 4 × 60,000 | varies | four members with combo patterns; each erased member enrages the others |

Meridian Compact roster. Silhouettes are geometric armor shapes with no emblems or capes.
| Member | Role | Signature |
|---|---|---|
| **Rhune** | rusher | chained dashes, each leaving a `ring` shockwave |
| **Velt** | caster | rotating `laser` triangle + `homing` sparks |
| **Moraine** | tank | moving reflect wall, `spread` volleys from behind it |
| **Tessaly** | support | slows the player's beam inside her field, heals the team; erase her first |

### 9. The Demiurge (`demiurge`)
The architect of reality's rules. Its attacks *rewrite the arena*: rules invert, the floor tiles shift.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Archon Fragment | 6,000 | 4 | geometric `ring` + `spiral` combos |
| **Boss: The Demiurge** | 500,000 | 0 (arena-scale) | phase-based "axioms": gravity flips (bullets curve), time stutter, inverted aura (heals enemies for 3 s, telegraphed), mega `laser` lattices. **No control inversion**: axioms change the world, never the player's input. |

### 10. Cosmic Entities (`cosmic`)
Beings beyond geometry. Patterns use the full vocabulary at maximum complexity.
| Unit | HP | Speed | Patterns |
|---|---|---|---|
| Void Mote | 3,000 | 7 | `homing` + `burst` |
| Star Eater Tendril | 10,000 | 0 (anchored) | sweeping `laser`, `spiral` 8-arm |
| **Boss: Cosmic Entity** | 1,500,000 | — | procedurally composed from pattern primitives scaled by Cycle; defeating it starts the next Cycle |

## Cycles
When the Cosmic Entity is defeated, `cycle += 1` and the ladder restarts at tier 1 with:
- multipliers from `config.cycle` (`config/combat.ts`; see [GDD §8](GDD.md#8-cycle-scaling)): `hpMult`, `dmgMult`, `densityMult` (capped by the perf budget) and `patternComplexity`
- **remixes**: each tier slot draws 1 primary faction plus `min(c, 2)` guest factions from *any* tier (seeded RNG). Example: Cycle 1, slot 2 = SWAT + Drifters.
- **pattern complexity**: emitters add `+c` arms, bullets or speed variants up to the per-emitter caps.
- shortened unlock times: `unlockTime * cycle.timeCompression ^ c` (start 0.85)
- bosses gain **+1 phase per Cycle, capped at +2** (the extra phases remix patterns from other bosses), and bosses from different tiers can pair up from Cycle 2.
- **The world palette shifts per Cycle** (see ART_DIRECTION, Cycle tint). Enemy bullet colors and player colors never change.
