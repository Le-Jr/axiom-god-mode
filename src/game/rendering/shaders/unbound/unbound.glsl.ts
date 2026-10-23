import { noiseGlsl } from '../common.glsl';

export const vert = /* glsl */ `
  uniform float uTime;
  uniform float uInstability;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vObjPos;

  void main() {
    vec3 p = position;
    // Low-HP instability: high-frequency surface jitter
    p += normal * uInstability * 0.06 * sin(uTime * 40.0 + position.y * 25.0);
    vObjPos = position;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const frag = /* glsl */ `
  uniform float uTime;
  uniform float uHdr;
  uniform float uIntensity;
  uniform float uInstability;
  uniform vec3 uColor;
  uniform vec3 uCore;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vObjPos;

  ${noiseGlsl}

  // Thin line where v crosses an integer
  float gridLine(float v, float w) {
    float f = abs(fract(v) - 0.5);
    return smoothstep(0.5 - w, 0.5, f);
  }

  void main() {
    float facing = clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0);
    float fres = pow(1.0 - facing, 2.2);

    // Distributed lattice: horizontal rings drifting up + two diagonal families. No emblem.
    vec3 p = vObjPos * 3.0;
    float l1 = gridLine(p.y + uTime * 0.35, 0.05);
    float l2 = gridLine((p.x + p.z) * 0.7 - uTime * 0.22, 0.04);
    float l3 = gridLine((p.x - p.z) * 0.7 + p.y * 0.4 + uTime * 0.18, 0.04);
    float lattice = max(l1, max(l2, l3)) * (0.55 + 0.45 * sin(uTime * 2.7 + p.y * 3.0));

    vec3 col = uColor * (0.22 + fres * 1.7) + uColor * lattice * 1.3 + uCore * pow(fres, 5.0) * 0.8;

    // Instability: occasional red-shifted band flicker
    float band = step(0.93, hash21(vec2(floor(uTime * 18.0), floor(p.y * 4.0))));
    col.r += uInstability * band * 1.5;
    col *= uHdr * uIntensity;

    float alpha = clamp(0.3 + fres * 0.9 + lattice * 0.6, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;
