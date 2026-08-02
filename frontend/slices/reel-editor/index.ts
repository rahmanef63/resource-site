import { Clapperboard } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <ReelEditor /> — mount the editor directly (standalone page/route).
//   2. `reelEditorApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as ReelEditor } from "./app";

export const reelEditorApp: AppDescriptor = {
  id: "reel-editor",
  title: "Video Editor",
  icon: Clapperboard,
  gradient: "linear-gradient(160deg,#7a5cff,#5b2fe0)",
  load: () => import("./app"),
  defaultSize: { w: 920, h: 600 },
};

// Host wiring seams (fs backend for the quick-import pane / VPS browser).
export { configureReelFs } from "./lib/host";
export type { ReelFsAdapter, FsEntry, FsList, AppDescriptor } from "./lib/host";

export { reelEditorConfig } from "./config";
export type { ReelEditorConfig } from "./config";

// Agentic tool collection — the slice is not an agent; register this
// with a host agent (one agent, many slices) via @/shared/agentic.
export { reelEditorTools } from "./lib/tools";
export type { ReelCtx } from "./lib/tools";
