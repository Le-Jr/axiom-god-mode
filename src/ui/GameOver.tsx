'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { FACTIONS } from '@/game/factions';
import { restartRun } from '@/game/uiBridge';
import { useGameStore } from '@/store/useGameStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { formatTime } from './format';

function Stat({ label, value, best }: { label: string; value: string; best?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-core/10 py-2">
      <dt className="font-hud text-mist">{label}</dt>
      <dd className="font-display text-xl text-core tabular-nums">
        {value}
        {best ? <span className="ml-2 font-hud text-sm text-gold">new record</span> : null}
      </dd>
    </div>
  );
}

/** Run summary. Enter restarts on the same canvas; the menu link leaves /play. */
export function GameOver() {
  const stats = useGameStore((s) => (s.phase === 'gameOver' ? s.lastRun : null));
  const newBests = useRecordsStore((s) => s.lastNewBests);
  const bestTime = useRecordsStore((s) => s.bestTime);

  useEffect(() => {
    if (!stats) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        restartRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stats]);

  if (!stats) return null;
  const tier = FACTIONS.find((f) => f.id === stats.tierId)?.name ?? stats.tierId;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 px-6"
    >
      <div className="flex w-full max-w-md flex-col gap-8">
        <div>
          <h2 id="gameover-title" className="font-display text-4xl font-light tracking-[0.12em] text-core">
            The form unravels
          </h2>
          <p className="mt-3 font-hud text-mist">The world answered louder this time.</p>
        </div>

        <dl>
          <Stat label="Survived" value={formatTime(stats.timeSurvived)} best={newBests.time} />
          <Stat label="Level" value={String(stats.level)} best={newBests.level} />
          <Stat label="Erased" value={String(stats.erasures)} best={newBests.erasures} />
          <Stat label="Destroyed" value={String(stats.kills)} />
          <Stat label="Furthest response" value={tier} />
        </dl>
        <p className="-mt-4 font-hud text-sm text-mist">Best survival {formatTime(bestTime)}</p>

        <div className="flex items-center gap-6 font-hud text-lg">
          <button
            type="button"
            autoFocus
            onClick={restartRun}
            className="border border-unbound bg-unbound/10 px-8 py-2 text-core transition-colors hover:bg-unbound/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound"
          >
            Try again
          </button>
          <Link href="/" className="text-mist transition-colors hover:text-core focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound">
            Quit to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
