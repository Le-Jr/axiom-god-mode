import { config as defaultConfig, type GameConfig } from '@/game/config';
import type { Entity } from '@/game/ecs/Entity';
import { World } from '@/game/ecs/World';
import { debugBridge, type DebugBridge } from './debugBridge';
import { EventBus } from './EventBus';
import type { GameEvents } from './events';
import { HitBuffer } from './HitBuffer';
import { hudBridge, type HudBridge } from './hudBridge';
import { createInputState, type InputState } from './input';
import { Rng } from './Rng';
import { createTime, type Time } from './Time';

export interface ViewState {
  /** Camera follow target on the ground plane. */
  targetX: number;
  targetZ: number;
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
  /** The player entity, or -1 before spawn. */
  player: Entity;
  /** Current Cycle (0-based). */
  cycle: number;
}

export function createGameContext(seed: number, config: GameConfig = defaultConfig): GameContext {
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
    player: -1,
    cycle: 0,
  };
}
