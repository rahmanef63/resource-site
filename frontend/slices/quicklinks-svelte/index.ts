export { default as QuicklinksApp } from "./components/QuicklinksApp.svelte";
export { quicklinksConfig } from "./config";
export type { QuicklinksConfig } from "./config";
export {
  quicklinksStore,
  addQuicklink,
  removeQuicklink,
  currentQuicklinksStore,
} from "./lib/store";
export {
  configureQuicklinks,
  createLocalStore,
  createMemoryStore,
  getQuicklinksStore,
  faviconUrl,
  normalizeUrl,
  titleFromUrl,
  openQuicklink,
  DEFAULT_QUICKLINKS,
} from "../quicklinks/lib/core";
export type { Quicklink, QuicklinksStore } from "../quicklinks/lib/core";
