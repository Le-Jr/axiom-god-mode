import { audio } from './audio';
import { aura } from './aura';
import { beam, erasure } from './beam';
import { cycle, director, enemies, progression, projectiles, stress, upgrades } from './combat';
import { debug } from './debug';
import { input } from './input';
import { loop } from './loop';
import { performance } from './performance';
import { player } from './player';
import { camera, cycleHueStep, palette, postfx, quality, world } from './rendering';
import { sandbox } from './sandbox';

// Literal `as const` values, widened in the public type so tests and tuning can patch them.
type Widen<T> = T extends number
  ? number
  : T extends boolean
    ? boolean
    : T extends string
      ? string
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;

const raw = {
  loop,
  performance,
  player,
  aura,
  beam,
  erasure,
  input,
  sandbox,
  audio,
  projectiles,
  enemies,
  director,
  cycle,
  progression,
  upgrades,
  stress,
  rendering: { palette, quality, camera, postfx, world, cycleHueStep },
  debug,
} as const;

export type GameConfig = Widen<typeof raw>;
export const config: GameConfig = raw;

export type { QualityLevel, QualityPreset } from './rendering';
export type { InputAction } from './input';
export { BULLET_KINDS, type BulletKindId } from './combat';
