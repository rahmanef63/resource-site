export { default as SystemMonitor } from "./components/SystemMonitor.svelte";
export { default as CircularGauge } from "./components/CircularGauge.svelte";
export { default as GaugeGrid } from "./components/GaugeGrid.svelte";
export { default as GlassPanel } from "./components/GlassPanel.svelte";
export { default as ProcessTable } from "./components/ProcessTable.svelte";
export { default as Sparkline } from "./components/Sparkline.svelte";
export { createSvelteStatsHistoryStore, type SvelteStatsHistoryStore } from "./lib/store";
export { systemMonitorConfig, type SystemMonitorConfig } from "./config";
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
} from "../system-monitor/lib/core";
export { clampPct, fmtGiBPair, fmtMBs, fmtPct } from "../system-monitor/lib/format";
export { MONITOR_VARS, type MonitorVar } from "../system-monitor/lib/palette";
export { systemMonitorTools, type SysMonCtx } from "../system-monitor/lib/tools";
