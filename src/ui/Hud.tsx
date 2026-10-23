'use client';
import { useEffect, useRef } from 'react';
import { hudBridge } from '@/game/core/hudBridge';
import { useGameStore } from '@/store/useGameStore';

const REFRESH_MS = 50; // ~20 Hz

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * HP / energy / level / timer. Values go straight from hudBridge to DOM refs on an interval:
 * the component renders once per phase change, never per frame.
 */
export function Hud() {
  const visible = useGameStore((s) => s.phase !== 'menu' && s.phase !== 'cutscene');
  const root = useRef<HTMLDivElement>(null);
  const hpFill = useRef<HTMLDivElement>(null);
  const hpText = useRef<HTMLSpanElement>(null);
  const enFill = useRef<HTMLDivElement>(null);
  const enText = useRef<HTMLSpanElement>(null);
  const level = useRef<HTMLSpanElement>(null);
  const timer = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const h = hudBridge;
      const hpRatio = h.maxHp > 0 ? h.hp / h.maxHp : 0;
      const enRatio = h.maxEnergy > 0 ? h.energy / h.maxEnergy : 0;
      if (hpFill.current) hpFill.current.style.transform = `scaleX(${hpRatio})`;
      if (enFill.current) enFill.current.style.transform = `scaleX(${enRatio})`;
      if (hpText.current) hpText.current.textContent = `${Math.ceil(h.hp)}`;
      if (enText.current) enText.current.textContent = `${Math.floor(h.energy)}`;
      if (level.current) level.current.textContent = `${h.level}`;
      if (timer.current) timer.current.textContent = formatTime(h.runTime);
      if (root.current) {
        root.current.dataset.low = h.lowHp ? 'true' : 'false';
        root.current.dataset.locked = h.energyLocked ? 'true' : 'false';
      }
    };
    update();
    const id = window.setInterval(update, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  return (
    <div ref={root} data-low="false" data-locked="false" className="group pointer-events-none fixed inset-0 z-30 font-hud select-none">
      <div className="absolute top-4 left-5 flex items-baseline gap-2 text-mist">
        <span className="text-sm">Level</span>
        <span ref={level} className="font-display text-2xl font-semibold text-core tabular-nums">
          1
        </span>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <span ref={timer} className="font-display text-xl font-light tracking-[0.12em] text-core/90 tabular-nums">
          0:00
        </span>
      </div>

      <div className="absolute bottom-6 left-6 flex w-[min(360px,40vw)] flex-col gap-3">
        <div>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="text-mist">Form</span>
            <span ref={hpText} className="text-core tabular-nums group-data-[low=true]:text-ember">
              0
            </span>
          </div>
          <div className="h-2 overflow-hidden bg-core/10">
            <div
              ref={hpFill}
              className="h-full origin-left bg-unbound shadow-[0_0_12px_rgba(92,242,255,0.7)] transition-transform duration-75 group-data-[low=true]:bg-ember group-data-[low=true]:shadow-[0_0_12px_rgba(255,90,46,0.8)]"
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="text-mist group-data-[locked=true]:text-warn">Energy</span>
            <span ref={enText} className="text-core tabular-nums">
              0
            </span>
          </div>
          <div className="h-1.5 overflow-hidden bg-core/10">
            <div
              ref={enFill}
              className="h-full origin-left bg-core transition-transform duration-75 group-data-[locked=true]:bg-warn/70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
