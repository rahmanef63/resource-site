// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("html-studio public preview route", () => {
  it("hosts canonical preview.tsx instead of mounting the slice barrel directly", () => {
    const source = readFileSync("app/preview/slices/html-studio/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/html-studio/preview"');
    expect(source).toContain("preview.HtmlStudio");
    expect(source).not.toContain('import { HtmlStudio } from "@/features/html-studio"');
  });
});
