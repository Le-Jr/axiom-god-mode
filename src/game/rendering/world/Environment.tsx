'use client';
import { Grid } from '@react-three/drei';
import { config } from '@/game/config';

const { palette, world } = config.rendering;

/** Background, fog, lighting, ground plane and the faint lattice grid. */
export function Environment() {
  return (
    <>
      <color attach="background" args={[palette.void]} />
      <fog attach="fog" args={[palette.void, world.fogNear, world.fogFar]} />
      <ambientLight intensity={0.25} color={palette.concrete} />
      <directionalLight position={[-20, 40, 10]} intensity={0.35} color="#8FA3B8" />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[world.groundSize, world.groundSize]} />
        <meshStandardMaterial color={palette.ash} roughness={1} metalness={0} />
      </mesh>
      <Grid
        infiniteGrid
        followCamera
        cellSize={world.gridCellSize}
        sectionSize={world.gridSectionSize}
        cellThickness={0.5}
        sectionThickness={0.9}
        cellColor={palette.concrete}
        sectionColor="#1F5560"
        fadeDistance={world.gridFadeDistance}
        fadeStrength={1.5}
      />
    </>
  );
}
