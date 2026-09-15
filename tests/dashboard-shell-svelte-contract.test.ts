// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "frontend/slices/dashboard-shell-svelte");
const sharedFiles = [
  "frontend/slices/dashboard-shell/config.ts",
  "frontend/slices/dashboard-shell/lib/core-types.ts",
  "frontend/slices/dashboard-shell/lib/nav.ts",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : /\.(svelte|ts)$/.test(entry.name)
        ? [file]
        : [];
  });
}

describe("dashboard-shell Svelte distribution", () => {
  it("stays native Svelte + portable core without React/Next/Lucide/Vaul/shadcn leakage", () => {
    const source = [...sourceFiles(root), ...sharedFiles]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain('from "vaul"');
    expect(source).not.toContain("@/components/ui/");
    expect(source).not.toContain("$effect(");
  });

  it("preserves one-nav desktop/sidebar/dock/tile-drawer semantics with Svelte 5 patterns", () => {
    const shell = readFileSync(
      path.join(root, "components/DashboardShell.svelte"),
      "utf8",
    );
    const sidebar = readFileSync(
      path.join(root, "components/DashboardSidebar.svelte"),
      "utf8",
    );
    const dock = readFileSync(
      path.join(root, "components/MobileDock.svelte"),
      "utf8",
    );
    const drawer = readFileSync(
      path.join(root, "components/MobileMenuDrawer.svelte"),
      "utf8",
    );
    expect(shell).toContain('from "$app/state"');
    expect(shell).toContain("$derived(activePath ?? page.url.pathname)");
    expect(shell).toContain("deriveDock(nav, dockMax)");
    expect(sidebar).toContain("{#each nav as group (group.id)}");
    expect(sidebar).toContain("{#each group.items as item (item.id)}");
    expect(dock).toContain("{#each items as item (item.id)}");
    expect(drawer).toContain("$derived.by");
    expect(drawer).toContain('role="dialog"');
  });

  it("declares exactly the portable shared files used by the SvelteKit distribution", () => {
    const slice = JSON.parse(
      readFileSync("frontend/slices/dashboard-shell/slice.json", "utf8"),
    );
    expect(
      slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles,
    ).toEqual(sharedFiles);
  });
});
