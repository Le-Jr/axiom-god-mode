// Visual tunables. Palette tokens mirror docs/ART_DIRECTION.md.
export const palette = {
  void: '#05070D',
  ash: '#1A1F2B',
  concrete: '#3A4152',
  unboundCore: '#F2FEFF',
  unboundCyan: '#5CF2FF',
  axiomViolet: '#9B6BFF',
  hostileEmber: '#FF5A2E',
  hostileEmberCore: '#FFD2A8',
  hostileBlood: '#E0203A',
  warningAmber: '#FFB020',
  axiomGold: '#FFE7A3',
} as const;

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualityPreset {
  maxDpr: number;
  bloomResolutionScale: number; // 1 = full res mip chain
  chromaticAberration: boolean;
  smaa: boolean;
}

export const quality: Record<QualityLevel, QualityPreset> = {
  low: { maxDpr: 1, bloomResolutionScale: 0.5, chromaticAberration: false, smaa: false },
  medium: { maxDpr: 1.5, bloomResolutionScale: 1, chromaticAberration: true, smaa: false },
  high: { maxDpr: 2, bloomResolutionScale: 1, chromaticAberration: true, smaa: true },
};

export const camera = {
  fov: 40, // degrees
  pitch: 55, // degrees above the ground plane
  distance: 30, // world units from target
  followSmoothing: 8, // 1/s; higher = snappier follow
  near: 0.5,
  far: 200,
} as const;

export const postfx = {
  bloomThreshold: 0.9,
  bloomSmoothing: 0.2,
  bloomIntensity: 1.2,
  chromaticBase: 0.0004, // resting offset in UV units
  vignetteOffset: 0.3,
  vignetteDarkness: 0.75,
} as const;

export const world = {
  fogNear: 30,
  fogFar: 90,
  groundSize: 400, // world units
  gridCellSize: 2,
  gridSectionSize: 10,
  gridFadeDistance: 70,
} as const;

export const cycleHueStep = 40; // degrees of world-palette hue rotation per Cycle
