// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = readFileSync(
  "app/preview/slices/publisher-clean-html/page.tsx",
  "utf8",
);

describe("publisher clean HTML public preview route", () => {
  it("reuses the canonical preview module instead of duplicating its demo tree", () => {
    expect(route).toContain('from "@/features/publisher-clean-html/preview"');
    expect(route).toContain("preview.PublishPreview");
    expect(route).toContain("variant={{ cssEmission }}");
    expect(route).not.toContain("createModuleRegistry");
    expect(route).not.toContain("NodeTree");
  });
});
