// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/profile-svelte");
const sharedCore = "frontend/slices/profile/lib/core.ts";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("profile Svelte distribution", () => {
  it("keeps native Svelte + shared core free of React/Next/Lucide/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), sharedCore]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves printable resume and card/FAQ semantics over the shared configured profile", () => {
    const resume = readFileSync(path.join(svelteRoot, "variants/resume/app.svelte"), "utf8");
    const card = readFileSync(path.join(svelteRoot, "variants/card/app.svelte"), "utf8");
    const faq = readFileSync(path.join(svelteRoot, "variants/card/components/FaqList.svelte"), "utf8");
    expect(resume).toContain("readResumeProfile");
    expect(resume).toContain("window.print()");
    expect(resume).toContain("profile.experience");
    expect(resume).toContain("profile.projects");
    expect(card).toContain("readAboutProfile");
    expect(card).toContain("initials(profile.name)");
    expect(card).toContain("profile.links");
    expect(faq).toContain("aria-expanded");
  });

  it("shares exactly the framework-neutral profile core", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/profile/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([sharedCore]);
  });
});
