// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const componentPath = "frontend/slices/publisher-clean-html-svelte/components/PublishPreview.svelte";
const indexPath = "frontend/slices/publisher-clean-html-svelte/index.ts";
const slicePath = "frontend/slices/publisher-clean-html/slice.json";

describe("publisher-clean-html Svelte distribution", () => {
  it("keeps the preview sandboxed and script-disabled", () => {
    const source = readFileSync(componentPath, "utf8");
    expect(source).toContain("$props()");
    expect(source).toContain("srcdoc={html}");
    expect(source).toContain('sandbox="allow-same-origin"');
    expect(source).not.toContain("allow-scripts");
  });

  it("re-exports the canonical core instead of forking it", () => {
    const source = readFileSync(indexPath, "utf8");
    expect(source).toContain('../publisher-clean-html/lib/publish-page');
    expect(source).toContain('../publisher-clean-html/lib/sanitize');
    expect(source).not.toContain('from "react"');
    expect(existsSync("frontend/slices/publisher-clean-html-svelte/lib")).toBe(false);
  });

  it("declares the canonical core as framework shared files", () => {
    const slice = JSON.parse(readFileSync(slicePath, "utf8"));
    const descriptor = slice.frontend.frameworks["svelte-sveltekit"];
    expect(descriptor.deps.sharedFiles).toHaveLength(16);
    expect(descriptor.deps.sharedFiles).toContain("frontend/slices/publisher-clean-html/lib/publish-page.ts");
    expect(descriptor.deps.sharedFiles).toContain("frontend/slices/publisher-clean-html/lib/sanitize/runtime.ts");
  });
});
