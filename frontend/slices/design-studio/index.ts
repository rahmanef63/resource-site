// audit-allow-hex: the descriptor `gradient` is app-icon brand data consumed
// by the host launcher, not themable chrome.
import { Image } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <MediaStudio /> — mount directly; fully offline (demo layers + bundled
//      sample images). Optional payload={{ doc }} loads an os-rr/layers@1 doc.
//   2. `mediaStudioApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as MediaStudio } from "./app";

export const mediaStudioApp: AppDescriptor = {
  id: "design-studio",
  title: "Image Editor",
  icon: Image,
  gradient: "linear-gradient(160deg,#ff9f43,#ee5253)",
  load: () => import("./app"),
  defaultSize: { w: 1180, h: 760 },
};

// Host wiring seam (fs persistence for exports + a real image library).
export { configureMediaStudio } from "./lib/host";
export type { MediaStudioHost, StudioDocSaver, AppDescriptor, AppProps } from "./lib/host";

// Document shape (round-trips through Export/Import).
export { parseDoc } from "./lib/serialize";
export type { LayerDoc, Layer } from "./lib/model";

export { designStudioConfig } from "./config";
export type { DesignStudioConfig } from "./config";
