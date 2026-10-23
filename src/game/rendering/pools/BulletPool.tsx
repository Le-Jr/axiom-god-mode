'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, type InstancedMesh, Matrix4, PlaneGeometry, ShaderMaterial } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';
import { frag, vert } from '@/game/rendering/shaders/bullet/bullet.glsl';

const CAPACITY = config.performance.enemyProjectiles;
const HEIGHT = 0.7; // bullets fly at chest height
const { palette } = config.rendering;
const _m = new Matrix4();

/** All enemy bullets as camera-facing sprites in one draw call. */
export function BulletPool() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uCore: { value: new Color(palette.hostileEmberCore) },
          uBody: { value: new Color(palette.hostileEmber) },
          uRim: { value: new Color('#1A0805') },
          uHdr: { value: 2.2 },
        },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

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
    if (!ctx) {
      mesh.count = 0;
      return;
    }
    const pool = ctx.projectiles;
    const a = ctx.time.alpha;
    const scale = ctx.config.projectiles.visualScale;
    const n = pool.count;
    const e = _m.elements;
    for (let i = 0; i < n; i++) {
      const s = pool.radius[i] * scale;
      // Uniform scale + translation only: write the matrix directly (no compose).
      e[0] = s;
      e[5] = s;
      e[10] = s;
      e[12] = pool.prevX[i] + (pool.x[i] - pool.prevX[i]) * a;
      e[13] = HEIGHT;
      e[14] = pool.prevZ[i] + (pool.z[i] - pool.prevZ[i]) * a;
      mesh.setMatrixAt(i, _m);
    }
    mesh.count = n;
    if (n > 0) mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, CAPACITY]} frustumCulled={false} renderOrder={4} />;
}
