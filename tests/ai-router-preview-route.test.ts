// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("ai-router public preview route", () => {
  it("hosts canonical preview.tsx instead of duplicating fake provider flow", () => {
    const route = readFileSync("app/preview/slices/ai-router/page.tsx", "utf8");
    const preview = readFileSync("frontend/slices/ai-router/preview.tsx", "utf8");
    expect(route).toContain('import preview from "@/features/ai-router/preview"');
    expect(route).toContain("preview.ChatFab");
    expect(route).not.toContain("setTimeout");
    expect(route).not.toContain("PRESETS");
    expect(preview).toContain("It never calls OpenRouter");
    expect(preview).toContain("route={previewRoute}");
  });
});
