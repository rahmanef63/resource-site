export { default as ResourcesAdmin } from "./app.svelte";
export { default as ResourceEditor } from "./components/ResourceEditor.svelte";
export { resourcesLauncherAdminConfig, type ResourcesLauncherAdminConfig } from "./config";
export {
  RESOURCE_ICON_NAMES,
  configureResources,
  normalizeResourceInput,
  readResourcesState,
  resourcesApi,
  sortResources,
  swapResourceOrder,
  type Resource,
  type ResourceIconName,
  type ResourceInput,
  type ResourcesAdapter,
} from "../resources-launcher-admin/lib/core";
