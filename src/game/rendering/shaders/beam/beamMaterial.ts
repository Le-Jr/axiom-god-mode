import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { frag, vert } from './beam.glsl';

const { palette } = config.rendering;

export function createBeamMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uHdr: { value: 4 },
      uIntensity: { value: 0 },
      uLength: { value: 1 },
      uColor: { value: new Color(palette.unboundCyan) },
      uCore: { value: new Color(palette.unboundCore) },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false, // always readable from the top-down camera, even through tall props
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
