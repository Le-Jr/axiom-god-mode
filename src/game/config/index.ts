import { loop } from './loop';
import { performance } from './performance';
import { camera, cycleHueStep, palette, postfx, quality, world } from './rendering';
import { debug } from './debug';

export const config = {
  loop,
  performance,
  rendering: { palette, quality, camera, postfx, world, cycleHueStep },
  debug,
} as const;

export type GameConfig = typeof config;

export type { QualityLevel, QualityPreset } from './rendering';
