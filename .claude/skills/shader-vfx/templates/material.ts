// Template: copy to src/game/rendering/shaders/<name>/<name>Material.ts
import { AdditiveBlending, Color, ShaderMaterial } from 'three';

const vert = /* glsl */ `
  attribute float aProgress;   // per-instance 0..1 (e.g. erasure)
  attribute float aSeed;
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  void main() {
    vUv = uv;
    vProgress = aProgress;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uHdr;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float n = hash(floor(vUv * 32.0) + vSeed);
    if (n < vProgress) discard;                          // dissolve
    float edge = smoothstep(vProgress, vProgress + 0.08, n);
    vec3 col = mix(uColor * uHdr * 2.0, uColor * uHdr, edge); // hot edge
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

export function createExampleMaterial(color = '#9B6BFF') {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uHdr: { value: 3 },
      uColor: { value: new Color(color) },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
