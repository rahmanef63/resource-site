// Core barrel — desktop/app mounting, registries, window store + hooks, widgets,
// app chrome and dialog primitives. Re-exported by ./index.
export { OsDesktop } from "./components/desktop";
export { AppIcon } from "./components/app-icon";
// Generic app mounter (lazy-loads an app by id + payload). Used by windows AND
// single-pane shells (e.g. the Dashboard shell) so apps mount identically.
export { WindowContent as AppHost } from "./components/window-content";
export { AppRegistryProvider, useApp, useApps } from "./lib/registry";
// Home-screen widget registry — apps declare `widgets` on their descriptor; this
// aggregates them for the Today page, desktop layer, and Widgets app.
export { useWidgetRegistry, useFeaturedWidgets, useOpenApp, WidgetView, defaultSizeOf } from "./registry/widgets";
export type { RegisteredWidget } from "./registry/widgets";
export type { WidgetOption, WidgetSize, WidgetRenderProps } from "./lib/widget-types";
export { WIDGET_SIZES, WIDGET_DIMS } from "./lib/widget-types";
// Window lifecycle + the shell-UI actions feature slices drive (search,
// inspector, control-center read these instead of reaching into the store).
export {
  openWindow,
  closeWindow,
  focusWindow,
  minimizeWindow,
  restoreWindow,
  setLauncherOpen,
  setSpotlightOpen,
  setInspectorOpen,
  toggleSpotlight,
  toggleInspector,
  setNotificationCenterOpen,
  toggleNotificationCenter,
  minimizeAll,
  closeAll,
  serialize,
} from "./lib/store";
export {
  useWindow,
  useWindowOrder,
  useFocused,
  useLauncherOpen,
  useSpotlightOpen,
  useInspectorOpen,
  useNotificationCenterOpen,
  useFocusedApp,
} from "./hooks/use-shell";
