// Agentic tool collection (read-only). The slice is NOT an agent — it exports
// this collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the stable telemetry api from useOsApi().

import { defineToolCollection, noArgs } from "@/shared/agentic";
import type { useOsApi } from "./host";

export type SysMonCtx = ReturnType<typeof useOsApi>;

const GiB = 1024 ** 3;
const gb = (n: number) => `${(n / GiB).toFixed(1)}GiB`;

export const systemMonitorTools = defineToolCollection<SysMonCtx>({
  namespace: "system-monitor",
  describe: (ctx) => `telemetry in ${ctx.mode} mode`,
  tools: [
    {
      name: "stats",
      description: "Read system stats: cpu, memory, disk, network, uptime.",
      parameters: noArgs,
      run: async (ctx) => {
        const s = await ctx.sys.stats();
        const net = s.net ? ` | net rx ${s.net.rx.toFixed(1)} tx ${s.net.tx.toFixed(1)} MB/s` : "";
        return (
          `cpu ${s.cpu.pct.toFixed(0)}% (${s.cpu.cores} cores) | ` +
          `mem ${gb(s.mem.used)}/${gb(s.mem.total)} | ` +
          `disk ${gb(s.disk.used)}/${gb(s.disk.total)}${net} | ` +
          `uptime ${(s.uptime / 864e5).toFixed(1)}d`
        );
      },
    },
    {
      name: "processes",
      description: "List running processes (pid, name, status, cpu %, mem MB).",
      parameters: noArgs,
      run: async (ctx) => {
        const ps = await ctx.sys.processes();
        return ps
          .map((p) => `${p.pid} ${p.name} [${p.status}] cpu=${p.cpu}% mem=${p.mem}MB`)
          .join("\n");
      },
    },
  ],
});
