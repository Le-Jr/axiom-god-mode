// Template: entries for src/game/audio/sfxRegistry.ts and sfxRecipes.ts
import type { SfxDef } from './types';
import type { SfxRecipe } from './sfxRecipes';

export const erase_tear: SfxDef = {
  id: 'erase_tear',
  files: ['/assets/audio/sfx/erase_tear_1.ogg', '/assets/audio/sfx/erase_tear_2.ogg'],
  bus: 'sfx',
  volume: 0.8,
  pitchVar: 0.08,     // ±8%
  volVar: 2,          // ±2 dB
  maxVoices: 6,
  priority: 3,        // 1 = lowest (droppable), 5 = never dropped
  spatial: true,
};

// Procedural fallback: reversed noise sweep + falling sine "tear"
export const erase_tear_recipe: SfxRecipe = (ac, out, t) => {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1800, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + 0.42);
};
