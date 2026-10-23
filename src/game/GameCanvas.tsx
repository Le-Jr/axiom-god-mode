'use client';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { attachAudio } from '@/game/audio/listeners';
import { config } from '@/game/config';
import { endRun, startRun } from '@/game/core/runtime';
import { CameraRig, initialCameraPosition } from '@/game/rendering/CameraRig';
import { DebugProbe } from '@/game/rendering/DebugProbe';
import { InputBinder } from '@/game/rendering/InputBinder';
import { LoopDriver } from '@/game/rendering/LoopDriver';
import { AuraRing } from '@/game/rendering/player/AuraRing';
import { ErasureBeam } from '@/game/rendering/player/ErasureBeam';
import { UnboundBody } from '@/game/rendering/player/UnboundBody';
import { TargetPool } from '@/game/rendering/pools/TargetPool';
import { PostFX } from '@/game/rendering/PostFX';
import { Environment } from '@/game/rendering/world/Environment';
import { Ruins } from '@/game/rendering/world/Ruins';
import { useGameStore } from '@/store/useGameStore';
import { useSettingsStore } from '@/store/useSettingsStore';

function readSeedParam(): number | undefined {
  const raw = new URLSearchParams(window.location.search).get('seed');
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? n >>> 0 : undefined;
}

/** Client-only (loaded with `ssr: false`). Owns the run lifecycle and the WebGL canvas. */
export default function GameCanvas() {
  const quality = useSettingsStore((s) => s.quality);
  const preset = config.rendering.quality[quality];
  const cam = config.rendering.camera;

  useEffect(() => {
    const loop = startRun(readSeedParam());
    const detachAudio = attachAudio(loop.ctx);
    useGameStore.getState().beginRun();

    // Store phase (low frequency) → loop pause state.
    const unsubscribe = useGameStore.subscribe((s, prev) => {
      if (s.phase === prev.phase) return;
      if (s.phase === 'playing') loop.resume('ui');
      else loop.pause('ui');
    });
    const onVisibility = () => (document.hidden ? loop.pause('hidden') : loop.resume('hidden'));
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      detachAudio();
      endRun();
      useGameStore.getState().setPhase('menu');
    };
  }, []);

  return (
    <Canvas
      flat
      dpr={[1, preset.maxDpr]}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: cam.fov, near: cam.near, far: cam.far, position: initialCameraPosition }}
      onCreated={({ gl }) => {
        gl.info.autoReset = false; // DebugProbe resets once per frame (multi-pass totals)
      }}
    >
      <InputBinder />
      <LoopDriver />
      <CameraRig />
      <Environment />
      <Ruins />
      <TargetPool />
      <AuraRing />
      <UnboundBody />
      <ErasureBeam />
      <PostFX preset={preset} />
      <DebugProbe />
    </Canvas>
  );
}
