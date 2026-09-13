// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/library-svelte");
const sharedFiles = [
  "frontend/slices/library/lib/types.ts",
  "frontend/slices/library/lib/defaults.ts",
  "frontend/slices/library/lib/core.ts",
  "frontend/slices/library/lib/tools.ts",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("library Svelte distribution", () => {
  it("keeps native Svelte + portable shared files free of React/Next/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), ...sharedFiles]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("@/components/ui/");
    expect(source).not.toContain("$effect(");
  });

  it("preserves filter, payload, clipboard, upvote, captions, attribution, and route semantics", () => {
    const index = readFileSync(path.join(svelteRoot, "views/LibraryIndex.svelte"), "utf8");
    const detail = readFileSync(path.join(svelteRoot, "views/LibraryDetail.svelte"), "utf8");
    const payload = readFileSync(path.join(svelteRoot, "components/PayloadRender.svelte"), "utf8");
    const copy = readFileSync(path.join(svelteRoot, "components/CopyButton.svelte"), "utf8");
    const vote = readFileSync(path.join(svelteRoot, "components/UpvotePanel.svelte"), "utf8");
    expect(index).toContain("collectLibraryTools");
    expect(index).toContain("filterLibraryItems");
    expect(index).toContain('href={`/library/${item.slug}`}');
    expect(detail).toContain("PayloadRender");
    expect(detail).toContain("item.sourceUrl");
    expect(payload).toContain("libraryVideoSource");
    expect(payload).toContain('track kind="captions"');
    expect(copy).toContain("navigator.clipboard.writeText");
    expect(vote).toContain("optimisticVote");
  });

  it("shares one portable frontend core and the same Convex library backend", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/library/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual(sharedFiles);
    expect(slice.convex.rootPaths).toEqual(["convex/features/library"]);
    expect(slice.deps.peers.map((peer: { slug: string }) => peer.slug)).toContain("seo");
    expect(readFileSync("convex/features/library/_schema.ts", "utf8")).toContain("videoCaptionsUrl");
  });
});
