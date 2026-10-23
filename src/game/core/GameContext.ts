import { config as defaultConfig, type GameConfig } from '@/game/config';
import { World } from '@/game/ecs/World';
import { debugBridge, type DebugBridge } from './debugBridge';
import { EventBus } from './EventBus';
import type { GameEvents } from './events';
import { hudBridge, type HudBridge } from './hudBridge';
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
    cycle: 0,
  };
}
