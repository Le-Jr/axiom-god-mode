import { noiseGlsl } from '../common.glsl';

// Instanced target material with the 3-stage erasure: freeze → flatten/glitch → vanish.
// aErase < 0 means "not being erased". aFlash 0..1 is the hit flash.
export const vert = /* glsl */ `
  attribute float aErase;
  attribute float aFlash;
  attribute float aSeed;
  uniform float uTime;
  uniform float uFreeze;
  uniform float uFlatten;
  uniform float uVanish;
  varying float vFlash;
  varying float vFreeze;
  varying float vVanish;
  varying float vErasing;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying float vSeed;

  ${noiseGlsl}

  void main() {
    vec3 p = position;
    float flatten = 0.0;
    float vanish = 0.0;
    if (aErase >= 0.0) {
      flatten = clamp((aErase - uFreeze) / uFlatten, 0.0, 1.0);
      vanish = clamp((aErase - uFreeze - uFlatten) / uVanish, 0.0, 1.0);
      // Squash toward a silhouette and smear horizontal bands (scanline glitch)
      p.y *= mix(1.0, 0.1, flatten);
      p.xz *= 1.0 + flatten * 0.4;
      float band = floor(position.y * 10.0 + aSeed * 13.0);
      float g = hash11(band + floor(uTime * 30.0) + aSeed * 101.0) - 0.5;
      p.x += g * 0.7 * flatten;
    }
    vErasing = aErase >= 0.0 ? 1.0 : 0.0;
    vFreeze = vErasing * (1.0 - flatten);
    vFlash = aFlash;
    vVanish = vanish;
    vLocal = position;
    vSeed = aSeed;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  }
`;

export const frag = /* glsl */ `
  uniform float uHdr;
  uniform vec3 uTint;
  uniform vec3 uFlashColor;
  uniform vec3 uEraseColor;
  varying float vFlash;
  varying float vFreeze;
  varying float vVanish;
  varying float vErasing;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying float vSeed;

  ${noiseGlsl}

  void main() {
    float n = hash31(floor(vLocal * 16.0) + vSeed * 7.0);
    if (vVanish > 0.0 && n < vVanish) discard;
    float edge = vVanish > 0.0 ? 1.0 - smoothstep(vVanish, vVanish + 0.15, n) : 0.0;

    float light = 0.3 + 0.7 * max(dot(normalize(vNormalW), normalize(vec3(-0.4, 0.85, 0.35))), 0.0);
    vec3 col = uTint * light;
    col = mix(col, uFlashColor * uHdr, vFlash);
    // Freeze flash, cooling into a violet silhouette while flattening
    vec3 erased = mix(uEraseColor * uHdr * 0.6, uFlashColor * uHdr, vFreeze);
    col = mix(col, erased, vErasing);
    col += uEraseColor * uHdr * edge * 1.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;
