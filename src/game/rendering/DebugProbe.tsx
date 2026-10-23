'use client';
import { useFrame } from '@react-three/fiber';
import { config } from '@/game/config';
import { debugBridge } from '@/game/core/debugBridge';
import { runtime } from '@/game/core/runtime';

const WINDOW = config.debug.fpsWindow;
const frameTimes = new Float32Array(WINDOW);
const sorted = new Float32Array(WINDOW);
let cursor = 0;
let filled = 0;
let sinceRefresh = 0;

/**
 * Collects FPS and renderer stats into debugBridge.
 * Requires `gl.info.autoReset = false` (set in Canvas onCreated) so multi-pass postprocessing
 * frames are counted as a whole: reset before everything, read after the composer (priority 1).
 */
export function DebugProbe() {
  useFrame((state) => {
    state.gl.info.reset();
  }, -1000);

  useFrame((state, dt) => {
    const ms = dt * 1000;
    frameTimes[cursor] = ms;
    cursor = (cursor + 1) % WINDOW;
    if (filled < WINDOW) filled++;
    debugBridge.frameMs = ms;

    const info = state.gl.info;
    debugBridge.drawCalls = info.render.calls;
    debugBridge.triangles = info.render.triangles;
    debugBridge.geometries = info.memory.geometries;
    debugBridge.textures = info.memory.textures;

    sinceRefresh += ms;
    if (sinceRefresh < config.debug.overlayRefreshMs) return;
    sinceRefresh = 0;

    let sum = 0;
    for (let i = 0; i < filled; i++) {
      sum += frameTimes[i];
      sorted[i] = frameTimes[i];
    }
    const view = sorted.subarray(0, filled).sort();
    const worst = view[Math.max(0, Math.floor(filled * 0.99) - 1)];
    debugBridge.fps = filled > 0 ? 1000 / (sum / filled) : 0;
    debugBridge.fpsLow = worst > 0 ? 1000 / worst : 0;
    debugBridge.listeners = runtime.ctx?.bus.listenerCount() ?? 0;
  }, 10);

  return null;
}
