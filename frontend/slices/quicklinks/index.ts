// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { Link2 } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <QuicklinksApp /> — mount the favicon-tile grid directly. With no
//      wiring it runs on a localStorage-backed store seeded with demo links.
//   2. `quicklinksApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as QuicklinksApp } from "./app";

export const quicklinksApp: AppDescriptor = {
  id: "quicklinks",
  title: "Quicklinks",
  icon: Link2,
  gradient: "linear-gradient(160deg,#a78bfa,#7c3aed)",
  load: () => import("./app"),
  defaultSize: { w: 520, h: 460 },
};

// Host wiring seam (store injection + helpers).
export {
  configureQuicklinks,
  createLocalStore,
  createMemoryStore,
  useQuicklinks,
  faviconUrl,
  normalizeUrl,
  titleFromUrl,
  openQuicklink,
  DEFAULT_QUICKLINKS,
} from "./lib/host";
export type { Quicklink, QuicklinksStore, AppDescriptor } from "./lib/host";

export { quicklinksConfig } from "./config";
export type { QuicklinksConfig } from "./config";
