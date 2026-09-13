import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/profile/page.tsx";

describe("profile public preview route", () => {
  it("hosts canonical preview.tsx instead of mounting profile variants directly", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/profile/preview"');
    expect(source).toContain("preview.Resume");
    expect(source).toContain("preview.AboutProfile");
    expect(source).not.toContain('import { Resume, AboutProfile } from "@/features/profile"');
  });
});
