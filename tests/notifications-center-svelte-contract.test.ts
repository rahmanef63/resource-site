import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/notifications-center-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("notifications-center Svelte distribution contract", () => {
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

  it("shares the canonical adapter/state/time/tool core", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/notifications-center/lib/types.ts",
      "frontend/slices/notifications-center/lib/adapter.ts",
      "frontend/slices/notifications-center/lib/relativeTime.ts",
      "frontend/slices/notifications-center/lib/state.ts",
      "frontend/slices/notifications-center/lib/tools.ts",
    ]);
  });

  it("keeps surface/filter/action semantics in native components", () => {
    const bell = readFileSync(`${root}/components/NotificationBell.svelte`, "utf8");
    const list = readFileSync(`${root}/components/NotificationList.svelte`, "utf8");
    expect(bell).toContain('surface = "popover"');
    expect(bell).toContain('surface === "popover"');
    expect(list).toContain("filterNotifications(notifications, tab)");
    expect(list).toContain("onMarkAllRead?.()");
    expect(list).toContain("onClear?.()");
  });
});
