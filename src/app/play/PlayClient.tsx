'use client';
import dynamic from 'next/dynamic';
import { DebugOverlay } from '@/ui/DebugOverlay';
import { GameOver } from '@/ui/GameOver';
import { Hud } from '@/ui/Hud';
import { PauseOverlay } from '@/ui/PauseOverlay';
import { UpgradePicker } from '@/ui/UpgradePicker';

// WebGL must never render on the server (CLAUDE.md rule 5). `ssr: false` only works in Client Components.
const GameCanvas = dynamic(() => import('@/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-hud text-sm tracking-[0.3em] text-mist">
      reassembling
    </div>
  ),
});

export function PlayClient() {
  return (
    <main className="fixed inset-0 bg-void">
      <GameCanvas />
      <Hud />
      <PauseOverlay />
      <UpgradePicker />
      <GameOver />
      <DebugOverlay />
    </main>
  );
}
