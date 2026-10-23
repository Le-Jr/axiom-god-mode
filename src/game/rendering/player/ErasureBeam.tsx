'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, type Group, type Mesh, MeshBasicMaterial, PlaneGeometry, type ShaderMaterial, SphereGeometry } from 'three';
import { config } from '@/game/config';
import { runtime } from '@/game/core/runtime';
import { BeamState } from '@/game/ecs/components';
import { createBeamMaterial } from '@/game/rendering/shaders/beam/beamMaterial';
import { readPlayerView } from './playerView';

const { beam: B, rendering } = config;
const BEAM_HEIGHT = 1.0;
const VISUAL_WIDTH_SCALE = 3; // glow sheath is wider than the collision width
const CHARGE_INTENSITY = 0.35;

/** Ribbon from the player along the aim, with an origin flare and an impact spark. */
export function ErasureBeam() {
  const root = useRef<Group>(null);
  const ribbon = useRef<Mesh>(null);
  const flare = useRef<Mesh>(null);
  const impact = useRef<Mesh>(null);

  // Ribbon spans local x ∈ [0, 1] in the XZ plane; scaled to beam length/width.
  const ribbonGeo = useMemo(() => new PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0), []);
  const sparkGeo = useMemo(() => new SphereGeometry(1, 12, 8), []);
  const ribbonMat = useMemo(() => createBeamMaterial(), []);
  const sparkMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(rendering.palette.unboundCore).multiplyScalar(5),
        toneMapped: false,
        depthTest: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      ribbonGeo.dispose();
      sparkGeo.dispose();
      ribbonMat.dispose();
      sparkMat.dispose();
    },
    [ribbonGeo, sparkGeo, ribbonMat, sparkMat],
  );

  useFrame((state) => {
    const g = root.current;
    const r = ribbon.current;
    const f = flare.current;
    const im = impact.current;
    if (!g || !r || !f || !im) return;
    const view = readPlayerView(runtime.ctx);
    const p = view.player;
    if (!view.valid || !p || p.beamState === BeamState.idle) {
      g.visible = false;
      return;
    }
    g.visible = true;

    let intensity = 1;
    let widthScale = 1;
    if (p.beamState === BeamState.charging) {
      const k = Math.min(1, p.beamTimer / B.chargeTime);
      intensity = CHARGE_INTENSITY * k;
      widthScale = 0.3;
    } else if (p.beamState === BeamState.tail) {
      intensity = 1 - Math.min(1, p.beamTimer / B.tailTime);
      widthScale = intensity;
    }

    const t = state.clock.elapsedTime;
    const len = Math.max(0.01, p.beamLength);
    g.position.set(view.x, BEAM_HEIGHT, view.z);
    g.rotation.y = -Math.atan2(p.aimDirZ, p.aimDirX);
    r.scale.set(len, 1, B.width * VISUAL_WIDTH_SCALE * Math.max(0.05, widthScale));
    const u = (r.material as ShaderMaterial).uniforms;
    u.uTime.value = t;
    u.uIntensity.value = intensity;
    u.uLength.value = len;

    const flareSize = 0.18 + 0.12 * intensity + 0.03 * Math.sin(t * 50);
    f.scale.setScalar(flareSize);

    const showImpact = p.beamState === BeamState.channel && p.beamHit;
    im.visible = showImpact;
    if (showImpact) {
      im.position.set(len, 0, 0);
      im.scale.setScalar(0.22 + 0.1 * Math.abs(Math.sin(t * 37)));
    }
  });

  return (
    <group ref={root} visible={false}>
      <mesh ref={ribbon} geometry={ribbonGeo} material={ribbonMat} renderOrder={2} />
      <mesh ref={flare} geometry={sparkGeo} material={sparkMat} renderOrder={3} />
      <mesh ref={impact} geometry={sparkGeo} material={sparkMat} renderOrder={3} />
    </group>
  );
}
