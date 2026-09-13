// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { CodeXml } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

export { default as HtmlStudio } from "./app";

export const htmlStudioApp: AppDescriptor = {
  id: "html-studio",
  title: "HTML Studio",
  icon: CodeXml,
  gradient: "linear-gradient(160deg,#a78bfa,#f472b6)",
  load: () => import("./app"),
  defaultSize: { w: 880, h: 600 },
};

export { configureHtmlStudio } from "./lib/host";
export type { AppDescriptor, AppProps } from "./lib/host";
export {
  DEVICE_NEXT,
  DEVICE_W,
  HTML_SANDBOX,
  SPLIT_MIN,
  STARTER,
  cx,
  htmlStudioApi,
  payloadSlug,
  shareUrl,
} from "./lib/core";
export type {
  Device,
  HtmlDoc,
  HtmlStudioAdapter,
  PageRow,
  SavedPage,
  View,
  Visibility,
} from "./lib/core";

export { htmlStudioConfig } from "./config";
export type { HtmlStudioConfig } from "./config";
