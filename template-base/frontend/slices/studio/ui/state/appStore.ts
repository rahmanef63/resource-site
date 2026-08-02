import { create } from 'zustand';

interface AppState {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPath: typeof window !== 'undefined' ? (window.location.pathname || '/') : '/',
  setCurrentPath: (path) => set({ currentPath: path }),
}));
