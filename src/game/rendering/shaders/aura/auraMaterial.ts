import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { frag, vert } from './aura.glsl';

/** Quad half-size = radius * AURA_QUAD_MARGIN, so the soft edge fits. */
export const AURA_QUAD_MARGIN = 1.1;

export function createAuraMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uHdr: { value: 1.8 },
      uIntensity: { value: 1 },
      uPulse: { value: 1 },
      uEdge: { value: 1 / AURA_QUAD_MARGIN },
      uColor: { value: new Color(config.rendering.palette.unboundCyan) },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
