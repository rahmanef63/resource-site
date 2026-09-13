import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/comments/page.tsx";

describe("comments public preview route", () => {
  it("hosts the canonical preview module instead of duplicating comment seed data", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/comments/preview"');
    expect(source).toContain("preview.CommentsThread");
    expect(source).not.toContain("const COMMENTS =");
    expect(source).not.toContain("CornerDownRight");
  });
});
