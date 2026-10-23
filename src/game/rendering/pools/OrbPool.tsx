'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, type InstancedMesh, Matrix4, MeshBasicMaterial, OctahedronGeometry, Quaternion, Vector3 } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';

const CAPACITY = config.performance.xpOrbs;
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();
const UP = new Vector3(0, 1, 0);
// Violet: XP is what erasure leaves behind. Never warm (warm = enemy bullets).
const ORB_COLOR = new Color(config.rendering.palette.axiomViolet).multiplyScalar(3);

export function OrbPool() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new OctahedronGeometry(0.18, 0), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: ORB_COLOR, toneMapped: false }), []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const mesh = ref.current;
    const ctx = runtime.ctx;
    if (!mesh) return;
    if (!ctx) {
      mesh.count = 0;
      return;
    }
    const orbs = ctx.orbs;
    const a = ctx.time.alpha;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < orbs.count; i++) {
      const bob = Math.sin(t * 3 + i) * 0.1;
      _p.set(orbs.prevX[i] + (orbs.x[i] - orbs.prevX[i]) * a, 0.5 + bob, orbs.prevZ[i] + (orbs.z[i] - orbs.prevZ[i]) * a);
      _q.setFromAxisAngle(UP, t * 2 + i);
      _s.setScalar(Math.min(2.2, 0.8 + Math.sqrt(orbs.value[i]) * 0.25));
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.count = orbs.count;
    if (orbs.count > 0) mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, CAPACITY]} frustumCulled={false} />;
}
