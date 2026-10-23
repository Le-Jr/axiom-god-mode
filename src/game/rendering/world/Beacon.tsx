'use client';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type Group } from 'three';
import { config } from '@/game/config';

const { palette } = config.rendering;
// HDR colors (> 1) so only these bloom. See ART_DIRECTION "Shaders".
const CORE = new Color(palette.unboundCore).multiplyScalar(6);
const ORBIT = new Color(palette.unboundCyan).multiplyScalar(2.5);

/**
 * Calibration beacon at the origin: verifies bloom, tone mapping and the camera framing.
 * Phase 2 replaces it with the Unbound.
 */
export function Beacon() {
  const group = useRef<Group>(null);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.4;
    g.rotation.x += dt * 0.15;
  });

  return (
    <group position={[0, 1.2, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color={CORE} toneMapped={false} />
      </mesh>
      <group ref={group}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.1, 0.02, 8, 64]} />
          <meshBasicMaterial color={ORBIT} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 3, 0]}>
          <torusGeometry args={[1.1, 0.02, 8, 64]} />
          <meshBasicMaterial color={ORBIT} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, -Math.PI / 3, 0]}>
          <torusGeometry args={[1.1, 0.02, 8, 64]} />
          <meshBasicMaterial color={ORBIT} toneMapped={false} />
        </mesh>
      </group>
      <pointLight color={palette.unboundCyan} intensity={40} distance={18} decay={2} />
    </group>
  );
}
