import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { frag, vert } from './unbound.glsl';

const { palette } = config.rendering;

export function createUnboundMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uHdr: { value: 2.2 },
      uIntensity: { value: 1 },
      uInstability: { value: 0 },
      uColor: { value: new Color(palette.unboundCyan) },
      uCore: { value: new Color(palette.unboundCore) },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
