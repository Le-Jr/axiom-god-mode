# Upgrades (buffs)

The source of truth is `src/game/upgrades/defs/*.ts`. Add buffs with the `upgrade-authoring` skill. Numbers are initial values and live in the buff definition or `config/upgrades.ts`.

## Rarity
| Rarity | Base weight | Color token | Notes |
|---|---|---|---|
| Common | 60 | `--rarity-common` (white-cyan) | flat stat bumps |
| Rare | 28 | `--rarity-rare` (blue) | new behavior, small |
| Epic | 10 | `--rarity-epic` (violet) | new ability or big modifier |
| Axiom | 2 | `--rarity-axiom` (gold-white) | rule-breaking; once per run unless noted |

- Weights scale with luck (`luck` stat, future) and with Cycle: `+cycle.rarityShift` moves weight from Common up to higher tiers.
- Each roll offers 3 **distinct** buffs. Maxed and `unique` buffs that are already owned are excluded. Unmet prerequisites exclude the buff.
- **Pity timer:** after 4 consecutive offers with only Commons, the next offer guarantees at least one Rare or better (`upgrades.pityAfter`).
- **Rerolls:** start with 1, +1 every 10 levels, max 3 stored (see GDD §5.6).

## Stacking modes
| Mode | Meaning |
|---|---|
| `additive` | `stat += value` per stack |
| `multiplicative` | `stat *= (1 + value)` per stack |
| `unique` | can be owned once |
| `levels` | discrete levels 1..maxStacks, each with its own params table |

Every buff declares `maxStacks`. Stats are recomputed from the owned buff list (`computeStats(baseStats, owned)`), never mutated incrementally. This makes the result order-independent and keeps it testable.

## Catalog
| id | Name | Rarity | Stacking | Effect (per stack) | Max |
|---|---|---|---|---|---|
| `aura_radius` | Expanding Presence | Common | multiplicative | aura radius +12% | 8 |
| `aura_damage` | Resonant Field | Common | multiplicative | aura damage +15% | 10 |
| `aura_rate` | Quickened Pulse | Rare | multiplicative | pulse interval −10% | 5 |
| `beam_energy` | Deep Reservoir | Common | additive | max energy +20 | 8 |
| `beam_recharge` | Restoration | Common | multiplicative | energy recharge +15% | 6 |
| `beam_width` | Widened Axis | Common | multiplicative | beam width +15% | 5 |
| `beam_multiray` | Prism Split | Epic | levels | +1 extra ray at ±12°·n | 4 |
| `beam_pierce` | Unbounded Line | Rare | levels | beam passes through +2 targets (lvl 3 = infinite) | 3 |
| `max_hp` | Densified Form | Common | additive | max HP +8% of base, heal that amount | 10 |
| `shield_regen` | Reformation | Rare | levels | regenerating shield 5/10/15% max HP, 4 s delay | 3 |
| `time_dilation` | Slowed Moment | Epic | levels | field radius 6/8/10: enemy bullets inside move at 55/45/35% speed | 3 |
| `clone` | Echo Self | Epic | levels | 1/2 clones that mirror the beam at 30/45% damage | 2 |
| `satellites` | Atomic Orbit | Rare | levels | +1 orbiting atom per level; contact damage + blocks bullets | 6 |
| `blink` | Blink | Rare | unique→levels | Space teleports 6 units toward the cursor; cooldown 4/3/2 s | 3 |
| `gravity_well` | Singularity | Epic | levels | every 8 s spawns a well that pulls enemies and bullets for 3 s | 3 |
| `xp_magnet` | Attraction | Common | multiplicative | pickup radius +25% | 5 |
| `move_speed` | Weightless | Common | multiplicative | move speed +8% | 5 |
| `axiom_erasure` | Axiom: Nullify | Axiom | unique | erasure threshold −40%; erased enemies erase their in-flight bullets | 1 |

**Phase 3 starter set (~8):** `aura_radius`, `aura_damage`, `beam_energy`, `beam_recharge`, `beam_pierce`, `max_hp`, `satellites`, `move_speed`.

## Synergies
A synergy is a passive bonus that activates automatically when every listed buff is owned at or above the required level. It is declared in `upgrades/synergies.ts` and shown in the picker as "Synergy ready".
| Synergy | Requires | Bonus |
|---|---|---|
| Event Horizon | `gravity_well` + `aura_radius`≥3 | wells pull targets into the aura and pulse aura damage at their center |
| Spectrum | `beam_multiray`≥2 + `beam_pierce`≥2 | each ray gains +1 extra ray at 50% damage |
| Electron Shell | `satellites`≥4 + `shield_regen` | satellites restore shield on bullet block |
| Frozen Frame | `time_dilation`≥2 + `beam_width`≥2 | the beam slows targets (−40% speed) |
| Choir of Echoes | `clone`≥2 + `beam_multiray` | clones inherit multiray |
| Phase Step | `blink` + `time_dilation` | blink leaves a 2 s dilation field |

**Synergies activate automatically**, with no picker card. Activation shows a toast and adds an icon to the HUD. A buff card that would *complete* a synergy shows a small "completes: <Synergy>" hint, so players can build toward them.

## Template for a new buff
```ts
// src/game/upgrades/defs/<id>.ts
import { defineUpgrade } from '../defineUpgrade';

export default defineUpgrade({
  id: 'aura_radius',
  name: 'Expanding Presence',
  description: (stacks) => `Aura radius +${12 * (stacks + 1)}%`,
  rarity: 'common',
  stacking: 'multiplicative',
  maxStacks: 8,
  tags: ['aura'],
  requires: [],                       // e.g. [{ id: 'blink', minStacks: 1 }]
  apply: (stats, stacks) => { stats.aura.radius *= 1.12 ** stacks; },
  // optional: runtime behavior (spawns satellites, etc.) via a system that reads `owned`
});
```
Then register it in `upgrades/defs/index.ts`, add a row here, and add an icon (`public/assets/textures/upgrades/<id>.png`, or a placeholder glyph).
