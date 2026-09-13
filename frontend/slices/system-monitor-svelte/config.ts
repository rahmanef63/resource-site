export type SystemMonitorConfig = {
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
