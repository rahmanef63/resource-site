import {
  createThemePresetStore,
  type ThemePresetSnapshot,
  type ThemePresetStore,
} from "../../theme-presets/lib/core";

export type SvelteThemePresetStore = {
  subscribe: (run: (snapshot: ThemePresetSnapshot) => void) => () => void;
  getSnapshot: () => ThemePresetSnapshot;
  init: () => Promise<void>;
  setPreset: (name: string | null) => void;
  setSiteDefault: (name: string | null) => void;
  setHostDefault: (name: string | null) => void;
  preview: (name: string | null) => void;
  restore: () => void;
};

export function createSvelteThemePresetStore(): SvelteThemePresetStore {
  const core: ThemePresetStore = createThemePresetStore();
  return {
    subscribe(run) {
      run(core.getSnapshot());
      return core.subscribe(() => run(core.getSnapshot()));
    },
    getSnapshot: core.getSnapshot,
    init: core.init,
    setPreset: core.setPreset,
    setSiteDefault: core.setSiteDefault,
    setHostDefault: core.setHostDefault,
    preview: core.preview,
    restore: core.restore,
  };
}

export const THEME_PRESET_CONTEXT_KEY = "rahman-resources:theme-presets";
