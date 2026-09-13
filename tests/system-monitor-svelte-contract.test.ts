// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/system-monitor-svelte");
const sharedFiles = [
  "frontend/slices/system-monitor/lib/core.ts",
  "frontend/slices/system-monitor/lib/format.ts",
  "frontend/slices/system-monitor/lib/palette.ts",
  "frontend/slices/system-monitor/lib/tools.ts",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("system-monitor Svelte distribution", () => {
  it("keeps native Svelte + shared runtime free of React/Next/Lucide/shadcn imports", () => {
    const source = [
      ...sourceFiles(svelteRoot),
      ...sharedFiles,
    ].map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves gauges, history sparklines, process reflow, polling, adapter mode, and tool seams", () => {
    const app = readFileSync(path.join(svelteRoot, "components/SystemMonitor.svelte"), "utf8");
    const processes = readFileSync(path.join(svelteRoot, "components/ProcessTable.svelte"), "utf8");
    const core = readFileSync("frontend/slices/system-monitor/lib/core.ts", "utf8");
    expect(app).toContain("GaugeGrid");
    expect(app).toContain("Sparkline");
    expect(app).toContain("ProcessTable");
    expect(app).toContain("history.start()");
    expect(app).toContain("api.mode");
    expect(processes).toContain("@container (max-width: 440px)");
    expect(core).toContain("SYSTEM_MONITOR_POLL_MS = 1500");
    expect(core).toContain("SYSTEM_MONITOR_HISTORY_POINTS = 40");
    expect(core).toContain("configureSysmon");
    expect(core).toContain("createMockSys");
  });

  it("shares only the portable telemetry/format/palette/tool sources", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/system-monitor/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual(sharedFiles);
  });
});
