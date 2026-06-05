// Public barrel — other slices/app layer import ONLY from here.
export { OsDesktop } from "./components/desktop";
export { AppIcon } from "./components/app-icon";
export { AppRegistryProvider, useApp, useApps } from "./lib/registry";
// Window lifecycle + the shell-UI actions feature slices drive (search,
// inspector, control-center read these instead of reaching into the store).
export {
  openWindow,
  closeWindow,
  setCloseGuard,
  focusWindow,
  minimizeWindow,
  restoreWindow,
  setLauncherOpen,
  setSpotlightOpen,
  setInspectorOpen,
  toggleSpotlight,
  toggleInspector,
  minimizeAll,
  closeAll,
} from "./lib/store";
export {
  useWindow,
  useWindowOrder,
  useFocused,
  useLauncherOpen,
  useSpotlightOpen,
  useInspectorOpen,
  useFocusedApp,
} from "./hooks/use-shell";
// Reusable app-window chrome (all regions optional) + form/preview drawer, so
// every app reads consistently: Sidebar→left Sheet, Inspector→right Sheet on
// narrow containers; <FormDrawer> = dialog on desktop ⇄ bottom drawer on mobile.
export { AppHeader, AppSidebar, AppInspector } from "./components/layout/app-chrome";
export {
  ResponsiveDialog,
  ResponsiveDialog as FormDrawer,
} from "./primitives/responsive-dialog";
export { toast, dismissToast, useToasts } from "./lib/toast";
export { setActivity, clearActivity, useActivities } from "./lib/activity";
export type { Activity } from "./lib/activity";
export {
  usePublishInspector,
  publishInspector,
  clearInspector,
  useInspectorInfo,
} from "./lib/inspector";
export type {
  InspectorInfo,
  InspectorProp,
  InspectorAction,
} from "./lib/inspector";
export type { Toast, ToastOptions, ToastTone } from "./lib/toast";
export type { AppDescriptor, WindowState, WinId, AppProps } from "./lib/types";
export { appshellConfig } from "./config";
export type { AppShellConfig } from "./config";

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
import { searchFeature } from "./features/search";
import { inspectorFeature } from "./features/inspector";
import { notificationsFeature } from "./features/notifications";
import { controlCenterFeature } from "./features/control-center";
import { widgetsFeature } from "./features/widgets";

export { searchFeature } from "./features/search";
export { inspectorFeature } from "./features/inspector";
export { notificationsFeature } from "./features/notifications";
export { controlCenterFeature } from "./features/control-center";
export { widgetsFeature } from "./features/widgets";

// The default system-feature set — generic, brand-free, app-agnostic. Drop all
// five into any consumer's manifest in one line (`features: DEFAULT_FEATURES`).
// Spread + override/trim per project; each entry is independently removable since
// the surfaces are slot-driven (a feature absent from the array just doesn't mount).
export const DEFAULT_FEATURES = [
  searchFeature,
  inspectorFeature,
  notificationsFeature,
  controlCenterFeature,
  widgetsFeature,
];

// Mock capabilities pack — inject as `manifest.capabilities` to drive all five
// features with realistic data and NO backend (search/stats/chat/server toggle).
// The single switch: swap this object for your real capabilities to go live.
export { mockCapabilities } from "./lib/mock-capabilities";
