import { config } from '@/game/config';
import type { Volumes } from '@/store/useSettingsStore';
import type { LoopHandle } from './sfxRecipes';
import { LOOPS, SFX, type Bus, type LoopId, type SfxId } from './sfxRegistry';

export interface PlayOptions {
  /** World position for spatial sounds, relative to the listener position below. */
  x?: number;
  z?: number;
  listenerX?: number;
  listenerZ?: number;
}

const dbToGain = (db: number) => Math.pow(10, db / 20);

/**
 * Single Web Audio graph: voices → bus (sfx/music/ui) → master → limiter → destination.
 * Systems never call this directly; `listeners.ts` maps game events to sounds.
 */
export class AudioManager {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Record<Bus, GainNode> | null = null;
  private readonly voices = new Map<SfxId, number>();
  private totalVoices = 0;
  private volumes: Volumes = { master: 0.8, music: 0.7, sfx: 0.8, ui: 0.6 };
  private paused = false;

  /** Creates the context on first call; resumes it if the browser suspended it. Safe to call often. */
  unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ac) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ac = new Ctor({ latencyHint: 'interactive' });
      const limiter = ac.createDynamicsCompressor();
      limiter.threshold.value = -1;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.1;
      limiter.connect(ac.destination);
      const master = ac.createGain();
      master.connect(limiter);
      const mk = () => {
        const g = ac.createGain();
        g.connect(master);
        return g;
      };
      this.ac = ac;
      this.master = master;
      this.buses = { sfx: mk(), music: mk(), ui: mk() };
      this.applyVolumes(0);
    }
    if (this.ac.state === 'suspended') this.ac.resume().catch(() => {});
  }

  get running(): boolean {
    return this.ac?.state === 'running';
  }

  setVolumes(v: Volumes): void {
    this.volumes = v;
    this.applyVolumes(0.05);
  }

  /** Pause: duck sfx and music (UI stays audible). */
  setPaused(paused: boolean): void {
    this.paused = paused;
    this.applyVolumes(config.audio.pauseFade);
  }

  private applyVolumes(ramp: number): void {
    const ac = this.ac;
    if (!ac || !this.master || !this.buses) return;
    const t = ac.currentTime;
    const set = (g: GainNode, v: number) => {
      if (ramp <= 0) g.gain.setValueAtTime(v, t);
      else g.gain.setTargetAtTime(v, t, ramp / 3);
    };
    const duck = this.paused ? config.audio.pauseDuck : 1;
    set(this.master, this.volumes.master);
    set(this.buses.sfx, this.volumes.sfx * duck);
    set(this.buses.music, this.volumes.music * duck);
    set(this.buses.ui, this.volumes.ui);
  }

  play(id: SfxId, opts?: PlayOptions): void {
    const ac = this.ac;
    if (!ac || !this.buses || ac.state !== 'running') return;
    const def = SFX[id];
    const active = this.voices.get(id) ?? 0;
    if (active >= def.maxVoices) return;
    if (this.totalVoices >= config.audio.maxVoices && def.priority < 5) return;

    const pitch = 1 + (Math.random() * 2 - 1) * def.pitchVar;
    const gainDb = (Math.random() * 2 - 1) * def.volVar;
    const out = ac.createGain();
    out.gain.value = def.volume * dbToGain(gainDb);
    let tail: AudioNode = out;
    if (def.spatial && opts?.x !== undefined && opts.z !== undefined) {
      const panner = ac.createPanner();
      panner.panningModel = 'equalpower';
      panner.distanceModel = 'inverse';
      panner.refDistance = config.audio.spatialRefDistance;
      panner.maxDistance = config.audio.spatialMaxDistance;
      panner.positionX.value = opts.x - (opts.listenerX ?? 0);
      panner.positionY.value = 0;
      panner.positionZ.value = opts.z - (opts.listenerZ ?? 0);
      out.connect(panner);
      tail = panner;
    }
    tail.connect(this.buses[def.bus]);

    const duration = def.recipe(ac, out, ac.currentTime, pitch);
    this.voices.set(id, active + 1);
    this.totalVoices++;
    window.setTimeout(() => {
      this.voices.set(id, Math.max(0, (this.voices.get(id) ?? 1) - 1));
      this.totalVoices = Math.max(0, this.totalVoices - 1);
      tail.disconnect();
    }, (duration + 0.05) * 1000);
  }

  startLoop(id: LoopId): LoopHandle | null {
    const ac = this.ac;
    if (!ac || !this.buses) return null;
    const def = LOOPS[id];
    const out = ac.createGain();
    out.gain.value = def.volume;
    out.connect(this.buses[def.bus]);
    const handle = def.recipe(ac, out);
    return {
      setPitch: (m) => handle.setPitch(m),
      stop: (fade) => {
        handle.stop(fade);
        window.setTimeout(() => out.disconnect(), (fade + 0.1) * 1000);
      },
    };
  }
}

export const audio = new AudioManager();
