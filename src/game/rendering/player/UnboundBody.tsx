'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CapsuleGeometry, Color, type Group, type Mesh, MeshBasicMaterial, type ShaderMaterial, SphereGeometry } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';
import { createUnboundMaterial } from '@/game/rendering/shaders/unbound/unboundMaterial';
import { instabilityFor, readPlayerView } from './playerView';

const { player: P, rendering } = config;
const CORE_HDR = 7;

/** The Unbound: additive lattice body with an HDR core, hovering and facing the aim. */
export function UnboundBody() {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const bodyGeo = useMemo(() => new CapsuleGeometry(0.42, 0.95, 6, 20), []);
  const coreGeo = useMemo(() => new SphereGeometry(0.2, 16, 12), []);
  const bodyMat = useMemo(() => createUnboundMaterial(), []);
  const coreMat = useMemo(
    () => new MeshBasicMaterial({ color: new Color(rendering.palette.unboundCore).multiplyScalar(CORE_HDR), toneMapped: false }),
    [],
  );

  useEffect(
    () => () => {
      bodyGeo.dispose();
      coreGeo.dispose();
      bodyMat.dispose();
      coreMat.dispose();
    },
    [bodyGeo, coreGeo, bodyMat, coreMat],
  );

  useFrame((state) => {
    const g = group.current;
    const b = body.current;
    if (!g || !b) return;
    const view = readPlayerView(runtime.ctx);
    g.visible = view.valid;
    if (!view.valid) return;
    const t = state.clock.elapsedTime;
    g.position.set(view.x, P.hoverHeight + Math.sin(t * P.hoverBobSpeed) * P.hoverBobAmplitude, view.z);
    g.rotation.y = -view.rot;
    const u = (b.material as ShaderMaterial).uniforms;
    u.uTime.value = t;
    u.uInstability.value = instabilityFor(view.hpRatio);
  });

  return (
    <group ref={group}>
      <mesh ref={body} geometry={bodyGeo} material={bodyMat} />
      <mesh geometry={coreGeo} material={coreMat} position-y={0.15} />
      <pointLight color={rendering.palette.unboundCyan} intensity={30} distance={14} decay={2} position-y={0.4} />
    </group>
  );
}
