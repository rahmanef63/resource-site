// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { CodeXml } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <HtmlStudio /> — mount directly. Unwired it runs on an in-memory mock
//      store, so the editor + live sandboxed preview + saved list are all
//      interactive with zero backend. Pass payload={{ slug }} to open a page.
//   2. `htmlStudioApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as HtmlStudio } from "./app";

export const htmlStudioApp: AppDescriptor = {
  id: "html-studio",
  title: "HTML Studio",
  icon: CodeXml,
  gradient: "linear-gradient(160deg,#a78bfa,#f472b6)",
  load: () => import("./app"),
  defaultSize: { w: 880, h: 600 },
};

// Host wiring seam (real backend: save / load / list / remove a page).
export { configureHtmlStudio } from "./lib/host";
export type {
  HtmlStudioAdapter,
  HtmlDoc,
  SavedPage,
  PageRow,
  Visibility,
  AppDescriptor,
  AppProps,
} from "./lib/host";

export { htmlStudioConfig } from "./config";
export type { HtmlStudioConfig } from "./config";
