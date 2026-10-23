import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { QualityLevel } from '@/game/config';
import { safeStorage } from './safeStorage';

export interface Volumes {
  master: number;
  music: number;
  sfx: number;
  ui: number;
}

export type ReducedMotion = 'system' | 'on' | 'off';

interface SettingsState {
  volumes: Volumes;
  quality: QualityLevel;
  reducedMotion: ReducedMotion;
  showDebug: boolean;
  seenIntro: boolean;
  setVolume: (channel: keyof Volumes, value: number) => void;
  setQuality: (quality: QualityLevel) => void;
  setReducedMotion: (value: ReducedMotion) => void;
  toggleDebug: () => void;
  markIntroSeen: () => void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      volumes: { master: 0.8, music: 0.7, sfx: 0.8, ui: 0.6 },
      quality: 'medium',
      reducedMotion: 'system',
      showDebug: false,
      seenIntro: false,
      setVolume: (channel, value) => set((s) => ({ volumes: { ...s.volumes, [channel]: clamp01(value) } })),
      setQuality: (quality) => set({ quality }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      toggleDebug: () => set((s) => ({ showDebug: !s.showDebug })),
      markIntroSeen: () => set({ seenIntro: true }),
    }),
    {
      name: 'axiom-settings',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ volumes, quality, reducedMotion, showDebug, seenIntro }) => ({
        volumes,
        quality,
        reducedMotion,
        showDebug,
        seenIntro,
      }),
    },
  ),
);
