'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { config } from '@/game/config';
import { Rng } from '@/game/core/Rng';

const COUNT = 140;
const SEED = 4812;
const INNER_RADIUS = 9; // keep the arena center clear
const OUTER_RADIUS = 60;

/**
 * Placeholder facility ruins: one InstancedMesh, matrices written once.
 * Replaced by procedural destructible chunks later; also exercises the instancing path.
 */
export function Ruins() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const material = useMemo(
    () => new MeshStandardMaterial({ color: config.rendering.palette.concrete, roughness: 0.95 }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rng = new Rng(SEED);
    const m = new Matrix4();
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    const up = new Vector3(0, 1, 0);
    for (let i = 0; i < COUNT; i++) {
      const angle = rng.range(0, Math.PI * 2);
      const r = rng.range(INNER_RADIUS, OUTER_RADIUS);
      p.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      q.setFromAxisAngle(up, rng.range(0, Math.PI));
      s.set(rng.range(0.8, 4), rng.range(0.4, 3.5), rng.range(0.8, 4));
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} />;
}
