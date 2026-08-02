import { SystemMonitor } from "@/features/system-monitor";

// Live preview: gauges + sparklines + process table on the wavy mock
// telemetry. Real host: configureSysmon({ mode:"live", stats, processes }).

export default function SystemMonitorPreview() {
  return (
    <div className="h-dvh w-full">
      <SystemMonitor />
    </div>
  );
}
