import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("ai-core public preview route", () => {
  it("mounts the canonical preview module rather than duplicating core behavior", () => {
    const route = readFileSync("app/preview/slices/ai-core/page.tsx", "utf8");
    expect(route).toContain('from "@/features/ai-core/preview"');
    expect(route).toContain("preview.AiCorePreview");
    expect(route).not.toContain("presentError(");
    expect(route).not.toContain("showModal(");
  });
});
