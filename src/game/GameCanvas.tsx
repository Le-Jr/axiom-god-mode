'use client';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { attachAudio } from '@/game/audio/listeners';
import { config } from '@/game/config';
import type { RunFlags } from '@/game/core/GameContext';
import { endRun, runtime, startRun } from '@/game/core/runtime';
import { CameraRig, initialCameraPosition } from '@/game/rendering/CameraRig';
import { DebugProbe } from '@/game/rendering/DebugProbe';
import { InputBinder } from '@/game/rendering/InputBinder';
import { LoopDriver } from '@/game/rendering/LoopDriver';
import { AuraRing } from '@/game/rendering/player/AuraRing';
import { ErasureBeam } from '@/game/rendering/player/ErasureBeam';
import { Satellites } from '@/game/rendering/player/Satellites';
import { UnboundBody } from '@/game/rendering/player/UnboundBody';
import { BulletPool } from '@/game/rendering/pools/BulletPool';
import { EnemyPool } from '@/game/rendering/pools/EnemyPool';
import { OrbPool } from '@/game/rendering/pools/OrbPool';
import { PostFX } from '@/game/rendering/PostFX';
import { attachVfx } from '@/game/rendering/vfxBridge';
import { Environment } from '@/game/rendering/world/Environment';
import { Ruins } from '@/game/rendering/world/Ruins';
import { attachUiBridge } from '@/game/uiBridge';
import { useGameStore } from '@/store/useGameStore';
import { useSettingsStore } from '@/store/useSettingsStore';

/** `?seed=N`, `?stress=bullets`, `?god`, `?debug` (PERFORMANCE.md, CLAUDE.md). */
function readRunParams(): { seed?: number; flags: Partial<RunFlags>; debug: boolean } {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const n = raw === null ? NaN : Number(raw);
  return {
    seed: Number.isFinite(n) ? n >>> 0 : undefined,
    flags: { stress: params.get('stress') === 'bullets', god: params.has('god') },
    debug: params.has('debug'),
  };
}

/** Client-only (loaded with `ssr: false`). Owns the run lifecycle and the WebGL canvas. */
export default function GameCanvas() {
  const quality = useSettingsStore((s) => s.quality);
  const runId = useGameStore((s) => s.runId);
  const preset = config.rendering.quality[quality];
  const cam = config.rendering.camera;

  // One run per runId: "Try again" bumps runId and restarts on the same WebGL context.
  useEffect(() => {
    const { seed, flags, debug } = readRunParams();
    const loop = startRun(seed, flags);
    // `?debug`: expose the live runtime for console/Playwright inspection.
    if (debug) (window as unknown as { __AXIOM__?: typeof runtime }).__AXIOM__ = runtime;
    const detachAudio = attachAudio(loop.ctx);
    const detachUi = attachUiBridge(loop.ctx);
    const detachVfx = attachVfx(loop.ctx);
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
      detachVfx();
      detachUi();
      detachAudio();
      endRun();
      useGameStore.getState().setPhase('menu');
    };
  }, [runId]);

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
      <EnemyPool mesh="capsule" />
      <EnemyPool mesh="box" />
      <EnemyPool mesh="wedge" />
      <OrbPool />
      <AuraRing />
      <UnboundBody />
      <Satellites />
      <BulletPool />
      <ErasureBeam />
      <PostFX preset={preset} />
      <DebugProbe />
    </Canvas>
  );
}
