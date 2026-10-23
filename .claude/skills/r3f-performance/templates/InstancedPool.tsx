'use client';
// Template: instanced renderer for a SoA pool. Copy to src/game/rendering/pools/<Kind>Pool.tsx
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3, MeshBasicMaterial, Color } from 'three';
import { gameContext } from '@/game/core/gameContext';
import { debugBridge } from '@/game/core/debugBridge';

// Module-level scratch: never allocate inside useFrame
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();

export function BulletPool({ capacity }: { capacity: number }) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new SphereGeometry(1, 8, 6), []);
  const material = useMemo(
    () => new MeshBasicMaterial({ color: new Color('#FFD2A8').multiplyScalar(3), toneMapped: false }),
    [],
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const { projectiles: pool, time } = gameContext;
    const a = time.alpha;
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
    mesh.instanceMatrix.needsUpdate = n > 0;
    debugBridge.counts.bullets = n;
  });

  return <instancedMesh ref={ref} args={[geometry, material, capacity]} frustumCulled={false} />;
}
