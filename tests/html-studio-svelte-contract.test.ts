// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/html-studio-svelte");
const sharedCore = "frontend/slices/html-studio/lib/core.ts";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("html-studio Svelte distribution", () => {
  it("keeps native Svelte + shared core free of React/Next/Lucide/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), sharedCore].map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves the exact opaque-origin sandbox boundary", () => {
    const core = readFileSync(sharedCore, "utf8");
    const pane = readFileSync(path.join(svelteRoot, "components/StudioPane.svelte"), "utf8");
    expect(core).toContain('HTML_SANDBOX = "allow-scripts allow-forms allow-popups allow-presentation"');
    expect(core).not.toMatch(/HTML_SANDBOX\s*=.*allow-same-origin/);
    expect(pane).toContain("sandbox={HTML_SANDBOX}");
    expect(pane).not.toContain("allow-same-origin");
  });

  it("preserves live preview, views, devices, mock persistence, visibility and payload-open semantics", () => {
    const app = readFileSync(path.join(svelteRoot, "app.svelte"), "utf8");
    const core = readFileSync(sharedCore, "utf8");
    expect(app).toContain("setTimeout(() => (preview = source), 250)");
    expect(app).toContain('view = $state<View>("split")');
    expect(app).toContain('device = $state<Device>("full")');
    expect(app).toContain("htmlStudioApi.save");
    expect(app).toContain("htmlStudioApi.load");
    expect(app).toContain("htmlStudioApi.remove");
    expect(app).toContain("payloadSlug(payload)");
    expect(core).toContain("createMockStudio");
    expect(core).toContain('type Visibility = "public" | "private"');
  });

  it("shares exactly the portable html studio core", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/html-studio/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([sharedCore]);
  });
});
