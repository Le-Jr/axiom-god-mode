'use client';
import { useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, type ChromaticAberrationEffect, type NoiseEffect, ToneMappingMode, type VignetteEffect } from 'postprocessing';
import { useMemo, useRef, type ReactElement } from 'react';
import { Vector2 } from 'three';
import { config, type QualityPreset } from '@/game/config';
import { hudBridge } from '@/game/core/hudBridge';
import { instabilityFor } from './player/playerView';
import { vfxBridge } from './vfxBridge';

const { postfx } = config.rendering;
const HIT_DECAY = 4; // 1/s  (pulse fades in ~0.25 s)
const HIT_CA = 0.006; // extra CA offset at full pulse
const LOW_HP_NOISE = 0.35;
const LOW_HP_VIGNETTE = 0.25;

/**
 * Order: Bloom → ChromaticAberration → Noise → Vignette → ToneMapping → SMAA (ART_DIRECTION).
 * Hit pulses drive CA; low HP drives noise and vignette (reduced-motion caps: later phase).
 */
export function PostFX({ preset }: { preset: QualityPreset }) {
  const caOffset = useMemo(() => new Vector2(postfx.chromaticBase, postfx.chromaticBase), []);
  const ca = useRef<ChromaticAberrationEffect>(null);
  const noise = useRef<NoiseEffect>(null);
  const vignette = useRef<VignetteEffect>(null);

  useFrame((_, dt) => {
    vfxBridge.hitPulse = Math.max(0, vfxBridge.hitPulse - HIT_DECAY * dt);
    const pulse = vfxBridge.hitPulse;
    const hpRatio = hudBridge.maxHp > 0 ? hudBridge.hp / hudBridge.maxHp : 1;
    const instability = instabilityFor(hpRatio);
    const c = ca.current;
    if (c) {
      const o = postfx.chromaticBase + pulse * HIT_CA + instability * HIT_CA * 0.3;
      c.offset.set(o, o * 0.6);
    }
    if (noise.current) noise.current.blendMode.opacity.value = instability * LOW_HP_NOISE;
    if (vignette.current) vignette.current.darkness = postfx.vignetteDarkness + instability * LOW_HP_VIGNETTE;
  });

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
    effects.push(<ChromaticAberration key="ca" ref={ca} offset={caOffset} radialModulation={false} modulationOffset={0} />);
  }
  effects.push(
    <Noise key="noise" ref={noise} premultiply blendFunction={BlendFunction.SCREEN} opacity={0} />,
    <Vignette key="vignette" ref={vignette} offset={postfx.vignetteOffset} darkness={postfx.vignetteDarkness} />,
    <ToneMapping key="tonemap" mode={ToneMappingMode.ACES_FILMIC} />,
  );
  if (preset.smaa) effects.push(<SMAA key="smaa" />);

  return <EffectComposer multisampling={0}>{effects}</EffectComposer>;
}
