// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/resources-launcher-admin-svelte");
const sharedCore = "frontend/slices/resources-launcher-admin/lib/core.ts";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("resources-launcher-admin Svelte distribution", () => {
  it("keeps native Svelte + shared core free of React/Next/Lucide/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), sharedCore].map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves mock/live CRUD, management gating, icon editing, and reorder semantics", () => {
    const app = readFileSync(path.join(svelteRoot, "app.svelte"), "utf8");
    const editor = readFileSync(path.join(svelteRoot, "components/ResourceEditor.svelte"), "utf8");
    const core = readFileSync(sharedCore, "utf8");
    expect(core).toContain("configureResources");
    expect(core).toContain("readResourcesState");
    expect(core).toContain("createMockResources");
    expect(core).toContain("swapResourceOrder");
    expect(app).toContain("readResourcesState");
    expect(app).toContain("resourcesApi.remove");
    expect(editor).toContain("RESOURCE_ICON_NAMES");
    expect(editor).toContain("resourcesApi.upsert");
  });

  it("shares exactly the portable resource core", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/resources-launcher-admin/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([sharedCore]);
  });
});
