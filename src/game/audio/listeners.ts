import type { GameContext } from '@/game/core/GameContext';
import { Player } from '@/game/ecs/components';
import { useSettingsStore } from '@/store/useSettingsStore';
import { audio } from './AudioManager';
import type { LoopHandle } from './sfxRecipes';

/** Maps game events to sounds for one run. Returns a detach function. */
export function attachAudio(ctx: GameContext): () => void {
  const { bus, config } = ctx;
  audio.unlock();
  audio.setVolumes(useSettingsStore.getState().volumes);
  const unsubscribeSettings = useSettingsStore.subscribe((s, prev) => {
    if (s.volumes !== prev.volumes) audio.setVolumes(s.volumes);
  });

  let hum: LoopHandle | null = null;
  let beamLoop: LoopHandle | null = null;
  const humPitch = (level: number) => Math.pow(2, (level * config.audio.auraHumSemitonesPerLevel) / 12);
  const ensureHum = () => {
    if (hum || !audio.running) return;
    hum = audio.startLoop('aura_hum');
    const p = ctx.player >= 0 && ctx.world.isAlive(ctx.player) ? ctx.world.get(ctx.player, Player) : null;
    hum?.setPitch(humPitch(p?.level ?? 1));
  };

  // Browsers may keep the context suspended until a gesture on this page.
  const onGesture = () => {
    audio.unlock();
    window.setTimeout(ensureHum, 50);
  };
  window.addEventListener('pointerdown', onGesture);
  window.addEventListener('keydown', onGesture);
  ensureHum();

  const listener = () => ({ listenerX: ctx.view.targetX, listenerZ: ctx.view.targetZ });
  // Throttles for high-frequency events (ms timestamps).
  let lastFire = 0;
  let lastHit = 0;
  const FIRE_GAP_MS = 60;
  const HIT_GAP_MS = 80;

  const offs = [
    bus.on('aura:pulse', (e) => {
      ensureHum();
      hum?.setPitch(humPitch(e.level));
      audio.play('aura_pulse');
    }),
    bus.on('beam:start', () => {
      audio.play('beam_charge');
      beamLoop?.stop(0.02);
      beamLoop = audio.startLoop('beam_loop');
    }),
    bus.on('beam:stop', () => {
      beamLoop?.stop(0.08);
      beamLoop = null;
      audio.play('beam_tail');
    }),
    bus.on('beam:empty', () => audio.play('beam_empty')),
    bus.on('enemy:erased', (e) => audio.play('erase_tear', { x: e.x, z: e.z, ...listener() })),
    bus.on('enemy:killed', (e) => audio.play('explosion_s', { x: e.x, z: e.z, ...listener() })),
    bus.on('projectile:fired', (e) => {
      const now = performance.now();
      if (now - lastFire < FIRE_GAP_MS) return;
      lastFire = now;
      audio.play('fire_generic', { x: e.x, z: e.z, ...listener() });
    }),
    bus.on('player:damaged', () => {
      const now = performance.now();
      if (now - lastHit < HIT_GAP_MS) return;
      lastHit = now;
      audio.play('impact_player');
    }),
    bus.on('player:levelUp', () => audio.play('levelup_stinger')),
    bus.on('upgrade:chosen', () => audio.play('ui_select')),
    bus.on('tick:paused', () => audio.setPaused(true)),
    bus.on('tick:resumed', () => audio.setPaused(false)),
  ];

  return () => {
    for (const off of offs) off();
    unsubscribeSettings();
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
    hum?.stop(0.3);
    beamLoop?.stop(0.05);
    hum = beamLoop = null;
    audio.setPaused(false);
  };
}
