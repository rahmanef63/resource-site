import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("content-loops public preview route", () => {
  it("mounts the canonical preview module instead of duplicating demo data", () => {
    const source = readFileSync("app/preview/slices/content-loops/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/content-loops/preview"');
    expect(source).toContain("<ContentLoopsPreview variant={{ pagination }} />");
    expect(source).not.toContain("createMockLoopSource");
    expect(source).not.toContain("CardVariant");
  });
});
