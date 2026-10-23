import { create } from 'zustand';
import type { RunStats } from '@/game/core/events';
import type { Rarity } from '@/game/upgrades/types';

// Low-frequency game state only (see ARCHITECTURE §7). Per-frame values live in hudBridge.
export type GamePhase = 'menu' | 'cutscene' | 'playing' | 'paused' | 'levelUp' | 'gameOver';

/** View data for one level-up card (resolved from the upgrade registry by the UI bridge). */
export interface UpgradeChoiceView {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  owned: number;
  maxStacks: number;
}

interface GameState {
  phase: GamePhase;
  /** Incremented to start a fresh run on the same canvas. */
  runId: number;
  level: number;
  choices: UpgradeChoiceView[];
  rerolls: number;
  lastRun: RunStats | null;
  setPhase: (phase: GamePhase) => void;
  togglePause: () => void;
  beginRun: () => void;
  restart: () => void;
  openLevelUp: (level: number, choices: UpgradeChoiceView[], rerolls: number) => void;
  closeLevelUp: () => void;
  showGameOver: (stats: RunStats) => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'menu',
  runId: 0,
  level: 1,
  choices: [],
  rerolls: 0,
  lastRun: null,
  setPhase: (phase) => set({ phase }),
  togglePause: () => {
    const { phase } = get();
    if (phase === 'playing') set({ phase: 'paused' });
    else if (phase === 'paused') set({ phase: 'playing' });
  },
  beginRun: () => set({ phase: 'playing', level: 1, choices: [], rerolls: 0, lastRun: null }),
  restart: () => set((s) => ({ runId: s.runId + 1 })),
  openLevelUp: (level, choices, rerolls) => set({ phase: 'levelUp', level, choices, rerolls }),
  closeLevelUp: () => set({ phase: 'playing', choices: [] }),
  showGameOver: (stats) => set({ phase: 'gameOver', lastRun: stats, choices: [] }),
}));
