/**
 * theme-presets — unified theme preset switcher.
 *
 * One slice ships one switcher (ThemePresetSwitcher) backed by a
 * provider context (ThemePresetProvider). Tweakcn registry bundled
 * inside the slice as JSON, loaded lazily via dynamic import — no
 * consumer public/ setup required.
 *
 * CK-1F (2026-05-23) — merges prior split: TweakcnSwitcher + ThemePicker
 * + phantom `theme-preset-switcher` catalog entry → single
 * ThemePresetSwitcher in this slice.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "theme-presets",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["ThemePresetSwitcher", "ThemePresetProvider", "ThemeColorSync"],
    utils: [
      "applyTweakcnPreset", "bootTweakcnPreset", "clearTweakcnPreset",
      "previewTweakcnPreset", "restoreTweakcnPreset", "getSavedTweakcnPreset",
      "loadTweakcnRegistry", "findTweakcnPreset", "tweakcnSwatches",
      "groupTweakcnPresets",
    ],
    hooks: ["useThemePreset"],
    types: [
      "TweakcnPresetItem", "TweakcnRegistry",
      "TweakcnPresetMeta", "TweakcnPresetGroup",
    ],
  },
  requires: {
    npm: ["next-themes"],
    shadcn: ["button", "popover"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
