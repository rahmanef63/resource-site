/**
 * Slice contract for `system-monitor` — v1.1.0.
 *
 * Host telemetry dashboard (gauges + sparklines + process table).
 * Self-contained: telemetry runs on an injectable SysMonAdapter (wavy
 * in-browser mock by default), shell services are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "system-monitor",
  version: "1.2.1",
  category: "ui",
  kind: "ui",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^19" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["scroll-area"],
    peers: [],
  },
  provides: {
    tools: [
      "system-monitor.stats",
      "system-monitor.processes"
    ] as string[],
    routes: [] as string[],
    components: ["SystemMonitor"] as string[],
    hooks: [] as string[],
    utils: ["configureSysmon", "systemMonitorApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
