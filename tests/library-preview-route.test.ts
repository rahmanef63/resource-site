// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("library public preview route", () => {
  it("hosts canonical preview.tsx instead of duplicating library seed/filter logic", () => {
    const source = readFileSync("app/preview/slices/library/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/library/preview"');
    expect(source).toContain("preview.LibraryIndex");
    expect(source).not.toContain("LibraryRow[]");
    expect(source).not.toContain("filterLibraryItems");
  });
});
