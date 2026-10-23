'use client';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';

const cam = config.rendering.camera;
const PITCH = (cam.pitch * Math.PI) / 180;
const OFFSET_Y = cam.distance * Math.sin(PITCH);
const OFFSET_Z = cam.distance * Math.cos(PITCH);

/** Fixed-angle follow camera with exponential smoothing toward `ctx.view` target. */
export function CameraRig() {
  const smoothed = useRef({ x: 0, z: 0 });

  useFrame((state, dt) => {
    const ctx = runtime.ctx;
    const s = smoothed.current;
    if (ctx) {
      const k = 1 - Math.exp(-cam.followSmoothing * dt);
      s.x += (ctx.view.targetX - s.x) * k;
      s.z += (ctx.view.targetZ - s.z) * k;
    }
    state.camera.position.set(s.x, OFFSET_Y, s.z + OFFSET_Z);
    state.camera.lookAt(s.x, 0, s.z);
  });

  return null;
}

export const initialCameraPosition: [number, number, number] = [0, OFFSET_Y, OFFSET_Z];
