import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/activity-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("activity Svelte distribution contract", () => {
  it("stays native Svelte without React/Next/Lucide/shadcn leakage", () => {
    const source = sourceFiles(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("shares the canonical activity presentation/tool core", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/activity/config.ts",
      "frontend/slices/activity/lib/types.ts",
      "frontend/slices/activity/lib/format.ts",
      "frontend/slices/activity/lib/grouping.ts",
      "frontend/slices/activity/lib/defaults.ts",
      "frontend/slices/activity/lib/stats.ts",
      "frontend/slices/activity/lib/tools.ts",
    ]);
  });

  it("preserves safe external-link and canonical grouping/stats helpers", () => {
    const item = readFileSync(`${root}/components/ActivityItem.svelte`, "utf8");
    const feed = readFileSync(`${root}/components/ActivityFeed.svelte`, "utf8");
    const stats = readFileSync(`${root}/components/StatsPanel.svelte`, "utf8");
    expect(item).toContain('rel="noopener noreferrer"');
    expect(item).toContain("fmtDate(row.occurredAt, locale)");
    expect(feed).toContain("groupByWeek(rows, copy.weekLabelTemplate)");
    expect(stats).toContain("activityStatItems(stats, copy, categoryLabels)");
  });
});
