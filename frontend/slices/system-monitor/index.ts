// audit-allow-hex: dock-icon gradient is the React/appshell descriptor's brand mark.
import { Activity } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

export { default as SystemMonitor } from "./app";

/** React/appshell-only descriptor. Svelte consumers mount SystemMonitor directly. */
export const systemMonitorApp: AppDescriptor = {
  id: "system-monitor",
  title: "System Monitor",
  icon: Activity,
  gradient: "linear-gradient(160deg,#34d058,#15a345)",
  load: () => import("./app"),
  defaultSize: { w: 440, h: 520 },
};

export {
  configureSysmon,
  createMockSys,
  createStatsHistoryStore,
  getSysmonApi,
  SYSTEM_MONITOR_HISTORY_POINTS,
  SYSTEM_MONITOR_POLL_MS,
  type Process,
  type StatsHistorySnapshot,
  type StatsHistoryStore,
  type SysMonAdapter,
  type SysMonApi,
  type SysStats,
} from "./lib/core";
export type { AppDescriptor } from "./lib/host";
export { clampPct, fmtGiBPair, fmtMBs, fmtPct } from "./lib/format";
export { MONITOR_VARS, type MonitorVar } from "./lib/palette";
export { systemMonitorConfig, type SystemMonitorConfig } from "./config";
export { systemMonitorTools, type SysMonCtx } from "./lib/tools";
