// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { Link2 } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

export { default as ResourcesAdmin } from "./app";

export const resourcesAdminApp: AppDescriptor = {
  id: "resources-launcher-admin",
  title: "Resources Admin",
  icon: Link2,
  gradient: "linear-gradient(160deg,#0ea5e9,#6366f1)",
  load: () => import("./app"),
  defaultSize: { w: 520, h: 600 },
};

export { configureResources, useResourcesApi } from "./lib/host";
export type { AppDescriptor } from "./lib/host";
export {
  RESOURCE_ICON_NAMES,
  normalizeResourceInput,
  readResourcesState,
  resourcesApi,
  sortResources,
  swapResourceOrder,
} from "./lib/core";
export type { Resource, ResourceIconName, ResourceInput, ResourcesAdapter } from "./lib/core";

export { RESOURCE_ICONS, ICON_NAMES, resolveIcon } from "./lib/icons";
export { resourcesLauncherAdminConfig } from "./config";
export type { ResourcesLauncherAdminConfig } from "./config";
