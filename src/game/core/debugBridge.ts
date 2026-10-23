// Mutable debug stats written by the sim / render probe, read by the F3 overlay on a throttle.
// Never put this in React state.
export const debugBridge = {
  fps: 0,
  fpsLow: 0, // 1% low
  frameMs: 0,
  simMs: 0,
  substeps: 0,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  listeners: 0,
  droppedBullets: 0,
  counts: {
    entities: 0,
    bullets: 0,
    enemies: 0,
    fragments: 0,
    orbs: 0,
    props: 0,
  },
};

export type DebugBridge = typeof debugBridge;
