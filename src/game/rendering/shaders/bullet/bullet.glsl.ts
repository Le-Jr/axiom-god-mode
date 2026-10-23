// Camera-facing bullet sprite: bright warm core, ember body, dark rim (ART_DIRECTION readability rule 1).
export const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 center = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float size = length(instanceMatrix[0].xyz);
    vec4 mv = modelViewMatrix * vec4(center, 1.0);
    mv.xy += position.xy * size;
    gl_Position = projectionMatrix * mv;
  }
`;

export const frag = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uBody;
  uniform vec3 uRim;
  uniform float uHdr;
  varying vec2 vUv;
  void main() {
    float d = length(vUv * 2.0 - 1.0);
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.45, d);
    float rim = smoothstep(0.62, 0.78, d);
    vec3 col = mix(uBody * uHdr, uCore * uHdr * 1.6, core);
    col = mix(col, uRim, rim);
    float alpha = 1.0 - smoothstep(0.92, 1.0, d);
    gl_FragColor = vec4(col, alpha);
  }
`;
