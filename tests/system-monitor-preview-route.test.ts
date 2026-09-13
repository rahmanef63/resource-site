import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/system-monitor/page.tsx";

describe("system-monitor public preview route", () => {
  it("hosts canonical preview.tsx with wide/compact controls", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/system-monitor/preview"');
    expect(source).toContain("preview.SystemMonitor");
    expect(source).toContain('"wide"');
    expect(source).toContain('"compact"');
    expect(source).not.toContain('import { SystemMonitor } from "@/features/system-monitor"');
  });
});
