import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/comments-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("comments Svelte distribution contract", () => {
  it("stays renderless/native without React/Next/Lucide/shadcn leakage", () => {
    const source = sourceFiles(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("shares the canonical target/thread/state/tool core", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/comments/types/index.ts",
      "frontend/slices/comments/lib/buildThread.ts",
      "frontend/slices/comments/lib/state.ts",
      "frontend/slices/comments/lib/tools.ts",
    ]);
  });

  it("keeps renderless thread and anchor semantics in Svelte snippets", () => {
    const thread = readFileSync(`${root}/components/CommentsThread.svelte`, "utf8");
    const anchor = readFileSync(`${root}/components/CommentsAnchor.svelte`, "utf8");
    expect(thread).toContain("createCommentsState(bindings, { target, forbiddenWords })");
    expect(thread).toContain("{@render children(state)}");
    expect(anchor).toContain("openCount: comments.openCount");
    expect(anchor).toContain("href: pathMap ? pathMap(target) : null");
  });
});
