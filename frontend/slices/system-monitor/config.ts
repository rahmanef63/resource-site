// Slice config (rr: frontend.configExport = "systemMonitorConfig").
export type SystemMonitorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const systemMonitorConfig: SystemMonitorConfig = {
  slug: "system-monitor",
  title: "System Monitor — host telemetry dashboard",
  category: "os",
};

export default systemMonitorConfig;
