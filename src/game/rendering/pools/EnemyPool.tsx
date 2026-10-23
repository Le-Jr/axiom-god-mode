'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
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
import { MESH_KINDS, type MeshKind } from '@/game/factions';
import { createDissolveMaterial } from '@/game/rendering/shaders/dissolve/dissolveMaterial';

const CAPACITY = config.performance.enemies;
const HIT_FLASH = 0.08; // matches damageSystem
const UP = new Vector3(0, 1, 0);
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();

// Local +X is "forward" (Transform.rot = atan2(z, x)); base sits on y = 0.
function createShape(kind: MeshKind): BufferGeometry {
  switch (kind) {
    case 'box':
      return new BoxGeometry(1.9, 0.7, 1.0).translate(0, 0.45, 0);
    case 'wedge':
      return new ConeGeometry(0.6, 1.6, 3).rotateZ(-Math.PI / 2).translate(0, 0.8, 0);
    case 'capsule':
    default:
      return new CapsuleGeometry(0.38, 0.8, 4, 10).translate(0, 0.78, 0);
  }
}

function withInstanceAttributes(g: BufferGeometry): BufferGeometry {
  const attr = (size: number, fill = 0) =>
    new InstancedBufferAttribute(new Float32Array(CAPACITY * size).fill(fill), size).setUsage(DynamicDrawUsage);
  g.setAttribute('aErase', attr(1, -1));
  g.setAttribute('aFlash', attr(1));
  g.setAttribute('aSeed', attr(1));
  g.setAttribute('aTint', attr(3));
  return g;
}

/**
 * Every Target whose archetype uses `mesh`, in one draw call: interpolated transforms,
 * per-instance tint, hit flash and the 3-stage erasure dissolve.
 */
export function EnemyPool({ mesh }: { mesh: MeshKind }) {
  const meshIndex = MESH_KINDS.indexOf(mesh);
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => withInstanceAttributes(createShape(mesh)), [mesh]);
  const material = useMemo(() => createDissolveMaterial(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const im = ref.current;
    const ctx = runtime.ctx;
    if (!im) return;
    if (!ctx) {
      im.count = 0;
      return;
    }
    const { world, time } = ctx;
    const a = time.alpha;
    const targets = world.store(Target);
    const erasing = world.store(Erasing);
    // Mutate through the mesh ref (not the memoized values) — see r3f-performance skill.
    const geo = im.geometry;
    const eraseAttr = geo.getAttribute('aErase') as InstancedBufferAttribute;
    const flashAttr = geo.getAttribute('aFlash') as InstancedBufferAttribute;
    const seedAttr = geo.getAttribute('aSeed') as InstancedBufferAttribute;
    const tintAttr = geo.getAttribute('aTint') as InstancedBufferAttribute;
    const eraseArr = eraseAttr.array as Float32Array;
    const flashArr = flashAttr.array as Float32Array;
    const seedArr = seedAttr.array as Float32Array;
    const tintArr = tintAttr.array as Float32Array;

    let n = 0;
    for (let i = 0; i < targets.size && n < CAPACITY; i++) {
      const tg = targets.data[i];
      if (tg.meshIndex !== meshIndex) continue;
      const e = targets.entities[i];
      const t = world.get(e, Transform);
      _p.set(t.prevX + (t.x - t.prevX) * a, 0, t.prevZ + (t.z - t.prevZ) * a);
      _q.setFromAxisAngle(UP, -t.rot);
      _s.setScalar(tg.scale);
      _m.compose(_p, _q, _s);
      im.setMatrixAt(n, _m);
      const er = erasing.tryGet(e);
      eraseArr[n] = er ? er.t : -1;
      flashArr[n] = tg.flash / HIT_FLASH;
      seedArr[n] = (e & 0xffff) * 0.001;
      tintArr[n * 3] = tg.tintR;
      tintArr[n * 3 + 1] = tg.tintG;
      tintArr[n * 3 + 2] = tg.tintB;
      n++;
    }
    im.count = n;
    if (n > 0) {
      im.instanceMatrix.needsUpdate = true;
      eraseAttr.needsUpdate = true;
      flashAttr.needsUpdate = true;
      seedAttr.needsUpdate = true;
      tintAttr.needsUpdate = true;
    }
    (im.material as ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <instancedMesh ref={ref} args={[geometry, material, CAPACITY]} frustumCulled={false} />;
}
