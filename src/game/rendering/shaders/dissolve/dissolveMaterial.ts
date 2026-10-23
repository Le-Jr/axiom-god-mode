import { Color, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { frag, vert } from './dissolve.glsl';

const { palette } = config.rendering;

/** Per-instance tint comes from the `aTint` attribute (enemy archetype colors). */
export function createDissolveMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uHdr: { value: 3 },
      uFreeze: { value: config.erasure.freeze },
      uFlatten: { value: config.erasure.flatten },
      uVanish: { value: config.erasure.vanish },
      uFlashColor: { value: new Color(palette.unboundCore) },
      uEraseColor: { value: new Color(palette.axiomViolet) },
    },
    toneMapped: false,
  });
}
