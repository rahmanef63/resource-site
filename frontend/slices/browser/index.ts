import { Globe } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <Browser /> — mount the remote-browser chrome directly. Unwired it
//      runs an offline canvas demo renderer (omnibar/bookmarks/history work).
//   2. `browserApp` — appshell-style descriptor (lazy `load`) for hosts that
//      mount apps via a dock/launcher manifest.
export { default as Browser } from "./app";

export const browserApp: AppDescriptor = {
  id: "browser",
  title: "Browser",
  icon: Globe,
  gradient: "linear-gradient(160deg,#54a0ff,#2e86de)",
  load: () => import("./app"),
  defaultSize: { w: 900, h: 620 },
};

// Host wiring seam (drive a REAL headless browser: Playwright, CDP…).
export { configureBrowser } from "./lib/host";
export type { BrowserAdapter, RemoteState, AppDescriptor } from "./lib/host";

export { browserConfig } from "./config";
export type { BrowserConfig } from "./config";
