/** theme-presets — bundled tweakcn color preset engine + framework adapters. */

export {
  ThemePresetProvider,
  useThemePreset,
  DEFAULT_PRESET_NAME,
  type ThemePresetContextValue,
} from "./components/ThemePresetProvider";
export { ThemePresetSwitcher } from "./components/ThemePresetSwitcher";
export { SaveSiteDefaultButton } from "./components/SaveSiteDefaultButton";
export { ThemeColorSync } from "./components/ThemeColorSync";
export { ThemeProviders } from "./components/ThemeProviders";
export {
  createThemePresetStore,
  type ThemePresetEngine,
  type ThemePresetSnapshot,
  type ThemePresetStore,
} from "./lib/core";
export {
  applyTweakcnPreset,
  bootTweakcnPreset,
  clearTweakcnPreset,
  findTweakcnPreset,
  getSavedTweakcnPreset,
  groupTweakcnPresets,
  HIDDEN_PRESETS,
  loadTweakcnRegistry,
  previewTweakcnPreset,
  restoreTweakcnPreset,
  tweakcnSwatches,
  TWEAKCN_PRESET_GROUPS,
} from "./lib/tweakcn";
export type {
  TweakcnPresetGroup,
  TweakcnPresetItem,
  TweakcnPresetMeta,
  TweakcnRegistry,
} from "./lib/tweakcn";
export { themePresetsTools, type ThemePresetsCtx } from "./lib/tools";
