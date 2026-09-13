import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/storefront-checkout/page.tsx";

describe("storefront-checkout public preview route", () => {
  it("hosts the canonical preview module instead of duplicating cart seed logic", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/storefront-checkout/preview"');
    expect(source).toContain("preview.CartWidget");
    expect(source).not.toContain("Kopi Susu Gula Aren");
    expect(source).not.toContain("useCart()");
  });
});
