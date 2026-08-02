// Shell barrel — responsive SSOT, DRY responsive primitives, the manifest-driven
// shell provider + feature/slot/brand/capabilities/chrome-kit registries, the
// pluggable multi-shell seam, runtime url-sync, and the bundled shell features +
// DEFAULT_FEATURES set. Re-exported by ./index.

// ── Responsive: the single source of truth (provider + hook + container) ─────
export { ResponsiveProvider } from "./responsive/responsive-provider";
export { ResponsiveContext, useResponsive } from "./responsive/use-responsive";
export type {
  Responsive,
  FormFactor,
  DeviceMode,
  Pane,
  SafeArea,
} from "./responsive/use-responsive";
export { useContainer } from "./responsive/use-container";
export { useIsMobile } from "./responsive/use-is-mobile";

// ── DRY responsive primitives (compose these instead of per-app media queries) ─
export { AppFrame } from "./primitives/app-frame";
export { MasterDetail } from "./primitives/master-detail";
export { ResponsiveToolbar } from "./primitives/responsive-toolbar";
export type { ToolbarItem } from "./primitives/responsive-toolbar";
export { TouchList, TouchRow } from "./primitives/touch-list";

// ── Manifest-driven shell: the wrapper provider + feature/slot/brand registry ─
export { AppShell } from "./provider/app-shell";
export { defineFeature } from "./registry/types";
export type {
  ShellManifest,
  FeatureDescriptor,
  SlotRegion,
  Brand,
} from "./registry/types";
// Shell registry — the pluggable multi-shell seam (macOS / Windows / Dashboard …).
// Per-surface preference: the user picks a desktop shell AND a mobile shell; the
// active one is resolved by form factor.
export {
  registerShell,
  getShell,
  shellList,
  shellsForSurface,
  resolveShell,
  surfaceOf,
  setShell,
  useShellPrefs,
} from "./registry/shells";
export type { ShellId, ShellSurface, ShellDescriptor, ShellPrefs } from "./registry/shells";
// Chrome Kit — Phase-A foundation of the cloneable-shell architecture
// (docs/SHELL-CLONING-ARCHITECTURE.md §3): per-OS layout/insets/skin packs that
// decorate a registered shell 1:1. Data + registry only — not yet read by the
// live render path.
export {
  registerChromeKit,
  getChromeKit,
  chromeKitList,
  tokenPackToVars,
  registerBuiltinChromeKits,
  BUILTIN_CHROME_KITS,
} from "./registry/chrome-kit";
export type {
  ChromeKit,
  ChromeLayout,
  ChromeInsets,
  TokenPack,
  MotionProfile,
  GestureProfile,
} from "./registry/chrome-kit";
export {
  FeatureRegistryProvider,
  useFeatures,
  Slot,
} from "./registry/feature-registry";
export { BrandProvider, useBrand } from "./registry/brand";
export { ShellUIProvider, useShellUI } from "./registry/shell-ui";
export type { ShellUI } from "./registry/shell-ui";
export { ShellConfigProvider, useShellConfig } from "./registry/shell-config";
export type { ShellConfig } from "./registry/shell-config";
export { UrlSync } from "./runtime/use-url-sync";
export {
  CapabilitiesProvider,
  useShellAppearance,
  useCpuPercent,
  useShellSearch,
  useSystemStats,
  useShellChat,
  useServerToggle,
} from "./registry/capabilities";
export type {
  ShellCapabilities,
  ShellAppearance,
  ThemeMode,
  SearchHit,
  SystemStats,
  ChatMessage,
  ServerToggle,
} from "./registry/capabilities";

// ── Bundled shell features ───────────────────────────────────────────────────
// Each is a defineFeature() contribution mounted via `manifest.features`. They
// live inside this slice (appshell/features/*) so the whole shell installs as
// one unit. Re-exported LAST so the core bindings they read are already live.
export { searchFeature } from "./features/search";
export { quickLookFeature } from "./features/quick-look";
export { clipboardFeature } from "./features/clipboard";
export { shareFeature } from "./features/share";
export { shortcutHelpFeature } from "./features/shortcut-help";
export { lockScreenFeature } from "./features/lock-screen";
export { inspectorFeature } from "./features/inspector";
export { notificationsFeature } from "./features/notifications";
export { controlCenterFeature } from "./features/control-center";

// The default system-feature set — generic, brand-free, app-agnostic. Drop all
// five into any consumer's manifest in one line (`features: DEFAULT_FEATURES`).
// Spread + override/trim per project; each entry is independently removable since
// the surfaces are slot-driven (a feature absent from the array just doesn't mount).
export { DEFAULT_FEATURES } from "./default-features";
