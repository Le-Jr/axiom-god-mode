import { noiseGlsl } from '../common.glsl';

export const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Ribbon along +X (uv.x = along, uv.y = across): white-hot core, noisy cyan sheath.
export const frag = /* glsl */ `
  uniform float uTime;
  uniform float uHdr;
  uniform float uIntensity;
  uniform float uLength;
  uniform vec3 uColor;
  uniform vec3 uCore;
  varying vec2 vUv;

  ${noiseGlsl}

  void main() {
    float across = abs(vUv.y - 0.5) * 2.0;
    float along = vUv.x * uLength;
    float n = valueNoise(vec2(along * 1.6 - uTime * 28.0, vUv.y * 7.0 + uTime * 4.0));
    float core = exp(-across * across * 70.0);
    float sheath = exp(-across * across * 7.0) * (0.45 + 0.55 * n);
    float ends = smoothstep(0.0, 0.015, vUv.x) * (1.0 - smoothstep(0.96, 1.0, vUv.x));
    float a = clamp((core + sheath) * uIntensity * ends, 0.0, 1.0);
    vec3 col = (uCore * core * 2.0 + uColor * sheath) * uHdr * uIntensity * ends;
    gl_FragColor = vec4(col, a);
  }
`;
