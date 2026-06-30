// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { Link2 } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//   1. <ResourcesAdmin /> — mount directly; unwired it runs on an in-memory mock
//      store so add / edit / remove / reorder are interactive with zero backend.
//   2. `resourcesAdminApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as ResourcesAdmin } from "./app";

export const resourcesAdminApp: AppDescriptor = {
  id: "resources-launcher-admin",
  title: "Resources Admin",
  icon: Link2,
  gradient: "linear-gradient(160deg,#0ea5e9,#6366f1)",
  load: () => import("./app"),
  defaultSize: { w: 520, h: 600 },
};

// Host wiring seam (real backend: list + upsert + remove + canManage).
export { configureResources } from "./lib/host";
export type {
  ResourcesAdapter,
  Resource,
  ResourceInput,
  AppDescriptor,
} from "./lib/host";

// Icon NAME → component map (shared with a public launcher that renders these).
export { RESOURCE_ICONS, ICON_NAMES, resolveIcon } from "./lib/icons";

export { resourcesLauncherAdminConfig } from "./config";
export type { ResourcesLauncherAdminConfig } from "./config";
