// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { Compass } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//   1. <StartHere /> — mount directly; unwired it reads an in-memory mock catalog
//      (a few generic apps + 3 stages) so the guided tour renders standalone.
//   2. `startHereApp` — appshell-style descriptor (lazy `load`) for hosts that
//      mount apps via a dock/launcher manifest.
export { default as StartHere } from "./app";

export const startHereApp: AppDescriptor = {
  id: "start-here",
  title: "Start Here",
  icon: Compass,
  gradient: "linear-gradient(160deg,#22d3ee,#6366f1)",
  load: () => import("./app"),
  defaultSize: { w: 720, h: 600 },
};

// Host wiring seam (inject the live app catalog + open callback + the journey).
export { configureStartHere } from "./lib/host";
export type {
  StartHereAdapter,
  StartHereApp,
  StartHereStage,
  AppDescriptor,
} from "./lib/host";

export { startHereConfig } from "./config";
export type { StartHereConfig } from "./config";
