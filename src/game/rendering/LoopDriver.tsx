'use client';
import { useFrame } from '@react-three/fiber';
import { runtime } from '@/game/core/runtime';

/** Drives the fixed-timestep simulation from R3F's single rAF, before any render pool reads it. */
export function LoopDriver() {
  useFrame((_, dt) => {
    runtime.loop?.frame(dt);
  }, -100);
  return null;
}
