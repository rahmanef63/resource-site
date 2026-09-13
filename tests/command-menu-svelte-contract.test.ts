// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/command-menu-svelte");
const sharedFiles = [
  "frontend/slices/command-menu/lib/core.ts",
  "frontend/slices/command-menu/lib/cmdkHistory.ts",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("command-menu Svelte distribution", () => {
  it("keeps native Svelte + shared runtime free of React/Next/cmdk/Lucide/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), ...sharedFiles]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain('from "cmdk"');
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves hotkey, query, MRU, group visibility, keyboard selection, and generic search seams", () => {
    const palette = readFileSync(path.join(svelteRoot, "components/CommandPalette.svelte"), "utf8");
    const search = readFileSync(path.join(svelteRoot, "components/SearchModal.svelte"), "utf8");
    const core = readFileSync("frontend/slices/command-menu/lib/core.ts", "utf8");
    expect(palette).toContain("isCommandMenuHotkey");
    expect(palette).toContain("runCommandSelection");
    expect(palette).toContain('event.key === "ArrowDown"');
    expect(palette).toContain('event.key === "Enter"');
    expect(core).toContain("filterCommandGroups");
    expect(core).toContain("visibleCommandGroups");
    expect(search).toContain("searchView");
    expect(search).toContain("bindings.onSelectPage");
    expect(search).toContain("bindings.onSelectDatabase");
  });

  it("shares only portable core + MRU history files", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/command-menu/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual(sharedFiles);
  });
});
