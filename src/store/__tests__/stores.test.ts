import { describe, expect, it } from 'vitest';
import { safeStorage } from '../safeStorage';
import { useGameStore } from '../useGameStore';
import { useSettingsStore } from '../useSettingsStore';

describe('safeStorage', () => {
  it('returns null and does not throw without window/localStorage', () => {
    expect(() => safeStorage.setItem('k', 'v')).not.toThrow();
    expect(safeStorage.getItem('k')).toBeNull();
    expect(() => safeStorage.removeItem('k')).not.toThrow();
  });
});

describe('useGameStore', () => {
  it('toggles pause only between playing and paused', () => {
    const s = useGameStore.getState();
    s.setPhase('menu');
    s.togglePause();
    expect(useGameStore.getState().phase).toBe('menu');
    s.beginRun();
    expect(useGameStore.getState().phase).toBe('playing');
    s.togglePause();
    expect(useGameStore.getState().phase).toBe('paused');
    s.togglePause();
    expect(useGameStore.getState().phase).toBe('playing');
  });
});

describe('useSettingsStore', () => {
  it('clamps volumes and toggles debug', () => {
    const s = useSettingsStore.getState();
    s.setVolume('music', 2);
    expect(useSettingsStore.getState().volumes.music).toBe(1);
    const before = useSettingsStore.getState().showDebug;
    s.toggleDebug();
    expect(useSettingsStore.getState().showDebug).toBe(!before);
  });
});
