import { auraHum, auraPulse, beamCharge, beamEmpty, beamLoop, beamTail, eraseTear, explosionSmall, type LoopRecipe, type SfxRecipe } from './sfxRecipes';

export type Bus = 'sfx' | 'music' | 'ui';

export interface SfxDef {
  bus: Bus;
  volume: number; // linear
  pitchVar: number; // ± fraction
  volVar: number; // ± dB
  maxVoices: number;
  /** 1 = droppable when the global voice budget is full, 5 = always plays. */
  priority: number;
  spatial: boolean;
  /** Future: recorded files (round-robin). Missing files fall back to `recipe`. */
  files?: readonly string[];
  recipe: SfxRecipe;
}

// Rows mirror the SFX table in docs/AUDIO.md.
export const SFX = {
  aura_pulse: { bus: 'sfx', volume: 0.45, pitchVar: 0.05, volVar: 1, maxVoices: 2, priority: 2, spatial: false, recipe: auraPulse },
  beam_charge: { bus: 'sfx', volume: 0.7, pitchVar: 0.02, volVar: 0, maxVoices: 1, priority: 4, spatial: false, recipe: beamCharge },
  beam_tail: { bus: 'sfx', volume: 0.6, pitchVar: 0.04, volVar: 1, maxVoices: 1, priority: 3, spatial: false, recipe: beamTail },
  beam_empty: { bus: 'sfx', volume: 0.7, pitchVar: 0, volVar: 0, maxVoices: 1, priority: 4, spatial: false, recipe: beamEmpty },
  erase_tear: { bus: 'sfx', volume: 0.8, pitchVar: 0.08, volVar: 2, maxVoices: 6, priority: 3, spatial: true, recipe: eraseTear },
  explosion_s: { bus: 'sfx', volume: 0.6, pitchVar: 0.1, volVar: 3, maxVoices: 8, priority: 2, spatial: true, recipe: explosionSmall },
} satisfies Record<string, SfxDef>;

export type SfxId = keyof typeof SFX;

export const LOOPS = {
  aura_hum: { bus: 'sfx' as Bus, volume: 1, recipe: auraHum as LoopRecipe },
  beam_loop: { bus: 'sfx' as Bus, volume: 1, recipe: beamLoop as LoopRecipe },
};

export type LoopId = keyof typeof LOOPS;
