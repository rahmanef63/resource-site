import { create } from 'zustand'

interface ThemePresetState {
  presets: any[]
  currentPreset: any
  setPresets: (presets: any[]) => void
  setCurrentPreset: (preset: any) => void
}

export const useThemePresetStore = create<ThemePresetState>((set) => ({
  presets: [],
  currentPreset: null,
  setPresets: (presets) => set({ presets }),
  setCurrentPreset: (preset) => set({ currentPreset: preset }),
}))


