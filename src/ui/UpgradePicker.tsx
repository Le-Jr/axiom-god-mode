'use client';
import { useEffect } from 'react';
import { chooseUpgrade, rerollUpgrades } from '@/game/uiBridge';
import type { Rarity } from '@/game/upgrades/types';
import { useGameStore } from '@/store/useGameStore';

const RARITY_LABEL: Record<Rarity, string> = { common: 'Common', rare: 'Rare', epic: 'Epic', axiom: 'Axiom' };
const RARITY_CLASS: Record<Rarity, string> = {
  common: 'border-core/40 text-core',
  rare: 'border-rare text-rare',
  epic: 'border-axiom text-axiom',
  axiom: 'border-gold text-gold shadow-[0_0_32px_rgba(255,231,163,0.35)]',
};

/** Level-up: the sim is paused while this is open. Keys 1/2/3 pick, R rerolls. */
export function UpgradePicker() {
  const open = useGameStore((s) => s.phase === 'levelUp');
  const level = useGameStore((s) => s.level);
  const choices = useGameStore((s) => s.choices);
  const rerolls = useGameStore((s) => s.rerolls);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length) {
        e.preventDefault();
        chooseUpgrade(choices[n - 1].id);
      } else if (e.code === 'KeyR' && rerolls > 0) {
        e.preventDefault();
        rerollUpgrades();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, choices, rerolls]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-void/75 px-6 backdrop-blur-[2px]"
    >
      <div className="flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="text-center">
          <h2 id="levelup-title" className="font-display text-4xl font-light tracking-[0.2em] text-core">
            Level {level}
          </h2>
          <p className="mt-2 font-hud text-mist">Choose what you become.</p>
        </div>

        <ol className="grid w-full gap-4 md:grid-cols-3">
          {choices.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                autoFocus={i === 0}
                onClick={() => chooseUpgrade(c.id)}
                className={`group flex h-full w-full flex-col gap-3 border bg-void/80 p-5 text-left transition-colors hover:bg-core/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound ${RARITY_CLASS[c.rarity]}`}
              >
                <span className="flex items-baseline justify-between font-hud text-sm">
                  <span>{RARITY_LABEL[c.rarity]}</span>
                  <kbd className="text-mist">{i + 1}</kbd>
                </span>
                <span className="font-display text-xl font-medium text-core">{c.name}</span>
                <span className="flex-1 font-hud text-base leading-snug text-core/80">{c.description}</span>
                <span className="font-hud text-sm text-mist">
                  {c.owned > 0 ? `Owned ${c.owned} of ${c.maxStacks}` : 'New'}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          disabled={rerolls <= 0}
          onClick={rerollUpgrades}
          className="font-hud text-mist transition-colors hover:text-core disabled:opacity-40 disabled:hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound"
        >
          Reroll ({rerolls}) <kbd className="ml-1 text-sm">R</kbd>
        </button>
      </div>
    </div>
  );
}
