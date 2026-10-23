'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, type InstancedMesh, Matrix4, MeshBasicMaterial, SphereGeometry } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';
import { satelliteAngle } from '@/game/upgrades/satellites';
import { readPlayerView } from './playerView';

const MAX = 6; // satellites maxStacks
const COLOR = new Color(config.rendering.palette.unboundCyan).multiplyScalar(4);
const _m = new Matrix4();

/** Atomic Orbit: orbiting atoms around the player (same angle formula as the sim). */
export function Satellites() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new SphereGeometry(config.upgrades.satellite.radius, 12, 8), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: COLOR, toneMapped: false }), []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const mesh = ref.current;
    const ctx = runtime.ctx;
    if (!mesh) return;
    const view = readPlayerView(ctx);
    const n = ctx && view.valid ? Math.min(MAX, ctx.stats.satellites) : 0;
    mesh.count = n;
    if (!ctx || n === 0) return;
    const r = ctx.config.upgrades.satellite.orbitRadius;
    const simT = ctx.time.simTime + ctx.time.alpha * ctx.time.step * ctx.time.timeScale;
    for (let i = 0; i < n; i++) {
      const ang = satelliteAngle(ctx, i, n, simT);
      _m.makeTranslation(view.x + Math.cos(ang) * r, 1.0, view.z + Math.sin(ang) * r);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, MAX]} frustumCulled={false} />;
}
