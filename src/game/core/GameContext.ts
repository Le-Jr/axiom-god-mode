import { config as defaultConfig, type GameConfig } from '@/game/config';
import type { Entity } from '@/game/ecs/Entity';
import { World } from '@/game/ecs/World';
import { ProjectilePool } from '@/game/entities/projectiles/ProjectilePool';
import { XpOrbPool } from '@/game/entities/XpOrbPool';
import { createProgress, type Progress } from '@/game/upgrades/progress';
import { createStats, resetStats, type PlayerStats } from '@/game/upgrades/stats';
import { debugBridge, type DebugBridge } from './debugBridge';
import { EventBus } from './EventBus';
import type { GameEvents } from './events';
import { HitBuffer } from './HitBuffer';
import { hudBridge, type HudBridge } from './hudBridge';
import { createInputState, type InputState } from './input';
import { Rng } from './Rng';
import { SpatialHash } from './SpatialHash';
import { createTime, type Time } from './Time';

export interface ViewState {
  /** Camera follow target on the ground plane. */
  targetX: number;
  targetZ: number;
}

/** Debug/run-mode switches, parsed from the /play URL. */
export interface RunFlags {
  /** `?stress=bullets`: fixed 300 enemies + 2,500 bullets, director off, player invulnerable. */
  stress: boolean;
  /** `?god`: player takes no damage. */
  god: boolean;
}

export interface GameContext {
  readonly config: GameConfig;
  readonly world: World;
  readonly bus: EventBus<GameEvents>;
  readonly time: Time;
  readonly rng: Rng;
  readonly view: ViewState;
  readonly hud: HudBridge;
  readonly debug: DebugBridge;
  /** Per-tick input snapshot (copied from rawInput by the input system). */
  readonly input: InputState;
  /** Damage queue between collision producers and the damage system. */
  readonly hits: HitBuffer;
  /** Enemy bullets (SoA). */
  readonly projectiles: ProjectilePool;
  readonly orbs: XpOrbPool;
  /** Targets (enemies/props) by position; rebuilt each tick before the player phase. */
  readonly grid: SpatialHash;
  /** Scratch buffer for grid queries (slots). */
  readonly gridResults: Int32Array;
  /** Player stats derived from config + owned buffs (upgrade system recomputes). */
  readonly stats: PlayerStats;
  readonly progress: Progress;
  readonly flags: RunFlags;
  /** The player entity, or -1 before spawn. */
  player: Entity;
  /** Current Cycle (0-based). */
  cycle: number;
  /** Index into FACTIONS of the newest unlocked tier. */
  tier: number;
}

export function createGameContext(
  seed: number,
  config: GameConfig = defaultConfig,
  flags: Partial<RunFlags> = {},
): GameContext {
  const stats = createStats();
  resetStats(stats, config);
  return {
    config,
    world: new World(config.performance.maxEntities),
    bus: new EventBus<GameEvents>(),
    time: createTime(config.loop.tickRate),
    rng: new Rng(seed),
    view: { targetX: 0, targetZ: 0 },
    hud: hudBridge,
    debug: debugBridge,
    input: createInputState(),
    hits: new HitBuffer(config.performance.hitsPerTick),
    projectiles: new ProjectilePool(config.performance.enemyProjectiles),
    orbs: new XpOrbPool(config.performance.xpOrbs),
    grid: new SpatialHash(config.performance.enemies + config.performance.props, config.enemies.gridCellSize, config.enemies.gridBuckets),
    gridResults: new Int32Array(config.performance.enemies + config.performance.props),
    stats,
    progress: createProgress(config),
    flags: { stress: false, god: false, ...flags },
    player: -1,
    cycle: 0,
    tier: 0,
  };
}
