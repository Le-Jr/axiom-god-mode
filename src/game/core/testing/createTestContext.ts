import { config as baseConfig, type GameConfig } from '@/game/config';
import { createGameContext, type GameContext } from '../GameContext';
import { GAME_EVENT_NAMES, type GameEventName } from '../events';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function merge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? merge(b, v) : v;
  }
  return out as T;
}

export interface RecordedEvent {
  type: GameEventName;
  payload: unknown;
}

export interface TestContext extends GameContext {
  /** Records every event emitted from now on (payloads are copied). */
  recordEvents(): RecordedEvent[];
}

export function createTestContext(
  configPatch?: DeepPartial<GameConfig>,
  opts: { seed?: number; cycle?: number } = {},
): TestContext {
  const ctx = createGameContext(opts.seed ?? 1, merge(baseConfig, configPatch)) as TestContext;
  ctx.cycle = opts.cycle ?? 0;
  ctx.recordEvents = () => {
    const log: RecordedEvent[] = [];
    for (const type of GAME_EVENT_NAMES) {
      ctx.bus.on(type, (payload) => log.push({ type, payload: { ...payload } }));
    }
    return log;
  };
  return ctx;
}
