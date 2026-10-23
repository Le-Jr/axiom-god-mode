'use client';
import { useEffect, useRef } from 'react';
import { config } from '@/game/config';
import { debugBridge } from '@/game/core/debugBridge';
import { useSettingsStore } from '@/store/useSettingsStore';

const cap = config.performance;

function format(): string {
  const d = debugBridge;
  const c = d.counts;
  return [
    `fps      ${d.fps.toFixed(0).padStart(4)}   1% low ${d.fpsLow.toFixed(0)}`,
    `frame    ${d.frameMs.toFixed(2).padStart(6)} ms`,
    `sim      ${d.simMs.toFixed(2).padStart(6)} ms  x${d.substeps}`,
    `draws    ${String(d.drawCalls).padStart(4)}   tris ${(d.triangles / 1000).toFixed(1)}k`,
    `gpu mem  geo ${d.geometries}  tex ${d.textures}`,
    `entities ${c.entities}/${cap.maxEntities}`,
    `bullets  ${c.bullets}/${cap.enemyProjectiles}  dropped ${d.droppedBullets}`,
    `enemies  ${c.enemies}/${cap.enemies}  props ${c.props}`,
    `frags    ${c.fragments}/${cap.fragments}  orbs ${c.orbs}`,
    `events   ${d.listeners} listeners`,
  ].join('\n');
}

/** F3 toggles. Text is written straight to the DOM on an interval: zero React renders while open. */
export function DebugOverlay() {
  const visible = useSettingsStore((s) => s.showDebug);
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'F3') return;
      e.preventDefault();
      useSettingsStore.getState().toggleDebug();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const write = () => {
      if (pre.current) pre.current.textContent = format();
    };
    write();
    const id = window.setInterval(write, config.debug.overlayRefreshMs);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  return (
    <pre
      ref={pre}
      aria-label="Debug statistics"
      className="pointer-events-none fixed top-3 right-3 z-50 rounded-sm border border-unbound/20 bg-void/80 px-3 py-2 font-hud text-[11px] leading-[1.45] text-unbound/90 tabular-nums"
    />
  );
}
