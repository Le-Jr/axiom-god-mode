// Authoritative event map. Keep docs/ARCHITECTURE.md §6 in sync.
// High-frequency payloads are reused objects: listeners must copy, never store them.
import type { Entity } from '@/game/ecs/Entity';

export type PauseReason = 'ui' | 'levelUp' | 'hidden';

export interface RunStats {
  timeSurvived: number;
  level: number;
  erasures: number;
  kills: number;
  cycle: number;
  tierId: string;
}

export interface GameEvents {
  'run:start': { seed: number };
  'run:end': RunStats;
  'tick:paused': { reason: PauseReason };
  'tick:resumed': { reason: PauseReason };

  'player:damaged': { amount: number; hpRatio: number };
  'player:lowHp': { hpRatio: number };
  'player:recovered': { hpRatio: number };
  'player:died': RunStats;
  'player:levelUp': { level: number; choices: readonly string[]; rerolls: number };

  'beam:start': Record<string, never>;
  'beam:stop': Record<string, never>;
  'beam:empty': Record<string, never>;
  'aura:pulse': { radius: number; level: number };

  'enemy:spawned': { entity: Entity; archetypeId: string };
  'enemy:damaged': { entity: Entity; amount: number };
  'enemy:erased': { entity: Entity; archetypeId: string; x: number; z: number; xp: number };
  'enemy:killed': { entity: Entity; archetypeId: string; x: number; z: number; xp: number };

  'prop:destroyed': { propId: number; size: number; x: number; z: number };
  'projectile:fired': { factionId: string; kind: string; x: number; z: number };
  'telegraph:spawn': { kind: string; x: number; z: number; duration: number };

  'xp:gained': { amount: number };
  'upgrade:chosen': { upgradeId: string };
  'upgrade:reroll': Record<string, never>;

  'tier:changed': { tierId: string; cycle: number };
  'boss:spawned': { bossId: string };
  'boss:defeated': { bossId: string };
  'cycle:started': { cycle: number };

  'cutscene:done': { id: string; skipped: boolean };
}

export type GameEventName = keyof GameEvents;

// Compile-time exhaustive list (adding an event above without listing it here is a type error).
const EVENT_NAME_SET: Record<GameEventName, true> = {
  'run:start': true, 'run:end': true, 'tick:paused': true, 'tick:resumed': true,
  'player:damaged': true, 'player:lowHp': true, 'player:recovered': true, 'player:died': true,
  'player:levelUp': true, 'beam:start': true, 'beam:stop': true, 'beam:empty': true,
  'aura:pulse': true, 'enemy:spawned': true, 'enemy:damaged': true, 'enemy:erased': true,
  'enemy:killed': true, 'prop:destroyed': true, 'projectile:fired': true, 'telegraph:spawn': true,
  'xp:gained': true, 'upgrade:chosen': true, 'upgrade:reroll': true, 'tier:changed': true, 'boss:spawned': true,
  'boss:defeated': true, 'cycle:started': true, 'cutscene:done': true,
};

export const GAME_EVENT_NAMES = Object.keys(EVENT_NAME_SET) as GameEventName[];
