// audit-allow-hex: the descriptor `gradient` is app-icon brand data consumed
// by appshell-style launchers — not themable UI surface.
import { Globe } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <Browser /> — mount the remote-browser chrome directly. Unwired it
//      runs an offline canvas demo renderer (tabs/omnibar/bookmarks/history
//      and the AI activity panel all work).
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

// Host wiring seams (drive a REAL headless browser: Playwright, CDP…):
// adapter, mock/live mode hook, and the MJPEG screencast stream URL.
export { configureBrowser, configureBrowserMode, configureScreencast } from "./lib/host";
export type {
  BrowserAdapter,
  BrowserMode,
  RemoteState,
  AgentLogEntry,
  AppDescriptor,
} from "./lib/host";

export { browserConfig } from "./config";
export type { BrowserConfig } from "./config";

// Agentic tool collection — the slice is not an agent; register this
// with a host agent (one agent, many slices) via @/shared/agentic.
export { browserTools } from "./lib/tools";
export type { BrowserCtx } from "./lib/tools";
