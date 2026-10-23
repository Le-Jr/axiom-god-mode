'use client';
// Template: instanced renderer for a SoA pool. Copy to src/game/rendering/pools/<Kind>Pool.tsx
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';

// Module-level scratch: never allocate inside useFrame
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();
const BULLET_COLOR = new Color(config.rendering.palette.hostileEmberCore).multiplyScalar(3); // HDR → bloom

export function BulletPool() {
  const capacity = config.performance.enemyProjectiles;
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new SphereGeometry(1, 8, 6), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: BULLET_COLOR, toneMapped: false }), []);

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
    if (!mesh || !ctx) return;
    const pool = ctx.projectiles; // SoA pool (Phase 3)
    const a = ctx.time.alpha;
    const n = pool.activeCount;
    for (let i = 0; i < n; i++) {
      const slot = pool.active[i];
      const x = pool.prevX[slot] + (pool.x[slot] - pool.prevX[slot]) * a;
      const z = pool.prevZ[slot] + (pool.z[slot] - pool.prevZ[slot]) * a;
      const r = pool.radius[slot];
      _p.set(x, 0.5, z);
      _s.set(r, r, r);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.count = n;
    if (n > 0) mesh.instanceMatrix.needsUpdate = true;
    ctx.debug.counts.bullets = n;
  });

  return <instancedMesh ref={ref} args={[geometry, material, capacity]} frustumCulled={false} />;
}
