import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/command-menu/page.tsx";

describe("command-menu public preview route", () => {
  it("hosts canonical preview.tsx instead of duplicating the command model/filtering UI", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/command-menu/preview"');
    expect(source).toContain("preview.CommandPalette");
    expect(source).toContain('"all"');
    expect(source).toContain('"commands"');
    expect(source).not.toContain("const COMMANDS");
    expect(source).not.toContain("interface Cmd");
  });
});
