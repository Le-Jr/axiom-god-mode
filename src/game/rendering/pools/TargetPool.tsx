'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  CapsuleGeometry,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  type ShaderMaterial,
  Vector3,
} from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';
import { Erasing, Target, Transform } from '@/game/ecs/components';
import { createDissolveMaterial } from '@/game/rendering/shaders/dissolve/dissolveMaterial';

const CAPACITY = config.performance.enemies;
const HIT_FLASH = 0.08; // matches damageSystem
const UP = new Vector3(0, 1, 0);
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3(1, 1, 1);

/**
 * All Target entities (Phase 2: sandbox dummies) in one draw call, with the erasure dissolve
 * driven by per-instance attributes. Phase 3 splits this into one pool per archetype mesh.
 */
export function TargetPool() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new CapsuleGeometry(0.38, 0.8, 4, 10).translate(0, 0.78, 0);
    const erase = new InstancedBufferAttribute(new Float32Array(CAPACITY).fill(-1), 1).setUsage(DynamicDrawUsage);
    const flash = new InstancedBufferAttribute(new Float32Array(CAPACITY), 1).setUsage(DynamicDrawUsage);
    const seed = new InstancedBufferAttribute(new Float32Array(CAPACITY), 1).setUsage(DynamicDrawUsage);
    g.setAttribute('aErase', erase);
    g.setAttribute('aFlash', flash);
    g.setAttribute('aSeed', seed);
    return g;
  }, []);
  const material = useMemo(() => createDissolveMaterial(config.sandbox.tint), []);

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
    const { world, time } = ctx;
    const a = time.alpha;
    const targets = world.store(Target);
    const erasing = world.store(Erasing);
    // Mutate through the mesh ref (not the memoized values) — see r3f-performance skill.
    const geo = mesh.geometry;
    const eraseAttr = geo.getAttribute('aErase') as InstancedBufferAttribute;
    const flashAttr = geo.getAttribute('aFlash') as InstancedBufferAttribute;
    const seedAttr = geo.getAttribute('aSeed') as InstancedBufferAttribute;
    const eraseArr = eraseAttr.array as Float32Array;
    const flashArr = flashAttr.array as Float32Array;
    const seedArr = seedAttr.array as Float32Array;

    const n = Math.min(targets.size, CAPACITY);
    for (let i = 0; i < n; i++) {
      const e = targets.entities[i];
      const t = world.get(e, Transform);
      _p.set(t.prevX + (t.x - t.prevX) * a, 0, t.prevZ + (t.z - t.prevZ) * a);
      _q.setFromAxisAngle(UP, -t.rot);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
      const er = erasing.tryGet(e);
      eraseArr[i] = er ? er.t : -1;
      flashArr[i] = targets.data[i].flash / HIT_FLASH;
      seedArr[i] = (e & 0xffff) * 0.001;
    }
    mesh.count = n;
    if (n > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      eraseAttr.needsUpdate = true;
      flashAttr.needsUpdate = true;
      seedAttr.needsUpdate = true;
    }
    (mesh.material as ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <instancedMesh ref={ref} args={[geometry, material, CAPACITY]} frustumCulled={false} />;
}
