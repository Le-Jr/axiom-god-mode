'use client';
import { Bloom, ChromaticAberration, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useMemo, type ReactElement } from 'react';
import { Vector2 } from 'three';
import { config, type QualityPreset } from '@/game/config';

const { postfx } = config.rendering;

/**
 * Order: Bloom → ChromaticAberration → Vignette → ToneMapping → SMAA (ART_DIRECTION).
 * Hit distortion and low-HP glitch are driven from bridges in Phase 2.
 */
export function PostFX({ preset }: { preset: QualityPreset }) {
  const caOffset = useMemo(() => new Vector2(postfx.chromaticBase, postfx.chromaticBase), []);

  const effects: ReactElement[] = [
    <Bloom
      key="bloom"
      mipmapBlur
      luminanceThreshold={postfx.bloomThreshold}
      luminanceSmoothing={postfx.bloomSmoothing}
      intensity={postfx.bloomIntensity}
      resolutionScale={preset.bloomResolutionScale}
    />,
  ];
  if (preset.chromaticAberration) {
    effects.push(
      <ChromaticAberration key="ca" offset={caOffset} radialModulation={false} modulationOffset={0} />,
    );
  }
  effects.push(
    <Vignette key="vignette" offset={postfx.vignetteOffset} darkness={postfx.vignetteDarkness} />,
    <ToneMapping key="tonemap" mode={ToneMappingMode.ACES_FILMIC} />,
  );
  if (preset.smaa) effects.push(<SMAA key="smaa" />);

  return <EffectComposer multisampling={0}>{effects}</EffectComposer>;
}
