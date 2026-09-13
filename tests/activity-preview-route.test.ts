import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("activity public preview route", () => {
  it("mounts the canonical preview module instead of duplicating seed rows", () => {
    const source = readFileSync("app/preview/slices/activity/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/activity/preview"');
    expect(source).toContain("<ActivityPreview variant={{ scenario }} />");
    expect(source).not.toContain("ActivityRow[]");
    expect(source).not.toContain("Shipped variant previews");
  });
});
