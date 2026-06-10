// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { Activity } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <SystemMonitor /> — mount the dashboard directly. With no wiring it
//      runs on a wavy in-browser telemetry mock.
//   2. `systemMonitorApp` — appshell-style descriptor (lazy `load`) for
//      hosts that mount apps via a dock/launcher manifest.
export { default as SystemMonitor } from "./app";

export const systemMonitorApp: AppDescriptor = {
  id: "system-monitor",
  title: "System Monitor",
  icon: Activity,
  gradient: "linear-gradient(160deg,#34d058,#15a345)",
  load: () => import("./app"),
  defaultSize: { w: 440, h: 520 },
};

// Host wiring seam (real telemetry: stats + process list).
export { configureSysmon } from "./lib/host";
export type { SysMonAdapter, SysStats, Process, AppDescriptor } from "./lib/host";

export { systemMonitorConfig } from "./config";
export type { SystemMonitorConfig } from "./config";

// Agentic tool collection — the slice is not an agent; register this
// with a host agent (one agent, many slices) via @/shared/agentic.
export { systemMonitorTools } from "./lib/tools";
export type { SysMonCtx } from "./lib/tools";
