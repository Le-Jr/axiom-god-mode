import { Color, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { frag, vert } from './dissolve.glsl';

const { palette } = config.rendering;

export function createDissolveMaterial(tint: string): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uHdr: { value: 3 },
      uFreeze: { value: config.erasure.freeze },
      uFlatten: { value: config.erasure.flatten },
      uVanish: { value: config.erasure.vanish },
      uTint: { value: new Color(tint) },
      uFlashColor: { value: new Color(palette.unboundCore) },
      uEraseColor: { value: new Color(palette.axiomViolet) },
    },
    toneMapped: false,
  });
}
