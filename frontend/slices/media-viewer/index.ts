import { Eye } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <MediaViewer payload={{ path, name, kind }} /> — mount directly; omit
//      the payload to get the offline sample gallery.
//   2. `mediaViewerApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as MediaViewer } from "./app";

export const mediaViewerApp: AppDescriptor = {
  id: "media-viewer",
  title: "Preview",
  icon: Eye,
  gradient: "linear-gradient(160deg,#1dd1a1,#10ac84)",
  load: () => import("./app"),
  defaultSize: { w: 720, h: 540 },
  noDock: true,
};

// Host wiring seams (editor handoff + remote media URL resolution).
export { configureMediaOpener, configureMediaSource } from "./lib/host";
export type { MediaOpener, MediaSource, AppDescriptor, AppProps } from "./lib/host";
export type { RemoteFile, MediaKind } from "./components/remote-view";

export { mediaViewerConfig } from "./config";
export type { MediaViewerConfig } from "./config";
