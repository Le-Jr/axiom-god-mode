export const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Ground ring: soft fill, dashed edge, and a wave that travels outward on each pulse.
export const frag = /* glsl */ `
  uniform float uTime;
  uniform float uHdr;
  uniform float uIntensity;
  uniform float uPulse;     // 0..1 progress of the current pulse wave (>= 1 means none)
  uniform float uEdge;      // ring radius as a fraction of the quad half-size
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float d = length(c);
    if (d > uEdge + 0.03) discard;

    float ring = smoothstep(uEdge - 0.03, uEdge, d) * (1.0 - smoothstep(uEdge, uEdge + 0.012, d));
    float ang = atan(c.y, c.x) / 6.2831853;
    float dashes = step(0.45, fract(ang * 48.0 + uTime * 0.6));
    float fill = (1.0 - smoothstep(0.0, uEdge, d)) * 0.035 + smoothstep(uEdge * 0.55, uEdge, d) * 0.07;

    float wave = 0.0;
    if (uPulse < 1.0) {
      float w = uPulse * uEdge;
      wave = (1.0 - smoothstep(0.0, 0.06, abs(d - w))) * (1.0 - uPulse);
    }

    float a = ring * (0.45 + 0.55 * dashes) + fill + wave;
    gl_FragColor = vec4(uColor * uHdr * uIntensity * a, a);
  }
`;
