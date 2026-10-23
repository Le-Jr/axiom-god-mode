import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RunStats } from '@/game/core/events';
import { safeStorage } from './safeStorage';

export interface Records {
  bestTime: number;
  bestLevel: number;
  bestErasures: number;
  bestCycle: number;
  runs: number;
}

/** Which records the last submitted run beat. */
export interface NewBests {
  time: boolean;
  level: boolean;
  erasures: boolean;
}

interface RecordsState extends Records {
  lastNewBests: NewBests;
  submitRun: (stats: RunStats) => NewBests;
}

// Local-only records (GDD §6, ADR-012): no meta-progression, no server.
export const useRecordsStore = create<RecordsState>()(
  persist(
    (set, get) => ({
      bestTime: 0,
      bestLevel: 0,
      bestErasures: 0,
      bestCycle: 0,
      runs: 0,
      lastNewBests: { time: false, level: false, erasures: false },
      submitRun: (s) => {
        const r = get();
        const nb: NewBests = {
          time: s.timeSurvived > r.bestTime,
          level: s.level > r.bestLevel,
          erasures: s.erasures > r.bestErasures,
        };
        set({
          bestTime: Math.max(r.bestTime, s.timeSurvived),
          bestLevel: Math.max(r.bestLevel, s.level),
          bestErasures: Math.max(r.bestErasures, s.erasures),
          bestCycle: Math.max(r.bestCycle, s.cycle),
          runs: r.runs + 1,
          lastNewBests: nb,
        });
        return nb;
      },
    }),
    {
      name: 'axiom-records',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ bestTime, bestLevel, bestErasures, bestCycle, runs }) => ({ bestTime, bestLevel, bestErasures, bestCycle, runs }),
    },
  ),
);
