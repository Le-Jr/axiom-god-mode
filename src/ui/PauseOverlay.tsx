'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

/** Esc toggles pause. The overlay only mounts content while paused. */
export function PauseOverlay() {
  const paused = useGameStore((s) => s.phase === 'paused');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return;
      e.preventDefault();
      useGameStore.getState().togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!paused) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-void/70 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-8">
        <h2 id="pause-title" className="font-display text-4xl font-light tracking-[0.4em] text-core">
          Suspended
        </h2>
        <div className="flex flex-col items-stretch gap-3 font-hud text-lg">
          <button
            type="button"
            autoFocus
            onClick={() => useGameStore.getState().setPhase('playing')}
            className="border border-unbound/60 px-10 py-2 text-core transition-colors hover:bg-unbound/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound"
          >
            Resume
          </button>
          <Link
            href="/"
            className="px-10 py-2 text-center text-mist transition-colors hover:text-core focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound"
          >
            Quit to menu
          </Link>
        </div>
        <p className="font-hud text-sm text-mist">Esc to resume</p>
      </div>
    </div>
  );
}
