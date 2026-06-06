// Slice config (rr: frontend.configExport = "systemMonitorConfig").
export type SystemMonitorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Poll interval for stats sampling (ms). */
  pollMs: number;
  /** Rolling history points for the sparklines. */
  historySpan: number;
};

export const systemMonitorConfig: SystemMonitorConfig = {
  slug: "system-monitor",
  title: "System Monitor — host telemetry dashboard",
  category: "os",
  pollMs: 1500,
  historySpan: 40,
};

export default systemMonitorConfig;
