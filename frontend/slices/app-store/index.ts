import { Store, Wand2 } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two surfaces in one slice:
//   <AppStore />  — catalog grid (install/uninstall, featured, categories,
//                   built-in app/feature toggles)
//   <CreateApp /> — build a custom app (name/glyph/accent/runtime/entry) that
//                   lands in the same registry
// Plus appshell-style descriptors (lazy `load`) for windowed hosts.
export { default as AppStore } from "./app";
export { default as CreateApp } from "./components/create-app";

export const appStoreApp: AppDescriptor = {
  id: "app-store",
  title: "App Store",
  icon: Store,
  gradient: "linear-gradient(160deg,#9b5cff,#5b2fe0)",
  load: () => import("./app"),
  defaultSize: { w: 820, h: 600 },
};

export const createAppApp: AppDescriptor = {
  id: "create-app",
  title: "Create App",
  icon: Wand2,
  gradient: "linear-gradient(160deg,#22d3ee,#0891b2)",
  load: () => import("./components/create-app"),
  defaultSize: { w: 520, h: 560 },
};

// The dynamic half of a host's registry — installed/created apps as
// descriptors (RuntimeApp mounts: html → sandboxed iframe, command → console).
export { useInstalledApps } from "./lib/use-installed-apps";
export { useApps, setInstalled, createApp, type AppRow } from "./lib/apps-store";
// Owner's disabled built-ins/features; hosts filter their manifest by it.
export { useDisabledIds } from "./lib/enabled-store";

// Host wiring seam (one-shot exec behind the command-app console).
export { configureAppStoreExec } from "./lib/host";
export type { AppStoreExec, ExecResult, AppDescriptor, AppProps } from "./lib/host";

export { appStoreConfig } from "./config";
export type { AppStoreConfig } from "./config";
