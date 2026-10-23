'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { type Mesh, PlaneGeometry, type ShaderMaterial } from 'three';
import { runtime } from '@/game/core/runtime';
import { AURA_QUAD_MARGIN, createAuraMaterial } from '@/game/rendering/shaders/aura/auraMaterial';
import { readPlayerView } from './playerView';

const WAVE_DURATION = 0.45; // seconds for the pulse wave to reach the edge

/** Ground ring at the player's feet. Detects pulses via the Player.auraPulses counter (no events needed). */
export function AuraRing() {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => new PlaneGeometry(2, 2).rotateX(-Math.PI / 2), []);
  const material = useMemo(() => createAuraMaterial(), []);
  const pulse = useRef({ seen: 0, startedAt: -1 });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const view = readPlayerView(runtime.ctx);
    m.visible = view.valid;
    if (!view.valid || !view.player) return;
    const t = state.clock.elapsedTime;
    const p = view.player;
    const s = pulse.current;
    if (p.auraPulses !== s.seen) {
      s.seen = p.auraPulses;
      s.startedAt = t;
    }
    const half = p.auraRadius * AURA_QUAD_MARGIN;
    m.position.set(view.x, 0.03, view.z);
    m.scale.set(half, 1, half);
    const u = (m.material as ShaderMaterial).uniforms;
    u.uTime.value = t;
    u.uPulse.value = s.startedAt < 0 ? 1 : Math.min(1, (t - s.startedAt) / WAVE_DURATION);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={1} />;
}
