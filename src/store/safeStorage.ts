import type { StateStorage } from 'zustand/middleware';

// Every localStorage access is wrapped: private mode, quota and SSR all degrade to "no persistence".
export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(name, value);
    } catch {
      // ignore: settings just won't persist
    }
  },
  removeItem(name) {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};
