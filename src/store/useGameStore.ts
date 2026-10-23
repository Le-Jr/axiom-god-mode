import { create } from 'zustand';

// Low-frequency game state only (see ARCHITECTURE §7). Per-frame values live in hudBridge.
export type GamePhase = 'menu' | 'cutscene' | 'playing' | 'paused' | 'levelUp' | 'gameOver';

interface GameState {
  phase: GamePhase;
  runId: number;
  setPhase: (phase: GamePhase) => void;
  togglePause: () => void;
  beginRun: () => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'menu',
  runId: 0,
  setPhase: (phase) => set({ phase }),
  togglePause: () => {
    const { phase } = get();
    if (phase === 'playing') set({ phase: 'paused' });
    else if (phase === 'paused') set({ phase: 'playing' });
  },
  beginRun: () => set((s) => ({ phase: 'playing', runId: s.runId + 1 })),
}));
