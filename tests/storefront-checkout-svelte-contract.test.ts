import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/storefront-checkout-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("storefront-checkout Svelte distribution contract", () => {
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

  it("shares the canonical cart and tool core", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/storefront-checkout/lib/core.ts",
      "frontend/slices/storefront-checkout/lib/tools.ts",
    ]);
  });

  it("keeps quantity, subtotal, checkout seam, and server re-price warning visible", () => {
    const widget = readFileSync(`${root}/components/CartWidget.svelte`, "utf8");
    const summary = readFileSync(`${root}/components/CheckoutSummary.svelte`, "utf8");
    expect(widget).toContain("cart.setQty(item.slug, item.qty - 1)");
    expect(widget).toContain("formatIDR(cart.subtotal)");
    expect(widget).toContain("href={checkoutHref}");
    expect(summary).toContain("Total final dihitung ulang di server");
  });
});
