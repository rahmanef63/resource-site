// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("notion-app public preview route", () => {
  it("hosts canonical preview.tsx instead of duplicating editor/demo state", () => {
    const source = readFileSync("app/preview/slices/notion-app/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/notion-app/preview"');
    expect(source).toContain("preview.PageEditor");
    expect(source).toContain('scenario: "starter"');
    expect(source).not.toContain("createDemoStore");
    expect(source).not.toContain("EditorAdapterProvider");
  });
});
